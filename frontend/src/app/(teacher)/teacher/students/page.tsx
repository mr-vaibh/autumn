"use client";

import { useState, useEffect } from "react";
import { studentsApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Activity } from "lucide-react";
import Link from "next/link";

interface Student {
  id: number;
  name: string;
  student_id: string;
  age: number;
  autism_level: string;
  is_active: boolean;
}

const levelColors: Record<string, string> = {
  Level1: "bg-neutral-100 text-neutral-800",
  Level2: "bg-yellow-100 text-yellow-700",
  Level3: "bg-red-100 text-red-700",
};

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentsApi.getAll()
      .then((res) => setStudents(res.data.results || res.data))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
        <p className="text-sm text-gray-500 mt-0.5">Students assigned to your classes</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-neutral-300 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <div key={student.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center text-xl font-bold text-neutral-800">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{student.name}</h3>
                    <p className="text-xs text-gray-400 font-mono">{student.student_id}</p>
                  </div>
                </div>
                <Badge variant={student.is_active ? "success" : "secondary"}>
                  {student.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${levelColors[student.autism_level]}`}>
                  {student.autism_level}
                </span>
                <span className="text-xs text-gray-500">{student.age} years old</span>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/students/${student.id}`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full text-xs gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </Button>
                </Link>
                <Button size="sm" className="flex-1 bg-black hover:bg-neutral-800 text-white text-xs gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  Progress
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

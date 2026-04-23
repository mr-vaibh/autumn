"use client";

import { useState, useEffect } from "react";
import { classesApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Users, BookOpen } from "lucide-react";

interface Section {
  id: number;
  name: string;
  capacity: number;
  student_count: number;
  is_full: boolean;
}

interface ClassData {
  id: number;
  name: string;
  academic_year_name: string;
  teacher_name: string | null;
  description: string;
  color: string;
  is_active: boolean;
  sections: Section[];
  total_students: number;
}

const mockClasses: ClassData[] = [
  {
    id: 1, name: "Autism Level 1 - Group A", academic_year_name: "2024-25",
    teacher_name: "Priya Singh", description: "For students requiring support",
    color: "#7C3AED", is_active: true,
    sections: [{ id: 1, name: "Morning Batch", capacity: 8, student_count: 6, is_full: false }],
    total_students: 6,
  },
  {
    id: 2, name: "Autism Level 2 - Group A", academic_year_name: "2024-25",
    teacher_name: "Rahul Kumar", description: "For students requiring substantial support",
    color: "#2563EB", is_active: true,
    sections: [
      { id: 2, name: "Morning Batch", capacity: 6, student_count: 5, is_full: false },
      { id: 3, name: "Afternoon Batch", capacity: 6, student_count: 6, is_full: true },
    ],
    total_students: 11,
  },
  {
    id: 3, name: "Autism Level 3 - Group A", academic_year_name: "2024-25",
    teacher_name: "Anita Sharma", description: "For students requiring very substantial support",
    color: "#DC2626", is_active: true,
    sections: [{ id: 4, name: "Morning Batch", capacity: 4, student_count: 3, is_full: false }],
    total_students: 3,
  },
  {
    id: 4, name: "Speech Therapy", academic_year_name: "2024-25",
    teacher_name: "Priya Singh", description: "Individual speech therapy sessions",
    color: "#059669", is_active: true,
    sections: [{ id: 5, name: "Individual Sessions", capacity: 10, student_count: 8, is_full: false }],
    total_students: 8,
  },
];

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    classesApi.getAll()
      .then((res) => setClasses(res.data.results || res.data))
      .catch(() => setClasses(mockClasses))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes & Sections</h1>
          <p className="text-sm text-gray-500 mt-0.5">Academic Year 2024-25</p>
        </div>
        <Button size="sm" className="gap-2 bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4" />
          Create Class
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Color bar */}
              <div className="h-2" style={{ backgroundColor: cls.color }}></div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{cls.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{cls.description}</p>
                  </div>
                  <Badge variant={cls.is_active ? "success" : "secondary"}>
                    {cls.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{cls.total_students} students</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <span>{cls.sections.length} section{cls.sections.length !== 1 ? "s" : ""}</span>
                  </div>
                  {cls.teacher_name && (
                    <span className="text-purple-600 font-medium">{cls.teacher_name}</span>
                  )}
                </div>

                {/* Sections */}
                <div className="space-y-2">
                  {cls.sections.map((section) => (
                    <div key={section.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                      <span className="font-medium text-gray-700">{section.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{section.student_count}/{section.capacity}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${section.is_full ? "bg-red-500" : "bg-green-500"}`}
                            style={{ width: `${(section.student_count / section.capacity) * 100}%` }}
                          ></div>
                        </div>
                        {section.is_full && (
                          <Badge variant="danger" className="text-xs">Full</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="flex-1 text-xs">
                    View Sessions
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-xs">
                    Add Section
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { studentsApi } from "@/lib/api";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Edit, Download } from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface Student {
  id: number;
  name: string;
  student_id: string;
  date_of_birth: string;
  age: number;
  autism_level: string;
  is_active: boolean;
  enrollment_date: string;
  diagnosis?: string;
}

const mockStudents: Student[] = [
  { id: 1, name: "Arjun Kumar", student_id: "GALS20240001", date_of_birth: "2015-03-15", age: 9, autism_level: "Level1", is_active: true, enrollment_date: "2023-06-01", diagnosis: "ASD with ADHD" },
  { id: 2, name: "Priya Sharma", student_id: "GALS20240002", date_of_birth: "2013-07-22", age: 11, autism_level: "Level2", is_active: true, enrollment_date: "2023-04-15", diagnosis: "Autism Spectrum Disorder" },
  { id: 3, name: "Rohan Mehta", student_id: "GALS20240003", date_of_birth: "2014-11-08", age: 10, autism_level: "Level1", is_active: true, enrollment_date: "2024-01-10", diagnosis: "High-functioning ASD" },
  { id: 4, name: "Sneha Patel", student_id: "GALS20240004", date_of_birth: "2012-05-30", age: 12, autism_level: "Level3", is_active: true, enrollment_date: "2022-09-01", diagnosis: "ASD Level 3" },
  { id: 5, name: "Vikram Singh", student_id: "GALS20240005", date_of_birth: "2016-01-12", age: 8, autism_level: "Level2", is_active: true, enrollment_date: "2024-03-15", diagnosis: "ASD with speech delay" },
  { id: 6, name: "Ananya Rao", student_id: "GALS20240006", date_of_birth: "2015-08-25", age: 9, autism_level: "Level1", is_active: false, enrollment_date: "2023-01-20", diagnosis: "Asperger Syndrome" },
];

const levelColors: Record<string, "purple" | "warning" | "danger"> = {
  Level1: "purple",
  Level2: "warning",
  Level3: "danger",
};

const levelLabels: Record<string, string> = {
  Level1: "Level 1",
  Level2: "Level 2",
  Level3: "Level 3",
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentsApi.getAll()
      .then((res) => setStudents(res.data.results || res.data))
      .catch(() => {
        setStudents(mockStudents);
      })
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      key: "name",
      header: "Student",
      render: (row: Student) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-purple-700">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{row.name}</p>
            <p className="text-xs text-gray-400 font-mono">{row.student_id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "age",
      header: "Age",
      render: (row: Student) => (
        <span className="text-gray-700">{row.age} yrs</span>
      ),
    },
    {
      key: "autism_level",
      header: "Autism Level",
      render: (row: Student) => (
        <Badge variant={levelColors[row.autism_level] || "secondary"}>
          {levelLabels[row.autism_level] || row.autism_level}
        </Badge>
      ),
    },
    {
      key: "diagnosis",
      header: "Diagnosis",
      render: (row: Student) => (
        <span className="text-sm text-gray-600">{row.diagnosis || "-"}</span>
      ),
    },
    {
      key: "enrollment_date",
      header: "Enrolled",
      render: (row: Student) => (
        <span className="text-sm text-gray-600">{formatDate(row.enrollment_date)}</span>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      render: (row: Student) => (
        <Badge variant={row.is_active ? "success" : "secondary"}>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500 mt-0.5">{students.length} total students enrolled</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button size="sm" className="gap-2 bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Active", value: students.filter((s) => s.is_active).length, color: "bg-purple-50 text-purple-700" },
          { label: "Level 1", value: students.filter((s) => s.autism_level === "Level1").length, color: "bg-blue-50 text-blue-700" },
          { label: "Level 2", value: students.filter((s) => s.autism_level === "Level2").length, color: "bg-yellow-50 text-yellow-700" },
          { label: "Level 3", value: students.filter((s) => s.autism_level === "Level3").length, color: "bg-red-50 text-red-700" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl p-4 ${stat.color.split(" ")[0]} flex items-center justify-between`}>
            <span className="text-sm font-medium text-gray-600">{stat.label}</span>
            <span className={`text-2xl font-bold ${stat.color.split(" ")[1]}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <DataTable
          data={students as unknown as Record<string, unknown>[]}
          columns={columns as Parameters<typeof DataTable>[0]["columns"]}
          searchable={true}
          searchKeys={["name" as keyof Record<string, unknown>, "student_id" as keyof Record<string, unknown>]}
          isLoading={loading}
          emptyMessage="No students found"
          actions={(row) => (
            <div className="flex items-center gap-2 justify-end">
              <Link href={`/admin/students/${(row as unknown as Student).id}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Eye className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          )}
        />
      </div>
    </div>
  );
}

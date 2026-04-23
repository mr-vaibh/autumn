"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { studentsApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Edit, Phone, Calendar, FileText, Activity, Users } from "lucide-react";
import Link from "next/link";

interface Student {
  id: number;
  name: string;
  student_id: string;
  date_of_birth: string;
  age: number;
  autism_level: string;
  diagnosis: string;
  is_active: boolean;
  enrollment_date: string;
  medical_notes: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  blood_group: string;
  allergies: string;
  parents: Array<{
    id: number;
    parent_name: string;
    parent_email: string;
    parent_phone: string;
    relationship: string;
    is_primary: boolean;
  }>;
}

const mockStudent: Student = {
  id: 1,
  name: "Arjun Kumar",
  student_id: "GALS20240001",
  date_of_birth: "2015-03-15",
  age: 9,
  autism_level: "Level1",
  diagnosis: "Autism Spectrum Disorder with ADHD tendencies. Shows strong visual learning capabilities.",
  is_active: true,
  enrollment_date: "2023-06-01",
  medical_notes: "Takes Risperidone 0.5mg in the morning. Allergic to penicillin. Regular OT and speech therapy sessions recommended.",
  emergency_contact_name: "Suresh Kumar",
  emergency_contact_phone: "+91 98765 43210",
  emergency_contact_relation: "Father",
  blood_group: "O+",
  allergies: "Penicillin, certain food dyes",
  parents: [
    { id: 1, parent_name: "Suresh Kumar", parent_email: "suresh@example.com", parent_phone: "+91 98765 43210", relationship: "father", is_primary: true },
    { id: 2, parent_name: "Meena Kumar", parent_email: "meena@example.com", parent_phone: "+91 98765 43211", relationship: "mother", is_primary: false },
  ],
};

export default function StudentDetailPage() {
  const params = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentsApi.get(Number(params.id))
      .then((res) => setStudent(res.data))
      .catch(() => setStudent(mockStudent))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!student) return <div>Student not found</div>;

  const levelColors: Record<string, string> = {
    Level1: "bg-purple-100 text-purple-800",
    Level2: "bg-yellow-100 text-yellow-800",
    Level3: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/admin/students">
        <Button variant="ghost" size="sm" className="gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          Back to Students
        </Button>
      </Link>

      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center text-3xl font-bold text-purple-700">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
                <Badge variant={student.is_active ? "success" : "secondary"}>
                  {student.is_active ? "Active" : "Inactive"}
                </Badge>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${levelColors[student.autism_level]}`}>
                  {student.autism_level}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="font-mono text-purple-600 font-semibold">{student.student_id}</span>
                <span>•</span>
                <span>{student.age} years old</span>
                <span>•</span>
                <span>DOB: {formatDate(student.date_of_birth)}</span>
                <span>•</span>
                <span>Blood Group: {student.blood_group || "Not specified"}</span>
              </div>
            </div>
          </div>
          <Button size="sm" className="gap-2 bg-purple-600 hover:bg-purple-700">
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="parents">Parents</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                Diagnosis
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">{student.diagnosis || "No diagnosis information available"}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Enrollment Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Enrolled Date</span>
                  <span className="font-medium">{formatDate(student.enrollment_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Autism Level</span>
                  <span className="font-medium">{student.autism_level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium">{student.is_active ? "Active" : "Inactive"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-red-50 rounded-xl border border-red-100 p-5">
            <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Emergency Contact
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-red-500 text-xs uppercase tracking-wider mb-1">Name</p>
                <p className="font-semibold text-gray-800">{student.emergency_contact_name || "Not set"}</p>
              </div>
              <div>
                <p className="text-red-500 text-xs uppercase tracking-wider mb-1">Phone</p>
                <p className="font-semibold text-gray-800">{student.emergency_contact_phone || "Not set"}</p>
              </div>
              <div>
                <p className="text-red-500 text-xs uppercase tracking-wider mb-1">Relation</p>
                <p className="font-semibold text-gray-800 capitalize">{student.emergency_contact_relation || "Not set"}</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="medical" className="mt-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Medical Notes</h3>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-4">
                {student.medical_notes || "No medical notes available"}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Allergies</h3>
              <p className="text-sm text-gray-600 bg-yellow-50 rounded-lg p-4">
                {student.allergies || "No known allergies"}
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="parents" className="mt-4">
          <div className="space-y-3">
            {student.parents.map((parent) => (
              <div key={parent.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg">
                    {parent.parent_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{parent.parent_name}</p>
                    <p className="text-sm text-gray-500 capitalize">{parent.relationship}</p>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="text-gray-600">{parent.parent_email}</p>
                  <p className="text-gray-500">{parent.parent_phone}</p>
                </div>
                {parent.is_primary && (
                  <Badge variant="purple" className="ml-4">Primary</Badge>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="mt-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <p className="text-gray-400 text-sm text-center py-8">Session reports will appear here</p>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Documents</h3>
              <Button size="sm" className="gap-2 bg-purple-600 hover:bg-purple-700">
                <FileText className="w-4 h-4" />
                Upload Document
              </Button>
            </div>
            <p className="text-gray-400 text-sm text-center py-8">No documents uploaded yet</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

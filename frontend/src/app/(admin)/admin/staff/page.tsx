"use client";

import { useState, useEffect } from "react";
import { usersApi } from "@/lib/api";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Phone } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Staff {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  phone: string;
  designation: string;
  department: string;
  is_active: boolean;
  date_joined: string;
}

const mockStaff: Staff[] = [
  { id: 1, email: "priya.teacher@autism.school", first_name: "Priya", last_name: "Singh", full_name: "Priya Singh", role: "TEACHER", phone: "+91 98765 11001", designation: "Speech Therapist", department: "Speech Therapy", is_active: true, date_joined: "2022-04-01" },
  { id: 2, email: "rahul.therapist@autism.school", first_name: "Rahul", last_name: "Kumar", full_name: "Rahul Kumar", role: "THERAPIST", phone: "+91 98765 11002", designation: "Occupational Therapist", department: "OT", is_active: true, date_joined: "2022-07-15" },
  { id: 3, email: "anita.teacher@autism.school", first_name: "Anita", last_name: "Sharma", full_name: "Anita Sharma", role: "TEACHER", phone: "+91 98765 11003", designation: "Special Educator", department: "Special Education", is_active: true, date_joined: "2023-01-10" },
  { id: 4, email: "meena.diet@autism.school", first_name: "Meena", last_name: "Patel", full_name: "Meena Patel", role: "DIETICIAN", phone: "+91 98765 11004", designation: "Clinical Dietician", department: "Nutrition", is_active: true, date_joined: "2023-06-01" },
  { id: 5, email: "vijay.therapist@autism.school", first_name: "Vijay", last_name: "Nair", full_name: "Vijay Nair", role: "THERAPIST", phone: "+91 98765 11005", designation: "ABA Therapist", department: "Behavioral Therapy", is_active: false, date_joined: "2021-09-01" },
];

const roleColors: Record<string, "purple" | "info" | "success" | "warning"> = {
  TEACHER: "purple",
  THERAPIST: "info",
  DIETICIAN: "success",
  ADMIN: "warning",
};

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.getAll({ role: "TEACHER" })
      .then((res) => setStaff(res.data.results || res.data))
      .catch(() => setStaff(mockStaff))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      key: "full_name",
      header: "Staff Member",
      render: (row: Staff) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-700">
            {row.full_name?.charAt(0) || "?"}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{row.full_name}</p>
            <p className="text-xs text-gray-400">{row.designation}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (row: Staff) => (
        <Badge variant={roleColors[row.role] || "secondary"}>
          {row.role}
        </Badge>
      ),
    },
    {
      key: "department",
      header: "Department",
      render: (row: Staff) => <span className="text-sm text-gray-600">{row.department || "-"}</span>,
    },
    {
      key: "email",
      header: "Contact",
      render: (row: Staff) => (
        <div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Mail className="w-3 h-3" />
            {row.email}
          </div>
          {row.phone && (
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <Phone className="w-3 h-3" />
              {row.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "date_joined",
      header: "Joined",
      render: (row: Staff) => <span className="text-sm text-gray-600">{formatDate(row.date_joined)}</span>,
    },
    {
      key: "is_active",
      header: "Status",
      render: (row: Staff) => (
        <Badge variant={row.is_active ? "success" : "secondary"}>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{staff.length} staff members</p>
        </div>
        <Button size="sm" className="gap-2 bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4" />
          Add Staff
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Teachers", value: staff.filter((s) => s.role === "TEACHER").length, color: "bg-purple-50 text-purple-700" },
          { label: "Therapists", value: staff.filter((s) => s.role === "THERAPIST").length, color: "bg-blue-50 text-blue-700" },
          { label: "Dieticians", value: staff.filter((s) => s.role === "DIETICIAN").length, color: "bg-green-50 text-green-700" },
          { label: "Active Staff", value: staff.filter((s) => s.is_active).length, color: "bg-orange-50 text-orange-700" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl p-4 ${stat.color.split(" ")[0]} flex items-center justify-between`}>
            <span className="text-sm font-medium text-gray-600">{stat.label}</span>
            <span className={`text-2xl font-bold ${stat.color.split(" ")[1]}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <DataTable
          data={staff as unknown as Record<string, unknown>[]}
          columns={columns as Parameters<typeof DataTable>[0]["columns"]}
          searchable={true}
          searchKeys={["full_name" as keyof Record<string, unknown>, "email" as keyof Record<string, unknown>]}
          isLoading={loading}
          emptyMessage="No staff members found"
        />
      </div>
    </div>
  );
}

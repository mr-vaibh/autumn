"use client";

import { useState, useEffect } from "react";
import { usersApi } from "@/lib/api";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Mail, Phone, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
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

const roleColors: Record<string, "purple" | "info" | "success" | "warning"> = {
  TEACHER: "purple",
  THERAPIST: "info",
  DIETICIAN: "success",
  ADMIN: "warning",
};

const emptyForm = {
  first_name: "", last_name: "", email: "", username: "",
  role: "TEACHER", phone: "", designation: "", department: "",
  password: "", confirm_password: "",
};

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Add / Edit
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [form, setForm] = useState(emptyForm);

  // Delete
  const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStaff = () => {
    setLoading(true);
    usersApi.getAll()
      .then((res) => {
        const all = res.data.results || res.data;
        setStaff(all.filter((u: Staff) => u.role !== "ADMIN" && u.role !== "PARENT"));
      })
      .catch(() => setStaff([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openAdd = () => {
    setEditingStaff(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (s: Staff) => {
    setEditingStaff(s);
    setForm({
      first_name: s.first_name,
      last_name: s.last_name,
      email: s.email,
      username: "",
      role: s.role,
      phone: s.phone || "",
      designation: s.designation || "",
      department: s.department || "",
      password: "",
      confirm_password: "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.first_name || !form.last_name || !form.email) {
      toast.error("First name, last name and email are required");
      return;
    }
    if (!editingStaff && (!form.username || !form.password)) {
      toast.error("Username and password are required");
      return;
    }
    if (!editingStaff && form.password !== form.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      if (editingStaff) {
        const { password, confirm_password, username, ...updateData } = form;
        void password; void confirm_password; void username;
        await usersApi.update(editingStaff.id, updateData);
        toast.success("Staff member updated");
      } else {
        await usersApi.create(form);
        toast.success("Staff member added successfully");
      }
      setDialogOpen(false);
      fetchStaff();
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, string[]> } };
      const msg = e.response?.data ? Object.values(e.response.data).flat()[0] : "Failed to save staff member";
      toast.error(msg as string);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStaff) return;
    setDeleting(true);
    try {
      await usersApi.delete(deletingStaff.id);
      toast.success("Staff member removed");
      setDeletingStaff(null);
      fetchStaff();
    } catch {
      toast.error("Failed to delete staff member");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "full_name",
      header: "Staff Member",
      render: (row: Staff) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-neutral-100 rounded-full flex items-center justify-center text-sm font-bold text-neutral-700">
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
        <Badge variant={roleColors[row.role] || "secondary"}>{row.role}</Badge>
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
        <Button size="sm" className="gap-2 bg-black hover:bg-neutral-800 text-white" onClick={openAdd}>
          <Plus className="w-4 h-4" />
          Add Staff
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Teachers", value: staff.filter((s) => s.role === "TEACHER").length, color: "bg-neutral-100 text-neutral-800" },
          { label: "Therapists", value: staff.filter((s) => s.role === "THERAPIST").length, color: "bg-neutral-100 text-neutral-700" },
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
          columns={columns as unknown as Parameters<typeof DataTable>[0]["columns"]}
          searchable={true}
          searchKeys={["full_name" as keyof Record<string, unknown>, "email" as keyof Record<string, unknown>]}
          isLoading={loading}
          emptyMessage="No staff members found"
          actions={(row) => {
            const s = row as unknown as Staff;
            return (
              <div className="flex items-center gap-2 justify-end">
                <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => openEdit(s)} title="Edit">
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => setDeletingStaff(s)} title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            );
          }}
        />
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) setDialogOpen(false); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingStaff ? "Edit Staff Member" : "Add Staff Member"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input id="first_name" name="first_name" value={form.first_name} onChange={handleFormChange} placeholder="First name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input id="last_name" name="last_name" value={form.last_name} onChange={handleFormChange} placeholder="Last name" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="email@autism.school" />
            </div>
            {!editingStaff && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input id="username" name="username" value={form.username} onChange={handleFormChange} placeholder="e.g. sarthak.nehra" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input id="password" name="password" type="password" value={form.password} onChange={handleFormChange} placeholder="Password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm Password *</Label>
                    <Input id="confirm_password" name="confirm_password" type="password" value={form.confirm_password} onChange={handleFormChange} placeholder="Repeat password" />
                  </div>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role" name="role" value={form.role} onChange={handleFormChange}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="TEACHER">Teacher</option>
                <option value="THERAPIST">Therapist</option>
                <option value="DIETICIAN">Dietician</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" value={form.phone} onChange={handleFormChange} placeholder="+91 98765 00000" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input id="designation" name="designation" value={form.designation} onChange={handleFormChange} placeholder="e.g. Special Educator" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" value={form.department} onChange={handleFormChange} placeholder="e.g. Speech Therapy" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-black text-white hover:bg-neutral-800" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : editingStaff ? "Save Changes" : "Add Staff"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deletingStaff} onOpenChange={(v) => { if (!v) setDeletingStaff(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Remove Staff Member</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 mt-1">
            Remove <strong>{deletingStaff?.full_name}</strong> from the system? This cannot be undone.
          </p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeletingStaff(null)}>Cancel</Button>
            <Button disabled={deleting} onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              {deleting ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

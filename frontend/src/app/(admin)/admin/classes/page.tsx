"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api, { classesApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Users, BookOpen, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { currentAcademicYearData } from "@/lib/utils";

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

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentYearId, setCurrentYearId] = useState<number | null>(null);

  // Create / Edit Class
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);
  const [classForm, setClassForm] = useState({ name: "", description: "" });
  const [savingClass, setSavingClass] = useState(false);

  // Delete Class
  const [deletingClass, setDeletingClass] = useState<ClassData | null>(null);
  const [deletingClassBusy, setDeletingClassBusy] = useState(false);

  // Add / Edit Section
  const [sectionDialogFor, setSectionDialogFor] = useState<ClassData | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [sectionName, setSectionName] = useState("");
  const [sectionCapacity, setSectionCapacity] = useState(10);
  const [savingSection, setSavingSection] = useState(false);

  // Delete Section
  const [deletingSection, setDeletingSection] = useState<Section | null>(null);
  const [deletingSectionBusy, setDeletingSectionBusy] = useState(false);

  const fetchClasses = () => {
    classesApi.getAll()
      .then((res) => setClasses(res.data.results || res.data))
      .catch(() => setClasses([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClasses();
    classesApi.getAcademicYears()
      .then((res) => {
        const years = res.data.results || res.data;
        const current = years.find((y: { is_current: boolean; id: number }) => y.is_current) || years[0];
        if (current) setCurrentYearId(current.id);
      })
      .catch(() => {});
  }, []);

  // ── Academic year helper ───────────────────────────────────────────────────
  const ensureAcademicYear = async (): Promise<number | null> => {
    if (currentYearId) return currentYearId;
    try {
      const res = await classesApi.createAcademicYear(currentAcademicYearData());
      const id: number = res.data.id;
      setCurrentYearId(id);
      return id;
    } catch {
      toast.error("Failed to create academic year");
      return null;
    }
  };

  // ── Class CRUD ─────────────────────────────────────────────────────────────
  const openCreateClass = () => {
    setEditingClass(null);
    setClassForm({ name: "", description: "" });
    setClassDialogOpen(true);
  };

  const openEditClass = (cls: ClassData) => {
    setEditingClass(cls);
    setClassForm({ name: cls.name, description: cls.description || "" });
    setClassDialogOpen(true);
  };

  const handleSaveClass = async () => {
    if (!classForm.name.trim()) { toast.error("Class name is required"); return; }
    setSavingClass(true);
    try {
      if (editingClass) {
        await classesApi.update(editingClass.id, classForm);
        toast.success("Class updated");
      } else {
        const yearId = await ensureAcademicYear();
        if (!yearId) return;
        await classesApi.create({ ...classForm, academic_year: yearId });
        toast.success("Class created successfully");
      }
      setClassDialogOpen(false);
      setClassForm({ name: "", description: "" });
      fetchClasses();
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, string[]> } };
      const msg = e.response?.data ? Object.values(e.response.data).flat()[0] : "Failed to save class";
      toast.error(msg as string);
    } finally {
      setSavingClass(false);
    }
  };

  const handleDeleteClass = async () => {
    if (!deletingClass) return;
    setDeletingClassBusy(true);
    try {
      await classesApi.delete(deletingClass.id);
      toast.success("Class deleted");
      setDeletingClass(null);
      fetchClasses();
    } catch {
      toast.error("Failed to delete class");
    } finally {
      setDeletingClassBusy(false);
    }
  };

  // ── Section CRUD ───────────────────────────────────────────────────────────
  const openAddSection = (cls: ClassData) => {
    setSectionDialogFor(cls);
    setEditingSection(null);
    setSectionName("");
    setSectionCapacity(10);
  };

  const openEditSection = (cls: ClassData, section: Section) => {
    setSectionDialogFor(cls);
    setEditingSection(section);
    setSectionName(section.name);
    setSectionCapacity(section.capacity);
  };

  const closeSectionDialog = () => {
    setSectionDialogFor(null);
    setEditingSection(null);
    setSectionName("");
    setSectionCapacity(10);
  };

  const handleSaveSection = async () => {
    if (!sectionName.trim()) { toast.error("Section name is required"); return; }
    if (!sectionDialogFor) return;
    setSavingSection(true);
    try {
      if (editingSection) {
        await classesApi.updateSection(editingSection.id, { name: sectionName.trim(), capacity: sectionCapacity });
        toast.success("Section updated");
      } else {
        await api.post("/classes/sections/", { name: sectionName.trim(), class_ref: sectionDialogFor.id, capacity: sectionCapacity });
        toast.success("Section added successfully");
      }
      closeSectionDialog();
      fetchClasses();
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, string[]> } };
      const msg = e.response?.data ? Object.values(e.response.data).flat()[0] : "Failed to save section";
      toast.error(msg as string);
    } finally {
      setSavingSection(false);
    }
  };

  const handleDeleteSection = async () => {
    if (!deletingSection) return;
    setDeletingSectionBusy(true);
    try {
      await classesApi.deleteSection(deletingSection.id);
      toast.success("Section deleted");
      setDeletingSection(null);
      fetchClasses();
    } catch {
      toast.error("Failed to delete section");
    } finally {
      setDeletingSectionBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes & Sections</h1>
          <p className="text-sm text-gray-500 mt-0.5">Academic Year {currentAcademicYearData().name}</p>
        </div>
        <Button size="sm" className="gap-2 bg-black hover:bg-neutral-800 text-white" onClick={openCreateClass}>
          <Plus className="w-4 h-4" />
          Create Class
        </Button>
      </div>

      {/* Create / Edit Class Dialog */}
      <Dialog open={classDialogOpen} onOpenChange={(v) => { if (!v) setClassDialogOpen(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingClass ? "Edit Class" : "Create Class"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="class-name">Name <span className="text-red-500">*</span></Label>
              <Input
                id="class-name"
                placeholder="e.g. Autism Level 1 - Group B"
                value={classForm.name}
                onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class-description">Description</Label>
              <Textarea
                id="class-description"
                placeholder="Optional description"
                value={classForm.description}
                onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClassDialogOpen(false)}>Cancel</Button>
            <Button className="bg-black text-white hover:bg-neutral-800" onClick={handleSaveClass} disabled={savingClass}>
              {savingClass ? "Saving..." : editingClass ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Class Dialog */}
      <Dialog open={!!deletingClass} onOpenChange={(v) => { if (!v) setDeletingClass(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Class</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 mt-1">
            Delete <strong>{deletingClass?.name}</strong>? All sections and enrolled students will be unlinked. This cannot be undone.
          </p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeletingClass(null)}>Cancel</Button>
            <Button disabled={deletingClassBusy} onClick={handleDeleteClass} className="bg-red-600 hover:bg-red-700 text-white">
              {deletingClassBusy ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Section Dialog */}
      <Dialog open={sectionDialogFor !== null} onOpenChange={(v) => { if (!v) closeSectionDialog(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSection ? "Edit Section" : "Add Section"}</DialogTitle>
            {sectionDialogFor && (
              <p className="text-sm text-gray-500 mt-1">{sectionDialogFor.name}</p>
            )}
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="section-name">Section Name <span className="text-red-500">*</span></Label>
              <Input
                id="section-name"
                placeholder="e.g. Morning Batch"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveSection(); }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="section-capacity">Capacity</Label>
              <Input
                id="section-capacity"
                type="number"
                min={1}
                value={sectionCapacity}
                onChange={(e) => setSectionCapacity(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeSectionDialog}>Cancel</Button>
            <Button className="bg-black text-white hover:bg-neutral-800" onClick={handleSaveSection} disabled={savingSection}>
              {savingSection ? "Saving..." : editingSection ? "Save Changes" : "Add Section"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Section Dialog */}
      <Dialog open={!!deletingSection} onOpenChange={(v) => { if (!v) setDeletingSection(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Section</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 mt-1">
            Delete section <strong>{deletingSection?.name}</strong>? This cannot be undone.
          </p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeletingSection(null)}>Cancel</Button>
            <Button disabled={deletingSectionBusy} onClick={handleDeleteSection} className="bg-red-600 hover:bg-red-700 text-white">
              {deletingSectionBusy ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-neutral-300 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-2" style={{ backgroundColor: cls.color }} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900">{cls.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{cls.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 ml-3 flex-shrink-0">
                    <Badge variant={cls.is_active ? "success" : "secondary"}>
                      {cls.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <button
                      onClick={() => openEditClass(cls)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                      title="Edit class"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingClass(cls)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete class"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
                    <span className="text-neutral-800 font-medium">{cls.teacher_name}</span>
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
                            style={{ width: `${Math.min((section.student_count / section.capacity) * 100, 100)}%` }}
                          />
                        </div>
                        {section.is_full && <Badge variant="danger" className="text-xs">Full</Badge>}
                        <button
                          onClick={() => openEditSection(cls, section)}
                          className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
                          title="Edit section"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setDeletingSection(section)}
                          className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete section"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-4">
                  <Link href="/admin/reports" className="flex-1">
                    <Button size="sm" variant="outline" className="w-full text-xs">View Reports</Button>
                  </Link>
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => openAddSection(cls)}>
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

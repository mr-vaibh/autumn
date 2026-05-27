"use client";

import { useState, useEffect } from "react";
import { timetableApi, classesApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Clock, User, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface Period {
  id: number;
  name: string;
  subject: string;
  teacher_name: string | null;
  class_name: string;
  class_ref: number;
  section_name: string | null;
  day_of_week: number;
  day_name: string;
  start_time: string;
  end_time: string;
  color: string;
  room: string | null;
  is_active: boolean;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const emptyForm = {
  name: "",
  subject: "",
  class_ref: "" as string | number,
  day_of_week: 0,
  start_time: "09:00",
  end_time: "10:00",
  room: "",
  color: "#171717",
};

export default function TimetablePage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const [availableClasses, setAvailableClasses] = useState<{ id: number; name: string }[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);

  // Add / Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Delete dialog
  const [deletingPeriod, setDeletingPeriod] = useState<Period | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPeriods();
    classesApi.getAll()
      .then((res) => setAvailableClasses(res.data.results || res.data))
      .catch(() => toast.error("Failed to load classes"))
      .finally(() => setClassesLoading(false));
  }, []);

  const fetchPeriods = () => {
    setLoading(true);
    timetableApi.getPeriods()
      .then((res) => setPeriods(res.data.results || res.data))
      .catch(() => setPeriods([]))
      .finally(() => setLoading(false));
  };

  const openAdd = () => {
    setEditingPeriod(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: Period) => {
    setEditingPeriod(p);
    setForm({
      name: p.name,
      subject: p.subject,
      class_ref: p.class_ref,
      day_of_week: p.day_of_week,
      start_time: p.start_time,
      end_time: p.end_time,
      room: p.room || "",
      color: p.color,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.class_ref) { toast.error("Please select a class"); return; }
    setSubmitting(true);
    try {
      const payload = { ...form, class_ref: Number(form.class_ref) };
      if (editingPeriod) {
        await timetableApi.updatePeriod(editingPeriod.id, payload);
        toast.success("Period updated");
      } else {
        await timetableApi.createPeriod(payload);
        toast.success("Period added");
      }
      setDialogOpen(false);
      fetchPeriods();
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, string[]> } };
      const msg = e.response?.data ? Object.values(e.response.data).flat()[0] : "Failed to save period";
      toast.error(msg as string);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPeriod) return;
    setDeleting(true);
    try {
      await timetableApi.deletePeriod(deletingPeriod.id);
      toast.success("Period deleted");
      setDeletingPeriod(null);
      fetchPeriods();
    } catch {
      toast.error("Failed to delete period");
    } finally {
      setDeleting(false);
    }
  };

  const getPeriodsByDay = (day: number) => periods.filter((p) => p.day_of_week === day);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
          <p className="text-sm text-gray-500 mt-0.5">Weekly schedule overview</p>
        </div>
        <Button size="sm" className="gap-2 bg-black hover:bg-neutral-800 text-white" onClick={openAdd}>
          <Plus className="w-4 h-4" />
          Add Period
        </Button>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) setDialogOpen(false); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPeriod ? "Edit Period" : "Add Period"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="period-name">Name *</Label>
              <Input id="period-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Speech Therapy" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period-subject">Subject *</Label>
              <Input id="period-subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Speech Therapy" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period-class">Class *</Label>
              <select
                id="period-class"
                disabled={classesLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                value={form.class_ref}
                onChange={(e) => setForm({ ...form, class_ref: e.target.value })}
              >
                <option value="">
                  {classesLoading ? "Loading classes..." : availableClasses.length === 0 ? "No classes available" : "Select a class"}
                </option>
                {availableClasses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="period-day">Day of Week</Label>
              <select
                id="period-day"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.day_of_week}
                onChange={(e) => setForm({ ...form, day_of_week: Number(e.target.value) })}
              >
                {DAYS.map((day, idx) => (
                  <option key={idx} value={idx}>{day}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="period-start">Start Time</Label>
                <Input id="period-start" type="time" required value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="period-end">End Time</Label>
                <Input id="period-end" type="time" required value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="period-color">Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="period-color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="h-10 w-16 rounded border border-input cursor-pointer"
                />
                <span className="text-sm text-gray-500">Choose session color</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="period-room">Room (optional)</Label>
              <Input id="period-room" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-black text-white hover:bg-neutral-800">
                {submitting ? "Saving..." : editingPeriod ? "Save Changes" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deletingPeriod} onOpenChange={(v) => { if (!v) setDeletingPeriod(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Period</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 mt-1">
            Delete <strong>{deletingPeriod?.subject}</strong> on <strong>{deletingPeriod ? DAYS[deletingPeriod.day_of_week] : ""}</strong>? This cannot be undone.
          </p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeletingPeriod(null)}>Cancel</Button>
            <Button disabled={deleting} onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Day Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedDay(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedDay === null ? "bg-black text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
        >
          All Days
        </button>
        {DAYS.map((day, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedDay(idx)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedDay === idx ? "bg-black text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Timetable Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-neutral-300 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {DAYS.map((day, idx) => {
            if (selectedDay !== null && selectedDay !== idx) return null;
            const dayPeriods = getPeriodsByDay(idx);
            return (
              <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-neutral-900 px-4 py-3 flex items-center justify-between">
                  <h3 className="font-semibold text-white text-sm">{day}</h3>
                  <span className="text-gray-400 text-xs">{dayPeriods.length} periods</span>
                </div>
                <div className="p-3 space-y-2 min-h-[120px]">
                  {dayPeriods.length === 0 ? (
                    <div className="flex items-center justify-center h-24 text-gray-300 text-sm">No sessions scheduled</div>
                  ) : (
                    dayPeriods.map((period) => (
                      <div
                        key={period.id}
                        className="rounded-lg p-3 text-white text-sm"
                        style={{ backgroundColor: period.color }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{period.subject}</p>
                            <p className="text-white/80 text-xs mt-0.5">{period.class_name}</p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() => openEdit(period)}
                              className="p-1 rounded hover:bg-white/20 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingPeriod(period)}
                              className="p-1 rounded hover:bg-white/20 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-white/80 text-xs">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {period.start_time} - {period.end_time}
                          </div>
                          {period.teacher_name && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {period.teacher_name.split(" ")[0]}
                            </div>
                          )}
                        </div>
                        {period.room && <p className="text-white/60 text-xs mt-1">{period.room}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { timetableApi, classesApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Clock, User } from "lucide-react";
import toast from "react-hot-toast";

interface Period {
  id: number;
  name: string;
  subject: string;
  teacher_name: string | null;
  class_name: string;
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

export default function TimetablePage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<{ id: number; name: string }[]>([]);
  const [newPeriod, setNewPeriod] = useState({
    name: "",
    subject: "",
    class_ref: "" as string | number,
    day_of_week: 0,
    start_time: "09:00",
    end_time: "10:00",
    room: "",
    color: "#171717",
  });

  useEffect(() => {
    timetableApi.getPeriods()
      .then((res) => setPeriods(res.data.results || res.data))
      .catch(() => setPeriods([]))
      .finally(() => setLoading(false));
    classesApi.getAll()
      .then((res) => setAvailableClasses(res.data.results || res.data))
      .catch(() => {});
  }, []);

  const fetchPeriods = () => {
    setLoading(true);
    timetableApi.getPeriods()
      .then((res) => setPeriods(res.data.results || res.data))
      .catch(() => setPeriods([]))
      .finally(() => setLoading(false));
  };

  const getPeriodsByDay = (day: number) => periods.filter((p) => p.day_of_week === day);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
          <p className="text-sm text-gray-500 mt-0.5">Weekly schedule overview</p>
        </div>
        <Button size="sm" className="gap-2 bg-black hover:bg-neutral-800 text-white" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Period
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Period</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!newPeriod.class_ref) { toast.error("Please select a class"); return; }
              try {
                await timetableApi.createPeriod({ ...newPeriod, class_ref: Number(newPeriod.class_ref) });
                toast.success("Period added");
                setDialogOpen(false);
                setNewPeriod({ name: "", subject: "", class_ref: "", day_of_week: 0, start_time: "09:00", end_time: "10:00", room: "", color: "#171717" });
                fetchPeriods();
              } catch (err: unknown) {
                const e = err as { response?: { data?: Record<string, string[]> } };
                const msg = e.response?.data ? Object.values(e.response.data).flat()[0] : "Failed to add period";
                toast.error(msg as string);
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="period-name">Name *</Label>
              <Input id="period-name" required value={newPeriod.name} onChange={(e) => setNewPeriod({ ...newPeriod, name: e.target.value })} placeholder="e.g. Speech Therapy" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period-subject">Subject *</Label>
              <Input id="period-subject" required value={newPeriod.subject} onChange={(e) => setNewPeriod({ ...newPeriod, subject: e.target.value })} placeholder="e.g. Speech Therapy" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period-class">Class *</Label>
              <select
                id="period-class"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newPeriod.class_ref}
                onChange={(e) => setNewPeriod({ ...newPeriod, class_ref: e.target.value })}
              >
                <option value="">Select a class</option>
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
                value={newPeriod.day_of_week}
                onChange={(e) => setNewPeriod({ ...newPeriod, day_of_week: Number(e.target.value) })}
              >
                {DAYS.map((day, idx) => (
                  <option key={idx} value={idx}>{day}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="period-start">Start Time</Label>
                <Input id="period-start" type="time" required value={newPeriod.start_time} onChange={(e) => setNewPeriod({ ...newPeriod, start_time: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="period-end">End Time</Label>
                <Input id="period-end" type="time" required value={newPeriod.end_time} onChange={(e) => setNewPeriod({ ...newPeriod, end_time: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="period-color">Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="period-color"
                  value={newPeriod.color}
                  onChange={(e) => setNewPeriod({ ...newPeriod, color: e.target.value })}
                  className="h-10 w-16 rounded border border-input cursor-pointer"
                />
                <span className="text-sm text-gray-500">Choose session color</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="period-room">Room (optional)</Label>
              <Input id="period-room" value={newPeriod.room} onChange={(e) => setNewPeriod({ ...newPeriod, room: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-black text-white hover:bg-neutral-800">Add</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Day Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedDay(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedDay === null
              ? "bg-black text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          All Days
        </button>
        {DAYS.map((day, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedDay(idx)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedDay === idx
                ? "bg-black text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Timetable Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-neutral-300 border-t-transparent rounded-full animate-spin"></div>
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
                    <div className="flex items-center justify-center h-24 text-gray-300 text-sm">
                      No sessions scheduled
                    </div>
                  ) : (
                    dayPeriods.map((period) => (
                      <div
                        key={period.id}
                        className="rounded-lg p-3 text-white text-sm cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: period.color }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{period.subject}</p>
                            <p className="text-white/80 text-xs mt-0.5">{period.class_name}</p>
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
                        {period.room && (
                          <p className="text-white/60 text-xs mt-1">{period.room}</p>
                        )}
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

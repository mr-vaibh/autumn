"use client";

import { useState, useEffect } from "react";
import { timetableApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Clock, User } from "lucide-react";

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

const mockPeriods: Period[] = [
  { id: 1, name: "Speech Therapy", subject: "Speech Therapy", teacher_name: "Priya Singh", class_name: "Level 1 - A", section_name: "Morning", day_of_week: 0, day_name: "Monday", start_time: "09:00", end_time: "10:00", color: "#7C3AED", room: "Room 1", is_active: true },
  { id: 2, name: "Occupational Therapy", subject: "OT", teacher_name: "Rahul Kumar", class_name: "Level 2 - A", section_name: "Morning", day_of_week: 0, day_name: "Monday", start_time: "10:00", end_time: "11:00", color: "#2563EB", room: "OT Room", is_active: true },
  { id: 3, name: "Sensory Integration", subject: "Sensory", teacher_name: "Anita Sharma", class_name: "Level 1 - A", section_name: "Morning", day_of_week: 1, day_name: "Tuesday", start_time: "09:00", end_time: "10:00", color: "#059669", room: "Sensory Room", is_active: true },
  { id: 4, name: "ABA Therapy", subject: "ABA", teacher_name: "Vijay Nair", class_name: "Level 2 - A", section_name: "Morning", day_of_week: 1, day_name: "Tuesday", start_time: "10:00", end_time: "11:30", color: "#DC2626", room: "ABA Room", is_active: true },
  { id: 5, name: "Art Therapy", subject: "Art", teacher_name: "Priya Singh", class_name: "Level 1 - A", section_name: "Afternoon", day_of_week: 2, day_name: "Wednesday", start_time: "14:00", end_time: "15:00", color: "#F59E0B", room: "Art Room", is_active: true },
  { id: 6, name: "Music Therapy", subject: "Music", teacher_name: "Rahul Kumar", class_name: "Level 3 - A", section_name: "Morning", day_of_week: 3, day_name: "Thursday", start_time: "09:30", end_time: "10:30", color: "#8B5CF6", room: "Music Room", is_active: true },
  { id: 7, name: "Physical Therapy", subject: "PT", teacher_name: "Anita Sharma", class_name: "Level 2 - A", section_name: "Morning", day_of_week: 4, day_name: "Friday", start_time: "11:00", end_time: "12:00", color: "#14B8A6", room: "Gym", is_active: true },
];

export default function TimetablePage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    timetableApi.getPeriods()
      .then((res) => setPeriods(res.data.results || res.data))
      .catch(() => setPeriods(mockPeriods))
      .finally(() => setLoading(false));
  }, []);

  const getPeriodsByDay = (day: number) => periods.filter((p) => p.day_of_week === day);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
          <p className="text-sm text-gray-500 mt-0.5">Weekly schedule overview</p>
        </div>
        <Button size="sm" className="gap-2 bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4" />
          Add Period
        </Button>
      </div>

      {/* Day Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedDay(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedDay === null
              ? "bg-purple-600 text-white"
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
                ? "bg-purple-600 text-white"
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
          <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {DAYS.map((day, idx) => {
            if (selectedDay !== null && selectedDay !== idx) return null;
            const dayPeriods = getPeriodsByDay(idx);
            return (
              <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-4 py-3 flex items-center justify-between">
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

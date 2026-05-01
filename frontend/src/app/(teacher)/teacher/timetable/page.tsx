"use client";

import { useState, useEffect } from "react";
import { timetableApi } from "@/lib/api";
import { Clock, MapPin, Users } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Period {
  id: number;
  subject: string;
  class_name: string;
  section_name: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  color: string;
  room: string | null;
}

const mockPeriods: Period[] = [
  { id: 1, subject: "Speech Therapy", class_name: "Level 1 - A", section_name: "Morning", day_of_week: 0, start_time: "09:00", end_time: "10:00", color: "#7C3AED", room: "Room 1" },
  { id: 2, subject: "OT Session", class_name: "Level 2 - A", section_name: "Morning", day_of_week: 0, start_time: "10:30", end_time: "11:30", color: "#2563EB", room: "OT Room" },
  { id: 3, subject: "Sensory Integration", class_name: "Level 1 - A", section_name: "Morning", day_of_week: 1, start_time: "09:00", end_time: "10:00", color: "#059669", room: "Sensory Room" },
  { id: 4, subject: "Speech Therapy", class_name: "Level 3 - A", section_name: "Morning", day_of_week: 2, start_time: "09:00", end_time: "10:00", color: "#7C3AED", room: "Room 1" },
  { id: 5, subject: "ABA Therapy", class_name: "Level 2 - B", section_name: "Afternoon", day_of_week: 3, start_time: "14:00", end_time: "15:30", color: "#DC2626", room: "ABA Room" },
  { id: 6, subject: "Music Therapy", class_name: "Level 1 - A", section_name: "Morning", day_of_week: 4, start_time: "11:00", end_time: "12:00", color: "#8B5CF6", room: "Music Room" },
];

export default function TeacherTimetablePage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);

  useEffect(() => {
    timetableApi.getPeriods()
      .then((res) => setPeriods(res.data.results || res.data))
      .catch(() => setPeriods(mockPeriods))
      .finally(() => setLoading(false));
  }, []);

  const dayPeriods = periods.filter((p) => p.day_of_week === selectedDay);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Timetable</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your weekly teaching schedule</p>
      </div>

      {/* Day Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {DAYS.map((day, idx) => {
          const count = periods.filter((p) => p.day_of_week === idx).length;
          const isToday = idx === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
          return (
            <button
              key={idx}
              onClick={() => setSelectedDay(idx)}
              className={`flex-shrink-0 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                selectedDay === idx
                  ? "bg-neutral-100 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-neutral-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{day.substring(0, 3)}</span>
                {isToday && <span className="w-1.5 h-1.5 bg-current rounded-full"></span>}
              </div>
              {count > 0 && (
                <p className={`text-xs mt-0.5 ${selectedDay === idx ? "text-neutral-800" : "text-gray-400"}`}>
                  {count} period{count !== 1 ? "s" : ""}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Periods */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-neutral-300 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : dayPeriods.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-300 text-5xl mb-3">📅</p>
          <p className="text-gray-500">No sessions on {DAYS[selectedDay]}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dayPeriods.sort((a, b) => a.start_time.localeCompare(b.start_time)).map((period) => (
            <div key={period.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-5">
              {/* Color indicator */}
              <div className="w-1 h-16 rounded-full flex-shrink-0" style={{ backgroundColor: period.color }}></div>

              {/* Time */}
              <div className="text-center w-24 flex-shrink-0">
                <p className="text-lg font-bold text-gray-900">{period.start_time}</p>
                <p className="text-xs text-gray-400">{period.end_time}</p>
              </div>

              {/* Divider */}
              <div className="w-px h-12 bg-gray-100 flex-shrink-0"></div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900">{period.subject}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {period.class_name}{period.section_name ? ` (${period.section_name})` : ""}
                  </div>
                  {period.room && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {period.room}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <button className="bg-black hover:bg-neutral-800 text-white text-white text-xs px-4 py-2 rounded-lg font-medium transition-colors">
                  Write Report
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

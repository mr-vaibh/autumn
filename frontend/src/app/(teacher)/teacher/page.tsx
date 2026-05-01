"use client";

import { useState, useEffect } from "react";
import { reportsApi } from "@/lib/api";
import { StatsCard } from "@/components/shared/StatsCard";
import { Calendar, FileText, Users, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const todayPeriods = [
  { id: 1, time: "9:00 - 10:00", subject: "Speech Therapy", class: "Level 1 - A", room: "Room 1", status: "completed" },
  { id: 2, time: "10:00 - 11:00", subject: "OT Session", class: "Level 2 - A", room: "OT Room", status: "in_progress" },
  { id: 3, time: "11:30 - 12:30", subject: "Sensory Integration", class: "Level 1 - A", room: "Sensory Room", status: "upcoming" },
  { id: 4, time: "2:00 - 3:00", subject: "ABA Therapy", class: "Level 2 - B", room: "ABA Room", status: "upcoming" },
];

const pendingReports = [
  { id: 1, student: "Arjun Kumar", session: "Speech Therapy", date: "2024-05-22", urgency: "high" },
  { id: 2, student: "Hridhya Shukla", session: "OT Session", date: "2024-05-21", urgency: "medium" },
  { id: 3, student: "Rohan Mehta", session: "Sensory Integration", date: "2024-05-20", urgency: "low" },
];

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  in_progress: "bg-neutral-100 text-neutral-700",
  upcoming: "bg-gray-100 text-gray-600",
};

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    reportsApi.getDashboardStats()
      .then((res) => setStats(res.data))
      .catch(() => {
        setStats({ today_periods: 4, pending_reports: 3, total_sessions: 87 });
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.full_name?.split(" ")[0]}!</h1>
        <p className="text-gray-500 text-sm mt-0.5">{formatDate(new Date())} | Your daily overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatsCard
          title="Today's Periods"
          value={stats?.today_periods ?? 4}
          subtitle="Scheduled for today"
          icon={Calendar}
          color="purple"
        />
        <StatsCard
          title="Pending Reports"
          value={stats?.pending_reports ?? 3}
          subtitle="Session reports due"
          icon={FileText}
          color="orange"
        />
        <StatsCard
          title="Total Sessions"
          value={stats?.total_sessions ?? 87}
          subtitle="This academic year"
          icon={CheckCircle}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Today's Timetable */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-neutral-800" />
            Today&apos;s Schedule
          </h3>
          <div className="space-y-3">
            {todayPeriods.map((period) => (
              <div key={period.id} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className={`w-2 h-full min-h-[40px] rounded-full ${
                  period.status === "completed" ? "bg-green-400" :
                  period.status === "in_progress" ? "bg-neutral-100" : "bg-gray-200"
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{period.subject}</p>
                  <p className="text-xs text-gray-500">{period.class} • {period.room}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-mono">{period.time}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[period.status]}`}>
                    {period.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Reports */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-500" />
            Pending Session Reports
          </h3>
          <div className="space-y-3">
            {pendingReports.map((report) => (
              <div key={report.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100">
                <div className="w-9 h-9 bg-neutral-100 rounded-full flex items-center justify-center text-sm font-bold text-neutral-800">
                  {report.student.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{report.student}</p>
                  <p className="text-xs text-gray-500">{report.session} • {formatDate(report.date)}</p>
                </div>
                <button className="bg-black hover:bg-neutral-800 text-white text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors">
                  Write Report
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

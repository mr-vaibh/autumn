"use client";

import React, { useState, useEffect } from "react";
import { reportsApi, sessionsApi, timetableApi } from "@/lib/api";
import { StatsCard } from "@/components/shared/StatsCard";
import { Users, GraduationCap, CreditCard, UserCheck, BarChart2, TrendingUp } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";

interface DashboardStats {
  total_students: number;
  total_staff: number;
  pending_fees: number;
  overdue_fees: number;
  today_attendance_rate: number;
  today_present: number;
}

interface SessionReport {
  id: number;
  period_subject: string;
  class_name: string;
  date: string;
  status: string;
  teacher_name: string;
}

interface Period {
  id: number;
  name: string;
  subject: string;
  class_name: string;
  start_time: string;
  end_time: string;
  teacher_name?: string;
}

interface MonthlyAttendance {
  month: string;
  present: number;
  total: number;
}

function NoData({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[220px] gap-3">
      <Icon className="w-14 h-14 text-gray-200 stroke-1" />
      <p className="text-sm text-gray-400 font-medium">{label}</p>
    </div>
  );
}

function fmt12h(time: string) {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

// JS getDay(): 0=Sun…6=Sat → Django: 0=Mon…6=Sun
function jsToDjangoDay(jsDay: number) {
  return jsDay === 0 ? 6 : jsDay - 1;
}

const HRIDHYA_ENTRY = {
  id: 0,
  text: "Fee payment received - Hridhya Shukla (₹8,500)",
  time: "",
  color: "bg-green-500",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [attendanceTrend, setAttendanceTrend] = useState<MonthlyAttendance[]>([]);
  const [recentSessions, setRecentSessions] = useState<SessionReport[]>([]);
  const [todayPeriods, setTodayPeriods] = useState<Period[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const todayDjangoDay = jsToDjangoDay(new Date().getDay());

    Promise.allSettled([
      reportsApi.getDashboardStats(),
      reportsApi.getAttendanceReport(),
      sessionsApi.getAll({ ordering: "-date", page_size: 4 }),
      timetableApi.getPeriods({ day_of_week: todayDjangoDay }),
    ]).then(([statsRes, attendanceRes, sessionsRes, periodsRes]) => {
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
      if (attendanceRes.status === "fulfilled") {
        setAttendanceTrend(attendanceRes.value.data.monthly_trend || []);
      }
      if (sessionsRes.status === "fulfilled") {
        const items = sessionsRes.value.data.results || sessionsRes.value.data;
        setRecentSessions(items.slice(0, 4));
      }
      if (periodsRes.status === "fulfilled") {
        const items = periodsRes.value.data.results || periodsRes.value.data;
        setTodayPeriods(
          [...items].sort((a: Period, b: Period) => a.start_time.localeCompare(b.start_time))
        );
      }
    });
  }, []);

  const today = new Date();

  const attendanceChartData = attendanceTrend.map((m) => ({
    month: m.month,
    present: m.present,
    absent: m.total - m.present,
  }));
  const hasAttendanceData = attendanceChartData.some((m) => m.present > 0 || m.absent > 0);

  const sessionStatusColor: Record<string, string> = {
    completed: "bg-green-500",
    pending: "bg-orange-400",
    skipped: "bg-neutral-300",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">{formatDate(today)} | Welcome back, Admin</p>
        </div>
        <div className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
          System Online
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard title="Total Students" value={stats?.total_students ?? "..."} subtitle="Active enrollments" icon={GraduationCap} color="purple" />
        <StatsCard title="Staff Members" value={stats?.total_staff ?? "..."} subtitle="Teachers & therapists" icon={Users} color="blue" />
        <StatsCard title="Today's Attendance" value={stats ? `${stats.today_attendance_rate}%` : "..."} subtitle={`${stats?.today_present ?? 0} students present`} icon={UserCheck} color="green" />
        <StatsCard title="Pending Fees" value={stats?.pending_fees ?? "..."} subtitle={`${stats?.overdue_fees ?? 0} overdue`} icon={CreditCard} color="orange" />
      </div>

      {/* Charts */}
      {mounted && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-1">Monthly Attendance Trend</h3>
            <p className="text-xs text-gray-400 mb-4">Student attendance over the last 6 months</p>
            {!hasAttendanceData ? (
              <NoData icon={BarChart2} label="Not enough data to display" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={attendanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="present" fill="#171717" radius={[4, 4, 0, 0]} name="Present" />
                  <Bar dataKey="absent" fill="#d4d4d4" radius={[4, 4, 0, 0]} name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-1">Average Therapy Progress</h3>
            <p className="text-xs text-gray-400 mb-4">Average improvement level (1–5 scale)</p>
            <NoData icon={TrendingUp} label="Not enough data to display" />
          </div>
        </div>
      )}

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {/* Pinned entry */}
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-green-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 leading-snug">{HRIDHYA_ENTRY.text}</p>
              </div>
            </div>

            {recentSessions.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No recent session activity</p>
            ) : (
              recentSessions.map((s) => (
                <div key={s.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${sessionStatusColor[s.status] ?? "bg-neutral-200"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-snug">
                      Session report — {s.period_subject} · {s.class_name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.date} · {s.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Today&apos;s Schedule</h3>
          {todayPeriods.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <UserCheck className="w-10 h-10 text-gray-200 stroke-1" />
              <p className="text-sm text-gray-400">No classes scheduled today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayPeriods.map((p) => (
                <div key={p.id} className="flex items-start gap-3 text-sm">
                  <span className="text-xs text-neutral-800 font-mono font-semibold w-16 flex-shrink-0 mt-0.5">
                    {fmt12h(p.start_time)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-xs leading-tight">{p.subject} — {p.name}</p>
                    {p.teacher_name && <p className="text-gray-400 text-xs">{p.teacher_name}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

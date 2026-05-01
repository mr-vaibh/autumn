"use client";

import { useState, useEffect } from "react";
import { reportsApi } from "@/lib/api";
import { StatsCard } from "@/components/shared/StatsCard";
import { Users, GraduationCap, CreditCard, UserCheck, TrendingUp, AlertTriangle, Calendar, BookOpen } from "lucide-react";
import dynamic from "next/dynamic";
import { formatDate } from "@/lib/utils";

const DashboardCharts = dynamic(() => import("./DashboardCharts"), { ssr: false, loading: () => <div className="h-64 bg-gray-50 rounded-xl animate-pulse" /> });


const recentActivities = [
  { id: 1, type: "session", text: "Session report submitted for Arjun Kumar - Speech Therapy", time: "10 min ago", color: "bg-neutral-100" },
  { id: 2, type: "payment", text: "Fee payment received - Hridhya Shukla (₹8,500)", time: "25 min ago", color: "bg-green-500" },
  { id: 3, type: "attendance", text: "Attendance marked for Class Autism Level 2", time: "1 hr ago", color: "bg-neutral-100" },
  { id: 4, type: "student", text: "New student enrolled - Rohan Mehta", time: "2 hrs ago", color: "bg-orange-500" },
  { id: 5, type: "alert", text: "3 students have overdue fees this month", time: "3 hrs ago", color: "bg-red-500" },
];

interface DashboardStats {
  total_students: number;
  total_staff: number;
  pending_fees: number;
  overdue_fees: number;
  today_attendance_rate: number;
  today_present: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsApi.getDashboardStats()
      .then((res) => setStats(res.data))
      .catch(() => {
        // Use mock data if API fails
        setStats({
          total_students: 47,
          total_staff: 12,
          pending_fees: 8,
          overdue_fees: 3,
          today_attendance_rate: 87.5,
          today_present: 41,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">{formatDate(today)} | Welcome back, Admin</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            System Online
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Students"
          value={stats?.total_students ?? "..."}
          subtitle="Active enrollments"
          icon={GraduationCap}
          color="purple"
          trend={{ value: 8, label: "this month", positive: true }}
        />
        <StatsCard
          title="Staff Members"
          value={stats?.total_staff ?? "..."}
          subtitle="Teachers & therapists"
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Today's Attendance"
          value={stats ? `${stats.today_attendance_rate}%` : "..."}
          subtitle={`${stats?.today_present ?? 0} students present`}
          icon={UserCheck}
          color="green"
          trend={{ value: 2.3, label: "vs yesterday", positive: true }}
        />
        <StatsCard
          title="Pending Fees"
          value={stats?.pending_fees ?? "..."}
          subtitle={`${stats?.overdue_fees ?? 0} overdue`}
          icon={CreditCard}
          color="orange"
        />
      </div>

      {/* Charts Row */}
      <DashboardCharts />

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${activity.color}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-snug">{activity.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Today&apos;s Schedule</h3>
          <div className="space-y-3">
            {[
              { time: "9:00 AM", activity: "Speech Therapy - Level 1", teacher: "Ms. Priya" },
              { time: "10:00 AM", activity: "Occupational Therapy", teacher: "Dr. Rahul" },
              { time: "11:00 AM", activity: "Sensory Integration", teacher: "Ms. Anita" },
              { time: "2:00 PM", activity: "ABA Therapy", teacher: "Dr. Kumar" },
              { time: "3:30 PM", activity: "Parent Meeting", teacher: "Admin" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm">
                <span className="text-xs text-neutral-800 font-mono font-semibold w-16 flex-shrink-0 mt-0.5">{item.time}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-xs leading-tight">{item.activity}</p>
                  <p className="text-gray-400 text-xs">{item.teacher}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

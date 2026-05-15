"use client";

import { useState, useEffect } from "react";
const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } = require("recharts");
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Users, Calendar } from "lucide-react";
import { reportsApi } from "@/lib/api";

interface MonthlyAttendance {
  month: string;
  present: number;
  total: number;
  rate: number;
}

interface SessionStatusItem {
  status: string;
  count: number;
}

interface DashboardStats {
  total_students: number;
  total_staff: number;
  pending_fees: number;
  overdue_fees: number;
  today_attendance_rate: number;
  today_present: number;
}

const SESSION_COLORS: Record<string, string> = {
  completed: "#059669",
  pending: "#F59E0B",
  skipped: "#9CA3AF",
};

export default function ReportsPage() {
  const [attendanceTrend, setAttendanceTrend] = useState<MonthlyAttendance[]>([]);
  const [sessionStatus, setSessionStatus] = useState<{ name: string; value: number; color: string }[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      reportsApi.getAttendanceReport(),
      reportsApi.getDashboardStats(),
    ]).then(([attendanceRes, statsRes]) => {
      if (attendanceRes.status === "fulfilled") {
        const data = attendanceRes.value.data;
        setAttendanceTrend(data.monthly_trend || []);

        const summary: SessionStatusItem[] = data.summary || [];
        setSessionStatus(
          summary.map((s) => ({
            name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
            value: s.count,
            color: SESSION_COLORS[s.status] || "#9CA3AF",
          }))
        );
      }
      if (statsRes.status === "fulfilled") {
        setDashboardStats(statsRes.value.data);
      }
    }).finally(() => setLoading(false));
  }, []);

  const attendanceChartData = attendanceTrend.map((m) => ({
    month: m.month,
    present: m.present,
    absent: m.total - m.present,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Live data from the system</p>
      </div>

      <Tabs defaultValue="attendance">
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger value="attendance" className="gap-2">
            <Calendar className="w-4 h-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-2">
            <Users className="w-4 h-4" />
            Student Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-5 mt-4">
          {loading ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center text-sm text-gray-400">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Monthly Attendance</h3>
                {attendanceChartData.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-16">No attendance records yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={attendanceChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="present" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Present" />
                      <Bar dataKey="absent" fill="#fca5a5" radius={[4, 4, 0, 0]} name="Absent" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Session Status</h3>
                {sessionStatus.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-16">No session data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={sessionStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">
                        {sessionStatus.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="students" className="space-y-5 mt-4">
          {loading ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center text-sm text-gray-400">Loading...</div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-md">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Summary</h3>
              {!dashboardStats ? (
                <p className="text-sm text-gray-400">No data available</p>
              ) : (
                <div className="space-y-4">
                  {[
                    { label: "Total Students", value: dashboardStats.total_students },
                    { label: "Total Staff", value: dashboardStats.total_staff },
                    { label: "Today's Attendance Rate", value: `${dashboardStats.today_attendance_rate}%` },
                    { label: "Today Present", value: dashboardStats.today_present },
                    { label: "Pending Fees", value: dashboardStats.pending_fees },
                    { label: "Overdue Fees", value: dashboardStats.overdue_fees },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-gray-600">{stat.label}</span>
                      <span className="font-bold text-gray-900">{stat.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

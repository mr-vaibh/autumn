"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Users, Calendar } from "lucide-react";

const attendanceData = [
  { month: "Jan", present: 85, absent: 15, late: 5 },
  { month: "Feb", present: 88, absent: 12, late: 3 },
  { month: "Mar", present: 82, absent: 18, late: 7 },
  { month: "Apr", present: 91, absent: 9, late: 2 },
  { month: "May", present: 87, absent: 13, late: 4 },
  { month: "Jun", present: 94, absent: 6, late: 1 },
];

const progressData = [
  { month: "Jan", avgLevel: 3.2, sessions: 42 },
  { month: "Feb", avgLevel: 3.4, sessions: 45 },
  { month: "Mar", avgLevel: 3.1, sessions: 38 },
  { month: "Apr", avgLevel: 3.6, sessions: 50 },
  { month: "May", avgLevel: 3.8, sessions: 48 },
  { month: "Jun", avgLevel: 4.1, sessions: 52 },
];

const levelDistribution = [
  { name: "Level 1", value: 22, color: "#7C3AED" },
  { name: "Level 2", value: 18, color: "#2563EB" },
  { name: "Level 3", value: 7, color: "#DC2626" },
];

const sessionStatusData = [
  { name: "Completed", value: 68, color: "#059669" },
  { name: "Pending", value: 18, color: "#F59E0B" },
  { name: "Skipped", value: 14, color: "#9CA3AF" },
];

const therapyBreakdown = [
  { therapy: "Speech", sessions: 45, avgProgress: 3.9 },
  { therapy: "OT", sessions: 38, avgProgress: 3.7 },
  { therapy: "ABA", sessions: 52, avgProgress: 4.1 },
  { therapy: "Sensory", sessions: 30, avgProgress: 3.5 },
  { therapy: "Music", sessions: 22, avgProgress: 4.2 },
  { therapy: "Art", sessions: 18, avgProgress: 3.8 },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Academic Year 2024-25 | All data</p>
      </div>

      <Tabs defaultValue="attendance">
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger value="attendance" className="gap-2">
            <Calendar className="w-4 h-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="progress" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Therapy Progress
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-2">
            <Users className="w-4 h-4" />
            Student Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-5 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Attendance Trend */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Monthly Attendance</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Present" />
                  <Bar dataKey="absent" fill="#fca5a5" radius={[4, 4, 0, 0]} name="Absent" />
                  <Bar dataKey="late" fill="#fde68a" radius={[4, 4, 0, 0]} name="Late" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Session Status */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Session Status</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={sessionStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {sessionStatusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-5 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Progress Trend */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Avg. Improvement Level Over Time</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgLevel" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 4, fill: "#7c3aed" }} name="Avg Level" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Therapy Breakdown */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Therapy Type Performance</h3>
              <div className="space-y-3">
                {therapyBreakdown.map((item) => (
                  <div key={item.therapy} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">{item.therapy}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full bg-purple-500"
                        style={{ width: `${(item.avgProgress / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-12 text-right">{item.avgProgress}/5</span>
                    <span className="text-xs text-gray-400 w-16 text-right">{item.sessions} sessions</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-5 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Level Distribution */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Students by Autism Level</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={levelDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {levelDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Stats */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Summary</h3>
              <div className="space-y-4">
                {[
                  { label: "Total Students", value: "47", change: "+3 this month", positive: true },
                  { label: "Sessions This Month", value: "312", change: "+12% vs last month", positive: true },
                  { label: "Average Attendance", value: "87.5%", change: "+2.3% vs last month", positive: true },
                  { label: "Avg Improvement Score", value: "3.8/5", change: "+0.2 vs last month", positive: true },
                  { label: "Pending Fee Amount", value: "₹42,500", change: "-5% vs last month", positive: true },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{stat.label}</span>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{stat.value}</p>
                      <p className={`text-xs ${stat.positive ? "text-green-500" : "text-red-500"}`}>{stat.change}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

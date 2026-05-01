"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";

const mockAttendanceData = [
  { month: "Jan", present: 85, absent: 15 },
  { month: "Feb", present: 88, absent: 12 },
  { month: "Mar", present: 82, absent: 18 },
  { month: "Apr", present: 91, absent: 9 },
  { month: "May", present: 87, absent: 13 },
  { month: "Jun", present: 94, absent: 6 },
];

const mockProgressData = [
  { month: "Jan", avg: 3.2 },
  { month: "Feb", avg: 3.4 },
  { month: "Mar", avg: 3.1 },
  { month: "Apr", avg: 3.6 },
  { month: "May", avg: 3.8 },
  { month: "Jun", avg: 4.1 },
];

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-1">Monthly Attendance Trend</h3>
        <p className="text-xs text-gray-400 mb-4">Student attendance over the last 6 months</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={mockAttendanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="present" fill="#171717" radius={[4, 4, 0, 0]} name="Present" />
            <Bar dataKey="absent" fill="#d4d4d4" radius={[4, 4, 0, 0]} name="Absent" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-1">Average Therapy Progress</h3>
        <p className="text-xs text-gray-400 mb-4">Average improvement level (1-5 scale)</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={mockProgressData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="avg"
              stroke="#171717"
              strokeWidth={2}
              dot={{ fill: "#171717", r: 4 }}
              name="Avg Progress"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { StatsCard } from "@/components/shared/StatsCard";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/lib/utils";
import { Calendar, FileText, CreditCard, Bell, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const childInfo = {
  name: "Arjun Kumar",
  studentId: "GALS20240001",
  level: "Level 1",
  teacher: "Priya Singh",
};

const recentSessions = [
  { id: 1, subject: "Speech Therapy", date: "2024-05-22", improvement: 4, notes: "Good progress in pronunciation. Responding well to visual cues." },
  { id: 2, subject: "Occupational Therapy", date: "2024-05-20", improvement: 3, notes: "Working on fine motor skills. Completed 3 out of 5 exercises." },
  { id: 3, subject: "Sensory Integration", date: "2024-05-19", improvement: 4, notes: "Excellent response to sensory activities today." },
];

const todaySchedule = [
  { time: "9:00 AM", subject: "Speech Therapy", teacher: "Ms. Priya Singh" },
  { time: "11:00 AM", subject: "OT Session", teacher: "Dr. Rahul Kumar" },
  { time: "2:00 PM", subject: "Sensory Integration", teacher: "Ms. Anita" },
];

const notifications = [
  { id: 1, type: "info", message: "Monthly fee due on June 1st - ₹8,500", time: "Today" },
  { id: 2, type: "success", message: "Session report added for May 22nd Speech Therapy", time: "Today" },
  { id: 3, type: "warning", message: "Parent-Teacher meeting on June 8th at 10 AM", time: "Yesterday" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export default function ParentDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.full_name?.split(" ")[0]}!</h1>
        <p className="text-gray-500 text-sm mt-0.5">{formatDate(new Date())} | Your child&apos;s overview</p>
      </div>

      {/* Child Info Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold">
            {childInfo.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold">{childInfo.name}</h2>
            <div className="flex items-center gap-3 mt-1 text-purple-200 text-sm">
              <span className="font-mono">{childInfo.studentId}</span>
              <span>•</span>
              <span>{childInfo.level}</span>
              <span>•</span>
              <span>Teacher: {childInfo.teacher}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatsCard
          title="Sessions This Month"
          value={18}
          subtitle="12 completed, 6 upcoming"
          icon={Calendar}
          color="purple"
        />
        <StatsCard
          title="Avg Progress Score"
          value="3.8/5"
          subtitle="Improvement this month"
          icon={Star}
          color="green"
        />
        <StatsCard
          title="Pending Fees"
          value="₹8,500"
          subtitle="Due June 1st"
          icon={CreditCard}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Today's Schedule */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Today&apos;s Sessions
          </h3>
          <div className="space-y-3">
            {todaySchedule.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg">
                <div className="text-center w-16 flex-shrink-0">
                  <p className="text-xs font-bold text-purple-700">{item.time}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.subject}</p>
                  <p className="text-xs text-gray-500">{item.teacher}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Recent Session Reports
          </h3>
          <div className="space-y-4">
            {recentSessions.map((session) => (
              <div key={session.id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                <div className="flex items-start justify-between mb-1.5">
                  <p className="font-semibold text-gray-900 text-sm">{session.subject}</p>
                  <span className="text-xs text-gray-400">{formatDate(session.date)}</span>
                </div>
                <StarRating rating={session.improvement} />
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{session.notes}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-yellow-500" />
          Notifications
        </h3>
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div key={notif.id} className={`flex items-start gap-3 p-3 rounded-lg ${
              notif.type === "warning" ? "bg-yellow-50" :
              notif.type === "success" ? "bg-green-50" : "bg-blue-50"
            }`}>
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                notif.type === "warning" ? "bg-yellow-500" :
                notif.type === "success" ? "bg-green-500" : "bg-blue-500"
              }`}></div>
              <div>
                <p className="text-sm text-gray-700">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-0.5">{notif.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

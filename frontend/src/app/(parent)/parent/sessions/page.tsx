"use client";

import { useState, useEffect } from "react";
import { sessionsApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Star, ChevronDown, ChevronUp } from "lucide-react";

interface SessionReport {
  id: number;
  period_subject: string;
  class_name: string;
  date: string;
  status: string;
  improvement_level: number | null;
  teacher_name: string;
  activity_done?: string;
  student_response?: string;
  behavior_notes?: string;
  general_notes?: string;
}

const mockSessions: SessionReport[] = [
  { id: 1, period_subject: "Speech Therapy", class_name: "Level 1 - A", date: "2024-05-22", status: "completed", improvement_level: 4, teacher_name: "Priya Singh", activity_done: "Practiced consonant sounds with picture cards. Used repetition and visual cues.", student_response: "Arjun responded positively. Successfully pronounced 8 out of 10 target words.", behavior_notes: "Good behavior throughout. Sat focused for full 45 minutes.", general_notes: "Significant improvement from last week. Continue with consonant blend exercises." },
  { id: 2, period_subject: "Occupational Therapy", class_name: "Level 1 - A", date: "2024-05-20", status: "completed", improvement_level: 3, teacher_name: "Rahul Kumar", activity_done: "Fine motor exercises: Threading beads, playdough activities, scissor work.", student_response: "Needed some assistance with scissor grip but completed all tasks with moderate support.", behavior_notes: "Some hyperactivity noted. Took short sensory break which helped.", general_notes: "Continue fine motor exercises. Introduce bilateral coordination activities next week." },
  { id: 3, period_subject: "Sensory Integration", class_name: "Level 1 - A", date: "2024-05-19", status: "completed", improvement_level: 5, teacher_name: "Anita Sharma", activity_done: "Sensory bin activities, swing therapy, tactile stimulation.", student_response: "Excellent engagement! Arjun sought out the sensory activities independently.", behavior_notes: "Very calm and focused after sensory activities. No challenging behaviors.", general_notes: "Best session this month! He is responding very well to sensory diet." },
  { id: 4, period_subject: "Speech Therapy", class_name: "Level 1 - A", date: "2024-05-17", status: "skipped", improvement_level: null, teacher_name: "Priya Singh", general_notes: "Session skipped due to student absence." },
];

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-gray-300 text-xs italic">Not rated</span>;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
        />
      ))}
      <span className="text-sm text-gray-500 ml-1 font-medium">{rating}/5</span>
    </div>
  );
}

export default function ParentSessionsPage() {
  const [sessions, setSessions] = useState<SessionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    sessionsApi.getAll()
      .then((res) => setSessions(res.data.results || res.data))
      .catch(() => setSessions(mockSessions))
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Session Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your child&apos;s therapy session records</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Header */}
              <div
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(session.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-10 rounded-full ${session.status === "completed" ? "bg-green-400" : session.status === "skipped" ? "bg-gray-300" : "bg-yellow-400"}`}></div>
                  <div>
                    <p className="font-bold text-gray-900">{session.period_subject}</p>
                    <p className="text-sm text-gray-500">{session.teacher_name} • {formatDate(session.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StarRating rating={session.improvement_level} />
                  <Badge variant={session.status === "completed" ? "success" : session.status === "skipped" ? "secondary" : "warning"}>
                    {session.status}
                  </Badge>
                  {expandedId === session.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === session.id && session.status === "completed" && (
                <div className="border-t border-gray-100 p-5 space-y-4 bg-gray-50">
                  {session.activity_done && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Activity Done</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{session.activity_done}</p>
                    </div>
                  )}
                  {session.student_response && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Student Response</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{session.student_response}</p>
                    </div>
                  )}
                  {session.behavior_notes && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Behavior Notes</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{session.behavior_notes}</p>
                    </div>
                  )}
                  {session.general_notes && (
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                      <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1.5">Therapist Notes</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{session.general_notes}</p>
                    </div>
                  )}
                </div>
              )}
              {expandedId === session.id && session.status === "skipped" && (
                <div className="border-t border-gray-100 p-5 bg-gray-50">
                  <p className="text-sm text-gray-500 italic">{session.general_notes || "Session was skipped."}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { sessionsApi } from "@/lib/api";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Star } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface SessionReport {
  id: number;
  period_subject: string;
  class_name: string;
  date: string;
  status: string;
  improvement_level: number | null;
  teacher_name: string;
}

const mockSessions: SessionReport[] = [
  { id: 1, period_subject: "Speech Therapy", class_name: "Level 1 - A", date: "2024-05-22", status: "completed", improvement_level: 4, teacher_name: "Priya Singh" },
  { id: 2, period_subject: "OT Session", class_name: "Level 2 - A", date: "2024-05-22", status: "pending", improvement_level: null, teacher_name: "Priya Singh" },
  { id: 3, period_subject: "Sensory Integration", class_name: "Level 1 - A", date: "2024-05-21", status: "completed", improvement_level: 3, teacher_name: "Priya Singh" },
  { id: 4, period_subject: "Speech Therapy", class_name: "Level 3 - A", date: "2024-05-20", status: "skipped", improvement_level: null, teacher_name: "Priya Singh" },
  { id: 5, period_subject: "ABA Therapy", class_name: "Level 2 - B", date: "2024-05-19", status: "completed", improvement_level: 5, teacher_name: "Priya Singh" },
];

const statusBadge: Record<string, "success" | "warning" | "secondary"> = {
  completed: "success",
  pending: "warning",
  skipped: "secondary",
};

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-gray-300 text-xs">Not rated</span>;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating}/5</span>
    </div>
  );
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    sessionsApi.getAll()
      .then((res) => setSessions(res.data.results || res.data))
      .catch(() => setSessions(mockSessions))
      .finally(() => setLoading(false));
  }, []);

  const filteredSessions = filter === "all" ? sessions : sessions.filter((s) => s.status === filter);

  const columns = [
    {
      key: "period_subject",
      header: "Session",
      render: (row: SessionReport) => (
        <div>
          <p className="font-semibold text-gray-900 text-sm">{row.period_subject}</p>
          <p className="text-xs text-gray-400">{row.class_name}</p>
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (row: SessionReport) => <span className="text-sm text-gray-600">{formatDate(row.date)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row: SessionReport) => (
        <Badge variant={statusBadge[row.status] || "secondary"}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "improvement_level",
      header: "Progress",
      render: (row: SessionReport) => <StarRating rating={row.improvement_level} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Session Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">Document and track therapy sessions</p>
        </div>
        <Button size="sm" className="gap-2 bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4" />
          New Report
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["all", "completed", "pending", "skipped"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f ? "bg-purple-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <DataTable
          data={filteredSessions as unknown as Record<string, unknown>[]}
          columns={columns as Parameters<typeof DataTable>[0]["columns"]}
          searchable={true}
          searchKeys={["period_subject" as keyof Record<string, unknown>]}
          isLoading={loading}
          emptyMessage="No session reports found"
          actions={(row) => (
            <div className="flex items-center gap-2 justify-end">
              {(row as unknown as SessionReport).status === "pending" && (
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-xs">
                  Write Report
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          )}
        />
      </div>
    </div>
  );
}

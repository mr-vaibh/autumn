"use client";

import { useState, useEffect } from "react";
import { sessionsApi, timetableApi } from "@/lib/api";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Eye, Star } from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface SessionReport {
  id: number;
  period_subject: string;
  class_name: string;
  date: string;
  status: string;
  improvement_level: number | null;
  teacher_name: string;
}

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [availablePeriods, setAvailablePeriods] = useState<{ id: number; name: string; subject: string; class_name: string }[]>([]);
  const [newReport, setNewReport] = useState({
    period: "" as string | number,
    date: new Date().toISOString().split("T")[0],
    status: "pending",
  });

  useEffect(() => {
    sessionsApi.getAll()
      .then((res) => setSessions(res.data.results || res.data))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
    timetableApi.getPeriods()
      .then((res) => setAvailablePeriods(res.data.results || res.data))
      .catch(() => {});
  }, []);

  const fetchSessions = () => {
    setLoading(true);
    sessionsApi.getAll()
      .then((res) => setSessions(res.data.results || res.data))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  };

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
        <Button size="sm" className="gap-2 bg-black hover:bg-neutral-800 text-white" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          New Report
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Report</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!newReport.period) { toast.error("Please select a period"); return; }
              try {
                await sessionsApi.create({ ...newReport, period: Number(newReport.period) });
                toast.success("Report created");
                setDialogOpen(false);
                setNewReport({ period: "", date: new Date().toISOString().split("T")[0], status: "pending" });
                fetchSessions();
              } catch (err: unknown) {
                const e = err as { response?: { data?: Record<string, string[]> } };
                const msg = e.response?.data ? Object.values(e.response.data).flat()[0] : "Failed to create report";
                toast.error(msg as string);
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="report-period">Period *</Label>
              <select
                id="report-period"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newReport.period}
                onChange={(e) => setNewReport({ ...newReport, period: e.target.value })}
              >
                <option value="">Select a period</option>
                {availablePeriods.map((p) => (
                  <option key={p.id} value={p.id}>{p.subject} — {p.class_name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-date">Date *</Label>
              <Input id="report-date" type="date" required value={newReport.date} onChange={(e) => setNewReport({ ...newReport, date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-status">Status</Label>
              <select
                id="report-status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newReport.status}
                onChange={(e) => setNewReport({ ...newReport, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="skipped">Skipped</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-black text-white hover:bg-neutral-800">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Filter */}
      <div className="flex gap-2">
        {["all", "completed", "pending", "skipped"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f ? "bg-black text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <DataTable
          data={filteredSessions as unknown as Record<string, unknown>[]}
          columns={columns as unknown as Parameters<typeof DataTable>[0]["columns"]}
          searchable={true}
          searchKeys={["period_subject" as keyof Record<string, unknown>]}
          isLoading={loading}
          emptyMessage="No session reports found"
          actions={(row) => (
            <div className="flex items-center gap-2 justify-end">
              {(row as unknown as SessionReport).status === "pending" && (
                <Button size="sm" className="bg-black hover:bg-neutral-800 text-white text-xs">
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

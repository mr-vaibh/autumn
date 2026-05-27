"use client";

import { useState, useEffect } from "react";
import api, { classesApi, feesApi } from "@/lib/api";
import { currentAcademicYearData } from "@/lib/utils";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/shared/StatsCard";
import { CreditCard, AlertTriangle, CheckCircle, Plus, Zap, Trash2, Pencil } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

interface FeeStructure {
  id: number;
  name: string;
  amount: number;
  frequency: string;
  academic_year_name: string;
  description: string;
  is_active: boolean;
}

interface StudentFee {
  id: number;
  student_name: string;
  student_id_display: string;
  fee_structure_name: string;
  due_date: string;
  amount: number;
  discount_amount: number;
  net_amount: number;
  status: string;
}

const statusBadge = {
  paid: "success" as const,
  pending: "warning" as const,
  overdue: "danger" as const,
  partial: "info" as const,
  waived: "secondary" as const,
};

const frequencyLabel: Record<string, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  semi_annual: "Semi-Annual",
  annual: "Annual",
  one_time: "One-Time",
};

export default function FeesPage() {
  // Fee Structures
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [structuresLoading, setStructuresLoading] = useState(true);
  const [createStructureOpen, setCreateStructureOpen] = useState(false);
  const [newStructure, setNewStructure] = useState({ name: "", amount: "", frequency: "monthly", description: "" });
  const [creatingStructure, setCreatingStructure] = useState(false);

  // Edit structure
  const [editStructure, setEditStructure] = useState<FeeStructure | null>(null);
  const [editForm, setEditForm] = useState({ name: "", amount: "", frequency: "monthly", description: "" });
  const [savingStructure, setSavingStructure] = useState(false);

  // Generate dialog
  const [generateFor, setGenerateFor] = useState<FeeStructure | null>(null);
  const [generateDueDate, setGenerateDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [generating, setGenerating] = useState(false);

  // Delete structure
  const [deleteStructure, setDeleteStructure] = useState<FeeStructure | null>(null);
  const [deletingStructure, setDeletingStructure] = useState(false);

  // Student Fees
  const [fees, setFees] = useState<StudentFee[]>([]);
  const [feesLoading, setFeesLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchStructures = () => {
    setStructuresLoading(true);
    feesApi.getStructures()
      .then((res) => setStructures(res.data.results || res.data))
      .catch(() => setStructures([]))
      .finally(() => setStructuresLoading(false));
  };

  const fetchFees = () => {
    setFeesLoading(true);
    feesApi.getStudentFees()
      .then((res) => setFees(res.data.results || res.data))
      .catch(() => setFees([]))
      .finally(() => setFeesLoading(false));
  };

  useEffect(() => { fetchStructures(); fetchFees(); }, []);

  // ── Resolve or create academic year ────────────────────────────────────────
  const resolveAcademicYear = async (): Promise<number | null> => {
    const yearRes = await api.get("/classes/academic-years/");
    const years: { is_current: boolean; id: number }[] = yearRes.data.results || yearRes.data;
    const current = years.find((y) => y.is_current) || years[0];
    if (current) return current.id;
    const created = await classesApi.createAcademicYear(currentAcademicYearData());
    return created.data.id as number;
  };

  // ── Create structure ────────────────────────────────────────────────────────
  const handleCreateStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStructure.name || !newStructure.amount) { toast.error("Name and amount are required"); return; }
    setCreatingStructure(true);
    try {
      const yearId = await resolveAcademicYear();
      if (!yearId) { toast.error("Could not resolve academic year"); return; }
      await feesApi.createStructure({ ...newStructure, amount: Number(newStructure.amount), academic_year: yearId });
      toast.success("Fee structure created");
      setCreateStructureOpen(false);
      setNewStructure({ name: "", amount: "", frequency: "monthly", description: "" });
      fetchStructures();
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, string[]> } };
      const msg = e.response?.data ? Object.values(e.response.data).flat()[0] : "Failed to create";
      toast.error(msg as string);
    } finally {
      setCreatingStructure(false);
    }
  };

  // ── Edit structure ──────────────────────────────────────────────────────────
  const openEditStructure = (s: FeeStructure) => {
    setEditStructure(s);
    setEditForm({ name: s.name, amount: String(s.amount), frequency: s.frequency, description: s.description || "" });
  };

  const handleEditStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStructure || !editForm.name || !editForm.amount) { toast.error("Name and amount are required"); return; }
    setSavingStructure(true);
    try {
      await feesApi.updateStructure(editStructure.id, { ...editForm, amount: Number(editForm.amount) });
      toast.success("Fee structure updated");
      setEditStructure(null);
      fetchStructures();
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, string[]> } };
      const msg = e.response?.data ? Object.values(e.response.data).flat()[0] : "Failed to update";
      toast.error(msg as string);
    } finally {
      setSavingStructure(false);
    }
  };

  // ── Generate fees ───────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!generateFor) return;
    setGenerating(true);
    try {
      const res = await feesApi.generateFees(generateFor.id, generateDueDate);
      toast.success(res.data.detail);
      setGenerateFor(null);
      fetchFees();
    } catch {
      toast.error("Failed to generate fees");
    } finally {
      setGenerating(false);
    }
  };

  // ── Delete structure ────────────────────────────────────────────────────────
  const handleDeleteStructure = async () => {
    if (!deleteStructure) return;
    setDeletingStructure(true);
    try {
      await feesApi.deleteStructure(deleteStructure.id);
      toast.success("Fee structure deleted");
      setDeleteStructure(null);
      setStructures((prev) => prev.filter((s) => s.id !== deleteStructure.id));
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingStructure(false);
    }
  };

  // ── Mark paid ───────────────────────────────────────────────────────────────
  const handleMarkPaid = async (feeId: number) => {
    setFees((prev) => prev.map((f) => f.id === feeId ? { ...f, status: "paid" } : f));
    try {
      await api.patch(`/fees/student-fees/${feeId}/`, { status: "paid" });
      toast.success("Marked as paid");
    } catch {
      toast.error("Failed to update");
      fetchFees();
    }
  };

  const filteredFees = activeFilter === "all" ? fees : fees.filter((f) => f.status === activeFilter);
  const totalCollected = fees.filter((f) => f.status === "paid").reduce((s, f) => s + f.net_amount, 0);
  const totalPending = fees.filter((f) => f.status === "pending").reduce((s, f) => s + f.net_amount, 0);
  const totalOverdue = fees.filter((f) => f.status === "overdue").reduce((s, f) => s + f.net_amount, 0);

  const feeColumns = [
    { key: "student_name", header: "Student", render: (row: StudentFee) => (
      <div><p className="font-semibold text-gray-900 text-sm">{row.student_name}</p><p className="text-xs text-gray-400 font-mono">{row.student_id_display}</p></div>
    )},
    { key: "fee_structure_name", header: "Fee Type", render: (row: StudentFee) => <span className="text-sm text-gray-600">{row.fee_structure_name}</span> },
    { key: "due_date", header: "Due Date", render: (row: StudentFee) => (
      <span className={`text-sm ${row.status === "overdue" ? "text-red-600 font-semibold" : "text-gray-600"}`}>{formatDate(row.due_date)}</span>
    )},
    { key: "net_amount", header: "Amount", render: (row: StudentFee) => (
      <div>
        <p className="font-semibold text-gray-900 text-sm">{formatCurrency(row.net_amount)}</p>
        {row.discount_amount > 0 && <p className="text-xs text-green-600">Discount: {formatCurrency(row.discount_amount)}</p>}
      </div>
    )},
    { key: "status", header: "Status", render: (row: StudentFee) => (
      <Badge variant={statusBadge[row.status as keyof typeof statusBadge] || "secondary"}>
        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
      </Badge>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage fee structures and track payments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatsCard title="Total Collected" value={formatCurrency(totalCollected)} subtitle="This period" icon={CheckCircle} color="green" />
        <StatsCard title="Pending" value={formatCurrency(totalPending)} subtitle={`${fees.filter(f => f.status === "pending").length} invoices`} icon={CreditCard} color="orange" />
        <StatsCard title="Overdue" value={formatCurrency(totalOverdue)} subtitle={`${fees.filter(f => f.status === "overdue").length} invoices`} icon={AlertTriangle} color="red" />
      </div>

      <Tabs defaultValue="structures">
        <TabsList>
          <TabsTrigger value="structures">Fee Structures</TabsTrigger>
          <TabsTrigger value="invoices">Student Invoices</TabsTrigger>
        </TabsList>

        {/* ── Fee Structures Tab ──────────────────────────────────────────── */}
        <TabsContent value="structures" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button size="sm" className="gap-2 bg-black hover:bg-neutral-800 text-white" onClick={() => setCreateStructureOpen(true)}>
              <Plus className="w-4 h-4" />
              New Fee Structure
            </Button>
          </div>

          {structuresLoading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" /></div>
          ) : structures.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
              <CreditCard className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No fee structures yet</p>
              <p className="text-xs text-gray-400 mt-1">Create a structure like "Monthly Therapy Fee" then generate invoices for all students at once.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {structures.map((s) => (
                <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-gray-900">{s.name}</h3>
                      <Badge variant={s.is_active ? "success" : "secondary"}>{s.is_active ? "Active" : "Inactive"}</Badge>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{frequencyLabel[s.frequency] || s.frequency}</span>
                    </div>
                    {s.description && <p className="text-sm text-gray-500 mt-0.5">{s.description}</p>}
                    <p className="text-xs text-gray-400 mt-1">{s.academic_year_name}</p>
                  </div>
                  <div className="flex items-center gap-4 ml-6 flex-shrink-0">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(s.amount)}</p>
                    <Button size="sm" className="gap-1.5 bg-black hover:bg-neutral-800 text-white" onClick={() => { setGenerateFor(s); setGenerateDueDate(new Date().toISOString().split("T")[0]); }}>
                      <Zap className="w-3.5 h-3.5" />
                      Generate for all students
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100" onClick={() => openEditStructure(s)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteStructure(s)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Student Invoices Tab ────────────────────────────────────────── */}
        <TabsContent value="invoices" className="mt-4 space-y-4">
          <div className="flex gap-2">
            {[
              { key: "all", label: "All" },
              { key: "pending", label: "Pending" },
              { key: "paid", label: "Paid" },
              { key: "overdue", label: "Overdue" },
            ].map((f) => (
              <button key={f.key} onClick={() => setActiveFilter(f.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === f.key ? "bg-black text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
                {f.label}
                <span className="ml-2 text-xs opacity-70">
                  {f.key === "all" ? fees.length : fees.filter(x => x.status === f.key).length}
                </span>
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <DataTable
              data={filteredFees as unknown as Record<string, unknown>[]}
              columns={feeColumns as unknown as Parameters<typeof DataTable>[0]["columns"]}
              searchable={true}
              searchKeys={["student_name" as keyof Record<string, unknown>]}
              isLoading={feesLoading}
              emptyMessage="No fee records. Generate invoices from the Fee Structures tab."
              actions={(row) => (
                <div className="flex items-center gap-2 justify-end">
                  {(row as unknown as StudentFee).status !== "paid" && (
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => handleMarkPaid((row as unknown as StudentFee).id)}>
                      Mark Paid
                    </Button>
                  )}
                </div>
              )}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Structure Dialog */}
      <Dialog open={!!editStructure} onOpenChange={(v) => { if (!v) setEditStructure(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Fee Structure</DialogTitle></DialogHeader>
          <form onSubmit={handleEditStructure} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="ef-name">Name *</Label>
              <Input id="ef-name" required placeholder="e.g. Monthly Therapy Fee" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ef-amount">Amount (₹) *</Label>
                <Input id="ef-amount" type="number" min={0} required placeholder="8500" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ef-freq">Frequency</Label>
                <select id="ef-freq" value={editForm.frequency} onChange={(e) => setEditForm({ ...editForm, frequency: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="semi_annual">Semi-Annual</option>
                  <option value="annual">Annual</option>
                  <option value="one_time">One-Time</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ef-desc">Description</Label>
              <Input id="ef-desc" placeholder="Optional description" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditStructure(null)}>Cancel</Button>
              <Button type="submit" disabled={savingStructure} className="bg-black text-white hover:bg-neutral-800">
                {savingStructure ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Structure Dialog */}
      <Dialog open={createStructureOpen} onOpenChange={(v) => { setCreateStructureOpen(v); if (!v) setNewStructure({ name: "", amount: "", frequency: "monthly", description: "" }); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Fee Structure</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateStructure} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="fs-name">Name *</Label>
              <Input id="fs-name" required placeholder="e.g. Monthly Therapy Fee" value={newStructure.name} onChange={(e) => setNewStructure({ ...newStructure, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fs-amount">Amount (₹) *</Label>
                <Input id="fs-amount" type="number" min={0} required placeholder="8500" value={newStructure.amount} onChange={(e) => setNewStructure({ ...newStructure, amount: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fs-freq">Frequency</Label>
                <select id="fs-freq" value={newStructure.frequency} onChange={(e) => setNewStructure({ ...newStructure, frequency: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="semi_annual">Semi-Annual</option>
                  <option value="annual">Annual</option>
                  <option value="one_time">One-Time</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fs-desc">Description</Label>
              <Input id="fs-desc" placeholder="Optional description" value={newStructure.description} onChange={(e) => setNewStructure({ ...newStructure, description: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateStructureOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={creatingStructure} className="bg-black text-white hover:bg-neutral-800">
                {creatingStructure ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Generate Fees Dialog */}
      <Dialog open={!!generateFor} onOpenChange={(v) => { if (!v) setGenerateFor(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Generate Fee Invoices</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
              <p className="text-xs text-neutral-500 font-medium">Fee Structure</p>
              <p className="font-semibold text-gray-900 mt-0.5">{generateFor?.name}</p>
              <p className="text-sm text-gray-600">{generateFor ? formatCurrency(generateFor.amount) : ""} · {generateFor ? frequencyLabel[generateFor.frequency] : ""}</p>
            </div>
            <p className="text-sm text-gray-600">This will create one invoice for <strong>every active student</strong> with the due date below. Students who already have an invoice for this date will be skipped.</p>
            <div className="space-y-1.5">
              <Label htmlFor="gen-due">Due Date *</Label>
              <Input id="gen-due" type="date" value={generateDueDate} onChange={(e) => setGenerateDueDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setGenerateFor(null)}>Cancel</Button>
            <Button disabled={generating} onClick={handleGenerate} className="bg-black text-white hover:bg-neutral-800">
              {generating ? "Generating..." : "Generate Invoices"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Structure Dialog */}
      <Dialog open={!!deleteStructure} onOpenChange={(v) => { if (!v) setDeleteStructure(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Fee Structure</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 mt-1">Delete <strong>{deleteStructure?.name}</strong>? Existing student invoices linked to this structure will also be removed.</p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteStructure(null)}>Cancel</Button>
            <Button disabled={deletingStructure} onClick={handleDeleteStructure} className="bg-red-600 hover:bg-red-700 text-white">
              {deletingStructure ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

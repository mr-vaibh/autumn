"use client";

import { useState, useEffect } from "react";
import api, { feesApi } from "@/lib/api";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatsCard } from "@/components/shared/StatsCard";
import { CreditCard, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

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

const mockFees: StudentFee[] = [
  { id: 1, student_name: "Arjun Kumar", student_id_display: "GALS20240001", fee_structure_name: "Monthly Therapy Fee", due_date: "2024-05-01", amount: 8500, discount_amount: 0, net_amount: 8500, status: "paid" },
  { id: 2, student_name: "Hridhya Shukla", student_id_display: "GALS20240002", fee_structure_name: "Monthly Therapy Fee", due_date: "2024-05-01", amount: 8500, discount_amount: 500, net_amount: 8000, status: "pending" },
  { id: 3, student_name: "Rohan Mehta", student_id_display: "GALS20240003", fee_structure_name: "Monthly Therapy Fee", due_date: "2024-04-01", amount: 8500, discount_amount: 0, net_amount: 8500, status: "overdue" },
  { id: 4, student_name: "Sneha Patel", student_id_display: "GALS20240004", fee_structure_name: "Annual Admission Fee", due_date: "2024-04-15", amount: 25000, discount_amount: 2500, net_amount: 22500, status: "paid" },
  { id: 5, student_name: "Vikram Singh", student_id_display: "GALS20240005", fee_structure_name: "Monthly Therapy Fee", due_date: "2024-05-01", amount: 8500, discount_amount: 0, net_amount: 8500, status: "pending" },
];

const statusBadge = {
  paid: "success" as const,
  pending: "warning" as const,
  overdue: "danger" as const,
  partial: "info" as const,
  waived: "secondary" as const,
};

export default function FeesPage() {
  const [fees, setFees] = useState<StudentFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newFee, setNewFee] = useState({
    student_name: "",
    fee_structure_name: "",
    amount: 0,
    due_date: "",
    discount_amount: 0,
  });

  const fetchFees = () => {
    feesApi.getStudentFees()
      .then((res) => setFees(res.data.results || res.data))
      .catch(() => setFees(mockFees))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handleMarkPaid = async (feeId: number) => {
    setFees(prev => prev.map(f => f.id === feeId ? { ...f, status: 'paid' } : f));
    try {
      await api.patch(`/fees/student-fees/${feeId}/`, { status: 'paid' });
      toast.success('Marked as paid');
      fetchFees();
    } catch {
      toast.error('Failed to update');
      fetchFees();
    }
  };

  const filteredFees = activeFilter === "all" ? fees : fees.filter((f) => f.status === activeFilter);

  const totalCollected = fees.filter((f) => f.status === "paid").reduce((sum, f) => sum + f.net_amount, 0);
  const totalPending = fees.filter((f) => f.status === "pending").reduce((sum, f) => sum + f.net_amount, 0);
  const totalOverdue = fees.filter((f) => f.status === "overdue").reduce((sum, f) => sum + f.net_amount, 0);

  const columns = [
    {
      key: "student_name",
      header: "Student",
      render: (row: StudentFee) => (
        <div>
          <p className="font-semibold text-gray-900 text-sm">{row.student_name}</p>
          <p className="text-xs text-gray-400 font-mono">{row.student_id_display}</p>
        </div>
      ),
    },
    {
      key: "fee_structure_name",
      header: "Fee Type",
      render: (row: StudentFee) => <span className="text-sm text-gray-600">{row.fee_structure_name}</span>,
    },
    {
      key: "due_date",
      header: "Due Date",
      render: (row: StudentFee) => (
        <span className={`text-sm ${row.status === "overdue" ? "text-red-600 font-semibold" : "text-gray-600"}`}>
          {formatDate(row.due_date)}
        </span>
      ),
    },
    {
      key: "net_amount",
      header: "Amount",
      render: (row: StudentFee) => (
        <div>
          <p className="font-semibold text-gray-900 text-sm">{formatCurrency(row.net_amount)}</p>
          {row.discount_amount > 0 && (
            <p className="text-xs text-green-600">Discount: {formatCurrency(row.discount_amount)}</p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: StudentFee) => (
        <Badge variant={statusBadge[row.status as keyof typeof statusBadge] || "secondary"}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track payments and outstanding dues</p>
        </div>
        <Button size="sm" className="gap-2 bg-black hover:bg-neutral-800 text-white" onClick={() => setDialogOpen(true)}>
          <CreditCard className="w-4 h-4" />
          Create Fee Record
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Fee Record</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const netAmount = newFee.amount - newFee.discount_amount;
              const record: StudentFee = {
                id: Date.now(),
                student_name: newFee.student_name,
                student_id_display: `GALS${Date.now()}`,
                fee_structure_name: newFee.fee_structure_name,
                due_date: newFee.due_date,
                amount: newFee.amount,
                discount_amount: newFee.discount_amount,
                net_amount: netAmount,
                status: "pending",
              };
              setFees((prev) => [record, ...prev]);
              toast.success("Fee record created");
              setDialogOpen(false);
              setNewFee({ student_name: "", fee_structure_name: "", amount: 0, due_date: "", discount_amount: 0 });
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="student_name">Student Name</Label>
              <Input id="student_name" required value={newFee.student_name} onChange={(e) => setNewFee({ ...newFee, student_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fee_structure_name">Fee Structure Name</Label>
              <Input id="fee_structure_name" required value={newFee.fee_structure_name} onChange={(e) => setNewFee({ ...newFee, fee_structure_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" required min={0} value={newFee.amount} onChange={(e) => setNewFee({ ...newFee, amount: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input id="due_date" type="date" required value={newFee.due_date} onChange={(e) => setNewFee({ ...newFee, due_date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount_amount">Discount Amount</Label>
              <Input id="discount_amount" type="number" min={0} value={newFee.discount_amount} onChange={(e) => setNewFee({ ...newFee, discount_amount: Number(e.target.value) })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-black text-white hover:bg-neutral-800">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatsCard
          title="Total Collected"
          value={formatCurrency(totalCollected)}
          subtitle="This period"
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Pending Amount"
          value={formatCurrency(totalPending)}
          subtitle={`${fees.filter((f) => f.status === "pending").length} invoices`}
          icon={CreditCard}
          color="orange"
        />
        <StatsCard
          title="Overdue Amount"
          value={formatCurrency(totalOverdue)}
          subtitle={`${fees.filter((f) => f.status === "overdue").length} invoices`}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { key: "all", label: "All" },
          { key: "pending", label: "Pending" },
          { key: "paid", label: "Paid" },
          { key: "overdue", label: "Overdue" },
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeFilter === filter.key
                ? "bg-black text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {filter.label}
            <span className="ml-2 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
              {filter.key === "all" ? fees.length : fees.filter((f) => f.status === filter.key).length}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <DataTable
          data={filteredFees as unknown as Record<string, unknown>[]}
          columns={columns as Parameters<typeof DataTable>[0]["columns"]}
          searchable={true}
          searchKeys={["student_name" as keyof Record<string, unknown>]}
          isLoading={loading}
          emptyMessage="No fee records found"
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
    </div>
  );
}

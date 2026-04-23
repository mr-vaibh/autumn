"use client";

import { useState, useEffect } from "react";
import { feesApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

interface StudentFee {
  id: number;
  fee_structure_name: string;
  due_date: string;
  amount: number;
  discount_amount: number;
  net_amount: number;
  status: string;
}

const mockFees: StudentFee[] = [
  { id: 1, fee_structure_name: "Monthly Therapy Fee - May 2024", due_date: "2024-06-01", amount: 8500, discount_amount: 0, net_amount: 8500, status: "pending" },
  { id: 2, fee_structure_name: "Monthly Therapy Fee - Apr 2024", due_date: "2024-05-01", amount: 8500, discount_amount: 0, net_amount: 8500, status: "paid" },
  { id: 3, fee_structure_name: "Monthly Therapy Fee - Mar 2024", due_date: "2024-04-01", amount: 8500, discount_amount: 500, net_amount: 8000, status: "paid" },
  { id: 4, fee_structure_name: "Annual Admission Fee 2024-25", due_date: "2024-04-15", amount: 25000, discount_amount: 2500, net_amount: 22500, status: "paid" },
  { id: 5, fee_structure_name: "Monthly Therapy Fee - Feb 2024", due_date: "2024-03-01", amount: 8500, discount_amount: 0, net_amount: 8500, status: "overdue" },
];

export default function ParentFeesPage() {
  const [fees, setFees] = useState<StudentFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);

  useEffect(() => {
    feesApi.getStudentFees()
      .then((res) => setFees(res.data.results || res.data))
      .catch(() => setFees(mockFees))
      .finally(() => setLoading(false));
  }, []);

  const handlePayment = async (fee: StudentFee) => {
    setPayingId(fee.id);
    try {
      const orderRes = await feesApi.createOrder(fee.id);
      const { order_id, amount, key_id } = orderRes.data;

      const options = {
        key: key_id,
        amount: amount,
        currency: "INR",
        name: "Global Autism Learning School",
        description: fee.fee_structure_name,
        order_id: order_id,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          await feesApi.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          toast.success("Payment successful!");
          setFees((prev) =>
            prev.map((f) => f.id === fee.id ? { ...f, status: "paid" } : f)
          );
        },
        prefill: {
          name: "Parent Name",
        },
        theme: {
          color: "#7C3AED",
        },
      };

      if (typeof window !== "undefined" && (window as unknown as { Razorpay?: new (options: unknown) => { open: () => void } }).Razorpay) {
        const rzp = new ((window as unknown as { Razorpay: new (options: unknown) => { open: () => void } }).Razorpay)(options);
        rzp.open();
      } else {
        toast.error("Payment gateway not available. Please try again.");
      }
    } catch {
      toast.error("Payment initialization failed. Please try again.");
    } finally {
      setPayingId(null);
    }
  };

  const totalPending = fees.filter((f) => f.status === "pending").reduce((sum, f) => sum + f.net_amount, 0);
  const totalPaid = fees.filter((f) => f.status === "paid").reduce((sum, f) => sum + f.net_amount, 0);

  const statusConfig: Record<string, { icon: React.ElementType; color: string; badgeVariant: "success" | "warning" | "danger" | "secondary" }> = {
    paid: { icon: CheckCircle, color: "text-green-600", badgeVariant: "success" },
    pending: { icon: Clock, color: "text-yellow-600", badgeVariant: "warning" },
    overdue: { icon: AlertTriangle, color: "text-red-600", badgeVariant: "danger" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fee Payments</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage and pay your child&apos;s fees online</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
          <p className="text-sm font-medium text-yellow-700">Pending Amount</p>
          <p className="text-3xl font-bold text-yellow-800 mt-1">{formatCurrency(totalPending)}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-5 border border-green-100">
          <p className="text-sm font-medium text-green-700">Total Paid (This Year)</p>
          <p className="text-3xl font-bold text-green-800 mt-1">{formatCurrency(totalPaid)}</p>
        </div>
      </div>

      {/* Fee List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {fees.map((fee) => {
            const config = statusConfig[fee.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            return (
              <div key={fee.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <StatusIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.color}`} />
                  <div>
                    <p className="font-semibold text-gray-900">{fee.fee_structure_name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Due: {formatDate(fee.due_date)}
                      {fee.discount_amount > 0 && (
                        <span className="ml-2 text-green-600 text-xs">Discount: {formatCurrency(fee.discount_amount)}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-lg">{formatCurrency(fee.net_amount)}</p>
                    <Badge variant={config.badgeVariant}>
                      {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                    </Badge>
                  </div>
                  {(fee.status === "pending" || fee.status === "overdue") && (
                    <Button
                      onClick={() => handlePayment(fee)}
                      disabled={payingId === fee.id}
                      className="bg-purple-600 hover:bg-purple-700 gap-2"
                      size="sm"
                    >
                      {payingId === fee.id ? (
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <CreditCard className="w-4 h-4" />
                      )}
                      Pay Now
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

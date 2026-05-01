"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Utensils } from "lucide-react";

interface DietPlan {
  id: number;
  title: string;
  student_name?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
}

export default function DietPage() {
  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/diet/plans/')
      .then(res => setPlans(res.data.results || res.data))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Diet & Nutrition</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage student diet plans and detox schedules</p>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Utensils className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No diet plans yet</p>
          <p className="text-xs text-gray-400 mt-1">Diet plans will appear here once created by a dietician</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {plans.map(plan => (
            <div key={plan.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{plan.title}</h3>
                  {plan.student_name && <p className="text-sm text-gray-500 mt-0.5">Student: {plan.student_name}</p>}
                  {plan.notes && <p className="text-sm text-gray-600 mt-2">{plan.notes}</p>}
                </div>
                <Badge variant={plan.is_active ? "success" : "secondary"}>
                  {plan.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Wheat,
  Pill,
  AlertTriangle,
  Clock,
  TrendingUp,
  BarChart2,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  Loader2,
} from "lucide-react";
import { DashboardData, ITransaction } from "@/types";
import CategoryBadge from "@/components/CategoryBadge";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  sub: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className={`bg-white rounded-xl border-l-4 ${color} p-5 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{sub}</p>
        </div>
        <div className={`p-2 rounded-lg bg-gray-50`}>
          <Icon className="w-6 h-6 text-gray-400" />
        </div>
      </div>
    </div>
  );
}

function TransactionTypeBadge({ type }: { type: "IN" | "OUT" }) {
  return type === "IN" ? (
    <span className="inline-flex items-center gap-1 text-green-600 font-semibold text-sm">
      <TrendingUpIcon className="w-4 h-4" />
      In
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-red-500 font-semibold text-sm">
      <TrendingDown className="w-4 h-4" />
      Out
    </span>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setData(res.data);
        else setError(res.error);
      })
      .catch(() => setError("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <p className="font-semibold">Error loading dashboard</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      label: "Ration Items",
      value: data.rationCount,
      sub: `${data.rationUnits} units total`,
      icon: Wheat,
      color: "border-green-500",
    },
    {
      label: "Medicine Items",
      value: data.medicineCount,
      sub: `${data.medicineUnits} units total`,
      icon: Pill,
      color: "border-blue-500",
    },
    {
      label: "Low Stock Alerts",
      value: data.lowStockCount,
      sub: "Items below threshold",
      icon: AlertTriangle,
      color: "border-orange-500",
    },
    {
      label: "Near Expiry",
      value: data.nearExpiryCount,
      sub: "Within 30 days",
      icon: Clock,
      color: "border-red-500",
    },
    {
      label: "Last 7 Days",
      value: data.last7DaysCount,
      sub: "transactions",
      icon: TrendingUp,
      color: "border-purple-500",
    },
    {
      label: "Last 30 Days",
      value: data.last30DaysCount,
      sub: "transactions",
      icon: BarChart2,
      color: "border-teal-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart2 className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Active Alerts */}
      {data.alerts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-800">Active Alerts</h2>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
            {data.alerts.map((alert, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
                  alert.type === "near_expiry"
                    ? "text-orange-700"
                    : "text-amber-700"
                }`}
              >
                {alert.type === "near_expiry" ? (
                  <Clock className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span
                  dangerouslySetInnerHTML={{
                    __html: alert.message.replace(
                      /^(\S+)/,
                      "<strong>$1</strong>"
                    ),
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Item</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Qty</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      No transactions yet
                    </td>
                  </tr>
                ) : (
                  data.recentTransactions.map((txn) => {
                    const item = txn.item as ITransaction["item"] & {
                      name: string;
                      category: string;
                      unit: string;
                    };
                    return (
                      <tr key={txn._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(txn.date).toISOString().split("T")[0]}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {typeof item === "object" ? item.name : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {typeof item === "object" && (
                            <CategoryBadge
                              category={item.category as "Ration" | "Medicine"}
                              size="sm"
                            />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <TransactionTypeBadge type={txn.type} />
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-700">
                          {txn.quantity}{" "}
                          {typeof item === "object" ? item.unit : ""}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{txn.notes || "—"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

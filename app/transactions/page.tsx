"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react";
import { ITransaction, IItem } from "@/types";
import CategoryBadge from "@/components/CategoryBadge";

function TransactionTypeBadge({ type }: { type: "IN" | "OUT" }) {
  return type === "IN" ? (
    <span className="inline-flex items-center gap-1.5 text-green-600 font-semibold text-sm">
      <TrendingUp className="w-4 h-4" />
      Incoming
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-red-500 font-semibold text-sm">
      <TrendingDown className="w-4 h-4" />
      Outgoing
    </span>
  );
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "All") params.set("type", typeFilter);
      if (categoryFilter !== "All") params.set("category", categoryFilter);
      const res = await fetch(`/api/transactions?${params.toString()}`);
      const data = await res.json();
      if (data.success) setTransactions(data.data);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, categoryFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const totalIn = transactions.filter((t) => t.type === "IN").length;
  const totalOut = transactions.filter((t) => t.type === "OUT").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ArrowLeftRight className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">Transaction History</h1>
      </div>

      {/* Totals */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold">
          <TrendingUp className="w-4 h-4" />
          Total In: {totalIn}
        </div>
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold">
          <TrendingDown className="w-4 h-4" />
          Total Out: {totalOut}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Types</option>
          <option value="IN">Incoming</option>
          <option value="OUT">Outgoing</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Categories</option>
          <option value="Ration">Ration</option>
          <option value="Medicine">Medicine</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">#</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Date</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Item</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Category</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Type</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Quantity</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn, index) => {
                    const item = txn.item as IItem & { name: string; category: string; unit: string };
                    return (
                      <tr key={txn._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">
                          {transactions.length - index}
                        </td>
                        <td className="px-5 py-3.5 text-gray-600">
                          {new Date(txn.date).toISOString().split("T")[0]}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-gray-800">
                          {typeof item === "object" ? item.name : "Unknown"}
                        </td>
                        <td className="px-5 py-3.5">
                          {typeof item === "object" && (
                            <CategoryBadge
                              category={item.category as "Ration" | "Medicine"}
                              size="sm"
                            />
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <TransactionTypeBadge type={txn.type} />
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-gray-800">{txn.quantity}</span>
                          <span className="text-gray-500 ml-1">
                            {typeof item === "object" ? item.unit : ""}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500">{txn.notes || "—"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

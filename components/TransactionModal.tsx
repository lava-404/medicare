"use client";

import { useState } from "react";
import Modal from "./Modal";
import { IItem, ITransaction } from "@/types";

interface TransactionModalProps {
  onClose: () => void;
  onSaved: (txn: ITransaction) => void;
  items: IItem[];
  defaultType?: "IN" | "OUT";
  preselectedItem?: IItem | null;
}

export default function TransactionModal({
  onClose,
  onSaved,
  items,
  defaultType = "IN",
  preselectedItem,
}: TransactionModalProps) {
  const [form, setForm] = useState({
    itemId: preselectedItem?._id ?? (items[0]?._id ?? ""),
    type: defaultType,
    quantity: "1",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedItem = items.find((i) => i._id === form.itemId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: form.itemId,
          type: form.type,
          quantity: Number(form.quantity),
          date: form.date,
          notes: form.notes.trim(),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to save transaction");
      onSaved(data.data);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const title = defaultType === "IN" ? "Add Stock" : "Distribute / Use Stock";

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "IN" })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                form.type === "IN"
                  ? "bg-green-600 text-white border-green-600"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              ↑ Incoming
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "OUT" })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                form.type === "OUT"
                  ? "bg-red-500 text-white border-red-500"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              ↓ Outgoing
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Item *</label>
          <select
            required
            value={form.itemId}
            onChange={(e) => setForm({ ...form, itemId: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {items.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name} ({item.category}) — {item.currentStock} {item.unit} in stock
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity{selectedItem ? ` (${selectedItem.unit})` : ""} *
          </label>
          <input
            type="number"
            required
            min="1"
            max={form.type === "OUT" && selectedItem ? selectedItem.currentStock : undefined}
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {form.type === "OUT" && selectedItem && (
            <p className="text-xs text-gray-400 mt-1">
              Available: {selectedItem.currentStock} {selectedItem.unit}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <input
            type="text"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="e.g. Monthly ration stock, Given to residents..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
              form.type === "IN"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {loading ? "Saving..." : form.type === "IN" ? "Add Stock" : "Distribute"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

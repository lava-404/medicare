"use client";

import { useState } from "react";
import Modal from "./Modal";
import { Category, IItem } from "@/types";

interface AddItemModalProps {
  onClose: () => void;
  onSaved: (item: IItem) => void;
  editItem?: IItem | null;
}

const UNITS = ["kg", "g", "litre", "ml", "strips", "bottles", "packets", "pieces", "boxes"];

export default function AddItemModal({ onClose, onSaved, editItem }: AddItemModalProps) {
  const [form, setForm] = useState({
    name: editItem?.name ?? "",
    category: editItem?.category ?? "Ration",
    currentStock: editItem?.currentStock?.toString() ?? "0",
    unit: editItem?.unit ?? "kg",
    threshold: editItem?.threshold?.toString() ?? "0",
    expiryDate: editItem?.expiryDate
      ? new Date(editItem.expiryDate).toISOString().split("T")[0]
      : "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      category: form.category,
      currentStock: Number(form.currentStock),
      unit: form.unit,
      threshold: Number(form.threshold),
      expiryDate: form.expiryDate || null,
    };

    try {
      const url = editItem ? `/api/items/${editItem._id}` : "/api/items";
      const method = editItem ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to save item");
      onSaved(data.data);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={editItem ? "Edit Item" : "Add New Item"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Rice"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Ration">Ration</option>
            <option value="Medicine">Medicine</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Stock *
            </label>
            <input
              type="number"
              required
              min="0"
              value={form.currentStock}
              onChange={(e) => setForm({ ...form, currentStock: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
            <select
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Threshold (Low Stock Alert) *
          </label>
          <input
            type="number"
            required
            min="0"
            value={form.threshold}
            onChange={(e) => setForm({ ...form, threshold: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {(form.category === "Medicine" || editItem?.category === "Medicine") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

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
            className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : editItem ? "Update Item" : "Add Item"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

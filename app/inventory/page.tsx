"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Package,
  Plus,
  TrendingUp,
  TrendingDown,
  Download,
  Search,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { IItem, Category, ItemStatus } from "@/types";
import CategoryBadge from "@/components/CategoryBadge";
import StatusBadge from "@/components/StatusBadge";
import AddItemModal from "@/components/AddItemModal";
import TransactionModal from "@/components/TransactionModal";
import ConfirmDialog from "@/components/ConfirmDialog";

function getItemStatus(item: IItem): ItemStatus {
  const now = new Date();
  if (item.expiryDate) {
    const expiry = new Date(item.expiryDate);
    if (expiry < now) return "Expired";
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 30) return "Near Expiry";
  }
  if (item.currentStock < item.threshold) return "Low Stock";
  return "OK";
}

function getExpiryDisplay(item: IItem): React.ReactNode {
  if (!item.expiryDate) return <span className="text-gray-400">—</span>;
  const now = new Date();
  const expiry = new Date(item.expiryDate);
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const dateStr = expiry.toISOString().split("T")[0];

  if (daysLeft <= 0) {
    return <span className="text-red-600 font-medium">{dateStr} (Expired)</span>;
  }
  if (daysLeft <= 30) {
    return (
      <span className="text-orange-500 font-medium">
        {dateStr} ({daysLeft}d left)
      </span>
    );
  }
  return (
    <span className="text-gray-600">
      {dateStr} ({daysLeft}d left)
    </span>
  );
}

export default function InventoryPage() {
  const [items, setItems] = useState<IItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<IItem | null>(null);
  const [showAddStock, setShowAddStock] = useState(false);
  const [showDistribute, setShowDistribute] = useState(false);
  const [deleteItem, setDeleteItem] = useState<IItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/items?category=${categoryFilter}`);
      const data = await res.json();
      if (data.success) setItems(data.data);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    window.open("/api/items/export", "_blank");
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/items/${deleteItem._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((i) => i._id !== deleteItem._id));
        setDeleteItem(null);
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
          <button
            onClick={() => setShowAddStock(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            Add Stock
          </button>
          <button
            onClick={() => setShowDistribute(true)}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
          >
            <TrendingDown className="w-4 h-4" />
            Distribute
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Item Name</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Category</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Current Stock</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Threshold</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Expiry Date</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      {search ? "No items match your search" : "No items yet. Add your first item!"}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const status = getItemStatus(item);
                    return (
                      <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-gray-800">{item.name}</td>
                        <td className="px-5 py-3.5">
                          <CategoryBadge category={item.category as Category} />
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-gray-800">{item.currentStock}</span>
                          <span className="text-gray-500 ml-1">{item.unit}</span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500">
                          {item.threshold} {item.unit}
                        </td>
                        <td className="px-5 py-3.5">{getExpiryDisplay(item)}</td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={status} />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditItem(item)}
                              className="flex items-center gap-1.5 border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteItem(item)}
                              className="flex items-center gap-1.5 border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {(showAddModal || editItem) && (
        <AddItemModal
          editItem={editItem}
          onClose={() => {
            setShowAddModal(false);
            setEditItem(null);
          }}
          onSaved={() => {
            setShowAddModal(false);
            setEditItem(null);
            fetchItems();
          }}
        />
      )}

      {showAddStock && (
        <TransactionModal
          items={items}
          defaultType="IN"
          onClose={() => setShowAddStock(false)}
          onSaved={() => {
            setShowAddStock(false);
            fetchItems();
          }}
        />
      )}

      {showDistribute && (
        <TransactionModal
          items={items}
          defaultType="OUT"
          onClose={() => setShowDistribute(false)}
          onSaved={() => {
            setShowDistribute(false);
            fetchItems();
          }}
        />
      )}

      {deleteItem && (
        <ConfirmDialog
          title="Delete Item"
          message={`Are you sure you want to delete "${deleteItem.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteItem(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}

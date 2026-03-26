export type Category = "Ration" | "Medicine";
export type TransactionType = "IN" | "OUT";

export interface IItem {
  _id: string;
  name: string;
  category: Category;
  currentStock: number;
  unit: string;
  threshold: number;
  expiryDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ITransaction {
  _id: string;
  item: IItem | string;
  type: TransactionType;
  quantity: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface DashboardData {
  rationCount: number;
  medicineCount: number;
  rationUnits: number;
  medicineUnits: number;
  lowStockCount: number;
  nearExpiryCount: number;
  last7DaysCount: number;
  last30DaysCount: number;
  alerts: Alert[];
  recentTransactions: ITransaction[];
}

export interface Alert {
  type: "low_stock" | "near_expiry";
  item: string;
  message: string;
  severity: "warning" | "danger";
}

export type ItemStatus = "OK" | "Low Stock" | "Near Expiry" | "Expired";

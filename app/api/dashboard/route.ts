import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Item from "@/models/Item";
import Transaction from "@/models/Transaction";
import { Alert } from "@/types";

export async function GET() {
  try {
    await connectDB();

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch all items
    const items = await Item.find({}).lean();

    // Category counts
    const rationItems = items.filter((i) => i.category === "Ration");
    const medicineItems = items.filter((i) => i.category === "Medicine");

    const rationUnits = rationItems.reduce((sum, i) => sum + i.currentStock, 0);
    const medicineUnits = medicineItems.reduce((sum, i) => sum + i.currentStock, 0);

    // Alerts
    const alerts: Alert[] = [];
    let lowStockCount = 0;
    let nearExpiryCount = 0;

    for (const item of items) {
      // Low stock alert
      if (item.currentStock < item.threshold) {
        lowStockCount++;
        alerts.push({
          type: "low_stock",
          item: item.name,
          message: `${item.name} is low — only ${item.currentStock} ${item.unit} left (threshold: ${item.threshold} ${item.unit})`,
          severity: "warning",
        });
      }

      // Near expiry alert (only for medicines with expiry dates)
      if (item.expiryDate) {
        const expiry = new Date(item.expiryDate);
        if (expiry <= thirtyDaysFromNow && expiry >= now) {
          nearExpiryCount++;
          const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          alerts.push({
            type: "near_expiry",
            item: item.name,
            message: `${item.name} expires in ${daysLeft} days (${expiry.toISOString().split("T")[0]})`,
            severity: daysLeft <= 14 ? "danger" : "warning",
          });
        }
      }
    }

    // Transaction counts
    const [last7DaysCount, last30DaysCount] = await Promise.all([
      Transaction.countDocuments({ date: { $gte: sevenDaysAgo } }),
      Transaction.countDocuments({ date: { $gte: thirtyDaysAgo } }),
    ]);

    // Recent transactions
    const recentTransactions = await Transaction.find({})
      .populate("item")
      .sort({ date: -1, createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        rationCount: rationItems.length,
        medicineCount: medicineItems.length,
        rationUnits,
        medicineUnits,
        lowStockCount,
        nearExpiryCount,
        last7DaysCount,
        last30DaysCount,
        alerts,
        recentTransactions,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

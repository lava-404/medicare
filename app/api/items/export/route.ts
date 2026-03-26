import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Item from "@/models/Item";

export async function GET() {
  try {
    await connectDB();
    const items = await Item.find({}).lean();

    const now = new Date();

    const headers = ["Item Name", "Category", "Current Stock", "Unit", "Threshold", "Expiry Date", "Status"];

    const rows = items.map((item) => {
      let status = "OK";
      if (item.currentStock < item.threshold) {
        status = "Low Stock";
      }
      if (item.expiryDate) {
        const expiry = new Date(item.expiryDate);
        const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 0) status = "Expired";
        else if (daysLeft <= 30) status = "Near Expiry";
      }

      return [
        item.name,
        item.category,
        item.currentStock,
        item.unit,
        item.threshold,
        item.expiryDate ? new Date(item.expiryDate).toISOString().split("T")[0] : "—",
        status,
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="inventory-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("GET /api/items/export error:", error);
    return NextResponse.json({ success: false, error: "Failed to export" }, { status: 500 });
  }
}

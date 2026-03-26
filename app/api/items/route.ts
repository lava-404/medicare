import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Item from "@/models/Item";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const query = category && category !== "All" ? { category } : {};
    const items = await Item.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error("GET /api/items error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const { name, category, currentStock, unit, threshold, expiryDate } = body;

    if (!name || !category || currentStock === undefined || !unit || threshold === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const item = new Item({
      name,
      category,
      currentStock: Number(currentStock),
      unit,
      threshold: Number(threshold),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    });

    await item.save();
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    console.error("POST /api/items error:", error);
    return NextResponse.json({ success: false, error: "Failed to create item" }, { status: 500 });
  }
}

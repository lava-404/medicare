import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Transaction from "@/models/Transaction";
import Item from "@/models/Item";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};
    if (type && type !== "All") query.type = type;

    let transactions = await Transaction.find(query)
      .populate("item")
      .sort({ date: -1, createdAt: -1 })
      .lean();

    // Filter by category after population
    if (category && category !== "All") {
      transactions = transactions.filter((t) => {
        const item = t.item as { category?: string };
        return item?.category === category;
      });
    }

    return NextResponse.json({ success: true, data: transactions });
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const { itemId, type, quantity, date, notes } = body;

    if (!itemId || !type || !quantity) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: itemId, type, quantity" },
        { status: 400 }
      );
    }

    // Find the item
    const item = await Item.findById(itemId);
    if (!item) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
    }

    const qty = Number(quantity);

    // Validate for OUT transactions
    if (type === "OUT" && item.currentStock < qty) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient stock. Current stock: ${item.currentStock} ${item.unit}`,
        },
        { status: 400 }
      );
    }

    // Update stock
    if (type === "IN") {
      item.currentStock += qty;
    } else {
      item.currentStock -= qty;
    }
    await item.save();

    // Create transaction
    const transaction = new Transaction({
      item: itemId,
      type,
      quantity: qty,
      date: date ? new Date(date) : new Date(),
      notes: notes || "",
    });
    await transaction.save();

    const populated = await Transaction.findById(transaction._id).populate("item").lean();

    return NextResponse.json({ success: true, data: populated }, { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}

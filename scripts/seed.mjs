/**
 * Seed script: node scripts/seed.mjs
 * Populates the DB with sample data from the screenshots
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/vishranti_inventory";

const ItemSchema = new mongoose.Schema(
  {
    name: String,
    category: String,
    currentStock: Number,
    unit: String,
    threshold: Number,
    expiryDate: Date,
  },
  { timestamps: true }
);

const TransactionSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
    type: String,
    quantity: Number,
    date: Date,
    notes: String,
  },
  { timestamps: true }
);

const Item = mongoose.models.Item || mongoose.model("Item", ItemSchema);
const Transaction =
  mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  // Clear existing data
  await Item.deleteMany({});
  await Transaction.deleteMany({});
  console.log("Cleared existing data");

  const now = new Date("2026-02-20");

  // Items
  const items = await Item.insertMany([
    { name: "Rice", category: "Ration", currentStock: 45, unit: "kg", threshold: 20 },
    { name: "Wheat Flour", category: "Ration", currentStock: 8, unit: "kg", threshold: 15 },
    { name: "Toor Dal", category: "Ration", currentStock: 12, unit: "kg", threshold: 10 },
    { name: "Sugar", category: "Ration", currentStock: 5, unit: "kg", threshold: 10 },
    { name: "Cooking Oil", category: "Ration", currentStock: 18, unit: "litre", threshold: 10 },
    {
      name: "Paracetamol",
      category: "Medicine",
      currentStock: 30,
      unit: "strips",
      threshold: 20,
      expiryDate: new Date("2026-03-10"),
    },
    {
      name: "Antacid Syrup",
      category: "Medicine",
      currentStock: 4,
      unit: "bottles",
      threshold: 5,
      expiryDate: new Date("2026-04-21"),
    },
    {
      name: "BP Tablets",
      category: "Medicine",
      currentStock: 50,
      unit: "strips",
      threshold: 15,
      expiryDate: new Date("2026-05-21"),
    },
    {
      name: "Vitamin B12",
      category: "Medicine",
      currentStock: 10,
      unit: "strips",
      threshold: 12,
      expiryDate: new Date("2026-03-17"),
    },
    {
      name: "ORS Sachets",
      category: "Medicine",
      currentStock: 60,
      unit: "packets",
      threshold: 20,
      expiryDate: new Date("2026-06-20"),
    },
  ]);

  const itemMap = {};
  for (const item of items) {
    itemMap[item.name] = item._id;
  }

  // Transactions
  await Transaction.insertMany([
    {
      item: itemMap["Rice"],
      type: "IN",
      quantity: 50,
      date: new Date("2026-02-10"),
      notes: "Monthly ration stock",
    },
    {
      item: itemMap["Rice"],
      type: "OUT",
      quantity: 5,
      date: new Date("2026-02-12"),
      notes: "Distributed to residents",
    },
    {
      item: itemMap["Wheat Flour"],
      type: "IN",
      quantity: 20,
      date: new Date("2026-02-11"),
      notes: "Purchased from store",
    },
    {
      item: itemMap["Wheat Flour"],
      type: "OUT",
      quantity: 12,
      date: new Date("2026-02-17"),
      notes: "Weekly distribution",
    },
    {
      item: itemMap["Sugar"],
      type: "IN",
      quantity: 10,
      date: new Date("2026-02-13"),
      notes: "Donated by trustee",
    },
    {
      item: itemMap["Sugar"],
      type: "OUT",
      quantity: 5,
      date: new Date("2026-02-18"),
      notes: "Kitchen use",
    },
    {
      item: itemMap["Paracetamol"],
      type: "IN",
      quantity: 40,
      date: new Date("2026-02-05"),
      notes: "Medical store purchase",
    },
    {
      item: itemMap["Paracetamol"],
      type: "OUT",
      quantity: 10,
      date: new Date("2026-02-16"),
      notes: "Dr. visit distribution",
    },
    {
      item: itemMap["Antacid Syrup"],
      type: "OUT",
      quantity: 2,
      date: new Date("2026-02-19"),
      notes: "Given to residents",
    },
    {
      item: itemMap["Vitamin B12"],
      type: "IN",
      quantity: 10,
      date: new Date("2026-02-15"),
      notes: "Monthly medicine stock",
    },
  ]);

  console.log("✅ Seed complete! Inserted", items.length, "items and 10 transactions.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

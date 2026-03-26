import mongoose, { Schema, Document, Model } from "mongoose";

export interface ItemDocument extends Document {
  name: string;
  category: "Ration" | "Medicine";
  currentStock: number;
  unit: string;
  threshold: number;
  expiryDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<ItemDocument>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: ["Ration", "Medicine"], required: true },
    currentStock: { type: Number, required: true, min: 0, default: 0 },
    unit: { type: String, required: true, trim: true },
    threshold: { type: Number, required: true, min: 0, default: 0 },
    expiryDate: { type: Date, default: null },
  },
  { timestamps: true }
);

const Item: Model<ItemDocument> =
  mongoose.models.Item || mongoose.model<ItemDocument>("Item", ItemSchema);

export default Item;

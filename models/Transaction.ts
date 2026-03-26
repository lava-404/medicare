import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface TransactionDocument extends Document {
  item: Types.ObjectId;
  type: "IN" | "OUT";
  quantity: number;
  date: Date;
  notes?: string;
  createdAt: Date;
}

const TransactionSchema = new Schema<TransactionDocument>(
  {
    item: { type: Schema.Types.ObjectId, ref: "Item", required: true },
    type: { type: String, enum: ["IN", "OUT"], required: true },
    quantity: { type: Number, required: true, min: 1 },
    date: { type: Date, required: true, default: Date.now },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

const Transaction: Model<TransactionDocument> =
  mongoose.models.Transaction ||
  mongoose.model<TransactionDocument>("Transaction", TransactionSchema);

export default Transaction;

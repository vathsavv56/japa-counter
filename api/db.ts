import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

let cached: typeof mongoose | null = null;

export async function connectDB() {
  if (cached) return cached;
  if (!MONGODB_URI) throw new Error("MONGODB_URI env variable is not set");
  cached = await mongoose.connect(MONGODB_URI, { dbName: "japam-count" });
  return cached;
}

const dailyCountSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  count: { type: Number, required: true },
});

export const DailyCount =
  mongoose.models.DailyCount || mongoose.model("DailyCount", dailyCountSchema);

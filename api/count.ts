import type { VercelRequest, VercelResponse } from "@vercel/node";
import { connectDB, DailyCount } from "./db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();

  // POST — save/update daily count
  if (req.method === "POST") {
    const { date, count } = req.body;
    if (!date || typeof count !== "number") {
      return res.status(400).json({ error: "Invalid data" });
    }
    const doc = await DailyCount.findOneAndUpdate(
      { date },
      { $set: { count } },
      { upsert: true, new: true }
    );
    return res.status(200).json(doc);
  }

  // GET — get count for a specific date
  if (req.method === "GET") {
    const date = req.query.date as string;
    if (!date) {
      return res.status(400).json({ error: "Missing date query param" });
    }
    const doc = await DailyCount.findOne({ date });
    return res.status(200).json({ count: doc?.count || 0 });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { connectDB, DailyCount } from "./db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await connectDB();
  const docs = await DailyCount.find();
  const total = docs.reduce((sum: number, d: { count: number }) => sum + d.count, 0);
  return res.status(200).json({ total });
}

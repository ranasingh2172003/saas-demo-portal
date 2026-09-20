import { NextResponse } from "next/server";
import fs from "fs";

const DB_FILE = "/workspaces/saas-demo-portal/backend/db.json";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const section = searchParams.get("section");
  try {
    if (!fs.existsSync(DB_FILE)) return NextResponse.json({ data: null });
    const db = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    return NextResponse.json({ data: section ? (db[section] ?? null) : db });
  } catch (e) {
    return NextResponse.json({ data: null });
  }
}

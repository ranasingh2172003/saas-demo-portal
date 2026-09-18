import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await fetch(`${backendUrl}/api/agents`);

    if (!res.ok) throw new Error("Failed to fetch from backend");

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    // Return empty array gracefully when backend is down (dev environment)
    console.warn("Agents backend unreachable:", error);
    return NextResponse.json([]);
  }
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Forward the request to the real backend running on port 3000
    const response = await fetch("http://127.0.0.1:3000/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy send error:", error);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}

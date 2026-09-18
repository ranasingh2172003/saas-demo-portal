import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get("text");
    const voice = searchParams.get("voice") || "af_alloy";
    
    if (!text) return NextResponse.json({ error: "Missing text" }, { status: 400 });

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    
    // We send a POST to the backend with the extracted query params
    const res = await fetch(`${backendUrl}/api/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice })
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: "TTS failed on backend" }, { status: res.status });
    }
    
    // Stream the response directly to the client as audio
    return new NextResponse(res.body, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Transfer-Encoding": "chunked"
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

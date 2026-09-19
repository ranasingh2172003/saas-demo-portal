import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Coqui XTTS running locally in the Codespace
    const ttsUrl = process.env.TTS_URL || "http://localhost:8881/tts_to_audio/";
    
    const res = await fetch(ttsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        text: text,
        speaker_wav: "default",
        language: "en" 
      })
    });
    
    if (!res.ok) {
      const errText = await res.text();
      console.error("TTS Server Error:", errText);
      return NextResponse.json({ error: `Local TTS failed: ${res.status}` }, { status: res.status });
    }
    
    const audioBuffer = await res.arrayBuffer();
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav"
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

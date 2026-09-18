import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    
    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const groqFormData = new FormData();
    groqFormData.append("file", file);
    groqFormData.append("model", "whisper-large-v3-turbo");

    // We can't rely on global fetch FormData for file uploads easily in some environments,
    // but Next.js 13+ global fetch supports standard FormData with Blobs.

    const groqRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: groqFormData
    });

    if (!groqRes.ok) {
      const errorText = await groqRes.text();
      console.error("Groq Whisper Error:", errorText);
      throw new Error(`Groq API Error: ${groqRes.status}`);
    }

    const data = await groqRes.json();
    return NextResponse.json({ text: data.text });
  } catch (error: any) {
    console.error("STT Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

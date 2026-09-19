import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { topic, brandName } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
    const modelName = process.env.OLLAMA_MODEL || "nemotron-mini";

    const systemPrompt = `You are a professional YouTube scriptwriter. Create an engaging, concise video script with: hook, main points, and call-to-action. Format it clearly with sections labeled HOOK, MAIN CONTENT, and CTA.${brandName ? ` Brand: ${brandName}.` : ""}`;

    const res = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Write a YouTube script about: ${topic}` }
        ],
        stream: false
      })
    });

    if (!res.ok) throw new Error(`Ollama API failed: ${res.statusText}`);

    const data = await res.json();
    const script = data?.message?.content || "";
    return NextResponse.json({ script, topic, brandName }, { status: 200 });
  } catch (error: unknown) {
    console.error("YouTube Script Generation Route Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate script" },
      { status: 500 }
    );
  }
}

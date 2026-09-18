import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { systemPrompt, messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
    const modelName = process.env.OLLAMA_MODEL || "nemotron-mini";

    const payload = {
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt || "You are a helpful AI assistant." },
        ...messages
      ],
      stream: true // Keep streaming enabled
    };

    const res = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.error("Ollama API Failed:", res.statusText);
      return NextResponse.json({ error: "Local Ollama API Failed" }, { status: 500 });
    }

    // Transform Ollama's stream (JSON lines) into standard text stream
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        try {
          const text = new TextDecoder().decode(chunk);
          const lines = text.split('\n').filter(l => l.trim() !== '');
          for (const line of lines) {
            const data = JSON.parse(line);
            if (data.message && data.message.content) {
              controller.enqueue(new TextEncoder().encode(data.message.content));
            }
          }
        } catch (e) {
          console.error("Error parsing Ollama stream chunk", e);
        }
      }
    });

    const stream = res.body?.pipeThrough(transformStream);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });

  } catch (error: unknown) {
    console.error("Local Voice Chat API Error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate AI response";
    return new Response(message, { status: 500 });
  }
}

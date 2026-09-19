import { NextResponse } from "next/server";

interface BuilderRequestBody {
  prompt?: string;
  theme?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as BuilderRequestBody;
    const prompt = body.prompt || "";
    const theme = body.theme || "";

    if (!prompt.trim()) {
      return NextResponse.json(
        { error: "A prompt is required to generate a website layout." },
        { status: 400 }
      );
    }

    const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
    const modelName = process.env.OLLAMA_MODEL || "nemotron-mini";

    const systemPrompt = `You are a web design expert. Generate clean, modern HTML with inline Tailwind CSS classes based on the user's request. Return ONLY the HTML, no explanations.${theme ? ` Use a ${theme} theme.` : ""}`;

    const res = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        stream: false
      })
    });

    if (!res.ok) {
      throw new Error(`Ollama API failed: ${res.statusText}`);
    }

    const data = await res.json();
    const html = data?.message?.content || "<p>Could not generate layout.</p>";
    return NextResponse.json({ html }, { status: 200 });
  } catch (error: unknown) {
    console.error("Builder Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

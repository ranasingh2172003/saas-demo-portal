import { NextResponse } from "next/server";
import { GeminiService } from "@/lib/services/gemini.service";

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

    const html = await GeminiService.generateWebsiteLayout(prompt, theme);
    return NextResponse.json({ html }, { status: 200 });
  } catch (error: unknown) {
    console.error("Builder Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { GeminiService } from "@/lib/services/gemini.service";

export async function POST(req: NextRequest) {
  try {
    const { topic, brandName } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const scriptPackage = await GeminiService.generateVideoScript(topic, brandName);

    return NextResponse.json(scriptPackage, { status: 200 });
  } catch (error: unknown) {
    console.error("YouTube Script Generation Route Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate script" },
      { status: 500 }
    );
  }
}

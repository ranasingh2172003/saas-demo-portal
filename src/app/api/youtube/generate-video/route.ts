import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
  }

  try {
    const { prompt, aspectRatio = "9:16" } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Start the Veo operation — immediately return the operation name so the
    // client can poll for status instead of waiting 60-180s in this request.
    const operation = await ai.models.generateVideos({
      model: "veo-3.0-generate-preview",
      prompt,
      config: {
        aspectRatio,
        numberOfVideos: 1,
      },
    });

    // Return the operation name/id for the client to poll with
    return NextResponse.json({
      success: true,
      pending: true,
      operationName: operation.name,
      message: "Video generation started. Poll /api/youtube/job-status to check progress.",
    });
  } catch (error: unknown) {
    console.error("Veo Video Generation Error:", error);
    const message = error instanceof Error ? error.message : "Failed to start video generation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

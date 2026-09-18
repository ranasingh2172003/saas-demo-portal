import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export async function GET(req: NextRequest) {
  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const operationName = searchParams.get("operationName");

  if (!operationName) {
    return NextResponse.json({ error: "operationName query param is required" }, { status: 400 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Poll the single operation — fast read, not a blocking loop.
    // Cast to `any` because the SDK's GenerateVideosOperation type requires internal fields
    // that aren't available when reconstructing an operation from just its name string.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const operation = await ai.operations.getVideosOperation({
      operation: { name: operationName } as any,
    });

    if (!operation.done) {
      return NextResponse.json({ done: false, pending: true });
    }

    const generatedVideo = operation.response?.generatedVideos?.[0];
    if (!generatedVideo) {
      return NextResponse.json(
        { error: "No video was produced by Veo." },
        { status: 500 }
      );
    }

    const videoUri = generatedVideo.video?.uri;
    const videoBytes = generatedVideo.video?.videoBytes;
    const mimeType = generatedVideo.video?.mimeType || "video/mp4";

    if (videoBytes) {
      return NextResponse.json({ done: true, success: true, videoBase64: videoBytes, mimeType });
    }

    if (videoUri) {
      const videoRes = await fetch(`${videoUri}&key=${apiKey}`);
      if (!videoRes.ok) {
        throw new Error(`Failed to fetch video from URI: ${videoRes.status}`);
      }
      const arrayBuffer = await videoRes.arrayBuffer();
      const base64Video = Buffer.from(arrayBuffer).toString("base64");
      return NextResponse.json({ done: true, success: true, videoBase64: base64Video, mimeType });
    }

    return NextResponse.json(
      { error: "Video generated but no URI or bytes returned." },
      { status: 500 }
    );
  } catch (error: unknown) {
    console.error("Veo Job Status Error:", error);
    const message = error instanceof Error ? error.message : "Failed to check job status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

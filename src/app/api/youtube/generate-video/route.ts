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

    // Start video generation with the new `source` parameter API
    let operation = await ai.models.generateVideos({
      model: "veo-3.0-generate-preview",
      prompt,
      config: {
        aspectRatio,
        numberOfVideos: 1,
      },
    });

    // Poll until done — max ~3 minutes (18 x 10s intervals)
    let attempts = 0;
    while (!operation.done && attempts < 18) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation });
      attempts++;
    }

    if (!operation.done) {
      return NextResponse.json(
        { error: "Video generation timed out. The Veo rendering took too long. Please try a shorter/simpler prompt." },
        { status: 408 }
      );
    }

    const generatedVideo = operation.response?.generatedVideos?.[0];
    if (!generatedVideo) {
      return NextResponse.json({ error: "No video was produced by Veo." }, { status: 500 });
    }

    // The video is available via a signed URI or embedded videoBytes (base64)
    const videoUri = generatedVideo.video?.uri;
    const videoBytes = generatedVideo.video?.videoBytes; // base64 string, if available
    const mimeType = generatedVideo.video?.mimeType || "video/mp4";

    if (videoBytes) {
      // Direct base64 — just return it
      return NextResponse.json({ success: true, videoBase64: videoBytes, mimeType });
    }

    if (videoUri) {
      // Fetch the video bytes from the URI using the API key
      const videoRes = await fetch(`${videoUri}&key=${apiKey}`);
      if (!videoRes.ok) {
        throw new Error(`Failed to fetch video from URI: ${videoRes.status} ${videoRes.statusText}`);
      }
      const arrayBuffer = await videoRes.arrayBuffer();
      const base64Video = Buffer.from(arrayBuffer).toString("base64");
      return NextResponse.json({ success: true, videoBase64: base64Video, mimeType });
    }

    return NextResponse.json({ error: "Video generated but no URI or bytes returned from Veo." }, { status: 500 });

  } catch (error: unknown) {
    console.error("Veo Video Generation Error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate video";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

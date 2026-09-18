import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { systemPrompt, messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Graceful fallback for missing API key
      return NextResponse.json({
        reply: "I'm sorry, the AI service is not configured. Please add your GEMINI_API_KEY to .env.local.",
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt || "You are a helpful AI assistant.",
    });

    // Build chat history from all messages except the last one
    const historyMessages = messages.slice(0, -1);
    const chatHistory = historyMessages
      .filter((m: { role: string; content: string }) => m.content?.trim())
      .map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const chat = model.startChat({ history: chatHistory });

    const lastMessage = messages[messages.length - 1];
    
    // Use streaming to reduce latency
    const resultStream = await chat.sendMessageStream(lastMessage.content);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of resultStream.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              controller.enqueue(new TextEncoder().encode(chunkText));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: unknown) {
    console.error("Voice Chat API Error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate AI response";
    return new Response(message, { status: 500 });
  }
}

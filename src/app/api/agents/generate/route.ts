import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { transcript, messages } = await req.json();

    let interviewContext = "";
    if (messages && Array.isArray(messages)) {
      interviewContext = messages
        .filter(m => m.role !== "system")
        .map(m => `${m.role === "assistant" ? "AI Developer" : "User"}: ${m.content}`)
        .join("\n");
    } else if (transcript) {
      interviewContext = `User: ${transcript}`;
    } else {
      return NextResponse.json({ error: "No transcript or messages provided" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
      You are an elite AI Systems Architect for a SaaS platform.
      You just finished interviewing a user to understand their requirements for a new automation module.
      
      Here is the full transcript of your interview:
      ---
      ${interviewContext}
      ---
      
      Based on the entire conversation, build the ultimate AI Agent configuration to satisfy their exact requirements.
      Generate a JSON object with the following fields:
      - name: A professional, catchy name for the agent/module.
      - description: A detailed, professional description of what it does and how it was customized.
      - workflow_json: A JSON object defining its behavior, which must include:
        - type: The module type (e.g., "whatsapp", "voice", "recruitment", "website", "linkedin")
        - system_prompt: Extremely detailed system instructions for the LLM running this agent, incorporating all specific requirements discussed in the interview.
        - tools_enabled: An array of necessary tools (e.g., ["calendar_booking", "crm_sync", "web_search", "email_sender"])
        - extra_config: Any other specific settings or preferences the user requested.
        
      Return ONLY valid JSON with no markdown wrapping.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/gi, "").replace(/```/g, "").trim();
    
    const parsed = JSON.parse(text);

    // Save to Fastify backend DB — with graceful fallback if backend is offline
    let savedAgent: Record<string, unknown> = {
      id: `demo-${Date.now()}`,
      name: parsed.name,
      description: parsed.description,
      workflow_json: parsed.workflow_json,
      status: "demo",
    };

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const dbRes = await fetch(`${backendUrl}/api/agents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: parsed.name,
          description: parsed.description,
          workflow_json: parsed.workflow_json,
        }),
      });
      if (dbRes.ok) {
        savedAgent = await dbRes.json();
      }
    } catch (dbErr) {
      console.warn("Fastify backend unavailable — using demo agent ID:", dbErr);
    }

    return NextResponse.json(savedAgent, { status: 200 });
  } catch (error: any) {
    console.error("Agent Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

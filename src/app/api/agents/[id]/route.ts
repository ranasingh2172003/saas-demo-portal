import { NextResponse } from "next/server";

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await fetch(`${backendUrl}/api/agents/${id}`);

    if (!res.ok) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.warn(`Agent [${id}] backend unreachable:`, error);
    // Graceful fallback so the IDE renders demo graph instead of crashing
    return NextResponse.json({
      id,
      name: "Demo Agent",
      description: "Loaded in demo mode (backend offline)",
      workflow_json: {
        type: "whatsapp",
        system_prompt: "You are a helpful customer service agent for Apex Cooling & HVAC. Reply in English.",
      },
      status: "demo",
    });
  }
}

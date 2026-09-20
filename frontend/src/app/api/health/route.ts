import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://localhost:8000/health');
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({ nextjs: "ok", backend: data });
    }
    return NextResponse.json({ nextjs: "ok", backend: "down" }, { status: 502 });
  } catch {
    return NextResponse.json({ nextjs: "ok", backend: "unreachable" }, { status: 503 });
  }
}

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const newFormData = new FormData();
    newFormData.append("file", file);

    const res = await fetch("http://localhost:8000/stt", {
      method: "POST",
      body: newFormData,
    });

    if (!res.ok) {
      console.error("STT API Error:", res.status);
      return NextResponse.json({ text: "" }, { status: 200 });
    }

    const data = await res.json();
    return NextResponse.json({ text: data.text });
  } catch (error: unknown) {
    console.error("STT Error:", error);
    return NextResponse.json({ text: "" }, { status: 200 });
  }
}

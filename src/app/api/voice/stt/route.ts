import { NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";
import { join } from "path";
import { randomUUID } from "crypto";

const execAsync = promisify(exec);

export async function POST(req: Request) {
  const tmpId = randomUUID();
  const tmpInput = join("/tmp", `stt_${tmpId}.webm`);
  const tmpOutput = join("/tmp", `stt_${tmpId}.wav`);

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(tmpInput, buffer);

    // Convert webm to wav using ffmpeg
    await execAsync(`ffmpeg -y -i "${tmpInput}" -ar 16000 -ac 1 "${tmpOutput}"`);

    // Use openai-whisper tiny model (fast, ~39MB)
    const { stdout } = await execAsync(
      `python3 -c "import whisper; m=whisper.load_model('tiny'); r=m.transcribe('${tmpOutput}'); print(r['text'])"`,
      { timeout: 30000 }
    );
    const text = stdout.trim();
    return NextResponse.json({ text });
  } catch (error: unknown) {
    console.error("STT Error:", error);
    return NextResponse.json({ text: "" }, { status: 200 });
  } finally {
    try { await unlink(tmpInput); } catch {}
    try { await unlink(tmpOutput); } catch {}
  }
}

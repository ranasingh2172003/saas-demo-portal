"""
Sano AI — Voice Agent Worker
LiveKit Agents v1.8.2 | Python 3.11
Stack: Silero VAD → FasterWhisper small.en → Qwen2.5:1.5b → PiperTTS
Tools: build_website, draft_linkedin, draft_whatsapp_reply, generate_qr_card, write_job_description
"""
import asyncio
import os
import sys
import json
import numpy as np
import httpx

from dotenv import load_dotenv

from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, stt, tts
from livekit.agents.voice import Agent, AgentSession
from livekit.agents import APIConnectOptions
from livekit.agents.llm import ChatContext, ChatMessage, function_tool
from livekit.plugins import openai, silero

from faster_whisper import WhisperModel
from piper import PiperVoice

load_dotenv()

# ─── 1. CRM Database Helper (no external module dependency) ───────────────────

_DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "db.json")

def _crm_update(section: str, data: dict):
    """Thread-safe atomic write to CRM database."""
    try:
        db = {}
        if os.path.exists(_DB_FILE):
            try:
                with open(_DB_FILE, "r") as f:
                    db = json.load(f)
            except Exception:
                db = {}
        db[section] = data
        tmp = _DB_FILE + ".tmp"
        with open(tmp, "w") as f:
            json.dump(db, f, indent=4)
        os.replace(tmp, _DB_FILE)  # atomic on Linux
    except Exception as e:
        print(f"[CRM] Write error for '{section}': {e}")


# ─── 2. Speech-to-Text (FasterWhisper) ───────────────────────────────────────

class FasterWhisperSTT(stt.STT):
    def __init__(self, model_size: str = "small.en"):
        super().__init__(
            capabilities=stt.STTCapabilities(streaming=False, interim_results=False)
        )
        self.model_size = model_size
        self._model = None

    async def _ensure_model(self):
        if self._model is None:
            print(f"[STT] Loading Whisper {self.model_size}...")
            self._model = await asyncio.to_thread(
                WhisperModel, self.model_size, device="cpu", compute_type="int8"
            )
            print(f"[STT] Whisper {self.model_size} loaded.")

    async def _recognize_impl(self, buffer, **kwargs) -> stt.SpeechEvent:
        await self._ensure_model()
        
        # Ensure 16kHz sample rate for Whisper
        sample_rate = getattr(buffer, 'sample_rate', 24000)
        if sample_rate != 16000:
            from livekit import rtc
            resampler = rtc.AudioResampler(sample_rate, 16000)
            resampled_frames = resampler.push(buffer) + resampler.flush()
            audio_np = np.concatenate([np.frombuffer(f.data, dtype=np.int16).astype(np.float32) for f in resampled_frames]) / 32768.0
        else:
            audio_np = np.frombuffer(buffer.data, dtype=np.int16).astype(np.float32) / 32768.0

        def _transcribe():
            segs, _ = self._model.transcribe(
                audio_np,
                beam_size=2,
                language="en",
                vad_filter=False,
                
            )
            return " ".join(s.text.strip() for s in segs if s.text.strip())

        text = await asyncio.to_thread(_transcribe)
        print(f"[STT] Heard: {text.strip()}")
        return stt.SpeechEvent(
            type=stt.SpeechEventType.FINAL_TRANSCRIPT,
            alternatives=[stt.SpeechData(language="en", text=text.strip())],
        )


# ─── 3. Text-to-Speech (PiperTTS) ────────────────────────────────────────────

class PiperChunkedStream(tts.ChunkedStream):
    def __init__(self, tts_instance, text: str, conn_options=None):
        super().__init__(
            tts=tts_instance,
            input_text=text,
            conn_options=conn_options or APIConnectOptions(),
        )
        self.tts_instance = tts_instance
        self.text = text

    async def _run(self, output_emitter):
        output_emitter.initialize(
            request_id=str(id(self)),
            sample_rate=self.tts_instance.sample_rate,
            num_channels=1,
            mime_type="audio/pcm",
        )
        def _synth():
            for chunk in self.tts_instance.voice.synthesize(self.text):
                output_emitter.push(chunk.audio_int16_bytes)
        await asyncio.to_thread(_synth)
        output_emitter.flush()


class PiperTTS(tts.TTS):
    def __init__(self, model_path: str):
        super().__init__(
            capabilities=tts.TTSCapabilities(streaming=False),
            sample_rate=22050,
            num_channels=1,
        )
        self.voice = PiperVoice.load(model_path)

    def synthesize(self, text: str, **kwargs) -> tts.ChunkedStream:
        return PiperChunkedStream(self, text, conn_options=kwargs.get("conn_options"))


# ─── 4. CRM Tools (Function Calling) ─────────────────────────────────────────

@function_tool(description=(
    "Build a website for the user based on their description. "
    "Call when user asks to build, create, or design a website. Triggers in background."
))
async def build_website(prompt: str) -> str:
    print(f"[Tool:build_website] prompt={prompt!r}")
    _crm_update("website", {"prompt": prompt, "status": "queued"})
    async def _bg():
        try:
            async with httpx.AsyncClient(timeout=None) as c:
                await c.post("http://localhost:8000/api/builder", json={"prompt": prompt})
        except Exception as e:
            print(f"[Tool:build_website] bg error: {e}")
    asyncio.create_task(_bg())
    return "I have queued the website build. Switch to the Website Builder tab in a moment."


@function_tool(description=(
    "Draft LinkedIn outreach: a connection request and a follow-up message. "
    "Call when user asks to write, draft, or create a LinkedIn message."
))
async def draft_linkedin(
    target_title: str,
    industry: str,
    location: str = "India",
    tone: str = "professional",
) -> str:
    print(f"[Tool:draft_linkedin] {target_title}/{industry}/{location}")
    try:
        async with httpx.AsyncClient(timeout=120) as c:
            r = await c.post("http://localhost:8000/api/linkedin/generate", json={
                "title": target_title, "industry": industry,
                "location": location, "tone": tone,
            })
            data = r.json()
        _crm_update("linkedin", data)
        return "Done! LinkedIn messages are ready in the LinkedIn AI tab."
    except Exception as e:
        return f"Could not draft that: {e}"


@function_tool(description=(
    "Draft a WhatsApp customer support reply. "
    "Call when user wants to respond to a customer WhatsApp message."
))
async def draft_whatsapp_reply(
    customer_message: str,
    customer_name: str = "Customer",
) -> str:
    print(f"[Tool:draft_whatsapp_reply] from={customer_name!r}")
    try:
        async with httpx.AsyncClient(timeout=120) as c:
            r = await c.post("http://localhost:8000/api/whatsapp/reply", json={
                "message": customer_message, "from_": customer_name,
            })
            data = r.json()
        _crm_update("whatsapp", {"reply": data.get("reply", ""), "from": customer_name})
        return "WhatsApp reply drafted. Head to the WhatsApp AI tab to review it."
    except Exception as e:
        return f"Could not draft the reply: {e}"


@function_tool(description=(
    "Generate a QR business card. "
    "Call when user wants to create a QR code or business card."
))
async def generate_qr_card(name: str, phone: str = "", tagline: str = "") -> str:
    print(f"[Tool:generate_qr_card] name={name!r}")
    try:
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.post("http://localhost:8000/api/qr/generate", json={
                "name": name, "phone": phone, "tagline": tagline, "color": "#6C3EFF",
            })
            data = r.json()
        _crm_update("qr", {"name": name, "html": data.get("html", "")})
        return f"QR business card for {name} is ready in the QR Generator tab."
    except Exception as e:
        return f"Could not generate the QR card: {e}"


@function_tool(description=(
    "Write a job description. "
    "Call when user wants to create or write a job posting for recruitment."
))
async def write_job_description(role: str, skills: str, experience: str = "2-4 years") -> str:
    print(f"[Tool:write_job_description] role={role!r}")
    try:
        async with httpx.AsyncClient(timeout=120) as c:
            r = await c.post("http://localhost:8000/api/recruitment/jd", json={
                "role": role, "skills": skills, "experience": experience,
            })
            data = r.json()
        _crm_update("recruitment_jd", {"role": role, "jd": data.get("jd", "")})
        return f"Job description for {role} is ready in the Recruitment tab."
    except Exception as e:
        return f"Could not write the job description: {e}"


# ─── 5. Agent Entrypoint ──────────────────────────────────────────────────────

_PIPER_MODEL = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "models", "en_US-lessac-medium.onnx"
)

_INSTRUCTIONS = """
You are Sano AI, a highly capable assistant. 
You MUST use your tools. When the user asks you to build a website, YOU MUST CALL THE `build_website` TOOL. Do NOT say you cannot do it or that you lack access. 

Your tools are:
- build_website (requires a prompt parameter)
- draft_linkedin
- draft_whatsapp_reply
- generate_qr_card
- write_job_description

CRITICAL INSTRUCTION FOR WEBSITE BUILDING:
If the user asks to build a website, DO NOT call build_website immediately!
1. Acknowledge their request.
2. Interview them by asking clarifying questions (e.g., brand name, industry, desired sections, dark/light theme, specific features).
3. Wait for their answers.
4. Only AFTER you have gathered a detailed picture of their needs, call the build_website tool with a comprehensive, highly detailed prompt.

Rules:
1. Respond in 1-2 short sentences. No lists or markdown.
2. ALWAYS use the tools provided when requested.
"""

ALL_TOOLS = [
    build_website,
    draft_linkedin,
    draft_whatsapp_reply,
    generate_qr_card,
    write_job_description,
]

async def entrypoint(ctx: JobContext):
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    print("[Agent] Connected. Pre-warming models...")

    _stt_instance = FasterWhisperSTT("tiny.en")
    asyncio.create_task(_stt_instance._ensure_model())

    # Pre-warm LLM model in background
    async def _warm_llm():
        try:
            import httpx
            async with httpx.AsyncClient(timeout=30) as c:
                await c.post("http://127.0.0.1:11434/api/generate", json={"model": "qwen2.5:1.5b", "prompt": "hello", "stream": False})
            print("[LLM] qwen2.5:3b warmed up successfully.")
        except Exception as e:
            print(f"[LLM] Warm-up failed: {e}")
    asyncio.create_task(_warm_llm())

    vad = await asyncio.to_thread(silero.VAD.load)
    stt_impl = stt.StreamAdapter(stt=_stt_instance, vad=vad)
    tts_impl = await asyncio.to_thread(PiperTTS, _PIPER_MODEL)
    print("[Agent] VAD + TTS loaded.")

    llm_impl = openai.LLM(
        base_url="http://127.0.0.1:11434/v1",
        api_key="ollama",
        model="qwen2.5:1.5b",
        timeout=60.0,
    )

    assistant = Agent(instructions=_INSTRUCTIONS, tools=ALL_TOOLS)
    session = AgentSession(
        vad=vad, 
        stt=stt_impl, 
        llm=llm_impl, 
        tts=tts_impl, 
        min_endpointing_delay=3.5
    )
    
    print("[Agent] Starting session...")
    await session.start(agent=assistant, room=ctx.room)
    print("[Agent] ✅ Voice Agent is live and listening!")

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, load_threshold=float("inf")))

import os
import wave
import tempfile
import asyncio
import subprocess
import aiohttp
from dotenv import load_dotenv

from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, llm
from livekit.agents.voice import Agent
from livekit.plugins import silero, openai
from livekit.agents import tts, stt
from livekit import rtc

load_dotenv(dotenv_path=".env.local")

# We use Ollama for LLM via the OpenAI compatible endpoint!
os.environ["OPENAI_API_KEY"] = "ollama"
os.environ["OPENAI_BASE_URL"] = "http://localhost:11434/v1"

class PiperTTS(tts.TTS):
    def __init__(self):
        super().__init__(
            capabilities=tts.TTSCapabilities(streaming=False),
            sample_rate=16000,
            num_channels=1,
        )

    def synthesize(self, text: str) -> "tts.ChunkedStream":
        return PiperStream(self, text)

class PiperStream(tts.ChunkedStream):
    def __init__(self, tts_obj, text: str):
        super().__init__(tts_obj, text)

    async def _main_task(self):
        try:
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                tmp_name = f.name
                
            proc = await asyncio.create_subprocess_exec(
                "piper", "--model", "en_US-lessac-medium.onnx", "--output_file", tmp_name,
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            await proc.communicate(input=self._text.encode("utf-8"))

            if os.path.exists(tmp_name):
                with wave.open(tmp_name, "rb") as wf:
                    frames = wf.readframes(wf.getnframes())
                    frame = rtc.AudioFrame(
                        data=frames,
                        sample_rate=wf.getframerate(),
                        num_channels=wf.getnchannels(),
                        samples_per_channel=wf.getnframes(),
                    )
                    self._event_ch.send_nowait(tts.SynthesizedAudio(request_id="", segment_id="", frame=frame))
                os.remove(tmp_name)
        except Exception as e:
            print(f"Piper TTS error: {e}")

class LocalSTT(stt.STT):
    def __init__(self):
        super().__init__(
            capabilities=stt.STTCapabilities(streaming=False, interim_results=False)
        )
    
    async def recognize(self, buffer: rtc.AudioBuffer) -> stt.SpeechEvent:
        raise NotImplementedError("Use stream()")

    def stream(self) -> "LocalSTTStream":
        return LocalSTTStream(self)

class LocalSTTStream(stt.SpeechStream):
    def __init__(self, stt_obj):
        super().__init__(stt_obj)
        self._audio_frames = []

    def push_frame(self, frame: rtc.AudioFrame):
        self._audio_frames.append(frame)

    async def flush(self):
        if not self._audio_frames:
            return
        try:
            # Combine frames
            combined_data = b"".join(f.data for f in self._audio_frames)
            
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                tmp_name = f.name
                with wave.open(f, "wb") as wf:
                    wf.setnchannels(self._audio_frames[0].num_channels)
                    wf.setsampwidth(2) # 16-bit
                    wf.setframerate(self._audio_frames[0].sample_rate)
                    wf.writeframes(combined_data)

            # Transcribe via our local STT server
            async with aiohttp.ClientSession() as session:
                with open(tmp_name, "rb") as af:
                    data = aiohttp.FormData()
                    data.add_field("file", af, filename="audio.wav", content_type="audio/wav")
                    async with session.post("http://localhost:8000/stt", data=data) as resp:
                        res = await resp.json()
                        text = res.get("text", "")
            os.remove(tmp_name)
            
            if text:
                event = stt.SpeechEvent(
                    type=stt.SpeechEventType.FINAL_TRANSCRIPT,
                    alternatives=[stt.SpeechData(text=text, language="en")]
                )
                self._event_ch.send_nowait(event)
        except Exception as e:
            print("Local STT Error:", e)
        finally:
            self._audio_frames = []

    async def aclose(self, *, wait: bool = True):
        pass


async def entrypoint(ctx: JobContext):
    initial_ctx = llm.ChatContext(messages=[
        llm.ChatMessage(
            role="system",
            content=(
                "You are Apex, a friendly and concise AI voice assistant for Apex Cooling SaaS. "
                "Keep your replies very short and conversational — 1 to 2 sentences max. "
                "Be warm and helpful."
            ),
        )
    ])

    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    agent = Agent(
        vad=silero.VAD.load(),
        stt=LocalSTT(),
        llm=openai.LLM(model="nemotron-mini"),
        tts=PiperTTS(),
        chat_ctx=initial_ctx,
    )

    agent.start(ctx.room)

    await asyncio.sleep(1)
    await agent.say("Hi there. I'm Apex, your personal AI Architect. What kind of automation module would you like to build today?", allow_interruptions=True)

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))

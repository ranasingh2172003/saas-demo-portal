import asyncio
import time
import wave
import httpx
import json

async def run_benchmark():
    print("=== SANO AI VOICE BENCHMARK ===")
    
    # 1. Test STT Latency
    print("\n[STT] Loading FasterWhisper base.en...")
    t0 = time.time()
    from faster_whisper import WhisperModel
    model = WhisperModel("base.en", device="cpu", compute_type="int8")
    print(f"STT Model Load Time: {time.time() - t0:.2f}s")
    
    print("[STT] Transcribing synthetic audio...")
    t0 = time.time()
    segments, _ = model.transcribe("/tmp/hello.wav", beam_size=1, language="en")
    text = "".join(segment.text for segment in segments).strip()
    stt_time = time.time() - t0
    print(f"Transcribed Text: '{text}'")
    print(f"STT Inference Time: {stt_time:.3f}s")
    
    # 2. Test LLM TTFT (Time To First Token)
    print("\n[LLM] Requesting completion from Ollama qwen2.5:3b...")
    payload = {
        "model": "qwen2.5:3b",
        "messages": [
            {"role": "system", "content": "You are a helpful voice assistant. Keep it very short."},
            {"role": "user", "content": text}
        ],
        "stream": True
    }
    t0 = time.time()
    ttft = None
    async with httpx.AsyncClient() as client:
        async with client.stream("POST", "http://127.0.0.1:11434/api/chat", json=payload, timeout=30.0) as resp:
            async for line in resp.aiter_lines():
                if line:
                    if ttft is None:
                        ttft = time.time() - t0
                        print(f"LLM TTFT (Time To First Token): {ttft:.3f}s")
                    # break early for benchmark
                    break

    # 3. Test TTS Latency
    print("\n[TTS] Synthesizing audio via Piper...")
    from piper import PiperVoice
    t0 = time.time()
    voice = PiperVoice.load("/workspaces/saas-demo-portal/backend/models/en_US-lessac-medium.onnx")
    print(f"TTS Model Load Time: {time.time() - t0:.2f}s")
    
    t0 = time.time()
    for _ in voice.synthesize_stream_raw("Hello there. I am ready to help."):
        tts_first_chunk = time.time() - t0
        break
    print(f"TTS TTFA (Time To First Audio): {tts_first_chunk:.3f}s")
    
    print("\n=== SUMMARY ===")
    total_pipeline_latency = stt_time + ttft + tts_first_chunk
    print(f"Total Pipeline Latency (STT + LLM + TTS): {total_pipeline_latency:.3f}s")
    if total_pipeline_latency < 2.5:
        print("Conclusion: Very fast. Excellent for human conversation.")
    elif total_pipeline_latency < 5.0:
        print("Conclusion: Acceptable. Slight pause but viable for prototype.")
    else:
        print("Conclusion: Too slow for natural conversation.")

if __name__ == "__main__":
    asyncio.run(run_benchmark())

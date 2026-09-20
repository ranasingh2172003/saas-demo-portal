import asyncio
import os
from livekit import rtc, api
from piper import PiperVoice
import json

async def run_e2e_test():
    print("[E2E] Generating synthetic user audio...")
    voice = PiperVoice.load("/workspaces/saas-demo-portal/backend/models/en_US-lessac-medium.onnx")
    prompt_text = "Hello Sano AI, I need you to build a website for my new coffee shop called Sano Brews."
    
    audio_frames = []
    for chunk in voice.synthesize(prompt_text):
        audio_frames.append(chunk.audio_int16_bytes)
    
    print("[E2E] Creating test participant token...")
    token = api.AccessToken(os.environ.get("LIVEKIT_API_KEY"), os.environ.get("LIVEKIT_API_SECRET")) \
        .with_grants(api.VideoGrants(room="voice-room-test-1", room_join=True)) \
        .with_identity("e2e_test_user") \
        .to_jwt()
    
    room = rtc.Room()
    print(f"[E2E] Connecting to room voice-room-test-1...")
    await room.connect(
        os.environ.get("NEXT_PUBLIC_LIVEKIT_URL", "wss://sano-s-saas-4zj7aohy.livekit.cloud"),
        token
    )
    print("[E2E] Connected! Waiting 5 seconds for Agent to join and say hello...")
    await asyncio.sleep(5)
    
    print("[E2E] Publishing synthetic audio track...")
    source = rtc.AudioSource(22050, 1)
    track = rtc.LocalAudioTrack.create_audio_track("test_mic", source)
    options = rtc.TrackPublishOptions(source=rtc.TrackSource.SOURCE_MICROPHONE)
    await room.local_participant.publish_track(track, options)
    
    print("[E2E] Streaming audio frames...")
    import time
    for frame_bytes in audio_frames:
        frame = rtc.AudioFrame(frame_bytes, 22050, 1, len(frame_bytes)//2)
        await source.capture_frame(frame)
        await asyncio.sleep(len(frame_bytes) / 2 / 22050)
    
    print("[E2E] Audio sent. Listening for agent response transcripts over data channel...")
    
    response_received = False
    
    @room.on("data_received")
    def on_data_received(data_packet: rtc.DataPacket):
        nonlocal response_received
        try:
            payload = json.loads(data_packet.data.decode("utf-8"))
            if "text" in payload:
                print(f"[E2E-AGENT]: {payload[text]}")
                response_received = True
        except:
            payload = data_packet.data.decode("utf-8")
            print(f"[E2E-AGENT-RAW]: {payload}")
            response_received = True

    for i in range(25):
        if response_received:
            print("[E2E] Success! Agent responded.")
            break
        await asyncio.sleep(1)
        
    print("[E2E] Test complete. Disconnecting...")
    await room.disconnect()

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv("/workspaces/saas-demo-portal/backend/.env")
    asyncio.run(run_e2e_test())

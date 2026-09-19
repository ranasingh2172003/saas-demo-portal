import os
import subprocess
import tempfile
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel
import whisper
import uvicorn

app = FastAPI()

print("Loading Whisper model...")
stt_model = whisper.load_model("tiny")
print("Whisper model loaded.")

class TTSRequest(BaseModel):
    text: str

@app.post("/stt")
async def stt(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    # Convert to wav 16000Hz (Whisper handles multiple formats but doing it via ffmpeg or direct is fine, actually whisper handles it directly if ffmpeg is installed)
    try:
        # Whisper automatically uses ffmpeg under the hood
        result = stt_model.transcribe(tmp_path)
        text = result["text"].strip()
    except Exception as e:
        print("STT Error:", e)
        text = ""
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
            
    return {"text": text}

@app.post("/tts")
async def tts(req: TTSRequest):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp_path = tmp.name

    text = req.text
    # Run Piper TTS
    try:
        # echo "Hello" | piper --model en_US-lessac-medium.onnx --output_file output.wav
        process = subprocess.run(
            ["piper", "--model", "en_US-lessac-medium.onnx", "--output_file", tmp_path],
            input=text.encode("utf-8"),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        if process.returncode != 0:
            print("Piper Error:", process.stderr.decode("utf-8"))
            return Response(content="Piper failed", status_code=500)
            
        with open(tmp_path, "rb") as f:
            audio_data = f.read()
            
        return Response(content=audio_data, media_type="audio/wav")
    except Exception as e:
        print("TTS Error:", e)
        return Response(content=str(e), status_code=500)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

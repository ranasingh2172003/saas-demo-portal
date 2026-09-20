from fastapi import APIRouter
from pydantic import BaseModel
import httpx, json

router = APIRouter()

class YouTubeRequest(BaseModel):
    topic: str
    tone: str = "educational"
    duration: str = "5"

@router.post("/script")
async def generate_script(req: YouTubeRequest):
    prompt = f"""Write a YouTube video script for a {req.duration}-minute {req.tone} video about: "{req.topic}"
Format your response as valid JSON with these keys:
- "hook": an attention-grabbing opening line (2 sentences max)
- "intro": brief intro about what will be covered (2-3 sentences)
- "scenes": an array of 3-5 scene descriptions (each 2-3 sentences)
- "outro": closing summary (2 sentences)
- "cta": call-to-action for likes/subscribe (1-2 sentences)
Only output valid JSON, no markdown."""

    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post("http://localhost:11434/api/generate", json={
            "model": "qwen2.5:3b",
            "prompt": prompt,
            "stream": False,
            "format": "json"
        })
    data = resp.json()
    try:
        return json.loads(data["response"])
    except:
        return {"hook": data["response"], "intro": "", "scenes": [], "outro": "", "cta": ""}

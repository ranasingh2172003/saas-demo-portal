from fastapi import APIRouter
from pydantic import BaseModel
import httpx

router = APIRouter()

class LinkedInRequest(BaseModel):
    industry: str
    title: str
    location: str
    tone: str = "professional"

@router.post("/generate")
async def generate_linkedin(req: LinkedInRequest):
    prompt = (
        f'Write two short LinkedIn messages targeting a {req.title} in {req.industry} based in {req.location}. '
        f'Tone: {req.tone}. '
        'Return ONLY a JSON object with keys "connection" (max 280 chars) and "followup" (max 400 chars). '
        'No markdown, no explanation, pure JSON only.'
    )
    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post('http://localhost:11434/api/generate', json={
            'model': 'qwen2.5:3b',
            'prompt': prompt,
            'stream': False,
            'format': 'json'
        })
    data = resp.json()
    import json
    try:
        result = json.loads(data['response'])
        return result
    except Exception:
        return {'connection': data['response'][:280], 'followup': ''}

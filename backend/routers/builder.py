from fastapi import APIRouter
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
import google.generativeai as genai
import re
import os

router = APIRouter()

# Configure Gemini (using key provided by user)
genai.configure(api_key="AQ.Ab8RN6LqKBuRx6t7VMzsmpJryUIsXbwSnkMEUP-uibKleYfzBQ")

class BuilderRequest(BaseModel):
    prompt: str

async def generate_html_stream(prompt: str):
    system_prompt = """You are an expert web developer and designer with a phenomenal sense of modern UI/UX design.
You generate ONLY raw HTML code (with embedded Tailwind CSS and JS if needed).
NEVER output markdown blocks. NEVER wrap your code in ```html or ```.
Start your response exactly with <!DOCTYPE html>.
Use modern, sleek, premium SaaS designs. Use Tailwind CSS via CDN."""

    try:
        model = genai.GenerativeModel('gemini-3.1-pro-preview', system_instruction=system_prompt)
        response = model.generate_content(prompt, stream=True)
        
        buffer = ""
        stripped_header = False
        
        for chunk in response:
            if chunk.text:
                text = chunk.text
                if not stripped_header:
                    buffer += text
                    if len(buffer) > 15:
                        # Strip markdown if present
                        buffer = re.sub(r"^\s*`{3,}(html)?\s*", "", buffer, flags=re.IGNORECASE)
                        buffer = buffer.lstrip()
                        stripped_header = True
                        yield buffer
                        buffer = ""
                else:
                    yield text.replace("```", "")
                    
    except Exception as e:
        yield f"<!-- Error: {str(e)} -->"

@router.post("")
async def build_website(req: BuilderRequest):
    return StreamingResponse(generate_html_stream(req.prompt), media_type="text/plain")

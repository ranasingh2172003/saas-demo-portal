import { GoogleGenerativeAI } from "@google/generative-ai";
import { getFallbackTemplate } from "../templates/website-fallbacks";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Clean markdown fences and whitespace from LLM output
function stripMarkdownFences(rawText: string): string {
  const text = rawText.trim();
  const codeBlockMatch = text.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    return codeBlockMatch[1].trim();
  }
  return text.replace(/^```(?:html)?\s*/i, "").replace(/```\s*$/i, "").trim();
}

function stripJsonFences(rawText: string): string {
  let jsonString = rawText.trim();
  if (jsonString.startsWith("\`\`\`json")) {
    jsonString = jsonString.slice(7, -3).trim();
  } else if (jsonString.startsWith("\`\`\`")) {
    jsonString = jsonString.slice(3, -3).trim();
  }
  return jsonString;
}

export const GeminiService = {
  /**
   * Generates a fully self-contained HTML website layout using Gemini.
   */
  async generateWebsiteLayout(prompt: string, theme: string = ""): Promise<string> {
    if (!genAI) {
      console.warn("GEMINI_API_KEY missing, utilizing curated template fallback.");
      return getFallbackTemplate(prompt, theme);
    }

    const candidateModels = ["gemini-2.5-flash", "gemini-1.5-flash"];
    const systemInstruction = `You are an elite, world-class Frontend Architect (similar to the AI behind Lovable.dev or v0.dev). Your goal is to write a completely self-contained, breathtakingly beautiful HTML document based on the user's request.

CRITICAL RULES & GUIDELINES:
1. ONLY return raw HTML. Do NOT wrap it in \`\`\`html or markdown blocks. The very first character you output MUST be <.
2. Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
3. Use DaisyUI via CDN for gorgeous, pre-built components: <link href="https://cdn.jsdelivr.net/npm/daisyui@4.10.1/dist/full.min.css" rel="stylesheet" type="text/css" />
4. Configure Tailwind to use DaisyUI in the <head>:
   <script>
     tailwind.config = { plugins: [daisyui], daisyui: { themes: ["light", "dark", "cupcake", "corporate", "luxury"] } }
   </script>
5. Use Google Fonts (e.g., Plus Jakarta Sans or Inter) for premium typography.
6. Use FontAwesome icons: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
7. Include high-quality contextual imagery using direct Unsplash photo URLs with optimal query parameters (e.g., https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80 for engineering/business, https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80 for tech) or reliable svg placeholders. Never use source.unsplash.com.

DESIGN SYSTEM (LOVABLE / V0 TIER):
- Layout: Use spacious padding (py-20, px-8). Use flexbox and CSS grids heavily (grid-cols-1 md:grid-cols-3 gap-8).
- UI Trends: Incorporate subtle gradients (bg-gradient-to-r), glassmorphism (backdrop-blur-md bg-white/30), large rounded corners (rounded-3xl), and soft drop shadows (shadow-xl shadow-blue-500/10).
- Micro-interactions: Add hover effects (hover:-translate-y-1 hover:shadow-2xl transition-all duration-300).
- Visual Hierarchy: Use extreme contrast in typography. Huge, bold headlines (text-5xl md:text-7xl font-extrabold tracking-tight) and readable body text (text-lg text-base-content/70).
- Sections: ALWAYS include a Navbar, a stunning Hero Section (with two buttons: primary and outline), a Features/Services grid with icons, a Testimonials section, and a nice Footer.
- Colors: Use DaisyUI semantic colors (text-primary, bg-base-100, bg-base-200, btn-primary, btn-accent).

Return the FULL HTML document from <!DOCTYPE html> to </html>. Ensure valid HTML5. Make it look like a million-dollar startup website.`;

    const fullPrompt = `${systemInstruction}\n\nUser Request: ${prompt}${theme ? `\nPreferred Theme: ${theme}` : ""}`;

    const generateContentWithFallback = async (): Promise<string> => {
      let lastErr: unknown;
      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(fullPrompt);
          const response = await result.response;
          return response.text();
        } catch (err) {
          lastErr = err;
          console.warn(`Model ${modelName} failed or unavailable, trying fallback:`, err);
        }
      }
      throw lastErr || new Error("All candidate models failed to generate content.");
    };

    let timer: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error("Gemini API call timed out after 8000ms"));
      }, 8000);
    });

    try {
      const rawText = await Promise.race([generateContentWithFallback(), timeoutPromise]);
      return stripMarkdownFences(rawText);
    } catch (error) {
      console.warn("Gemini generation error or timeout, applying fallback template:", error);
      return getFallbackTemplate(prompt, theme);
    } finally {
      if (timer) clearTimeout(timer);
    }
  },

  /**
   * Generates a YouTube/LinkedIn viral video script structure using Gemini.
   */
  async generateVideoScript(topic: string, brandName: string = "Apex Cooling"): Promise<Record<string, unknown>> {
    if (!genAI) {
      throw new Error("Gemini API key not configured");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const systemInstruction = `You are a viral YouTube Shorts and LinkedIn video scriptwriter for B2B and local service businesses.
    
Your goal is to write a highly engaging, 60-second video script based on the user's topic.
The brand name is: ${brandName}.

You must return the response in strict JSON format matching exactly this schema:
{
  "title": "A catchy, clickbait-style title",
  "hook": "The 3-second hook text",
  "script": "The full spoken text for the 60-second video.",
  "scenes": [
    {
      "sceneNumber": 1,
      "visual": "A highly detailed, cinematic text-to-video prompt for Google Veo describing a 5-8 second B-Roll clip. DO NOT include any text overlays in the prompt. Always end with: '--style cinematic, 4k, professional photography, highly detailed'",
      "voiceover": "The specific sentence or two from the script that is spoken during this scene."
    }
  ]
}

Ensure the output is ONLY valid JSON, with no markdown code blocks around it (e.g. no \`\`\`json).`;

    const fullPrompt = `${systemInstruction}\n\nUser Topic: ${topic}`;
    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();
    
    return JSON.parse(stripJsonFences(responseText));
  }
};

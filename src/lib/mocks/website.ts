export interface TemplateItem {
  id: number;
  name: string;
  style: string;
  image: string;
  prompt: string;
  features: string[];
}

export const templates: TemplateItem[] = [
  {
    id: 1,
    name: "SaaS Dark Pro",
    style: "Premium, Dark Mode, Purple Accents",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600",
    prompt: "Build a premium SaaS landing page in dark mode. Use DaisyUI 'luxury' or 'dark' theme. Include a sticky glassmorphism navbar, a massive hero section with a glowing purple gradient button, a 3-column features grid with FontAwesome icons, a social proof/trusted-by logo strip, a testimonials section using cards, and a dark footer.",
    features: [
      "Glassmorphism sticky navbar",
      "Glowing purple gradient CTA",
      "3-column feature grid with modern icons",
      "Enterprise social proof logo strip",
      "Dark-mode testimonials cards & footer",
    ],
  },
  {
    id: 2,
    name: "Modern Local Business",
    style: "Clean, Blue, Trustworthy",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=600",
    prompt: "Build a modern local business website (e.g. for plumbing or HVAC). Use DaisyUI 'corporate' or 'light' theme. It MUST look incredibly trustworthy and professional. Include a top bar with phone number, a navbar with 'Request Quote' button, a hero section with a background image of a professional at work with a semi-transparent dark overlay, a 'Our Services' grid with icons, a 'Why Choose Us' section, and a footer.",
    features: [
      "Top announcement bar with click-to-call phone number",
      "Quote request hero with instant conversion CTA",
      "Comprehensive services cards with pricing indicators",
      "Trust badges and licensed technician credentials",
      "Google reviews integration preview",
    ],
  },
  {
    id: 3,
    name: "Creative Agency",
    style: "Vibrant, Pastel, Bold Typography",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600",
    prompt: "Build a creative design agency portfolio landing page. Use DaisyUI 'cupcake' or 'pastel' theme. Use huge, bold typography. Include a creative navbar, an offset hero section with abstract shapes or vibrant colors, a masonry grid for portfolio items, a scrolling marquee of clients, and an oversized footer with a bold 'Let's Talk' CTA.",
    features: [
      "Editorial headline typography with fluid scale",
      "Offset hero with vibrant abstract color palette",
      "Masonry grid for case studies and visual work",
      "Infinite scrolling partner marquee",
      "High-contrast footer consultation form",
    ],
  },
  {
    id: 4,
    name: "AI Startup",
    style: "Futuristic, Neon, Minimal",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600",
    prompt: "Build a futuristic AI startup landing page. Use a dark theme with neon cyan and magenta accents. The hero section should be minimal with a massive gradient headline, a 'Start Building' button, and a command-line style code snippet graphic. Include a features section with glowing borders on cards, a pricing table, and a footer.",
    features: [
      "Neon cyan & magenta linear gradients",
      "Interactive code snippet terminal preview",
      "Bento grid with glowing border effects",
      "Tiered pricing matrix with monthly/annual toggle",
      "API documentation link strip",
    ],
  },
];

export const initialMessages = [
  { role: "agent", text: "Hello! I am your AI Web Developer. I can build a complete, deployed website for you in seconds. Would you like to select a theme from the library, or tell me what you want to build?" }
];

export const defaultStarterHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instant Website Preview</title>
    <link href="https://cdn.jsdelivr.net/npm/daisyui@4.7.2/dist/full.min.css" rel="stylesheet" type="text/css" />
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body {
        margin: 0;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .bg-grid {
        background-size: 40px 40px;
        background-image: linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
      }
      @media (prefers-color-scheme: dark) {
        .bg-grid {
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
        }
      }
    </style>
</head>
<body class="min-h-screen bg-base-100 bg-grid flex items-center justify-center p-8">
    
    <div class="max-w-md text-center space-y-6">
        <div class="inline-block p-4 bg-primary/10 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
        </div>
        <h1 class="text-4xl font-black tracking-tight text-base-content">Your Website Canvas</h1>
        <p class="text-base-content/70 text-lg">Select a theme from the library or describe what you want in the chat to instantly generate your website.</p>
        
        <div class="grid grid-cols-2 gap-4 mt-8">
            <div class="p-4 bg-base-200 rounded-2xl text-left border border-base-300">
                <div class="font-bold text-sm mb-1">⚡️ AI Generation</div>
                <div class="text-xs text-base-content/60">Powered by Gemini 2.5 Flash</div>
            </div>
            <div class="p-4 bg-base-200 rounded-2xl text-left border border-base-300">
                <div class="font-bold text-sm mb-1">🎨 Modern UI</div>
                <div class="text-xs text-base-content/60">Tailwind CSS + DaisyUI</div>
            </div>
        </div>
    </div>

</body>
</html>`;

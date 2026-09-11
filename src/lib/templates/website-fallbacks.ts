export function getFallbackTemplate(prompt: string, theme?: string): string {
  const lowerPrompt = (prompt + " " + (theme || "")).toLowerCase();

  if (/hvac|plumb|service|repair|local|cooling|apex/i.test(lowerPrompt)) {
    return `<!DOCTYPE html>
<html lang="en" data-theme="corporate">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Apex Cooling & HVAC Solutions</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/daisyui@4.10.1/dist/full.min.css" rel="stylesheet" type="text/css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-base-100 text-base-content min-h-screen flex flex-col">
  <!-- Top Emergency Bar -->
  <div class="bg-primary text-primary-content text-xs font-semibold py-2 px-6 flex justify-between items-center">
    <span><i class="fa-solid fa-phone-volume mr-2"></i>24/7 Commercial Emergency Dispatch: +1 (555) 019-2831</span>
    <span class="badge badge-accent badge-sm font-bold">Licensed & Insured #HVAC-9942</span>
  </div>

  <!-- Navbar -->
  <div class="navbar bg-base-100/90 backdrop-blur-md sticky top-0 z-50 border-b border-base-200 px-6 lg:px-12">
    <div class="flex-1">
      <a class="text-2xl font-black text-primary tracking-tight flex items-center gap-2">
        <i class="fa-solid fa-snowflake text-info"></i>
        <span>APEX<span class="text-base-content">COOLING</span></span>
      </a>
    </div>
    <div class="flex-none gap-4">
      <ul class="menu menu-horizontal px-1 font-medium hidden md:flex">
        <li><a>Services</a></li>
        <li><a>Commercial</a></li>
        <li><a>Maintenance Plans</a></li>
        <li><a>Reviews</a></li>
      </ul>
      <a class="btn btn-primary btn-sm rounded-lg shadow-sm">Request Service</a>
    </div>
  </div>

  <!-- Hero Section -->
  <div class="hero py-16 lg:py-24 bg-gradient-to-b from-base-200 to-base-100">
    <div class="hero-content flex-col lg:flex-row-reverse gap-12 px-6 lg:px-12 max-w-7xl mx-auto">
      <img src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1000&q=80" 
           class="max-w-md w-full rounded-3xl shadow-2xl border-4 border-white object-cover aspect-4/3" 
           alt="Commercial HVAC Technician" />
      <div class="space-y-6">
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary font-bold text-xs rounded-full">
          <i class="fa-solid fa-shield-halved"></i> 100% Satisfaction Guarantee
        </div>
        <h1 class="text-4xl lg:text-6xl font-black tracking-tight leading-tight">
          Commercial HVAC & Precision Cooling Services
        </h1>
        <p class="text-lg opacity-80 leading-relaxed max-w-xl">
          Rapid-response climate control, preventive maintenance, and building automation for high-rise facilities and commercial offices.
        </p>
        <div class="flex flex-wrap gap-4 pt-2">
          <button class="btn btn-primary btn-lg rounded-xl shadow-lg shadow-primary/20">
            <i class="fa-solid fa-calendar-check mr-2"></i> Book 2-Hour Dispatch
          </button>
          <button class="btn btn-outline btn-lg rounded-xl">
            <i class="fa-solid fa-file-invoice-dollar mr-2"></i> Instant Quote
          </button>
        </div>
        <div class="flex items-center gap-6 pt-4 text-xs font-semibold opacity-70">
          <span><i class="fa-solid fa-star text-warning mr-1"></i>4.9/5 Average Rating</span>
          <span><i class="fa-solid fa-clock mr-1"></i>30-Minute Dispatch Window</span>
          <span><i class="fa-solid fa-wrench mr-1"></i>All OEM Parts Stocked</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Services Grid -->
  <section class="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
    <div class="text-center max-w-2xl mx-auto mb-16 space-y-3">
      <h2 class="text-xs font-bold text-primary tracking-widest uppercase">Engineered Reliability</h2>
      <h3 class="text-3xl lg:text-4xl font-black">Comprehensive Facility Services</h3>
      <p class="opacity-70">Tailored maintenance and emergency cooling to keep your operations running cold.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="card bg-base-100 border border-base-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div class="card-body">
          <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl mb-2">
            <i class="fa-solid fa-fan"></i>
          </div>
          <h4 class="card-title font-bold text-xl">Emergency Chiller Repair</h4>
          <p class="text-sm opacity-70">24/7 on-demand repairs for industrial chillers, rooftop RTUs, and commercial air handlers.</p>
          <div class="card-actions justify-end mt-4">
            <a class="btn btn-ghost btn-xs text-primary font-bold">Learn More →</a>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 border border-base-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div class="card-body">
          <div class="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center text-xl mb-2">
            <i class="fa-solid fa-temperature-arrow-down"></i>
          </div>
          <h4 class="card-title font-bold text-xl">Preventive Maintenance</h4>
          <p class="text-sm opacity-70">Quarterly filter swaps, coil acid baths, refrigerant leak checks, and motor diagnostics.</p>
          <div class="card-actions justify-end mt-4">
            <a class="btn btn-ghost btn-xs text-secondary font-bold">Plan Details →</a>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 border border-base-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div class="card-body">
          <div class="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center text-xl mb-2">
            <i class="fa-solid fa-microchip"></i>
          </div>
          <h4 class="card-title font-bold text-xl">Smart Building IoT</h4>
          <p class="text-sm opacity-70">Automated energy monitoring thermostats and predictive failure vibration sensors.</p>
          <div class="card-actions justify-end mt-4">
            <a class="btn btn-ghost btn-xs text-accent font-bold">Explore IoT →</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer p-10 bg-neutral text-neutral-content mt-auto">
    <div>
      <span class="text-2xl font-black tracking-tight text-white flex items-center gap-2">
        <i class="fa-solid fa-snowflake text-info"></i> APEX COOLING
      </span>
      <p class="opacity-70">Trusted Commercial Mechanical Solutions<br/>Serving Metro & Greater Area Since 2012</p>
    </div>
    <div>
      <span class="footer-title">Services</span>
      <a class="link link-hover">Rooftop Units (RTU)</a>
      <a class="link link-hover">Refrigerant Reclamation</a>
      <a class="link link-hover">Air Quality Monitoring</a>
    </div>
    <div>
      <span class="footer-title">Company</span>
      <a class="link link-hover">About Us</a>
      <a class="link link-hover">Licenses & Bonds</a>
      <a class="link link-hover">Careers</a>
    </div>
  </footer>
</body>
</html>`;
  }

  if (/agency|design|creative|portfolio/i.test(lowerPrompt)) {
    return `<!DOCTYPE html>
<html lang="en" data-theme="cupcake">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Studio Vanguard — Creative Design Agency</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/daisyui@4.10.1/dist/full.min.css" rel="stylesheet" type="text/css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800;900&display=swap" rel="stylesheet">
  <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-base-100 text-base-content min-h-screen">
  <nav class="navbar px-8 py-4 bg-base-100/80 backdrop-blur-md sticky top-0 z-50">
    <div class="flex-1">
      <span class="text-3xl font-black tracking-tighter text-primary">VANGUARD.</span>
    </div>
    <div class="flex-none gap-4 font-semibold">
      <a class="btn btn-ghost btn-sm">Works</a>
      <a class="btn btn-ghost btn-sm">Philosophy</a>
      <a class="btn btn-primary btn-sm rounded-full px-6">Let's Talk</a>
    </div>
  </nav>

  <main class="max-w-6xl mx-auto px-8 py-20">
    <div class="space-y-6 text-center max-w-3xl mx-auto mb-20">
      <span class="badge badge-accent badge-lg font-bold">Award-Winning Creative Studio</span>
      <h1 class="text-5xl md:text-7xl font-black tracking-tight">We build digital products people love.</h1>
      <p class="text-lg opacity-70">Crafting distinctive brand identities, bespoke interfaces, and interactive web experiences for ambitious founders.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="card bg-base-200 rounded-3xl overflow-hidden shadow-xl hover:-translate-y-2 transition-transform duration-300">
        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80" alt="Design Project" class="h-64 object-cover w-full" />
        <div class="card-body">
          <h2 class="card-title text-2xl font-black">Lumina Spatial UI</h2>
          <p class="opacity-70">Design system and spatial computing interface for next-generation hardware.</p>
        </div>
      </div>
      <div class="card bg-base-200 rounded-3xl overflow-hidden shadow-xl hover:-translate-y-2 transition-transform duration-300">
        <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80" alt="Design Project" class="h-64 object-cover w-full" />
        <div class="card-body">
          <h2 class="card-title text-2xl font-black">Hyperion FinTech</h2>
          <p class="opacity-70">End-to-end design & web application redesign resulting in a 4x conversion boost.</p>
        </div>
      </div>
    </div>
  </main>
</body>
</html>`;
  }

  // Default: SaaS Dark Pro / AI Startup
  return `<!DOCTYPE html>
<html lang="en" data-theme="luxury">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NexusAI — Next-Gen Intelligence Suite</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/daisyui@4.10.1/dist/full.min.css" rel="stylesheet" type="text/css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700;800&display=swap" rel="stylesheet">
  <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-base-100 text-base-content min-h-screen flex flex-col antialiased">
  <!-- Navbar -->
  <header class="navbar bg-base-100/70 backdrop-blur-xl border-b border-base-content/10 sticky top-0 z-50 px-6 lg:px-12">
    <div class="flex-1">
      <span class="text-2xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary flex items-center gap-2">
        <i class="fa-solid fa-cube text-primary"></i> NEXUS.AI
      </span>
    </div>
    <div class="flex-none gap-3 font-medium">
      <a class="btn btn-ghost btn-sm rounded-lg">Features</a>
      <a class="btn btn-ghost btn-sm rounded-lg">Pricing</a>
      <a class="btn btn-primary btn-sm rounded-lg shadow-lg shadow-primary/20">Get Started Free</a>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="py-24 px-6 text-center max-w-5xl mx-auto space-y-8 flex-1 flex flex-col justify-center">
    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mx-auto shadow-inner">
      <i class="fa-solid fa-sparkles"></i> Powered by Autonomous Agents
    </div>
    <h1 class="text-5xl md:text-7xl font-black tracking-tight leading-tight">
      Automate your enterprise workflows in <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">milliseconds</span>.
    </h1>
    <p class="text-lg md:text-xl opacity-75 max-w-2xl mx-auto leading-relaxed">
      Deploy self-orchestrating AI agents across WhatsApp, Voice, LinkedIn, and Web channels with zero code infrastructure.
    </p>
    <div class="flex flex-wrap justify-center gap-4 pt-4">
      <button class="btn btn-primary btn-lg rounded-2xl shadow-xl shadow-primary/30 px-8">
        <i class="fa-solid fa-bolt mr-2"></i> Launch Console
      </button>
      <button class="btn btn-outline btn-lg rounded-2xl px-8 border-base-content/20">
        <i class="fa-solid fa-play mr-2"></i> View Interactive Demo
      </button>
    </div>
  </section>

  <!-- Features Grid -->
  <section class="py-16 px-6 lg:px-12 max-w-7xl mx-auto w-full">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="p-8 rounded-3xl bg-base-200/50 border border-base-content/10 backdrop-blur-sm space-y-4 hover:border-primary/50 transition-all duration-300">
        <div class="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center text-xl">
          <i class="fa-solid fa-brain"></i>
        </div>
        <h3 class="text-xl font-bold">Intent Reasoning</h3>
        <p class="text-sm opacity-70">Real-time classification parses user queries into deterministic actions and instant ticket routing.</p>
      </div>

      <div class="p-8 rounded-3xl bg-base-200/50 border border-base-content/10 backdrop-blur-sm space-y-4 hover:border-accent/50 transition-all duration-300">
        <div class="w-12 h-12 rounded-2xl bg-accent/20 text-accent flex items-center justify-center text-xl">
          <i class="fa-solid fa-network-wired"></i>
        </div>
        <h3 class="text-xl font-bold">Multi-Channel Sync</h3>
        <p class="text-sm opacity-70">Seamless coordination between WhatsApp Web, Twilio voice streams, and CRM pipelines.</p>
      </div>

      <div class="p-8 rounded-3xl bg-base-200/50 border border-base-content/10 backdrop-blur-sm space-y-4 hover:border-secondary/50 transition-all duration-300">
        <div class="w-12 h-12 rounded-2xl bg-secondary/20 text-secondary flex items-center justify-center text-xl">
          <i class="fa-solid fa-chart-line"></i>
        </div>
        <h3 class="text-xl font-bold">Telemetry & Audit</h3>
        <p class="text-sm opacity-70">Complete tamper-proof logging with live latency metrics and automated resolution scoring.</p>
      </div>
    </div>
  </section>

  <footer class="border-t border-base-content/10 py-8 text-center text-xs opacity-60">
    © 2026 NexusAI Technologies Inc. All rights reserved.
  </footer>
</body>
</html>`;
}

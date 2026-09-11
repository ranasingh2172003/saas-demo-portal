# Project: Apex Cooling SaaS Demo Portal

## Architecture
- **Framework**: Next.js 16.3.4 (App Router, Turbopack), React 19.2.8, TypeScript 5
- **Styling**: Tailwind CSS v4, PostCSS, Lucide Icons, Framer Motion
- **AI Integrations**: Google Generative AI SDK (`@google/generative-ai`), Web Speech API
- **Data & Visualizations**: Recharts, Client-side React State / Storage
- **Layout Shell**: `src/components/DashboardLayout.tsx` wrapping all views
- **Global Services**:
  1. `/` — Master Dashboard & Operational KPI Hub
  2. `/website` — AI Website Architect
  3. `/voice` — AI Voice Receptionist
  4. `/chat` — WhatsApp Web Automation & Intent Classifier
  5. `/recruitment` — AI Recruitment Pipeline & Screening
  6. `/youtube` — YouTube AI Influencer & Content Pipeline
  7. `/linkedin` — LinkedIn Outreach Automation & AI Inbox
  8. `/qr` — Smart QR Collateral Generator & Analytics

## Code Layout
- `src/app/globals.css`: Global design tokens, dark mode variables, custom scrollbars, animations
- `src/components/DashboardLayout.tsx`: App shell, navigation, header, theme toggle, profile modal
- `src/components/Toast.tsx`: Global toast notification system
- `src/components/Modal.tsx`: Shared modal dialogue component
- `src/components/CommandPalette.tsx`: Command search palette (`⌘K`)
- `src/components/NotificationsDropdown.tsx`: Notification center popover
- `src/components/SettingsModal.tsx`: Business, AI config & billing modal
- `src/app/page.tsx`: Dashboard with metrics, AreaChart, service health, quick actions
- `src/app/website/`: Website builder page, templates, device preview, publish modal
- `src/app/voice/`: Voice receptionist with Web Speech TTS, waveform, prompt configuration
- `src/app/chat/`: WhatsApp agent with offline simulator fallback, scenario testing, operator reply
- `src/app/recruitment/`: Recruitment engine with search, filtering, transcript drawer, job post modal
- `src/app/youtube/`: YouTube influencer with script generator, video player modal, calendar drawer
- `src/app/linkedin/`: LinkedIn automation with campaign switcher, new campaign modal, interactive inbox
- `src/app/qr/`: QR banner builder with format tabs, dynamic SVG QR code, live customizer, export
- `src/app/api/builder/route.ts`: Website generation server route with robust parsing, model fallbacks & 8s timeout

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Unify Next.js Config | Delete obsolete `next.config.js` static export, configure `next.config.ts` for dynamic server routes | M1 (DONE) | explorer 1 & 2 |
| 2 | Clean ESLint & Type Errors | Resolve 4 errors & 3 warnings in `list-models.js`, `builder/route.ts`, `website/page.tsx`, `DashboardLayout.tsx`, `chat/page.tsx`, `linkedin/page.tsx` | M1 (DONE) | explorer 1 & 2 |
| 3 | WhatsApp Offline Simulator Fallback | Add automatic fallback & toggle on `/chat` to bypass unreachable `100.68.14.14:3000` so demo is 100% accessible | M1 (DONE) | explorer 1, 2, 3 |
| 4 | Website Builder API Robustness | Fix markdown stripping regex in `/api/builder/route.ts`, replace dead Unsplash endpoints, add fallback templates | M1 (DONE) | explorer 1, 2, 3 |
| 5 | Design Tokens & Global CSS | Add semantic design tokens, dark mode surface variables, sleek scrollbars, and card utilities in `globals.css` | M2 (DONE) | explorer 3 |
| 6 | App Shell & Header Polish | Add breadcrumbs, command palette trigger, notification center, and fix SSR theme toggle layout shift in `DashboardLayout.tsx` | M2 (DONE) | explorer 3 |
| 7 | Global Toast & Feedback System | Implement lightweight toast system for instant feedback on downloads, saves, publishes, and copies | M2 (DONE) | explorer 3 |
| 8 | User Settings & Profile Drawer | Provide interactive business settings, AI model selector, and subscription plan modal from sidebar profile | M2 (DONE) | explorer 2 & 3 |
| 9 | Master Dashboard Polish | Add Recharts dark mode tooltip styles, gradient area chart, legend, time-range pills, and KPI navigation | M3 (DONE) | explorer 2 & 3 |
| 10 | Website Builder Device Toggle & Modals | Add desktop/mobile viewport toggle, working "Publish to Web" modal, "Preview" modal, and "View Code" modal | M3 (DONE) | explorer 2 & 3 |
| 11 | Voice Receptionist Audio & Config | Add Web Speech API TTS, audio waveform, call duration timer, prompt configuration modal, and call summary card | M3 (DONE) | explorer 2 & 3 |
| 12 | WhatsApp Scenario Sender & Tools | Add custom scenario sender, search bar, intent filter pills, and operator reply takeover | M3 (DONE) | explorer 2 & 3 |
| 13 | Recruitment Search & Transcripts | Convert to client component, add real-time search, status filter, working "View Transcript" drawer, and "Create Job" modal | M3 (DONE) | explorer 2 & 3 |
| 14 | YouTube Video Generator & Player | Add Gemini video script generator modal, video player modal, and interactive content calendar drawer | M3 (DONE) | explorer 2 & 3 |
| 15 | LinkedIn Campaign & AI Inbox | Add Pause/Resume campaign toggle, "New Campaign" modal, interactive inbox thread viewer, and reply composer | M3 (DONE) | explorer 2 & 3 |
| 16 | Smart QR Customizer & Generator | Add format tabs, dynamic SVG QR code generator, live headline/color customizer, and working download/print buttons | M3 (DONE) | explorer 2 & 3 |
| 17 | Full Build & Lint Gate | Ensure `npm run build` and `npm run lint` pass with 0 errors | M4 (DONE) | orchestrator |
| 18 | Multi-Agent Review & Audit | Reviewer, Challenger, and Forensic Auditor verification | M4 (DONE) | orchestrator |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Architecture, Config & Critical Bug Fixing | Unify config, fix all ESLint errors/warnings, fix WhatsApp `/chat` IP lockout, fix builder API | Survey complete | DONE |
| M2 | Design System, App Shell & Toast System | Semantic CSS tokens, header breadcrumbs/notifications, user settings modal, global toast | M1 | DONE |
| M3 | Interactive Feature Completion Across All 8 Modules | Implement working modals, controls, TTS audio, filters, and creators across all 8 views | M2 | DONE |
| M4 | E2E Verification, Adversarial Review & Audit | Build verification, lint check, reviewer approval, challenger testing, forensic audit | M3 | DONE |

## Interface Contracts
### DashboardLayout ↔ Views
- `DashboardLayout` provides global shell, theme provider, and toast container.
- Container padding standardized to `p-4 sm:p-6 lg:p-8`.
### `/api/builder` ↔ `/website`
- Request: `{ prompt: string, theme?: string }`
- Response: `{ html: string }`
- Fallback: Pre-packaged curated HTML layouts if API key is missing, rate-limited, or times out (>8s).

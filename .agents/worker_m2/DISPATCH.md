## 2026-09-11T05:00:10Z
You are worker_m2, an implementation worker.
Your working directory is: /Users/surajsingh/Documents/website S&A/saas-demo-portal/.agents/worker_m2

MANDATORY FIRST STEP: Read the original user request at:
/Users/surajsingh/Documents/website S&A/saas-demo-portal/.agents/ORIGINAL_REQUEST.md

Also read the project architecture and feature inventory at:
/Users/surajsingh/Documents/website S&A/saas-demo-portal/PROJECT.md
And reference the survey findings:
- /Users/surajsingh/Documents/website S&A/saas-demo-portal/.agents/explorer_survey_3/handoff.md
- /Users/surajsingh/Documents/website S&A/saas-demo-portal/.agents/explorer_survey_2/handoff.md

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Milestone 2 Assignment: Design System, App Shell, Toast System & Global Settings
Exclusive file ownership:
- `src/app/globals.css`
- `src/components/Toast.tsx`
- `src/components/Modal.tsx`
- `src/components/DashboardLayout.tsx`
- Any new component helpers under `src/components/` needed for shell polish (e.g. `SettingsModal.tsx`, `NotificationsDropdown.tsx`, `CommandPalette.tsx`)

Tasks to execute:
1. Design System Foundations in `src/app/globals.css`:
   - Add comprehensive semantic CSS tokens for light and dark modes: `--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`, `--primary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--border`, `--input`, `--ring`, `--radius`.
   - Add sleek custom webkit scrollbar styling.
   - Add subtle glassmorphism utilities (`glass-panel`, `card-hover`, `shimmer`).
2. Global Toast Notification System (`src/components/Toast.tsx`):
   - Implement a lightweight, responsive React toast provider and hook `useToast()` supporting `toast.success()`, `toast.error()`, `toast.info()`.
   - Auto-dismissing with smooth Framer Motion animations.
   - Wire it into `DashboardLayout.tsx` so any child page can call `useToast()`.
3. Accessible Shared Modal (`src/components/Modal.tsx`):
   - Create a reusable, responsive modal dialog component with backdrop blur, keyboard ESC close, smooth scale-in animation, and clear header/body/footer structure.
4. App Shell & Header Polish (`src/components/DashboardLayout.tsx`):
   - Dynamic breadcrumb navigation in the top header displaying "Apex Cooling / [Current Active View]".
   - Interactive Search / Command Palette trigger button (`⌘K Search`) with a working modal/dialog to jump directly to any of the 8 services or actions.
   - Notification Bell with unread badge count (e.g. "3") and an interactive popover showing simulated system alerts (e.g., "Emergency AC inquiry received", "New candidate applied", "Website published").
   - Upgrade mobile sidebar drawer using `framer-motion` for smooth slide-in/slide-out animations and backdrop blur instead of rigid instant display.
   - Nav item badge indicators (e.g. `● Live` on WhatsApp, `3 Active` on Recruitment, `AI Ready` on Website).
   - Interactive User Settings Modal: Clicking the bottom user profile card ("John Doe / Business Owner") opens a comprehensive Settings modal with 3 tabs:
     * Business Profile: Name, Industry (HVAC & Cooling), Hours, Emergency dispatch phone, Business description.
     * AI Configuration: Active Model indicator (`gemini-3.5-flash`), API Key status badge (Connected), Temperature, Prompt override.
     * Plan & Subscription: Current Tier (Apex Enterprise Pro), usage quota meter (84% used), renewal date, Upgrade button.
5. Verification:
   - Run `npm run lint` and ensure 0 errors and 0 warnings.
   - Run `npm run build` and ensure exit code 0.

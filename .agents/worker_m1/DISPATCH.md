## 2026-09-11T04:54:02Z

<USER_REQUEST>
You are worker_m1, an implementation worker.
Your working directory is: /Users/surajsingh/Documents/website S&A/saas-demo-portal/.agents/worker_m1

MANDATORY FIRST STEP: Read the original user request at:
/Users/surajsingh/Documents/website S&A/saas-demo-portal/.agents/ORIGINAL_REQUEST.md

Also read the project architecture and feature inventory at:
/Users/surajsingh/Documents/website S&A/saas-demo-portal/PROJECT.md
And reference the survey findings:
- /Users/surajsingh/Documents/website S&A/saas-demo-portal/.agents/explorer_survey_1/handoff.md
- /Users/surajsingh/Documents/website S&A/saas-demo-portal/.agents/explorer_survey_2/handoff.md
- /Users/surajsingh/Documents/website S&A/saas-demo-portal/.agents/explorer_survey_3/handoff.md

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Milestone 1 Assignment: Architecture, Config Unification & Critical Bug Fixing
Exclusive file ownership:
- `next.config.js` and `next.config.ts`
- `list-models.js` and `eslint.config.mjs`
- `src/app/api/builder/route.ts`
- `src/app/website/page.tsx`
- `src/components/DashboardLayout.tsx`
- `src/app/chat/page.tsx`
- `src/app/linkedin/page.tsx`

Tasks to execute:
1. Config Unification: Remove the obsolete/conflicting `next.config.js` with `output: 'export'`. Ensure `next.config.ts` handles image optimization and allows full dynamic server routes (`/api/builder`).
2. Fix all 4 ESLint errors and 3 warnings so that `npm run lint` exits cleanly with 0 errors and 0 warnings:
   - `list-models.js`: Convert to ES module / clean import or configure ignore in `eslint.config.mjs`.
   - `src/app/api/builder/route.ts`: Replace `any` types with strict TypeScript types; update regex to properly strip markdown code fences (`/^```(?:html)?\s*/` and `/```$/`); update prompt to not use defunct `source.unsplash.com` (use reliable placeholder/Unsplash direct syntax); provide built-in template fallbacks if Gemini API is unavailable or offline.
   - `src/app/website/page.tsx`: Replace `any` types with proper types.
   - `src/components/DashboardLayout.tsx`: Fix `react-hooks/set-state-in-effect` hydration error cleanly.
   - `src/app/chat/page.tsx`: Remove unused `_text` variable.
   - `src/app/linkedin/page.tsx`: Remove unused `ArrowRight` import.
3. Fix WhatsApp Agent (`/chat`) Lockout:
   - Address the hardcoded remote IP `http://100.68.14.14:3000/api/stream`.
   - Implement an automatic fallback / Demo Simulator Mode with a clear mode switch ("Live Server" vs "Interactive Demo Simulator").
   - Ensure the live conversation feed and the simulation actions ("Simulate Incoming Message", customer query buttons) are immediately accessible without being trapped in an infinite connecting spinner.
   - Ensure intent badges and demo conversation states work seamlessly.
4. Verification:
   - Run `npm run lint` and verify 0 errors and 0 warnings.
   - Run `npm run build` and verify successful compilation.

Document all changes, verification commands, and outputs in:
/Users/surajsingh/Documents/website S&A/saas-demo-portal/.agents/worker_m1/handoff.md
Update your progress.md regularly. When finished, send a message to parent notifying completion.
</USER_REQUEST>

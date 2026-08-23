# Chatbot & Voice — Issue Checklist

Prioritized, with file references and current status. Companion to `CHATBOT_VOICE_AUDIT_REPORT.md`.

Status key: ✅ Fixed this pass · 🔧 Partially addressed (follow‑up noted) · ⬜ Not started (recommended)

---

## P0 — Correctness / trust (users shown fake data)

- ✅ **Chat fabricated live data on any failure.** `getSimulatedReply()` returned hardcoded orders/risk/workers/inventory whenever there was no token or the backend threw, so invented numbers were shown as fact.
  `frontend/src/components/FloatingChatbot.tsx` — function deleted; `handleSendMessage` now surfaces the real error in an amber error bubble. `dbStore` import removed.

- ✅ **Voice faked the transcript.** On any voice failure the widget inserted a fixed fake user turn ("Check order status and team load") and answered it with simulated data.
  `frontend/src/components/FloatingChatbot.tsx` → `processVoiceBlob` now shows the real Whisper transcript, or an honest error; never a fabricated question/answer.

---

## P1 — Missing / broken core capability

- ✅ **No aggregate "company stats" tool.** Couldn't cleanly answer "how many orders are pending", "how many workers are free", "total order value".
  `backend/src/services/chatbot.service.js` → new `get_company_stats` tool (def lines 91‑99, handler lines 268‑331); system prompt updated (lines 358‑363). Owner/Manager, company‑scoped.

- ✅ **Worker voice negation bug — "not done" marked items complete.** Keyword overlap with no negation check.
  `frontend/src/pages/WorkerDashboard.tsx` → `processVoiceCommand` rewritten with English + Hindi/Hinglish/Punjabi negation cues; a negative phrase no longer completes an item.

- ✅ **Orphaned backend voice endpoint had no client method.** The negation‑aware, persisted `/voice-update` was never callable.
  `frontend/src/services/api.ts` → `api.orders.voiceUpdate(orderId, audioBlob)` added (lines 150‑175). *(Wiring it into the worker UI is the follow‑up below.)*

- 🔧 **Worker dashboard voice still uses the browser Web Speech API + local `dbStore`.** Chrome/Edge‑desktop only, English‑only, and updates don't persist to MongoDB or reach a manager/owner.
  `frontend/src/pages/WorkerDashboard.tsx` → `startSpeechRecognition()`. Client method now exists; full swap to `MediaRecorder` + `api.orders.voiceUpdate` + live‑API orders is the recommended next step (report §5‑B).

- ⬜ **Company FAQ/policies not wired to the bot and not manageable.** `CompanyPolicy` model + Owner CRUD (`/api/policies`) exist but the bot never reads them and there's no UI to enter them.
  Add `get_company_policy` tool (code in report §5‑A) **and** an Owner settings screen calling the existing `/api/policies`.

- ⬜ **Worker availability data is never set.** `User.isAvailable` defaults to `true`, so every worker reads as "Free" for both `check_worker_availability` and `get_company_stats`.
  Ensure the app calls `PATCH /api/workers/:id/availability` (client: `api.workers.toggleAvailability`) when work is assigned/finished so Free/Busy is real.

---

## P2 — UX / architecture

- ✅ **Blocking `alert()` popups** for unsupported browser / mic errors in the worker voice flow.
  `frontend/src/pages/WorkerDashboard.tsx` → replaced with non‑blocking entries in the on‑screen voice log.

- 🔧 **Worker dashboard runs entirely on the simulated `dbStore`, not the live API.** Root cause behind the voice endpoint not being pluggable; also means checklist/order changes there don't persist.
  Migrate `WorkerDashboard.tsx` reads/writes to `api.orders.*`. Larger refactor (report §5‑B).

---

## P3 — Cosmetic

- ⬜ **Model branding is inconsistent.** The Copilot header badge says "Llama 3.3 / Whisper Voice" unconditionally, while `AiCopilotTab` generates its risk write‑up with Gemini. Harmless, but the app advertises two different model families across surfaces.
  `frontend/src/components/FloatingChatbot.tsx` header; `frontend/src/components/.../AiCopilotTab.tsx`.

---

## Verification run this pass

- `node --check backend/src/services/chatbot.service.js` → OK.
- `npx tsc --noEmit` (repo root) → 2 pre‑existing errors in `frontend/src/components/landing/Navbar.tsx` only; none in any changed file.
- No remaining references to `getSimulatedReply` or the fake "Check order status and team load" transcript in `frontend/src`.
- `git diff --stat` → 4 files changed (FloatingChatbot.tsx, api.ts, chatbot.service.js, WorkerDashboard.tsx).

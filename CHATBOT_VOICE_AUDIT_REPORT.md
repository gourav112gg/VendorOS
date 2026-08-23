# VendorOS — Chatbot & Voice Command Audit

**Date:** 2026-08-24
**Scope:** The in‑app AI chatbot ("VendorOS Copilot"), its voice query feature, and the worker voice command that ticks off order checklists. Includes a company‑aware Q&A design and the fixes implemented in this pass.

---

## 1. Executive summary

The single most important finding is a reframing of the problem. **The backend AI is genuinely good and already company‑aware.** It is a real Groq **Llama‑3.3‑70B** agent that calls company‑scoped, role‑gated tools (orders, delay risk, worker availability, inventory) with a strong anti‑hallucination prompt, multilingual replies, and encrypted chat history. Your example question — *"how many workers are free right now?"* — was **already fully supported** for Owners and Managers via the `check_worker_availability` tool, which reads live data filtered by `company`.

The reason it felt like "many features aren't working properly" was **on the frontend**: whenever the browser had no auth token, or the backend call failed for *any* reason (server not running, `GROQ_API_KEY` missing, a network hiccup, or a legitimate "you're not allowed to see that" response), the chat widget silently fell back to a function called `getSimulatedReply()` that **fabricated confident, hardcoded numbers** — "Active Orders: 3", "PVC Pipe Fittings: 120 Units", and a worker list where *every* person was labelled "Active & Available". The voice feature was worse: on any failure it pretended you had said the fixed phrase *"Check order status and team load"* regardless of what you actually spoke, then answered that made‑up question with fake data.

So the careful, honest backend was being masked by a fake front end. Users could not tell a real answer from an invented one, and real errors (including "your backend isn't configured") were invisible.

The **worker voice command** is a separate story. There are two implementations that never meet. The backend has an excellent `/voice-update` endpoint (Groq Whisper transcription + fuzzy/LLM matching **with negation handling** + database persistence), but it was **orphaned** — no frontend code ever called it. The frontend worker voice instead used the browser's Web Speech API with naive keyword matching that had a **correctness bug**: saying *"the valve is **not** checked"* would still tick the item as complete.

This pass fixes the fabrication, surfaces real errors, adds a first‑class "company stats" capability, wires up the orphaned backend voice endpoint, and fixes the negation bug. Details below.

---

## 2. How the system actually works

### 2.1 The chatbot (works — was being hidden)

```
FloatingChatbot.tsx  ──POST /api/chatbot/query──▶  chatbot.controller.js
                                                        │
                                                        ▼
                                               chatbot.service.js
                                    Groq llama-3.3-70b-versatile, tool_choice:auto
                                                        │
                        ┌───────────────────────────────┼───────────────────────────────┐
                        ▼               ▼               ▼               ▼                ▼
                get_order_status  list_my_orders  get_order_risk  check_worker_availability  check_inventory_stock
                        └──────── all scoped by user.company and gated by user.role ────────┘
```

* **Model & pattern:** `llama-3.3-70b-versatile` with OpenAI‑style function calling, two passes (decide tool → run tool → summarise). `backend/src/services/chatbot.service.js`.
* **Company scoping:** every tool filters by `user.company`; sensitive tools (risk, worker availability, inventory) are Owner/Manager‑only. This is exactly the "answer according to the company" behaviour you wanted.
* **Anti‑hallucination:** the system prompt forbids stating any fact not returned by a tool — a deliberately conservative design.
* **Multilingual:** replies in the user's language (English / Hindi / Hinglish / Punjabi).
* **Memory:** `utils/chatMemory.js` + `models/ChatSession.js`, messages encrypted at rest (`utils/encryption.js`).
* **Voice query:** `MediaRecorder` → `POST /api/chatbot/voice-query` → Groq Whisper (`whisper-large-v3-turbo`) → same agent. Routes mounted at `/api/chatbot/*` (`app.js:101`).
* **Where it shows:** `FloatingChatbot` is mounted globally for all signed‑in roles (`App.tsx:519`).

### 2.2 The worker voice command (two disconnected halves)

**Backend (excellent, but was orphaned):** `POST /api/orders/:orderId/voice-update` (`voiceUpdate.controller.js`, mounted at `app.js:89`).
* Transcribes with Groq Whisper (server‑side, so it works on any browser/phone, multilingual).
* `checklistMatcher.service.js` does hybrid matching: fast fuzzy string match first, then an LLM fallback (`llama-3.1-8b-instant`) **with explicit negation detection** ("nahi hua", "not done" → status stays *In Progress*, never *Completed*).
* Persists results to `order.checklist[].status`, stamps `verifiedBy: "voice"`, and writes an audit trail to `order.voiceUpdateLog`.
* Properly secured: role‑gated (`worker`/`manager`/`owner`), company‑scoped, and a worker can only touch their own assigned orders.

**Frontend (shallow, was buggy):** `WorkerDashboard.tsx` `startSpeechRecognition()` / `processVoiceCommand()`.
* Uses the browser **Web Speech API** — Chrome/Edge desktop only, `lang='en-IN'` (English only).
* Matched keywords locally and wrote to the **in‑browser simulated store** (`dbStore`), not MongoDB — so updates were never persisted, never seen by a manager/owner, and left no audit log.
* **Correctness bug:** no negation check, so "not done" still marked items complete.
* Used blocking `alert()` popups for unsupported browsers and mic errors.

### 2.3 Company FAQ / policies (orphaned on both ends)

There is a complete `CompanyPolicy` model + Owner‑only CRUD API (`/api/policies`, fields `topic` / `answer`) whose route file literally says *"company policies/FAQ used by the chatbot."* But **the chatbot never reads it**, and **there is no screen for an Owner to add policies**. The feature is dead end‑to‑end. This is the biggest remaining opportunity for "answer according to the company" (see the blueprint in §5).

### 2.4 Configuration dependency

The backend needs `GROQ_API_KEY` (chat + both voice features) and `CHAT_ENCRYPTION_KEY` (encrypted history) in `backend/.env`. Both are documented in `.env.example`. If `GROQ_API_KEY` is missing the backend throws — and before this pass, the frontend hid that behind fake data.

---

## 3. Findings by severity

**P0 — Fabricated data masks failures (chat).** `getSimulatedReply()` returned hardcoded orders/risk/workers/inventory whenever there was no token or the API threw. Users saw invented numbers presented as fact, and real errors were swallowed. *(Fixed — see §4.)*

**P0 — Faked voice transcript.** On any voice failure, the widget inserted a fixed fake user message ("Check order status and team load") and answered it with simulated data — actively misleading. *(Fixed.)*

**P1 — Worker voice negation bug.** `processVoiceCommand` marked checklist items complete on keyword overlap with no negation handling; "not done" ticked the box. *(Fixed.)*

**P1 — Orphaned backend voice endpoint.** The superior `/voice-update` (Whisper + negation‑aware matching + persistence) had no client method and was never called. *(API client method added — see §4; full dashboard rewire is a larger follow‑up, see §5.)*

**P1 — No aggregate "company stats" capability.** The bot could answer per‑order and list questions but had no clean way to answer "how many orders are pending", "how many workers are free", "total order value". *(Added a `get_company_stats` tool — see §4.)*

**P1 — Company FAQ/policies not wired to the bot and not manageable.** `CompanyPolicy` exists with an Owner API but the bot ignores it and there's no UI to populate it. *(Blueprint provided in §5; not yet implemented to avoid shipping a half‑feature with no data entry screen.)*

**P2 — Blocking `alert()` popups** in the worker voice flow. *(Replaced with in‑panel log messages.)*

**P2 — Worker dashboard runs on the simulated store, not the live API.** Voice, checklists, and orders on `WorkerDashboard.tsx` read/write `dbStore`, so nothing there persists to the real database. This is the root reason the good backend voice endpoint can't simply be dropped in. *(Documented as a follow‑up in §5.)*

**P3 — Minor:** the header badge claims "Llama 3.3 / Whisper Voice" unconditionally; the `AiCopilotTab` uses a *different* model (Gemini) for its risk write‑up, so the app mixes "Llama" and "Gemini" branding across surfaces. Cosmetic only.

---

## 4. What was implemented in this pass

Four files changed; the frontend typechecks cleanly (the only two `tsc` errors are pre‑existing in `landing/Navbar.tsx`, unrelated to this work) and the backend service passes a syntax check.

**`frontend/src/components/FloatingChatbot.tsx` — honesty.**
* Deleted `getSimulatedReply()` entirely and removed the `dbStore` import.
* Text queries now call the backend and, on failure, show the **real** error message in an amber "error" bubble (e.g. "you're not signed in", "GROQ_API_KEY is missing", or a role restriction) instead of inventing data.
* Voice queries no longer fake a transcript. They show what Whisper actually heard, or an honest error if transcription/answering failed.

**`backend/src/services/chatbot.service.js` — new company‑aware capability.**
* Added a `get_company_stats` tool (Owner/Manager, company‑scoped) returning: total & active orders, a breakdown by status, total order value, worker counts (total / **free** / busy), and low‑stock item count. Managers see their own assigned orders; Owners see the whole company.
* Updated the system prompt so the model routes aggregate "how many / how much / overall" questions to this tool.
* Exported `executeTool` so it can be unit‑tested (the existing `scripts/testSecurityFixes.js` already imports it).

**`frontend/src/services/api.ts` — reach the orphaned endpoint.**
* Added `api.orders.voiceUpdate(orderId, audioBlob)` which POSTs recorded audio to `/api/orders/:orderId/voice-update` and returns the transcript + matched items. This makes the negation‑aware backend voice feature callable from the app.

**`frontend/src/pages/WorkerDashboard.tsx` — correctness & UX.**
* Rewrote `processVoiceCommand` with negation detection (English + Hindi/Hinglish/Punjabi cues such as *not, n't, nahi, mat, baaki, abhi nahi*). A "not done" update now keeps/【marks the item pending instead of completing it, and the outcome is logged clearly.
* Replaced both blocking `alert()` popups with non‑blocking messages in the on‑screen voice log.

---

## 5. Company‑aware Q&A — how to use it, and what's next

### 5.1 What works right now (after this pass)

Sign in as an **Owner or Manager**, open the Copilot, and ask in plain language (any of English/Hindi/Hinglish/Punjabi). These now hit live company data:

* "How many workers are free right now?" / "Is Ramesh free?" → `check_worker_availability`
* "How many orders are pending?" / "Give me a company overview" / "What's my total order value?" → `get_company_stats` (new)
* "What's the delay risk on order <id>?" → `get_order_risk`
* "What's the status of order <id>?" / "List my recent orders" → `get_order_status` / `list_my_orders`
* "Do we have any low‑stock items?" / "How much PVC pipe do we have?" → `check_inventory_stock`

Workers and Customers get the appropriately scoped subset (their own orders/tasks). The bot will now say honestly when it *can't* answer, rather than inventing a number.

**Prerequisite:** the backend must be running with `GROQ_API_KEY` and `CHAT_ENCRYPTION_KEY` set in `backend/.env`. If it isn't, you'll now see a clear error in the chat instead of fake data.

### 5.2 Recommended next steps (not done in this pass)

**A. Wire the company FAQ into the bot (high value, low risk).** The data model and Owner API already exist. Add a tool so the bot can answer policy questions ("what's our return window?", "delivery timelines?", "warranty terms?") from `CompanyPolicy`:

```js
// backend/src/services/chatbot.service.js — add to `tools`
{
  type: "function",
  function: {
    name: "get_company_policy",
    description:
      "Look up the company's own written policies/FAQ (e.g. returns, delivery timelines, warranty, working hours). Use for 'what is our ... policy' questions.",
    parameters: {
      type: "object",
      properties: { topic: { type: "string", description: "Optional keyword to search policy topics" } },
    },
  },
},

// …and in executeTool():
if (toolName === "get_company_policy") {
  const CompanyPolicy = require("../models/CompanyPolicy");
  const q = { company: user.company };
  if (args.topic && typeof args.topic === "string") {
    q.topic = new RegExp(escapeRegExp(args.topic.trim()), "i");
  }
  const policies = await CompanyPolicy.find(q).select("topic answer").limit(10);
  return { count: policies.length, policies: policies.map(p => ({ topic: p.topic, answer: p.answer })) };
}
```

This is genuinely company‑specific knowledge, so it belongs to any role (customers included). **It needs a companion Owner UI** (a simple topic/answer table in Settings that calls the existing `/api/policies` CRUD) — without it there's no way to enter policies, which is why it wasn't shipped blind in this pass.

**B. Give the worker voice command the real backend.** The `api.orders.voiceUpdate()` method is now in place. The blocker is that `WorkerDashboard.tsx` reads/writes the simulated `dbStore`, not the live API, so it has no real Mongo order `_id`s or checklist item `_id`s to send. The clean sequence is: (1) migrate the worker dashboard's orders/checklists to the live `api.orders.*` endpoints; (2) swap `startSpeechRecognition` for the existing `MediaRecorder` pattern (already used in the chatbot) and send the blob to `api.orders.voiceUpdate(orderId, blob)`; (3) refresh the order from the server so the manager/owner see the same state. This gets you multilingual, negation‑correct, persisted, audited voice updates on every device.

**C. Backfill worker availability data.** `check_worker_availability` and the new `get_company_stats` read `User.isAvailable`, which **defaults to `true`**, so with no other action every worker reads as "Free". The `PATCH /api/workers/:id/availability` toggle already exists — make sure the UI actually flips it (e.g. when a worker is assigned an active order) so "free vs busy" reflects reality.

---

## 6. Verification performed

* `node --check backend/src/services/chatbot.service.js` → OK.
* `npx tsc --noEmit` (repo root) → only 2 errors, both pre‑existing in `frontend/src/components/landing/Navbar.tsx` (a missing `publicPortal` translation key), none in any changed file.
* Confirmed no remaining references to `getSimulatedReply` or the fake "Check order status and team load" transcript anywhere in `frontend/src`.

See `CHATBOT_VOICE_ISSUE_CHECKLIST.md` for the item‑by‑item status list with file/line references.

# VendorOS — Feature Ticket List

*Each ticket: Description, What Needs to Be Built, Acceptance Criteria, Dependencies, Priority (Must-Have for Launch / Should-Have / Nice-to-Have). IDs are stable references — use them in commits/PRs (e.g., "closes VOS-7").*

---

## VOS-1: Account Identity & Role-Gated Auth

**Description**: Core identity model — one email maps to exactly one Owner/Manager/Worker identity bound to one company for life, with a structurally separate optional Customer profile on the same email. Login requires selecting a category (Start a Company / Join a Vendor / Client-Customer) that must match the account's actual stored identity.

**What needs to be built**:
- Firebase Auth (client-side email/password) + backend identity records (role, companyId) kept in sync — no split-brain state between the two.
- Category-gated login: server-side check that the selected login category matches the account's actual role before granting access.
- Generic, identical error message ("Incorrect email or password") for wrong password, non-existent email, active lockout, and category mismatch — no information leakage.
- Customer profile creation only via explicit, deliberate action — never automatic or implicit.
- Permanent account deletion (Firestore/Mongo doc + Auth record together) on Owner-initiated removal, freeing the email for reuse.

**Acceptance criteria**:
- An Owner email logging in under "Client/Customer" gets the exact same error message as a wrong password.
- A removed Manager/Worker's email can immediately re-register fresh at a different company.
- No code path can create a Customer profile as a side effect of any other flow.

**Dependencies**: None — foundational.

**Priority**: Must-Have for Launch.

---

## VOS-2: Auth Security Hardening

**Description**: Server-side input validation, rate limiting, account lockout, and information-leak-free error messaging across all auth routes.

**What needs to be built**:
- Server-side schema validation (Zod) on every auth-adjacent field, independent of frontend checks.
- Input sanitization (strip HTML/script tags) on all string fields before persistence.
- Rate limiting: 10 requests/IP/minute on login and signup routes.
- Progressive delay on consecutive failed attempts, then hard lockout (Firebase Admin `disabled: true`) after 5 failures, auto-lifted after 15 minutes.
- Lockout notice delivered only via email to the account's registered address — never surfaced in the login response itself.
- Full codebase audit removing any error string that leaks account existence/role/lockout state.
- Firebase App Check on frontend and auth-adjacent Cloud Functions/routes.
- No custom password hashing anywhere — Firebase Auth owns this exclusively.

**Acceptance criteria**:
- 5 consecutive failed logins on one email lock it for 15 minutes, confirmed via server-side Admin SDK check, not just a UI message.
- The login response is byte-for-byte identical across all failure causes.
- A locked-out real user receives an email with a reset link.
- No password, ID token, OTP, or API key ever appears in logs.

**Dependencies**: VOS-1.

**Priority**: Must-Have for Launch.

---

## VOS-3: Company, Domains & Team Members

**Description**: Owner creates a company, defines production Domains (e.g., Packaging, Stitching, Delivery), and manages Managers/Workers.

**What needs to be built**:
- Company creation with live name-availability check.
- Domains CRUD (Owner-only).
- Team Members page: Managers tab, Workers tab (with domain assignment, Free/Busy status), Domains tab.
- Remove action: typed-name confirmation, triggers permanent deletion (VOS-1).

**Acceptance criteria**:
- An Owner can add a domain, and a newly-joined Worker can be assigned to it.
- Removing a Manager permanently deletes their login access, confirmed by a failed subsequent login attempt.

**Dependencies**: VOS-1.

**Priority**: Must-Have for Launch.

---

## VOS-4: Order Lifecycle Core

**Description**: Order creation, minimum-order threshold enforcement, and Manager assignment.

**What needs to be built**:
- Order creation: Owner manual entry + Customer self-serve via public Company Profile.
- Minimum-order threshold check (Owner-configured value/quantity) triggering an Accept/Reject banner.
- Order assignment to a Manager (Owner action, only shown while unassigned).

**Acceptance criteria**:
- An order below the configured threshold blocks production start until the Owner explicitly accepts or rejects it.
- An assigned order disappears from the "unassigned" state and appears in the correct Manager's My Orders.

**Dependencies**: VOS-3.

**Priority**: Must-Have for Launch.

---

## VOS-5: Production Stage Building & Templates

**Description**: Manager builds an order's production stages, either from a private reusable Template or manually, and assigns Workers per stage.

**What needs to be built**:
- Stage builder: domain + checklist per stage.
- Apply Template vs. Build Manually fork.
- Private per-Manager Templates (CRUD) — enforced at the security-rules/query level as invisible to Owner and other Managers, not just hidden in UI.
- Worker assignment filtered to the stage's domain, showing Free/Busy.

**Acceptance criteria**:
- A Manager's saved template can be applied to a new order in one action, populating all its stages.
- Attempting to query another Manager's templates (directly, bypassing the UI) is rejected at the data layer.

**Dependencies**: VOS-4.

**Priority**: Must-Have for Launch.

---

## VOS-6: Worker Task Execution (Manual & Voice)

**Description**: Worker updates checklist items via manual tick or voice update.

**What needs to be built**:
- Manual "Mark Complete" per checklist item.
- Voice Update: record → Groq Whisper transcription → auto-tick matching item.
- Manager manual override (can tick on a Worker's behalf).
- Graceful fallback to manual entry if transcription fails or times out.

**Acceptance criteria**:
- A Worker can complete a task entirely by voice, with the correct checklist item auto-ticked.
- If Groq's API is slow/unavailable, the manual tick option remains fully usable with no visible delay or frozen UI.

**Dependencies**: VOS-5.

**Priority**: Must-Have for Launch.

---

## VOS-7: AI Operations Copilot

**Description**: Continuous, transparent delay-risk scoring for every active order, with a plain-English reason and suggested action — display-only, never actionable via a button.

**What needs to be built**:
- Deterministic rules-engine formula (days remaining, stages remaining, worker load) — not a black-box model.
- Gemini/Groq call to generate the reason/suggested-action text from the raw signals, with a generic fallback string if that call fails.
- Fixed interface contract so a future trained model can replace the rules engine without touching any calling code.
- Risk flag banner (display-only, no button) on Owner Dashboard and Manager My Orders.
- Tier-gated: only computed for Growth/Scale-tier companies (see VOS-11).

**Acceptance criteria**:
- A seeded at-risk order displays a coherent risk %, reason, and suggested action, updating live as underlying order data changes.
- If the LLM call fails, the order still shows a valid risk % and a generic fallback reason — never a broken or empty state.
- A Free-tier company's orders never trigger a Gemini/Groq API call.

**Dependencies**: VOS-4, VOS-5, VOS-11.

**Priority**: Must-Have for Launch (this is the product's core differentiator).

---

## VOS-8: Delivery Tracking & Verification

**Description**: Live delivery tracking with halt alerts, and code-based delivery verification with a lockout after repeated failures.

**What needs to be built**:
- Delivery Trip page (Worker): Start Trip, live location (Leaflet + OpenStreetMap), throttled location writes (every 10-15s, not every GPS tick).
- Halt-detection check triggering an alert if stationary too long.
- Verification Code entry with visible attempt counter, 5-retry lockout, Manager manual override path.

**Acceptance criteria**:
- A simulated halted delivery triggers the halt alert within the expected window.
- 5 incorrect verification code attempts lock the field and surface the Manager override option.

**Dependencies**: VOS-5.

**Priority**: Must-Have for Launch.

---

## VOS-9: Payments (Order Checkout)

**Description**: Customer payment collection via Razorpay, unlocked only after delivery verification.

**What needs to be built**:
- Razorpay Test Mode checkout (real mode later, same integration point).
- Payment unlock strictly gated on `delivered` status.
- Webhook handling for payment confirmation.

**Acceptance criteria**:
- The payment screen is inaccessible/locked until the order's status is `delivered`.
- A completed Razorpay Test Mode payment correctly updates `payment.status` to `paid`.

**Dependencies**: VOS-8.

**Priority**: Must-Have for Launch.

---

## VOS-10: WhatsApp Alerts

**Description**: Automated WhatsApp notifications for the 7 defined system triggers.

**What needs to be built**:
- Cloud Function/route per trigger: below-minimum order, risk threshold crossed, delivery halt, delivery verified, payment received, verification lockout, new team member joined.
- Non-blocking design: a WhatsApp API failure must never block the underlying action it's attached to.

**Acceptance criteria**:
- Each of the 7 triggers fires a WhatsApp message to the correct recipient(s) in a test run.
- Simulating a WhatsApp API failure does not prevent the triggering order/delivery/payment action from completing.

**Dependencies**: VOS-4, VOS-7, VOS-8, VOS-9, VOS-3.

**Priority**: Should-Have (core loop functions without it, but it's central to the product's value proposition — treat as launch-blocking in practice even though technically decoupled).

---

## VOS-11: Subscription & Billing System

**Description**: Free / Growth / Scale tier gating, enforced server-side, with Razorpay Subscriptions for recurring billing (separate from order-payment Razorpay integration).

**What needs to be built**:
- `subscription` object on the company document (tier, status, currentPeriodEnd, razorpaySubscriptionId).
- Single shared `hasFeatureAccess(companyId, featureKey)` source of truth, usable server- and client-side.
- Server-side enforcement on AI Copilot, GST invoicing, Trust Score, Supplier Spend Intelligence — not UI-only gating.
- Pricing/Settings page with upgrade/downgrade flow.
- Soft-lock (never delete data) on lapsed subscriptions.
- Webhook handling for subscription renewal/failure/cancellation.

**Acceptance criteria**:
- A Free-tier company cannot trigger AI Copilot computation even via a direct API call, not just a hidden UI element.
- A lapsed Growth subscription hides (not deletes) previously generated Trust Score/invoice history.

**Dependencies**: VOS-3.

**Priority**: Must-Have for Launch (revenue model is non-optional for a real product, even a pilot).

---

## VOS-12: Trust Score

**Description**: Public, honestly-labeled company reliability page.

**What needs to be built**:
- On-time delivery rate + average rating, computed from completed/paid orders.
- "Sample data" label below a minimum completed-order threshold.
- Public Company Profile page (no login required).

**Acceptance criteria**:
- A company with fewer than the threshold number of completed orders shows the sample-data label, not a bare, misleadingly-precise number.

**Dependencies**: VOS-9, VOS-11 (Growth tier feature).

**Priority**: Must-Have for Launch.

---

## VOS-13: Owner Statistics & Reports

**Description**: Manager vs. Manager comparison (Owner-only, aggregate) and weekly/monthly reports (Manager: own data only; Owner: company-wide).

**What needs to be built**:
- Grouped bar chart for Manager on-time %/utilization comparison, with legend, never color-only encoding.
- Scheduled report-generation Cloud Functions, scoped per role.

**Acceptance criteria**:
- A Manager's report never includes another Manager's data, even in aggregate form.
- Owner Statistics never exposes per-order detail, only aggregate comparison.

**Dependencies**: VOS-5, VOS-9.

**Priority**: Should-Have.

---

## VOS-14: Performance & Reliability Hardening

**Description**: Batched Firestore/Mongo writes, third-party dependency timeouts/fallbacks, optimistic UI on safe actions only, pagination, and image/location write throttling.

**What needs to be built**: See the dedicated performance-hardening pass — batched writes for stage/template creation, circuit-breaker-style timeouts on WhatsApp/Razorpay/Groq/Gemini calls, optimistic updates limited to checklist ticks and Free/Busy toggles, pagination on Orders/Team Members/Reports, throttled delivery-location writes, N+1 read audit.

**Acceptance criteria**: Each sub-item verified with a concrete before/after measurement (response size, write count, load time), not just asserted.

**Dependencies**: VOS-4 through VOS-10 (hardens what already exists).

**Priority**: Should-Have.

---

## VOS-15: Deployment Architecture (Render + Vercel)

**Description**: Single consolidated Express backend on Render; static frontend on Vercel.

**What needs to be built**:
- One backend Express app (no split serverless/traditional-server duplication).
- Correct environment variable separation (VITE_-prefixed vars on Vercel only; server secrets on Render only).
- CORS locked to the actual production frontend domain.
- MongoDB Atlas network access configured for Render's dynamic egress.

**Acceptance criteria**: Demo-account login succeeds end-to-end against the real deployed Vercel URL, verified via actual network response, not localhost.

**Dependencies**: All of the above.

**Priority**: Must-Have for Launch.

---

## VOS-27: Real-Time Notifications Center

**Description**: In-app operational alerts for worker assignments and stage completion, providing instant visibility across all roles.

**What needs to be built**:
- Mongoose `Notification` schema to track title, message, recipient, order references, and `isRead` status.
- REST API endpoints (`GET /api/notifications`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`).
- Frontend `<NotificationCenter />` component integrated in all dashboard headers, polling every 10 seconds for new unread notifications.
- Automatic creation of alerts on backend worker assignments and technician status updates.

**Acceptance criteria**:
- Workers receive a bell alert immediately upon assignment to any order stage.
- Owners and managers are notified when a technician completes or updates a stage checklist.
- Bell badge count updates dynamically and dismissed items are persisted as read.

**Dependencies**: VOS-5, VOS-6.

**Priority**: Must-Have.

---

## VOS-28: Company Join Request Approval Flow

**Description**: Enrollment workflow requiring company owners to verify and authorize workers or managers before they can access corporate dashboard data.

**What needs to be built**:
- Mongoose `JoinRequest` schema to track user, company, requested role, and approval status (`pending`, `approved`, `rejected`).
- Defaulting email signups to the `"Worker"` role in `SignUp.tsx`.
- REST API endpoints (`POST /api/join-requests`, `GET /api/join-requests/pending`, `PATCH /api/join-requests/:id`, `GET /api/join-requests/my-pending`).
- Frontend routing intercepts displaying a "Join Request Pending" overlay for workers/managers who do not belong to a company.
- "Pending Join Requests" review lists with Approve/Reject actions in the Owner Dashboard Team tab.

**Acceptance criteria**:
- A worker signing up is blocked from accessing operational screens and sees a pending approval notice.
- The company owner sees the pending applicant under the Team tab and can approve them to link them to the company.
- Settings panel gates company and role selectors for Customer accounts.

**Dependencies**: VOS-1, VOS-3.

**Priority**: Must-Have.

---

## VOS-16 through VOS-26: Post-Launch Roadmap (Nice-to-Have unless noted)

| ID | Feature | Priority |
|---|---|---|
| VOS-16 | Chatbot (order-status Q&A) | Nice-to-Have |
| VOS-17 | Multilanguage (Punjabi/Hindi UI + voice) | Should-Have (real adoption driver for Worker roles) |
| VOS-18 | Two-way WhatsApp integration | Nice-to-Have |
| VOS-19 | GST-compliant invoicing (verified, not just claimed) | Should-Have |
| VOS-20 | Driver recommendation for urgent orders | Nice-to-Have |
| VOS-21 | Structured item catalog | Should-Have (dependency for VOS-22/23/25) |
| VOS-22 | Raw material availability tracking | Nice-to-Have |
| VOS-23 | Location-wise delivery/product availability | Nice-to-Have |
| VOS-24 | Supplier time tracking | Nice-to-Have |
| VOS-25 | Demo product catalog | Nice-to-Have |
| VOS-26 | Owner-uploaded downloadable PDF bill | Nice-to-Have |

Each of these follows the same ticket format as VOS-1 through VOS-28 — expand individually once launch-scope tickets are closed. See the Week 2 Features document for full detail on each.
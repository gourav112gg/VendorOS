# VendorOS — App Flow Document

*End-to-end journeys per role, plus cross-cutting system flows. References the database models and REST API defined in the TRD.*

## 1. Owner Onboarding Flow

1. Owner Sign Up → Company Name (live availability check) → Owner Name, Phone/Email, Password → **Create Company**.
2. Firebase Auth registers the Owner; the Backend API creates the company and owner records in MongoDB, issuing a JWT token with custom role ('owner') and companyId claims.
3. Owner lands on an empty-state Dashboard, prompted toward Settings (logo/description/address — feeds the public Company Profile) and Team Members (add Domains first, since Managers can't meaningfully build order stages without them).
4. Owner shares the exact company name with prospective Managers/Workers so they can find and join it.

## 2. Manager/Worker Join Flow

1. Manager or Worker searches for their company by exact name on Sign Up.
2. Selects role toggle, enters details → **Sign Up** → logged in immediately, no approval wait.
3. Backend API creates their user record in MongoDB; an alert trigger fires a WhatsApp notification to the Owner.
4. Owner later assigns the new Worker to one or more Domains from Team Members (Workers cannot self-assign). A new Manager can begin working immediately — no further Owner action required before they can be assigned orders.

## 3. Order Lifecycle Flow (Core Loop)

1. **Creation** — Owner enters an order manually, or a Customer submits one via the public Company Profile → Order Placement page.
2. **Minimum-order check** — Backend API compares value/quantity against the Owner's configured threshold. Below minimum → `belowMinimumThreshold: true`, WhatsApp alert to Owner, Accept/Reject banner on Order Detail; production doesn't start until resolved.
3. **Assignment** — Owner assigns the order to a Manager.
4. **Stage building** — Manager applies a saved Template or builds manually: defines stages (domain + checklist), assigns a Worker per stage (directory pre-filtered to that domain, showing Free/Busy).
5. **Execution** — Worker updates checklist items via Mark Complete or Voice Update (Groq transcription auto-ticks matching items); Manager can override/tick on the Worker's behalf.
6. **Continuous risk scoring** — every relevant order/stage write triggers a risk evaluation via `risk.service.js` which updates the database. Crossing the alert threshold fires a notification (WhatsApp to Manager + Owner). Owner/Manager dashboards show the updated risk %, reason, and suggested action.
7. **Delivery stage** — once production stages complete, the assigned delivery Worker starts a trip; live location updates continuously. A halt-detection check triggers a halt alert if stationary too long (WhatsApp to Manager + Owner).
8. **Verification** — Customer's Verification Code (generated at order creation, always accessible from My Orders) is entered by the Worker on arrival. Correct → order moves to `delivered`, payment unlocks. Incorrect ×5 → field locks, lockout alert fires (WhatsApp to Manager + Owner), Manager gets a manual override.
9. **Payment** — Customer completes Razorpay Test Mode checkout. Webhook confirms → `payment.status` set to `paid`.
10. **Trust Score update** — completed, paid orders feed the company's aggregate trust score, recalculated via `trust.controller.js` whenever an order reaches `paid`.

## 4. Reporting Flow

- **Manager Reports**: Backend API aggregates each Manager's own orders/workers weekly and monthly — scoped strictly to their own data.
- **Owner Statistics**: separate, Owner-only aggregate comparison across all Managers (on-time %, worker utilization) — never exposing per-order detail, never visible to any Manager.

## 5. Account Removal Flow

1. Owner clicks Remove on a Manager/Worker row in Team Members.
2. Confirm modal requires typing the person's name exactly.
3. Confirmed → Backend API deletes the user record in MongoDB and triggers Firebase Auth record deletion — true permanent deletion.
4. Historical orders/tasks previously assigned to that person remain in their historical state, with the assignee reference cleared/flagged for reassignment.

## 6. Public Trust Score View Flow

1. Any visitor reaches a company's Public Company Profile via search or shared link — no login required.
2. Page reads public fields and the trust score directly (public unauthenticated read access).
3. Below the minimum completed-order threshold → "Sample data" label shown instead of presenting the numbers as statistically meaningful.
4. **Place an Order** CTA routes an unauthenticated visitor through Customer login/signup first, then Order Placement; a logged-in Customer goes straight there.

## 7. Cross-Cutting Rule Enforcement

| Rule | Where Enforced |
|---|---|
| No cross-manager visibility | Backend controllers + API token validation (`req.user.role == 'manager'`) |
| Owner never sees Templates | API routing denies Owner access to manager templates entirely |
| No "Take Action" button on risk flags | No backend action endpoint tied to the risk banner at all — genuinely display-only |
| 5-retry delivery code lockout | Enforced in the backend order controller during verification |
| Permanent deletion on removal | Executable via user delete endpoint which syncs MongoDB and Auth records |


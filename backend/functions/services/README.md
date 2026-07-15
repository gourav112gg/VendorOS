# Backend Services

This directory contains the **service layer** for VendorOS Firebase Cloud Functions — business logic wrappers, third-party integration helpers, and reusable utilities intended to be consumed by both HTTP-triggered and Firestore-triggered Firebase Functions.

---

## Purpose

The service layer sits between Firebase Cloud Function triggers (`../triggers/`) and external systems (Firestore, Razorpay, Google Gemini, etc.). It provides clean, testable abstractions over the underlying APIs so that trigger handlers remain thin and focused.

---

## Planned Modules

| Module | Responsibility |
|--------|---------------|
| `orderService.ts` | CRUD operations for `ServiceOrder` and `OrderStage` Firestore documents |
| `userService.ts` | User profile management, role assignment, company membership |
| `invoiceService.ts` | GST invoice generation (CGST/SGST/IGST calculation) tied to completed orders |
| `inventoryService.ts` | Stock level checks, low-stock alert dispatch |
| `subscriptionService.ts` | Razorpay webhook processing, subscription state transitions (`active → past_due → canceled`) |
| `aiCopilotService.ts` | Wrapper around Google Gemini API for risk score generation |
| `activityLogService.ts` | Append-only activity log writes for audit trails |
| `trustScoreService.ts` | Trust score computation from order completion, inventory health, and worker activity |
| `notificationService.ts` | Email/SMS dispatch for order updates and low-stock alerts |

---

## Current Status

> ⚠️ **Firebase Cloud Functions are not yet implemented.** The current application uses a simulated localStorage-backed store ([`frontend/src/services/store.ts`](../../../frontend/src/services/store.ts)) and an Express server ([`server.ts`](../../../server.ts)) to emulate backend behavior.

The Express API routes in `server.ts` that are candidates for migration to Cloud Functions include:

- `POST /api/copilot/risk` → `aiCopilotService.analyzeOrderRisk()`
- `POST /api/razorpay/webhook` → `subscriptionService.handleWebhookEvent()`
- `POST /api/generate-theme` → client-side only (no migration needed)

---

## Design Conventions (when implemented)

- Each service module exports **pure async functions** — no side-effectful singletons
- All Firestore writes use **batch operations** or **transactions** where atomicity is required
- Error handling must use typed error codes — never swallow exceptions silently
- Services must be unit-testable without a live Firestore emulator (use dependency injection)


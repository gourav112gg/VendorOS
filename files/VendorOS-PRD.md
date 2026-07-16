# VendorOS — Product Requirements Document (PRD)

## 1. Product Summary

VendorOS is a SaaS platform for small manufacturing businesses — garment units, furniture workshops, small-scale fabrication, packaging and food production units — that currently run their operations through WhatsApp, phone calls, and Excel sheets. It replaces that chaos with one system: order intake, production-stage tracking, an AI Operations Copilot that flags at-risk orders before they go late, delivery tracking, and payments.

## 2. Problem Statement

Small manufacturers lose money in three specific, recurring ways:
1. **Missed deadlines they don't see coming** — nobody tracks worker load, remaining production stages, and delivery dates together in one place, so the owner finds out an order is late when the customer calls angry.
2. **Lost repeat business** — no way to demonstrate reliability to a new customer beyond word of mouth.
3. **Inefficient coordination** — production assignment happens from memory and habit, not from real visibility into who's overloaded and what's actually left to do.

Existing tools don't close this gap: WhatsApp/Excel provide no structure at all; invoicing-first apps (Vyapar, Refrens) handle billing and GST well but have no concept of production stages or delay prediction; full ERPs (SAP Business One, Odoo) cover production but are too expensive and too complex to configure for a business this size.

## 3. Target Users & Business Goals

**Primary user**: the Owner of a small manufacturing business (typically 5-40 workers, handling custom or semi-custom orders with real delivery deadlines).
**Secondary users**: Managers (coordinate a subset of orders), Workers (execute production/delivery tasks), Customers (place orders, track them, pay).

**Business goals**:
- Replace WhatsApp/Excel as the operational system of record for a first cohort of pilot factories.
- Prove the AI Operations Copilot reduces missed deadlines measurably enough to justify a paid tier.
- Build a public Trust Score feature factories can use to win new customers — a genuine acquisition tool, not just an internal dashboard.
- Establish a tiered subscription model (Free / Growth / Scale) with a believable path to revenue that doesn't depend on a feature already dominated by an incumbent (see §7, Competitive Positioning).

## 4. User Roles & Core User Stories

### Owner
- As an Owner, I want to see every active order's status in one dashboard so I don't have to call each Manager for updates.
- As an Owner, I want the system to warn me about orders at risk of being late, with a reason and a suggested fix, so I can intervene before the customer notices.
- As an Owner, I want to manage my Managers, Workers, and Domains from one place, including removing someone with a clear, final confirmation.
- As an Owner, I want a public page showing my company's reliability that I can share with a prospective new customer.

### Manager
- As a Manager, I want to build an order's production stages from a reusable template so I don't have to redefine the same workflow every time.
- As a Manager, I want to assign Workers by domain and see who's free or busy before assigning.
- As a Manager, I want visibility only into my own assigned orders, not other Managers' — my performance shouldn't be second-guessed by peers seeing my order list.

### Worker
- As a Worker, I want to update my task status by voice, since typing on a factory floor mid-task is impractical.
- As a Worker, I want a simple, unambiguous way to confirm a delivery (a code), not a complex app flow.

### Customer
- As a Customer, I want to place an order and track it without having to call the factory for updates.
- As a Customer, I want to see a factory's reliability before I order from them for the first time.
- As a Customer, I want to pay online once my delivery is confirmed, not before.

## 5. Core Feature List (Week 1 Launch Scope)

1. Order Tracking (calendar + list views)
2. WhatsApp Alerts (7 defined triggers — see App Flow doc)
3. AI Operations Copilot / Risk Scoring (display-only: risk %, reason, suggested action)
4. Minimum Order Threshold (Owner-configured, triggers Accept/Reject)
5. Manager vs Manager Statistics (Owner-only, aggregate, never per-order)
6. Templates (private per-Manager, never visible to Owner or other Managers)
7. Voice-Based Task Updates (Groq/Whisper transcription, manual tick always available)
8. Report Generation (weekly/monthly, scoped per role)
9. Trust Score (public page, honestly labeled "sample data" until statistically meaningful)
10. Delivery Tracking (live map, halt alerts, code verification with 5-retry lockout)
11. Payment Gateway (Razorpay Test Mode)

## 6. Explicitly Out of Scope for Launch

- Photo-upload verification, multilanguage UI, chatbot, GST-compliant invoicing, driver recommendation/urgent-order assurance, structured item catalog, priority-order queueing, loyalty benefits, raw-material/supplier-time tracking, demo product catalog, owner-uploaded PDF bills — all deferred to the post-launch roadmap (see Implementation Plan).
- Any AI/ML model training — Week 1 risk scoring uses a transparent, explainable rules engine behind a fixed interface (see TRD §5); a trained model is a separate, later workstream and must not require any interface changes when added.
- Delivery Assurance / protection plans — requires a real insurer partnership before this can be a live, monetized feature (IRDAI intermediary-boundary risk); kept off the roadmap entirely until that partnership exists.

## 7. Competitive Positioning

Vyapar and Refrens already do billing, GST, and basic inventory well for Indian small businesses — VendorOS is not trying to out-build them there. The defensible gap is production-stage tracking, worker coordination, and delay prediction, which neither product does. Positioning line: *"Vyapar and Refrens solved billing. VendorOS solves what happens before the invoice — knowing which order is about to go wrong, before your customer does."*

## 8. Success Criteria

- A pilot Owner can fully replace their WhatsApp group and Excel sheet for at least order tracking and delivery status within the first month of use.
- The AI Copilot flags at least one real at-risk order correctly (validated against actual outcome) during the pilot period.
- At least one pilot factory's public Trust Score page is used in an actual sales conversation with a new customer.
- Core Week 1 feature list is fully functional, tested, and demoable end-to-end across all four roles.

## 9. Constraints

- **Backend/Database**: Node.js, Express, and MongoDB (via Mongoose schemas), providing the primary REST API layer for business logic, order management, domain CRUD, and analytics.
- **Authentication & Media**: Firebase Authentication (for client-side auth & Google Sign-In) and Firebase Storage (for assets and files).
- **Project structure**: Two top-level folders, `frontend/` and `backend/`.
- Small team, phased build — see Implementation Plan for sequencing.

# VendorOS — Technical Requirements Document (TRD)

## 1. Architecture Overview

- **Frontend**: React (Vite), communicating with the backend Express server via REST API, using Firebase for Client Auth state synchronization.
- **Backend**: Node.js + Express server (serving API routes, validating auth states, and running rate limit controls).
- **Database**: MongoDB Atlas (primary application store containing users, companies, orders, inventory, and domains schemas).
- **Payments**: Razorpay Test Mode with webhook simulation.
- **WhatsApp**: WhatsApp Business Cloud API (triggered from backend notification layers).
- **Voice transcription**: Groq (Whisper API).
- **AI text generation** (risk-score explanation): Google AI Studio (Gemini `gemini-3.5-flash` model).
- **Maps**: Leaflet + OpenStreetMap.

## 2. Project Folder Structure

```
VendorOS/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── CustomerDashboard.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── ManagerDashboard.tsx
│   │   │   ├── OwnerDashboard.tsx
│   │   │   ├── PublicCompanyProfile.tsx
│   │   │   ├── SignUp.tsx
│   │   │   └── WorkerDashboard.tsx
│   │   ├── components/       # Navigation, SettingsPanel, ThemeManager, AiCopilotTab, etc.
│   │   ├── context/          # AuthContext
│   │   ├── services/
│   │   │   ├── store.ts      # Simulated localStorage-backed database
│   │   │   ├── api.ts        # Backend REST API integration client
│   │   │   └── subscriptionService.ts
│   │   └── App.tsx
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── server.js          # Entry point (port 5000)
│   │   ├── app.js             # Express app setup and route configuration
│   │   ├── config/
│   │   │   └── db.js          # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── customer.controller.js
│   │   │   ├── manager.controller.js
│   │   │   ├── worker.controller.js
│   │   │   ├── order.controller.js
│   │   │   ├── inventory.controller.js
│   │   │   ├── domain.controller.js
│   │   │   ├── dashboard.controller.js
│   │   │   ├── managerDashboard.controller.js
│   │   │   └── trust.controller.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Company.js
│   │   │   ├── Order.js
│   │   │   ├── Inventory.js
│   │   │   └── Domain.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── customer.routes.js
│   │   │   ├── manager.routes.js
│   │   │   ├── worker.routes.js
│   │   │   ├── order.routes.js
│   │   │   ├── inventory.routes.js
│   │   │   ├── domain.routes.js
│   │   │   ├── dashboard.routes.js
│   │   │   └── managerDashboard.routes.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── role.middleware.js
│   │   ├── services/
│   │   │   ├── risk.service.js       # transparent rules engine (see §5)
│   │   │   ├── whatsapp.service.js
│   │   │   └── payment.service.js
│   │   └── utils/
│   │       └── generateToken.js
│   ├── ml-model/
│   │   └── README.md   # placeholder for a future trained model; must satisfy the §5 interface
│   ├── .env.example
│   └── README.md       # Full backend documentation
│
├── api/
│   └── index.ts        # Vercel serverless integration
├── vercel.json
├── README.md
└── package.json
```

## 3. Firebase Authentication

- Email/Password for Owner/Manager/Worker; Phone OTP or Email/Password for Customer.
- Role (`owner` / `manager` / `worker` / `customer`) and `companyId` stored as a custom claim (set via a Cloud Function on user-doc write) and mirrored in the `users` Firestore document, so both security rules and client reads can check role cheaply without extra round-trips.
- No approval gate — Manager/Worker accounts are usable immediately after sign-up; Owner assigns domain/specifics afterward.
- Account deletion (Owner removing a Manager/Worker) is a real, permanent deletion of both the Firestore doc and the Auth record, executed only via an Admin-SDK Cloud Function — never a direct client-side delete.

## 4. MongoDB Data Model (Mongoose Schemas)

```javascript
// Companies Collection (companies)
{
  companyName: String, // Unique
  owner: ObjectId,     // Ref: User
  description: String,
  address: String,
  logo: String,
  minimumOrderValue: Number,
  minimumOrderQuantity: Number,
  trustScore: Number,
  subscription: {
    tier: String,      // 'free' | 'growth' | 'scale'
    status: String,    // 'active' | 'past_due' | 'canceled'
    razorpaySubscriptionId: String,
    currentPeriodEnd: Date
  }
}

// Users Collection (users)
{
  name: String,
  email: String,       // Unique
  phone: String,
  role: String,        // 'owner' | 'manager' | 'worker' | 'customer'
  company: ObjectId,   // Ref: Company
  domains: [ObjectId], // Ref: Domain
  isAvailable: Boolean,
  isCustomer: Boolean
}

// Domains Collection (domains)
{
  name: String,
  company: ObjectId    // Ref: Company
}

// Orders Collection (orders)
{
  company: ObjectId,   // Ref: Company
  customer: ObjectId,  // Ref: User
  title: String,
  description: String,
  address: String,
  value: Number,
  quantity: Number,
  deliveryDate: Date,
  belowMinimumThreshold: Boolean,
  verificationCode: String,
  verificationAttempts: Number,
  verificationLocked: Boolean,
  status: String,      // 'pending' | 'in_production' | 'in_delivery' | 'delivered' | 'paid' | 'cancelled'
  riskScore: {
    percentage: Number,
    reason: String,
    suggestedAction: String
  },
  payment: {
    status: String,    // 'unpaid' | 'paid'
    razorpayPaymentId: String,
    paidAt: Date
  }
}
```

## 5. Risk Scoring — Interface Contract

Week 1 uses a transparent, explainable rules engine — not a black-box model, since there's no training data yet:

```
riskPercentage = f(daysRemaining, stagesRemaining, assignedWorkerCurrentLoad)
```

Fixed function signature, so a future trained model can be swapped in with zero changes elsewhere in the codebase:

```js
// Input
{ orderId, deliveryDate, stagesRemaining, totalStages,
  assignedWorker: { id, activeTaskCount, activeTaskLoadScore } }

// Output (required shape regardless of implementation)
{ riskPercentage: Number, reason: String, suggestedAction: String }
```

`reason` and `suggestedAction` are generated from the raw signals via Gemini/Groq; `riskPercentage` itself stays a transparent formula until real outcome data justifies training an actual model.

## 6. Cloud Functions — WhatsApp Alert Triggers

| Function | Fires On | Recipients |
|---|---|---|
| `onOrderWrite` (threshold check) | Order created/edited below minimum | Owner |
| `onRiskThresholdCrossed` | Order risk % crosses delay threshold | Assigned Manager + Owner |
| `onDeliveryHalt` | Vehicle/worker stopped too long | Assigned Manager + Owner |
| `onDeliveryVerified` | Delivery verification completed | Customer + Owner |
| `onPaymentReceived` | Razorpay webhook confirms payment | Owner |
| `onVerificationLockout` | Code entered incorrectly 5 times | Assigned Manager + Owner |
| `onTeamMemberJoined` | New Manager/Worker joins company | Owner |

## 7. Firestore Security Rules — Key Principles

- All access scoped under `companies/{companyId}/...`, requiring the requester's custom-claim `companyId` to match.
- `orders`: Owner reads all; Manager reads/writes only where `managerId == request.auth.uid`; Worker reads only stages where they're `assignedWorkerId`; Customer reads only their own `customerId` orders.
- `templates`: readable/writable only by the owning Manager's UID — explicitly denies Owner and other Managers at the database level.
- `trustScore` and public company-profile fields: readable without authentication; writable only by the Owner.
- Account deletion: only callable via the Admin-SDK Cloud Function, guaranteeing Firestore and Auth stay in sync.

## 8. Third-Party Integrations

| Integration | Purpose | Tier |
|---|---|---|
| WhatsApp Business Cloud API | Alerts per §6 | Free to set up; small per-message cost at real volume, negligible at pilot scale |
| Razorpay Test Mode | Payment collection | Free sandbox |
| Groq (Whisper) | Voice-to-text | Free tier |
| Gemini / Groq (LLM) | Risk-score explanation text | Free tier |
| Leaflet + OpenStreetMap | Delivery map | Free, no key |

## 9. Non-Responsibility Note

Training and integrating a real ML-based risk model is a separate, later workstream, added into `backend/ml-model/`. All current logic stays isolated behind the §5 interface so integration requires no changes to Cloud Functions, Firestore schema, or frontend code — only a swap of `riskEngine.js`'s internals.

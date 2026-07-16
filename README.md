# VendorOS

> **An AI-powered Field Service Management (FSM) platform** for home-services companies — plumbing, electrical, HVAC, and beyond.

VendorOS is a full-stack SaaS application that brings together order management, team coordination, inventory tracking, GST invoicing, and AI-driven operational insights under one roof — complete with a multi-role authentication system and a subscription-gated feature set.

---

## ✨ Key Features

### 🧑‍💼 Role-Based Access Control
Four distinct roles, each with a dedicated dashboard:

| Role | Capabilities |
|------|-------------|
| **Owner** | Full admin control — manage team, view all analytics, configure subscriptions, set order thresholds |
| **Manager** | Build & assign order stages, manage templates, dispatch workers, run AI risk analysis |
| **Worker** | View assigned jobs, update stage checklists, track completion |
| **Customer** | Submit service requests, track order progress, view their own history |

### 📋 Service Order Management
- Multi-stage orders with per-stage checklists assigned to specific workers
- Order stages flow: `Unscheduled → Scheduled → Dispatched → In Progress → Completed`
- Minimum-order-value threshold enforcement with approval workflows
- Manager-created reusable **Stage Templates** per service domain

### 🤖 AI Operations Copilot *(Growth & Scale tiers only)*
- Powered by **Google Gemini** (`gemini-3.5-flash`)
- Analyzes service orders for operational risk: scheduling complexity, location delays, safety concerns, weather impact
- Returns a structured **risk score (0–100)**, reason, and a recommended mitigation action
- Server-side subscription gating prevents API credit abuse

### 🎨 AI Natural Language Theme Generator
- Describe a visual mood (e.g., "cyberpunk neon", "forest calm") and the app generates a full UI color palette
- Falls back gracefully to deterministic HSL-based color generation when the API key is absent

### 💰 GST Invoicing
- Auto-calculates CGST (9%) + SGST (9%) / IGST (18%)
- Invoice generation tied to completed service orders
- Track paid/unpaid status per invoice

### 📦 Inventory & Shipment Tracking
- Item-level stock management with configurable low-stock alert thresholds
- Shipment status tracking: `Pending → Shipped → Delivered → Cancelled`

### 📊 Analytics & Trust Score
- KPI overviews — order completion rates, revenue, team performance
- **Trust Score** (0–100) derived from order completion rate, inventory health, and worker activity
- **Spend Intelligence** — monthly category-level spend breakdowns with suggested cost actions

### 💳 Subscription Tiers (Razorpay-integrated)
| Tier | Features |
|------|----------|
| **Free** | Core order management, basic team features |
| **Growth** | AI Copilot, advanced analytics, Trust Score |
| **Scale** | All Growth features + Spend Intelligence, full multi-company support |

### ⌨️ Keyboard Shortcuts
Press `?` in-app to see all shortcuts (`Ctrl+D` → Dashboard, `Ctrl+S` → Settings, `Ctrl+C` → AI Copilot, etc.)

---

## 🏗️ Architecture

```
vendoros/
├── server.ts                      # Express backend — API routes + Vite dev middleware
├── frontend/
│   └── src/
│       ├── App.tsx                # Root layout, routing & keyboard shortcut orchestration
│       ├── types.ts               # Shared TypeScript interfaces
│       ├── pages/                 # Role-based dashboards + auth screens
│       │   ├── OwnerDashboard.tsx
│       │   ├── ManagerDashboard.tsx
│       │   ├── WorkerDashboard.tsx
│       │   ├── CustomerDashboard.tsx
│       │   ├── PublicCompanyProfile.tsx
│       │   ├── Login.tsx
│       │   └── SignUp.tsx
│       ├── components/            # Shared UI components
│       │   ├── Navigation.tsx
│       │   ├── SettingsPanel.tsx
│       │   ├── ThemeManager.tsx
│       │   ├── KpiOverview.tsx
│       │   ├── AiCopilotTab.tsx
│       │   ├── AnalyticsTab.tsx
│       │   ├── InvoicesTab.tsx
│       │   ├── TrustScoreTab.tsx
│       │   ├── ActivityLog.tsx
│       │   └── UpgradePrompt.tsx
│       ├── context/               # React Auth context (AuthProvider)
│       └── services/
│           ├── store.ts           # Simulated localStorage-backed database
│           └── subscriptionService.ts
├── backend/
│   ├── functions/
│   │   ├── services/              # Firebase function service layer (planned)
│   │   └── triggers/              # Firebase Firestore triggers (planned)
│   └── ml-model/                  # ML model integration layer (planned)
├── firestore.rules                # Firestore security rules (role & company-based)
├── vite.config.ts
└── tsconfig.json
```

### Frontend Dev Server Routes (`server.ts` / `api/index.ts`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | None | Health check |
| `POST` | `/api/copilot/risk` | Growth/Scale subscription | Gemini AI risk analysis |
| `POST` | `/api/generate-theme` | None | Natural language → UI color palette |
| `POST` | `/api/razorpay/webhook` | None | Simulated Razorpay webhook |

### Directory Architecture & Flows

Detailed architectural specifications, folder maps, and functional flows are available here:
- 💻 **Frontend Details**: [`files/frontend.md`](files/frontend.md)
- ⚙️ **Backend Details**: [`files/backend.md`](files/backend.md)

### Backend REST API Routes (`backend/src/` — port 5000)

See [`backend/README.md`](backend/README.md) for the full API reference. Key route groups:

| Prefix | Roles | Description |
|--------|-------|-------------|
| `POST /api/auth/...` | None | Signup + login for all 4 roles |
| `{any} /api/orders/...` | owner, manager, worker | Order lifecycle management |
| `{any} /api/inventory/...` | owner, manager | Stock management |
| `{any} /api/managers/...` | owner | Manager team management |
| `{any} /api/workers/...` | owner, manager | Worker management |
| `{any} /api/domains/...` | owner, manager | Service domain management |
| `GET /api/customers/my-orders` | customer | Customer order history |
| `GET /api/dashboard` | owner | KPI stats |
| `GET /api/trust-score` | owner | Company trust score |
| `POST /api/risk/analyze` | owner, manager | Order risk scoring (TRD §5) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+

### Installation

```bash
# 1. Clone the repo
git clone <repo-url>
cd vendoros

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY (optional but recommended)

# 4. Start the development server
npm run dev
```

The app will be available at **http://localhost:3000**.

### Build for Production

```bash
npm run build   # Builds frontend (Vite) + bundles server.ts
npm start       # Runs the production server
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Optional | Google Gemini API key for AI Copilot and Theme Generator |

> Without the key, the AI Copilot returns a simulated risk score and the Theme Generator falls back to deterministic HSL color generation — no crashes.

---

## 🔒 Firestore Security Model

`firestore.rules` enforces role-based access using Firebase Auth custom claims (`role`, `companyId`):

| Collection | Read | Write |
|------------|------|-------|
| `companies` | Same-company members | Owner only |
| `users` | Self or same-company | Self or Owner |
| `domains` | Authenticated members | Owner only |
| `orders` | Same-company + Customers | Owner, Manager, Customer |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS v4 |
| Animations | Motion (Framer Motion) |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Express.js (TypeScript via `tsx`) |
| AI | Google Gemini (`@google/genai` v2) |
| State / DB | Simulated localStorage store (`store.ts`) |
| Database (planned) | Firebase Firestore |
| Payments | Razorpay (webhook simulation) |

---

## 🧪 Demo Data

The app ships with a pre-seeded in-memory store (`store.ts`) with three demo companies and users for every role:

| Company | Subscription Tier |
|---------|------------------|
| Apex Plumbing & Co | Free |
| VoltLine Electrical | Growth |
| Rapid HVAC Solutions | Scale |

Use **Sign Up** to create an account or **Login** with existing demo users across any company and role.

---

## 📄 License

This project is private. All rights reserved.

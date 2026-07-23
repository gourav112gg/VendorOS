# <img src="./frontend/public/vendoros-logo.png" alt="VendorOS Logo" width="40" height="40" style="vertical-align: middle; display: inline-block;" /> VendorOS

> **An AI-powered Field Service Management (FSM) platform** for home-services companies — plumbing, electrical, HVAC, and beyond.

VendorOS is a full-stack SaaS application that brings together order management, team coordination, inventory tracking, GST invoicing, storytelling scroll UI, standardized error handling ([files/errorhandling.md](file:///c:/Users/WELCOME%20JI/Desktop/vendoros/files/errorhandling.md)), and AI-driven operational insights under one roof — complete with a multi-role authentication system and a subscription-gated feature set.

> [!IMPORTANT]
> **Demo / Live Site Note**: The backend for VendorOS is hosted on Render's free tier. If the backend has been inactive for 15 minutes, Render will spin down the container. The next request will trigger a cold-start, taking 30–60 seconds to respond. Before running a live demo or testing logins, please open the backend URL in your browser once (or ping it) and wait a minute for the server to wake up.

---

## ✨ Key Features

### 🧑‍💼 Role-Based Access Control & Approvals
Four distinct roles, each with a dedicated dashboard:

| Role | Capabilities |
|------|-------------|
| **Owner** | Full admin control — manage team, approve join requests, view all analytics, configure subscriptions |
| **Manager** | Build & assign order stages, manage templates, dispatch workers, run AI risk analysis |
| **Worker** | View assigned jobs, update stage checklists, track completion, update progress via voice |
| **Customer** | Submit service requests, track order progress, view their own history |

* **Join Request Approval Flow**: When Managers or Workers sign up, their account remains in a pending state and they are presented with a pending screen. Company Owners review and approve pending join requests in their dashboard before these users can join and access data.

### 🔔 Real-Time Notifications Center
- Built-in notification center (bell icon with unread counts badge) polling every 10 seconds.
- Automatically notifies workers when they are assigned to an order stage.
- Automatically notifies company owners and assigned managers when a worker updates a stage's progress.

### 📋 Service Order Management
- Multi-stage orders with per-stage checklists assigned to specific workers.
- Order stages flow: `Unscheduled → Scheduled → Dispatched → In Progress → Completed`.
- Minimum-order-value threshold enforcement with owner approval workflows.
- Manager-created reusable **Stage Templates** per service domain.

### 🤖 AI Operations Copilot *(Growth & Scale tiers only)*
- Powered by **Google Gemini** (`gemini-3.5-flash`).
- Analyzes service orders for operational risk: scheduling complexity, location delays, safety concerns, weather impact.
- Returns a structured **risk score (0–100)**, reason, and a recommended mitigation action.
- Server-side subscription gating prevents API credit abuse.

### 🎨 AI Natural Language Theme Generator
- Describe a visual mood (e.g., "cyberpunk neon", "forest calm") and the app generates a full UI color palette.
- Falls back gracefully to deterministic HSL-based color generation when the API key is absent.

### 💰 GST Invoicing
- Auto-calculates CGST (9%) + SGST (9%) / IGST (18%).
- Invoice generation tied to completed service orders.
- Track paid/unpaid status per invoice.

### 📦 Inventory & Shipment Tracking
- Item-level stock management with configurable low-stock alert thresholds.
- Shipment status tracking: `Pending → Shipped → Delivered → Cancelled`.

### 📊 Analytics & Trust Score
- KPI overviews — order completion rates, revenue, team performance.
- **Trust Score** (0–100) derived from order completion rate, inventory health, and worker activity.
- **Spend Intelligence** — monthly category-level spend breakdowns with suggested cost actions.

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
├── DOCUMENTATION.md               # Main system documentation index
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
│       │   ├── UpgradePrompt.tsx
│       │   └── NotificationCenter.tsx # Polls and displays user notifications
│       ├── context/               # React Auth context (AuthProvider)
│       └── services/
│           ├── store.ts           # Simulated localStorage-backed database
│           └── subscriptionService.ts
├── backend/
│   ├── src/
│   │   ├── server.js              # Entry point — connects DB and starts server
│   │   ├── app.js                 # Express app — all routes registered here
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Company.js
│   │   │   ├── Order.js
│   │   │   ├── Inventory.js
│   │   │   ├── Domain.js
│   │   │   ├── Notification.js    # Notifications collection schema
│   │   │   └── JoinRequest.js     # Pending enrollment requests schema
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── notification.controller.js
│   │   │   └── joinRequest.controller.js
```

### Directory Architecture & Flows

Detailed architectural specifications, folder maps, and functional flows are available here:
- 💻 **Frontend Details**: [`files/frontend.md`](files/frontend.md)
- ⚙️ **Backend Details**: [`files/backend.md`](files/backend.md)
- 🔒 **Security Details**: [`files/security.md`](files/security.md)
- 📖 **General Overview**: [`DOCUMENTATION.md`](DOCUMENTATION.md)

### Backend REST API Routes (`backend/src/` — port 5000)

See [`backend/README.md`](backend/README.md) for the full API reference. Key route groups:

| Prefix | Roles | Description |
|--------|-------|-------------|
| `POST /api/auth/...` | None | Signup + login for all 4 roles |
| `{any} /api/orders/...` | owner, manager, worker | Order lifecycle management |
| `{any} /api/inventory/...` | owner, manager | Stock management |
| `{any} /api/join-requests/...` | owner, manager, worker | Company join requests & approvals |
| `GET /api/notifications/...` | owner, manager, worker | Retrieve/dismiss unread user alerts |
| `PUT /api/users/profile` | owner, manager, worker | Edit name, email (synced with Firebase), and phone |

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

## 📄 License

This project is private. All rights reserved.

# VendorOS — Frontend Documentation

This document describes the frontend file structure, key features, and end-to-end user flows of the VendorOS React client application.

---

## 📁 File Structure

The frontend is built using **React (Vite)** and **TypeScript**, structured as follows:

```
frontend/
├── index.html                   # HTML Entry Point
├── package.json                 # Dependencies and dev/build scripts
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configurations
└── src/
    ├── main.tsx                 # App bootstrapping
    ├── App.tsx                  # Root component (routing, shortcuts, global state)
    ├── index.css                # Global styles (Tailwind / Vanilla CSS)
    ├── types.ts                 # Type definitions (User, Company, Order, Inventory, etc.)
    │
    ├── context/
    │   └── AuthContext.tsx      # Auth state, login/signup actions, Firebase hookup, JWT management
    │
    ├── pages/                   # Main page layouts
    │   ├── Login.tsx            # Unified login page (with tabs, presets, and input resets)
    │   ├── SignUp.tsx           # SignUp page (Start Company, Join Vendor, Client/Customer)
    │   ├── OwnerDashboard.tsx   # Dashboard for Company Owner role
    │   ├── ManagerDashboard.tsx # Dashboard for Operations Manager role
    │   ├── WorkerDashboard.tsx  # Dashboard for Field Service Worker role
    │   ├── CustomerDashboard.tsx# Dashboard for Client/Customer role
    │   └── PublicCompanyProfile.tsx # Unauthenticated public-facing company profile
    │
    ├── components/              # Reusable UI widgets and tabs
    │   ├── Navigation.tsx       # Sidebar and Top navigation bar customized by role
    │   ├── SettingsPanel.tsx    # Owner settings, configurations, and API keys
    │   ├── ThemeManager.tsx     # Color customization system (AI theme generation & HSL fallback)
    │   ├── KpiOverview.tsx      # Charts and KPI metrics display
    │   ├── AiCopilotTab.tsx     # Gemini AI risk analysis UI widget
    │   ├── AnalyticsTab.tsx     # Performance analytics charts
    │   ├── InvoicesTab.tsx      # GST invoice management list & generation
    │   ├── TrustScoreTab.tsx    # Trust score recalculation log & indicator
    │   ├── ActivityLog.tsx      # Audit log list
    │   ├── UpgradePrompt.tsx    # Subscription tier gating modal
    │   └── ShortcutBadge.tsx    # Inline keyboard shortcut display
    │
    ├── services/
    │   ├── api.ts               # REST API client (endpoints, fetch wrappers, auth headers)
    │   ├── firebase.ts          # Firebase Client SDK initialization
    │   ├── firestoreService.ts  # Firestore client queries
    │   ├── store.ts             # LocalStorage-backed state sync
    │   └── subscriptionService.ts # Razorpay checkout & subscription handlers
    │
    └── utils/
        ├── deliveryTracker.ts   # Live location coordinate generator
        └── imageCompressor.ts   # Client-side logo compression before upload
```

---

## 🚀 Core Features & Flows

### 1. Unified Authentication Flow
* **Login Tab Resets**: The `Login.tsx` page includes tabs for "Start a Company" (Owner), "Join a Vendor" (Manager/Worker), and "Client / Customer" (Customer). When switching between tabs, all email, password, and error states are cleared to prevent accidental category-role login mismatches.
* **Demo Preset Bypass**: Quick Access buttons prepopulate credential inputs with pre-seeded demo accounts. For testing efficiency, these demo accounts automatically bypass Firebase ID Token validation and account lockouts in the backend.
* **Session Syncing**: Successfully logged-in user and company records are automatically synchronized to the local state manager (`store.ts`) for consistent client-side experience.

### 2. Live Company Name Check (Sign Up)
* During the **Start Company** signup flow, as the owner types the company name, the frontend queries `dbStore.isCompanyNameAvailable()` to verify availability.
* Green checkmark or red warning alerts are dynamically shown depending on whether the company name is unique.

### 3. GST Calculation & Invoicing
* **Calculations**: Auto-calculates tax breakdown: CGST (9%) + SGST (9%) or IGST (18%) based on the service order's final base value.
* **Billing Tab**: Accessed via the `InvoicesTab.tsx` component in the owner/manager dashboard to generate and print PDF-friendly tax invoices for completed orders.

### 4. Color Customization (AI Theme Generator)
* Built inside `ThemeManager.tsx`, users can describe a visual mood (e.g., *"cyberpunk neon"*, *"minimalist slate"*).
* The prompt is sent to `/api/generate-theme` (calling Gemini `gemini-3.5-flash`).
* If the server has no Gemini API key configured, the system falls back to a deterministic HSL-based color generation logic using the string's character codes.

### 5. Keyboard Shortcuts
* Pressing `?` toggles a modal overlay listing available hotkeys.
* Global keyboard event listeners in `App.tsx` capture key combinations to instantly navigate:
  * `Ctrl + D` → Dashboard
  * `Ctrl + S` → Settings
  * `Ctrl + C` → AI Copilot
  * `Ctrl + I` → Invoices
  * `Ctrl + T` → Trust Score log

---

## 🛠️ State Management & API Client
* **Simulated Local Store (`store.ts`)**: Synchronizes local state to `localStorage` under `vendoros_simulated_db`. The database schema maps MongoDB formats to ensure cross-compatibility between offline mock state and live API payloads.
* **API Client (`api.ts`)**: Base URL is configured dynamically via the environment variable `VITE_API_URL`, defaulting to `http://localhost:5000` for local dev. All requests append the JWT bearer token retrieved from `AuthContext` to authenticate requests.

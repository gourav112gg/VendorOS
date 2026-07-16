# VendorOS — Backend Documentation

This document describes the backend folder structure, API design, security controls, and key functional services of the VendorOS server application.

---

## 📁 File Structure

The backend is built as a **Node.js Express** REST API, structured as follows:

```
backend/
├── package.json                 # Backend dependencies, dev & start script configurations
├── .env                         # Server environment configurations (ports, credentials, database URIs)
└── src/
    ├── server.js                # Server entry point (starts Express on configured PORT)
    ├── app.js                   # Application configurations, Express middleware, routing mapping, CORS setup
    │
    ├── config/
    │   └── db.js                # Mongoose client initialization and MongoDB connection setup
    │
    ├── middleware/
    │   ├── auth.middleware.js   # Verify JWT bearer tokens and populate req.user
    │   ├── role.middleware.js   # Validate role authorization levels
    │   ├── validateSchema.js    # Request body schemas validation (Zod schema checking)
    │   └── signupRateLimiter.js # Signup rate limits to prevent brute-force abuse
    │
    ├── controllers/             # Endpoint handler logic
    │   ├── auth.controller.js   # Login, signup, resetPassword triggers, rate-limit logs, lockouts
    │   ├── company.controller.js# Company profile details updates
    │   ├── customer.controller.js# Customer order history, registration, verification codes
    │   ├── worker.controller.js # Worker assignment list, voice transcriptions parser
    │   ├── order.controller.js  # Order state, creation, assignment, verification check, retry limit
    │   ├── inventory.controller.js# Add, edit, check inventory thresholds
    │   ├── domain.controller.js # Create and edit service domains
    │   ├── dashboard.controller.js# KPI, revenue calculations, manager statistics aggregation
    │   └── trust.controller.js  # Recalculate company trust score
    │
    ├── routes/                  # Express Router mappings
    │   ├── auth.routes.js       # Authentication routers (login, signup, passwordReset)
    │   ├── customer.routes.js   # Customer queries and verification codes check
    │   ├── worker.routes.js     # Worker tasks management routes
    │   ├── order.routes.js      # Orders routes
    │   ├── inventory.routes.js  # Inventory routes
    │   ├── domain.routes.js     # Domain routes
    │   └── dashboard.routes.js  # KPI dashboard routes
    │
    ├── models/                  # MongoDB schemas (Mongoose)
    │   ├── User.js              # User database model
    │   ├── Company.js           # Company database model
    │   ├── Order.js             # Service Order database model
    │   ├── Inventory.js         # Inventory database model
    │   ├── Domain.js            # Service Domain database model
    │   ├── LoginAttempt.js      # Brute force login attempt logs
    │   └── RateLimit.js         # IP-based rate limiting records
    │
    └── services/                # Integration service adapters
        ├── risk.service.js      # Operational risk evaluation (rule-engine rules & Gemini option)
        ├── whatsapp.service.js  # WhatsApp notifications dispatch wrapper
        └── payment.service.js   # Razorpay webhook and checkout triggers
```

---

## 🔒 Security & Operations Flow

### 1. CORS Domain Verification
* Configured in `app.js` with dynamically evaluated rules to support all Vercel branch deployments, Firebase static domains, and multi-port local testing:
```javascript
  origin: (origin, callback) => {
    if (
      !origin || 
      allowedOrigins.includes(origin) || 
      origin.endsWith(".vercel.app") ||
      origin.endsWith(".firebaseapp.com") ||
      origin.endsWith(".web.app") ||
      /^http:\/\/localhost(:\d+)?$/.test(origin) || 
      /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)
    ) {
      callback(null, true);
    }
  }
```

### 2. Rate-Limiting & Anti-Brute Force Protection
* **IP-based Limit**: Restricts client requests (maximum 10/IP/minute) in the unified login flow.
* **Progressive Delay**: Successive login failures scale delays exponentially ($2^{attempts - 1}$ seconds) to slow down automated scripts.
* **Account Lockout**: After 5 consecutive failures, the account is locked in MongoDB for 15 minutes.
* **Demo Preset Bypass**: Designated testing emails (e.g. `kaushal@gmail.com`, `dave@gmail.com`, `amit@gmail.com`) evaluate at the absolute entry point of the controller, bypassing lockouts, delays, and Firebase checks to ensure zero-downtime testing.

### 3. Verification Code & Lockouts (Delivery)
* At creation, every order receives a random 6-character alphanumeric verification code.
* The worker must enter this code on-site to transition the order to `delivered`.
* If entered incorrectly 5 times, the field is locked, a alert notification is dispatched, and only a Manager/Owner can override the lockout.

---

## 📈 Database Integration
* **MongoDB (Mongoose)**: Connected via `.env` parameter `MONGO_URI`. Mongoose models automatically populate nested records (e.g. populating the user's referenced `company` record on sign-in).
* **Seeding Script (`seed_demo_accounts.js`)**: Seeds base demo credentials, matching company links, and domain definitions to standardise testing instances.

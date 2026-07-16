# VendorOS Backend

> Node.js + Express REST API with MongoDB Atlas — the server-side backbone of VendorOS.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js v5 |
| Database | MongoDB Atlas (via Mongoose v9) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | express built-ins + validator |
| Dev tooling | nodemon |

---

## Folder Structure

```
backend/
├── src/
│   ├── server.js              # Entry point — connects DB and starts server
│   ├── app.js                 # Express app — all routes registered here
│   ├── config/
│   │   └── db.js              # MongoDB connection (Mongoose)
│   ├── models/
│   │   ├── User.js            # Roles: owner | manager | worker | customer
│   │   ├── Company.js         # Company profile + trust score
│   │   ├── Order.js           # Service orders with status lifecycle
│   │   ├── Inventory.js       # Product/item stock with low-stock alerts
│   │   └── Domain.js          # Service domains (Plumbing, Electrical, etc.)
│   ├── controllers/
│   │   ├── auth.controller.js          # Owner/Manager/Worker signup+login
│   │   ├── customer.controller.js      # Customer signup, login, order history
│   │   ├── manager.controller.js       # Manager CRUD (owner only)
│   │   ├── worker.controller.js        # Worker CRUD + availability toggle
│   │   ├── order.controller.js         # Order CRUD + assign manager/worker
│   │   ├── inventory.controller.js     # Inventory CRUD + stock update
│   │   ├── domain.controller.js        # Domain CRUD (owner only)
│   │   ├── dashboard.controller.js     # Owner dashboard KPI stats
│   │   ├── managerDashboard.controller.js  # Manager dashboard stats
│   │   └── trust.controller.js         # Trust score computation
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── customer.routes.js
│   │   ├── manager.routes.js
│   │   ├── worker.routes.js
│   │   ├── order.routes.js
│   │   ├── inventory.routes.js
│   │   ├── domain.routes.js
│   │   ├── dashboard.routes.js
│   │   └── managerDashboard.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js   # JWT Bearer token verification
│   │   ├── role.middleware.js   # Role-based access control
│   │   └── error.middleware.js  # Global error handler (stub)
│   ├── services/
│   │   ├── risk.service.js      # Rules-based risk engine (TRD §5)
│   │   ├── whatsapp.service.js  # WhatsApp Business Cloud API (stub)
│   │   └── payment.service.js  # Razorpay integration (stub)
│   └── utils/
│       └── generateToken.js     # JWT token generator (7-day expiry)
├── ml-model/
│   └── README.md               # Placeholder for future ML risk model
├── .env.example                # Environment variable template
├── .gitignore
└── package.json
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/vendoros
JWT_SECRET=your_long_random_secret
```

> ⚠️ **Never commit `.env`** — it is in `.gitignore`.

---

## Running Locally

```bash
# From the backend/ directory:
npm install
npm run dev      # starts with nodemon on port 5000
```

Or for production:
```bash
npm start        # starts with node (no hot reload)
```

---

## API Reference

All authenticated routes require a `Authorization: Bearer <token>` header.  
Tokens are returned from login/signup endpoints and expire in **7 days**.

### Auth  `POST /api/auth/...`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/owner/signup` | None | Register owner + create company |
| POST | `/api/auth/owner/login` | None | Owner login → JWT |
| POST | `/api/auth/manager/login` | None | Manager login → JWT |
| POST | `/api/auth/worker/login` | None | Worker login → JWT |
| POST | `/api/auth/customer/signup` | None | Customer registration |
| POST | `/api/auth/customer/login` | None | Customer login → JWT |

---

### Orders  `{method} /api/orders/...`

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/api/orders` | owner, manager | Create order |
| GET | `/api/orders` | owner, manager | List all company orders |
| GET | `/api/orders/:id` | owner, manager | Get single order |
| PUT | `/api/orders/:id` | owner, manager | Update order |
| DELETE | `/api/orders/:id` | owner | Delete order |
| PATCH | `/api/orders/assign-manager` | owner | Assign manager to order |
| PATCH | `/api/orders/assign-worker` | owner, manager | Assign worker to order |
| GET | `/api/orders/worker/my-orders` | worker | Worker's assigned orders |
| PATCH | `/api/orders/worker/:id/status` | worker | Update order status |

---

### Inventory  `{method} /api/inventory/...`

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/inventory` | owner, manager | List all products |
| GET | `/api/inventory/:id` | owner, manager | Get single product |
| POST | `/api/inventory` | owner, manager | Add product |
| PUT | `/api/inventory/:id` | owner, manager | Update product |
| DELETE | `/api/inventory/:id` | owner | Delete product |
| PATCH | `/api/inventory/:id/stock` | owner, manager | Update stock quantity |

---

### Managers  `{method} /api/managers/...`

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/managers` | owner | List all managers |
| POST | `/api/managers/create` | owner | Create manager account |
| PUT | `/api/managers/:id` | owner | Update manager |
| DELETE | `/api/managers/:id` | owner | Delete manager |

---

### Workers  `{method} /api/workers/...`

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/workers` | owner, manager | List all workers |
| POST | `/api/workers/create` | owner, manager | Create worker account |
| PUT | `/api/workers/:id` | owner, manager | Update worker |
| DELETE | `/api/workers/:id` | owner, manager | Delete worker |
| PATCH | `/api/workers/:id/availability` | owner, manager | Toggle availability |

---

### Customers  `{method} /api/customers/...`

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/customers/my-orders` | customer | Customer's own orders |
| GET | `/api/customers/profile` | customer | Customer profile |

---

### Domains  `{method} /api/domains/...`

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/domains` | owner, manager | List all service domains |
| GET | `/api/domains/:id` | owner, manager | Get single domain |
| POST | `/api/domains` | owner | Create domain |
| PUT | `/api/domains/:id` | owner | Update domain |
| DELETE | `/api/domains/:id` | owner | Delete domain |

---

### Dashboard  `GET /api/dashboard/...`

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/dashboard` | owner | Owner KPI stats (orders, revenue, inventory, team) |
| GET | `/api/manager-dashboard` | manager | Manager stats (orders, workers) |

---

### Trust Score  

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/trust-score` | owner | Computed 0–100 trust score + factor breakdown |

---

### Risk Engine  

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/api/risk/analyze` | owner, manager | Analyze order risk score per TRD §5 |

**Request body:**
```json
{
  "orderId": "optional_mongo_id",
  "deliveryDate": "2026-07-20T00:00:00Z",
  "stagesRemaining": 3,
  "totalStages": 5,
  "assignedWorker": {
    "id": "worker_mongo_id",
    "activeTaskCount": 2,
    "activeTaskLoadScore": 40
  }
}
```

**Response:**
```json
{
  "success": true,
  "riskPercentage": 62,
  "reason": "Moderate risk: 4 day(s) until delivery with 3 stages outstanding.",
  "suggestedAction": "Check in with the assigned worker and confirm realistic completion date."
}
```

---

## Order Status Lifecycle

```
Pending → Accepted → Packed → Out For Delivery → Delivered
                                                → Cancelled (any stage)
```

---

## Trust Score Formula

```
score = (orderCompletionRate × 0.50) + (inventoryLevelRating × 0.30) + (workerActivityScore × 0.20)
```

| Factor | Definition |
|--------|-----------|
| orderCompletionRate | % orders with status "Delivered" |
| inventoryLevelRating | % items with quantity > minimumStock |
| workerActivityScore | % workers with isAvailable = true |

---

## Frontend Connection

The frontend connects via [`frontend/src/services/api.ts`](../frontend/src/services/api.ts).

Configure the API URL in the **frontend** `.env`:
```env
VITE_API_URL=http://localhost:5000   # local development
VITE_API_URL=https://your-backend.railway.app  # production
```

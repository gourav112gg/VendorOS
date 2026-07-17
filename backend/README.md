# VendorOS Backend

> Node.js + Express REST API with MongoDB Atlas — the server-side backbone of VendorOS.

> [!IMPORTANT]
> **Production Deployment Note**: This backend is designed to deploy on Render's free tier. If the service is inactive for 15 minutes, Render spins down the server. To avoid cold-start delays during a demo, ping the server URL to wake the service up.

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
│   │   ├── Domain.js          # Service domains (Plumbing, Electrical, etc.)
│   │   ├── Notification.js    # Real-time alert notifications collection
│   │   └── JoinRequest.js     # Pending manager/worker company join requests
│   ├── controllers/
│   │   ├── auth.controller.js          # Owner/Manager/Worker signup+login
│   │   ├── user.controller.js          # Update name, phone, role, email (Firebase sync)
│   │   ├── customer.controller.js      # Customer signup, login, order history
│   │   ├── manager.controller.js       # Manager CRUD (owner only)
│   │   ├── worker.controller.js        # Worker CRUD + availability toggle
│   │   ├── order.controller.js         # Order CRUD + assign manager/worker + notifications trigger
│   │   ├── inventory.controller.js     # Inventory CRUD + stock update
│   │   ├── domain.controller.js        # Domain CRUD (owner only)
│   │   ├── dashboard.controller.js     # Owner dashboard KPI stats
│   │   ├── managerDashboard.controller.js  # Manager dashboard stats
│   │   ├── trust.controller.js         # Trust score computation
│   │   ├── notification.controller.js  # Retrieve and read user notifications
│   │   └── joinRequest.controller.js   # Submit, fetch, and approve/reject company requests
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── customer.routes.js
│   │   ├── manager.routes.js
│   │   ├── worker.routes.js
│   │   ├── order.routes.js
│   │   ├── inventory.routes.js
│   │   ├── domain.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── managerDashboard.routes.js
│   │   ├── notification.routes.js
│   │   └── joinRequest.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js   # JWT Bearer token verification
│   │   └── role.middleware.js   # Role-based access control
```

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

## Security & Testing Access Controls

To protect production instances while maintaining testability, the login API enforces several access policies:
- **IP-Based Rate Limiting**: Limit of 10 login requests per client IP per minute.
- **Progressive Authentication Delays**: Sequential failures trigger an exponential wait delay ($2^{\text{attempts}-1}$ seconds) to slow brute force attacks.
- **Account Lockout**: Accumulating 5 failed login attempts locks the user out in MongoDB for 15 minutes.
- **Demo Account Bypasses**: The pre-seeded demo accounts bypass all lockouts, progressive delays, and Firebase verification.
  - Owners: `kaushal@gmail.com`, `garggourav647@gmail.com`, `alice@apex.com`
  - Managers: `bob@apex.com`, `rahul@gmail.com`
  - Workers: `amit@gmail.com`, `charlie@apex.com`
  - Customers: `dave@gmail.com`

---

## API Reference

All authenticated routes require a `Authorization: Bearer <token>` header.  
Tokens are returned from login/signup endpoints and expire in **7 days**.

### Auth  `POST /api/auth/...`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/owner/signup` | None | Register owner + create company |
| POST | `/api/auth/owner/login` | None | Owner login → JWT |
| POST | `/api/auth/vendor/signup` | None | Register manager/worker + pending request |
| POST | `/api/auth/manager/login` | None | Manager login → JWT |
| POST | `/api/auth/worker/login` | None | Worker login → JWT |
| POST | `/api/auth/customer/signup` | None | Customer registration |
| POST | `/api/auth/customer/login` | None | Customer login → JWT |

---

### User Profile & Teams  `{method} /api/users/...`

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/users/profile` | All | Fetch logged-in user profile |
| PUT | `/api/users/profile` | All | Update profile details (Name, Phone, Email with Firebase sync) |
| PATCH | `/api/users/promote` | Owner | Promote worker to manager (Body: `{ workerId }`) |

---

### Join Requests  `{method} /api/join-requests/...`

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/api/join-requests` | manager, worker | Submit pending request to join a company |
| GET | `/api/join-requests/pending` | owner | Fetch pending join requests for owner's company |
| PATCH | `/api/join-requests/:id` | owner | Approve or reject a join request (Body: `{ action: 'approve' \| 'reject' }`) |
| GET | `/api/join-requests/my-pending` | manager, worker | Fetch current user's active pending request |

---

### Notifications  `{method} /api/notifications/...`

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/notifications` | All | Fetch active unread notifications |
| PATCH | `/api/notifications/:id/read` | All | Mark single notification as read |
| PATCH | `/api/notifications/read-all` | All | Mark all notifications as read |

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
| PATCH | `/api/orders/assign-worker` | owner, manager | Assign worker to order (triggers notification) |
| GET | `/api/orders/worker/my-orders` | worker | Worker's assigned orders |
| PATCH | `/api/orders/worker/:id/status` | worker | Update order status (triggers notification to managers/owners) |

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

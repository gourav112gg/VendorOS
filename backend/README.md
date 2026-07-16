# 🚀 VendorOS Backend

![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)
![Express](https://img.shields.io/badge/Express.js-Backend-black?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

A scalable **Role-Based Vendor Management System** built using **Node.js, Express.js, MongoDB, Mongoose, and JWT Authentication**.

VendorOS is designed for manufacturing companies, wholesalers, and vendors to efficiently manage inventory, employees, customer orders, reports, analytics, and notifications through a secure REST API.

---

# 📖 Table of Contents

- Project Overview
- Features
- User Roles
- Tech Stack
- Project Structure
- Database Collections
- API Endpoints
- Authentication
- Notifications
- Reports & Analytics
- Security
- Future Enhancements
- Getting Started

---

# 📌 Project Overview

VendorOS provides a complete backend for vendor and business management.

It supports **four different user roles**, each with dedicated permissions.

- 👑 Owner
- 📋 Manager
- 👷 Worker
- 🛒 Customer

Each role accesses only the APIs allowed for that role using JWT authentication and role-based authorization.

---

# ✨ Core Features

## 🔐 Authentication

- Owner Signup
- Owner Login
- Manager Login
- Worker Login
- Customer Signup
- Customer Login
- JWT Authentication
- Password Hashing using bcrypt
- Protected Routes
- Role-Based Authorization

---

# 👑 Owner Module

The Owner has complete control over the system.

### Dashboard

- Total Orders
- Total Revenue
- Total Inventory Value
- Pending Orders
- Accepted Orders
- Packed Orders
- Delivered Orders
- Cancelled Orders

### Company Management

- Register Company
- Company Profile
- Trust Score
- Minimum Order Value
- Minimum Order Quantity

### Team Management

- Add Managers
- Add Workers
- View Employees
- Update Employees
- Delete Employees

### Inventory Management

- Add Product
- View Products
- Update Product
- Delete Product
- Low Stock Monitoring

### Order Management

- Create Order
- View Orders
- Update Orders
- Delete Orders
- Assign Manager
- Assign Worker

### Reports

- Sales Report
- Order Report
- Inventory Report

### Analytics

- Revenue Analytics
- Order Status Analytics
- Inventory Analytics

### Notifications

- New Customer Orders
- Manager Assignment
- Worker Assignment
- Mark Notification as Read

---

# 📋 Manager Module

Managers can manage production and dispatch operations.

### Dashboard

- Assigned Orders
- Inventory Access
- Worker Assignment

### Features

- View Orders
- Assign Workers
- Manage Order Workflow
- Receive Notifications

---

# 👷 Worker Module

Workers can manage only their assigned jobs.

### Dashboard

- Assigned Orders
- Completed Orders
- Pending Jobs

### Features

- View Assigned Orders
- Update Order Status

Supported Status

- Accepted
- Packed
- Out For Delivery
- Delivered
- Cancelled

Workers automatically receive notifications whenever a delivery is assigned.

---

# 🛒 Customer Module

Customers can place service requests and track them.

### Authentication

- Customer Signup
- Customer Login

### Dashboard

- My Orders
- Pending Orders
- Accepted Orders
- Packed Orders
- Delivered Orders

### Features

- Submit Service Request
- View Order History
- Track Individual Order

Customer information is automatically fetched from the logged-in account for improved security.

---

# 🔔 Notification System

Automatic notifications are generated for:

- New Customer Orders
- Manager Assignment
- Worker Assignment

Each notification contains

- Title
- Message
- Type
- Read Status
- Timestamp

---

# 📊 Reports

### Sales Report

- Total Orders
- Revenue
- Pending Orders
- Packed Orders
- Delivered Orders
- Cancelled Orders

### Order Report

- Complete Order List
- Assigned Manager
- Assigned Worker

### Inventory Report

- Total Products
- Inventory Value
- Total Stock
- Low Stock Products

---

# 📈 Analytics

VendorOS provides business analytics including

- Total Revenue
- Total Orders
- Inventory Value
- Product Count
- Order Status Distribution

---

# 🔒 Security Features

- JWT Authentication
- Password Encryption
- Protected APIs
- Role-Based Authorization
- Company Isolation
- Customer Data Protection

---

# 🛠 Tech Stack

## Backend

- Node.js
- Express.js

## Database

- MongoDB
- Mongoose

## Authentication

- JWT
- bcrypt.js

## Tools

- Nodemon
- Postman
- Git
- GitHub

---

# 📂 Project Structure

```
backend
│
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
│
├── app.js
├── server.js
├── package.json
└── README.md
```

---

# 🗄 Database Collections

- Users
- Companies
- Inventory
- Orders
- Notifications

---

# 🌐 REST API Endpoints

## Authentication

```
POST /api/auth/owner/signup
POST /api/auth/owner/login

POST /api/auth/manager/login

POST /api/auth/worker/login

POST /api/auth/customer/signup
POST /api/auth/customer/login
```

---

## Team

```
POST /api/team/manager
POST /api/team/worker

GET /api/team/managers
GET /api/team/workers

PUT /api/team/:id
DELETE /api/team/:id
```

---

## Inventory

```
POST /api/inventory

GET /api/inventory

GET /api/inventory/:id

PUT /api/inventory/:id

DELETE /api/inventory/:id
```

---

## Orders

```
POST /api/orders

GET /api/orders

GET /api/orders/:id

PUT /api/orders/:id

DELETE /api/orders/:id

PATCH /api/orders/assign-manager

PATCH /api/orders/assign-worker
```

---

## Worker

```
GET /api/orders/worker/my-orders

PATCH /api/orders/worker/:id/status
```

---

## Customer

```
GET /api/customer/dashboard

POST /api/customer/orders

GET /api/customer/orders

GET /api/customer/orders/:id
```

---

## Notifications

```
GET /api/notifications

PATCH /api/notifications/:id
```

---

## Reports

```
GET /api/reports/sales

GET /api/reports/orders

GET /api/reports/inventory
```

---

## Analytics

```
GET /api/analytics
```

---

# ✅ Completed Modules

- JWT Authentication
- Owner Module
- Manager Module
- Worker Module
- Customer Module
- Company Management
- Team Management
- Inventory Management
- Order Management
- Customer Service Requests
- Customer Order Tracking
- Notifications
- Reports
- Analytics
- Role-Based Access Control

---

# 🚀 Future Enhancements

## 🤖 AI Features

- AI Risk Analysis
- Demand Forecasting
- Smart Worker Assignment
- Inventory Prediction
- AI Order Prioritization

---

## 📱 Real-Time Features

- Socket.IO Live Tracking
- Live Notifications
- Live Dashboard Updates
- Live Inventory Updates

---

## 💳 Subscription System

- Free Plan
- Starter Plan
- Business Plan
- Enterprise Plan
- Razorpay Subscription Integration

---

## 📄 PDF & Documents

- Invoice Generation
- Delivery Challan
- Purchase Orders
- Export Reports (PDF/Excel)

---

## 📧 Communication

- Email Notifications
- OTP Verification
- Password Reset
- Order Confirmation Emails

---

## 📲 WhatsApp Integration

- WhatsApp Order Placement
- Order Status Updates
- Invoice Sharing
- Delivery Notifications

---

## 📍 Logistics

- GPS Delivery Tracking
- Delivery Timeline
- Route Optimization
- ETA Calculation

---

## 📈 Advanced Analytics

- Monthly Reports
- Yearly Reports
- Sales Trends
- Customer Insights
- Employee Performance
- Top Selling Products

---

## 🔐 Security Improvements

- Two-Factor Authentication (2FA)
- Refresh Tokens
- Rate Limiting
- Login History
- Audit Logs

---

# 🎯 Current Status

✅ Authentication System Complete

✅ Role-Based Authorization Complete

✅ Company Management Complete

✅ Team Management Complete

✅ Inventory Management Complete

✅ Order Management Complete

✅ Customer Module Complete

✅ Worker Module Complete

✅ Manager Module Complete

✅ Notifications Complete

✅ Reports Complete

✅ Analytics Complete

VendorOS backend is now a strong foundation for a production-ready ERP and Vendor Management System.

---

# 👨‍💻 Developer

**Kaushal**

MERN Stack Developer

---

## ⭐ Support

If you found this project useful, consider giving the repository a ⭐ on GitHub.
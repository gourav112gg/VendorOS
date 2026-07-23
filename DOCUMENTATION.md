# <img src="./frontend/public/vendoros-logo.png" alt="VendorOS Logo" width="36" height="36" style="vertical-align: middle; display: inline-block;" /> VendorOS — Comprehensive System Documentation

Welcome to the VendorOS system documentation. This document provides an index and summary of the entire application architecture, operations workflows, database structures, storytelling scroll transitions, standardized error handling ([files/errorhandling.md](file:///c:/Users/WELCOME%20JI/Desktop/vendoros/files/errorhandling.md)), and security layers.

---

## 📖 Table of Contents
1. [SaaS Roles & Dashboards](#1-saas-roles--dashboards)
2. [Order Lifecycle & Stage Dispatching](#2-order-lifecycle--stage-dispatching)
3. [Real-Time Notification System](#3-real-time-notification-system)
4. [Company Enrollment & Join Request Workflow](#4-company-enrollment--join-request-workflow)
5. [AI Copilot & Theme Generation](#5-ai-copilot--theme-generation)
6. [Security, Rate Limits, and Phone Sanitization](#6-security-rate-limits-and-phone-sanitization)
7. [Standardized Error Handling Strategy](#7-standardized-error-handling-strategy)
8. [Directory Map & References](#8-directory-map--references)

---

## 1. SaaS Roles & Dashboards
VendorOS supports four distinct organizational roles:
* **Company Owner**: Full operational control. Can manage company metadata (description, address, thresholds), review analytics graphs, view audit logs, manage team members (promote workers to managers or delete accounts), and approve/reject company join requests.
* **Operations Manager**: Coordinates dispatches. Can create service orders, apply Stage Templates, assign specific workers to tasks, and run AI risk assessments.
* **Technician (Worker)**: Field staff. Views active jobs, marks checklist items complete on-site, and updates status via voice dictation.
* **Client (Customer)**: End-user. Submits orders, tracks real-time progress, views invoice breakdowns, and pays via Razorpay.

---

## 2. Order Lifecycle & Stage Dispatching
Orders progress through a structured workflow:
1. **Creation**: Customer submits an order or an Owner manually enters it.
2. **Threshold Verification**: Order value is compared against the company's minimum threshold. If below, production is held until accepted by the owner.
3. **Stage Configuration**: Managers build stages (e.g. Electrical, Plumbing) and assign workers.
4. **Execution**: Workers mark checklist tasks complete.
5. **Delivery & Code Verification**: On arrival, the worker enters the customer's 6-character code. Correct verification transitions the order to `delivered` and unlocks payment.

---

## 3. Real-Time Notification System
Notifications are triggered automatically by system events:
* **Worker Task Assignment**: When a manager assigns a worker to an order stage, the worker receives a notification alert.
* **Worker Status Update**: When a worker updates a stage's progress, notifications are dispatched to both the assigned manager and the company owner.
* **UI Component**: The `<NotificationCenter />` widget (a bell icon with an unread badge and dropdown alert list) is integrated into all dashboard headers, polling the backend every 10 seconds for new alerts.

---

## 4. Company Enrollment & Join Request Workflow
To prevent unauthorized users from accessing sensitive company data, a structured join-approval flow is enforced:
1. **Registration**: When a Worker or Manager signs up via standard email, their account is initialized with `company: null`.
2. **Join Request**: The signup automatically creates a pending `JoinRequest` record in MongoDB linking them to their selected company.
3. **Pending Intercept**: Upon logging in, the worker/manager is presented with a "Join Request Pending" screen and cannot access dashboards.
4. **Owner Review**: Company owners view requests under the "Pending Join Requests" section of the **Team** tab. Approving the request links the user to the company and grants dashboard access. Rejecting dismisses the request.
5. **Professional Settings**: Customers cannot access company/role settings. Workers/managers can change their company from settings, which issues a new pending request.

---

## 5. AI Copilot & Theme Generation
* **AI Copilot**: Leverages Google Gemini (`gemini-3.5-flash`) to analyze active orders. It evaluates worker load, deadlines, and complexity to compute a risk score (0–100), explain the risk, and suggest mitigations.
* **AI Theme Generator**: Allows users to specify a visual description (e.g., "warm forest") to generate a cohesive UI color scheme. Falls back to character-based HSL generation if no API key is set.

---

## 6. Security, Rate Limits, and Phone Sanitization
* **Authentication**: Token-based JSON Web Tokens (JWT) with a 7-day expiry.
* **Anti-Brute Force**: Enforces IP rate limiting (10 attempts/minute) and progressive login delays. Preset demo accounts bypass verification to expedite testing.
* **Phone Sanitization**: Empty phone numbers are stored as `undefined` rather than `""` (empty string). This prevents duplicate key conflicts on Mongoose's unique sparse indexes, resolving account creation issues.

---

## 7. Directory Map & References
For further information, please refer to:
* 💻 **Frontend Architecture**: [files/frontend.md](file:///c:/Users/WELCOME%20JI/Desktop/vendoros/files/frontend.md)
* ⚙️ **Backend Reference**: [files/backend.md](file:///c:/Users/WELCOME%20JI/Desktop/vendoros/files/backend.md)
* 🔒 **Security Mechanisms**: [files/security.md](file:///c:/Users/WELCOME%20JI/Desktop/vendoros/files/security.md)
* 📋 **Product Requirements (PRD)**: [files/VendorOS-PRD.md](file:///c:/Users/WELCOME%20JI/Desktop/vendoros/files/VendorOS-PRD.md)
* 🛠️ **Technical Requirements (TRD)**: [files/VendorOS-TRD.md](file:///c:/Users/WELCOME%20JI/Desktop/vendoros/files/VendorOS-TRD.md)

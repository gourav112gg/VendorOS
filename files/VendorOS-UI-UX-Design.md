# VendorOS — UI/UX Design System Specification

> Comprehensive design system, visual guidelines, typography, color palettes, and interaction models for the VendorOS application.

---

## 1. Design Philosophy & Aesthetic Goals

VendorOS is designed specifically for **operational workspaces and factory floors** where users (Owners, Managers, and Workers) require highly readable, glanceable, and resilient user interfaces under variable lighting conditions.

- **Rich Dark-First Aesthetics**: Built on a solid slate dark mode background (`#0A0A0A`) with subtle borders and glassmorphism. It feels premium, reduces eye strain, and works well on rugged screens.
- **Glanceable Hierarchy**: Uses bold typography, high-contrast statuses, and strict spacing so managers can monitor production status from across a room.
- **High-Contrast Touch Targets**: Large button pads and interactive cards designed for factory workers whose hands may be busy or wearing gloves.
- **Dynamic Adaptability**: Instant responsiveness between compact mobile views (used by workers on the go) and multi-column desktop grids (used by owners in the office).

---

## 2. Typography

The typography system is designed around two premium Google Fonts:
1. **Outfit** (Sans-serif, Geometric): Used for brand elements, main page headers, and dashboard metrics.
2. **Inter** (Sans-serif, Neutral/Highly readable): Used for body text, inputs, tables, labels, and system status messages.

### Typography Hierarchy

| Style | Font | Weight | Size | Usage |
|-------|------|--------|------|-------|
| Hero Title | Outfit | Light (300) | `36px` / `2.25rem` | Landing & Auth page titles |
| Section Header | Outfit | Medium (500) | `20px` / `1.25rem` | Dashboard section titles |
| KPI Metric | Outfit | Semi-Bold (600) | `24px` / `1.5rem` | Big numbers in KPI cards |
| Table Header | Inter | Bold (700) | `10px` / `0.625rem` | Uppercase, tracking-widest tables |
| Body Text | Inter | Regular (400) | `13px` / `0.812rem` | Paragraphs, descriptions |
| Data / Code | Inter | Medium (500) | `11px` / `0.687rem` | Monospace numbers, IDs, timestamps |

---

## 3. Color Systems & Themes

VendorOS supports **6 distinct theme configurations**, each with HSL color tokens mapped to CSS custom properties.

### Common Base Colors (All Themes)
- **Dark Background**: `hsl(0, 0%, 4%)` (`#0A0A0A`)
- **Card Background**: `hsl(0, 0%, 7%)` (`#111111`)
- **Border Default**: `hsl(0, 0%, 13%)` (`#222222`)
- **Text Primary**: `hsl(0, 0%, 90%)` (`#E5E5E5`)
- **Text Secondary**: `hsl(0, 0%, 53%)` (`#888888`)
- **Text Muted**: `hsl(0, 0%, 27%)` (`#444444`)

### Theme Accent Color Palettes

```
Slate (Default)     sage (Eco/Nature)   Sapphire (Corporate)
Accent: #FFFFFF     Accent: #10B981     Accent: #3B82F6
Hover:  #E5E5E5     Hover:  #059669     Hover:  #2563EB

Tokyo (Synthwave)   Warm (Amber)        Custom (AI Studio)
Accent: #EC4899     Accent: #F59E0B     Accent: (Generated)
Hover:  #DB2777     Hover:  #D97706     Hover:  (Generated)
```

---

## 4. Status Indicators & Badges

Status badges must use high-contrast HSL color pairings (dark background, saturated text) to remain readable on top of dark cards.

| Status | Text Color | Background | Usage |
|--------|------------|------------|-------|
| **Pending** | `hsl(35, 100%, 60%)` (Orange) | `hsla(35, 100%, 20%, 0.15)` | Initial order state |
| **Accepted** | `hsl(210, 100%, 65%)` (Blue) | `hsla(210, 100%, 20%, 0.15)` | Assigned to worker |
| **Packed** | `hsl(280, 100%, 70%)` (Purple) | `hsla(280, 100%, 20%, 0.15)` | Items ready for delivery |
| **Out For Delivery**| `hsl(200, 100%, 60%)` (Cyan) | `hsla(200, 100%, 20%, 0.15)` | Courier in transit |
| **Delivered** | `hsl(140, 100%, 60%)` (Green) | `hsla(140, 100%, 20%, 0.15)` | Complete and verified |
| **Cancelled** | `hsl(0, 100%, 65%)` (Red) | `hsla(0, 100%, 20%, 0.15)` | Void or deleted |

---

## 5. Layout & Navigation Systems

The interface adapts depending on the selected preference configuration.

### A. Sidebar Layout (Default Desktop)
- **Structure**: Permanent 240px wide left sidebar, with content filling the rest of the screen.
- **Sidebar Position**: Can be toggled to the **left** or **right** side.
- **Elements**: 
  - Logo and Company name at the top.
  - Vertical list of navigation items with icons.
  - Active profile widget and Quick Theme toggle at the bottom.

### B. Horizontal Header Layout (Classic Web)
- **Structure**: Full-width 64px header bar at the top of the screen.
- **Navigation Alignment**: Can be aligned to the **left** or **right** within the header.
- **Elements**: Brand on the left, horizontal nav links in the center, settings/profile on the far right.

---

## 6. Role-Gated Dashboard Layouts

### 🏛️ Owner Dashboard
- **Layout**: 3-column grid.
- **Column 1**: Core KPI summary cards (Total Revenue, Active Orders, Low Stock Alerts, Available Workers).
- **Column 2**: Master order list with real-time risk scores and quick-assignment dropdowns.
- **Column 3**: Team member list (with remove actions) and live Trust Score factors breakdown.

### 📋 Manager Dashboard
- **Layout**: 2-column grid.
- **Column 1**: Active orders list and stage workflow builder.
- **Column 2**: Checklist template manager (add/delete workflows) and domain-specific worker list.

### 🔧 Worker Dashboard
- **Layout**: Single-column vertical list optimized for mobile screens.
- **Header**: Availability toggle switch (Available / Busy).
- **Card**: Full-screen current task details, stage checklists, and a prominent **Voice Action Bar** for voice-based state transitions.

### 👤 Customer Dashboard
- **Layout**: Self-service profile page.
- **Components**: Interactive timeline showing order production progress, verification code badge, and Razorpay Test Checkout module.

---

## 7. Interactive Micro-Animations

- **Tab/Preference Sliders**: Uses spring-based physics for smooth sliding states when toggling between settings options (300ms transition curve).
- **Glassmorphism hover states**: Cards scale up slightly (`scale: 1.01`) and increase border opacity from `0.08` to `0.2` on hover.
- **Voice Action Pulse**: When a worker starts voice transcription, a glowing green pulse animation wraps the action bar to indicate the microphone is listening.
- **Preferences Change**: When a theme is swapped, a CSS transition applies colors over 400ms to avoid flashing.

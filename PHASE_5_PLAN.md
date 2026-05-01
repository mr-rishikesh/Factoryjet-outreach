# Phase 5: Frontend Dashboard — Planning Document

**Status:** ⏳ NOT STARTED — Planning Phase  
**Planned Completion:** TBD  
**Quality Target:** Production-Grade UI  

---

## 🎯 Mission

Build a user-facing web dashboard to manage, monitor, and optimize email sequences. Enable non-technical users to schedule campaigns, view real-time metrics, and analyze A/B test results.

---

## 📋 Requirements

### What Phase 5 Solves

**Current State (after Phases 3-4):**
- Sequences work via API
- Monitoring requires curl commands
- No UI for campaign management
- Users can't easily adjust send settings

**Phase 5 Adds:**
- Campaign scheduler (UI for sequence initialization)
- Real-time dashboard (active sequences, sends today)
- Performance analytics (reply rates, bounce rates)
- A/B test results viewer
- Pause/resume controls
- Email preview
- Contact list management

---

## 🏗️ Planned Architecture

### Frontend Stack

```
React (Frontend)
├── Components/
│   ├── CampaignScheduler.tsx      — Wizard to start sequences
│   ├── Dashboard.tsx              — Real-time metrics
│   ├── AnalyticsDashboard.tsx    — Charts & reports
│   ├── ABTestResults.tsx          — A/B variant analysis
│   ├── EmailPreview.tsx           — Preview generated emails
│   ├── ContactImport.tsx          — CSV upload & cleanup
│   └── SequenceControl.tsx        — Pause/resume buttons
├── Pages/
│   ├── Home.tsx                   — Overview
│   ├── Campaigns.tsx              — Active campaigns
│   ├── Analytics.tsx              — Performance dashboard
│   └── Settings.tsx               — Configuration
├── Services/
│   └── api.ts                     — API client (fetch wrappers)
└── Hooks/
    ├── useSequences.ts            — Sequence data hook
    ├── useAnalytics.ts            — Analytics data hook
    └── useCampaign.ts             — Campaign control hook
```

### Technology Choices

| Layer | Choice | Reason |
|-------|--------|--------|
| **Framework** | React 18+ | Modern, component-based |
| **Styling** | Tailwind CSS | Rapid UI development |
| **Charts** | Chart.js or Recharts | Interactive data viz |
| **State** | TanStack Query | Data fetching & caching |
| **Forms** | React Hook Form | Lightweight, performant |
| **Validation** | Zod | Type-safe validation |
| **Routing** | React Router v6 | Client-side routing |
| **Deployment** | Vercel or Netlify | Zero-config hosting |

---

## 🗂️ Key Pages & Components

### 1. Dashboard (Home)

**Purpose:** Real-time overview of all active campaigns

**Sections:**
- **KPI Cards:**
  - Active Sequences (count)
  - Emails Sent Today (count)
  - Reply Rate (%)
  - Bounce Rate (%)

- **Recent Activity (table):**
  - Contact name
  - Sequence type
  - Email number
  - Status (sent/failed/pending)
  - Timestamp

- **Quick Stats Chart:**
  - Emails sent per hour (line chart)
  - Status breakdown (pie chart)

**Data Source:** `/api/sequences/health` + `/api/sequences/analytics`

### 2. Campaigns Page

**Purpose:** Manage individual sequences

**Features:**
- List all contacts with sequence status
- Filter by: type (A/B), status (active/paused/completed), date range
- Actions: Pause, Resume, View Details
- Bulk actions: Pause all, Export CSV

**Table Columns:**
| Column | Data |
|--------|------|
| Name | firstName + lastName |
| Email | email |
| Sequence | Type A/B |
| Status | active/paused/completed/replied |
| Progress | 2/5 emails sent |
| Next Send | 2026-05-08 |
| Reply Rate | 50% (if replied) |

**Detail View:**
- Email history (all emails sent with preview)
- A/B variant assigned
- Next scheduled send
- Pause/Resume/Manual send buttons

### 3. Analytics Dashboard

**Purpose:** Campaign performance analysis

**Sections:**

**A. Campaign Summary:**
- Total started, active, completed, replied
- Overall reply rate
- Overall bounce rate
- Avg emails per sequence

**B. Performance Trends (Charts):**
- Emails sent per day (bar chart)
- Reply rate over time (line chart)
- Bounce rate over time (line chart)
- Status breakdown (pie chart)

**C. A/B Test Results:**
- Variant comparison table
- Reply rate per variant
- Statistical significance indicator
- Winner badge (if significant)

**D. Email Number Performance:**
- Email 1-5 send counts
- Reply rate per email
- Bounce rate per email
- Identify which emails drive replies

**Filters:**
- Date range (7/30/90 days)
- Sequence type (A/B)
- Custom metrics

### 4. A/B Test Results

**Purpose:** Deep dive into variant performance

**Display:**
```
Email 1 Subject Line Variants:
┌─────────────────────┬─────┬──────┬──────────┐
│ Variant             │ Sent│ Replies│ Reply % │
├─────────────────────┼─────┼──────┼──────────┤
│ TechBrand's costs   │ 20  │ 2    │ 10.0%   │ ← Winner
│ Help your team save │ 18  │ 0    │ 0%      │
│ Support cost crisis │ 17  │ 1    │ 5.9%    │
└─────────────────────┴─────┴──────┴──────────┘

Statistical Significance: Not yet significant (n=55, need n=100)
```

**Features:**
- Rank variants by performance
- Show confidence intervals
- Recommend winner when significant
- Allow exporting results

### 5. Campaign Scheduler

**Purpose:** Start new sequences (wizard flow)

**Step 1: Select Contacts**
- Upload CSV or select from existing
- Preview data (first 10 rows)
- Validate columns
- Show: X contacts ready, Y missing data

**Step 2: Choose Sequence Type**
- Radio buttons: Sequence A vs B
- Description of each
- Show: Expected timeline (19 days)

**Step 3: Configure Timing**
- Start date: Today or schedule future
- Time window: (use env defaults)
- Max daily sends: (default 50)

**Step 4: Review & Confirm**
- Summary: "Send Sequence A to 50 contacts starting today"
- Compliance check summary
- Launch button

**Success Page:**
- "✅ 50 sequences initialized"
- Link to view sequences
- Reminder: First emails send at 7am Tuesday/Wednesday

### 6. Email Preview

**Purpose:** Show exact email before sending

**Display:**
```
From: Bhavesh at FactoryJet <email@example.com>
To: john@company.com
Subject: TechBrand's support costs [Variant: primary]
---

Hi John,

Most brands doing $2M–$10M on Shopify spend $15K–$25K annually...

[Full email body]

---
To stop receiving these emails: [unsubscribe link]

FactoryJet Team
+91 9699977699
https://factoryjet.com
```

**Features:**
- Show token substitution
- Highlight unsubscribe link
- Copy to clipboard button
- Test send to own email

### 7. Contact Import & Management

**Purpose:** Upload and validate contact list

**Features:**
- Drag-drop CSV upload
- Column mapping wizard
- Data validation (email format, required fields)
- Deduplication
- Show validation report: "850 valid, 10 invalid, 5 duplicates"
- Bulk geocoding (optional: enrich with location data)

---

## 🔌 API Endpoints Used

### From Phase 3 (Email Delivery)

```javascript
// Sequence Operations
POST   /api/sequences/initialize
POST   /api/sequences/:id/send
POST   /api/sequences/:id/pause
POST   /api/sequences/:id/resume
POST   /api/sequences/:id/mark-replied
GET    /api/sequences/:id/status
GET    /api/sequences/due-for-email
GET    /api/sequences/analytics
GET    /api/sequences/health

// Contact Operations
GET    /api/contacts?limit=100&page=1
POST   /api/contacts
PATCH  /api/contacts/:id
GET    /api/contacts/stats
```

### From Phase 4 (Compliance) - NEW

```javascript
// Compliance & Audit
GET    /api/compliance/check
GET    /api/compliance/audit-log
POST   /api/compliance/verify-email
GET    /api/compliance/token-report
```

---

## 📊 Data Models (Frontend)

```typescript
// Campaign
interface Sequence {
  _id: string;
  contactId: string;
  sequenceType: 'A' | 'B';
  sequenceStatus: 'active' | 'paused' | 'completed' | 'replied' | 'bounced';
  currentEmailNumber: number;
  nextEmailScheduledFor: Date;
  emailHistory: Email[];
  abTest: ABTest;
}

// Analytics
interface Analytics {
  sequenceType: string;
  totalSequencesStarted: number;
  sequenceStatusBreakdown: Record<string, number>;
  emailsSentBreakdown: Record<string, number>;
  totalReplies: number;
  replyRate: number;
  bounceStats: {
    totalBounced: number;
    hardBounces: number;
    softBounces: number;
  };
  abTestResults: Record<string, {sent: number, replies: number, replyRate: number}>;
}

// Campaign Creation
interface CreateSequencePayload {
  sequenceType: 'A' | 'B';
  contactIds: string[];
  startDate: Date;
  maxDailySends: number;
}
```

---

## 🎨 UI/UX Considerations

### Design System

- **Colors:**
  - Primary: Blue (#2563eb)
  - Success: Green (#16a34a)
  - Error: Red (#dc2626)
  - Neutral: Gray (#6b7280)

- **Typography:**
  - Headings: Inter, bold
  - Body: Inter, regular

- **Components:**
  - Reusable card, button, form, table
  - Dark mode support (toggle in settings)

### Key UX Principles

1. **Real-time updates:** Use WebSockets or polling for live metrics
2. **Mobile-first:** Responsive design (mobile, tablet, desktop)
3. **Accessible:** WCAG 2.1 AA compliance (keyboard nav, screen readers)
4. **Performance:** Code splitting, lazy loading images
5. **Error handling:** Clear error messages, retry buttons

---

## 📈 Metrics & Tracking

**Frontend Telemetry (optional):**
- Page load times
- User actions (campaign created, email previewed, etc.)
- Error rates
- User retention

**Tool:** Posthog or custom analytics

---

## 🧪 Testing Strategy

- **Unit tests:** Components, hooks, utilities (Jest + React Testing Library)
- **E2E tests:** Critical user flows (Cypress or Playwright)
- **Visual regression:** Screenshot comparisons
- **Performance:** Lighthouse CI on PRs

---

## 🚀 Deployment Strategy

### Local Development

```bash
npm install
npm run dev  # Vite or Create React App
# http://localhost:5173
```

### Staging

```bash
npm run build
npm run preview  # Test production build locally
# Deploy to staging environment
```

### Production

```bash
# Deploy to Vercel or Netlify
# Auto-deployments from main branch
# Environment: Point to production API
```

---

## 🔐 Authentication & Authorization

**Not in Phase 5 scope**, but needed for production:

- Add JWT authentication
- Role-based access (admin, user, viewer)
- API key management
- Rate limiting

---

## 📊 Phase 5 File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── CampaignScheduler.tsx
│   │   ├── Dashboard.tsx
│   │   ├── AnalyticsDashboard.tsx
│   │   ├── ABTestResults.tsx
│   │   ├── EmailPreview.tsx
│   │   └── [other components]
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Campaigns.tsx
│   │   ├── Analytics.tsx
│   │   └── Settings.tsx
│   ├── hooks/
│   │   ├── useSequences.ts
│   │   ├── useAnalytics.ts
│   │   └── useCampaign.ts
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 📈 Success Criteria

- ✅ Dashboard shows real-time metrics (auto-refresh every 30s)
- ✅ Campaign scheduler allows creating sequences in <2 minutes
- ✅ Analytics show reply rates, bounce rates, trends
- ✅ A/B test results identify winning variants
- ✅ Email preview matches sent email exactly
- ✅ Mobile responsive (works on phones/tablets)
- ✅ Load times <3s on 4G connection
- ✅ No console errors or warnings

---

## 🔄 Dependency Chain

- **Prerequisite:** Phases 1-4 complete & API stable
- **Blocks:** None (final phase of initial roadmap)
- **Future:** User authentication, advanced reporting

---

## 📚 Related Documentation

- `PHASE_3_IMPLEMENTATION.md` — Email delivery
- `PHASE_4_PLAN.md` — Compliance checklist
- `backend/DNS_SETUP.md` — Infrastructure

---

## 🗓️ Estimated Timeline

- **Setup & boilerplate:** 1 week
- **Core components:** 2 weeks
- **Dashboard & analytics:** 2 weeks
- **A/B test visualizations:** 1 week
- **Styling & polish:** 1 week
- **Testing & QA:** 1 week
- **Total:** 8-10 weeks

---

**Current Status:** Planning Document  
**Planned Start:** After Phase 4 complete  
**Dependencies:** Phases 1-4  
**Target User:** Campaign managers, non-technical staff

---

*Created: May 1, 2026*  
*Purpose: Guide for Phase 5 implementation*  
*Vision: Beautiful, intuitive dashboard for managing cold email campaigns at scale*

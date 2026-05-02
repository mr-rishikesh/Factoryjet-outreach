# FactoryJet Email Outreach Platform - Complete Architecture

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Core Features](#core-features)
5. [Data Models](#data-models)
6. [API Architecture](#api-architecture)
7. [Frontend Architecture](#frontend-architecture)
8. [Backend Services](#backend-services)
9. [Email Workflow](#email-workflow)
10. [Compliance & Safety](#compliance--safety)
11. [Configuration & Environment](#configuration--environment)
12. [Deployment & DevOps](#deployment--devops)

---

## System Overview

**FactoryJet** is a cold email outreach automation platform that enables sales teams to:
- Upload contact lists (CSV from Apollo)
- Manage email sequences (A/B testing)
- Send personalized cold emails at scale
- Track replies and engagement
- Monitor compliance and deliverability
- Analyze campaign performance

### Architecture Pattern: **Modular Full-Stack with Service Layer**

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React 19)                     │
│                    Dashboard + Pages (Vite 8)                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP REST API
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Routers (email, contact, sequence, delivery, compliance) │   │
│  └──────────────────┬───────────────────────────────────────┘   │
│                     │                                            │
│  ┌──────────────────▼───────────────────────────────────────┐   │
│  │  Controllers & Services                                  │   │
│  │  - emailAction.controller (bulk send, followup)         │   │
│  │  - sequenceService (orchestration, scheduled sends)     │   │
│  │  - auditLogger (compliance tracking)                    │   │
│  │  - suppressionManager (blocklist)                       │   │
│  │  - emailVerifier (DNS validation)                       │   │
│  │  - complianceChecker (SPF/DKIM/list quality)          │   │
│  └──────────────────┬───────────────────────────────────────┘   │
│                     │                                            │
│  ┌──────────────────▼───────────────────────────────────────┐   │
│  │  Email Service (Nodemailer + Gmail SMTP)                │   │
│  │  - Format body (personalization + unsubscribe link)    │   │
│  │  - Send via SMTP                                        │   │
│  │  - Track delivery status                                │   │
│  └──────────────────┬───────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   MongoDB Atlas      │
        │  (Cloud Database)    │
        └──────────────────────┘
```

---

## Technology Stack

### Frontend
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | React | 19.2.4 |
| Build Tool | Vite | 8.0.0 |
| Styling | Tailwind CSS | 4.2.1 |
| Icons | Lucide React | 0.577.0 |
| Routing | React Router DOM | 7.13.1 |
| Notifications | React Hot Toast | 2.6.0 |
| HTTP Client | Fetch API (native) | - |

### Backend
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Runtime | Node.js | JavaScript server |
| Framework | Express.js | REST API server |
| Database | MongoDB Atlas | Cloud NoSQL database |
| Email | Nodemailer | SMTP email sending |
| CSV Parsing | csv-parser | CSV file upload processing |
| File Upload | Multer | Multipart form data handling |
| Scheduling | node-cron | Cron job scheduling |
| AI/LLM | Groq API | Email body generation |
| DNS | Node.js dns/promises | Email verification |

### DevOps & Infrastructure
| Component | Technology |
|-----------|-----------|
| Database Hosting | MongoDB Atlas (Cloud) |
| Process Manager | Node.js (development) |
| API Gateway | Express.js built-in |
| Environment Config | dotenv |

---

## Project Structure

```
c:\FactoryJet\email\my emil contact project\
│
├── frontend/                          # React application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx          # Main contact table & stats
│   │   │   ├── Sequences.jsx          # Email sequence management
│   │   │   ├── Analytics.jsx          # Campaign performance charts
│   │   │   ├── Compliance.jsx         # Compliance & audit logs
│   │   │   └── ContactDetail.jsx      # Individual contact view
│   │   ├── components/
│   │   │   ├── Layout.jsx             # Navigation & routing
│   │   │   ├── ContactTable.jsx       # Paginated, sortable table
│   │   │   ├── FilterPanel.jsx        # Advanced filters
│   │   │   ├── BulkActions.jsx        # Batch operations
│   │   │   ├── StatsBar.jsx           # KPI cards
│   │   │   ├── UploadModal.jsx        # CSV file uploader
│   │   │   └── ...other components
│   │   ├── hooks/
│   │   │   └── useContacts.js         # Data fetching logic
│   │   ├── api.js                     # API client wrapper
│   │   ├── App.jsx                    # App shell & routes
│   │   └── index.css                  # Global styles
│   ├── vite.config.js                 # Vite configuration with proxy
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                           # Express.js application
│   ├── models/
│   │   ├── Contacts.js                # Contact schema + subdocs
│   │   └── AuditLog.js                # Compliance audit log
│   ├── routes/
│   │   ├── email.router.js            # Email sending endpoints
│   │   ├── contact.router.js          # Contact CRUD & search
│   │   ├── sequence.router.js         # Email sequence endpoints
│   │   ├── delivery.router.js         # Webhooks (unsubscribe, bounce)
│   │   └── compliance.router.js       # Compliance & audit endpoints
│   ├── controller/
│   │   ├── contact.controller.js      # Contact business logic
│   │   └── emailAction.controller.js  # Email sending logic
│   ├── services/
│   │   ├── auditLogger.js             # Log events to AuditLog
│   │   ├── suppressionManager.js      # Blocklist management
│   │   ├── emailVerifier.js           # DNS email validation
│   │   ├── complianceChecker.js       # SPF/DKIM/list quality checks
│   │   └── preSendValidator.js        # Pre-send validation rules
│   ├── email-service/
│   │   ├── index.js                   # Nodemailer config & send
│   │   └── email.body.format.js       # Email templating & personalization
│   ├── ai-service/
│   │   ├── service.js                 # Groq LLM integration
│   │   └── sequenceService.js         # Sequence orchestration
│   ├── utils/
│   │   └── blockedDomains.js          # Domain blocklist
│   ├── server.js                      # Express app setup & routers
│   ├── package.json
│   └── .env.example
│
└── documentation/
    ├── ARCHITECTURE.md                # This file
    ├── API.md                         # API endpoint reference
    ├── SETUP.md                       # Setup & deployment guide
    ├── DNS_SETUP.md                   # SPF/DKIM/DMARC records
    └── PHASES.md                      # Development phases summary
```

---

## Core Features

### 1. Contact Management
- **CSV Upload** → Parse Apollo exports, deduplicate, bulk insert
- **Search & Filter** → Real-time search by name/email/company, advanced filters
- **Pagination** → 25 contacts/page with navigation
- **Column Visibility** → Toggle columns shown in table
- **Sorting** → Click headers to sort ascending/descending
- **Bulk Actions** → Select multiple, update status/flags in batch

### 2. Email Sequences
- **Sequence A & B** → Two separate A/B test tracks
- **Multi-email sequences** → Email 1, Email 2, Email 3, etc. per contact
- **Status tracking** → NOT_SENT → SENT → REPLIED_POSITIVE/NEGATIVE/NO_RESPONSE → CLOSED
- **Scheduled sends** → Cron job runs hourly, respects send windows (days/hours)
- **Health monitoring** → Show active sequences, ready-to-send count, total sent

### 3. Email Sending
- **Personalization** → Dynamic {{firstName}}, {{companyName}}, {{industry}} tokens
- **A/B variants** → Two different email bodies per sequence
- **Unsubscribe links** → Auto-injected URL for compliance
- **Rate limiting** → 50 emails/day (configurable), 10s delay between sends
- **Delivery tracking** → SMTP response codes logged, bounce detection
- **Retry logic** → Failed sends marked, manual retry available

### 4. Compliance & Safety
- **Audit logging** → Every action (send, bounce, unsubscribe, verify) logged with timestamp
- **Suppression list** → Blocklist by email with reason (bounced, unsubscribed, DNC)
- **Email verification** → DNS MX record checks, role account detection
- **Compliance scoring** → SPF/DKIM/DMARC checks, list quality metrics
- **GDPR export** → Download all contact data + audit history
- **Unsubscribe handling** → One-click unsubscribe with webhook validation

### 5. Analytics & Reporting
- **KPI cards** → Total sequences, replies, reply rate, avg emails/sequence, bounces
- **Status breakdown** → Chart showing distribution across 7 statuses
- **Email funnel** → Emails sent per sequence step (1, 2, 3, etc.)
- **A/B performance** → Variant comparison (sent, replies, reply rate)
- **Bounce analysis** → Hard/soft/complaint breakdown with counts
- **Filtering** → View metrics for all sequences or sequence A/B only

---

## Data Models

### Contact Schema
```javascript
{
  _id: ObjectId,
  
  // Basic info (Apollo fields)
  firstName: String,
  lastName: String,
  title: String,
  email: String,
  companyName: String,
  industry: String,
  
  // Email tracking
  emailStats: {
    emailsSent: Number (default 0),
    opened: Boolean,
    openedCount: Number
  },
  
  // Reply tracking
  reply: {
    replied: Boolean,
    replyType: String (enum: "positive", "negative", "auto", null)
  },
  
  // Sequence state (per contact)
  emailSequence: {
    sequenceType: String (A or B),
    sequenceStatus: String (not_sent, active, completed, replied, bounced, unsubscribed),
    nextEmailNumber: Number,
    nextEmailScheduledFor: Date,
    emailHistory: [
      {
        emailNumber: Number,
        sentAt: Date,
        deliveryStatus: String (pending, sent, failed, bounced),
        bounceCode: String,
        bounceMessage: String,
        opened: Boolean,
        openedAt: Date,
        repliedAt: Date
      }
    ]
  },
  
  // Safety & compliance
  flags: {
    doNotContact: Boolean,
    bounced: Boolean,
    bounceType: String (hard, soft, complaint),
    bounceReason: String,
    bouncedAt: Date,
    unsubscribe: Boolean
  },
  
  // Metadata
  outreachStatus: String (NOT_SENT, SENT, FOLLOWUP_PENDING, REPLIED_POSITIVE, REPLIED_NEGATIVE, NO_RESPONSE, CLOSED),
  lastSentDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### AuditLog Schema
```javascript
{
  _id: ObjectId,
  eventType: String (enum: email_sent, email_failed, bounce, unsubscribe, gdpr_export, suppression_add, compliance_check),
  email: String,
  contactId: ObjectId (ref: Contact),
  sequenceType: String (A or B),
  emailNumber: Number,
  details: Mixed (event-specific data),
  createdAt: Date,
  updatedAt: Date
  
  // TTL index: auto-delete after 1 year
}
```

---

## API Architecture

### REST Endpoints

#### **Contacts API** (`/api/contacts`)
```
GET    /                     → List contacts (paginated, sortable, searchable)
GET    /:id                  → Get single contact
GET    /filter               → Advanced filtering
GET    /stats                → KPI stats
PATCH  /:id                  → Update contact
PATCH  /bulk                 → Bulk update multiple contacts
POST   /emails/send          → Send email to contacts
POST   /emails/followup      → Send followup email
```

#### **Sequences API** (`/api/sequences`)
```
GET    /health               → Sequence health metrics
GET    /due                  → Contacts due for next email
GET    /analytics            → Performance analytics
POST   /run-scheduled        → Manually trigger scheduled sends
```

#### **Compliance API** (`/api/compliance`)
```
GET    /audit-log            → Audit log entries (paginated)
GET    /audit-stats          → Event counts by type
GET    /suppression          → Suppression list (paginated)
GET    /suppression/stats    → Suppression counts by reason
POST   /suppression          → Add email to suppression list
POST   /suppression/import   → Bulk import suppression list
GET    /check/:sequenceType  → Run compliance check (SPF/DKIM/list quality)
GET    /gdpr/export/:id      → Export all contact data
POST   /verify-email         → Verify single email (DNS check)
```

#### **Delivery Webhooks** (`/`)
```
GET    /unsubscribe?token=X  → One-click unsubscribe
POST   /api/delivery/bounce  → Bounce webhook from email provider
```

#### **Upload** (`/`)
```
POST   /upload               → Upload CSV file (multipart/form-data)
```

### Request/Response Format

**Standard Success Response:**
```json
{
  "success": true,
  "data": {...},
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 150,
    "pages": 6
  }
}
```

**Standard Error Response:**
```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## Frontend Architecture

### Component Hierarchy
```
App.jsx (Router)
├── Layout.jsx (Navigation)
│   ├── Dashboard.jsx
│   │   ├── StatsBar (KPI cards)
│   │   ├── SearchBar
│   │   ├── FilterPanel
│   │   ├── ContactTable
│   │   │   └── Row with checkbox, avatar, data cells
│   │   ├── Pagination
│   │   └── BulkActions (Send/Followup/Update buttons)
│   ├── Sequences.jsx
│   │   ├── Health cards
│   │   ├── Filter buttons (A/B/All)
│   │   ├── Due-for-email table
│   │   └── Run Scheduled button
│   ├── Analytics.jsx
│   │   ├── Summary cards
│   │   ├── Status breakdown chart
│   │   ├── Email funnel chart
│   │   ├── A/B variant performance
│   │   └── Bounce analysis
│   └── Compliance.jsx
│       ├── Compliance score card
│       ├── Compliance checks table
│       ├── Audit log table
│       └── Suppression list + form
└── ContactDetail.jsx (Route: /contacts/:id)
```

### State Management Pattern
- **hooks/useContacts.js** → Central data fetching
  - Manages pagination, sorting, filters, search
  - Debounced search
  - Automatic refetch on param changes
  - Exposed: contacts[], pagination, loading, setters

### UI Design System
- **Color Scheme**: Dark theme (Vercel-inspired)
  - Background: `#0a0a0a` (almost black)
  - Cards: `#0d0d0d` / `#161616`
  - Borders: `#1a1a1a` / `#262626`
  - Text: `white` / `#a1a1aa` (gray-400)
  - Accents: `white` (CTAs), `blue-500` (primary), `emerald-500` (success), `red-500` (danger)

- **Typography**:
  - H1: `text-3xl` / `text-[26px]` font-semibold
  - H2: `text-xl` / `text-lg` font-semibold
  - Body: `text-sm` / `text-[13px]`
  - Labels: `text-[12px]` / `text-[11px]` font-medium uppercase
  - Mono (data): `font-mono` text-[12px]

- **Spacing**: 8px/4px system
  - Padding: `p-6` (24px), `px-4` (16px), `py-3` (12px)
  - Gap: `gap-4` (16px), `gap-2` (8px)
  - Rounded: `rounded-lg` (8px), `rounded-2xl` (16px)

### API Client Pattern
```javascript
// api.js
const api = {
  getContacts: (params) => request(`${BASE}?${qs}`),
  filterContacts: (params) => request(`${BASE}/filter?${qs}`),
  updateContact: (id, data) => request(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  uploadCSV: (file) => fetch('/upload', { method: 'POST', body: FormData }),
  sequences: { health: (), dueForEmail: (), analytics: (), runScheduled: () },
  compliance: { auditLog: (), suppression: (), checkCompliance: (), ... }
}
```

---

## Backend Services

### 1. Email Service (`email-service/`)

**index.js** - SMTP Configuration
```javascript
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,      // smtp.gmail.com
  port: parseInt(process.env.SMTP_PORT),  // 587
  secure: process.env.SMTP_SECURE === 'true',  // false
  auth: {
    user: process.env.EMAIL_USER,    // gmail@example.com
    pass: process.env.EMAIL_PASS     // app-specific password
  }
});
```

**email.body.format.js** - Templating
```javascript
formate(body, contact, randomThanks, unsubscribeUrl) {
  // Replace tokens: {{firstName}}, {{companyName}}, {{industry}}
  // Append unsubscribe link
  // Add random closing (thanks, best regards, etc.)
  // Return formatted body
}
```

### 2. Sequence Service (`ai-service/sequenceService.js`)

**Orchestration Flow:**
```
1. getContactsDueForEmail()
   └─ Find contacts where nextEmailScheduledFor <= now
   
2. For each contact:
   a. validateSend(contact)
      └─ Check: format, blocked domain, flags, token completeness, daily limit
   
   b. Fetch email body from Groq API
   
   c. formatEmailBody()
      └─ Replace tokens, append unsubscribe link
   
   d. sendEmailsNodemailer()
      └─ Send via SMTP, capture delivery status
   
   e. logEmailSent() to AuditLog
   
   f. Update contact.emailSequence:
      └─ nextEmailNumber++, nextEmailScheduledFor += delay
```

**Cron Job:**
```javascript
// Runs hourly (or on schedule from CRON_SCHEDULE env)
// Checks: is it within SEND_DAYS and SEND_HOUR_START/END?
// Calls runScheduledSends(DAILY_SEND_LIMIT)
// Returns: { successful, failed, errors[], limitReached }
```

### 3. Audit Logger (`services/auditLogger.js`)

**Methods:**
```javascript
logEmailSent(contact, emailNumber, sequenceType, subject)
logEmailFailed(contact, emailNumber, sequenceType, errorMessage)
logBounce(contact, bounceType, bounceReason)
logUnsubscribe(contact)
exportGDPRData(contactId)
getAuditStats(fromDate)
```

### 4. Suppression Manager (`services/suppressionManager.js`)

**Uses Contact.flags subdoc (no new collection):**
```javascript
isSuppressed(email)
  └─ Check: flags.bounced, flags.unsubscribe, flags.doNotContact

addToSuppression(email, reason)
  └─ Set appropriate flag on contact

getSuppressionList(page, limit)
  └─ Paginated contacts where any flag is true

getSuppressionStats()
  └─ Count by reason (bounced, unsubscribed, doNotContact)
```

### 5. Email Verifier (`services/emailVerifier.js`)

**Validation Steps:**
```
1. Format check: regex /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
2. Role account check: reject info@, support@, admin@, noreply@, etc.
3. MX record lookup: dns.resolveMx(domain)
4. Return: { valid: bool, checks: {format, mxRecord, notRoleAccount}, warnings, error }
```

### 6. Compliance Checker (`services/complianceChecker.js`)

**Checks Performed:**
```
1. SPF Record: dns.resolveTxt(domain) → look for 'v=spf1'
2. DKIM Record: dns.resolveTxt('fj._domainkey.' + domain)
3. Token Completeness: % contacts missing firstName/companyName/industry
4. Email List Quality: bounce rate < 5%, unsub rate < 0.5%
5. Unsubscribe Link: BASE_URL env var is set
6. Score = passed checks × 20 (max 100)
7. Recommendations: array of improvement suggestions
```

---

## Email Workflow

### Sending Flow (Detailed)
```
1. User clicks "Send Email" on dashboard
   ↓
2. emailAction.controller.sendToContacts(contactIds)
   ↓
3. For each contact:
   a. Get contact from DB
   b. Get email template from Groq API
      └─ Prompt: "Write cold email to [firstName] at [company] in [industry]"
      └─ Response: { subject, body }
   c. Validate send (format, domain, flags, daily limit)
   d. Format body with tokens + unsubscribe link
   e. Send via nodemailer/SMTP
   f. Log event to AuditLog
   g. Update contact.emailSequence.emailHistory
   h. Update contact.emailStats.emailsSent++
   i. Update contact.outreachStatus
   ↓
4. Return result: { successful: N, failed: M, errors: [] }
```

### Bounce Handling (Webhook)
```
1. Email provider sends bounce notification
   ↓
2. POST /api/delivery/bounce
   └─ Body: { email, bounceType (hard/soft), bounceReason, bounceCode }
   ↓
3. Find contact by email
   ↓
4. Set flags:
   └─ flags.bounced = true
   └─ flags.bounceType = hard/soft/complaint
   └─ flags.bounceReason = reason
   └─ flags.bouncedAt = now
   ↓
5. Set sequenceStatus = 'bounced'
   ↓
6. Log bounce event to AuditLog
```

### Unsubscribe Flow
```
1. User clicks unsubscribe link in email
   ↓
2. GET /unsubscribe?token={contactId}
   ↓
3. Find contact by _id
   ↓
4. Set:
   └─ flags.unsubscribe = true
   └─ emailSequence.sequenceStatus = 'unsubscribed'
   ↓
5. Return HTML confirmation page
   ↓
6. Log unsubscribe event to AuditLog
```

---

## Compliance & Safety

### Pre-Send Validation
```javascript
validateSend(contact, { dailyLimit }) returns { valid, reasons }

Checks:
1. Email format valid (regex)
2. Domain not blocked (gmail.com, yahoo.com, gov.uk, etc.)
3. Not flagged:
   - flags.bounced
   - flags.doNotContact
   - flags.unsubscribe
4. Token completeness:
   - firstName not empty
   - companyName not empty
   - industry not empty
5. Sequence not completed:
   - sequenceStatus not in [completed, replied, bounced, unsubscribed]
6. Daily send limit not exceeded:
   - Count today's sent emails
   - Check remaining budget
```

### Blocked Domains (25+ entries)
```
Personal: gmail.com, yahoo.com, hotmail.com, outlook.com, live.com, icloud.com, aol.com, protonmail.com, fastmail.com, zoho.com
UK Personal: btinternet.com, sky.com, talktalk.net, virginmedia.com
Disposable: mailinator.com, guerrillamail.com, tempmail.com, yopmail.com, 10minutemail.com
Government: gov.uk, gov.in, *.edu, *.ac.uk
```

### Compliance Score Calculation
```
Score = (passed checks × 20) with max 100

Pass criteria:
- SPF record exists
- DKIM record exists
- ≥90% tokens complete
- Bounce rate <5%
- Unsub rate <0.5%
- Unsubscribe link configured

Score ≥80: Green (Compliant)
Score 60-79: Amber (Review Recommended)
Score <60: Red (Action Required)
```

---

## Configuration & Environment

### Environment Variables (`.env`)
```bash
# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/factoryjet

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM_NAME=Bhavesh at FactoryJet

# Frontend
BASE_URL=http://localhost:5173  # or production domain

# Email Domain (for compliance)
SENDING_DOMAIN=factoryjet.com
BASE_URL=https://factoryjet.com  # for unsubscribe links

# Scheduled Sends
CRON_SCHEDULE=0 * * * *          # hourly
SEND_DAYS=2,3                     # Tuesday, Wednesday
SEND_HOUR_START=7                 # 7 AM
SEND_HOUR_END=11                  # 11 AM
DAILY_SEND_LIMIT=50               # max emails/day

# Groq AI (email generation)
GROQ_API_KEY=gsk_...

# Webhooks
BOUNCE_WEBHOOK_SECRET=your-secret-key

# CORS
FRONTEND_ORIGIN=http://localhost:5173
```

### Vite Dev Proxy Config
```javascript
// vite.config.js
server: {
  proxy: {
    '/api': 'http://localhost:5000',
    '/upload': 'http://localhost:5000',
    '/unsubscribe': 'http://localhost:5000'
  }
}
```

### CORS Middleware
```javascript
// Accepts any localhost:* origin
const origin = req.headers.origin;
if (origin && origin.startsWith("http://localhost:")) {
  res.header("Access-Control-Allow-Origin", origin);
}
```

---

## Deployment & DevOps

### Local Development
```bash
# Backend
cd backend
npm install
npm run dev  # or node server.js

# Frontend (separate terminal)
cd frontend
npm install
npm run dev  # Vite on localhost:5173
```

### Production Deployment (AWS/Heroku/Render)

**Backend Deployment Checklist:**
- [ ] MongoDB Atlas cluster provisioned
- [ ] Environment variables set in platform
- [ ] SMTP credentials (Gmail App Password) set
- [ ] Groq API key set
- [ ] Bounce webhook URL configured at email provider
- [ ] Cron job enabled (or use platform scheduler)
- [ ] SSL certificate for domain
- [ ] Unsubscribe links use HTTPS domain
- [ ] SPF/DKIM/DMARC records configured at domain registrar

**Frontend Deployment Checklist:**
- [ ] Build: `npm run build`
- [ ] Output: `dist/` folder
- [ ] Deploy to: Vercel, Netlify, or CDN
- [ ] Environment: `VITE_API_BASE_URL` points to production backend
- [ ] CORS: Backend CORS allows production domain

### Monitoring & Logging
```javascript
// Backend logs
console.log(`[UPLOAD] CSV parsed: ${results.length} rows`)
console.log(`[SEND] Sent ${N} emails, ${M} failed`)
console.log(`[CRON] Running scheduled sends...`)
console.log(`[COMPLIANCE] Checking SPF/DKIM...`)

// AuditLog automatically tracks:
- Every email sent (email_sent)
- Every send failure (email_failed)
- Every bounce (bounce)
- Every unsubscribe (unsubscribe)
- Compliance checks (compliance_check)
- Suppression additions (suppression_add)
- GDPR exports (gdpr_export)
```

### Database Indexes
```javascript
// For performance
Contact.index({ email: 1 })           // search by email
Contact.index({ createdAt: -1 })      // sort by date
Contact.index({ outreachStatus: 1 })  // filter by status
AuditLog.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 })  // TTL 1 year
```

---

## Data Flow Diagrams

### CSV Upload Flow
```
User Upload (Frontend)
  ↓
FormData with file
  ↓
POST /upload (Backend)
  ↓
Multer saves file → csv-parser reads stream
  ↓
For each row:
  - Check email + Apollo ID
  - Look for duplicates in DB
  - Map fields to Contact schema
  - Contact.create()
  ↓
Tally: inserted, skipped, skipReasons
  ↓
Delete temp file
  ↓
Return JSON response
  ↓
Frontend shows toast + refetch
```

### Email Send Flow
```
User clicks "Send Email" (Frontend)
  ↓
POST /api/contacts/emails/send { contactIds: [...] }
  ↓
emailAction.controller.sendToContacts()
  ↓
For each contact:
  1. Fetch from DB
  2. GET Groq API → email body
  3. validateSend(contact)
  4. formate(body, contact, unsubUrl)
  5. sendEmailsNodemailer(email)
  6. logEmailSent() → AuditLog
  7. Update Contact.emailSequence.emailHistory
  8. Update Contact.outreachStatus
  ↓
Collect results: { successful, failed }
  ↓
Return JSON
  ↓
Frontend toast: "Sent N, Failed M"
```

### Scheduled Send Flow (Cron)
```
Every hour at :00 (configurable)
  ↓
Check: is day in SEND_DAYS? is hour in SEND_HOUR_START/END?
  ↓
If yes → runScheduledSends(DAILY_SEND_LIMIT)
  ↓
getContactsDueForEmail()
  ↓
For each contact (up to daily limit):
  1. validateSend()
  2. generateEmail()
  3. sendEmail()
  4. logEmailSent()
  5. Update nextEmailScheduledFor
  6. Sleep 10 seconds (rate limit)
  ↓
Return { successful, failed, totalProcessed, limitReached }
  ↓
Log to console: "[CRON] Sent N, Failed M"
```

---

## Security Considerations

### Input Validation
- Email format: regex validation
- CSV parsing: csv-parser handles malformed rows
- Request body: express.json() with default limit 100kb
- Query params: type coercion + range checks

### Authentication
- ⚠️ **Currently no authentication** — add before production
- Suggestion: JWT or session-based auth for /api/contacts

### CORS
- Restricted to localhost:* in dev
- Should restrict to specific origin in production

### Email Headers
- SPF/DKIM/DMARC for domain authenticity
- List-Unsubscribe header for compliance
- Message-ID for tracking
- X-Mailer for transparency

### Rate Limiting
- 50 emails/day global limit (configurable)
- 10-second delay between sends (prevents blocking)
- Should add per-contact rate limit in future

### Data Protection
- AuditLog auto-deletes after 1 year (TTL index)
- GDPR export endpoint for data portability
- Unsubscribe list honored in pre-send validation

---

## Future Enhancements

1. **Authentication** → JWT or OAuth for multi-user
2. **Encryption** → Encrypt sensitive fields (email passwords)
3. **Rate Limiting** → Per-IP, per-user request throttling
4. **Webhooks** → Custom integrations for bounces, replies
5. **Reply Detection** → Auto-parse inbound emails
6. **Domain Rotation** → Send from multiple domains for reputation
7. **Template Library** → Save & reuse email templates
8. **Advanced Analytics** → Time-series data, cohort analysis
9. **Integration** → Zapier, Make.com, native CRM sync
10. **AI Improvements** → Fine-tune email body generation with feedback

---

## Summary Table

| Aspect | Technology/Pattern | Details |
|--------|-------------------|---------|
| **Frontend** | React 19 + Vite 8 | Dark theme SaaS UI, Tailwind v4 |
| **Backend** | Express.js + Node.js | Modular service architecture |
| **Database** | MongoDB Atlas | NoSQL, cloud-hosted, TTL indexes |
| **Email** | Nodemailer + Gmail SMTP | Token personalization, unsubscribe links |
| **AI** | Groq API | Email body generation |
| **Scheduling** | node-cron | Hourly cron with send windows |
| **Compliance** | AuditLog + Services | SPF/DKIM checks, suppression list |
| **Upload** | Multer + csv-parser | CSV parsing, deduplication |
| **API Style** | REST with pagination | JSON responses, standard error format |
| **Styling** | Tailwind CSS v4 | 8px grid, dark Vercel-inspired palette |

---

**Generated**: 2026-05-01  
**Last Updated**: 2026-05-01  
**Status**: Complete (Phases 1-5 implemented)

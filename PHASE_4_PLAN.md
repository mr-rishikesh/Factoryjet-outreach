# Phase 4: Pre-Send Validation Checklist — Planning Document

**Status:** ⏳ NOT STARTED — Planning Phase  
**Planned Completion:** TBD  
**Quality Target:** Enterprise Grade  

---

## 🎯 Mission

Automate pre-send compliance and deliverability checks so every email that leaves the system meets CAN-SPAM/GDPR standards and is optimized for inbox delivery.

---

## 📋 Requirements

### What Phase 4 Solves

**Current State (after Phase 3):**
- Emails are generated and sent
- Basic validation (6 checks) prevents obviously bad emails
- But no automated compliance audit

**Phase 4 Adds:**
- Email verification (bounce prediction)
- Automated compliance checklist
- Audit logging (every send logged for compliance)
- Token validation script
- Suppression list management

---

## 🏗️ Planned Implementation

### Component 1: Email Verification Service

**File:** `backend/services/emailVerifier.js` (NEW)

**Purpose:** Reduce bounce rate to <2% by verifying email addresses before send

**Integration Points:**
- Call on sequence initialization
- Re-verify quarterly
- Cache results for 90 days

**Verification Methods:**
- SMTP check (try to connect, don't send)
- DNS check (MX records exist)
- Role account detection (no-reply@, support@, etc.)
- Disposable email detection (additional to Phase 3 blocked list)

**API Integration:**
- Consider: ZeroBounce, Hunter.io, or Clearbit APIs
- Or: Build basic SMTP checker internally

**Output:**
```javascript
{
  valid: true/false,
  confidence: 0.95,
  reason: "Valid mailbox",
  riskLevel: "low/medium/high",
  lastVerifiedAt: Date,
  nextVerifyAt: Date
}
```

### Component 2: Compliance Checklist

**File:** `backend/services/complianceChecker.js` (NEW)

**Purpose:** Automated check before sequences launch

**Checklist Items:**
- [ ] Domain has SPF record
- [ ] Domain has DKIM configured
- [ ] Domain has DMARC policy
- [ ] Email list verified (bounce <2%)
- [ ] All tokens fillable (no empty firstName, etc.)
- [ ] Subject lines under 60 characters
- [ ] Email body has unsubscribe link
- [ ] From: address verified
- [ ] Reply-To: configured
- [ ] No banned words/patterns

**Output:**
```javascript
{
  compliant: true/false,
  checks: [
    {name: "SPF Record", passed: true, requirement: "MUST"},
    {name: "DKIM Signature", passed: true, requirement: "MUST"},
    {name: "DMARC Policy", passed: false, requirement: "SHOULD"},
    ...
  ],
  blockers: ["DMARC Policy missing"],
  warnings: [],
  score: 92/100
}
```

### Component 3: Audit Log System

**File:** `backend/services/auditLogger.js` (NEW)

**Purpose:** Compliance trail for every email send

**New Collection:** `AuditLog`

**Logged Events:**
```javascript
{
  _id: ObjectId,
  timestamp: Date,
  type: "email_sent" | "email_failed" | "sequence_initialized" | "contact_bounced",
  contactId: ObjectId,
  email: "john@example.com",
  sequenceType: "A" | "B",
  emailNumber: 1-5,
  action: "send" | "bounce" | "unsubscribe",
  details: {
    subject: "...",
    messageId: "...",
    status: "sent" | "failed",
    errorCode: 550,
    errorMessage: "User unknown"
  },
  userId: ObjectId, // Who triggered it
  ipAddress: "...",
  userAgent: "..."
}
```

**Query Examples:**
```javascript
// Find all emails sent to john@example.com
db.auditLog.find({email: "john@example.com", type: "email_sent"})

// Find failed sends in last 24 hours
db.auditLog.find({type: "email_failed", timestamp: {$gte: yesterday}})

// Export for GDPR data deletion request
db.auditLog.find({email: "john@example.com"})
```

### Component 4: Token Validation Script

**File:** `backend/scripts/validateTokens.js` (NEW)

**Purpose:** Batch check all contacts have required tokens

**CLI Usage:**
```bash
node scripts/validateTokens.js --sequenceType=A --report=html
```

**Output Report:**
```
Token Validation Report - Sequence A
=====================================
Total Contacts: 500
Valid Tokens: 485 (97%)
Missing firstName: 10
Missing companyName: 3
Missing industry: 2

By Status:
- Ready to Send: 485 ✅
- Missing firstName: 10 ⚠️
- Multiple Missing: 5 ❌

Recommendations:
1. Import firstName for contacts 10, 15, 22
2. Use "Unknown Company" fallback for 3 contacts
3. Mark 5 contacts as unsuitable for outreach
```

### Component 5: Suppression List Management

**File:** `backend/services/suppressionManager.js` (NEW)

**Purpose:** Prevent sending to bounced/complained addresses

**Integrations:**
- MongoDB `Contact` collection (flags.bounced)
- External suppression lists (optional: ISP feedback loops)
- User-uploaded CSV

**Features:**
- Query suppression status before send
- Auto-add on bounce webhook
- Bulk import from file
- Suppression list export (for ISP reporting)

---

## 📊 Phase 4 File Structure

```
backend/
├── services/
│   ├── emailVerifier.js          (NEW) ~150 lines
│   ├── complianceChecker.js      (NEW) ~100 lines
│   ├── auditLogger.js             (NEW) ~80 lines
│   └── suppressionManager.js      (NEW) ~100 lines
├── scripts/
│   └── validateTokens.js          (NEW) ~80 lines
├── models/
│   └── AuditLog.js                (NEW) ~50 lines
└── routes/
    └── compliance.router.js       (NEW) ~100 lines
```

---

## 🔗 API Endpoints (Phase 4)

### GET /api/compliance/check
Perform immediate compliance check on sequence

**Request:**
```json
{
  "sequenceType": "A",
  "sampleSize": 10
}
```

**Response:**
```json
{
  "compliant": true,
  "checks": [...],
  "score": 92,
  "recommendations": [...]
}
```

### GET /api/compliance/audit-log
Query audit logs

**Query Params:**
- `email` — Filter by recipient
- `type` — "email_sent", "email_failed", etc.
- `startDate` — ISO date
- `endDate` — ISO date
- `limit` — Results per page

### POST /api/compliance/verify-email
Verify single email address

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "email": "john@example.com",
  "valid": true,
  "confidence": 0.95,
  "reason": "Valid mailbox",
  "riskLevel": "low"
}
```

### GET /api/compliance/token-report
Get token validation report

**Query Params:**
- `sequenceType` — A or B
- `format` — "json" or "csv"

---

## 📈 Success Criteria

- ✅ Email verification reduces bounce rate to <2%
- ✅ Compliance checklist prevents non-compliant sends
- ✅ Audit logs support GDPR data deletion requests
- ✅ Token validation catches missing data before send
- ✅ Suppression list prevents known bounces

---

## 🚀 Implementation Order

1. Create AuditLog model and auditLogger service
2. Integrate auditLogger into sendNextEmail()
3. Create suppressionManager and integrate
4. Create complianceChecker service
5. Create emailVerifier service (choose API or internal)
6. Create compliance.router.js with endpoints
7. Create validateTokens.js CLI script
8. Write tests and documentation

---

## 📚 Related Files

- `PHASE_3_IMPLEMENTATION.md` — Email delivery (prerequisite)
- `backend/DNS_SETUP.md` — Compliance setup
- `backend/models/Contacts.js` — Contact schema (will reference audit logs)

---

## ✨ Phase 4 → Phase 5 Handoff

Once Phase 4 is complete:
- All sends are audited
- Compliance checks run automatically
- Email verification prevents bounces
- System is ready for user-facing dashboard

Phase 5 can then build the UI on top of this data.

---

**Current Status:** Planning Document  
**Planned Start:** After Phase 3 verified in staging  
**Estimated Duration:** 2-3 weeks  
**Dependencies:** Phase 3 complete & live

---

*Created: May 1, 2026*  
*Purpose: Guide for Phase 4 implementation*

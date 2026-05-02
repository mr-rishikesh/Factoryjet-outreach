# How to Create New Email Sequences - Complete Guide

## Overview

FactoryJet supports **A/B testing** with two parallel sequences:
- **Sequence A**: US Shopify DTC Brands
- **Sequence B**: UK Founder-Led SMBs

Each sequence has **5 emails** sent over **18 days** at scheduled intervals.

---

## Method 1: Via API (Programmatic)

### Endpoint
```
POST /api/sequences/initialize
```

### Request Body
```json
{
  "contactId": "507f1f77bcf86cd799439011",
  "sequenceType": "A"
}
```

### cURL Example
```bash
curl -X POST http://localhost:5000/api/sequences/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "507f1f77bcf86cd799439011",
    "sequenceType": "A"
  }'
```

### Response
```json
{
  "success": true,
  "message": "Sequence A initialized for contact",
  "contact": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "companyName": "Acme Corp",
    "email": "john@acme.com",
    "sequence": {
      "sequenceType": "A",
      "sequenceStatus": "active",
      "nextEmailNumber": 1,
      "nextEmailScheduledFor": "2026-05-02T00:00:00Z",
      "emailHistory": []
    }
  }
}
```

### What Happens
1. ✅ Contact loaded from database
2. ✅ Checked if suppressed (bounced, DNC, unsubscribed)
3. ✅ Checked if already has active sequence
4. ✅ Sequence initialized with status "active"
5. ✅ Email schedule created (Days 1, 4, 8, 13, 19)
6. ✅ First email ready to send
7. ✅ Contact saved to database

---

## Method 2: Via Dashboard (Coming Soon)

Currently, sequences are initialized programmatically. To add a UI:

### Frontend Component Needed
```jsx
// frontend/src/components/InitializeSequenceModal.jsx

import { useState } from "react";
import { api } from "../api";
import { toast } from "react-hot-toast";

export default function InitializeSequenceModal({ contact, onClose, onSuccess }) {
  const [sequenceType, setSequenceType] = useState("A");
  const [loading, setLoading] = useState(false);

  const handleInitialize = async () => {
    try {
      setLoading(true);
      await api.sequences.initialize(contact._id, sequenceType);
      toast.success(`Sequence ${sequenceType} started for ${contact.firstName}`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#0d0d0d] border border-[#262626] rounded-lg shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Start Email Sequence</h3>
        
        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-[#a1a1aa] mb-2">Contact: {contact.firstName}</p>
            <p className="text-sm text-[#a1a1aa]">Email: {contact.email}</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">Select Sequence:</label>
            <div className="flex gap-3">
              {["A", "B"].map((type) => (
                <button
                  key={type}
                  onClick={() => setSequenceType(type)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    sequenceType === type
                      ? "bg-white text-black"
                      : "bg-[#161616] text-[#a1a1aa] hover:text-white border border-[#262626]"
                  }`}
                >
                  Sequence {type}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#161616] rounded-lg p-4 border border-[#262626]">
            <p className="text-sm text-[#a1a1aa] mb-2">
              <span className="font-semibold text-white">5 emails</span> over 18 days
            </p>
            <p className="text-xs text-[#525252]">
              {sequenceType === "A" 
                ? "US Shopify DTC Brands" 
                : "UK Founder-Led SMBs"}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-[#161616] text-[#a1a1aa] rounded-lg hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleInitialize}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 disabled:opacity-50 font-medium transition-colors"
          >
            {loading ? "Starting..." : "Start Sequence"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Add to API Wrapper
```javascript
// frontend/src/api.js

sequences: {
  // ... existing code ...
  initialize: (contactId, sequenceType) =>
    request(`${SEQ_BASE}/initialize`, {
      method: "POST",
      body: JSON.stringify({ contactId, sequenceType }),
    }),
}
```

---

## Email Schedule

### Sequence Timeline
```
Day 1:  Email 1 (Initial outreach)
Day 4:  Email 2 (Follow-up)
Day 8:  Email 3 (Re-engagement)
Day 13: Email 4 (Value add)
Day 19: Email 5 (Final touch)
```

### How to Customize

Edit `backend/ai-service/sequenceService.js`:

```javascript
const SEQUENCE_CONFIG = {
  A: {
    name: "Your Sequence Name",
    emailIntervals: [0, 3, 7, 12, 18],  // Adjust these days
    maxEmails: 5                         // Can increase to 6, 7, etc.
  },
  B: {
    name: "Your Other Sequence",
    emailIntervals: [0, 2, 5, 10, 15],  // Different schedule
    maxEmails: 5
  }
};
```

---

## Sequence Status Workflow

```
Start: Initialize Sequence
   ↓
   sequenceStatus = "active"
   ↓
Email 1 Due (Day 1)
   ↓
   Send Email 1
   ↓
Email 2 Due (Day 4)
   ↓
   Send Email 2
   ↓
... Continue through all 5 emails ...
   ↓
All 5 Emails Sent
   ↓
sequenceStatus = "completed"
```

### Status Values
- `active` - Sequence in progress
- `completed` - All emails sent
- `paused` - Temporarily stopped
- `replied` - Contact replied
- `bounced` - Email bounced
- `unsubscribed` - Contact unsubscribed

---

## Pause & Resume Sequences

### Pause a Sequence
```bash
curl -X POST http://localhost:5000/api/sequences/:contactId/pause
```

### Resume a Sequence
```bash
curl -X POST http://localhost:5000/api/sequences/:contactId/resume
```

---

## Send Sequence Emails

### Send Next Email Manually
```bash
curl -X POST http://localhost:5000/api/sequences/:contactId/send
```

### Automatic Scheduled Sends
Emails are automatically sent via cron job:
- **Schedule**: Hourly (configurable)
- **Send Window**: Tuesday-Wednesday, 7 AM - 11 AM
- **Daily Limit**: 50 emails/day (configurable)

Edit `.env`:
```bash
CRON_SCHEDULE=0 * * * *       # Every hour at :00
SEND_DAYS=2,3                  # 2=Tuesday, 3=Wednesday
SEND_HOUR_START=7              # Start at 7 AM
SEND_HOUR_END=11               # End at 11 AM
DAILY_SEND_LIMIT=50            # Max 50 per day
```

---

## Creating Custom Sequences

### Step 1: Define Sequence Configuration

Edit `backend/ai-service/sequenceService.js`:

```javascript
const SEQUENCE_CONFIG = {
  A: {
    name: "Existing Sequence A",
    emailIntervals: [0, 3, 7, 12, 18],
    maxEmails: 5
  },
  B: {
    name: "Existing Sequence B",
    emailIntervals: [0, 3, 7, 12, 18],
    maxEmails: 5
  },
  // Add your custom sequence here:
  C: {
    name: "Your Custom Sequence Name",
    emailIntervals: [0, 2, 5, 10, 15, 20],  // 6 emails
    maxEmails: 6
  }
};
```

### Step 2: Update Route Validation

Edit `backend/routes/sequence.router.js`:

```javascript
// Around line 35-40
if (!['A', 'B', 'C'].includes(sequenceType)) {  // Add 'C'
  return res.status(400).json({
    success: false,
    error: "sequenceType must be 'A', 'B', or 'C'"
  });
}
```

### Step 3: Update Frontend Filter Buttons

Edit `frontend/src/pages/Sequences.jsx`:

```jsx
{["all", "A", "B", "C"].map((type) => (  // Add "C"
  <button
    key={type}
    onClick={() => setFilter(type)}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      filter === type
        ? "bg-white text-black"
        : "bg-neutral-800 text-gray-400 hover:bg-neutral-700"
    }`}
  >
    {type === "all" ? "All Sequences" : `Sequence ${type}`}
  </button>
))}
```

### Step 4: Initialize Custom Sequence

```bash
curl -X POST http://localhost:5000/api/sequences/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "507f1f77bcf86cd799439011",
    "sequenceType": "C"
  }'
```

---

## Email Generation

When a sequence email is sent, it's generated by **Groq AI** with:

### Personalization Tokens
```
{{firstName}}      - Contact's first name
{{lastName}}       - Contact's last name
{{companyName}}    - Company name
{{title}}          - Job title
{{industry}}       - Industry
```

### Example Generated Email
```
Subject: Quick Question for Acme Corp

Hi John,

I was looking at Acme Corp's growth in the e-commerce space...

[Body generated by Groq based on contact data]

Best,
Bhavesh
FactoryJet
```

---

## Troubleshooting

### Sequence Won't Initialize
```bash
# Check if contact exists
curl http://localhost:5000/api/contacts?page=1&limit=1

# Check if contact is suppressed
curl http://localhost:5000/api/compliance/suppression

# Check if contact already has active sequence
curl http://localhost:5000/api/contacts/{contactId}
```

### Emails Not Sending
1. Check cron job is enabled
2. Verify `.env` CRON_SCHEDULE
3. Check send window (SEND_DAYS, SEND_HOUR_START/END)
4. Verify daily limit not exceeded (DAILY_SEND_LIMIT)
5. Check backend logs for errors

### Contact Status Not Updating
- Verify contact.emailSequence exists
- Check database indexes are created
- Ensure contact saved after each email

---

## Advanced: Email Variants

Each sequence supports **5 email variants** for A/B testing:

### Current Implementation
```javascript
abTest: {
  variantIndex: Math.floor(Math.random() * 5),  // Random 0-4
  variantSent: null,
  replyRate: 0
}
```

### How to Add Variants
Edit email generation in `backend/ai-service/sequenceService.js`:

```javascript
const emailVariants = {
  0: "Subject line A - Direct pitch",
  1: "Subject line B - Question-based",
  2: "Subject line C - Value-focused",
  3: "Subject line D - Social proof",
  4: "Subject line E - Curiosity-based"
};

const selectedVariant = emailVariants[seq.abTest.variantIndex];
```

---

## API Reference

### Initialize Sequence
```
POST /api/sequences/initialize
Body: { contactId, sequenceType }
Returns: Updated contact with sequence
```

### Send Next Email
```
POST /api/sequences/:contactId/send
Returns: Email sent details
```

### Pause Sequence
```
POST /api/sequences/:contactId/pause
Returns: Updated contact
```

### Resume Sequence
```
POST /api/sequences/:contactId/resume
Returns: Updated contact
```

### Get Sequence Status
```
GET /api/sequences/:contactId/status
Returns: Sequence status & progress
```

### Get Contacts Due for Email
```
GET /api/sequences/due?type=A
Returns: Array of contacts ready to receive email
```

### Get Sequence Analytics
```
GET /api/sequences/analytics?type=A
Returns: Performance metrics for sequence
```

### Get Health Metrics
```
GET /api/sequences/health
Returns: Active sequences, ready to send, total sent
```

---

## Summary

**To Create & Send a Sequence:**

1. **Initialize** → `POST /api/sequences/initialize` with contactId & type
2. **Schedule** → Cron job automatically sends emails per schedule
3. **Monitor** → View health & analytics via `/sequences/health` and `/sequences/analytics`
4. **Track** → Check status, replies, bounces in compliance dashboard

**Customize By:**
- Editing `SEQUENCE_CONFIG` for different schedules
- Updating validation for new sequence types
- Adding UI buttons for custom sequences
- Modifying email generation prompts in Groq integration

---

**Ready to create sequences!** 🚀

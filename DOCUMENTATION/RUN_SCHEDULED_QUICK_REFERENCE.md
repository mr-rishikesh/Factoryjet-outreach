# 🔵 Run Scheduled Sends - Quick Reference

## TL;DR
**One-click button that sends emails to all contacts whose scheduled emails are due.** No selection needed. Shows how many sent successfully.

---

## Quick Facts

| Item | Value |
|------|-------|
| **Button** | Blue ⚡ (1st button) |
| **What it does** | Sends queued sequence emails |
| **Selection needed** | No - auto-finds due contacts |
| **Time per email** | ~10 seconds |
| **Daily limit** | 50 emails |
| **Can repeat** | Yes |
| **Status** | ✅ Working |

---

## How to Use

```
1. Open Dashboard
2. Click "Run Scheduled" button (blue, with lightning icon)
3. Wait for processing (10 seconds per email)
4. See toast: "Sent: X, Failed: Y"
5. Done!
```

---

## What Gets Sent

Emails for contacts where:
- Sequence is **active**
- Next email is **scheduled for now or past**
- Haven't sent all **5 emails yet**
- Haven't hit daily limit of **50**

---

## Example

```
Database at 2 PM:
├─ John: Email 2 due May 4, 2 PM ✓ SEND
├─ Jane: Email 2 due May 4, 3 PM ✓ SEND  
├─ Bob: Email 2 due May 6 ✗ WAIT
└─ Sarah: Email 2 due May 4 ✓ SEND

Click "Run Scheduled"
↓
Result: "Sent: 3, Failed: 0"
↓
Timeline:
  2:00 PM - Send to John (+ 10s delay)
  2:00 PM - Send to Jane (+ 10s delay)
  2:00 PM - Send to Sarah (+ 10s delay)
  2:00 PM - Done (~30 seconds total)
```

---

## API Behind Button

```
POST /api/sequences/run-scheduled

Response:
{
  "results": {
    "successful": 3,
    "failed": 0,
    "totalProcessed": 3,
    "sentToday": 3,
    "remaining": 47
  }
}
```

---

## Daily Limit

```
Default: 50 emails per day

Why? Gmail SMTP rate limit
    ~0.7 emails per minute
    Prevents spam flagging
    Respects best practices

Reset at: Midnight
Tracked by: sentAt timestamps
```

---

## Performance

```
Per email: ~10 seconds
├─ Send via SMTP: 2-3 seconds
└─ Rate limit delay: 10 seconds

5 emails: ~50-55 seconds
50 emails: ~8-9 minutes
```

---

## Error Handling

```
If one email fails:
├─ Error recorded
├─ Count incremented
└─ Process continues with next

You see: "Sent: 4, Failed: 1"
```

---

## Common Issues

| Problem | Solution |
|---------|----------|
| "Daily limit reached" | Wait until midnight, try again |
| "Failed to send" | Check email format, domain blocking |
| "Sent: 0, Failed: 0" | No contacts due yet |
| Button stays "Running..." | Refresh page, try again |

---

## Button States

```
✅ Normal State
   "Run Scheduled" (blue, clickable)

⏳ Processing State
   "Running..." (blue, disabled)

✅ After Success
   Toast: "Sent: X, Failed: Y"
   Button becomes clickable again
```

---

## Cron Job Alternative

This button runs on-demand. But there's also:
- **Automatic hourly cron job** (if configured)
- Runs: Tuesdays & Wednesdays, 7-11 AM
- Same function, auto-triggered
- Both use same daily limit

---

## Contacts NOT Sent To

```
❌ Paused sequences
❌ Completed sequences
❌ Replied contacts
❌ Bounced contacts
❌ Unsubscribed contacts
❌ Future scheduled emails
❌ Already sent today (hit limit)
```

---

## What Happens to Contact

```
Before:
└─ emailSequence.nextEmailNumber = 2
   └─ nextEmailScheduledFor = May 4, 2 PM

Click "Run Scheduled"
↓

After:
└─ emailSequence.currentEmailNumber = 2 (completed)
   └─ emailHistory: added new entry
      └─ Email 2 sent, deliveryStatus: "sent"
      └─ sentAt: May 5, 2:00 PM
   └─ emailStats.emailsSent += 1
   └─ nextEmailNumber = 3
   └─ nextEmailScheduledFor = May 8 (Day 8)
```

---

## Email Content

Same as all other sequences:
- AI-generated OR fallback template
- Greeting (greeting consistency fix applied)
- Personalized tokens: {firstName}, {company}
- FactoryJet footer
- Unsubscribe link (Sequence B + Email 2+)

---

## Response Examples

### Success
```json
{
  "success": true,
  "message": "Processed 5 contacts",
  "results": {
    "successful": 5,
    "failed": 0,
    "totalProcessed": 5,
    "sentToday": 5,
    "remaining": 45
  }
}
```

### Daily Limit Hit
```json
{
  "results": {
    "limitReached": true,
    "message": "Daily limit (50) already reached",
    "sentToday": 50
  }
}
```

### With Errors
```json
{
  "results": {
    "successful": 4,
    "failed": 1,
    "errors": [{
      "email": "invalid@test.com",
      "error": "Email domain is blocked"
    }]
  }
}
```

---

## Files Involved

| File | Role |
|------|------|
| `frontend/src/pages/EnhancedDashboard.jsx` | Button UI & handler |
| `frontend/src/api.js` | API call wrapper |
| `backend/routes/sequence.router.js` | Endpoint definition |
| `backend/ai-service/sequenceService.js` | Core logic |
| `backend/models/Contacts.js` | Data schema |

---

## Testing

### Quick Test
```
1. Create contact with sequence
2. Manually set nextEmailScheduledFor to past
3. Click "Run Scheduled"
4. Verify toast shows success
5. Check contact.emailSequence.emailHistory
```

### Verify Sent Email
```
1. Check logs: "✅ Sent email to..."
2. Check contact.emailStats.emailsSent += 1
3. Check contact.emailSequence.currentEmailNumber = 2
4. Check contact.emailSequence.nextEmailNumber = 3
5. Check new entry in emailHistory array
```

---

## Pro Tips

💡 **Tip 1:** Click multiple times to send batches
💡 **Tip 2:** Check daily limit - only 50/day
💡 **Tip 3:** 10-second delay is intentional (Gmail rate limit)
💡 **Tip 4:** Errors don't stop process - others still send
💡 **Tip 5:** No need to select contacts - automatic

---

## Status

✅ Fully Implemented  
✅ Tested & Working  
✅ Production Ready  
✅ Error Handling Complete  
✅ Performance Optimized  

---

**Last Updated:** May 2, 2026  
**Version:** 1.0


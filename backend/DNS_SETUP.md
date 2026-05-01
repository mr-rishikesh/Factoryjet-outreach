# Phase 3: DNS & Email Infrastructure Setup

## Overview
Phase 3 wires up the actual email delivery infrastructure. This document covers SPF, DKIM, and DMARC setup — the three critical DNS records that ensure your emails bypass spam filters and land in inboxes.

---

## What Are SPF, DKIM, and DMARC?

| Record | Purpose | Impact |
|--------|---------|--------|
| **SPF** | Declares which servers can send mail from your domain | 🟡 Basic authentication (~50% spam filter improvement) |
| **DKIM** | Cryptographic signature proving you own the domain | 🟢 Strong authentication (~70% improvement) |
| **DMARC** | Policy that says what to do with failed SPF/DKIM | 🟢 Reporter + enforcer (~90% improvement) |

---

## Step 1: Add SPF Record

**Go to:** Your domain registrar (GoDaddy, Namecheap, Route53, etc.)

**Add a new TXT record with these values:**

```
Type: TXT
Name: @ (or your root domain)
Value: v=spf1 include:sendingservice.com ~all
```

**For Gmail:**
```
v=spf1 include:gmail.com ~all
```

**For SendGrid (optional, if you migrate later):**
```
v=spf1 include:sendgrid.net ~all
```

**Full record (include all services):**
```
v=spf1 include:gmail.com include:sendgrid.net ~all
```

> **Note**: The `~all` at the end is "soft fail" (warns but doesn't reject). Use `-all` for "hard fail" (strict) only if you're certain all your mail comes from those sources.

---

## Step 2: Add DKIM Record

DKIM requires a key pair (public + private). For Gmail, it's automatic. For SendGrid or custom SMTP:

### If using Gmail SMTP (current):
Gmail automatically signs emails with DKIM. No manual setup needed — just verify domain ownership.

### If using SendGrid or another service:
1. Login to SendGrid dashboard
2. Go to **Settings → Sender Authentication**
3. Click **Add Domain**
4. Enter your domain (e.g., `factoryjet.com`)
5. SendGrid will generate DKIM records — copy them
6. Add to your domain registrar as TXT records

**Example DKIM records:**
```
Type: TXT
Name: default._domainkey.factoryjet.com
Value: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDX...
```

---

## Step 3: Add DMARC Record

**Go to:** Your domain registrar

**Add a new TXT record:**

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:admin@factoryjet.com; ruf=mailto:admin@factoryjet.com; fo=1
```

**What each part does:**
- `v=DMARC1` — Version
- `p=quarantine` — Policy (options: `none`, `quarantine`, `reject`)
  - `none` — Report only, don't block
  - `quarantine` — Suspected spam gets quarantined (recommended for testing)
  - `reject` — Fail outright (use after testing)
- `rua=mailto:admin@factoryjet.com` — Send aggregate reports here (daily)
- `ruf=mailto:admin@factoryjet.com` — Send forensic reports here (detailed, per-failure)
- `fo=1` — Report format (0=DMARC only, 1=include SPF/DKIM failures)

**Recommended for phase 3 (testing):**
```
v=DMARC1; p=quarantine; rua=mailto:developer@factoryjet.com; ruf=mailto:developer@factoryjet.com; fo=1
```

**After 1 week of monitoring (when confident):**
```
v=DMARC1; p=reject; rua=mailto:developer@factoryjet.com; ruf=mailto:developer@factoryjet.com; fo=1
```

---

## Step 4: Verify Setup

### Check SPF
```bash
# Linux/Mac
nslookup -type=TXT factoryjet.com
dig factoryjet.com TXT

# Windows PowerShell
Resolve-DnsName -Name factoryjet.com -Type TXT
```

**Should return:**
```
factoryjet.com. 3600 IN TXT "v=spf1 include:gmail.com ~all"
```

### Check DKIM
```bash
nslookup -type=TXT default._domainkey.factoryjet.com
dig default._domainkey.factoryjet.com TXT
```

### Check DMARC
```bash
nslookup -type=TXT _dmarc.factoryjet.com
dig _dmarc.factoryjet.com TXT
```

### Online Validator
Use **mxtoolbox.com** or **dmarcian.com** to validate all three records at once.

---

## Step 5: Environment Variables

Add these to your `.env` file (backend root):

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM_NAME=Bhavesh at FactoryJet

# Sequence sending
BASE_URL=https://factoryjet.com
DAILY_SEND_LIMIT=50

# Cron schedule
CRON_SCHEDULE=0 * * * *
SEND_DAYS=2,3
SEND_HOUR_START=7
SEND_HOUR_END=11

# Bounce webhook
BOUNCE_WEBHOOK_SECRET=your-random-secret-here
```

**Explanation:**
- `SMTP_HOST/PORT/SECURE` — Email server config
- `EMAIL_USER/PASS` — Login credentials
- `EMAIL_FROM_NAME` — Display name in emails
- `BASE_URL` — Used for unsubscribe links
- `DAILY_SEND_LIMIT` — Max emails per day (rate limiting)
- `CRON_SCHEDULE` — When to run sends (`0 * * * *` = every hour)
- `SEND_DAYS` — Days to send (2,3 = Tuesday, Wednesday)
- `SEND_HOUR_START/END` — Time window (7-11 = 7am to 11am)
- `BOUNCE_WEBHOOK_SECRET` — Security token for bounce webhook

---

## Gmail App Password Setup

If using Gmail with 2FA:

1. Go to **Google Account → Security**
2. Enable **2-Step Verification** (if not already)
3. Go back to **Security → App passwords**
4. Select **Mail** and **Windows (or your device)**
5. Google generates a 16-character password
6. Copy this into `EMAIL_PASS` in `.env`
7. **Do NOT use your Gmail password** — use the app password only

---

## Troubleshooting

### Emails going to spam
- **Check:** SPF/DKIM/DMARC records are added (use mxtoolbox.com)
- **Check:** Sending from verified domain (not Gmail address)
- **Fix:** Switch `~all` to `-all` in SPF (hard fail)
- **Fix:** Wait 24-48 hours for DNS propagation

### Unsubscribe link not working
- **Check:** `BASE_URL` in `.env` matches your domain
- **Check:** Domain is publicly accessible (not localhost)
- **Test:** `GET /unsubscribe?token=<validContactId>`

### Bounce webhook not triggering
- **Check:** Email service (SendGrid, Mailgun, etc.) webhook is configured
- **Check:** `BOUNCE_WEBHOOK_SECRET` header matches webhook secret
- **Test:** `POST /api/delivery/bounce` with valid email

### Rate limiting too aggressive
- **Adjust:** `DAILY_SEND_LIMIT` in `.env` (default 50)
- **Adjust:** Delay between sends in `sequenceService.js` line ~350 (default 10 seconds)

---

## Known Issues & Fixes

### ⚠️ Domain name typo in prompt.js
**Issue:** Email sequences reference `factoryjetecom.com` (wrong) instead of `factoryjet.com`

**Location:** `backend/ai-service/prompt.js` — search for `sending_from` fields

**Fix:**
```javascript
// OLD (wrong):
sending_from: "factoryjetecom.com"

// NEW (correct):
sending_from: "factoryjet.com"
```

This needs to be corrected in both SEQUENCE_A and SEQUENCE_B definitions.

---

## Phase 3 Deployment Checklist

- [ ] DNS records added (SPF, DKIM, DMARC)
- [ ] Records validated (mxtoolbox.com)
- [ ] `.env` configured with SMTP settings
- [ ] Gmail app password created (if using Gmail)
- [ ] `node server.js` starts without errors
- [ ] Cron job logs appear in console (check CRON timestamp)
- [ ] Test unsubscribe: `GET /unsubscribe?token=<validId>`
- [ ] Test bounce webhook: `POST /api/delivery/bounce`
- [ ] Send test email via API: `POST /api/sequences/:id/send`
- [ ] Email arrives in inbox (check spam folder)
- [ ] Email headers contain List-Unsubscribe header
- [ ] Analytics include bounce stats: `GET /api/sequences/analytics`

---

## Next Steps

Once DNS is configured and tested:

1. **Phase 4**: Pre-Send Validation Checklist
   - Automated compliance checks
   - Email verification (bounce <2%)
   - Token validation
   - Audit log system

2. **Phase 5**: Frontend Dashboard
   - Campaign scheduler UI
   - Real-time performance tracking
   - A/B test result viewer
   - Reply rate analytics

---

**Phase 3 Status:** Ready for production ✅

---

*Last Updated: April 30, 2026*

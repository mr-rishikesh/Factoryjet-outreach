# FactoryJet Complete Testing Checklist

## Pre-Testing Setup
- [ ] Backend running on `http://localhost:5000`
- [ ] Frontend running on `http://localhost:5173`
- [ ] MongoDB Atlas connected
- [ ] SMTP credentials valid in `.env`
- [ ] Groq API key valid in `.env`

---

## Phase 1: Backend Services

### 1.1 Server Startup
**Command:** `node backend/server.js`
**Expected Output:**
```
SERVER.JS LOADED AT [timestamp]
✅ MongoDB connected
✅ Email router mounted
✅ Contacts router mounted
✅ Sequences router mounted
✅ Delivery router mounted
✅ Compliance router mounted
```
- [ ] No errors on startup
- [ ] All routers mounted successfully
- [ ] MongoDB connection established

### 1.2 API Health Check
**Test endpoints:**
```bash
# 1. Test route works
curl http://localhost:5000/api/test

# Expected: {"success":true,"message":"Test route works"}

# 2. Check contact count in DB
curl http://localhost:5000/api/debug/contacts-count

# Expected: {"success":true,"totalContacts":0,"sample":[]}

# 3. Check API returns contacts format
curl http://localhost:5000/api/debug/contacts-api

# Expected: {"success":true,"data":[],"pagination":{"page":1,"limit":5,"total":0,"pages":0}}
```
- [ ] Test route responds
- [ ] Contact count endpoint works
- [ ] API contacts endpoint works

---

## Phase 2: CSV Upload & Data Ingestion

### 2.1 Sample CSV Upload
**File:** `sample-contacts.csv` (5 records with valid emails)

**Steps:**
1. Open dashboard at `http://localhost:5173`
2. Click **"Import CSV"** button
3. Select `sample-contacts.csv`
4. Click **"Upload & import"**
5. Check response showing: inserted count > 0

**Expected Results:**
- [ ] Upload succeeds
- [ ] Response shows "X contacts added"
- [ ] Zero errors in browser console
- [ ] Backend logs: `[UPLOAD] SUMMARY: Total rows=5, Inserted=X, Skipped=Y`

### 2.2 Verify Data in Database
```bash
curl http://localhost:5000/api/debug/contacts-count

# Expected: {"success":true,"totalContacts":5,"sample":[{firstName:"John",...}]}
```
- [ ] Total contacts = 5
- [ ] Sample data shows correct fields
- [ ] Email field populated

---

## Phase 3: Dashboard - Contacts Display

### 3.1 Dashboard Load
**URL:** `http://localhost:5173`

**Visual Checks:**
- [ ] "Outreach" page header visible
- [ ] "Import CSV" button visible
- [ ] Stats bar shows: 5 contacts, 0 emails sent, 0 replied, 0 bounced
- [ ] Contact table shows 5 rows
- [ ] Columns visible: Name, Email, Company, Title, Status, Sent, Replied, Followups, DNC

### 3.2 Table Functionality
- [ ] Click column header → sorts ascending/descending
- [ ] Click checkbox → selects row
- [ ] Click "Select All" → selects all visible rows
- [ ] Click row → navigates to detail page (`/contacts/{id}`)
- [ ] Pagination works (if >25 contacts)
- [ ] Search input → debounces 400ms
- [ ] Filter button opens panel
- [ ] Columns button toggles visible columns

**Browser Console Check:**
```javascript
// In DevTools Console
localStorage.getItem('contacts') // Should not have old cached data
```
- [ ] No CORS errors
- [ ] No 404 errors
- [ ] No JavaScript errors

---

## Phase 4: Sequences Page

### 4.1 Sequences Load
**URL:** `http://localhost:5173/sequences`

**Visual Checks:**
- [ ] Page title: "Sequences"
- [ ] Health cards show: Active Sequences, Ready to Send, Total Sent
- [ ] Filter buttons: "All Sequences", "Sequence A", "Sequence B"
- [ ] "Run Scheduled Sends" button visible
- [ ] Table header: "Due for Email (0)"

### 4.2 Health Metrics
```bash
curl http://localhost:5000/api/sequences/health

# Expected: {"success":true,"health":{"activeSequences":0,"readyToSend":0,"totalEmailsSent":0}}
```
- [ ] API endpoint responds
- [ ] Numbers match dashboard display
- [ ] No errors in backend logs

### 4.3 Due for Email
```bash
curl http://localhost:5000/api/sequences/due

# Expected: {"success":true,"count":0,"data":[]}
```
- [ ] API endpoint works
- [ ] Returns correct format with `data` array
- [ ] Table shows "No contacts due for email right now"

---

## Phase 5: Analytics Page

### 5.1 Analytics Load
**URL:** `http://localhost:5173/analytics`

**Visual Checks:**
- [ ] Page title: "Analytics"
- [ ] Filter buttons: "All Sequences", "Sequence A", "Sequence B"
- [ ] Summary cards visible (Total Sequences, Total Replies, Reply Rate, etc.)
- [ ] Status breakdown chart visible
- [ ] Email funnel chart visible
- [ ] A/B performance section visible
- [ ] Bounce analysis cards visible

### 5.2 Analytics Data
```bash
curl http://localhost:5000/api/sequences/analytics

# Expected: {"success":true,"data":{...analytics object}}
```
- [ ] API endpoint responds
- [ ] Returns analytics with structure:
  - `totalSequencesStarted`
  - `totalReplies`
  - `replyRate`
  - `sequenceStatusBreakdown`
  - `emailsSentBreakdown`
  - `abTestResults`
  - `bounceStats`

---

## Phase 6: Compliance Page

### 6.1 Compliance Load
**URL:** `http://localhost:5173/compliance`

**Visual Checks:**
- [ ] Page title: "Compliance"
- [ ] Section 1: Compliance Score (with run check button)
- [ ] Section 2: Audit Log table
- [ ] Section 3: Suppression List with add form

### 6.2 Compliance Check
```bash
curl http://localhost:5000/api/compliance/check/A

# Expected: {"success":true,"data":{"score":...,"checks":{...},"recommendations":[...]}}
```
- [ ] API endpoint works
- [ ] Returns compliance score (0-100)
- [ ] Includes checks: SPF, DKIM, token completeness, list quality, unsubscribe link
- [ ] Returns recommendations array

### 6.3 Suppression List
```bash
curl http://localhost:5000/api/compliance/suppression?page=1&limit=50

# Expected: {"success":true,"data":[],"pagination":{...}}
```
- [ ] API endpoint works
- [ ] Empty list shows "No suppressed emails yet"
- [ ] Stats cards show: Total Suppressed=0, Bounced=0, Unsubscribed=0

### 6.4 Audit Log
```bash
curl http://localhost:5000/api/compliance/audit-log?page=1&limit=20

# Expected: {"success":true,"data":[],"pagination":{...}}
```
- [ ] API endpoint works
- [ ] Empty log shows "No audit log entries yet"
- [ ] Would show events once emails sent

---

## Phase 7: CORS & Frontend-Backend Communication

### 7.1 CORS Headers Check
```bash
# Test preflight request
curl -X OPTIONS http://localhost:5000/api/contacts \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -v

# Look for: Access-Control-Allow-Origin: http://localhost:5173
```
- [ ] CORS headers present
- [ ] Allow-Origin matches frontend origin
- [ ] Allow-Methods includes GET, POST, PATCH
- [ ] Allow-Headers includes Content-Type

### 7.2 Cross-Origin Requests
In browser console:
```javascript
// Test API call
fetch('http://localhost:5000/api/contacts?page=1&limit=1')
  .then(r => r.json())
  .then(d => console.log('Success:', d))
  .catch(e => console.error('Error:', e))
```
- [ ] No CORS errors
- [ ] Response received successfully
- [ ] Data structure correct

---

## Phase 8: Send Email Flow

### 8.1 Pre-Send Validation
**Current State:** 5 sample contacts uploaded

**Expected Validations:**
- Email format: valid
- Domain: not blocked (factoryjet.com is valid)
- Flags: not bounced, not DNC, not unsubscribed
- Tokens: firstName, companyName, industry populated
- Sequence: not completed/replied/bounced

### 8.2 Manual Send Test
**Steps:**
1. Go to Dashboard
2. Select 1 contact (click checkbox)
3. Click "Send Email" button in bulk actions
4. Watch browser console

**Expected:**
```
POST http://localhost:5000/api/contacts/emails/send
```
- [ ] Request sent successfully
- [ ] Response: `{"success":true,"successful":1,"failed":0}`
- [ ] Backend logs: `[SEND] Sent email to [email]`
- [ ] Contact's `emailStats.emailsSent` increments

### 8.3 Email Delivery
**Check Gmail inbox:**
- [ ] Email arrives in inbox
- [ ] Subject matches AI-generated subject
- [ ] Body contains personalized tokens (firstName, companyName)
- [ ] Unsubscribe link present at bottom
- [ ] Email headers include:
  - `List-Unsubscribe: <http://localhost:5000/unsubscribe?token=...>`
  - `Message-ID: <...>`
  - `X-Mailer: FactoryJet-Outreach/3.0`

### 8.4 Database Update
```bash
curl http://localhost:5000/api/contacts?page=1&limit=1

# Check the contact record
```
- [ ] `emailStats.emailsSent` = 1
- [ ] `outreachStatus` = "SENT"
- [ ] `emailSequence.emailHistory[0].deliveryStatus` = "sent"
- [ ] `emailSequence.emailHistory[0].sentAt` = recent timestamp

---

## Phase 9: Scheduled Sends (Cron Job)

### 9.1 Cron Configuration
**Check `.env`:**
```bash
CRON_SCHEDULE=0 * * * *        # Runs hourly
SEND_DAYS=2,3                   # Tuesday (2), Wednesday (3)
SEND_HOUR_START=7               # 7 AM
SEND_HOUR_END=11                # 11 AM
DAILY_SEND_LIMIT=50
```
- [ ] `CRON_SCHEDULE` set
- [ ] `SEND_DAYS` includes valid weekday numbers
- [ ] `SEND_HOUR_START` < `SEND_HOUR_END`
- [ ] `DAILY_SEND_LIMIT` > 0

### 9.2 Cron Job Running
**Check backend logs on the hour:**
```
[CRON] Running scheduled sends...
[CRON] ✅ Completed: X sent, Y failed
```
- [ ] Cron job fires at configured time
- [ ] Respects send windows (days/hours)
- [ ] Respects daily limit
- [ ] Logs completion status

---

## Phase 10: Bounce Handling

### 10.1 Bounce Webhook
**Simulate bounce:**
```bash
curl -X POST http://localhost:5000/api/delivery/bounce \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@acmecorp.com","bounceType":"hard","bounceReason":"Permanent failure"}'

# Expected: {"success":true,"contactId":"...","email":"john.doe@acmecorp.com"}
```
- [ ] Endpoint responds successfully
- [ ] Contact found by email
- [ ] Response includes contactId

### 10.2 Contact Flags Updated
```bash
curl http://localhost:5000/api/contacts?page=1&limit=1

# Check the contact record for bounced flags
```
- [ ] `flags.bounced` = true
- [ ] `flags.bounceType` = "hard"
- [ ] `flags.bounceReason` = "Permanent failure"
- [ ] `flags.bouncedAt` = recent timestamp
- [ ] `emailSequence.sequenceStatus` = "bounced"

### 10.3 Audit Log Entry
```bash
curl http://localhost:5000/api/compliance/audit-log?page=1&limit=1
```
- [ ] New entry with `eventType` = "bounce"
- [ ] Entry contains email address
- [ ] Entry contains bounce reason

---

## Phase 11: Unsubscribe Flow

### 11.1 Get Unsubscribe URL
**From sent email or directly:**
```
http://localhost:5000/unsubscribe?token={contactId}
```

**Steps:**
1. Copy contact _id from database
2. Visit: `http://localhost:5000/unsubscribe?token={contactId}`
3. Should see confirmation page

**Expected:**
- [ ] Page loads successfully
- [ ] Shows "You have been unsubscribed" message
- [ ] Contact record updated

### 11.2 Contact Unsubscribe Flag
```bash
curl http://localhost:5000/api/contacts?page=1&limit=1
```
- [ ] `flags.unsubscribe` = true
- [ ] `emailSequence.sequenceStatus` = "unsubscribed"

### 11.3 Audit Log Entry
```bash
curl http://localhost:5000/api/compliance/audit-log?page=1&limit=1
```
- [ ] New entry with `eventType` = "unsubscribe"
- [ ] Entry contains email address

---

## Phase 12: Compliance Checks

### 12.1 Email Verification
```bash
curl -X POST http://localhost:5000/api/compliance/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"john@google.com"}'

# Expected: {"success":true,"data":{"valid":true,"checks":{...},"warnings":[]}}
```
- [ ] Endpoint works
- [ ] Returns validation result
- [ ] Includes format check
- [ ] Includes MX record lookup
- [ ] Flags role accounts (info@, support@, etc.)

### 12.2 Suppression List Management
```bash
# Add email to suppression
curl -X POST http://localhost:5000/api/compliance/suppression \
  -H "Content-Type: application/json" \
  -d '{"email":"spam@example.com","reason":"bounced"}'

# Expected: {"success":true}

# Get suppression list
curl http://localhost:5000/api/compliance/suppression

# Expected: {"success":true,"data":[...],"pagination":{...}}

# Get suppression stats
curl http://localhost:5000/api/compliance/suppression/stats

# Expected: {"success":true,"data":{"totalSuppressed":1,"bounced":1,"unsubscribed":0}}
```
- [ ] Add suppression works
- [ ] Email added to database
- [ ] Get list returns suppressed emails
- [ ] Stats reflect correct counts

---

## Phase 13: Navigation & Routing

### 13.1 Frontend Routes
- [ ] `/` → Dashboard (Outreach) ✅
- [ ] `/sequences` → Sequences page ✅
- [ ] `/analytics` → Analytics page ✅
- [ ] `/compliance` → Compliance page ✅
- [ ] `/contacts/:id` → Contact detail page ✅

### 13.2 Navigation Tabs
In Layout.jsx header:
- [ ] "Overview" tab links to `/` (active when pathname = `/`)
- [ ] "Sequences" tab links to `/sequences`
- [ ] "Analytics" tab links to `/analytics`
- [ ] "Compliance" tab links to `/compliance`
- [ ] Active tab highlighted with white background

### 13.3 Back Navigation
From contact detail page:
- [ ] Back button or link returns to dashboard
- [ ] Pagination preserved (page, limit, sort, filters)
- [ ] Search query preserved

---

## Phase 14: Error Handling

### 14.1 API Errors
**Test invalid contact ID:**
```bash
curl http://localhost:5000/api/contacts/invalid123
```
- [ ] Returns 500 or 400 with error message
- [ ] Frontend shows toast error
- [ ] No console crashes

### 14.2 Network Errors
**Simulate by stopping backend:**
1. Stop backend server
2. Try to load dashboard
3. Check browser behavior

- [ ] Shows "Failed to load contacts" toast
- [ ] Shows spinner/loading state
- [ ] Doesn't crash the app

### 14.3 Empty State UX
- [ ] Empty contacts table → shows "No results found"
- [ ] Empty sequences → shows "No contacts due for email"
- [ ] Empty analytics → shows placeholder state
- [ ] Empty suppression list → shows "No suppressed emails yet"

---

## Phase 15: Performance & Optimization

### 15.1 Pagination Performance
- [ ] Load 1000+ contacts
- [ ] Navigate pages quickly
- [ ] No lag on sorting
- [ ] Search debounces (doesn't fire on every keystroke)

### 15.2 Rendering
- [ ] Contact table with 25 rows renders smoothly
- [ ] Charts (if using recharts) render without lag
- [ ] No console warnings about re-renders
- [ ] No memory leaks (check DevTools Performance)

### 15.3 API Response Times
```bash
time curl http://localhost:5000/api/contacts?page=1&limit=25
```
- [ ] Response time < 200ms
- [ ] No slow queries on database

---

## Final Sign-Off Checklist

### Backend
- [ ] Server starts without errors
- [ ] All routers mounted
- [ ] MongoDB connected
- [ ] CORS headers correct
- [ ] Email sending works
- [ ] Cron job running
- [ ] Audit logging works
- [ ] Bounce handling works

### Frontend
- [ ] All pages load
- [ ] All routes work
- [ ] CORS errors resolved
- [ ] No console errors
- [ ] API calls successful
- [ ] UI responsive and styled correctly
- [ ] Navigation tabs functional

### Data Flow
- [ ] CSV upload → Database ✅
- [ ] Dashboard shows contacts ✅
- [ ] Click send → Email sent ✅
- [ ] Bounce received → Contact flagged ✅
- [ ] Unsubscribe → Contact flagged & audit logged ✅
- [ ] Compliance checks → Score calculated ✅

### Production Readiness
- [ ] `.env` has all required variables
- [ ] No hardcoded credentials in code
- [ ] Error messages user-friendly
- [ ] No console.logs left in (or appropriately scoped)
- [ ] Database indexes present
- [ ] Rate limiting configured
- [ ] CORS restricted to allowed origins

---

## Sign-Off Date: ___________
## Tested By: ___________
## Status: [ ] PASS [ ] FAIL - Blockers: _________

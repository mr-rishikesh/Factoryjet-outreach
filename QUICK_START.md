# FactoryJet - Quick Start Guide

## 🚀 Start the Application (2 minutes)

### Terminal 1: Backend
```bash
cd backend
npm install
node server.js
```
**Expected Output:**
```
✅ MongoDB connected
✅ All routers mounted
🚀 Server running on http://localhost:5000
```

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm run dev
```
**Expected Output:**
```
➜ Local: http://localhost:5173/
```

## 🌐 Access the App

Open your browser to: **http://localhost:5173**

---

## 📋 Core Workflows

### 1️⃣ Upload Contacts
1. Click **"Import CSV"** button (top right)
2. Select `sample-contacts.csv` or your CSV file
3. Click **"Upload & import"**
4. Wait for success message

**Expected Result:**
- Dashboard shows contact count
- Table displays all contacts

### 2️⃣ Send an Email
1. Go to **Dashboard** tab
2. Select 1-5 contacts (click checkboxes)
3. Click **"Send Email"** button (bulk actions bar)
4. Check email arrives in inbox

**Expected Result:**
- Toast shows "Sent X emails"
- Contact's email count increments
- Email in Gmail with personalization

### 3️⃣ View Sequences
1. Click **"Sequences"** tab
2. See health metrics (Active, Ready, Total Sent)
3. View "Due for Email" table
4. Click "Run Scheduled Sends" to manually trigger

**Expected Result:**
- Health cards show correct numbers
- Due contacts listed (if any)
- Scheduled sends complete successfully

### 4️⃣ View Analytics
1. Click **"Analytics"** tab
2. See summary cards (Sequences, Replies, Rate, etc.)
3. View charts (Status, Funnel, A/B, Bounces)
4. Use filter buttons to view Sequence A/B

**Expected Result:**
- All charts render
- Numbers match database
- Filter buttons work

### 5️⃣ Check Compliance
1. Click **"Compliance"** tab
2. See compliance score section
3. Click "Run Compliance Check" button
4. View audit log and suppression list
5. Add email to suppression (test form)

**Expected Result:**
- Score displays (0-100)
- Checks show pass/fail
- Audit log entries visible
- Suppression form works

---

## 🔍 Verify Everything Works

### Quick Test (30 seconds)
```bash
# In a new terminal:
node test-all-routes.js
```

**Expected Output:**
```
✅ 25+ routes working
✅ 90%+ success rate
✅ All critical endpoints functional
```

### Manual Verification

**Test 1: Backend Health**
```bash
curl http://localhost:5000/api/test
# Expected: {"success":true,"message":"Test route works"}
```

**Test 2: Contact Count**
```bash
curl http://localhost:5000/api/debug/contacts-count
# Expected: {"success":true,"totalContacts":0,"sample":[]}
```

**Test 3: Sequences Health**
```bash
curl http://localhost:5000/api/sequences/health
# Expected: {"success":true,"health":{"activeSequences":0,"readyToSend":0,"totalEmailsSent":0}}
```

---

## 📊 API Endpoints (Quick Reference)

### Contacts
- `GET /api/contacts` - List all contacts
- `GET /api/contacts/stats` - Get KPI stats
- `POST /api/contacts/emails/send` - Send email

### Sequences
- `GET /api/sequences/health` - Service health
- `GET /api/sequences/due` - Due for email
- `GET /api/sequences/analytics` - Analytics data

### Compliance
- `GET /api/compliance/check/A` - Compliance score
- `GET /api/compliance/audit-log` - Audit entries
- `GET /api/compliance/suppression` - Suppression list

### Upload
- `POST /upload` - Upload CSV file

---

## ⚙️ Configuration

### Email Setup (.env)
```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=app-specific-password
SMTP_HOST=smtp.gmail.com
```

### Send Schedule (.env)
```
CRON_SCHEDULE=0 * * * *    # Hourly
SEND_DAYS=2,3               # Tuesday, Wednesday
SEND_HOUR_START=7           # 7 AM
SEND_HOUR_END=11            # 11 AM
DAILY_SEND_LIMIT=50         # Max 50/day
```

---

## 🆘 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **CORS Error** | Restart backend (Ctrl+C, then `node server.js`) |
| **Routes 404** | Check backend started with "✅ routers mounted" message |
| **No Contacts** | Check CSV has "Email" column, run upload again |
| **Email Not Sending** | Verify `.env` Gmail credentials, check console for errors |
| **Blank Dashboard** | Hard refresh browser (Ctrl+Shift+R), clear cache |
| **MongoDB Error** | Verify connection string in `.env` |

---

## 📁 Key Files to Know

| File | Purpose |
|------|---------|
| `backend/server.js` | Main Express app & routing |
| `backend/routes/` | API endpoints |
| `backend/services/` | Business logic |
| `frontend/src/pages/` | Dashboard, Sequences, Analytics, Compliance |
| `frontend/src/api.js` | API client wrapper |
| `.env` | Configuration (Gmail, Groq, MongoDB) |

---

## 📚 Documentation Files

- **ARCHITECTURE.md** - Complete system design (read this first)
- **TESTING_CHECKLIST.md** - 15-phase testing guide
- **FINAL_STATUS_REPORT.md** - Full project summary
- **test-all-routes.js** - Automated endpoint testing

---

## 🎯 Success Criteria

- [ ] Backend starts without errors
- [ ] Frontend loads at http://localhost:5173
- [ ] Dashboard displays correctly
- [ ] Can upload CSV file
- [ ] Can send email to contact
- [ ] Can view Sequences page
- [ ] Can view Analytics page
- [ ] Can view Compliance page
- [ ] All 29 API routes working (run test script)
- [ ] No console errors

---

## 🚀 Next Steps

1. **Local Testing** (15 min)
   - Start backend & frontend
   - Upload sample CSV
   - Send test email
   - Check all pages

2. **Production Deployment** (varies)
   - Deploy backend (Heroku/AWS/Render)
   - Deploy frontend (Vercel/Netlify)
   - Configure DNS (SPF/DKIM)
   - Set webhook URL for bounces

3. **Add Authentication** (future)
   - Implement JWT or OAuth
   - Add user sign-up/login
   - Restrict routes to logged-in users

4. **Integrate Email Provider** (future)
   - Set up SendGrid or AWS SES
   - Configure bounce webhooks
   - Add reply detection

---

## 💡 Pro Tips

1. **Bulk Upload** - Use `sample-contacts.csv` to quickly populate test data
2. **Cron Jobs** - Configure `SEND_DAYS` and `SEND_HOUR_START/END` to auto-send during business hours
3. **Compliance** - Run "Compliance Check" to verify SPF/DKIM records before sending
4. **Rate Limiting** - Set `DAILY_SEND_LIMIT` to avoid spam filters (recommend 50-100/day)
5. **Debugging** - Run `node test-all-routes.js` to verify all endpoints
6. **Logs** - Check backend console for detailed error messages and audit events

---

## 📞 Support

- Check the **TESTING_CHECKLIST.md** for detailed troubleshooting
- Review **ARCHITECTURE.md** for system design questions
- Run **test-all-routes.js** to diagnose endpoint issues
- Check backend logs for detailed error messages

---

**Ready to go!** 🎉 Follow the steps above and you'll have a fully functional email outreach platform running locally.

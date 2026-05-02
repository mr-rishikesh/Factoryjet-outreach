# 🔍 Scheduled Sends Debugging Guide

**Date:** May 2, 2026  
**Status:** Diagnostic logging added  
**Purpose:** Help identify why emails aren't being sent

---

## 🎯 Quick Diagnostics

### Step 1: Check Browser Console
When you click "Run Scheduled Sends":

1. Open browser DevTools (F12)
2. Click "Run Scheduled Sends" button
3. Check Console tab for messages

**You should see:**
```
✅ Sent 5 emails
or
ℹ No contacts due for email at this time
or
❌ 2 failed: [reason]
```

### Step 2: Check Server Console
Watch the terminal where `npm run dev` is running:

```
[SCHEDULED] Daily sent count: 0/50
[SCHEDULED] Found 5 contacts due for email
[SCHEDULED] Processing 5 contacts (limit allows 50)
✅ Sent email to john@example.com (John Acme)
[SCHEDULED] Complete - Sent: 5, Failed: 0
```

---

## 🔴 Possible Issues & Solutions

### Issue 1: "No contacts due for email at this time"

**Symptoms:**
```
[SCHEDULED] Found 0 contacts due for email
```

**Cause:** No contacts have:
- Active sequence status
- nextEmailScheduledFor <= current time

**Solution:**
1. Check if you've created any sequences
2. Go to dashboard and start a sequence with some contacts
3. Click "Run Scheduled Sends" again

**To verify:**
```javascript
// In MongoDB Compass, check:
db.contacts
  .find({
    "emailSequence.sequenceStatus": "active",
    "emailSequence.nextEmailScheduledFor": { $lte: new Date() }
  })
```

---

### Issue 2: "X failed: Cannot send: Missing first name..."

**Symptoms:**
```
❌ 3 failed: Cannot send: Missing first name (required for {{first_name}} token)
```

**Cause:** Contact is missing required fields (firstName, companyName, industry)

**Solution:**
1. Edit the contacts to add missing information
2. Or upload contacts with complete data
3. Then try scheduled sends again

**To fix in database:**
```javascript
// In MongoDB Compass:
db.contacts.updateMany(
  { "firstName": { $in: [null, ""] } },
  { $set: { "firstName": "Unknown" } }
)
```

---

### Issue 3: "X failed: Cannot send: Email domain is blocked..."

**Symptoms:**
```
❌ 2 failed: Cannot send: Email domain is blocked from cold outreach
```

**Cause:** Contact email is from blocked domain (gmail.com, yahoo.com, etc.)

**Solution:**
1. Use business email addresses (company.com, acme.com, etc.)
2. Remove contacts with personal emails
3. Try with clean contact list

---

### Issue 4: "X failed: Cannot send: Contact email bounced..."

**Symptoms:**
```
❌ 1 failed: Cannot send: Contact email bounced. Sequence halted.
```

**Cause:** Contact was marked as bounced in past

**Solution:**
1. Check contact flags in database
2. Remove bounced flag if email is now valid
3. Or delete contact and re-add

**To fix:**
```javascript
// In MongoDB Compass:
db.contacts.updateMany(
  { "flags.bounced": true },
  { $set: { "flags.bounced": false } }
)
```

---

### Issue 5: "X failed: Cannot send: Daily limit (50) already reached..."

**Symptoms:**
```
[SCHEDULED] Daily limit reached
```

**Cause:** Already sent 50 emails today

**Solution:**
Wait until tomorrow or change the daily limit in code (line 437 in sequenceService.js)

---

### Issue 6: Emails sending but not arriving in inbox

**Symptoms:**
```
✅ Sent 5 emails
```
(But emails don't arrive)

**Cause:** SMTP configuration issue

**Check:**
1. `.env` file has correct SMTP settings:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

2. Server console for SMTP errors:
   ```
   nodemailer error: ...
   ```

3. Gmail security:
   - Enable "Less secure app access"
   - Or use App-specific password

---

## 📊 Logging Output Explained

### When You Click "Run Scheduled Sends"

```
[SCHEDULED] Daily sent count: 0/50
├─ How many emails sent today / daily limit

[SCHEDULED] Found 5 contacts due for email
├─ Number of contacts with active sequences scheduled for now

[SCHEDULED] Processing 5 contacts (limit allows 50)
├─ How many will be sent this run / remaining daily budget

✅ Sent email to john@example.com (John Acme)
├─ Success! Email sent to this contact

❌ Failed to send email to jane@example.com: Missing first name
├─ Failed! See reason in message

[SCHEDULED] Complete - Sent: 5, Failed: 0
├─ Final results
```

---

## 🧪 Test Scenario

### Setup for Successful Send

1. **Create a test contact** with:
   - Name: "Test User"
   - Email: "test@businessdomain.com" (NOT gmail.com)
   - Company: "Test Company"
   - Industry: "Technology"

2. **Start a sequence** on the contact
   - Dashboard → Select contact → Click "Start Sequence" → Choose A or B

3. **Check nextEmailScheduledFor**:
   - In MongoDB Compass, verify `nextEmailScheduledFor` is NOW or PAST

4. **Click "Run Scheduled Sends"**
   - Should see: `✅ Sent 1 email`

5. **Check inbox**
   - Email should arrive in 1-2 minutes

---

## 🔧 Advanced Diagnostics

### Check Contact Status

In MongoDB Compass:
```javascript
db.contacts.findOne({
  "firstName": "Test User"
})
```

Should show:
```javascript
{
  "_id": ObjectId(...),
  "email": "test@businessdomain.com",
  "firstName": "Test User",
  "companyName": "Test Company",
  "industry": "Technology",
  "emailSequence": {
    "sequenceType": "A",
    "sequenceStatus": "active",
    "currentEmailNumber": 0,
    "nextEmailNumber": 1,
    "nextEmailScheduledFor": ISODate("2026-05-02T..."), // Should be NOW or PAST
    "emailHistory": []
  }
}
```

---

## 📝 Logging Locations

### Browser Console (F12)
- Shows: Success/failure messages from frontend
- Shows: Error messages from API calls

### Server Terminal
- Shows: Detailed backend logging with [SCHEDULED] prefix
- Shows: Actual send attempts and failures
- Shows: Database queries and validation

### Email Service Logs
- Gmail/SMTP logs show if email reached mail server
- Check spam/junk folder if email doesn't arrive

---

## ✅ Verification Checklist

Before testing, verify:

- [ ] MongoDB connected (`✅ MongoDB connected` in terminal)
- [ ] Server running (`🚀 Server running on http://localhost:5000`)
- [ ] At least one contact with active sequence
- [ ] Contact has firstName, companyName, industry filled
- [ ] Contact email is from business domain (not gmail.com)
- [ ] nextEmailScheduledFor is NOW or in the PAST
- [ ] SMTP configured in .env

---

## 🚀 Still Not Working?

1. **Check server logs** for [SCHEDULED] prefix messages
2. **Check browser console** (F12) for error messages
3. **Verify contact data** in MongoDB Compass
4. **Check SMTP settings** in .env
5. **Look for validation errors** in failed message

The logging will tell you exactly which step is failing.

---

**Last Updated:** May 2, 2026  
**Status:** ✅ Diagnostic logging enabled


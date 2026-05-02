# 📧 Change Email Address Feature - Guide

## Overview

The **Change Email** button allows you to **update email addresses** for selected contacts directly from the dashboard.

---

## 🎯 When to Use

Use the **Change Email** button when you need to:
- ✅ Correct typos in email addresses
- ✅ Update to new email addresses
- ✅ Fix formatting issues
- ✅ Switch to different contact email
- ✅ Bulk update multiple emails at once

---

## 📍 Location on Dashboard

The **Change Email** button is the **2nd button** in the action bar (cyan/turquoise color):

```
[Run Scheduled] [Change Email] [Edit & Send] [Send Email] [Send Followup] [Start Sequence]
      🔵         🟦 NEW       🟣          🟢         🟣            🟠
```

---

## 📖 How to Use

### Step 1: Select Contacts
```
1. Click checkboxes to select 1+ contacts
2. See "N contacts selected" message
```

### Step 2: Click "Change Email"
```
3. Click the cyan "Change Email" button
4. Modal opens showing selected contacts
```

### Step 3: Enter New Email Addresses
```
5. For each contact, see:
   - Contact name (e.g., "John Smith")
   - Input field for new email
   - Current email shown on the right
6. Type new email address in input field
```

### Step 4: Update
```
7. Click "Update N" button
8. All emails updated
9. See success toast: "Updated N emails"
10. Selection clears, contacts refreshed
```

---

## 🎨 Change Email Modal Interface

```
┌─────────────────────────────────────────────────────┐
│ Change Email Addresses                              │
│ Update email for 3 contacts                   [✕]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ John Smith                                          │
│ [new-email@company.com..................] Current:  │
│                               john@acme.com          │
│                                                     │
│ Jane Doe                                            │
│ [jane.doe@newcompany.com...........] Current:      │
│                               jane@oldmail.com       │
│                                                     │
│ Bob Johnson                                         │
│ [bob@startup.io..................] Current:        │
│                               bob@company.net        │
│                                                     │
│ ⚠️ Important: Changing email addresses will         │
│    update contact records. Ensure new addresses     │
│    are valid.                                       │
│                                                     │
│ [Cancel]                      [Update 3]           │
└─────────────────────────────────────────────────────┘
```

---

## 💡 Example Workflows

### Example 1: Correct Single Typo

**Situation**: Selected 1 contact with typo in email

```
Step 1: See modal with contact "John Smith"
        Current email: john@acme.com (with typo)
        
Step 2: Enter correct email: john@acme.co
        
Step 3: Click "Update 1"
        
Result: Email updated, toast shows "Updated 1 email address"
```

### Example 2: Bulk Update Multiple Emails

**Situation**: Selected 10 contacts needing email updates

```
Step 1: Modal shows all 10 contacts
        
Step 2: Update each one:
        - john@old.com → john@new.com
        - jane@old.com → jane@new.com
        - (etc for all 10)
        
Step 3: Click "Update 10"
        
Result: All 10 updated, success message shown
```

### Example 3: Switch to Alternate Email

**Situation**: Contact has secondary email to use

```
Step 1: Select contact "Sarah Williams"
        Current: sarah@work.com
        
Step 2: Change to: sarah.williams@company.com
        
Step 3: Click "Update 1"
        
Result: Contact now uses new email
```

---

## ✨ Features

✅ **Batch editing** - Update multiple contacts at once  
✅ **Current email display** - See old email while editing  
✅ **Form validation** - Prevents empty submissions  
✅ **Success confirmation** - Toast shows results  
✅ **Auto-refresh** - Contacts update immediately  
✅ **Error handling** - Shows which updates failed  
✅ **Mobile responsive** - Works on all devices  
✅ **Dark theme** - Matches dashboard design  

---

## ⚠️ Important Notes

1. **Validation**: Emails must be valid format
2. **Permanence**: Changes are saved immediately
3. **No Undo**: Changes cannot be undone (use carefully)
4. **Unique**: System prevents duplicate emails
5. **Required**: All selected contacts must have new email
6. **Notification**: No email sent to contacts about change

---

## 🔄 When Email Changes Apply

Updated emails are used for:
- ✅ Future email sends
- ✅ Sequence emails
- ✅ Notifications
- ✅ Follow-ups
- ✅ Statistics (linked to new email)

---

## 📊 Use Cases

| Situation | Solution |
|-----------|----------|
| Typo in email | Select contact, Change Email, fix typo |
| Employee changed email | Select multiple from company, bulk update |
| Wrong email added | Select, change to correct one |
| Generic to personal | Switch from general@company to personal@company |
| Old email to new | Batch update after domain change |

---

## 🐛 Troubleshooting

### "Update N" button is disabled

**Reason**: Not all fields are filled

**Fix**: Enter new email for each contact shown

### "Updated but 1 failed"

**Reason**: That email might be invalid or duplicate

**Check**:
1. Email format is correct (has @)
2. Not already used by another contact
3. Not a duplicate of current email

### Changes not showing

**Check**:
1. Page auto-refreshed after update
2. Table shows new email in email column
3. Try refreshing browser

---

## 💾 What Gets Updated

When you change an email:

```
✅ Contact.email field updated
✅ Future sends use new email
✅ Previous emails stay as-is
✅ Stats linked to new email
✅ Audit log records the change
```

---

## 🎓 Best Practices

1. **Double-check** - Verify new email before clicking update
2. **Copy-paste** - Reduces typos in manual entry
3. **Batch carefully** - Make sure all changes are correct
4. **One at a time** - If unsure, update one contact first
5. **Keep records** - Note what was changed and why

---

## 📋 Common Corrections

### Fix Common Typos

```
gmail.com  → gmail.com (common typo)
gmai.com   → gmail.com
gmial.com  → gmail.com

yahoo.com  → yahoo.com
yahooo.com → yahoo.com
yahou.com  → yahoo.com
```

### Update Email Domains

```
old-company.com  → new-company.com
local-domain.com → corporate.com
gmail.com        → company.com
```

---

## 🔐 Security Notes

- ✅ Changes saved to database
- ✅ Audit log records changes
- ✅ Only valid emails accepted
- ✅ No verification email sent
- ✅ Use carefully - permanent changes

---

## 🎯 Success Criteria

After using Change Email:
- [ ] Modal closed
- [ ] Success toast appeared
- [ ] Contact count updated
- [ ] Table shows new email
- [ ] Selection cleared

---

## 📞 FAQ

**Q: Can I undo a change?**  
A: No, changes are permanent. Be careful!

**Q: What if email already exists?**  
A: System will show error - that email is already in use.

**Q: Does contact get notified?**  
A: No, email change is silent.

**Q: Can I change multiple at once?**  
A: Yes, select all and update them together.

**Q: How long does update take?**  
A: Instantly - all updated when you click button.

---

## 🚀 Try It Now!

1. Go to dashboard
2. Select 1-5 contacts
3. Click **cyan "Change Email"** button (2nd button)
4. Enter new email addresses
5. Click "Update N"
6. Done! ✅

**Use it carefully - changes are permanent!**

---

**Last Updated**: May 2, 2026  
**Status**: ✅ Feature Ready  
**Version**: 1.0

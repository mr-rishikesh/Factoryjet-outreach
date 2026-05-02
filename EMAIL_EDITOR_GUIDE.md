# 📝 Email Editor Guide - Dashboard Feature

## Overview

The **Edit & Send** button allows you to customize and edit email content before sending to your contacts. This gives you complete control over the message while still supporting personalization tokens.

---

## 🎯 When to Use Email Editor

Use the **Edit & Send** button when you want to:
- ✅ Write your own custom email content
- ✅ Override AI-generated emails
- ✅ Send a specific message to selected contacts
- ✅ Add personalization (firstName, company name, etc)
- ✅ Control subject lines and email body
- ✅ A/B test different messaging

---

## 📍 Location on Dashboard

The **Edit & Send** button is the **2nd button** in the action bar (indigo/purple color):

```
[Run Scheduled] [Edit & Send] [Send Email] [Send Followup] [Start Sequence]
      🔵          🟣 NEW       🟢         🟣            🟠
```

---

## 📖 How to Use

### Step 1: Select Contacts
```
1. Click checkboxes to select 1+ contacts
2. See "N contacts selected" message
```

### Step 2: Click "Edit & Send"
```
3. Click the indigo "Edit & Send" button
4. Modal opens with email editor
```

### Step 3: Write Subject Line
```
5. Enter subject in "Subject Line" field
6. Can use tokens like {{firstName}}, {{companyName}}
   Example: "Hi {{firstName}}, quick question about {{companyName}}"
```

### Step 4: Write Email Body
```
7. Enter email content in "Email Body" textarea
8. Use tokens for personalization
9. Format with paragraphs and line breaks
10. Include your signature
```

### Step 5: Send
```
11. Click "Send to N" button
12. See "Sending..." state
13. Get confirmation toast: "Sent N emails, X failed"
14. Selection clears, email draft resets
```

---

## 🎨 Email Editor Interface

```
┌─────────────────────────────────────────────────────┐
│ Edit Email                                          │
│ Customize your email for 5 contacts          [✕]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Subject Line:                                       │
│ [Quick question about your {{companyName}}     ]   │
│ Available tokens: {{firstName}}, {{companyName}}... │
│                                                     │
│ Email Body:                                         │
│ ┌─────────────────────────────────────────────────┐│
│ │ Hi {{firstName}},                               ││
│ │                                                 ││
│ │ I was looking at {{companyName}}'s work in     ││
│ │ {{industry}} and thought you might be open    ││
│ │ to a quick conversation.                       ││
│ │                                                 ││
│ │ Best,                                           ││
│ │ Bhavesh                                         ││
│ │ FactoryJet                                      ││
│ └─────────────────────────────────────────────────┘│
│ Use {{firstName}}, {{companyName}}, {{industry}}   │
│                                                     │
│ 📝 Personalization Tokens:                          │
│ {{firstName}} - First name    {{lastName}} - ...    │
│ {{companyName}} - Company     {{title}} - Job...    │
│ {{industry}} - Industry        {{email}} - Email    │
│                                                     │
│ [Cancel]                      [Send to 5]         │
└─────────────────────────────────────────────────────┘
```

---

## 🏷️ Personalization Tokens

Use these tokens in your subject or body to personalize emails:

| Token | Replaces With | Example |
|-------|---------------|---------|
| `{{firstName}}` | Contact's first name | "Hi John" |
| `{{lastName}}` | Contact's last name | "John Smith" |
| `{{companyName}}` | Company name | "Acme Corp" |
| `{{title}}` | Job title | "Sales Manager" |
| `{{industry}}` | Industry | "Technology" |
| `{{email}}` | Email address | "john@acme.com" |

### Token Examples

**Example 1: Simple greeting**
```
Subject: Quick question, {{firstName}}
Body: Hi {{firstName}},
      I saw you work at {{companyName}} in {{industry}}...
```

**Example 2: Industry-specific**
```
Subject: {{companyName}} + {{industry}} opportunity
Body: {{firstName}}, many {{industry}} companies are...
```

**Example 3: Full personalization**
```
Subject: {{firstName}} - {{title}} at {{companyName}}
Body: Hi {{firstName}},

I noticed you're a {{title}} at {{companyName}}.
Given your background in {{industry}}, I thought...

Let me know if you're open,
Bhavesh
FactoryJet
```

---

## ✨ Tips & Best Practices

### 1. Always Personalize
❌ "Hi there"  
✅ "Hi {{firstName}}"

### 2. Reference Company
❌ "I liked your work"  
✅ "I liked {{companyName}}'s approach to {{industry}}"

### 3. Use Line Breaks
```
✅ Good formatting:
Hi {{firstName}},

[Opening line]

[Main point]

[CTA]

Best,
Bhavesh
```

### 4. Keep It Short
- Aim for 3-5 short paragraphs
- Mobile readers prefer shorter emails
- One main value proposition

### 5. Include Call-to-Action
```
✅ Good CTAs:
- "Open to a quick call this week?"
- "Worth 15 min to chat?"
- "Free to grab coffee Thursday?"
```

### 6. Add Signature
```
Always include:
Best,
[Your Name]
[Company]
```

---

## 🔄 Workflow Example

### Goal: Send custom outreach to 10 Tech VPs

**Step 1**: Filter
```
Filter by: Industry = "Technology", Title contains "VP"
Result: 10 contacts shown
```

**Step 2**: Select All
```
Click header checkbox → All 10 selected
```

**Step 3**: Edit & Send
```
Click "Edit & Send" button
Modal opens
```

**Step 4**: Write Email
```
Subject: "{{firstName}} - quick idea for {{companyName}}"

Body:
Hi {{firstName}},

Saw you're VP at {{companyName}}. Given your background in
{{industry}}, wanted to share something I think would be valuable.

[Your value prop]

Open to a quick call Tuesday?

Best,
Bhavesh
FactoryJet
```

**Step 5**: Send
```
Click "Send to 10"
Wait for "Sent 10 emails, 0 failed" toast
Done! ✅
```

---

## 💡 When to Use Each Feature

| Situation | Use Button |
|-----------|-----------|
| Want to customize email | **Edit & Send** |
| Use AI-generated email | Send Email |
| Follow up on non-reply | Send Followup |
| Multi-email campaign (18 days) | Start Sequence |
| Auto-send all due emails | Run Scheduled |

---

## ⚠️ Important Notes

1. **Subject Required**: Must have a subject line
2. **Body Required**: Must have email body content
3. **Tokens Optional**: Don't use tokens if not needed
4. **Plain Text**: Supports plain text formatting
5. **HTML**: Does NOT support HTML (plain text only)
6. **Length**: No limit on email length (though shorter is better)

---

## 🐛 Troubleshooting

### "Send to N" button is disabled

**Reason**: Either subject or body is empty

**Fix**: Fill in both fields before sending

### Tokens not personalizing

**Check**:
1. Token spelled correctly: `{{firstName}}` not `{firstName}`
2. Token exists in database
3. All tokens case-sensitive

### Email looks wrong when received

**Note**: Plain text formatting
- No bold/italic
- Line breaks preserved
- Readable but simple

---

## 📊 Analytics

After sending custom emails:
- ✅ Tracked in "Emails Sent" stat
- ✅ Replies tracked normally
- ✅ Opens tracked (if enabled)
- ✅ Bounces tracked
- ✅ Visible in Analytics page

---

## 🎓 Best Practices Checklist

Before sending custom emails:
- [ ] Subject line has personalization token
- [ ] Body has at least one token
- [ ] Greeting uses {{firstName}}
- [ ] Includes company/industry reference
- [ ] Has clear call-to-action
- [ ] Includes signature
- [ ] Proofread for typos
- [ ] Tested on mobile view (mentally)
- [ ] 3-5 paragraphs (not too long)
- [ ] No HTML/formatting needed

---

## 🎯 Success Metrics

Track your custom email performance:

```
Metric                    Good Target
─────────────────────────────────────
Open Rate                 20-30%
Reply Rate                5-10%
Click Rate                2-5%
Unsubscribe Rate          <0.5%
Bounce Rate               <1%
```

---

## 📞 Need Help?

**Question**: "Can I use HTML?"  
**Answer**: No, plain text only. Use line breaks for formatting.

**Question**: "What if token doesn't exist?"  
**Answer**: Shows the token literally (e.g., "Hi {{firstName}}")

**Question**: "Can I edit after sending?"  
**Answer**: No, already sent. But can send follow-up with Edit & Send.

**Question**: "How many emails can I send?"  
**Answer**: Unlimited (but respects daily limit of 50)

---

## 🚀 Ready to Send!

You're all set to use the email editor. Start with:

1. Select contacts
2. Click "Edit & Send"
3. Write your message
4. Use tokens for personalization
5. Click "Send to N"

**Happy emailing! 📧**

---

**Last Updated**: May 2, 2026  
**Status**: ✅ Feature Ready  
**Version**: 1.0

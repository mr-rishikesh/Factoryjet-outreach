# ⚡ Quick Environment Setup

## 1. Copy the template
```bash
cd backend
cp .env.example .env
```

## 2. Edit .env with your credentials
```bash
# Use your favorite editor
nano .env        # Linux/Mac
code .env        # VS Code
```

## 3. Fill in these values (Required)

### MongoDB
```env
MONGO_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/database
```

### Email Service
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password         # Use App-specific password, not your regular password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_FROM_NAME=Your Company Name
```

### Groq AI
```env
GROQ_API_KEY=gsk_your_actual_key_here    # From https://console.groq.com
```

## 4. Verify it's ignored
```bash
git status
# Should NOT show backend/.env
```

## 5. Test the connection
```bash
cd backend
npm run dev
# Should see: ✅ MongoDB connected
```

## Common Errors

### "❌ MongoDB error: connect ECONNREFUSED"
- Check MONGO_URI is correct
- Verify MongoDB is running (local) or accessible (Atlas)
- Check IP whitelist on MongoDB Atlas

### "❌ Error: Invalid login"
- Check EMAIL_USER and EMAIL_PASS are correct
- For Gmail: use App-specific password (not regular password)
- Enable Less Secure App Access or App Passwords

### "❌ Error: Invalid API Key"
- Verify GROQ_API_KEY is correct from console.groq.com
- Check the key hasn't been revoked

## Files You Modified
- `backend/.env` ← **This file should NEVER be committed**

## Files You Should See
- `backend/.env.example` ← Safe to commit (has placeholders)
- `.gitignore` ← Ignores `.env` automatically

---
**Remember**: Never commit `.env` or share it with others!

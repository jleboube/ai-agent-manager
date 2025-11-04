# Environment Variables Setup Guide

## 📁 File Structure (Simple!)

```
ai-agent-manager/
├── .env                        ← ONE file for EVERYTHING (you create this)
├── .env.example                ← Template for development
├── .env.production.example     ← Template for production
└── No .env files in subdirectories! ❌
```

## ✅ How It Works

Docker Compose reads the **single `.env` file in the root directory** and automatically passes variables to:
- Backend container
- Frontend container (build-time variables)
- PostgreSQL container

**You never need separate .env files in frontend/ or backend/ folders!**

---

## 🚀 Quick Setup for Production

### Step 1: Copy the Template

```bash
cp .env.production.example .env
```

### Step 2: Edit with Your Credentials

```bash
nano .env
# or
vim .env
# or use any text editor
```

### Step 3: That's It!

Docker Compose will read this file automatically:

```bash
docker-compose up -d --build
```

---

## 📝 What Each Section Means

### Domain Configuration
```bash
FRONTEND_URL=https://ai-agent-manager.com
VITE_API_URL=https://ai-agent-manager.com/api
```
- These are your **public URLs** (what users see)
- Use your domain with HTTPS
- **Not internal ports!**

### Port Configuration (Internal)
```bash
BACKEND_PORT=4392
FRONTEND_PORT=8039
```
- These are **internal Docker ports** on your VM
- Users never see these
- Cloudflare routes to these ports

### Database
```bash
POSTGRES_PASSWORD=your-secure-password
```
- Only needed for internal PostgreSQL
- If using external database, add `DATABASE_URL` instead

### Secrets
```bash
JWT_SECRET=random-string-32-chars-or-more
SESSION_SECRET=another-random-string-32-chars
```
- Generate random strings:
  ```bash
  openssl rand -base64 32
  ```

### API Keys
```bash
GEMINI_API_KEY=your-key
CLAUDE_API_KEY=your-key
OPENAI_API_KEY=your-key
```
- Get these from respective AI provider dashboards

### Google OAuth
```bash
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_REDIRECT_URI=https://ai-agent-manager.com/api/auth/google/callback
```
- From Google Cloud Console
- Redirect URI must match your domain

### Stripe
```bash
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_YEARLY_PRICE_ID=price_xxxxx
```
- Production keys from Stripe Dashboard
- Webhook secret from webhook endpoint configuration

### Email (SMTP)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=joeleboube@yahoo.com
```
- For sending usage alert emails
- Use Gmail App Password (not regular password)

---

## 🔍 About Port 5173

**You might see port 5173 referenced** - this is **only for local development**:

- Port 5173 = Vite dev server (when running `npm run dev` locally)
- Port 4392 = Backend API (Docker production)
- Port 8039 = Frontend (Docker production)

**In production with Docker, you don't use port 5173 at all!**

### Local Development vs Production

**Local Development (without Docker):**
```bash
# Frontend dev server
cd frontend && npm run dev
# Runs on: http://localhost:5173

# Backend dev server
cd backend && npm run dev
# Runs on: http://localhost:4392
```

**Production (with Docker):**
```bash
docker-compose up -d
# Frontend: localhost:8039 (internally)
# Backend: localhost:4392 (internally)
# Users access: https://ai-agent-manager.com
```

---

## 📋 Complete .env Template

Here's what your final `.env` file should look like:

```bash
# ============================================
# DOMAIN CONFIGURATION
# ============================================
FRONTEND_URL=https://ai-agent-manager.com
VITE_API_URL=https://ai-agent-manager.com/api

# ============================================
# PORT CONFIGURATION (Internal Docker)
# ============================================
BACKEND_PORT=4392
FRONTEND_PORT=8039

# ============================================
# DATABASE
# ============================================
POSTGRES_PASSWORD=your-secure-password

# ============================================
# SECURITY SECRETS
# ============================================
JWT_SECRET=your-jwt-secret-32-chars-minimum
SESSION_SECRET=your-session-secret-32-chars-minimum

# ============================================
# GOOGLE OAUTH
# ============================================
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_REDIRECT_URI=https://ai-agent-manager.com/api/auth/google/callback

# ============================================
# AI API KEYS
# ============================================
GEMINI_API_KEY=your-gemini-key
CLAUDE_API_KEY=your-claude-key
OPENAI_API_KEY=your-openai-key

# ============================================
# STRIPE (PRODUCTION)
# ============================================
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_YEARLY_PRICE_ID=price_xxxxx

# ============================================
# EMAIL (SMTP)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=noreply@ai-agent-manager.com
ADMIN_EMAIL=joeleboube@yahoo.com

# ============================================
# PRODUCTION SETTINGS
# ============================================
NODE_ENV=production
```

---

## ✅ Verification Checklist

After creating your `.env` file:

- [ ] File is in project root (not in frontend/ or backend/)
- [ ] All API keys are filled in (no placeholder values)
- [ ] `FRONTEND_URL` uses your domain with HTTPS
- [ ] `VITE_API_URL` uses your domain with HTTPS
- [ ] `GOOGLE_REDIRECT_URI` uses your domain
- [ ] Stripe webhook secret is from your webhook endpoint
- [ ] SMTP credentials are correct
- [ ] JWT_SECRET and SESSION_SECRET are random strings
- [ ] POSTGRES_PASSWORD is secure

---

## 🚨 Common Mistakes

### ❌ Wrong: Creating .env in subfolders
```
backend/.env  ← Don't create this!
frontend/.env ← Don't create this!
```

### ✅ Right: Single .env in root
```
.env  ← Only this one!
```

### ❌ Wrong: Using localhost in URLs
```bash
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:4392/api
```

### ✅ Right: Using your domain
```bash
FRONTEND_URL=https://ai-agent-manager.com
VITE_API_URL=https://ai-agent-manager.com/api
```

### ❌ Wrong: Mixing up ports
```bash
BACKEND_PORT=3001  # Old port!
```

### ✅ Right: Using new port
```bash
BACKEND_PORT=4392  # New port!
```

---

## 🧪 Testing Your Configuration

After creating `.env`:

```bash
# 1. Verify file exists
ls -la .env

# 2. Check it's not empty
cat .env | grep -v "^#" | grep -v "^$" | wc -l
# Should show ~20+ lines

# 3. Deploy
docker-compose up -d --build

# 4. Check logs for errors
docker-compose logs -f backend | grep -i error

# 5. Test health endpoint
curl http://localhost:4392/health
curl https://ai-agent-manager.com/api/health
```

---

## 📞 Need Help?

If you see errors about missing environment variables:
1. Check your `.env` file is in the project root
2. Make sure there are no typos in variable names
3. Restart Docker Compose: `docker-compose down && docker-compose up -d`

Contact: joeleboube@yahoo.com

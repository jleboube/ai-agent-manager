# Quick Start Guide

## Before You Begin

Check for port conflicts:
```bash
./check-ports.sh
```

---

## Deployment Option 1: Isolated PostgreSQL (Recommended)

**Best for:** Zero port conflicts, complete isolation

### Steps:

1. **Configure environment:**
```bash
cp .env.example .env
nano .env  # Add your API keys and credentials
```

2. **Deploy:**
```bash
docker-compose up -d
```

3. **Verify:**
```bash
docker-compose ps
curl http://localhost:3001/health
```

4. **Access:**
- Frontend: http://localhost:8039
- Backend API: http://localhost:3001

### What this does:
- ✅ PostgreSQL runs INSIDE Docker network (no host port exposure)
- ✅ Zero conflicts with other PostgreSQL instances
- ✅ Isolated database for this app only
- ✅ Simple and clean

---

## Deployment Option 2: Shared PostgreSQL

**Best for:** Using existing PostgreSQL on your host

### Steps:

1. **Create database on your PostgreSQL:**
```bash
psql -U postgres
CREATE DATABASE ai_agent_manager;
CREATE USER ai_agent_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE ai_agent_manager TO ai_agent_user;
\q
```

2. **Configure environment:**
```bash
cp .env.example .env
nano .env
```

Add this line to `.env`:
```bash
DATABASE_URL=postgresql://ai_agent_user:secure_password@host.docker.internal:5432/ai_agent_manager
```

3. **Deploy:**
```bash
docker-compose -f docker-compose.external-db.yml up -d
```

4. **Verify:**
```bash
docker-compose -f docker-compose.external-db.yml ps
curl http://localhost:3001/health
```

### What this does:
- ✅ Connects to existing PostgreSQL on host
- ✅ No additional PostgreSQL instance needed
- ✅ Shared database management
- ⚠️  Must ensure PostgreSQL allows Docker connections

---

## Change Default Ports

If ports 3001 or 8039 are in use, add to `.env`:

```bash
BACKEND_PORT=3002   # Change backend port
FRONTEND_PORT=8040  # Change frontend port
```

Then update:
```bash
VITE_API_URL=http://localhost:3002/api
GOOGLE_REDIRECT_URI=http://yourdomain.com:3002/api/auth/google/callback
```

---

## Required Environment Variables

Minimal `.env` configuration:

```bash
# Database
POSTGRES_PASSWORD=secure_password_here

# Secrets (generate random strings)
JWT_SECRET=random_string_32_chars_or_more
SESSION_SECRET=another_random_string_32_chars

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://yourdomain.com:3001/api/auth/google/callback

# AI Keys
GEMINI_API_KEY=your_gemini_key
CLAUDE_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key

# Stripe (Production)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_YEARLY_PRICE_ID=price_xxxxx

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
ADMIN_EMAIL=joeleboube@yahoo.com
```

---

## Common Commands

### Start
```bash
docker-compose up -d
```

### Stop
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Rebuild
```bash
docker-compose up -d --build
```

### Remove Everything (including database)
```bash
docker-compose down -v
```

---

## Troubleshooting

### Port Already in Use
```
Error: bind: address already in use
```
→ Change `BACKEND_PORT` or `FRONTEND_PORT` in `.env`

### Database Connection Failed
```
Error: Can't reach database server
```
→ Check `DATABASE_URL` is correct
→ Ensure PostgreSQL accepts Docker connections

### Frontend 404 Error
```
Cannot GET /api/...
```
→ Check `VITE_API_URL` matches your backend port
→ Rebuild frontend: `docker-compose up -d --build frontend`

### OAuth Callback Error
```
Redirect URI mismatch
```
→ Update `GOOGLE_REDIRECT_URI` in `.env`
→ Update redirect URIs in Google Cloud Console

---

## Next Steps

1. ✅ Deploy the application
2. ✅ Test Google OAuth login
3. ✅ Create test agent (uses free generation)
4. ✅ Test Stripe payment flow
5. ✅ Verify email notifications work
6. ✅ Set up SSL/HTTPS for production
7. ✅ Configure domain name
8. ✅ Set up automated backups

---

## Need More Details?

- Full documentation: [README.md](README.md)
- Multi-app hosting: [DEPLOYMENT.md](DEPLOYMENT.md)
- Support: joeleboube@yahoo.com

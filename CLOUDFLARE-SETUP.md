# Domain Configuration for ai-agent-manager.com

Quick reference for configuring **ai-agent-manager.com** with your existing Cloudflare tunnel setup.

---

## What You Need to Add to Your Existing Cloudflare Configuration

### Routes to Add

Add these two routes to your existing Cloudflare tunnel configuration (order matters):

**Route 1: Backend API** (must be first)
- Domain: `ai-agent-manager.com`
- Path: `/api/*`
- Service: `http://localhost:4392`

**Route 2: Frontend** (must be second)
- Domain: `ai-agent-manager.com`
- Path: (empty / all paths)
- Service: `http://localhost:8039`

**⚠️ Important:** The API route must come BEFORE the frontend route, or all requests will go to the frontend!

---

## Application Configuration

### .env Settings

```bash
# Domain URLs (HTTPS automatic with Cloudflare)
FRONTEND_URL=https://ai-agent-manager.com
VITE_API_URL=https://ai-agent-manager.com/api

# Internal Docker ports (what Cloudflare routes to)
BACKEND_PORT=4392
FRONTEND_PORT=8039

# OAuth callback - use your domain
GOOGLE_REDIRECT_URI=https://ai-agent-manager.com/api/auth/google/callback
```

### Routing Flow

```
User Request → Cloudflare CDN → Your Existing Tunnel → VM

Routes:
  https://ai-agent-manager.com/api/*  → localhost:4392 (Backend API)
  https://ai-agent-manager.com/*      → localhost:8039 (Frontend)
```

---

## External Service Configuration

### Google OAuth

Add to **Authorized Redirect URIs** in Google Cloud Console:
```
https://ai-agent-manager.com/api/auth/google/callback
```

Add to **Authorized JavaScript Origins**:
```
https://ai-agent-manager.com
```

### Stripe Webhook

Configure webhook endpoint in Stripe Dashboard:
```
https://ai-agent-manager.com/api/subscription/webhook
```

Select events:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

Copy the webhook signing secret to `.env`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

---

## Deployment

```bash
# 1. Configure environment
cp .env.production.example .env
nano .env  # Add your credentials

# 2. Deploy
docker-compose up -d --build

# 3. Verify services are running
docker-compose ps
curl http://localhost:4392/health
curl http://localhost:8039
```

---

## Testing

After deployment and Cloudflare route configuration:

```bash
# Test backend API through Cloudflare
curl https://ai-agent-manager.com/api/health

# Should return: {"status":"ok","timestamp":"..."}

# Test frontend through Cloudflare
curl https://ai-agent-manager.com

# Should return HTML content
```

Open browser: `https://ai-agent-manager.com`

---

## Troubleshooting

### API calls return 404

**Cause:** API route not configured or frontend route is catching all requests

**Solution:** Ensure `/api/*` route comes BEFORE the root `/` route in your Cloudflare config

### CORS errors

**Cause:** `FRONTEND_URL` doesn't match your domain

**Solution:**
```bash
# In .env:
FRONTEND_URL=https://ai-agent-manager.com
```
Then restart: `docker-compose restart backend`

### OAuth redirect mismatch

**Cause:** Google OAuth not configured with correct callback URL

**Solution:** Add to Google Cloud Console:
```
https://ai-agent-manager.com/api/auth/google/callback
```

### Stripe webhook fails

**Cause:** Wrong webhook secret or endpoint URL

**Solution:**
1. Verify endpoint in Stripe: `https://ai-agent-manager.com/api/subscription/webhook`
2. Copy signing secret to `.env`
3. Restart: `docker-compose restart backend`

---

## Port Summary

**External (via Cloudflare):**
- Frontend: `https://ai-agent-manager.com`
- Backend API: `https://ai-agent-manager.com/api`

**Internal (on your VM):**
- Frontend container: `localhost:8039`
- Backend container: `localhost:4392`
- PostgreSQL (internal Docker network only - no port exposure)

---

## Alternative: Subdomain Configuration

If you prefer separate subdomains instead of path-based routing:

### Routes
- `https://api.ai-agent-manager.com` → `localhost:4392`
- `https://ai-agent-manager.com` → `localhost:8039`

### .env Changes
```bash
FRONTEND_URL=https://ai-agent-manager.com
VITE_API_URL=https://api.ai-agent-manager.com/api
GOOGLE_REDIRECT_URI=https://api.ai-agent-manager.com/api/auth/google/callback
```

Remember to rebuild after changing `VITE_API_URL`:
```bash
docker-compose up -d --build frontend
```

---

## Summary Checklist

- [ ] Add two routes to your existing Cloudflare tunnel configuration
- [ ] `.env` configured with `https://ai-agent-manager.com`
- [ ] Deploy with Docker Compose
- [ ] Update Google OAuth redirect URIs
- [ ] Configure Stripe webhook endpoint
- [ ] Test `https://ai-agent-manager.com/api/health`
- [ ] Test `https://ai-agent-manager.com` in browser

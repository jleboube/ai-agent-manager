# Port Configuration Change Summary

## 🔄 What Changed

The backend API port has been changed from **3001** to **4392** to avoid conflicts with your existing Docker containers.

---

## ✅ Updated Files

All configuration files have been updated with the new port:

1. ✅ `docker-compose.yml` - Backend port changed to 4392
2. ✅ `docker-compose.external-db.yml` - Backend port changed to 4392
3. ✅ `.env.example` - Default port updated
4. ✅ `.env.production.example` - Production port updated
5. ✅ `CLOUDFLARE-SETUP.md` - All examples updated
6. ✅ `QUICK-START.md` - All examples updated
7. ✅ `check-ports.sh` - Port checking script updated

---

## 🔧 What You Need to Update

### 1. Your Cloudflare Tunnel Configuration

**Change your backend route from:**
```
ai-agent-manager.com/api/*  → http://localhost:3001
```

**To:**
```
ai-agent-manager.com/api/*  → http://localhost:4392
```

### 2. Your .env File

Make sure your `.env` file has:
```bash
BACKEND_PORT=4392
VITE_API_URL=https://ai-agent-manager.com/api
GOOGLE_REDIRECT_URI=https://ai-agent-manager.com/api/auth/google/callback
```

**Note:** The `VITE_API_URL` and `GOOGLE_REDIRECT_URI` remain the same because they use your domain, not the internal port!

---

## 📋 Port Summary

### External (via Cloudflare)
- ✅ Frontend: `https://ai-agent-manager.com` (no change)
- ✅ Backend API: `https://ai-agent-manager.com/api` (no change)

### Internal (on your VM)
- ✅ Frontend container: `localhost:8039` (no change)
- ✅ Backend container: `localhost:4392` (CHANGED from 3001)
- ✅ PostgreSQL: Internal Docker network only (no change)

---

## 🚀 Deployment Steps

1. **Update Cloudflare tunnel route:**
   - Change backend service URL from `localhost:3001` to `localhost:4392`

2. **Copy production environment:**
   ```bash
   cp .env.production.example .env
   # Edit .env with your credentials
   ```

3. **Deploy:**
   ```bash
   docker-compose up -d --build
   ```

4. **Verify:**
   ```bash
   # Check containers are running
   docker-compose ps

   # Test backend locally (should return health status)
   curl http://localhost:4392/health

   # Test backend through Cloudflare (should return health status)
   curl https://ai-agent-manager.com/api/health
   ```

---

## ✨ Benefits of Port 4392

- ✅ **No conflicts** with port 3001
- ✅ **Obscure port** - not a common default
- ✅ **Random selection** - harder to guess
- ✅ **Still works** with all existing code

---

## 🔍 Verify Port Change

After deployment, verify the backend is listening on the correct port:

```bash
# Check Docker port mapping
docker ps | grep backend

# Should show: 0.0.0.0:4392->4392/tcp

# Test local access
curl http://localhost:4392/health

# Should return: {"status":"ok","timestamp":"..."}
```

---

## ⚠️ Important Notes

1. **Cloudflare routing still works the same way** - users access via `https://ai-agent-manager.com/api`
2. **Only the internal VM port changed** - from 3001 to 4392
3. **No changes needed to Google OAuth or Stripe** - they still use your domain URLs
4. **Frontend unchanged** - still uses port 8039

---

## 🆘 Troubleshooting

### Port 4392 still in use?

If 4392 is also in use, change it in `.env`:
```bash
BACKEND_PORT=4393  # Or any other available port
```

Then rebuild:
```bash
docker-compose up -d --build
```

### API not accessible

1. Check Cloudflare route points to correct port
2. Verify backend is running: `docker-compose ps`
3. Check backend logs: `docker-compose logs backend`

### Google OAuth fails

OAuth should work fine - it uses your domain URL, not the port. If it fails:
1. Verify `GOOGLE_REDIRECT_URI` in `.env` uses your domain
2. Check Google Cloud Console has correct redirect URI

---

## ✅ Ready to Deploy!

Everything is configured for port 4392. Just:
1. Update your Cloudflare tunnel route
2. Copy and configure `.env`
3. Run `docker-compose up -d --build`
4. Test with `curl https://ai-agent-manager.com/api/health`

You're all set! 🎉

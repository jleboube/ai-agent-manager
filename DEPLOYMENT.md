# Deployment Guide - Multi-App Host

This guide covers deploying AI Agent Manager on a host that already runs other applications with PostgreSQL.

## Deployment Options

### Option 1: Internal PostgreSQL (Recommended)

**Best for:** Isolation, no port conflicts, independent scaling

This option runs a dedicated PostgreSQL instance for this app that's **only accessible within the Docker network**. No port conflicts with other apps.

#### Setup

1. Use the default `docker-compose.yml`:
```bash
docker-compose up -d
```

2. Configure `.env`:
```bash
POSTGRES_PASSWORD=your-secure-password
BACKEND_PORT=3001  # Change if port 3001 is in use
FRONTEND_PORT=8039 # Change if port 8039 is in use
```

#### How it works:
- PostgreSQL runs in container `ai-agent-manager-db`
- **No port exposed to host** - only accessible via Docker network `ai-agent-network`
- Backend connects using hostname `postgres` on internal network
- Zero conflict with other PostgreSQL containers
- Isolated data volume: `ai-agent-manager_postgres_data`

#### Advantages:
✅ No port conflicts with other apps
✅ Complete isolation
✅ Independent backups and maintenance
✅ Can upgrade PostgreSQL independently
✅ Simple to manage

#### Disadvantages:
❌ Additional PostgreSQL instance (uses ~50-100MB RAM)
❌ Separate backup procedures needed

---

### Option 2: Shared/External PostgreSQL

**Best for:** Using existing PostgreSQL, centralized database management

Connect to an existing PostgreSQL server on your host or another container.

#### Setup

1. Use the alternative compose file:
```bash
docker-compose -f docker-compose.external-db.yml up -d
```

2. Configure `.env`:
```bash
# Connect to PostgreSQL on host
DATABASE_URL=postgresql://myuser:mypass@host.docker.internal:5432/ai_agent_manager

# Or connect to another Docker container
DATABASE_URL=postgresql://myuser:mypass@other-postgres-container:5432/ai_agent_manager

BACKEND_PORT=3001
FRONTEND_PORT=8039
```

3. Create the database on your PostgreSQL server:
```bash
# SSH into your host or access your PostgreSQL container
psql -U postgres

CREATE DATABASE ai_agent_manager;
CREATE USER ai_agent_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE ai_agent_manager TO ai_agent_user;
\q
```

4. Update DATABASE_URL with your actual credentials:
```bash
DATABASE_URL=postgresql://ai_agent_user:secure_password@host.docker.internal:5432/ai_agent_manager
```

#### Connecting to PostgreSQL on Host:

If PostgreSQL is running directly on your host (not in Docker):
```bash
# In .env:
DATABASE_URL=postgresql://username:password@host.docker.internal:5432/ai_agent_manager
```

#### Connecting to PostgreSQL in Another Container:

If using a shared PostgreSQL container, connect via Docker network:

**Method A: Join existing network**
```yaml
# In docker-compose.external-db.yml, add to backend service:
networks:
  - your-existing-network

# At bottom of file:
networks:
  your-existing-network:
    external: true
```

Then use container name in DATABASE_URL:
```bash
DATABASE_URL=postgresql://username:password@your-postgres-container-name:5432/ai_agent_manager
```

**Method B: Expose PostgreSQL port on different host port**

If your other PostgreSQL container uses port 5432, expose it on a different port:
```yaml
# In your other app's docker-compose.yml:
postgres:
  ports:
    - "5433:5432"  # Expose on host port 5433 instead
```

Then connect from this app:
```bash
DATABASE_URL=postgresql://username:password@host.docker.internal:5433/ai_agent_manager
```

#### Advantages:
✅ Single PostgreSQL instance for all apps
✅ Centralized backups
✅ Shared connection pooling
✅ Lower resource usage

#### Disadvantages:
❌ Shared resources - one app can affect others
❌ Must coordinate PostgreSQL upgrades
❌ Need to manage database access permissions

---

## Custom Port Configuration

If default ports (3001, 8039) conflict with other apps:

### Change Backend Port
```bash
# In .env:
BACKEND_PORT=3002  # Or any available port
```

Update API URL:
```bash
VITE_API_URL=http://localhost:3002/api
GOOGLE_REDIRECT_URI=http://yourdomain.com:3002/api/auth/google/callback
```

### Change Frontend Port
```bash
# In .env:
FRONTEND_PORT=8040  # Or any available port
```

Access app at: `http://localhost:8040`

### Using Nginx Reverse Proxy (Recommended for Production)

Instead of exposing ports, use Nginx reverse proxy:

```nginx
# /etc/nginx/sites-available/ai-agent-manager

server {
    listen 80;
    server_name ai-agent.yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:8039;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then you don't need to expose ports to the internet - only to localhost.

---

## Quick Start Commands

### Option 1: Internal PostgreSQL (Isolated)
```bash
# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 2: External PostgreSQL (Shared)
```bash
# Copy environment file
cp .env.example .env

# Configure DATABASE_URL in .env
nano .env

# Create database on your PostgreSQL server
# (see steps above)

# Start services
docker-compose -f docker-compose.external-db.yml up -d

# View logs
docker-compose -f docker-compose.external-db.yml logs -f

# Stop services
docker-compose -f docker-compose.external-db.yml down
```

---

## Checking for Port Conflicts

Before deployment, check which ports are in use:

```bash
# Check if port 3001 is in use
sudo lsof -i :3001
# Or
sudo netstat -tlnp | grep 3001

# Check if port 8039 is in use
sudo lsof -i :8039
# Or
sudo netstat -tlnp | grep 8039

# Check if port 5432 is in use
sudo lsof -i :5432
# Or
sudo netstat -tlnp | grep 5432

# List all Docker containers and their ports
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

---

## Database Backups

### Option 1: Internal PostgreSQL
```bash
# Backup
docker exec ai-agent-manager-db pg_dump -U postgres ai_agent_manager > backup.sql

# Restore
docker exec -i ai-agent-manager-db psql -U postgres ai_agent_manager < backup.sql
```

### Option 2: External PostgreSQL
Use your existing backup procedures for the shared PostgreSQL instance.

---

## Monitoring

```bash
# View all containers
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres  # Only for Option 1

# Check backend health
curl http://localhost:3001/health

# Access PostgreSQL (Option 1 only)
docker exec -it ai-agent-manager-db psql -U postgres -d ai_agent_manager
```

---

## Troubleshooting

### Port Already in Use
```
Error: bind: address already in use
```

**Solution:** Change ports in `.env`:
```bash
BACKEND_PORT=3002  # Instead of 3001
FRONTEND_PORT=8040 # Instead of 8039
```

### Can't Connect to PostgreSQL on Host
```
Error: connect ECONNREFUSED
```

**Solutions:**
1. Ensure PostgreSQL accepts connections from Docker:
```bash
# Edit postgresql.conf
listen_addresses = '*'

# Edit pg_hba.conf - add this line:
host    all    all    172.16.0.0/12    md5
```

2. Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

3. Check firewall isn't blocking:
```bash
sudo ufw allow 5432
```

### Database Migration Fails
```
Error: Can't reach database server
```

**Solution:** Ensure database is ready before migration:
```bash
# Check PostgreSQL health
docker-compose exec postgres pg_isready

# Manually run migrations
docker-compose exec backend npm run prisma:migrate
```

---

## Production Checklist

- [ ] Use Option 1 (Internal PostgreSQL) for isolation
- [ ] Set strong `POSTGRES_PASSWORD`
- [ ] Generate secure random strings for `JWT_SECRET` and `SESSION_SECRET`
- [ ] Configure all API keys (Gemini, Claude, OpenAI)
- [ ] Set up Google OAuth with correct redirect URIs
- [ ] Configure Stripe with production keys
- [ ] Set up SMTP for email notifications
- [ ] Use Nginx reverse proxy with SSL
- [ ] Set up automated backups
- [ ] Configure log rotation
- [ ] Set resource limits in docker-compose.yml
- [ ] Monitor with health checks
- [ ] Test database connection
- [ ] Test authentication flow
- [ ] Test payment flow

---

## Best Practices

1. **Use Option 1** unless you have specific reasons for shared PostgreSQL
2. **Dedicated networks** - Keep each app in its own Docker network
3. **Resource limits** - Set memory/CPU limits in production
4. **Regular backups** - Automate database backups
5. **Monitoring** - Set up health checks and alerts
6. **SSL/TLS** - Always use HTTPS in production
7. **Update regularly** - Keep Docker images updated

---

## Need Help?

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review [README.md](README.md) for full documentation
- Contact: joeleboube@yahoo.com

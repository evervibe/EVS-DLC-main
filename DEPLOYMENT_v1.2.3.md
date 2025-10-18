# Deployment Guide for v1.2.3-alpha

**Version:** 1.2.3-alpha  
**Release Date:** 2025-10-18  
**Major Features:** Ops Database, Strings Editor & Workflow System

---

## Prerequisites

- Node.js 20+
- MySQL 8.0
- Redis 7 (optional, for caching)
- npm or pnpm package manager

---

## Step 1: Database Setup

### 1.1 Create Databases

Connect to MySQL and create the required databases:

```sql
CREATE DATABASE IF NOT EXISTS `db_auth` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS `db_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS `db_data` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS `db_post` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS `db_ops` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
```

### 1.2 Run Ops Migrations

Execute the ops database schema:

```bash
cd tools/apps/dlc-dev-api
mysql -u root -p < migrations/ops/001_create_ops_database.sql
```

This creates the following tables in `db_ops`:
- `l10n_string_audit` - Audit trail for string edits
- `l10n_string_state` - Workflow state tracking
- `ops_job` - Background job queue
- `ops_lock` - Resource locking

---

## Step 2: Environment Configuration

### 2.1 Root Environment

Copy and configure the root `.env.example`:

```bash
cp .env.example .env
```

Key variables to set:
```dotenv
NODE_ENV=production
APP_VERSION=1.2.3-alpha
LOG_LEVEL=info

# API Configuration
API_PORT=30089
CORS_ORIGIN=https://your-domain.com

# Database Connections (ALL 5 REQUIRED)
DB_AUTH_HOST=your-mysql-host
DB_AUTH_PORT=3306
DB_AUTH_USER=dlc_user
DB_AUTH_PASS=secure_password
DB_AUTH_NAME=db_auth

DB_GAME_HOST=your-mysql-host
DB_GAME_PORT=3306
DB_GAME_USER=dlc_user
DB_GAME_PASS=secure_password
DB_GAME_NAME=db_db

DB_DATA_HOST=your-mysql-host
DB_DATA_PORT=3306
DB_DATA_USER=dlc_user
DB_DATA_PASS=secure_password
DB_DATA_NAME=db_data

DB_POST_HOST=your-mysql-host
DB_POST_PORT=3306
DB_POST_USER=dlc_user
DB_POST_PASS=secure_password
DB_POST_NAME=db_post

DB_OPS_HOST=your-mysql-host
DB_OPS_PORT=3306
DB_OPS_USER=dlc_user
DB_OPS_PASS=secure_password
DB_OPS_NAME=db_ops

# Security (MUST CHANGE FOR PRODUCTION)
JWT_SECRET=YOUR_STRONG_SECRET_HERE_MIN_32_CHARS
JWT_EXPIRES_IN=86400
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YOUR_SECURE_PASSWORD

# Optional: Redis Cache
USE_CACHE=true
REDIS_URL=redis://your-redis-host:6379
CACHE_TTL=120
CACHE_PREFIX=dlc

# Features
SWAGGER_ENABLED=false
PRELOAD_ON_START=false
```

### 2.2 API Environment

```bash
cd tools/apps/dlc-dev-api
cp .env.example .env
```

Use the same configuration as root `.env`.

### 2.3 Web Environment

```bash
cd tools/apps/dlc-dev-web
cp .env.local.example .env.local
```

Configure:
```dotenv
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_VERSION=1.2.3-alpha
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_FEATURE_STRINGS_EDIT=true
```

---

## Step 3: Install Dependencies

### 3.1 API

```bash
cd tools/apps/dlc-dev-api
npm install --production

# Verify TypeScript compilation
npm run type-check
npm run build
```

### 3.2 Web

```bash
cd tools/apps/dlc-dev-web
npm install --production

# Build Next.js
npm run build
```

---

## Step 4: Start Services

### 4.1 API (Port 30089)

**Development:**
```bash
cd tools/apps/dlc-dev-api
npm run dev
```

**Production:**
```bash
cd tools/apps/dlc-dev-api
npm run build
npm run start:prod
```

Or use PM2:
```bash
pm2 start dist/main.js --name dlc-api --node-args="--max-old-space-size=4096"
```

### 4.2 Web (Port 33440)

**Development:**
```bash
cd tools/apps/dlc-dev-web
npm run dev
```

**Production:**
```bash
cd tools/apps/dlc-dev-web
npm run build
npm run start
```

Or use PM2:
```bash
pm2 start npm --name dlc-web -- run start
```

---

## Step 5: Verify Deployment

### 5.1 Health Check

```bash
curl http://localhost:30089/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-18T...",
  "version": "1.2.3-alpha",
  "rateLimit": "active",
  "databases": {
    "auth": true,
    "game": true,
    "data": true,
    "post": true,
    "ops": true
  },
  "cache": {
    "connected": true,
    "keys": 0
  },
  "auth": {
    "jwtConfigured": true
  }
}
```

**All 5 databases must show `true`!**

### 5.2 Test String Editor

1. Open `http://localhost:33440/tools/strings`
2. Should see strings list with edit buttons (✏️) and history buttons (📜)
3. Try editing a string (requires translator role via JWT)
4. Check history drawer for audit trail

### 5.3 Test API Endpoints

**Read strings:**
```bash
curl http://localhost:30089/data/strings?lang=ger&limit=10
```

**Edit string (requires JWT token):**
```bash
curl -X PATCH http://localhost:30089/data/strings/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lang": "ger",
    "value": "Updated text",
    "reason": "Test edit"
  }'
```

**Get history:**
```bash
curl http://localhost:30089/data/strings/1/history?lang=ger
```

---

## Step 6: User Roles Setup

### 6.1 Role Hierarchy

```
USER (basic access)
  └─ TRANSLATOR (can edit strings)
      └─ REVIEWER (can change workflow state)
          └─ ADMIN (full access)
              └─ DEVOPS (system access)
```

### 6.2 Creating Users with Roles

Users are created via the auth system. When generating JWT tokens, include the appropriate role:

```javascript
// Example JWT payload for translator
{
  userId: 123,
  username: "translator1",
  roles: ["user", "translator"]
}

// Example JWT payload for reviewer
{
  userId: 456,
  username: "reviewer1",
  roles: ["user", "translator", "reviewer"]
}
```

---

## Step 7: Database Verification

### 7.1 Check Ops Tables

Verify tables exist:
```sql
USE db_ops;
SHOW TABLES;
```

Expected output:
```
l10n_string_audit
l10n_string_state
ops_job
ops_lock
```

### 7.2 Verify Audit Trail

After editing a string, check audit records:
```sql
USE db_ops;
SELECT * FROM l10n_string_audit ORDER BY created_at DESC LIMIT 5;
```

Should show records with:
- `stage = 'committed'` (successful edits)
- `tx_id` (ULID format, 26 chars)
- `actor` (username)
- `old_value` and `new_value`

---

## Step 8: Production Hardening

### 8.1 Security Checklist

- [ ] Change all default passwords
- [ ] Generate strong JWT_SECRET (min 32 characters)
- [ ] Set SWAGGER_ENABLED=false
- [ ] Configure proper CORS_ORIGIN
- [ ] Use HTTPS in production
- [ ] Set NODE_ENV=production
- [ ] Enable rate limiting (already active)
- [ ] Review firewall rules for database access

### 8.2 Performance Tuning

**MySQL:**
```sql
-- Recommended settings for db_ops
SET GLOBAL innodb_buffer_pool_size = 2G;
SET GLOBAL max_connections = 200;
```

**Redis:**
```conf
maxmemory 2gb
maxmemory-policy allkeys-lru
```

**Node.js:**
```bash
# Increase heap size for API
node --max-old-space-size=4096 dist/main.js
```

### 8.3 Backup Strategy

**Daily Backups:**
```bash
#!/bin/bash
# backup-databases.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/backups/mysql

mysqldump -u root -p --databases db_auth db_db db_data db_post db_ops \
  > $BACKUP_DIR/evs_dlc_backup_$DATE.sql

# Compress
gzip $BACKUP_DIR/evs_dlc_backup_$DATE.sql

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

Schedule with cron:
```cron
0 2 * * * /opt/scripts/backup-databases.sh
```

---

## Step 9: Monitoring

### 9.1 Health Checks

Set up monitoring to check:
- `GET /health` every 60 seconds
- Alert if `status !== 'ok'`
- Alert if any database shows `false`

### 9.2 Logs

API logs location:
```bash
# PM2 logs
pm2 logs dlc-api

# Or direct output
tail -f /var/log/dlc-api/api.log
```

Web logs:
```bash
pm2 logs dlc-web
```

### 9.3 Metrics

Monitor these via `/health/metrics`:
- Database pool stats (active/idle connections)
- Memory usage
- Uptime
- Cache hit rate

---

## Step 10: Rollback Plan

If v1.2.3 has issues, rollback to v1.2.2:

### 10.1 Code Rollback

```bash
git checkout v1.2.2-alpha
cd tools/apps/dlc-dev-api && npm install && npm run build
cd ../dlc-dev-web && npm install && npm run build
pm2 restart all
```

### 10.2 Database Rollback

If ops database needs to be removed:
```sql
DROP DATABASE IF EXISTS db_ops;
```

Then update `.env` to remove DB_OPS_* variables and restart.

**Note:** You'll lose audit trail data if you drop db_ops.

---

## Troubleshooting

### Issue: "ops database connection failed"

**Cause:** db_ops doesn't exist or credentials are wrong.

**Fix:**
1. Create database: `CREATE DATABASE db_ops;`
2. Run migration: `mysql -u root -p db_ops < migrations/ops/001_create_ops_database.sql`
3. Verify credentials in .env

### Issue: "Version conflict" when editing strings

**Cause:** Someone else edited the string between your fetch and save.

**Fix:** This is expected behavior (optimistic locking). Refresh the page and try again with the latest version.

### Issue: "Translator role required" error

**Cause:** JWT token doesn't include translator role.

**Fix:** Ensure JWT payload includes roles array with "translator".

### Issue: Audit records stuck in "prepare" stage

**Cause:** Transaction failed but audit wasn't updated.

**Fix:** Reconcile worker (planned for v1.2.5) will handle this. For now:
```sql
UPDATE l10n_string_audit 
SET stage = 'failed' 
WHERE stage = 'prepare' 
  AND created_at < DATE_SUB(NOW(), INTERVAL 1 HOUR);
```

---

## Support

- **Documentation:** See `AGENT_LOG_v1.2.3.md` for technical details
- **Changelog:** See `CHANGELOG.md` for complete changes
- **Migration Guide:** See `migrations/ops/README.md` for database setup

---

**Deployed by:** EverVibe Studios  
**Version:** v1.2.3-alpha  
**Date:** 2025-10-18

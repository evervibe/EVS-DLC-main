# 🚀 Deployment Guide - DLC Dev Stack v1.2.0-alpha

## Overview

This guide covers deployment of the DLC Development Stack in various environments, from local development to production Docker deployments.

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                     Production Stack                     │
├──────────────────┬──────────────────┬───────────────────┤
│   DLC Web        │   DLC API        │   Infrastructure  │
│   Port: 33440    │   Port: 30089    │   MySQL: 3306     │
│   Next.js 15     │   NestJS 10      │   Redis: 6379     │
│   React 19       │   Fastify 4      │   Adminer: 8080   │
└──────────────────┴──────────────────┴───────────────────┘
```

## Prerequisites

### Development
- Node.js 20+ (LTS recommended)
- pnpm 9.12.3
- Docker & Docker Compose (for database services)
- Git

### Production
- Docker 20.10+
- Docker Compose 2.0+
- 2GB+ RAM recommended
- 10GB+ disk space

## Quick Start (Development)

### 1. Clone Repository

```bash
git clone <repository-url>
cd EVS-DLC-main
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit with your configuration
nano .env  # or your preferred editor
```

**Critical environment variables:**
```bash
# API Configuration
API_PORT=30089

# Database
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=secret  # CHANGE IN PRODUCTION!

# Security (MUST CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-here-change-this
JWT_EXPIRES_IN=86400  # 24 hours in seconds
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password

# Frontend
WEB_PORT=33440
NEXT_PUBLIC_API_URL=http://localhost:30089
CORS_ORIGIN=http://localhost:33440
```

### 3. Start Infrastructure

```bash
cd infra
docker-compose up -d mysql redis
```

Wait for databases to be ready (check with `docker-compose ps`).

### 4. Start Backend API

```bash
cd tools/apps/dlc-dev-api
pnpm install
pnpm build
pnpm dev
```

API will be available at: http://localhost:30089

### 5. Start Frontend

```bash
cd tools/apps/dlc-dev-web
pnpm install
pnpm build
pnpm dev
```

Web will be available at: http://localhost:33440

## Docker Deployment (Recommended for Production)

### Full Stack with Docker Compose

#### 1. Prepare Environment

Create `.env` file in the `infra/` directory:

```bash
cd infra
cp ../.env.example .env
```

Edit `.env` with production values:

```bash
# IMPORTANT: Change these for production!
MYSQL_ROOT_PASSWORD=<strong-password>
DB_USER=root
DB_PASSWORD=<strong-password>
JWT_SECRET=<generate-random-secret>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<strong-password>

# Ports (can be customized)
API_PORT=30089
WEB_PORT=33440
MYSQL_PORT=3306
REDIS_PORT=6379
ADMINER_PORT=8080

# API Configuration
CORS_ORIGIN=http://your-domain.com:33440
NEXT_PUBLIC_API_URL=http://your-domain.com:30089
```

#### 2. Build and Start Services

```bash
cd infra
docker-compose up -d
```

This will:
- Build API and Web Docker images
- Start MySQL database
- Start Redis cache
- Start API backend
- Start Web frontend
- Start Adminer (DB management UI)

#### 3. Verify Deployment

```bash
# Check all services are running
docker-compose ps

# Check API health
curl http://localhost:30089/health

# Check Web is accessible
curl http://localhost:33440
```

#### 4. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web
```

### Individual Docker Builds

#### Build API Image

```bash
cd /path/to/EVS-DLC-main
docker build -t dlc-dev-api:1.2.0-alpha -f tools/apps/dlc-dev-api/Dockerfile .
```

#### Build Web Image

```bash
cd /path/to/EVS-DLC-main
docker build -t dlc-dev-web:1.2.0-alpha -f tools/apps/dlc-dev-web/Dockerfile .
```

#### Run API Container

```bash
docker run -d \
  --name dlc-api \
  -p 30089:30089 \
  -e NODE_ENV=production \
  -e API_PORT=30089 \
  -e DB_AUTH_HOST=mysql \
  -e DB_AUTH_PORT=3306 \
  -e DB_AUTH_USER=root \
  -e DB_AUTH_PASS=secret \
  -e DB_AUTH_NAME=db_auth \
  -e JWT_SECRET=your-jwt-secret \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=admin \
  -e CORS_ORIGIN=http://localhost:33440 \
  --network dlc-network \
  dlc-dev-api:1.2.0-alpha
```

#### Run Web Container

```bash
docker run -d \
  --name dlc-web \
  -p 33440:33440 \
  -e NEXT_PUBLIC_API_URL=http://localhost:30089 \
  -e NEXT_PUBLIC_APP_ENV=production \
  --network dlc-network \
  dlc-dev-web:1.2.0-alpha
```

## Production Checklist

### Security

- [ ] Change all default passwords
- [ ] Generate strong JWT_SECRET (32+ characters, random)
- [ ] Enable HTTPS/TLS (use reverse proxy like Nginx)
- [ ] Configure firewall rules
- [ ] Disable Swagger in production (SWAGGER_ENABLED=false)
- [ ] Set strong database passwords
- [ ] Review CORS_ORIGIN settings
- [ ] Enable rate limiting (already active)
- [ ] Enable Helmet security headers (already active)

### Performance

- [ ] Set NODE_ENV=production
- [ ] Configure database connection pooling
- [ ] Enable Redis caching (USE_CACHE=true)
- [ ] Optimize Docker images (multi-stage builds already used)
- [ ] Set appropriate memory limits
- [ ] Configure log rotation

### Monitoring

- [ ] Set up health check monitoring
- [ ] Configure log aggregation
- [ ] Monitor database connections
- [ ] Track API response times
- [ ] Set up alerting for failures

### Backup

- [ ] Configure MySQL backups
- [ ] Backup Redis data (if using persistence)
- [ ] Document recovery procedures
- [ ] Test restore processes

## Environment Variables Reference

### API (Backend)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| NODE_ENV | Environment mode | development | No |
| API_PORT | API server port | 30089 | No |
| DB_AUTH_HOST | Auth database host | localhost | Yes |
| DB_AUTH_PORT | Auth database port | 3306 | No |
| DB_AUTH_USER | Auth database user | root | Yes |
| DB_AUTH_PASS | Auth database password | - | Yes |
| DB_AUTH_NAME | Auth database name | db_auth | Yes |
| JWT_SECRET | JWT signing secret | - | Yes |
| JWT_EXPIRES_IN | Token expiration (seconds) | 86400 | No |
| ADMIN_USERNAME | Admin login username | admin | Yes |
| ADMIN_PASSWORD | Admin login password | - | Yes |
| CORS_ORIGIN | Allowed CORS origins | http://localhost:33440 | Yes |
| USE_CACHE | Enable Redis caching | false | No |
| REDIS_URL | Redis connection URL | redis://localhost:6379 | No |
| SWAGGER_ENABLED | Enable Swagger docs | false | No |

### Web (Frontend)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| NEXT_PUBLIC_API_URL | API endpoint URL | http://localhost:30089 | Yes |
| NEXT_PUBLIC_APP_ENV | App environment | development | No |
| NEXT_PUBLIC_APP_VERSION | App version | 1.2.0-alpha | No |
| PORT | Web server port | 33440 | No |

## Reverse Proxy Configuration

### Nginx Example

```nginx
# API Backend
upstream dlc_api {
    server localhost:30089;
}

# Web Frontend
upstream dlc_web {
    server localhost:33440;
}

# API Server Block
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://dlc_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Web Server Block
server {
    listen 80;
    server_name app.yourdomain.com;

    location / {
        proxy_pass http://dlc_web;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL/TLS with Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificates
sudo certbot --nginx -d api.yourdomain.com -d app.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Database Management

### MySQL Access

```bash
# Via Adminer (Web UI)
http://localhost:8080
Server: mysql
Username: root
Password: <your-password>

# Via Docker exec
docker exec -it evs-dlc-mysql mysql -uroot -p

# Via command line (if MySQL client installed)
mysql -h localhost -P 3306 -u root -p
```

### Backup MySQL

```bash
# Backup all databases
docker exec evs-dlc-mysql mysqldump -u root -p<password> --all-databases > backup.sql

# Backup specific database
docker exec evs-dlc-mysql mysqldump -u root -p<password> db_game > db_game_backup.sql

# Restore
docker exec -i evs-dlc-mysql mysql -u root -p<password> < backup.sql
```

### Redis Management

```bash
# Access Redis CLI
docker exec -it evs-dlc-redis redis-cli

# Check keys
KEYS *

# Flush all keys (CAUTION!)
FLUSHALL
```

## CI/CD Pipeline

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that:

1. **Build & Test**
   - Builds API and Web applications
   - Runs linters and type checks
   - Executes tests

2. **Integration Tests**
   - Starts MySQL and Redis services
   - Runs API server
   - Tests health endpoints
   - Verifies auth endpoints

3. **Docker Build**
   - Tests Docker image builds
   - Validates Dockerfiles

### Running CI Locally

```bash
# Install act (GitHub Actions local runner)
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run workflows
act -j build-api
act -j build-web
```

## Troubleshooting

### API Won't Start

**Check database connectivity:**
```bash
docker-compose logs mysql
docker exec -it evs-dlc-mysql mysqladmin ping -p<password>
```

**Check environment variables:**
```bash
cat .env
# Verify all required variables are set
```

**Check logs:**
```bash
docker-compose logs api
# or
pnpm dev  # in dlc-dev-api directory
```

### Web Won't Build

**Clear Next.js cache:**
```bash
rm -rf .next
pnpm build
```

**Check environment variables:**
```bash
echo $NEXT_PUBLIC_API_URL
```

### Database Connection Errors

**Reset database:**
```bash
docker-compose down -v
docker-compose up -d mysql
# Wait for MySQL to be ready
docker-compose logs -f mysql
```

### Port Conflicts

**Check what's using the port:**
```bash
lsof -i :30089  # API
lsof -i :33440  # Web
lsof -i :3306   # MySQL

# Kill process if needed
kill -9 <PID>
```

## Performance Tuning

### Node.js (API/Web)

```bash
# Increase heap size if needed
NODE_OPTIONS="--max-old-space-size=4096" pnpm start

# Enable production mode
NODE_ENV=production
```

### MySQL

In `docker-compose.yml`, adjust MySQL command:

```yaml
command: [
  "mysqld",
  "--max_allowed_packet=1G",
  "--innodb_buffer_pool_size=2G",    # 50-70% of available RAM
  "--max_connections=200",
  "--query_cache_size=0",
  "--query_cache_type=0"
]
```

### Redis

```yaml
redis:
  command: redis-server --appendonly yes --maxmemory 1gb --maxmemory-policy allkeys-lru
```

## Monitoring & Logging

### Health Checks

```bash
# API Health
curl http://localhost:30089/health

# API Metrics
curl http://localhost:30089/health/metrics

# Web Health (via browser)
http://localhost:33440/dashboard
```

### Docker Logs

```bash
# Real-time logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs -f api
```

### Log Files

Production logs should be sent to a centralized logging system (ELK, Splunk, etc.).

## Scaling

### Horizontal Scaling

Use Docker Swarm or Kubernetes for orchestration:

```bash
# Docker Swarm example
docker swarm init
docker stack deploy -c docker-compose.yml dlc-stack
docker service scale dlc-stack_api=3
```

### Load Balancing

Use Nginx or HAProxy to distribute load across multiple API instances.

## Support & Resources

- **Documentation:** `/docs` directory
- **API Docs:** http://localhost:30089/api-docs (when SWAGGER_ENABLED=true)
- **Auth Guide:** [AUTH_GUIDE.md](./AUTH_GUIDE.md)
- **UI Guide:** [UI_GUIDE.md](./UI_GUIDE.md)
- **Changelog:** [CHANGELOG.md](./CHANGELOG.md)

---

**Version:** 1.2.0-alpha  
**Last Updated:** 2025-10-18

Built with ❤️ by EverVibe Studios

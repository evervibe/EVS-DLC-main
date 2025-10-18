## 🏗️ Architecture

```
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   DLC Dev Web    │◄───────►│   DLC Dev API    │◄───────►│  MySQL Databases │
│   (Frontend)     │  HTTP   │    (Backend)     │   TCP   │   (Docker)       │
│                  │         │                  │         │                  │
│   Next.js 15     │         │   NestJS 10      │         │   - db_auth      │
│   React 19       │         │   Fastify 4      │         │   - db_db        │
│   TypeScript 5   │         │   TypeORM 0.3    │         │   - db_data      │
│   Port: 33440    │         │   Port: 30089    │         │   - db_post      │
│                  │         │                  │         │   - db_ops       │
└──────────────────┘         └──────────────────┘         └──────────────────┘
```

### Database Layout (Last Chaos Architecture + Operations)

```
┌───────────────┬──────────┬────────────────────────────────────────────┐
│  Database     │  Port    │  Purpose                                   │
├───────────────┼──────────┼────────────────────────────────────────────┤
│ db_auth       │ 3306     │ Accounts & Authentication                  │
│ db_db         │ 3306     │ Game Data (Characters, World)              │
│ db_data       │ 3306     │ Static Data (Items, Skills, Strings)       │
│ db_post       │ 3306     │ CMS/Posts & Community Content              │
│ db_ops        │ 3306     │ Operations (Audit, Workflow, Jobs, Locks)  │
└───────────────┴──────────┴────────────────────────────────────────────┘
```

**5-Database Model (v1.2.3+):** Core databases are `db_auth`, `db_db`, and `db_data`. Optional databases are `db_post` (CMS) and `db_ops` (operations/workflow).

---

## 🔧 Technology Stack

### Backend (DLC Dev API v1.2.3-alpha)
- **Framework:** NestJS 10.4.20 with Fastify adapter (pure Fastify, no Express)
- **Language:** TypeScript 5.3.3
- **ORM:** TypeORM 0.3.27
- **Database:** MySQL 8.0 (5 databases: auth, game, data, post, ops)
- **Cache:** Redis 7 (ioredis 5.8.1)
- **Security:** @fastify/helmet 11.0.0, @fastify/rate-limit 10.3.0
- **Auth:** JWT (jsonwebtoken 9.0.2) with RBAC (translator, reviewer roles)
- **Validation:** Joi 18.0.1 + class-validator 0.14.2
- **Workflow:** Dual-write pattern with audit trail (ulid 2.3.0)
- **Location:** `tools/apps/dlc-dev-api/`

### Frontend (DLC Dev Web v1.2.3-alpha)
- **Framework:** Next.js 15.5.6 (App Router)
- **UI Library:** React 19.1.0
- **Language:** TypeScript 5.9.3
- **Styling:** Tailwind CSS 4.1.14
- **Features:** Login/Dashboard, API proxy, Dark mode, Tools → Strings (with editor)
- **Location:** `tools/apps/dlc-dev-web/`

### Infrastructure
- **Database:** MySQL 8.0 (Docker)
- **Cache:** Redis 7 (Docker)
- **Admin UI:** Adminer 4
- **Orchestration:** Docker Compose
- **Package Manager:** pnpm 9.12.3
- **Location:** `infra/`

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9.12.3
- Docker & Docker Compose (for database services)

### Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd EVS-DLC-main
```

2. **Setup environment variables**
```bash
# Copy the example environment file
cp .env.example .env
# Edit .env with your configuration
```

3. **Start infrastructure services**
```bash
cd infra
docker-compose up -d mysql redis
```

4. **Start Backend API**
```bash
cd tools/apps/dlc-dev-api
pnpm install
pnpm dev
# API will be available at http://localhost:30089
# Swagger docs at http://localhost:30089/api-docs
```

5. **Start Frontend Web**
```bash
cd tools/apps/dlc-dev-web
pnpm install
cp .env.local.example .env.local
pnpm dev
# Web will be available at http://localhost:33440
```

### Building for Production

**Backend API:**
```bash
cd tools/apps/dlc-dev-api
pnpm install
pnpm build
pnpm start:prod
```

**Frontend Web:**
```bash
cd tools/apps/dlc-dev-web
pnpm install
pnpm build
pnpm start
```

### Docker Compose (Full Stack)

```bash
cd infra
docker-compose up -d
# All services will be available:
# - API: http://localhost:30089
# - Web: http://localhost:33440
# - Adminer: http://localhost:8080
```

---

## 📁 Project Structure

```
EVS-DLC-main/
├── tools/
│   └── apps/
│       ├── dlc-dev-api/       # NestJS Backend API
│       └── dlc-dev-web/       # Next.js Frontend
├── infra/
│   ├── docker-compose.yml     # Docker orchestration
│   └── DB/                    # Database initialization
├── .env.example               # Environment variables template
├── CHANGELOG.md               # Version history
└── README.md                  # This file
```

---

## 🛠️ Tools & Features

### Tools → Strings (v1.2.2-alpha)

A language-aware string resource browser for viewing and searching game text in multiple languages.

**Features:**
- Browse string resources from `db_data.t_string`
- Search functionality with real-time filtering
- Language switching (20+ languages: ger, usa, spn, frc, rus, jpn, chn, twn, ita, tur, nld, uk, and more)
- Pagination controls (50 items per page by default)
- Dark mode compatible UI

**API Endpoints:**
```bash
# List/search strings
GET /data/strings?lang=ger&limit=50&offset=0&q=search

# Get single string by index
GET /data/strings/:id?lang=ger
```

**Example Usage:**
```bash
# Get German strings
curl "http://localhost:30089/data/strings?lang=ger&limit=10"

# Search for weapon strings in English
curl "http://localhost:30089/data/strings?lang=usa&q=weapon"

# Get specific string by index
curl "http://localhost:30089/data/strings/1?lang=ger"
```

**Web Interface:**
Navigate to `http://localhost:33440/tools/strings` to use the visual interface.

---

## 🔒 Environment Variables

See `.env.example` for a complete list of configuration options.

**Key Variables:**
- `API_PORT`: Backend API port (default: 30089)
- `DB_AUTH_HOST/PORT/USER/PASS/NAME`: Auth database configuration
- `DB_GAME_HOST/PORT/USER/PASS/NAME`: Game database configuration (db_db)
- `DB_DATA_HOST/PORT/USER/PASS/NAME`: Static data database configuration
- `DB_POST_HOST/PORT/USER/PASS/NAME`: Post/CMS database configuration
- `NEXT_PUBLIC_API_URL`: Frontend API endpoint
- `JWT_SECRET`: JWT signing secret (MUST change for production)
- `CORS_ORIGIN`: Allowed frontend origins

---

**Status:** Alpha release - Development and testing ready! 🚀

---

**Built with ❤️ by EverVibe Studios**  
**Version:** 1.2.2-alpha (Production Ready) | **Updated:** 2025-10-18

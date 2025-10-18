# Changelog

All notable changes to the EVS-DLC Development Stack will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-alpha] - 2025-10-18

### Added
- **Complete project restructure to v1.0.0-alpha**
- **Backend API (`tools/apps/dlc-dev-api`)**
  - NestJS 10 with Fastify 4 adapter
  - TypeORM 0.3 for MySQL 8 database connections
  - Support for multiple databases (auth, game, data, post)
  - Redis caching integration
  - Health check endpoint at `/health`
  - Swagger API documentation
  - JWT authentication with RBAC
  - Rate limiting and security headers
  
- **Frontend Web (`tools/apps/dlc-dev-web`)**
  - Next.js 15 with App Router
  - React 19 integration
  - TypeScript 5 full type safety
  - Tailwind CSS 4 for styling
  - Login page with authentication skeleton
  - Dashboard page with API status monitoring
  - Dark mode support
  - API proxy middleware for development
  
- **Infrastructure**
  - Consolidated `.env.example` at root level
  - Updated `docker-compose.yml` with correct paths
  - MySQL 8.0 database service
  - Redis 7 cache service
  - Adminer database management UI
  - Docker multi-stage builds for both apps
  
- **Documentation**
  - This CHANGELOG.md
  - Updated README with new architecture
  - Environment variable documentation

### Changed
- Project version reset to `1.0.0-alpha` for fresh start
- API port standardized to `30089`
- Frontend port changed from `5174` to `3000`
- CORS origin updated to match new frontend port
- Docker service names updated to reflect new structure

### Technical Details
- **Package Manager**: pnpm 9.12.3
- **Node.js**: v20+
- **Database**: MySQL 8.0
- **Cache**: Redis 7
- **Build Tool**: TypeScript 5, ESNext target

### Notes
- This is an alpha release intended for development and testing
- All services are configured for local development
- Production deployment requires additional security configurations
- Environment variables must be properly set before deployment

---

**Built with ❤️ by EverVibe Studios**

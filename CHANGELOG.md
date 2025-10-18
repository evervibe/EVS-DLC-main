# Changelog

All notable changes to the EVS-DLC Development Stack will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0-alpha] - 2025-10-18

### Added
- **Enhanced UI/UX System**
  - Created modern layout system with Sidebar, TopBar, and DashboardLayout components
  - Responsive sidebar with mobile support (hamburger menu)
  - Sticky top bar with logout functionality
  - Version banner in footer (v1.1.0-alpha)
- **Dynamic API Status Widgets**
  - ApiStatusWidget: Real-time API health monitoring
  - MetricsWidget: System metrics, memory usage, database pool stats
  - Auto-refresh every 30 seconds
  - Loading states and error handling
- **Backend Metrics Endpoint**
  - New `/health/metrics` endpoint for detailed system metrics
  - Database pool statistics (active/idle/total connections)
  - System information (uptime, memory, Node version, platform)
  - Cache metrics with key count
- **Modern Dashboard Design**
  - Card-based layout with responsive grid system
  - Feature highlight cards with gradients
  - Technology stack display with icons
  - Welcome section with feature descriptions
- **UI Components**
  - Reusable layout components (Sidebar, TopBar, DashboardLayout)
  - Widget components with consistent styling
  - Dark mode support throughout
  - Tailwind CSS 4 utilities

### Changed
- Updated all versions to 1.1.0-alpha
- Enhanced health check to report version 1.1.0-alpha
- Modernized dashboard page with new layout system
- Improved mobile responsiveness
- Updated metadata in layout.tsx

### Technical Details
- React 19 with Next.js 15 App Router
- Client-side components with "use client" directive
- TypeScript strict mode with proper typing
- CSS Grid and Flexbox for layouts
- Real-time data fetching with fetch API

## [1.0.2-alpha] - 2025-10-18

### Added
- **JWT Authentication System**
  - Integrated @nestjs/jwt and @nestjs/passport for secure authentication
  - Added JWT strategy with token validation
  - Created JwtAuthGuard for protecting routes
  - Added passport-jwt for JWT-based authentication
  - Included bcrypt for future password hashing support
- **Enhanced Auth Module**
  - Updated AuthService to use JwtService for token generation
  - Added token validation method
  - Configured JWT module with async configuration
  - Proper dependency injection for ConfigService
- **Environment Configuration**
  - Added JWT_EXPIRES_IN environment variable (default: 86400 seconds / 24 hours)
  - JWT_SECRET configuration with validation
- **Health Check Enhancement**
  - Added auth status to health endpoint
  - Displays JWT configuration status
  - Updated version to 1.0.2-alpha in health response
- **Documentation**
  - Created comprehensive AUTH_GUIDE.md
  - Includes authentication flow, examples, and best practices
  - Frontend integration examples (JavaScript/TypeScript)
  - cURL examples for testing
  - Token structure explanation
  - Security best practices guide

### Changed
- Updated API version to 1.0.2-alpha
- Enhanced AuthModule with JWT and Passport integration
- Improved auth service with proper token handling

### Technical Details
- Dependencies added: @nestjs/jwt, @nestjs/passport, passport-jwt, bcrypt
- JWT tokens expire after 24 hours by default (configurable)
- Tokens include user ID, username, and roles in payload
- Health endpoint now reports auth system status

## [1.0.1-alpha] - 2025-10-18

### Changed
- **Port Standardization**: Updated frontend web port from `3000` to `33440`
  - Updated all configuration files (`.env.example`, `docker-compose.yml`)
  - Updated package.json scripts for dev and start commands
  - Updated Dockerfile EXPOSE and PORT environment variable
  - Updated health check endpoints
- **CORS Configuration**: Updated `CORS_ORIGIN` from `http://localhost:3000` to `http://localhost:33440`
- **Version Bumps**: Updated API and Web package versions to `1.0.1-alpha`
- **Documentation**: Updated README.md with new port architecture

### Technical Details
- Web now runs on port `33440` (development and production)
- API continues on port `30089`
- All environment files synchronized with new ports
- Docker Compose configuration updated for new web port mapping

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

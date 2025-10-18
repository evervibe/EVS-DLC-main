# Analyse: Strings Editor (v1.2.3-alpha)

Generated analysis for the Strings Editor and integration points.

## Paths discovered
- Frontend (Next.js): `tools/apps/dlc-dev-web` (contains `package.json` with `next` and `app/` folder)
- Backend (API): `tools/apps/dlc-dev-api` (NestJS app, TypeORM, migrations)

## Ports / env
- API fallback: `http://localhost:30089` (env: `API_PORT` / `API_BASE_URL`)
- Frontend default: `http://localhost:33440` (Next dev port)
- Found `.env.example` entries for DB_OPS_* and NEXT_PUBLIC_FEATURE_STRINGS_EDIT

## API routes (found / expected)
- GET `/data/strings` (search/pagination)
- GET `/data/strings/:id` (read)
- PATCH `/data/strings/:id` (edit) — present; uses dual-write service
- GET `/data/strings/:id/history` (audit) — present in StringsEditorService

## Notes
- Backend health endpoint at `/health` reports `ops` database status
- Frontend lacked a central http util (server-side absolute url problem). Added `tools/apps/dlc-dev-web/lib/http.ts` to fix
- Frontend feature flag `NEXT_PUBLIC_FEATURE_STRINGS_EDIT` exists and is enabled in `.env.local.example`

*** End of analysis

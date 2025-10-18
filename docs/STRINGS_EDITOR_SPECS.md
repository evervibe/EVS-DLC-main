# Strings Editor Specs (v1.2.3-alpha)

This document describes the API contracts and UI expectations for the Strings Editor.

## API Contracts

- GET /data/strings
  - query: q, lang, limit, offset, index
  - returns: { items: [{ a_index, value, ... }], total }

- GET /data/strings/:id
  - returns string record with all language fields

- PATCH /data/strings/:id
  - body: { lang, value, reason?, ifVersion? }
  - responses:
    - 200: { success: true, version, tx_id }
    - 409: Version conflict
    - 404: Not found

- GET /data/strings/:id/history
  - returns ordered audit trail rows: { id, a_index, lang, old_value, new_value, actor, reason, stage, created_at }

## Frontend behavior
- Use `tools/apps/dlc-dev-web/lib/http.ts` for all fetches. Uses `API_BASE_URL` on server and `NEXT_PUBLIC_API_BASE_URL` on client.
- Language selection via `lib/flags.tsx` LANG_MAP + FlagEmoji component.
- Search supports `#123` prefix for index lookup.
- Inline edit: optimistic UI update; on error, show toast and revert state.

*** End of specs

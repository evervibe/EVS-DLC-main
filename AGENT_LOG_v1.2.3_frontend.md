# AGENT_LOG v1.2.3-alpha — Frontend additions (2025-10-18)

This short log documents the frontend changes made to fix server-side URL handling and to add lightweight flag helpers for the Strings Editor.

Files added:
- `tools/apps/dlc-dev-web/lib/http.ts` — central API URL builder and `apiFetch` wrapper. Fixes `Invalid URL` on server-side fetch by resolving absolute URLs using `API_BASE_URL` on server and `NEXT_PUBLIC_API_BASE_URL` on client.
- `tools/apps/dlc-dev-web/lib/flags.tsx` — emoji-based flags and `LANG_MAP` for language dropdowns; small React component `FlagEmoji`.
- `docs/ANALYSE_STRINGS_EDITOR.md` — inventory and quick analysis of routes/ports/env.
- `docs/STRINGS_EDITOR_SPECS.md` — API contract and frontend expectations for the Strings Editor.

Notes:
- These changes are intentionally minimal and dependency-free (no external flag image libs).
- Next steps: integrate `apiFetch` into the Strings UI (replace direct `fetch` calls), add unit test for `apiUrl`, and implement optimistic UI with rollback.


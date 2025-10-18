# Architecture Diagram - Tools → Strings Feature

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          TOOLS → STRINGS FEATURE                         │
│                              (v1.2.2-alpha)                              │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐
│   Browser (User)         │
│                          │
│  http://localhost:33440  │
│  /tools/strings          │
└────────────┬─────────────┘
             │
             │ HTTP GET (SSR)
             ▼
┌────────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js 15 + React 19)                          │
│  Port: 33440                                               │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  📄 app/tools/strings/page.tsx (Server Component)         │
│  ├─ Fetches data from API                                 │
│  ├─ Handles searchParams (Promise-based)                  │
│  └─ Passes data to client component                       │
│                                                            │
│  🖥️  app/tools/strings/stringsClient.tsx (Client)         │
│  ├─ Search input                                          │
│  ├─ Language dropdown (20+ languages)                     │
│  ├─ Pagination controls                                   │
│  └─ Results table                                         │
│                                                            │
│  🎨 app/components/layout/Sidebar.tsx                     │
│  └─ Tools section with Strings entry                      │
│                                                            │
└────────────────┬───────────────────────────────────────────┘
                 │
                 │ fetch()
                 │ http://localhost:30089/data/strings?lang=ger&limit=50
                 ▼
┌────────────────────────────────────────────────────────────┐
│  BACKEND API (NestJS 10 + Fastify 4)                      │
│  Port: 30089                                               │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  🎯 StringsController                                      │
│  └─ GET /data/strings                                     │
│     └─ @Query: q, lang, limit, offset                     │
│  └─ GET /data/strings/:id                                 │
│     └─ @Param: id, @Query: lang                           │
│                                                            │
│  🔧 StringsService                                         │
│  ├─ search(opts)                                          │
│  │  ├─ Validates language via LANG_MAP                    │
│  │  ├─ Builds SQL query dynamically                       │
│  │  ├─ SELECT a_index, {lang_col} AS value               │
│  │  ├─ WHERE {lang_col} LIKE ? (if search)               │
│  │  ├─ ORDER BY a_index ASC                               │
│  │  └─ LIMIT ? OFFSET ?                                   │
│  │                                                         │
│  └─ byId(a_index, lang)                                   │
│     └─ SELECT a_index, {lang_col} AS value                │
│        WHERE a_index = ?                                   │
│                                                            │
│  🔌 @InjectDataSource('data')                             │
│  └─ Uses named TypeORM connection                         │
│                                                            │
└────────────────┬───────────────────────────────────────────┘
                 │
                 │ SQL Query (Parameterized)
                 ▼
┌────────────────────────────────────────────────────────────┐
│  DATABASE (MySQL 8.0)                                      │
│  Port: 3306                                                │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  📊 db_data.t_string                                       │
│  ├─ a_index (PK, int)                                     │
│  ├─ a_string_usa (varchar 255)                            │
│  ├─ a_string_ger (varchar 255)  ← Default                 │
│  ├─ a_string_spn (varchar 255)                            │
│  ├─ a_string_frc (varchar 255)                            │
│  ├─ a_string_rus (varchar 255)                            │
│  ├─ a_string_jpn (varchar 255)                            │
│  ├─ a_string_chn (varchar 255)                            │
│  ├─ ... (20+ language columns)                            │
│  └─ a_string_dev (varchar 255)                            │
│                                                            │
│  📈 Optional: FULLTEXT Index                              │
│  └─ ft_t_string_multilang                                 │
│     (a_string_usa, a_string_ger, ...)                     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
USER SEARCHES FOR "Schwert" (German for "sword")
│
├─ 1. User enters "Schwert" in search box
│   └─ Component: stringsClient.tsx
│
├─ 2. User presses Enter or clicks "Suchen"
│   └─ Action: pushQuery({ q: 'Schwert', offset: '0' })
│
├─ 3. Router navigates to new URL
│   └─ URL: /tools/strings?q=Schwert&lang=ger&limit=50&offset=0
│
├─ 4. Next.js SSR kicks in
│   └─ Component: page.tsx (Server Component)
│   └─ Action: Reads searchParams
│
├─ 5. Server fetches from API
│   └─ URL: http://localhost:30089/data/strings?q=Schwert&lang=ger&limit=50&offset=0
│   └─ Method: fetch() with cache: 'no-store'
│
├─ 6. API Controller receives request
│   └─ Controller: StringsController
│   └─ Method: search()
│   └─ Params: q='Schwert', lang='ger', limit=50, offset=0
│
├─ 7. Service processes request
│   └─ Service: StringsService
│   └─ Validates: lang='ger' → column='a_string_ger'
│   └─ Builds SQL:
│       SELECT a_index, a_string_ger AS value 
│       FROM t_string 
│       WHERE a_string_ger LIKE '%Schwert%' 
│       ORDER BY a_index ASC 
│       LIMIT 50 OFFSET 0
│
├─ 8. Database executes query
│   └─ Database: db_data.t_string
│   └─ Returns: [{ a_index: 123, value: 'Eisenschwert' }, ...]
│
├─ 9. API formats response
│   └─ Response: 
│       {
│         items: [...],
│         total: 42,
│         limit: 50,
│         offset: 0,
│         lang: 'ger',
│         q: 'Schwert'
│       }
│
├─ 10. Server component receives data
│   └─ Component: page.tsx
│   └─ Passes to: <StringsClient initial={data} />
│
├─ 11. Client component renders
│   └─ Component: stringsClient.tsx
│   └─ Displays:
│       - Search box (pre-filled: "Schwert")
│       - Language dropdown (selected: "ger")
│       - Results table (42 matching rows)
│       - Pagination (Page 1 / 1)
│
└─ 12. User sees results
    └─ Table shows:
        Index | Text (ger)
        ─────┼────────────────
        123  | Eisenschwert
        456  | Flammschwert
        ...  | ...
```

---

## Language Switching Flow

```
USER SWITCHES LANGUAGE FROM GERMAN TO ENGLISH
│
├─ 1. User clicks language dropdown
│   └─ Current: ger
│
├─ 2. User selects "usa"
│   └─ onChange event fires
│
├─ 3. Client component updates
│   └─ setLang('usa')
│   └─ pushQuery({ lang: 'usa', offset: '0' })
│
├─ 4. Router navigates
│   └─ URL: /tools/strings?q=Schwert&lang=usa&limit=50&offset=0
│
├─ 5. Server re-fetches with new language
│   └─ API: /data/strings?q=Schwert&lang=usa&limit=50&offset=0
│
├─ 6. Service switches column
│   └─ lang='usa' → column='a_string_usa'
│   └─ SQL:
│       SELECT a_index, a_string_usa AS value 
│       FROM t_string 
│       WHERE a_string_usa LIKE '%Schwert%' 
│       ...
│
├─ 7. Database returns English results
│   └─ Note: 'Schwert' is German, so English results may be empty
│   └─ User should search "sword" for English results
│
└─ 8. UI updates
    └─ Table header: "Text (usa)"
    └─ Results: English strings (if any match)
```

---

## Pagination Flow

```
USER NAVIGATES TO PAGE 2
│
├─ 1. User clicks "Weiter" (Next) button
│   └─ Current page: 0 (offset: 0)
│
├─ 2. Client calculates new offset
│   └─ New offset: (page + 1) * pageSize = 1 * 50 = 50
│
├─ 3. Router navigates
│   └─ pushQuery({ offset: '50' })
│   └─ URL: /tools/strings?q=...&lang=ger&limit=50&offset=50
│
├─ 4. Server fetches page 2
│   └─ API: /data/strings?...&limit=50&offset=50
│
├─ 5. Service queries with offset
│   └─ SQL: ... LIMIT 50 OFFSET 50
│
├─ 6. Database returns rows 51-100
│   └─ Results: Next 50 matching strings
│
└─ 7. UI updates
    └─ Pagination: "Seite 2 / {totalPages}"
    └─ Table: Shows rows 51-100
```

---

## API-First Architecture Benefits

```
┌─────────────────────────────────────────────────────┐
│                   API-FIRST BENEFITS                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ✅ SINGLE SOURCE OF TRUTH                          │
│  └─ All business logic in backend                  │
│                                                     │
│  ✅ MULTIPLE CLIENTS SUPPORTED                      │
│  ├─ Web UI (current)                               │
│  ├─ Mobile app (future)                            │
│  ├─ CLI tools (future)                             │
│  └─ Third-party integrations (future)              │
│                                                     │
│  ✅ BETTER SECURITY                                 │
│  ├─ Validation in one place                        │
│  ├─ Authorization in one place                     │
│  └─ No business logic in client                    │
│                                                     │
│  ✅ EASIER TESTING                                  │
│  ├─ API endpoints testable independently           │
│  ├─ UI tests focus on presentation                 │
│  └─ Clear contract between layers                  │
│                                                     │
│  ✅ BETTER SCALING                                  │
│  ├─ API can scale independently                    │
│  ├─ UI can be CDN-hosted                           │
│  └─ Database connections managed centrally         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────┐
│                  SECURITY LAYERS                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Layer 1: CORS                                      │
│  └─ Only http://localhost:33440 allowed            │
│                                                     │
│  Layer 2: Rate Limiting                             │
│  └─ Prevents API abuse                             │
│                                                     │
│  Layer 3: Input Validation                          │
│  ├─ Language whitelist (LANG_MAP)                  │
│  ├─ Limit: max 100, min 1                          │
│  └─ Offset: >= 0                                   │
│                                                     │
│  Layer 4: Parameterized Queries                     │
│  └─ SQL injection prevention                       │
│      ❌ "WHERE col = '" + input + "'"               │
│      ✅ "WHERE col = ?" + [input]                   │
│                                                     │
│  Layer 5: Read-Only Access                          │
│  └─ No INSERT, UPDATE, DELETE operations           │
│                                                     │
│  Layer 6: Helmet Security Headers                   │
│  └─ XSS, clickjacking prevention                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## File Structure

```
EVS-DLC-main/
│
├─ Backend (tools/apps/dlc-dev-api/)
│  ├─ src/modules/strings/          ← NEW MODULE
│  │  ├─ strings.module.ts
│  │  ├─ strings.service.ts         ← RAW SQL QUERIES
│  │  └─ strings.controller.ts      ← REST ENDPOINTS
│  │
│  ├─ src/modules/data/
│  │  ├─ data.module.ts             ← NAMED CONNECTION
│  │  ├─ t_string/                  ← EXISTING (TypeORM)
│  │  ├─ t_item/                    ← UPDATED CONNECTION
│  │  ├─ t_skill/                   ← UPDATED CONNECTION
│  │  └─ t_skilllevel/              ← UPDATED CONNECTION
│  │
│  ├─ .env.example                  ← CLEANED UP
│  └─ package.json                  ← VERSION 1.2.2-alpha
│
├─ Frontend (tools/apps/dlc-dev-web/)
│  ├─ app/tools/strings/            ← NEW FEATURE
│  │  ├─ page.tsx                   ← SERVER COMPONENT
│  │  └─ stringsClient.tsx          ← CLIENT COMPONENT
│  │
│  ├─ app/components/layout/
│  │  └─ Sidebar.tsx                ← TOOLS SECTION ADDED
│  │
│  ├─ .env.local.example            ← VERSION UPDATED
│  └─ package.json                  ← VERSION 1.2.2-alpha
│
└─ Documentation
   ├─ AUTO_ANALYSIS.md              ← REPO ANALYSIS
   ├─ AGENT_LOG_v1.2.2.md          ← IMPLEMENTATION LOG
   ├─ DB_STRINGS_DOCUMENTATION.md   ← DATABASE REFERENCE
   ├─ IMPLEMENTATION_SUMMARY.md     ← THIS SUMMARY
   ├─ CHANGELOG.md                  ← RELEASE NOTES
   └─ README.md                     ← UPDATED FEATURES
```

---

## Next Steps for User

1. **Review Code**
   ```bash
   # Check the implementation
   git diff main..copilot/implement-tools-strings-feature
   ```

2. **Start Services**
   ```bash
   # Start databases
   cd infra && docker-compose up -d mysql redis
   
   # Start API
   cd tools/apps/dlc-dev-api
   pnpm install
   pnpm dev
   
   # Start Web
   cd tools/apps/dlc-dev-web
   pnpm install
   pnpm dev
   ```

3. **Test API**
   ```bash
   # Health check
   curl http://localhost:30089/health
   
   # Test strings endpoint
   curl "http://localhost:30089/data/strings?lang=ger&limit=5"
   ```

4. **Test UI**
   ```
   Navigate to: http://localhost:33440/tools/strings
   ```

5. **Deploy**
   ```bash
   # Merge PR
   git checkout main
   git merge copilot/implement-tools-strings-feature
   
   # Tag release
   git tag v1.2.2-alpha
   git push origin v1.2.2-alpha
   ```

---

**End of Architecture Diagram**

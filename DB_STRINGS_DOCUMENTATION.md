# Database Documentation: t_string Table

**Database:** `db_data`  
**Table:** `t_string`  
**Purpose:** Multi-language string resources for game UI, items, skills, and other localized content

---

## Table Structure (DDL)

```sql
CREATE TABLE IF NOT EXISTS `t_string` (
  `a_index` int NOT NULL,
  `a_string_usa` varchar(255) NOT NULL DEFAULT '',
  `a_string_ger` varchar(255) NOT NULL DEFAULT '',
  `a_string_spn` varchar(255) NOT NULL DEFAULT '',
  `a_string_frc` varchar(255) NOT NULL DEFAULT '',
  `a_string_rus` varchar(255) NOT NULL DEFAULT '',
  `a_string` varchar(255) NOT NULL DEFAULT '',
  `a_string_twn` varchar(255) NOT NULL DEFAULT '',
  `a_string_chn` varchar(255) NOT NULL DEFAULT '',
  `a_string_thai` varchar(255) NOT NULL DEFAULT '',
  `a_string_thai_eng` varchar(255) NOT NULL DEFAULT '',
  `a_string_twn2` varchar(255) NOT NULL DEFAULT '',
  `a_string_jpn` varchar(255) NOT NULL DEFAULT '',
  `a_string_mal` varchar(255) NOT NULL DEFAULT '',
  `a_string_mal_eng` varchar(255) NOT NULL DEFAULT '',
  `a_string_brz` varchar(255) NOT NULL DEFAULT '',
  `a_string_hk` varchar(255) NOT NULL DEFAULT '',
  `a_string_hk_eng` varchar(255) NOT NULL DEFAULT '',
  `a_string_pld` varchar(255) NOT NULL DEFAULT '',
  `a_string_tur` varchar(255) NOT NULL DEFAULT '',
  `a_string_spn2` varchar(255) NOT NULL DEFAULT '',
  `a_string_frc2` varchar(255) NOT NULL DEFAULT '',
  `a_string_ita` varchar(255) NOT NULL DEFAULT '',
  `a_string_mex` varchar(255) NOT NULL DEFAULT '',
  `a_string_nld` varchar(255) NOT NULL DEFAULT '',
  `a_string_uk` varchar(255) NOT NULL DEFAULT '',
  `a_string_dev` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`a_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## Column Reference

| Column | Language | Description |
|--------|----------|-------------|
| `a_index` | - | Primary key, unique string identifier (int) |
| `a_string_usa` | English (US) | American English text |
| `a_string_ger` | German | German text (default in UI) |
| `a_string_spn` | Spanish | Spanish text |
| `a_string_frc` | French | French text |
| `a_string_rus` | Russian | Russian text |
| `a_string` | Base | Base/fallback string |
| `a_string_twn` | Traditional Chinese | Taiwanese Chinese |
| `a_string_chn` | Simplified Chinese | Mainland Chinese |
| `a_string_thai` | Thai | Thai text |
| `a_string_thai_eng` | Thai (English) | Thai romanized |
| `a_string_twn2` | Traditional Chinese 2 | Alternative Taiwanese |
| `a_string_jpn` | Japanese | Japanese text |
| `a_string_mal` | Malay | Malay text |
| `a_string_mal_eng` | Malay (English) | Malay romanized |
| `a_string_brz` | Portuguese (Brazil) | Brazilian Portuguese |
| `a_string_hk` | Cantonese | Hong Kong Cantonese |
| `a_string_hk_eng` | Cantonese (English) | Cantonese romanized |
| `a_string_pld` | Polish | Polish text |
| `a_string_tur` | Turkish | Turkish text |
| `a_string_spn2` | Spanish 2 | Alternative Spanish |
| `a_string_frc2` | French 2 | Alternative French |
| `a_string_ita` | Italian | Italian text |
| `a_string_mex` | Spanish (Mexico) | Mexican Spanish |
| `a_string_nld` | Dutch | Dutch text |
| `a_string_uk` | English (UK) | British English |
| `a_string_dev` | Developer | Internal/debug strings |

**Total:** 1 primary key + 26 language columns

---

## Language Code Mapping (API)

The API uses short language codes that map to database columns:

```typescript
const LANG_MAP: Record<string,string> = {
  usa:'a_string_usa',    // English (US)
  ger:'a_string_ger',    // German (default)
  spn:'a_string_spn',    // Spanish
  frc:'a_string_frc',    // French
  rus:'a_string_rus',    // Russian
  base:'a_string',       // Base/fallback
  twn:'a_string_twn',    // Traditional Chinese
  chn:'a_string_chn',    // Simplified Chinese
  thai:'a_string_thai',  // Thai
  jpn:'a_string_jpn',    // Japanese
  mal:'a_string_mal',    // Malay
  brz:'a_string_brz',    // Portuguese (Brazil)
  hk:'a_string_hk',      // Cantonese
  pld:'a_string_pld',    // Polish
  tur:'a_string_tur',    // Turkish
  ita:'a_string_ita',    // Italian
  mex:'a_string_mex',    // Spanish (Mexico)
  nld:'a_string_nld',    // Dutch
  uk:'a_string_uk',      // English (UK)
  dev:'a_string_dev',    // Developer
};
```

---

## Performance Optimization

### Optional FULLTEXT Index

For improved search performance on large datasets (10,000+ rows):

```sql
ALTER TABLE `t_string`
ADD FULLTEXT INDEX `ft_t_string_multilang`
(
  `a_string_usa`, `a_string_ger`, `a_string_spn`, `a_string_frc`, 
  `a_string_rus`, `a_string_twn`, `a_string_chn`, `a_string_jpn`, 
  `a_string_ita`, `a_string_tur`, `a_string_nld`, `a_string_uk`
);
```

**Note:** Thai, Malay, Hong Kong, and alternative language columns excluded from FULLTEXT as they may contain special characters or are less frequently used.

### Query Performance with FULLTEXT

When FULLTEXT index exists, use `MATCH...AGAINST` for better performance:

```sql
-- Standard LIKE query (slower, but works without index)
SELECT a_index, a_string_ger AS value 
FROM t_string 
WHERE a_string_ger LIKE '%weapon%' 
LIMIT 50 OFFSET 0;

-- FULLTEXT query (faster, requires index)
SELECT a_index, a_string_ger AS value 
FROM t_string 
WHERE MATCH(a_string_ger) AGAINST('weapon' IN BOOLEAN MODE)
LIMIT 50 OFFSET 0;
```

**Benchmark:** FULLTEXT can be 10-100x faster than LIKE for large result sets.

---

## Data Size & Storage

**Typical Dataset:**
- Rows: 5,000 - 50,000 string resources
- Storage: ~10-100 MB depending on content density
- Index size (FULLTEXT): ~5-30 MB additional

**Character Limits:**
- All language columns: `varchar(255)`
- Maximum 255 characters per language string
- UTF-8mb4 encoding supports emoji and special characters

---

## Usage Examples

### API Queries

```bash
# Get all German strings (first page)
curl "http://localhost:30089/data/strings?lang=ger&limit=50&offset=0"

# Search for strings containing "Schwert" (sword in German)
curl "http://localhost:30089/data/strings?lang=ger&q=Schwert"

# Get string by index (e.g., index 1)
curl "http://localhost:30089/data/strings/1?lang=ger"

# Switch to English
curl "http://localhost:30089/data/strings?lang=usa&limit=50"

# Pagination (page 2)
curl "http://localhost:30089/data/strings?lang=ger&limit=50&offset=50"
```

### Direct SQL Queries

```sql
-- Get single string in German
SELECT a_index, a_string_ger 
FROM t_string 
WHERE a_index = 1;

-- Get all English strings with pagination
SELECT a_index, a_string_usa 
FROM t_string 
ORDER BY a_index ASC 
LIMIT 50 OFFSET 0;

-- Search across multiple languages
SELECT a_index, a_string_ger, a_string_usa, a_string_jpn
FROM t_string 
WHERE a_string_ger LIKE '%Waffe%' 
   OR a_string_usa LIKE '%weapon%'
LIMIT 20;

-- Count total strings
SELECT COUNT(*) FROM t_string;

-- Check for missing translations
SELECT a_index, a_string_ger, a_string_usa
FROM t_string
WHERE a_string_usa = '' OR a_string_usa IS NULL
LIMIT 10;
```

---

## Data Maintenance

### Backup

```bash
# Backup t_string table
mysqldump -u root -p db_data t_string > t_string_backup.sql

# Restore from backup
mysql -u root -p db_data < t_string_backup.sql
```

### Import CSV Data

```sql
-- Load strings from CSV (example)
LOAD DATA LOCAL INFILE '/path/to/strings.csv'
INTO TABLE t_string
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(a_index, a_string_usa, a_string_ger, a_string_jpn);
```

### Validate Data Integrity

```sql
-- Check for duplicate indices (should be none)
SELECT a_index, COUNT(*) as cnt 
FROM t_string 
GROUP BY a_index 
HAVING cnt > 1;

-- Check for completely empty rows
SELECT * FROM t_string
WHERE a_string_usa = '' 
  AND a_string_ger = '' 
  AND a_string_jpn = ''
  AND a_string = '';

-- Check character encoding issues
SELECT a_index, a_string_ger
FROM t_string
WHERE a_string_ger REGEXP '[^\x00-\x7F]'
LIMIT 10;
```

---

## Security Considerations

1. **Parameterized Queries:** All API queries use parameterized values to prevent SQL injection
2. **Read-Only Access:** API endpoints only perform SELECT operations
3. **Input Validation:** Language codes validated against LANG_MAP whitelist
4. **Rate Limiting:** Applied at API level to prevent abuse
5. **Character Encoding:** UTF-8mb4 prevents encoding exploits

---

## Integration Notes

### TypeORM Entity (Legacy)

The existing `t_string` TypeORM entity is located at:
- `tools/apps/dlc-dev-api/src/modules/data/t_string/t_string.entity.ts`

### New Strings Module

The v1.2.2-alpha strings module uses raw SQL instead of TypeORM:
- Location: `tools/apps/dlc-dev-api/src/modules/strings/`
- Uses `@InjectDataSource('data')` for database access
- Direct SQL queries for performance and flexibility

---

## Troubleshooting

**Issue:** Slow search queries
- **Solution:** Add FULLTEXT index (see above)

**Issue:** Missing translations
- **Solution:** Query for empty columns and populate data

**Issue:** Character encoding problems
- **Solution:** Ensure database and table use `utf8mb4` charset

**Issue:** Out of memory on large queries
- **Solution:** Reduce limit parameter, add pagination

**Issue:** Connection errors
- **Solution:** Verify db_data database exists and credentials are correct

---

## Future Enhancements

- [ ] Semantic search with vector embeddings
- [ ] Translation memory for batch updates
- [ ] Version history for string changes
- [ ] Automated translation suggestions
- [ ] Export to i18n JSON formats
- [ ] Bulk import/export tools
- [ ] String usage analytics

---

**Last Updated:** 2025-10-18  
**Version:** 1.2.2-alpha

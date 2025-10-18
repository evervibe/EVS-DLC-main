# db_ops Migrations

This directory contains SQL migration files for the `db_ops` database.

## Purpose

The `db_ops` database is dedicated to operational workflows, auditing, and background jobs:
- **l10n_string_audit**: Complete audit trail for all string edits
- **l10n_string_state**: Workflow state (draft/reviewed/published) and versioning
- **ops_job**: Background job queue for async operations
- **ops_lock**: Distributed resource locking

## Running Migrations

### Manual Execution
```bash
mysql -u root -p < migrations/ops/001_create_ops_database.sql
```

### Via Docker
```bash
docker exec -i mysql_container mysql -u root -proot < migrations/ops/001_create_ops_database.sql
```

## Migration Files

- `001_create_ops_database.sql` - Initial schema creation for db_ops
- `002_ops_core_tables.sql` - Additional indexes and maintenance helpers (v1.2.3-alpha)

## Database Architecture

```
db_ops (Operations & Workflow)
├── l10n_string_audit    - Edit audit trail with tx_id and stages
├── l10n_string_state    - Workflow status and versioning
├── ops_job              - Background job queue
└── ops_lock             - Resource locking
```

## Design Decisions

### Dual-Write Pattern
String edits follow a dual-write pattern with reconciliation:
1. Insert audit record (stage='prepare')
2. Update db_data.t_string
3. Upsert state record (version++)
4. Update audit stage to 'committed'

### Optimistic Locking
The `version` column in `l10n_string_state` enables optimistic locking to prevent conflicting concurrent edits.

### Transaction IDs
All audit records use ULID-based `tx_id` for transaction tracking and reconciliation.

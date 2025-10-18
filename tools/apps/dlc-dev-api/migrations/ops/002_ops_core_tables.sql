-- ========================================================
-- EVS-DLC v1.2.3-alpha — Ops Database Indexes & Maintenance
-- ========================================================
-- Purpose: Additional indexes and maintenance helpers for db_ops
-- Created: 2025-10-18
-- ========================================================

USE `db_ops`;

-- Ensure useful composite index for audit queries by a_index/lang/time
CREATE INDEX IF NOT EXISTS `idx_aindex_lang_created` ON `l10n_string_audit` (`a_index`, `lang`, `created_at`);

-- Ensure status index for quick state lookups
CREATE INDEX IF NOT EXISTS `idx_state_status` ON `l10n_string_state` (`status`);

-- Optional: cleanup helper for old audit entries (manual use)
-- DELETE FROM `l10n_string_audit` WHERE created_at < DATE_SUB(NOW(), INTERVAL 2 YEAR);

-- Notes:
-- - This file contains index additions only; core tables are created in 001_create_ops_database.sql
-- - No foreign keys are added to preserve strict separation from db_data

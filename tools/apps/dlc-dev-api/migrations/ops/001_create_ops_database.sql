-- ========================================================
-- EVS-DLC v1.2.3-alpha — Ops Database Creation
-- ========================================================
-- Purpose: Create dedicated operations/workflow database
-- Created: 2025-10-18
-- ========================================================

CREATE DATABASE IF NOT EXISTS `db_ops` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_0900_ai_ci;

-- ========================================================
-- l10n_string_audit - Audit trail for string edits
-- ========================================================
-- Tracks all changes to localization strings with dual-write pattern
-- Supports prepare/commit/failed stages for transactional integrity
-- ========================================================

CREATE TABLE IF NOT EXISTS `db_ops`.`l10n_string_audit` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `a_index` INT NOT NULL COMMENT 'Reference to t_string.a_index',
  `lang` VARCHAR(8) NOT NULL COMMENT 'Language code (ger, usa, spn, etc.)',
  `old_value` VARCHAR(255) NOT NULL COMMENT 'Previous string value',
  `new_value` VARCHAR(255) NOT NULL COMMENT 'New string value',
  `reason` VARCHAR(255) NULL COMMENT 'Edit reason/description',
  `actor` VARCHAR(64) NOT NULL COMMENT 'Username of editor',
  `tx_id` CHAR(26) NOT NULL COMMENT 'Transaction ID (ULID)',
  `stage` ENUM('prepare','committed','failed') NOT NULL DEFAULT 'prepare' COMMENT 'Transaction stage',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_a_index` (`a_index`),
  INDEX `idx_lang` (`lang`),
  INDEX `idx_tx_id` (`tx_id`),
  INDEX `idx_stage` (`stage`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Audit trail for localization string changes';

-- ========================================================
-- l10n_string_state - Workflow state for strings
-- ========================================================
-- Tracks review/publish workflow status per string+language
-- Version tracking for optimistic locking
-- ========================================================

CREATE TABLE IF NOT EXISTS `db_ops`.`l10n_string_state` (
  `a_index` INT NOT NULL COMMENT 'Reference to t_string.a_index',
  `lang` VARCHAR(8) NOT NULL COMMENT 'Language code',
  `status` ENUM('draft','reviewed','published') NOT NULL DEFAULT 'draft' COMMENT 'Workflow status',
  `version` INT NOT NULL DEFAULT 1 COMMENT 'Version for optimistic locking',
  `updated_by` VARCHAR(64) NOT NULL COMMENT 'Last editor username',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`a_index`,`lang`),
  INDEX `idx_status` (`status`),
  INDEX `idx_updated` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Workflow state for localization strings';

-- ========================================================
-- ops_job - Background job queue
-- ========================================================
-- Generic job queue for async operations (reconcile, export, etc.)
-- ========================================================

CREATE TABLE IF NOT EXISTS `db_ops`.`ops_job` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `type` VARCHAR(32) NOT NULL COMMENT 'Job type (reconcile, export, etc.)',
  `payload` JSON NOT NULL COMMENT 'Job parameters',
  `status` ENUM('queued','running','done','failed') NOT NULL DEFAULT 'queued',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `started_at` TIMESTAMP NULL,
  `finished_at` TIMESTAMP NULL,
  `error` TEXT NULL COMMENT 'Error message if failed',
  INDEX `idx_type_status` (`type`, `status`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Background job queue';

-- ========================================================
-- ops_lock - Distributed resource locking
-- ========================================================
-- Simple pessimistic locking for resources (strings, bulk imports)
-- ========================================================

CREATE TABLE IF NOT EXISTS `db_ops`.`ops_lock` (
  `resource` VARCHAR(64) NOT NULL COMMENT 'Resource identifier',
  `locked_by` VARCHAR(64) NOT NULL COMMENT 'Username holding the lock',
  `expires_at` TIMESTAMP NOT NULL COMMENT 'Lock expiration time',
  PRIMARY KEY (`resource`),
  INDEX `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Distributed resource locks';

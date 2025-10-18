import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { dbPools } from '../../common/db';
import { EditStringDto, UpdateStateDto } from './dto/edit-string.dto';
import { ulid } from 'ulid';

const LANG_MAP: Record<string, string> = {
  usa: 'a_string_usa', ger: 'a_string_ger', spn: 'a_string_spn', frc: 'a_string_frc', rus: 'a_string_rus',
  base: 'a_string', twn: 'a_string_twn', chn: 'a_string_chn', thai: 'a_string_thai', jpn: 'a_string_jpn',
  mal: 'a_string_mal', brz: 'a_string_brz', hk: 'a_string_hk', pld: 'a_string_pld', tur: 'a_string_tur',
  ita: 'a_string_ita', mex: 'a_string_mex', nld: 'a_string_nld', uk: 'a_string_uk', dev: 'a_string_dev',
};

@Injectable()
export class StringsEditorService {
  /**
   * Edit a string with dual-write pattern and optimistic locking
   */
  async editString(
    aIndex: number,
    dto: EditStringDto,
    actor: string,
  ): Promise<{ success: boolean; version: number; tx_id: string }> {
    const { lang, value, reason, ifVersion } = dto;
    const column = LANG_MAP[lang.toLowerCase()];

    if (!column) {
      throw new BadRequestException('Unsupported language');
    }

    // Validate UTF-8 and length
    if (Buffer.byteLength(value, 'utf8') > 255) {
      throw new BadRequestException('Value exceeds 255 bytes');
    }

    const tx_id = ulid();
    const dataConn = await dbPools.data.getConnection();
    const opsConn = await dbPools.ops.getConnection();

    try {
      await dataConn.beginTransaction();
      await opsConn.beginTransaction();

      // Check if string exists
      const [existingRows] = await dataConn.query(
        `SELECT a_index, ${column} AS current_value FROM t_string WHERE a_index = ? FOR UPDATE`,
        [aIndex]
      ) as any[];

      if (!existingRows || existingRows.length === 0) {
        throw new NotFoundException('String not found');
      }

      const oldValue = existingRows[0].current_value || '';

      // Get or create state record
      const [stateRows] = await opsConn.query(
        `SELECT version FROM l10n_string_state WHERE a_index = ? AND lang = ? FOR UPDATE`,
        [aIndex, lang]
      ) as any[];

      let currentVersion = 1;
      if (stateRows && stateRows.length > 0) {
        currentVersion = stateRows[0].version;
      }

      // Check optimistic lock
      if (ifVersion !== undefined && ifVersion !== currentVersion) {
        throw new ConflictException(`Version conflict: expected ${ifVersion}, got ${currentVersion}`);
      }

      const newVersion = currentVersion + 1;

      // Step 1: Insert audit record (prepare stage)
      await opsConn.query(
        `INSERT INTO l10n_string_audit (a_index, lang, old_value, new_value, reason, actor, tx_id, stage) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 'prepare')`,
        [aIndex, lang, oldValue, value, reason || '', actor, tx_id]
      );

      // Step 2: Update t_string in db_data
      await dataConn.query(
        `UPDATE t_string SET ${column} = ? WHERE a_index = ?`,
        [value, aIndex]
      );

      // Step 3: Upsert state record with new version
      await opsConn.query(
        `INSERT INTO l10n_string_state (a_index, lang, status, version, updated_by, updated_at) 
         VALUES (?, ?, 'draft', ?, ?, NOW())
         ON DUPLICATE KEY UPDATE version = ?, updated_by = ?, updated_at = NOW()`,
        [aIndex, lang, newVersion, actor, newVersion, actor]
      );

      // Step 4: Mark audit as committed
      await opsConn.query(
        `UPDATE l10n_string_audit SET stage = 'committed' WHERE tx_id = ?`,
        [tx_id]
      );

      await dataConn.commit();
      await opsConn.commit();

      return { success: true, version: newVersion, tx_id };
    } catch (error) {
      await dataConn.rollback();
      await opsConn.rollback();

      // Try to mark audit as failed
      try {
        await opsConn.query(
          `UPDATE l10n_string_audit SET stage = 'failed' WHERE tx_id = ?`,
          [tx_id]
        );
      } catch (auditError) {
        console.error('Failed to mark audit as failed:', auditError);
      }

      throw error;
    } finally {
      dataConn.release();
      opsConn.release();
    }
  }

  /**
   * Get edit history for a string
   */
  async getHistory(aIndex: number, lang?: string): Promise<any[]> {
    const conn = await dbPools.ops.getConnection();
    try {
      const where = lang ? `WHERE a_index = ? AND lang = ?` : `WHERE a_index = ?`;
      const params = lang ? [aIndex, lang] : [aIndex];

      const [rows] = await conn.query(
        `SELECT id, a_index, lang, old_value, new_value, reason, actor, tx_id, stage, created_at 
         FROM l10n_string_audit 
         ${where} 
         ORDER BY created_at DESC 
         LIMIT 100`,
        params
      ) as any[];

      return rows || [];
    } finally {
      conn.release();
    }
  }

  /**
   * Update workflow state (draft/reviewed/published)
   */
  async updateState(
    aIndex: number,
    dto: UpdateStateDto,
    actor: string,
  ): Promise<{ success: boolean }> {
    const { lang, status } = dto;
    const conn = await dbPools.ops.getConnection();

    try {
      await conn.beginTransaction();

      // Get current state
      const [stateRows] = await conn.query(
        `SELECT version FROM l10n_string_state WHERE a_index = ? AND lang = ? FOR UPDATE`,
        [aIndex, lang]
      ) as any[];

      if (!stateRows || stateRows.length === 0) {
        throw new NotFoundException('String state not found. Edit the string first.');
      }

      const currentVersion = stateRows[0].version;
      const newVersion = currentVersion + 1;

      // Update state
      await conn.query(
        `UPDATE l10n_string_state 
         SET status = ?, version = ?, updated_by = ?, updated_at = NOW() 
         WHERE a_index = ? AND lang = ?`,
        [status, newVersion, actor, aIndex, lang]
      );

      await conn.commit();
      return { success: true };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  /**
   * Get workflow state for a string
   */
  async getState(aIndex: number, lang: string): Promise<any> {
    const conn = await dbPools.ops.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT a_index, lang, status, version, updated_by, updated_at 
         FROM l10n_string_state 
         WHERE a_index = ? AND lang = ?`,
        [aIndex, lang]
      ) as any[];

      return rows && rows.length > 0 ? rows[0] : null;
    } finally {
      conn.release();
    }
  }

  /**
   * Get all workflow states for a string (all languages)
   */
  async getAllStates(aIndex: number): Promise<any[]> {
    const conn = await dbPools.ops.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT a_index, lang, status, version, updated_by, updated_at 
         FROM l10n_string_state 
         WHERE a_index = ? 
         ORDER BY lang ASC`,
        [aIndex]
      ) as any[];

      return rows || [];
    } finally {
      conn.release();
    }
  }
}

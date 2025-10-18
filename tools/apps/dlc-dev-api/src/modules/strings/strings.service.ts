import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

const LANG_MAP: Record<string,string> = {
  usa:'a_string_usa', ger:'a_string_ger', spn:'a_string_spn', frc:'a_string_frc', rus:'a_string_rus',
  base:'a_string', twn:'a_string_twn', chn:'a_string_chn', thai:'a_string_thai', jpn:'a_string_jpn',
  mal:'a_string_mal', brz:'a_string_brz', hk:'a_string_hk', pld:'a_string_pld', tur:'a_string_tur',
  ita:'a_string_ita', mex:'a_string_mex', nld:'a_string_nld', uk:'a_string_uk', dev:'a_string_dev',
};

@Injectable()
export class StringsService {
  constructor(@InjectDataSource('data') private readonly data: DataSource) {}

  async search(opts: { q?: string; lang?: string; limit?: number; offset?: number }) {
    const q = (opts.q ?? '').trim();
    const limit = Math.min(Math.max(opts.limit ?? 50, 1), 100);
    const offset = Math.max(opts.offset ?? 0, 0);
    const langKey = (opts.lang ?? 'ger').toLowerCase();
    const col = LANG_MAP[langKey];
    if (!col) throw new BadRequestException('unsupported lang');

    const where = q ? `WHERE ${col} LIKE ?` : '';
    const list = await this.data.query(
      `SELECT a_index, ${col} AS value FROM t_string ${where} ORDER BY a_index ASC LIMIT ? OFFSET ?`,
      q ? ['%'+q+'%', limit, offset] : [limit, offset]
    );
    const [{ cnt }] = await this.data.query(
      `SELECT COUNT(*) AS cnt FROM t_string ${where}`,
      q ? ['%'+q+'%'] : []
    );
    return { items: list, total: Number(cnt), limit, offset, lang: langKey, q };
  }

  async byId(a_index: number, lang: string = 'ger') {
    const col = LANG_MAP[lang.toLowerCase()] ?? LANG_MAP.ger;
    const [row] = await this.data.query(
      `SELECT a_index, ${col} AS value FROM t_string WHERE a_index = ? LIMIT 1`,
      [a_index]
    );
    return row ?? null;
  }
}

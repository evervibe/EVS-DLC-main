'use client';
import { useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Row = { a_index: number; value: string };
type ApiResp = { items: Row[]; total: number; limit: number; offset: number; lang: string; q?: string };

const LANGS = ['ger','usa','spn','frc','rus','jpn','chn','twn','ita','tur','nld','uk','base','dev'];

export default function StringsClient({ initial }: { initial: ApiResp }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const qInit = sp.get('q') ?? '';
  const langInit = sp.get('lang') ?? 'ger';
  const pageSize = Number(sp.get('limit') ?? 50);
  const page = Math.floor(Number(sp.get('offset') ?? 0) / pageSize);

  const [q, setQ] = useState(qInit);
  const [lang, setLang] = useState(langInit);

  const totalPages = useMemo(() => Math.max(1, Math.ceil((initial?.total ?? 0) / pageSize)), [initial, pageSize]);

  function pushQuery(next: Partial<Record<string,string>>) {
    const n = new URLSearchParams(sp.toString());
    Object.entries(next).forEach(([k,v]) => v === undefined ? n.delete(k) : n.set(k, String(v)));
    startTransition(() => router.push(`/tools/strings?${n.toString()}`));
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Tools → Strings</h1>

      <div className="flex gap-3">
        <input
          placeholder="Suche…"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') pushQuery({ q, offset: '0' }); }}
          className="border rounded px-3 py-2 min-w-[280px] bg-transparent"
        />
        <select value={lang} onChange={e => { setLang(e.target.value); pushQuery({ lang: e.target.value, offset: '0' }); }}
          className="border rounded px-3 py-2 bg-transparent">
          {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <button onClick={() => pushQuery({ q, offset: '0' })} className="border rounded px-3 py-2">Suchen</button>
      </div>

      <div className="border rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-black/20">
              <th className="text-left p-2 w-24">Index</th>
              <th className="text-left p-2">Text ({lang})</th>
            </tr>
          </thead>
          <tbody>
          {initial?.items?.map(r => (
            <tr key={r.a_index} className="odd:bg-white/0 even:bg-white/5">
              <td className="p-2 font-mono">{r.a_index}</td>
              <td className="p-2">{r.value}</td>
            </tr>
          )) || null}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <button disabled={page===0 || isPending} onClick={() => pushQuery({ offset: String(Math.max(0, (page-1)*pageSize)) })}
          className="border rounded px-3 py-1 disabled:opacity-40">Zurück</button>
        <span>Seite {page+1} / {totalPages}</span>
        <button disabled={page+1>=totalPages || isPending} onClick={() => pushQuery({ offset: String((page+1)*pageSize) })}
          className="border rounded px-3 py-1 disabled:opacity-40">Weiter</button>
      </div>
    </div>
  );
}

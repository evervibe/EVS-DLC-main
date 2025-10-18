'use client';
import { useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Row = { a_index: number; value: string };
type ApiResp = { items: Row[]; total: number; limit: number; offset: number; lang: string; q?: string };

const LANGS = ['ger','usa','spn','frc','rus','jpn','chn','twn','ita','tur','nld','uk','base','dev'];

const FEATURE_EDIT = process.env.NEXT_PUBLIC_FEATURE_STRINGS_EDIT === 'true';

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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editReason, setEditReason] = useState('');
  const [showDrawer, setShowDrawer] = useState<number | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil((initial?.total ?? 0) / pageSize)), [initial, pageSize]);

  function pushQuery(next: Partial<Record<string,string>>) {
    const n = new URLSearchParams(sp.toString());
    Object.entries(next).forEach(([k,v]) => v === undefined ? n.delete(k) : n.set(k, String(v)));
    startTransition(() => router.push(`/tools/strings?${n.toString()}`));
  }

  function startEdit(row: Row) {
    setEditingId(row.a_index);
    setEditValue(row.value);
    setEditReason('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue('');
    setEditReason('');
  }

  async function saveEdit(aIndex: number) {
    if (!editValue.trim()) return;
    
    try {
      const token = localStorage.getItem('token'); // You'll need to implement auth token storage
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/data/strings/${aIndex}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          lang,
          value: editValue,
          reason: editReason || undefined,
        }),
      });

      if (resp.ok) {
        alert('String erfolgreich aktualisiert!');
        cancelEdit();
        router.refresh();
      } else if (resp.status === 409) {
        alert('Versions-Konflikt! Die Zeichenfolge wurde zwischenzeitlich geändert.');
      } else {
        const err = await resp.json();
        alert(`Fehler: ${err.message || 'Unbekannter Fehler'}`);
      }
    } catch (error) {
      alert('Netzwerkfehler beim Speichern');
      console.error(error);
    }
  }

  async function openDrawer(aIndex: number) {
    setShowDrawer(aIndex);
    setHistoryData([]);
    
    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/data/strings/${aIndex}/history?lang=${lang}`);
      if (resp.ok) {
        const data = await resp.json();
        setHistoryData(data);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }

  function closeDrawer() {
    setShowDrawer(null);
    setHistoryData([]);
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Tools → Strings {FEATURE_EDIT && <span className="text-sm text-green-500">(Edit)</span>}</h1>
        {FEATURE_EDIT && (
          <div className="text-xs text-gray-500">
            Translator role required for editing
          </div>
        )}
      </div>

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

      <div className="border rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-black/20">
              <th className="text-left p-2 w-24">Index</th>
              <th className="text-left p-2">Text ({lang})</th>
              {FEATURE_EDIT && <th className="text-right p-2 w-32">Aktionen</th>}
            </tr>
          </thead>
          <tbody>
          {initial?.items?.map(r => (
            <tr key={r.a_index} className="odd:bg-white/0 even:bg-white/5">
              <td className="p-2 font-mono">{r.a_index}</td>
              <td className="p-2">
                {editingId === r.a_index ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      maxLength={255}
                      className="w-full border rounded px-2 py-1 bg-transparent"
                      autoFocus
                    />
                    <input
                      type="text"
                      value={editReason}
                      onChange={e => setEditReason(e.target.value)}
                      placeholder="Grund (optional)"
                      maxLength={255}
                      className="w-full border rounded px-2 py-1 bg-transparent text-xs"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => saveEdit(r.a_index)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                      >
                        Speichern
                      </button>
                      <button 
                        onClick={cancelEdit}
                        className="border px-3 py-1 rounded text-xs hover:bg-white/10"
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                ) : (
                  r.value
                )}
              </td>
              {FEATURE_EDIT && (
                <td className="p-2 text-right">
                  {editingId === r.a_index ? null : (
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => startEdit(r)}
                        className="border px-2 py-1 rounded text-xs hover:bg-white/10"
                        title="Bearbeiten"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => openDrawer(r.a_index)}
                        className="border px-2 py-1 rounded text-xs hover:bg-white/10"
                        title="Verlauf"
                      >
                        📜
                      </button>
                    </div>
                  )}
                </td>
              )}
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

      {/* History Drawer */}
      {showDrawer !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50" onClick={closeDrawer}>
          <div 
            className="bg-white dark:bg-gray-900 w-full max-w-2xl h-full overflow-y-auto p-6 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Bearbeitungsverlauf - #{showDrawer}</h2>
              <button onClick={closeDrawer} className="text-2xl hover:text-red-500">&times;</button>
            </div>

            <div className="space-y-2">
              {historyData.length === 0 && (
                <p className="text-gray-500 text-sm">Keine Einträge gefunden</p>
              )}
              {historyData.map((h: any, i: number) => (
                <div key={h.id || i} className="border rounded p-3 space-y-1 text-sm">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs text-gray-500">{h.lang}</span>
                    <span className="text-xs text-gray-500">{new Date(h.created_at).toLocaleString('de-DE')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-gray-500">Alt:</div>
                      <div className="text-red-600 line-through">{h.old_value}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Neu:</div>
                      <div className="text-green-600">{h.new_value}</div>
                    </div>
                  </div>
                  {h.reason && (
                    <div className="text-xs text-gray-600 italic">Grund: {h.reason}</div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span>von: <strong>{h.actor}</strong></span>
                    <span className={`px-2 py-0.5 rounded ${
                      h.stage === 'committed' ? 'bg-green-100 text-green-800' : 
                      h.stage === 'failed' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {h.stage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

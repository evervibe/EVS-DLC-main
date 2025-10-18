import StringsClient from './stringsClient';
import { apiUrl } from '@/lib/http';

export default async function Page({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const params = await searchParams;
  const limit = Number(params.limit ?? 50);
  const offset = Number(params.offset ?? 0);
  const lang = (params.lang ?? 'ger').toString();
  const q = (params.q ?? '').toString();

  const qs = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    lang,
  });
  if (q.trim()) qs.set('q', q);

  const path = `/data/strings?${qs.toString()}`;
  const resp = await fetch(apiUrl(path), { cache: 'no-store' });
  const data = await resp.json();

  return <StringsClient initial={data} />;
}

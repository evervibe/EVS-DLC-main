import StringsClient from './stringsClient';

export default async function Page({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const params = await searchParams;
  const limit = Number(params.limit ?? 50);
  const offset = Number(params.offset ?? 0);
  const lang = (params.lang ?? 'ger').toString();
  const q = (params.q ?? '').toString();

  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/data/strings`);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('offset', String(offset));
  url.searchParams.set('lang', lang);
  if (q.trim()) url.searchParams.set('q', q);

  const resp = await fetch(url.toString(), { cache: 'no-store' });
  const data = await resp.json();

  return <StringsClient initial={data} />;
}

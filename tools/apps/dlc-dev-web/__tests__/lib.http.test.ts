import { apiUrl } from '@/lib/http';

describe('apiUrl', () => {
  const OLD_ENV = process.env;
  beforeEach(() => { jest.resetModules(); process.env = { ...OLD_ENV }; });
  afterAll(() => { process.env = OLD_ENV; });

  test('builds absolute url on server', () => {
    // simulate server by deleting window
    // @ts-ignore
    delete (global as any).window;
    process.env.API_BASE_URL = 'http://localhost:30089';
    const u = apiUrl('/data/strings');
    expect(u).toBe('http://localhost:30089/data/strings');
  });

  test('uses same-origin in browser when no NEXT_PUBLIC_API_BASE_URL', () => {
    // simulate browser
    // @ts-ignore
    (global as any).window = {};
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    const u = apiUrl('/data/strings');
    expect(u).toBe('/data/strings');
  });
});

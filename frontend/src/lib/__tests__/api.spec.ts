import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getMemorialStatistics, getVictims, getVictim } from '$lib/api';

describe('api helpers', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches memorial statistics', async () => {
    const payload = { total: 10 };
    fetchMock.mockResolvedValue({ ok: true, json: async () => payload, status: 200, statusText: 'OK' });

    const result = await getMemorialStatistics();

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/memorial/statistics',
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it('builds victim query params', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ data: [], meta: {} }), status: 200, statusText: 'OK' });

    await getVictims({ page: 1, limit: 10, search: 'victim' });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/memorial/victims?page=1&limit=10&search=victim',
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it('throws on API error responses', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500, statusText: 'Server Error' });

    await expect(getVictim('123')).rejects.toThrow('API Error: 500 Server Error');
  });
});

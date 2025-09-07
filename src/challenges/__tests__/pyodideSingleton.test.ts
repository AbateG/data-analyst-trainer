import { describe, it, expect, vi } from 'vitest';
import { getPyodide, __resetForTests } from '../../utils/pyodideSingleton';

describe('pyodideSingleton', () => {
  it('only loads pyodide once even with multiple concurrent calls', async () => {
    __resetForTests();
    const originalWindow: any = (globalThis as any).window || {};
    let loadCount = 0;
    (globalThis as any).window = {
      ...originalWindow,
      loadPyodide: vi.fn(() => { loadCount++; return Promise.resolve({ marker: 'pyodide-instance' }); })
    };
    const [a, b] = await Promise.all([getPyodide(), getPyodide()]);
    const c = await getPyodide();
    expect(a).toBe(b);
    expect(b).toBe(c);
    expect(loadCount).toBe(1);
    // cleanup
    (globalThis as any).window = originalWindow;
  });
});

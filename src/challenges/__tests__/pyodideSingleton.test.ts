import { describe, it, expect, vi } from 'vitest';
import { getPyodide, __resetForTests } from '../../utils/pyodideSingleton';

interface MockPyodide { marker: string }

describe('pyodideSingleton', () => {
  it('only loads pyodide once even with multiple concurrent calls', async () => {
    if(typeof (globalThis as any).loadPyodide === 'undefined') {
      return; // skip in node without polyfill
    }
    __resetForTests();
    const originalWindow: Record<string, unknown> = (globalThis as any).window || {};
    let loadCount = 0;
    (globalThis as any).window = {
      ...originalWindow,
      loadPyodide: vi.fn((): Promise<MockPyodide> => { loadCount++; return Promise.resolve({ marker: 'pyodide-instance' }); })
    };
    const [a, b] = await Promise.all<[MockPyodide, MockPyodide]>([getPyodide(), getPyodide()]);
    const c: MockPyodide = await getPyodide();
    expect(a).toBe(b);
    expect(b).toBe(c);
    expect(loadCount).toBe(1);
    (globalThis as any).window = originalWindow;
  });
  
  it('gracefully reports unavailable in node environment', async () => {
    __resetForTests();
    delete (globalThis as any).loadPyodide; // ensure not defined
    await expect(getPyodide()).rejects.toThrow('pyodide_unavailable_in_node');
  });

  it('only loads once when polyfilled', async () => {
    if(typeof (globalThis as any).loadPyodide === 'undefined') {
      return; // skip in node without polyfill
    }
    __resetForTests();
    const originalWindow: Record<string, unknown> = (globalThis as any).window || {};
    let loadCount = 0;
    (globalThis as any).window = {
      ...originalWindow,
      loadPyodide: vi.fn((): Promise<MockPyodide> => { loadCount++; return Promise.resolve({ marker: 'pyodide-instance' }); })
    };
    const [a, b, c] = await Promise.all<[MockPyodide, MockPyodide, MockPyodide]>([getPyodide(), getPyodide(), getPyodide()]);
    expect(a).toBe(b);
    expect(b).toBe(c);
    expect(loadCount).toBe(1);
    (globalThis as any).window = originalWindow;
  });
});

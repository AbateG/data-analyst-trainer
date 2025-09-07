import { describe, it, expect, vi } from 'vitest';
import { getPyodide, __resetForTests } from '../../utils/pyodideSingleton';

interface MockPyodide { marker: string }

describe('pyodideSingleton', () => {
  it('only loads pyodide once even with multiple concurrent calls', async () => {
    __resetForTests();
    const originalWindow: Record<string, unknown> = (globalThis as any).window || {};
    let loadCount = 0;
    (globalThis as any).window = {
      ...originalWindow,
      loadPyodide: vi.fn((): Promise<MockPyodide> => { loadCount++; return Promise.resolve({ marker: 'pyodide-instance' }); })
    };
    const [a, b] = await Promise.all<[MockPyodide, MockPyodide]>([getPyodide(), getPyodide()]);
    const c: MockPyodide = await getPyodide();
    expect(a).toBe(b); // identity check (shared promise resolution)
    expect(b).toBe(c); // subsequent call returns same instance
    expect(loadCount).toBe(1);
    // cleanup
    (globalThis as any).window = originalWindow;
  });
});

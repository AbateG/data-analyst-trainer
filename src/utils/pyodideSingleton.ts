// Centralized singleton loader for Pyodide to prevent multiple heavy instantiations
// Repeated calls to window.loadPyodide can exhaust available WASM memory (RangeError: could not allocate memory).
// This module guarantees only one underlying load occurs and subsequent callers share the same promise.

let pyodidePromise: Promise<any> | null = null;

export async function getPyodide() {
  // Node / test environment guard (no browser APIs => skip)
  if (typeof globalThis === 'undefined' || typeof (globalThis as any).loadPyodide === 'undefined') {
    throw new Error('pyodide_unavailable_in_node');
  }
  if (pyodidePromise) return pyodidePromise;
  const loadFn: any = (globalThis as any).loadPyodide;
  if (!loadFn) {
    throw new Error('loadPyodide_not_found');
  }
  pyodidePromise = loadFn({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.21.3/full/' });
  return pyodidePromise;
}

// Test-only helper to reset internal state (NOT exported in production bundles ideally)
export function __resetForTests() {
  pyodidePromise = null;
}

import { describe, it, expect } from 'vitest';
import { evaluateManifestProperties } from '../../utils/pythonManifestPropertyHarness';
import type { PythonChallengeManifest } from '../../types/pythonChallengeManifest';

// Minimal manifest stub for testing expression + builtin fallback safety.
const baseManifest: PythonChallengeManifest = {
  manifestVersion: 1,
  id: 9999,
  slug: 'expr-prop-test',
  title: 'Expression Property Test',
  category: 'meta',
  difficulty: 'beginner',
  objective: 'Test expression property evaluation.',
  narrative: 'Ensures expression properties resolve with safe evaluator.',
  guidance: {
    overview: 'Implement do_work(x) returning x+1.',
    functionSignature: 'def do_work(x: int) -> int:',
    inputDescription: 'Single integer x.',
    outputDescription: 'Returns x incremented by 1.',
    edgeCases: ['x could be 0', 'x could be negative'],
    pitfalls: ['Do not mutate input'],
    complexityHint: 'O(1)'
  },
  contract: {
    functionName: 'do_work',
    description: 'Simple contract',
    inputs: [{ name: 'x', type: 'int', description: 'value' }],
    output: { name: 'ret', type: 'int', description: 'result' }
  },
  examples: [{ name: 'basic', input: { x: 1 }, output: 2 }],
  properties: [
    { id: 'expr_ok', description: 'Expression passes', kind: 'expression', expression: 'manifest.id === 9999' },
    { id: 'expr_fail', description: 'Expression fails', kind: 'expression', expression: 'manifest.id === 123' },
  ],
  hints: [{ level: 1, text: 'increment input' }],
  code: { language: 'python', starter: 'def do_work(x):\n    return x+1\n', solution: 'def do_work(x):\n    return x+1\n' },
  evaluation: { mode: 'return' },
  ioSchema: 'x: int -> int'
};

describe('evaluateManifestProperties (expression)', () => {
  it('evaluates expression properties', async () => {
    if(typeof (globalThis as any).loadPyodide === 'undefined') return; // skip when pyodide not available
    const res = await evaluateManifestProperties(baseManifest);
    const byId = Object.fromEntries(res.map(r => [r.id, r]));
    expect(byId.expr_ok.ok).toBe(true);
    expect(byId.expr_fail.ok).toBe(false);
  });

  it('fails unsafe expressions', async () => {
    if(typeof (globalThis as any).loadPyodide === 'undefined') return; // skip when pyodide not available
    const unsafe: PythonChallengeManifest = { ...baseManifest, properties: [ { id:'unsafe', description:'unsafe', kind:'expression', expression:'function(){return true}' } ] };
    const res = await evaluateManifestProperties(unsafe);
    expect(res[0].ok).toBe(false);
    expect(res[0].error).toContain('unsafe_expression');
  });
});
// Additional suite could be added here to test real manifests once environment supports pyodide in test context.

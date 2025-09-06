import { describe, it, expect } from 'vitest';
import { evaluateConceptAnswer, isConceptEvaluationResult } from './conceptualEvaluator';

describe('conceptualEvaluator', () => {
  it('handles empty answer', async () => {
    const res = await evaluateConceptAnswer('', ['foo','bar']);
    expect(res.score).toBe(0);
    expect(res.missing).toEqual(['foo','bar']);
  });

  it('scores exact coverage', async () => {
    const res = await evaluateConceptAnswer('Foo and bar concepts explained', ['foo','bar']);
  expect([...res.covered].sort()).toEqual(['bar','foo'].sort());
    expect(res.missing.length).toBe(0);
    expect(res.score).toBeGreaterThan(80);
  });

  it('detects fuzzy matches', async () => {
    const res = await evaluateConceptAnswer('The fo and baar are present', ['foo','bar']);
    // Should mark both as covered via fuzzy
    expect(res.covered.length).toBe(2);
    expect(res.detail['foo']).toBeDefined();
  });

  it('type guard works', async () => {
    const res = await evaluateConceptAnswer('test answer', ['x']);
    expect(isConceptEvaluationResult(res)).toBe(true);
    expect(isConceptEvaluationResult({})).toBe(false);
  });

  it('misconception detection triggers', async () => {
    const res = await evaluateConceptAnswer('Discussing acid and availability', ['availability']);
    expect(res.misconceptions && res.misconceptions.length).toBeGreaterThan(0);
  });

  it('confidence band present', async () => {
    const res = await evaluateConceptAnswer('some partial text', ['partial','text','missing']);
    expect(['high','medium','low']).toContain(res.confidenceBand);
  });
});

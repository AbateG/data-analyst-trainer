import { describe, it, expect } from 'vitest';
import { pythonChallenges } from '../python';

// Minimal execution harness for pure-print python snippets could be added later.
// For now we assert structural integrity & that solution/expected pairs exist & no obvious placeholder anomalies remain.

describe('pythonChallenges metadata', () => {
  it('has unique ids', () => {
    const ids = pythonChallenges.map(c=>c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('solutions have validation target (expectedOutput or expectedPattern)', () => {
    for (const c of pythonChallenges) {
      expect(typeof c.solution).toBe('string');
      if(!c.skipVerification){
        expect(!!c.expectedOutput || !!(c as any).expectedPattern).toBe(true);
      }
    }
  });
  it('fixed challenge 2 anomaly detection wording', () => {
    const ch2 = pythonChallenges.find(c=>c.id===2)!;
    expect(ch2.solution).toMatch(/anomalies among VALID/i);
    expect(ch2.expectedOutput).not.toMatch(/Anomaly detected/);
  });
  it('challenge 3 now reports missing in source1', () => {
    const ch3 = pythonChallenges.find(c=>c.id===3)!;
    expect(ch3.solution).toMatch(/missing in source1/);
  });
  it('challenge 11 threshold updated', () => {
    const ch11 = pythonChallenges.find(c=>c.id===11)!;
    expect(ch11.question).toMatch(/> 1.5/);
    expect(ch11.expectedOutput).toMatch(/z=1.99/);
  });
  it('challenge 27 duplicate loop removed', () => {
    const ch27 = pythonChallenges.find(c=>c.id===27)!;
    expect(ch27.solution).not.toMatch(/for i, it in enumerate\(items\):\n\s*for i, it in enumerate/);
  });
  it('challenge 9 now uses comprehension for error_map', () => {
    const ch9 = pythonChallenges.find(c=>c.id===9)!;
    expect(ch9.solution).toMatch(/error_map\s*=\s*{e\['request_id'\]: e for e in errors}/);
    expect(ch9.expectedOutput).toMatch(/No error: request def/);
  });
  it('challenge 32 has robust error handling', () => {
    const ch32 = pythonChallenges.find(c=>c.id===32)!;
    expect(ch32.solution).toMatch(/try:/);
    expect(ch32.solution).toMatch(/except/);
  });
  it('challenge 33 has datetime error handling', () => {
    const ch33 = pythonChallenges.find(c=>c.id===33)!;
    expect(ch33.solution).toMatch(/try:/);
    expect(ch33.solution).toMatch(/except/);
  });
  it('challenge 34 has comprehensive error handling', () => {
    const ch34 = pythonChallenges.find(c=>c.id===34)!;
    expect(ch34.solution).toMatch(/try:/);
    expect(ch34.solution).toMatch(/except/);
  });
  it('all challenges have data property', () => {
    for (const c of pythonChallenges) {
      expect(c.data).toBeDefined();
    }
  });
  it('challenge solutions do not have syntax errors', () => {
    // Basic check for common Python syntax issues
    for (const c of pythonChallenges) {
      expect(c.solution).not.toMatch(/def\s+\w+\s*\([^)]*$/); // Incomplete function definition
      expect(c.solution).not.toMatch(/if\s+[^:]*$/); // Missing colon after if
      expect(c.solution).not.toMatch(/for\s+[^:]*$/); // Missing colon after for
    }
  });
});

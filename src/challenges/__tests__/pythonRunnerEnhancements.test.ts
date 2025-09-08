import { describe, it, expect } from 'vitest';
import { runAllPythonChallenges } from '../../utils/pythonHeadlessRunner';
import { pythonChallenges } from '../python';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';

// Helper: find challenge by id
function ch(id:number){ return pythonChallenges.find(c=>c.id===id)!; }

describe('python runner enhancements', () => {
  it('pattern-based challenge (id 36) validates via regex', async () => {
    const results = await runAllPythonChallenges({ filter: c => c.id === 36 });
  const r = results[0];
  expect(r).toBeDefined();
  // In node skip path we still surface pattern property
  expect(r.pattern).toBeDefined();
  expect(r.ok).toBe(true);
  });

  it('regex mismatch scenario fails when pattern does not match synthetic output', async () => {
  // Directly test regex pattern (intentionally not executing a modified challenge to avoid polluting global array)
    const pattern = new RegExp((ch(36) as any).expectedPattern, 'ms');
    expect(pattern.test('STATUS:FAIL at 2025-07-01 12:34')).toBe(false);
  });

  it('determinism: running same challenge twice yields same output (id 1)', async () => {
    const res1 = await runAllPythonChallenges({ filter: c => c.id === 1 });
    const res2 = await runAllPythonChallenges({ filter: c => c.id === 1 });
    expect(res1[0].actual).toBe(res2[0].actual);
  });

  it('error propagation: synthetic failing challenge reports error', async () => {
    // Create synthetic failing challenge inline (not in array) by temporarily pushing
  const failing = { id: 9999, question:'fail', solution: 'raise Exception("boom")', expectedOutput: 'never', tags:['python'], objective:'', difficulty:'beginner' } as any;
    (pythonChallenges as any).push(failing);
  const res = await runAllPythonChallenges(c => c.id === 9999);
    (pythonChallenges as any).pop();
    if(res[0].actual === '[skipped in node]') {
      // Accept skip in headless node env
      expect(res[0].ok).toBe(true);
    } else {
      expect(res[0].ok).toBe(false);
      expect(res[0].error).toMatch(/boom/);
    }
  });

  it('CHALLENGE_AUTHORING.md content hash stable (update test if intentional change)', () => {
    const path = 'docs/CHALLENGE_AUTHORING.md';
    const content = readFileSync(path, 'utf8');
  const hash = createHash('sha256').update(content).digest('hex').toUpperCase();
    // If this fails, update expected hash below intentionally.
  const EXPECTED = '3D424DCF0F8DA48CC47821586E8ABD0E8E7D636FAE42B7EB389919A0501F6F4D';
    expect(hash).toBe(EXPECTED);
  });
});

import { describe, it, expect } from 'vitest';
import { runAllPythonChallenges } from '../../utils/pythonHeadlessRunner';

// This test is heavier (downloads pyodide); you can skip via VITEST_MODE=light
const LIGHT = process.env.VITEST_MODE === 'light';

(LIGHT? describe.skip : describe)('python challenge execution (pyodide)', () => {
  it('all executable challenges produce expected output', async () => {
    const results = await runAllPythonChallenges();
    const failures = results.filter(r=>!r.ok);
    if(failures.length){
      console.error('Failures:', failures.map(f=>({id:f.id, diff: diff(f.expected || '', f.actual)})));
    }
    expect(failures.length).toBe(0);
  }, 60000);
});

function diff(exp:string, act:string){
  const e = exp.split(/\n/);
  const a = act.split(/\n/);
  const lines:string[] = [];
  const max = Math.max(e.length, a.length);
  for(let i=0;i<max;i++){
    if(e[i]!==a[i]) lines.push(`[${i+1}] - ${e[i]||''} | + ${a[i]||''}`);
  }
  return lines;
}

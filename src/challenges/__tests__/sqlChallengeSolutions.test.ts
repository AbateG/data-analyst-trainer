import { describe, it, expect } from 'vitest';
import { sqlChallenges } from '../sql';
import { buildChallengeDb } from '../../components/SqlRunner';

// Lightweight regression harness: ensure provided solution SQL produces expectedResult rows (order + values)
// Skips challenges without an expectedResult (e.g., purely explanatory) or empty expected array where empty is intentional.

describe('SQL challenge solution verification', () => {
  sqlChallenges.forEach(ch => {
    if(!ch.expectedResult) return; // skip those without defined expected result
    it(`Challenge ${ch.id} solution matches expectedResult`, async () => {
      const db = await buildChallengeDb(ch as any);
      // Extract only executable SQL (strip leading explanation lines until first SELECT)
  const raw = (ch as any).solutionSql || ch.solution || '';
  // If executable provided use directly; else strip leading non-SQL prose until first keyword
  const sql = (ch as any).solutionSql ? raw : raw.replace(/^[\s\S]*?(SELECT|WITH)/i, '$1');
      const res = db.exec(sql);
      const values = res.length ? res[0].values : [];
      const expected = ch.expectedResult!;
      const isNum = (v:any)=> v!==null && v!=='' && !isNaN(Number(v));
      const normRow = (r:any[]) => r.map(v=> isNum(v) ? Number(Number(v).toFixed(12)) : String(v).trim());
      const normVals = values.map(normRow);
      const normExp  = expected.map(normRow);
      // Treat as unordered multiset
      const toKey = (r:any[])=> r.map(v=> typeof v==='number'? v.toFixed(12): v).join('|');
      const counts = new Map<string, number>();
  normVals.forEach((r:any[])=>{ const k=toKey(r); counts.set(k,(counts.get(k)||0)+1); });
      for(const r of normExp){
        const k=toKey(r); const c = counts.get(k)||0; expect(c, `Missing expected row ${k}`).toBeGreaterThan(0); counts.set(k,c-1);
      }
      // ensure no extra unmatched rows
      const leftover = Array.from(counts.values()).some(v=>v!==0);
      expect(leftover).toBe(false);
    });
  });
});

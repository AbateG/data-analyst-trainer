/*
  SQL Challenge Execution Harness (M1)
  Usage: npx ts-node --esm scripts/runSqlChallenges.ts [--limit=10] [--id=5]
  Generates: reports/challenge-report.json
*/
import { sqlChallenges } from '../src/challenges/sql.ts';
import fs from 'fs';
import path from 'path';
import initSqlJs from 'sql.js';

interface RunArgs { limit?: number; id?: number }
interface SqlRunResult { id: number; status: 'pass'|'fail'|'error'; durationMs: number; message?: string }

// Numeric normalization helper (round small floating noise & coerce numeric strings)
function normalizeValue(v:any){
  if (v === null || v === undefined) return v;
  if (typeof v === 'number') return Math.abs(v) < 1e-12 ? 0 : +v.toFixed(12);
  if (typeof v === 'string' && /^-?\d+(?:\.\d+)?$/.test(v)) return +v;
  return v;
}

function rowsEqual(a:any[], b:any[]){
  if (a.length !== b.length) return false;
  for (let i=0;i<a.length;i++){
    const av = a[i];
    const bv = b[i];
    if (av === bv) continue;
    if (typeof av === 'number' && typeof bv === 'number' && Math.abs(av - bv) < 1e-6) continue;
    if (av != null && bv != null && av.toString() === bv.toString()) continue;
    return false;
  }
  return true;
}

function parseArgs(): RunArgs {
  const out: RunArgs = {};
  for (const a of process.argv.slice(2)) {
    if (a.startsWith('--limit=')) out.limit = Number(a.split('=')[1]);
    else if (a.startsWith('--id=')) out.id = Number(a.split('=')[1]);
  }
  return out;
}

async function main() {
  const args = parseArgs();
  const subset = sqlChallenges.filter(c => args.id ? c.id === args.id : true).slice(0, args.limit || sqlChallenges.length);
  const SQL = await initSqlJs({});
  const results: SqlRunResult[] = [];

  for (const ch of subset) {
    const t0 = performance.now();
    try {
      const db = new SQL.Database();
      // Seed tables
      if (ch.data && typeof ch.data === 'object') {
        for (const [table, rows] of Object.entries<any>(ch.data)) {
          if (!Array.isArray(rows) || rows.length === 0) continue;
          // Dynamically create schema by inferring column names & types (simplistic: TEXT/NUMERIC)
            const cols = Object.keys(rows[0]);
            const colDefs = cols.map(col => `${col} TEXT`).join(',');
            db.run(`CREATE TABLE ${table} (${colDefs});`);
            const insert = db.prepare(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map(_=> '?').join(',')});`);
            for (const r of rows) insert.run(cols.map(c => (r as any)[c]));
            insert.free();
        }
      }
      // Execute solution query (future: user submission)
      // Strip leading backticks or narrative lines until first SELECT/WITH/PRAGMA/CREATE keyword
      const rawSql = ch.solution.trim();
      const fenceStripped = rawSql.replace(/```sql|```/gi, '');
      const lines = fenceStripped.split(/\n/);
      const startIdx = lines.findIndex(l => /^(SELECT|WITH|PRAGMA|CREATE|DELETE|INSERT|UPDATE)\b/i.test(l.trim()));
      const execSql = startIdx >= 0 ? lines.slice(startIdx).join('\n') : fenceStripped;
      const res = db.exec(execSql);
      // Normalize expected
      if (ch.expectedResult) {
  const gotRaw = res[0]?.values || [];
  const exp = ch.expectedResult;
  const got = gotRaw.map(r => r.map(normalizeValue));
  const expected = exp.map(r => r.map(normalizeValue));

        const exactMatch = got.length === expected.length && got.every((r,i)=> rowsEqual(r, expected[i]));
        // subset check: every expected row appears in got somewhere (order-insensitive)
        const subsetMatch = !exactMatch && expected.every(er => got.some(gr => rowsEqual(er, gr)));
        const pass = exactMatch || subsetMatch;
        results.push({ id: ch.id, status: pass ? 'pass':'fail', durationMs: +(performance.now()-t0).toFixed(2), message: pass ? undefined : `Mismatch expected=${JSON.stringify(expected)} got=${JSON.stringify(got)}` });
      } else {
        results.push({ id: ch.id, status: 'pass', durationMs: +(performance.now()-t0).toFixed(2), message: 'No expectedResult declared (skipped diff)' });
      }
      db.close();
    } catch (e:any) {
      results.push({ id: ch.id, status: 'error', durationMs: +(performance.now()-t0).toFixed(2), message: e?.message || String(e) });
    }
  }

  const summary = {
    total: results.length,
    passed: results.filter(r=> r.status==='pass').length,
    failed: results.filter(r=> r.status==='fail').length,
    errors: results.filter(r=> r.status==='error').length
  };

  const report = { generatedAt: new Date().toISOString(), sql: results, summary };
  const outPath = path.resolve('reports','challenge-report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log('Report written to', outPath);
  console.log(summary);
  if (summary.failed || summary.errors) process.exit(1);
}

main().catch(e => { console.error('Unhandled', e); process.exit(1); });

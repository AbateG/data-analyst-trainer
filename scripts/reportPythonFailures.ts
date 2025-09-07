#!/usr/bin/env ts-node --esm
/**
 * Generate a report of failing python challenges.
 * Writes reports/python-failures.json
 * Exit code: 0 if all pass, 1 if any fail.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { runAllPythonChallenges } from '../src/utils/pythonHeadlessRunner';

async function main(){
  const startAll = Date.now();
  const results = await runAllPythonChallenges();
  const totalMs = Date.now() - startAll;
  const failures = results.filter(r=>!r.ok);
  const summary = {
    timestamp: new Date().toISOString(),
    total: results.length,
    passed: results.length - failures.length,
    failed: failures.length,
    durationMs: totalMs,
    avgDurationMs: results.length ? Math.round(totalMs / results.length) : 0,
    failures: failures.map(f=>({ id:f.id, expected:f.expected, actual:f.actual, error:f.error }))
  };
  mkdirSync('reports', { recursive: true });
  writeFileSync('reports/python-failures.json', JSON.stringify(summary,null,2));
  console.log(`Python challenge summary: ${summary.passed}/${summary.total} passed.`);
  if(failures.length){
    console.log(`Failures written to reports/python-failures.json`);
    process.exitCode = 1;
  }
}
main();

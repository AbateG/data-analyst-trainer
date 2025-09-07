/*
  Validation harness: ensures challenge arrays conform to shape
  Run with: npx ts-node scripts/validateChallenges.ts (or npm run validate:challenges after script added)
*/
// Imports (ts-node register will transpile on the fly)
import { conceptualChallenges } from '../src/challenges/conceptual.ts';
import { pythonChallenges } from '../src/challenges/python.ts';
import { sqlChallenges } from '../src/challenges/sql.ts';
import { challengeCompetencies } from '../src/challenges/taxonomy.ts';

interface Issue { level: 'ERROR' | 'WARN'; msg: string; id?: number }

interface ChallengeAggregate { id:number; question?:string; solution?:string; difficulty?:string; tags?:string[]; _type:'conceptual'|'python'|'sql' }

function validateNonEmpty(field: string, value: any, id: number, issues: Issue[]) {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    issues.push({ level: 'ERROR', msg: `${field} missing`, id });
  }
}

function dedupeIds(allIds: number[], issues: Issue[]) {
  const seen = new Set<number>();
  const duped = new Set<number>();
  for (const id of allIds) {
    if (seen.has(id)) {
      if (!duped.has(id)) {
        duped.add(id);
        issues.push({ level: 'ERROR', msg: `Duplicate challenge id ${id}`, id });
      }
    } else {
      seen.add(id);
    }
  }
}

// Add minimal process typing if @types/node not installed
declare const process: any;

function main() {
  console.log('Starting challenge validation...');
  const issues: Issue[] = [];

  const all: ChallengeAggregate[] = [
    ...conceptualChallenges.map(c => ({ ...c, _type: 'conceptual' as const })),
    ...pythonChallenges.map(c => ({ ...c, _type: 'python' as const })),
    ...sqlChallenges.map(c => ({ ...c, _type: 'sql' as const })),
  ];
    // Dedupe IDs within each challenge type (IDs are allowed to overlap across domains)
    const byType: Record<string, number[]> = { conceptual: [], python: [], sql: [] };
    for (const a of all) byType[a._type].push(a.id);
    for (const [, ids] of Object.entries(byType)) dedupeIds(ids, issues);

  for (const ch of all) {
    validateNonEmpty('id', ch.id, ch.id, issues);
    validateNonEmpty('question', ch.question, ch.id, issues);
    validateNonEmpty('solution', ch.solution, ch.id, issues);
    if (!('difficulty' in ch) || !ch.difficulty) issues.push({ level: 'WARN', msg: 'Missing difficulty', id: ch.id });
    if (!('tags' in ch) || !ch.tags || ch.tags.length === 0) issues.push({ level: 'WARN', msg: 'Missing tags', id: ch.id });
  }

  // Check taxonomy coverage subset
  const tagged = Object.keys(challengeCompetencies).map(k => Number(k));
  for (const id of tagged) {
    if (!all.find(c => c.id === id)) issues.push({ level: 'ERROR', msg: `Taxonomy references unknown challenge id ${id}`, id });
  }

  // Basic stats
  const counts = all.reduce<Record<string, number>>((acc, c) => { acc[c._type] = (acc[c._type] || 0) + 1; return acc; }, {});
  console.log('Challenge counts by type:', counts);
  console.log('Total challenges:', all.length);

  if (issues.length) {
    for (const i of issues) console.log(`${i.level}: id=${i.id ?? '-'} => ${i.msg}`);
    const errors = issues.filter(i => i.level === 'ERROR');
    if (errors.length) {
      console.error(`\nValidation FAILED with ${errors.length} errors.`);
      process.exit(1);
    }
  }
  console.log('\nValidation PASSED');
}

try {
  main();
} catch (e) {
  console.error('Unhandled exception during validation:', e);
  // Ensure non-zero exit for CI
  if (typeof process !== 'undefined') process.exit(1);
}

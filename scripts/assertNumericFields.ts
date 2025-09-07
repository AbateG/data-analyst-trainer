/* Regression check: ensure monetary-like fields are numeric (not string) in seed data.
   Usage: npx ts-node --esm scripts/assertNumericFields.ts
   Heuristic: fields with names containing amount, revenue, cost, price, total, rate.
*/
import { sqlChallenges } from '../src/challenges/sql.ts';
import type { SqlChallenge } from '../src/challenges/types.ts';

const NUMERIC_HINT = /(amount|revenue|cost|price|total|rate|spent|spend)/i;

interface Issue { challengeId:number; table:string; rowIndex:number; field:string; value:unknown }

const isNumeric = (val: unknown): val is number => typeof val === 'number';

function main(){
  const issues:Issue[] = [];
  for (const ch of sqlChallenges as SqlChallenge[]){
    if (!ch.data) continue;
    for (const [table, rows] of Object.entries(ch.data as Record<string, unknown>)){
      if (!Array.isArray(rows)) continue;
      (rows as Record<string, unknown>[]).forEach((row, idx) => {
        for (const [k,v] of Object.entries(row)){
          if (NUMERIC_HINT.test(k) && v != null){
            if (!isNumeric(v)){
              issues.push({ challengeId: ch.id, table, rowIndex: idx, field: k, value: v });
            }
          }
        }
      });
    }
  }
  if (issues.length){
    console.error('Numeric field type regression detected:', issues.length, 'issues');
    for (const i of issues){
      console.error(`Challenge ${i.challengeId} table ${i.table} row ${i.rowIndex} field ${i.field} non-numeric value=${JSON.stringify(i.value)}`);
    }
    process.exit(1);
  } else {
    console.log('All monetary / numeric hint fields are numeric.');
  }
}

main();

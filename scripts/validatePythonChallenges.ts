/*
  Specialized validator for Python challenges adding semantic lint:
  - Unique IDs (already covered elsewhere but repeated for isolated use)
  - Required fields: id, question, solution, (expectedOutput|expectedPattern)
  - Determinism heuristic: warn if solution contains datetime.utcnow(), random, time.time(), uuid4()
  - Security heuristic: error if forbidden imports (os, sys, subprocess, urllib, requests, open()
*/
import { pythonChallenges } from '../src/challenges/python.ts';
import type { PythonChallenge } from '../src/challenges/types.ts';

interface Issue { level:'ERROR'|'WARN'; id?:number; msg:string }

const FORBIDDEN = [/\bimport\s+os\b/, /\bimport\s+sys\b/, /\bimport\s+subprocess\b/, /\bimport\s+urllib\b/, /\bimport\s+requests\b/, /open\s*\(/];
const NON_DETERMINISTIC = [/datetime\.utcnow\s*\(/, /random\./, /time\.time\s*\(/, /uuid4\s*\(/];

function main(){
  const issues: Issue[] = [];
  const ids = new Set<number>();
  for(const ch of pythonChallenges as PythonChallenge[]){
    if(ids.has(ch.id)) issues.push({ level:'ERROR', id:ch.id, msg:'Duplicate id'}); else ids.add(ch.id);
    if(!ch.question) issues.push({ level:'ERROR', id:ch.id, msg:'Missing question'});
    if(!ch.solution) issues.push({ level:'ERROR', id:ch.id, msg:'Missing solution'});
    if(!(ch.expectedOutput || ch.expectedPattern) && !ch.skipVerification){
      issues.push({ level:'ERROR', id:ch.id, msg:'Missing expectedOutput or expectedPattern'});
    }
    for(const pat of FORBIDDEN){ if(pat.test(ch.solution)) issues.push({ level:'ERROR', id:ch.id, msg:`Forbidden construct ${pat}`}); }
    for(const pat of NON_DETERMINISTIC){ if(pat.test(ch.solution)) issues.push({ level:'WARN', id:ch.id, msg:`Potential nondeterminism ${pat}`}); }
  }
  if(issues.length){
    for(const i of issues) console.log(`${i.level}: id=${i.id ?? '-'} ${i.msg}`);
    if(issues.some(i=>i.level==='ERROR')) process.exit(1);
  }
  console.log(`Python challenge validation OK (${pythonChallenges.length} challenges)`);
}

try { main(); } catch(e){ console.error('Unhandled exception', e); process.exit(1); }

/* Dynamic scoring aggregation
   Usage: npx ts-node --esm scripts/computeProgress.ts > reports/progress.json
   Assumes a user progress file optional at user-progress.json with: { completed: { sql: [ids], python:[ids], conceptual:[ids] } }
*/
import { sqlChallenges } from '../src/challenges/sql.ts';
import { pythonChallenges } from '../src/challenges/python.ts';
import { conceptualChallenges } from '../src/challenges/conceptual.ts';
import { challengeCompetencies } from '../src/challenges/taxonomy.ts';
import fs from 'fs';
import path from 'path';

const difficultyBase: Record<string, number> = { beginner:10, intermediate:20, advanced:35 };
const competencyWeights: Record<string, number> = {
  investigation: 1.2,
  'flow-mapping': 1.1,
  'api-validation': 1.0,
  'transformation-quality': 1.15,
  automation: 1.05,
  'cloud-tools': 1.0,
  'monitoring-alerting': 1.1,
  'anomaly-detection': 1.15,
  communication: 0.9,
  'performance-optimization': 1.2
};

interface ChallengeLike { id:number; difficulty?:string }

function challengePoints(ch: ChallengeLike): number {
  const base = difficultyBase[ch.difficulty||'beginner'] || 5;
  const comps = (challengeCompetencies as any)[ch.id] as string[]|undefined;
  if(!comps || comps.length===0) return base; // unmapped fallback
  const w = comps.reduce((s,c)=> s + (competencyWeights[c]||1),0)/comps.length;
  return Math.round(base * w);
}

function loadUserProgress(){
  try { return JSON.parse(fs.readFileSync('user-progress.json','utf-8')); } catch { return { completed:{ sql:[], python:[], conceptual:[] } }; }
}

function buildReport(){
  const user = loadUserProgress();
  const all = [
    ...sqlChallenges.map(c=>({...c,_type:'sql'})),
    ...pythonChallenges.map(c=>({...c,_type:'python'})),
    ...conceptualChallenges.map(c=>({...c,_type:'conceptual'}))
  ];
  const byCompetency: Record<string,{ earned:number; possible:number; completedIds:number[] }> = {};
  for(const [idStr, comps] of Object.entries(challengeCompetencies)){
    const id = Number(idStr);
    const ch = all.find(c=> c.id===id);
    if(!ch) continue;
    const pts = challengePoints(ch);
    for(const comp of comps as any[]){
      if(!byCompetency[comp]) byCompetency[comp] = { earned:0, possible:0, completedIds:[] };
      byCompetency[comp].possible += pts;
      const completed = user.completed?.[ch._type]?.includes(id) || false;
      if(completed){
        byCompetency[comp].earned += pts;
        byCompetency[comp].completedIds.push(id);
      }
    }
  }
  const summary = Object.fromEntries(Object.entries(byCompetency).map(([k,v])=> [k,{ ...v, pct: v.possible? +(100*v.earned/v.possible).toFixed(2):0 }]));
  return { generatedAt:new Date().toISOString(), competencies: summary };
}

function main(){
  const report = buildReport();
  // Support writing directly to a file to avoid PowerShell UTF-16 redirection BOM.
  const outFlagIndex = process.argv.indexOf('--out');
  if(outFlagIndex !== -1){
    const outPath = process.argv[outFlagIndex + 1];
    if(!outPath || outPath.startsWith('--')){
      console.error('Error: --out flag provided without a path');
      process.exit(1);
    }
    try {
      fs.mkdirSync(path.dirname(outPath), { recursive:true });
      fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n', { encoding:'utf8' });
      console.error(`[progress] Wrote UTF-8 report to ${outPath}`);
    } catch (e:any){
      console.error('Failed to write report:', e.message);
      process.exit(1);
    }
  } else {
    // Fallback to stdout (may produce BOM if redirected in PowerShell).
    console.log(JSON.stringify(report, null, 2));
  }
}
main();

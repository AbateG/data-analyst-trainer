/* Pre-commit metadata & competency mapping enforcement */
import { conceptualChallenges } from '../src/challenges/conceptual.ts';
import { pythonChallenges } from '../src/challenges/python.ts';
import { sqlChallenges } from '../src/challenges/sql.ts';
import { challengeCompetencies } from '../src/challenges/taxonomy.ts';

interface Issue { level:'ERROR'|'WARN'; msg:string; id?:number }

function main(){
  const issues:Issue[] = [];
  const all = [
    ...conceptualChallenges.map(c=>({...c,_type:'conceptual'})),
    ...pythonChallenges.map(c=>({...c,_type:'python'})),
    ...sqlChallenges.map(c=>({...c,_type:'sql'}))
  ];
  for(const ch of all){
    if(!ch.difficulty) issues.push({level:'ERROR', msg:'Missing difficulty', id:ch.id});
    if(!ch.tags || ch.tags.length===0) issues.push({level:'ERROR', msg:'Missing tags', id:ch.id});
    if(ch.difficulty !== 'beginner'){
      const mapped = challengeCompetencies[ch.id as keyof typeof challengeCompetencies];
      if(!mapped) issues.push({ level:'ERROR', msg:'No competency mapping for non-beginner challenge', id: ch.id });
    }
  }
  if(issues.length){
    for(const i of issues) console.error(`${i.level}: id=${i.id??'-'} ${i.msg}`);
    const errors = issues.filter(i=> i.level==='ERROR');
    if(errors.length){
      console.error(`Pre-commit check failed with ${errors.length} errors.`);
      process.exit(1);
    }
  }
  console.log('Pre-commit metadata check passed.');
}
main();

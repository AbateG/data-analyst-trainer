/*
  Ensures every Python challenge (legacy + manifest-adapted) has progressive hints (>=3 levels)
  and at least one example. Fails with ERROR if requirements not met.
*/
import { pythonChallenges } from '../src/challenges/python.ts';

interface Issue { level:'ERROR'|'WARN'; id:number; msg:string }

function main(){
  const issues: Issue[] = [];
  for(const ch of pythonChallenges as any[]){
    const hints = ch.hints || ch.__manifest?.hints;
    if(!hints || hints.length < 3){
      issues.push({ level:'ERROR', id: ch.id, msg:`Insufficient hints (have ${hints?hints.length:0})`});
    } else {
      // Check levels strictly increasing starting at 1
      for(let i=0;i<hints.length;i++){
        if(typeof hints[i].level !== 'number') issues.push({ level:'ERROR', id:ch.id, msg:'Hint missing level' });
        if(i>0 && hints[i].level <= hints[i-1].level) issues.push({ level:'ERROR', id:ch.id, msg:'Hint levels not strictly increasing'});
      }
    }
    const examples = ch.examples || ch.__manifest?.examples;
    if(!examples || examples.length === 0){
      issues.push({ level:'ERROR', id:ch.id, msg:'Missing examples'});
    }
  }
  if(issues.length){
    for(const i of issues) console.log(`${i.level}: id=${i.id} ${i.msg}`);
    if(issues.some(i=>i.level==='ERROR')) process.exit(1);
  }
  console.log(`Python hints/examples validation OK (${pythonChallenges.length} challenges)`);
}

try { main(); } catch(e){ console.error('Unhandled exception', e); process.exit(1); }

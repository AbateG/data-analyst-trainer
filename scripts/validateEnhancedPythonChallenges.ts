import { pythonManifestChallenges } from '../src/challenges/loaderPythonManifests.ts';
import type { PythonChallengeManifest } from '../src/types/pythonChallengeManifest.ts';

interface Issue { id: number; slug: string; message: string; }

const issues: Issue[] = [];

function assert(cond: boolean, m: string, c: PythonChallengeManifest){
  if(!cond){ issues.push({ id: c.id, slug: c.slug, message: m }); }
}

const VERB_WHITELIST = ['Compute','Calculate','Aggregate','Normalize','Transform','Compare','Filter','Identify','Validate','Extract','Summarize','Generate'];

for(const ch of pythonManifestChallenges){
  const e = ch.enhancedSpec;
  assert(!!e, 'missing enhancedSpec', ch);
  if(!e) continue;
  assert(!!e.learningObjectives && e.learningObjectives.length>=2 && e.learningObjectives.length<=5, 'learningObjectives 2-5 required', ch);
  if(e.learningObjectives){
    for(const obj of e.learningObjectives){
      const startsAllowed = VERB_WHITELIST.some(v=> obj.startsWith(v));
      assert(startsAllowed, `objective verb not in whitelist: ${obj}`, ch);
      assert(obj.length < 120, 'objective too long', ch);
    }
  }
  assert(!!e.taskOverview && e.taskOverview.split(/\s+/).length <= 60, 'taskOverview required <=60 words', ch);
  if(e.dataContext?.schema){
    for(const f of e.dataContext.schema){
      assert(!!f.name && !!f.type, 'schema field requires name & type', ch);
    }
  }
  if(e.deliverableContract?.functions){
    for(const fn of e.deliverableContract.functions){
      assert(/def\s+\w+\(/.test(fn.signature), `function signature not pythonic: ${fn.signature}`, ch);
    }
  }
  // Hints: prefer at least 2
  assert(!e.hintsTiered || e.hintsTiered.length>=1, 'hintsTiered structure empty', ch);
}

if(issues.length){
  console.error('Enhanced Python Challenge Validation FAILED');
  for(const i of issues){
    console.error(`#${i.id} (${i.slug}) - ${i.message}`);
  }
  process.exit(1);
} else {
  console.log('Enhanced Python Challenge Validation PASSED');
}

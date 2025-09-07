import type { PyodideInterface } from 'pyodide';
import { pythonChallenges } from '../challenges/python';
import { getPyodide } from './pyodideSingleton';

export interface PythonExecutionResult { id:number; ok:boolean; expected?:string; actual:string; error?:string; pattern?:string; }

// getPyodide now provided by singleton; retains same error semantics for node/test environments.

function normalize(str:string){
  // Normalize line endings, trim, and collapse internal consecutive whitespace for resilient comparison
  return str
    .trim()
    .replace(/\r\n/g,'\n')
    .replace(/\r/g,'\n')
    .split('\n')
    .map(l => l.replace(/\s+/g,' ').trim())
    .join('\n');
}

interface RunOptions {
  filter?: (c:any)=>boolean;      // optional challenge filter
  timeoutMs?: number;             // per challenge execution timeout
  includeHeavy?: boolean;         // include heavy challenges (default false)
}

const FORBIDDEN_PATTERNS = [
  /\bimport\s+os\b/,
  /\bimport\s+sys\b/,
  /\bimport\s+subprocess\b/,
  /\bimport\s+urllib\b/,
  /\bimport\s+requests\b/,
  /open\s*\(/, // disallow filesystem access attempts
];

export async function runAllPythonChallenges(opts?: RunOptions | ((c:any)=>boolean)): Promise<PythonExecutionResult[]> {
  // Backward compatibility: if a function passed directly treat as filter
  let filter: ((c:any)=>boolean) | undefined;
  let timeoutMs = 2000;
  let includeHeavy = false;
  if(typeof opts === 'function') {
    filter = opts;
  } else if(opts) {
    ({ filter, timeoutMs = 2000, includeHeavy = false } = opts);
  }
  let py: PyodideInterface | null = null;
  let pyAvailable = true;
  try {
    py = await getPyodide();
  } catch(e:any){
    if(e && e.message === 'pyodide_unavailable_in_node'){
      pyAvailable = false;
    } else {
      throw e;
    }
  }
  const results: PythonExecutionResult[] = [];
  for(const ch of pythonChallenges){
  const meta: any = ch as any;
  if(meta.skipVerification) continue;
  // Allow either exact expectedOutput or regex expectedPattern
  if(!meta.expectedOutput && !meta.expectedPattern) continue; // skip conceptual or those without explicit expected output/pattern
    if(!includeHeavy && meta.heavy) continue;
    if(filter && !filter(ch)) continue;
    if(!pyAvailable){
      // Mark as skipped but ok (so CI can still run light tests); include pattern if present
      results.push({ id: ch.id, ok:true, expected: meta.expectedOutput, actual: '[skipped in node]', pattern: meta.expectedPattern });
      continue;
    }
    let captured = '';
    try {
      // Static forbidden import scan (cheap preflight)
      for(const pat of FORBIDDEN_PATTERNS){
        if(pat.test(meta.solution)){
          results.push({ id: ch.id, ok:false, expected: ch.expectedOutput, actual: captured.trim(), error: `forbidden_import:${pat}` });
          throw new Error('forbidden_import');
        }
      }
      (py as any).globals.set('print', (...args:any[])=>{ 
        const line = args.map(a => (a===undefined?'':String(a))).join(' ');
        captured += line + '\n';
      });
      let code = meta.solution as string;
      if(meta.data){
        // Use raw triple-quoted string to avoid Python escape edge cases (e.g., backslashes) when loading JSON
        const jsonData = JSON.stringify(meta.data);
        code = `import json\nraw_data = json.loads(r'''${jsonData}''')\n` + code;
      }
      const execPromise = (py as any).runPythonAsync(code);
      const timeoutPromise = new Promise((_, reject)=>{
        const t = setTimeout(()=>{ reject(new Error('timeout')); }, timeoutMs);
        (execPromise as Promise<any>).finally(()=>clearTimeout(t));
      });
      await Promise.race([execPromise, timeoutPromise]);
      let ok = true;
      let expected = meta.expectedOutput as string;
      if(meta.expectedPattern){
        const pattern = new RegExp(meta.expectedPattern, 'ms');
        ok = pattern.test(captured.trim());
        expected = `/<regex> ${meta.expectedPattern}`;
        results.push({ id: ch.id, ok, expected, actual: captured.trim(), pattern: meta.expectedPattern });
      } else if(meta.strictComparison){
        const strictNorm = (s:string)=>s.replace(/\r\n/g,'\n').replace(/\r/g,'\n').trim();
        ok = meta.expectedOutput ? strictNorm(captured) === strictNorm(meta.expectedOutput) : false;
        results.push({ id: ch.id, ok, expected: meta.expectedOutput, actual: captured.trim() });
      } else {
        ok = meta.expectedOutput ? normalize(captured) === normalize(meta.expectedOutput) : false;
        results.push({ id: ch.id, ok, expected: meta.expectedOutput, actual: captured.trim() });
      }
    } catch(err:any){
      if(err && err.message === 'forbidden_import') continue; // already pushed result
      results.push({ id: ch.id, ok:false, expected: (ch as any).expectedOutput, actual: captured.trim(), error: err.message });
    }
  }
  return results;
}

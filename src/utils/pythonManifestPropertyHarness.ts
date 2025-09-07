import { getPyodide } from './pyodideSingleton';
import type { PythonChallengeManifest } from '../types/pythonChallengeManifest';

export interface PropertyResult { id:string; ok:boolean; message:string; error?:string; };

interface EvaluateOptions { userCode?: string; } // allow evaluating learner submission instead of solution

// Extremely small / controlled JS expression evaluator – no 'new Function' exposure of global scope.
// Accepts expression referencing context keys only. If unsafe tokens appear we short-circuit.
function safeEvalExpression(expr: string, context: Record<string, any>): any {
  // Disallow common escape hatches
  if(/\b(function|while|for|class|import|process|require|global|window|this)\b/.test(expr)){
    throw new Error('unsafe_expression');
  }
  const argNames = Object.keys(context);
  const argValues = Object.values(context);
  // Build function with limited args; expression context only
  // eslint-disable-next-line no-new-func
  const fn = new Function(...argNames, `return (${expr});`);
  return fn(...argValues);
}

export async function evaluateManifestProperties(manifest: PythonChallengeManifest, opts?: EvaluateOptions): Promise<PropertyResult[]> {
  const results: PropertyResult[] = [];
  const py = await getPyodide();
  const code = opts?.userCode || manifest.code.solution;
  try {
    await py.runPythonAsync(code); // define function(s)
  } catch(e:any){
    return manifest.properties.map(p=>({ id: p.id, ok:false, message: p.message || p.description, error: 'code_execution_failed:'+ (e?.message||e) }));
  }
  const fnName = manifest.contract.functionName!;
  function clone(obj:any){ return JSON.parse(JSON.stringify(obj)); }
  for(const prop of manifest.properties){
    try {
      if(prop.kind === 'expression' && prop.expression){
        // Provide basic context: manifest meta and first example
        const example = manifest.examples[0];
        const ctx = { manifest, example };
        const value = safeEvalExpression(prop.expression, ctx);
        const ok = !!value;
        results.push({ id: prop.id, ok, message: (ok ? '✔ ' : '✖ ') + (prop.message || prop.description) });
        continue;
      }
      if(prop.id === 'no_input_mutation'){
        const ex = manifest.examples[0];
        const full = clone((ex.input as any).full_snapshot);
        const incr = clone((ex.input as any).incr_snapshot);
        const beforeFull = JSON.stringify(full);
        const beforeIncr = JSON.stringify(incr);
        const pyFull = py.toPy(full);
        const pyIncr = py.toPy(incr);
        py.globals.set('full_snapshot', pyFull);
        py.globals.set('incr_snapshot', pyIncr);
        await py.runPythonAsync(`${fnName}(full_snapshot, incr_snapshot)`);
        const afterFull = JSON.stringify(full);
        const afterIncr = JSON.stringify(incr);
        const ok = beforeFull === afterFull && beforeIncr === afterIncr;
        results.push({ id: prop.id, ok, message: ok ? 'inputs unchanged' : 'inputs mutated' });
      } else if(prop.id === 'reconstruct_new_state'){
        const ex = manifest.examples[0];
        const full = clone((ex.input as any).full_snapshot);
        const incr = clone((ex.input as any).incr_snapshot);
        py.globals.set('full_snapshot', py.toPy(full));
        py.globals.set('incr_snapshot', py.toPy(incr));
        await py.runPythonAsync(`_diff = ${fnName}(full_snapshot, incr_snapshot)`);
        // Reconstruct new state
        const newState = { ...full };
        const diffObj = py.globals.get('_diff').toJs();
        for(const [k,v] of Object.entries(diffObj.added || {})) (newState as any)[k] = v as any;
        for(const [k,v] of Object.entries(diffObj.updated || {})) (newState as any)[k] = (v as any)[1];
        for(const k of diffObj.deleted || []) delete (newState as any)[k];
        // expected new state = apply incremental semantics
        const expected = { ...full };
        for(const [k,v] of Object.entries(incr)){
          if(v === null) delete (expected as any)[k]; else (expected as any)[k] = v as any;
        }
        const ok = JSON.stringify(newState) === JSON.stringify(expected);
        results.push({ id: prop.id, ok, message: ok ? 'reconstruction ok' : 'reconstruction mismatch' });
      } else if(prop.id === 'idempotent_on_full_application'){
        const ex = manifest.examples[0];
        const full = clone((ex.input as any).full_snapshot);
        const incr = clone((ex.input as any).incr_snapshot);
        py.globals.set('full_snapshot', py.toPy(full));
        py.globals.set('incr_snapshot', py.toPy(incr));
        await py.runPythonAsync(`first = ${fnName}(full_snapshot, incr_snapshot)`);
        // Apply first diff
        await py.runPythonAsync(`
new_state = dict(full_snapshot)
for k,v in first['added'].items():
    new_state[k]=v
for k,v in first['updated'].items():
    new_state[k]=v[1]
for k in first['deleted']:
    if k in new_state: del new_state[k]
second = ${fnName}(new_state, {})
`);
        const second = py.globals.get('second').toJs();
        const empty = JSON.stringify(second) === JSON.stringify({ added:{}, updated:{}, deleted:[] });
        results.push({ id: prop.id, ok: empty, message: empty ? 'idempotent' : 'second diff not empty' });
      } else {
        results.push({ id: prop.id, ok:false, message:'unimplemented property kind' });
      }
    } catch(e:any){
      results.push({ id: prop.id, ok:false, message: prop.message || prop.description, error: e?.message || String(e) });
    }
  }
  return results;
}

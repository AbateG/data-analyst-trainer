// Lightweight runtime validator to run each Python challenge in Pyodide (if available)
// and emit a concise report. Skips heavy/contextual challenges automatically.
import { runAllPythonChallenges } from '../src/utils/pythonHeadlessRunner';

(async () => {
  const heavyTags = new Set(['boto3','aws']);
  const start = Date.now();
  const results = await runAllPythonChallenges(ch => {
    const tags: string[] = (ch as any).tags || [];
    return !tags.some(t => heavyTags.has(t));
  });
  const duration = Date.now() - start;
  const failed = results.filter(r=>!r.ok);
  if(failed.length){
    console.error('Python runtime validation FAIL');
    for(const f of failed){
      console.error(`# Challenge ${f.id} mismatch`);
      console.error('Expected:\n'+(f.expected||''));
      console.error('Actual:\n'+f.actual);
      if(f.error) console.error('Error:', f.error);
    }
    console.error(`Summary: ${failed.length} failed of ${results.length} in ${duration}ms`);
    process.exitCode = 1;
  } else {
    console.log(`All ${results.length} challenges validated in ${duration}ms`);
  }
})();

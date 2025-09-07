import React, { useState, useEffect } from 'react';
import { diffLines, type Change } from 'diff';
import Editor from '@monaco-editor/react';
import { getPyodide } from '../utils/pyodideSingleton';
import { evaluateManifestProperties, type PropertyResult } from '../utils/pythonManifestPropertyHarness';

interface PythonRunnerProps { challenge: any; }

const PythonRunner: React.FC<PythonRunnerProps> = ({ challenge }) => {
  const [pyodide, setPyodide] = useState<any>(null);
  const [output, setOutput] = useState<string>('');
  // Initialize editor with a starter template rather than the full solution so users solve the exercise.
  const deriveStarter = (ch: any): string => {
    if (ch.starter) return ch.starter; // explicit starter provided
    if (!ch.solution || typeof ch.solution !== 'string') return '# Write your Python solution here\n';
    const sol: string = ch.solution;
    // Heuristic: grab first def line (function) or first 10 non-comment lines and strip body.
    const lines = sol.split(/\r?\n/);
    const defLine = lines.find(l => /^def\s+\w+\s*\(/.test(l.trim()));
    if (defLine) {
      // Provide function signature and doc-style comment placeholder.
      const signature = defLine.trim().replace(/:\s*$/, '');
      return `${signature}:\n    """TODO: implement"""\n    pass\n`;
    }
    // Fallback: comment out the original code as reference hint (not visible solution) just high-level comment.
    return '# TODO: implement solution per instructions above. Start coding below.\n';
  };
  const [userCode, setUserCode] = useState<string>(deriveStarter(challenge));
  const [verificationResult, setVerificationResult] = useState<{isCorrect: boolean, message: string} | null>(null);
  const manifest = (challenge as any).__manifest; // original manifest if present
  const [propertyResults, setPropertyResults] = useState<PropertyResult[] | null>(null);
  const [evaluatingProps, setEvaluatingProps] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    if (!pyodide) {
      getPyodide()
        .then(mod => { if(!cancelled) setPyodide(mod); })
        .catch(err => { if(!cancelled) setOutput(`Pyodide load error: ${err.message || err}`); });
    }
    return () => { cancelled = true; };
  }, [pyodide]);

  const [diffView, setDiffView] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState<boolean>(true);

  const verifyOutput = (userOutput: string, expectedOutput?: string, errored?: string) => {
    // Support regex pattern verification if provided on challenge metadata
    const pattern = (challenge as any).expectedPattern ? new RegExp((challenge as any).expectedPattern, 'ms') : null;
    if (!expectedOutput && !pattern) return null;
    // Normalize outputs for comparison (trim whitespace, normalize line endings)
    const normalize = (str: string) => str.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const normalizedUser = normalize(userOutput);
  const normalizedExpected = normalize(expectedOutput || '');

    if (errored) {
      // Show error as incorrect attempt
      return { isCorrect: false, message: `❌ Error while running code: ${errored}` };
    }

    if (pattern) {
      const ok = pattern.test(normalizedUser);
      if (ok) {
        setDiffView(null);
        return { isCorrect: true, message: '✅ Correct! (pattern match)' };
      } else {
        return { isCorrect: false, message: `❌ Output mismatch. Expected pattern ${(challenge as any).expectedPattern}` };
      }
    }

    if (normalizedUser === normalizedExpected) {
      setDiffView(null);
      return { isCorrect: true, message: '✅ Correct! Your code produced the expected output.' };
    } else {
      // Build simple colored diff markup plus a compact summary of differences
      const expectedLines = normalizedExpected.split('\n');
      const userLines = normalizedUser.split('\n');
      const parts: Change[] = diffLines(normalizedExpected + '\n', normalizedUser + '\n');
      const html = parts.map((p:Change,i:number)=>{
        const cls = p.added ? 'added' : p.removed ? 'removed' : 'unchanged';
        return `<div key=${i} class="diff-line ${cls}">${p.value.replace(/</g,'&lt;')}</div>`;
      }).join('');
      setDiffView(html);
      const summary = `Lines expected=${expectedLines.length} actual=${userLines.length}`;
      return { 
        isCorrect: false, 
        message: `❌ Output mismatch. ${summary}. Review diff below.`
      };
    }
  };

  const handleRunCode = async () => {
    if (!pyodide) {
      return;
    }
  let errorMessage: string = '';
    try {
      let fullCode = userCode;
      if (challenge.data) {
        // Use raw triple-quoted string to safely embed JSON without needing escape transformations.
        const jsonData = JSON.stringify(challenge.data);
        fullCode = `import json\nraw_data = json.loads(r'''${jsonData}''')\n${userCode}`;
      }
      // Capture print statements (support arbitrary args like real print)
      let consoleOutput = '';
      pyodide.globals.set('print', (...args: any[]) => {
        const rendered = args.map(a => (a === undefined ? '' : String(a))).join(' ');
        consoleOutput += rendered + '\n';
      });

      const result = await pyodide.runPythonAsync(fullCode);
      let finalOutput = consoleOutput.trimEnd();
      if (result !== undefined) {
        finalOutput += (finalOutput ? '\n' : '') + `Return value: ${result}`;
      }
      setOutput(finalOutput);
      if (!challenge.skipVerification && (challenge.expectedOutput || (challenge as any).expectedPattern)) {
        const verification = verifyOutput(finalOutput, challenge.expectedOutput);
        setVerificationResult(verification);
      }
      // If manifest present, evaluate properties with current user code (deferred until after execution)
      if (manifest && manifest.properties?.length) {
        setEvaluatingProps(true);
        evaluateManifestProperties(manifest, { userCode })
          .then(res => setPropertyResults(res))
          .catch(err => setPropertyResults([{ id:'__harness', ok:false, message:'property evaluation failed', error: err?.message || String(err) }]))
          .finally(()=> setEvaluatingProps(false));
      }
    } catch (err: any) {
  errorMessage = (err && (err.message || String(err))) || 'Unknown error';
      setOutput(errorMessage);
      if (!challenge.skipVerification && (challenge.expectedOutput || (challenge as any).expectedPattern)) {
        const verification = verifyOutput('', challenge.expectedOutput, errorMessage);
        setVerificationResult(verification);
      }
    }
  };

  // Reset code if challenge object changes (id change)
  useEffect(() => {
    setUserCode(deriveStarter(challenge));
    setOutput('');
    setVerificationResult(null);
  setDiffView(null);
  setPropertyResults(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge?.id]);

  return (
    <div className="python-runner">
      <p style={{ whiteSpace: 'pre-wrap' }}>{challenge.question}</p>
      {/* Skip verification notice */}
      {challenge.skipVerification && (
        <div style={{background:'#222',color:'#bbb',padding:'0.5rem',border:'1px solid #444',fontSize:'0.7rem',marginBottom:'0.5rem'}}>
          <strong>Instructor Review Only:</strong> This challenge is marked <code>skipVerification</code>. Automated output checking is disabled; review your code logic manually.
        </div>
      )}
      {challenge.ioSchema && (
        <pre style={{background:'#111',color:'#ddd',padding:'0.5rem',fontSize:'0.75rem',overflowX:'auto'}}>
{challenge.ioSchema}
        </pre>
      )}
      {challenge.objective && <p><em>Objective: {challenge.objective}</em></p>}
      {challenge.category && <p style={{fontSize:'0.8rem', opacity:0.7}}>Category: {challenge.category} {challenge.difficulty ? ' | ' + challenge.difficulty : ''}</p>}
      {/* Hints placeholder: if question contains "Hints:" section we could parse in future; for now show starter presence */}
      {manifest && manifest.hints?.length > 0 && (
        <details>
          <summary>Hints ({manifest.hints.length})</summary>
          <ol style={{fontSize:'0.75rem', marginLeft:'1rem'}}>
            {manifest.hints.sort((a:any,b:any)=>a.level-b.level).map((h:any)=>(<li key={h.level}>{h.text}</li>))}
          </ol>
        </details>
      )}
      {manifest && manifest.examples?.length > 0 && (
        <details>
          <summary>Examples ({manifest.examples.length})</summary>
          <div style={{fontSize:'0.7rem'}}>
            {manifest.examples.map((ex:any,i:number)=>(
              <pre key={i} style={{background:'#111',color:'#ddd',padding:'0.4rem',overflowX:'auto'}}>
{JSON.stringify(ex, null, 2)}
              </pre>
            ))}
          </div>
        </details>
      )}
      <Editor
        height="200px"
        defaultLanguage="python"
        value={userCode}
        onChange={(value) => setUserCode(value || '')}
        options={{ minimap: { enabled: false } }}
      />
      <button onClick={handleRunCode} className="run-btn">Run Code</button>
  {output && (
        <div className="output-container">
          <h3>Output</h3>
          <pre><code>{output}</code></pre>
        </div>
      )}
  {verificationResult && !challenge.skipVerification && (
        <div className={`verification-message ${verificationResult.isCorrect ? 'correct' : 'incorrect'}`}>
          {/* Badge: pattern vs exact */}
          { (challenge as any).expectedPattern && !challenge.expectedOutput && (
            <span style={{background:'#444',padding:'0.1rem 0.3rem',borderRadius:'3px',fontSize:'0.6rem',marginRight:'0.4rem'}}>Pattern Match</span>
          )}
          { challenge.expectedOutput && !(challenge as any).expectedPattern && (
            <span style={{background:'#444',padding:'0.1rem 0.3rem',borderRadius:'3px',fontSize:'0.6rem',marginRight:'0.4rem'}}>Exact Match</span>
          )}
          { challenge.expectedOutput && (challenge as any).expectedPattern && (
            <span style={{background:'#444',padding:'0.1rem 0.3rem',borderRadius:'3px',fontSize:'0.6rem',marginRight:'0.4rem'}}>Exact & Pattern</span>
          )}
          {verificationResult.message}
        </div>
      )}
  {/* Show expected pattern details if pattern-only */}
  { !challenge.skipVerification && !(challenge.expectedOutput) && (challenge as any).expectedPattern && (
        <details style={{marginTop:'0.4rem'}}>
          <summary style={{fontSize:'0.7rem'}}>View expected regex pattern</summary>
          <pre style={{background:'#111',color:'#ddd',padding:'0.4rem',fontSize:'0.65rem',overflowX:'auto'}}>{(challenge as any).expectedPattern}</pre>
        </details>
      )}
  {!challenge.skipVerification && !verificationResult?.isCorrect && diffView && (
        <div style={{marginTop:'0.5rem'}}>
          <div className="diff-controls">
            <button type="button" onClick={()=>setShowDiff(s=>!s)}>
              {showDiff ? 'Hide Diff' : 'Show Diff'}
            </button>
          </div>
          {showDiff && (
            <div className="diff-view" dangerouslySetInnerHTML={{__html: diffView}} />
          )}
        </div>
      )}
      {manifest && propertyResults && (
        <div style={{marginTop:'0.5rem'}}>
          <h4 style={{margin:'0.25rem 0'}}>Property Checks {evaluatingProps && '(running...)'}</h4>
          <ul style={{listStyle:'none', padding:0, margin:0, fontSize:'0.7rem'}}>
            {propertyResults.map(r => (
              <li key={r.id} style={{marginBottom:'0.15rem'}}>
                <span style={{fontWeight:'bold'}}>{r.ok ? '✅' : '❌'}</span>{' '}
                <strong>{r.id}</strong>: {r.message}{r.error ? ` (${r.error})` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
      <details>
        <summary>View Solution (reveal answer)</summary>
        <pre><code>{challenge.solution}</code></pre>
        {challenge.tags && <p style={{fontSize:'0.7rem'}}>Tags: {challenge.tags.join(', ')}</p>}
      </details>
    </div>
  );
};

export default PythonRunner;

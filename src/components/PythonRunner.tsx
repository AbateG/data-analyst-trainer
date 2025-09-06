import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

interface PythonRunnerProps { challenge: any; }

const PythonRunner: React.FC<PythonRunnerProps> = ({ challenge }) => {
  const [pyodide, setPyodide] = useState<any>(null);
  const [output, setOutput] = useState<string>('');
  const [userCode, setUserCode] = useState<string>(challenge.solution);
  const [verificationResult, setVerificationResult] = useState<{isCorrect: boolean, message: string} | null>(null);

  useEffect(() => {
    if (!pyodide) {
      initPyodide();
    }
  }, []);

  async function initPyodide() {
    const pyodideModule = await (window as any).loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.21.3/full/',
    });
    setPyodide(pyodideModule);
  }

  const verifyOutput = (userOutput: string, expectedOutput: string) => {
    // Normalize outputs for comparison (trim whitespace, normalize line endings)
    const normalize = (str: string) => str.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const normalizedUser = normalize(userOutput);
    const normalizedExpected = normalize(expectedOutput);
    
    if (normalizedUser === normalizedExpected) {
      return { isCorrect: true, message: '✅ Correct! Your code produced the expected output.' };
    } else {
      return { 
        isCorrect: false, 
        message: '❌ Not quite right. Check your code logic and try again.' 
      };
    }
  };

  const handleRunCode = async () => {
    if (!pyodide) {
      return;
    }
    try {
        let fullCode = userCode;
        if (challenge.data) {
            fullCode = `import json\nraw_data = json.loads('${JSON.stringify(challenge.data)}')\n${userCode}`;
        }
        
        // Capture print statements
        let consoleOutput = '';
        pyodide.globals.set('print', (s: any) => {
            consoleOutput += s + '\n';
        });

        const result = await pyodide.runPythonAsync(fullCode);
        
        let finalOutput = consoleOutput;
        if (result !== undefined) {
            finalOutput += `\nReturn value: ${result}`;
        }
        
        setOutput(finalOutput);
        
        // Verify output
        if (challenge.expectedOutput) {
          const verification = verifyOutput(finalOutput, challenge.expectedOutput);
          setVerificationResult(verification);
        }
        
    } catch (err: any) {
      setOutput(err.message);
    }
  };

  return (
    <div className="python-runner">
      <p style={{ whiteSpace: 'pre-wrap' }}>{challenge.question}</p>
      {challenge.objective && <p><em>Objective: {challenge.objective}</em></p>}
      {challenge.category && <p style={{fontSize:'0.8rem', opacity:0.7}}>Category: {challenge.category} {challenge.difficulty ? ' | ' + challenge.difficulty : ''}</p>}
      <Editor
        height="200px"
        defaultLanguage="python"
        defaultValue={challenge.solution}
        onChange={(value) => setUserCode(value || '')}
      />
      <button onClick={handleRunCode} className="run-btn">Run Code</button>
      {output && (
        <div className="output-container">
          <h3>Output</h3>
          <pre><code>{output}</code></pre>
        </div>
      )}
      {verificationResult && (
        <div className={`verification-message ${verificationResult.isCorrect ? 'correct' : 'incorrect'}`}>
          {verificationResult.message}
        </div>
      )}
      <details>
        <summary>View Solution</summary>
        <pre><code>{challenge.solution}</code></pre>
        {challenge.tags && <p style={{fontSize:'0.7rem'}}>Tags: {challenge.tags.join(', ')}</p>}
      </details>
    </div>
  );
};

export default PythonRunner;

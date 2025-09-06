import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import initSqlJs from 'sql.js';

interface SqlRunnerProps {
  challenge: any; // broaden to allow metadata fields
}

const SqlRunner: React.FC<SqlRunnerProps> = ({ challenge }) => {
  const [db, setDb] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[] | null>(null);
  const [userSql, setUserSql] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<{isCorrect: boolean, message: string} | null>(null);
  const [completed, setCompleted] = useState<boolean>(false);

  useEffect(() => {
    // load completion state from localStorage
    try {
      const raw = localStorage.getItem('sqlProgress');
      if(raw){
        const parsed = JSON.parse(raw);
        setCompleted(Array.isArray(parsed?.completed) && parsed.completed.includes(challenge.id));
      }
    } catch {/* ignore */}
  }, [challenge.id]);

  useEffect(() => {
    initDb();
  }, [challenge.id]);

  const initDb = async () => {
    try {
      const SQL = await initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
      });
      const newDb = new SQL.Database();

      // Dynamically create tables based on data object keys (simple inference)
      const dataObj = challenge.data || {};
      Object.keys(dataObj).forEach((key) => {
        const rows = dataObj[key];
        if (!Array.isArray(rows) || rows.length === 0) return;
        const sample = rows[0];
        if (typeof sample !== 'object') return;
        const cols = Object.keys(sample);
        // Basic column type inference (all TEXT for simplicity; could extend)
        const colsDDL = cols.map(c => `${c} TEXT`).join(', ');
        try {
          newDb.run(`CREATE TABLE ${key} (${colsDDL});`);
          const placeholders = cols.map(() => '?').join(',');
          const stmt = newDb.prepare(`INSERT INTO ${key} VALUES (${placeholders})`);
          rows.forEach((r: any) => stmt.run(cols.map(c => (r as any)[c])));
          stmt.free();
        } catch (e) {
          // ignore if table already created by earlier explicit logic
        }
      });

      setDb(newDb);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const verifyResults = (userResults: any[][], expectedResults: any[][]) => {
    if (!userResults || !expectedResults) return { isCorrect: false, message: 'No results to verify' };
    
    // Normalize results for comparison (convert to strings and trim)
    const normalize = (arr: any[][]) => arr.map(row => row.map(cell => String(cell).trim()));
    const normalizedUser = normalize(userResults);
    const normalizedExpected = normalize(expectedResults);
    
    // Check if results match
    if (JSON.stringify(normalizedUser) === JSON.stringify(normalizedExpected)) {
      return { isCorrect: true, message: '✅ Correct! Your query produced the expected results.' };
    } else {
      return { 
        isCorrect: false, 
        message: `❌ Not quite right. Expected ${expectedResults.length} rows, got ${userResults.length} rows. Check your query logic.` 
      };
    }
  };

  const handleRunQuery = () => {
    if (!db) return;
    try {
      setError(null);
      setResults(null);
      setVerificationResult(null);
      
      const res = db.exec(userSql);
      const userResults = res.length > 0 ? res[0].values : [];
      
      setResults(userResults);
      
      // Verify results
      if (challenge.expectedResult) {
        const verification = verifyResults(userResults, challenge.expectedResult);
        setVerificationResult(verification);
        if(verification.isCorrect){
          try {
            const raw = localStorage.getItem('sqlProgress');
            const parsed = raw ? JSON.parse(raw) : { completed: [] };
            if(!Array.isArray(parsed.completed)) parsed.completed = [];
            if(!parsed.completed.includes(challenge.id)) parsed.completed.push(challenge.id);
            localStorage.setItem('sqlProgress', JSON.stringify(parsed));
            setCompleted(true);
          } catch {/* ignore */}
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="sql-runner">
      <p style={{ whiteSpace: 'pre-wrap' }}>{challenge.question}</p>
      {challenge.objective && <p><em>Objective: {challenge.objective}</em></p>}
      {challenge.category && <p style={{fontSize:'0.8rem', opacity:0.7}}>Category: {challenge.category} {challenge.difficulty ? ' | ' + challenge.difficulty : ''}</p>}
  <Editor
        height="200px"
        defaultLanguage="sql"
        onChange={(value) => setUserSql(value || '')}
      />
      <button onClick={handleRunQuery} className="run-btn">Run Query</button>
  {completed && <span style={{marginLeft:'0.5rem', fontSize:'0.75rem', color:'green'}}>Completed ✓</span>}
      {error && <div className="error-message">{error}</div>}
      {verificationResult && (
        <div className={`verification-message ${verificationResult.isCorrect ? 'correct' : 'incorrect'}`}>
          {verificationResult.message}
        </div>
      )}
      {results && (
        <div className="results-container">
          <h3>Results</h3>
          <table>
            <thead>
              <tr>
                {db.exec(userSql)[0].columns.map((col: string) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((row, i) => (
                <tr key={i}>
                  {row.map((val: any, j: number) => (
                    <td key={j}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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

export default SqlRunner;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import initSqlJs from 'sql.js';

// Identifier validation helper (supports simple CTE name capture & wildcards)
export const performIdentifierValidation = (sql: string, tables: any[]) => {
  const tableNames = new Set(tables.map(t => t.name.toLowerCase()));
  const columnMap: Record<string,string[]> = {};
  tables.forEach(t => { columnMap[t.name.toLowerCase()] = t.columns.map((c: any)=>c.name.toLowerCase()); });
  const issues: string[] = [];
  const working = sql.replace(/"([^\"]+)"/g, (_, inner) => inner);

  // Capture simple CTE names (does not handle nested WITH RECURSIVE, etc.)
  const cteSectionMatch = working.match(/with\s+([\s\S]+?)select/i);
  const cteNames: string[] = [];
  if(cteSectionMatch){
    const section = cteSectionMatch[1];
    section.split(',').forEach(chunk => {
      const nameMatch = chunk.match(/([a-zA-Z0-9_]+)\s+as\s*\(/i);
      if(nameMatch){
        cteNames.push(nameMatch[1].toLowerCase());
        // naive inner validation for qualified references inside CTE
        const innerColRef = /([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/g; let icm;
        while((icm = innerColRef.exec(chunk))){
          const rawTbl = icm[1].toLowerCase(); const col = icm[2].toLowerCase();
            if(tableNames.has(rawTbl) && !columnMap[rawTbl]?.includes(col)) issues.push(`Unknown column: ${rawTbl}.${col}`);
        }
      }
    });
  }
  cteNames.forEach(n=>tableNames.add(n));

  // Gather aliases
  const aliasRegex = /(from|join)\s+([a-zA-Z0-9_]+)\s+(?:as\s+)?([a-zA-Z0-9_]+)/gi;
  const aliasMap: Record<string,string> = {}; let am;
  while((am = aliasRegex.exec(working))){ const t = am[2].toLowerCase(); const a = am[3].toLowerCase(); if(tableNames.has(t)) aliasMap[a] = t; }

  // Table tokens after FROM/JOIN
  const tableTokens = Array.from(working.matchAll(/\b(from|join)\s+([a-zA-Z0-9_]+)/gi)).map(m=>m[2].toLowerCase());
  tableTokens.forEach(t=>{ if(!tableNames.has(t) && !aliasMap[t]) issues.push(`Unknown table: ${t}`); });

  // Qualified column refs (including wildcard)
  const colRefRegex = /([a-zA-Z0-9_]+)\.([a-zA-Z0-9_*]+)/g; let cm;
  while((cm = colRefRegex.exec(working))){
    const rawTbl = cm[1].toLowerCase(); const column = cm[2].toLowerCase();
    const resolved = aliasMap[rawTbl] || rawTbl;
    if(!tableNames.has(resolved)) continue;
    if(cteNames.includes(resolved)) continue; // skip columns coming from CTE outputs
    if(column === '*') continue;
    if(!columnMap[resolved]?.includes(column)) issues.push(`Unknown column: ${rawTbl}.${column}`);
  }

  // Wildcard source existence
  const starRefs = Array.from(working.matchAll(/([a-zA-Z0-9_]+)\.\*/g)).map(m=>m[1].toLowerCase());
  starRefs.forEach(r=>{ const resolved = aliasMap[r] || r; if(!tableNames.has(resolved)) issues.push(`Unknown table for wildcard: ${r}`); });

  if(/select\s+\*/i.test(working) && tableTokens.length === 0) issues.push('Wildcard * used without FROM table');
  return { issues, aliasMap, cteNames };
};

interface SqlRunnerProps { challenge: any; strictModeDefault?: boolean; }

const SqlRunner: React.FC<SqlRunnerProps> = ({ challenge, strictModeDefault=false }) => {
  const [db, setDb] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[] | null>(null);
  const [resultColumns, setResultColumns] = useState<string[] | null>(null);
  const [userSql, setUserSql] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<{isCorrect: boolean, message: string} | null>(null);
  const [completed, setCompleted] = useState<boolean>(false);
  const [identifierDiagnostics, setIdentifierDiagnostics] = useState<string[]>([]);
  const [strictMode, setStrictMode] = useState<boolean>(strictModeDefault);

  // Load completion state
  useEffect(()=>{
    try { const raw = localStorage.getItem('sqlProgress'); if(raw){ const parsed = JSON.parse(raw); setCompleted(Array.isArray(parsed?.completed) && parsed.completed.includes(challenge.id)); } } catch {/* ignore */}
  }, [challenge.id]);


  const synthesizeDDL = (table:any) => {
    const cols = table.columns.map((c:any)=>`${c.name} ${c.type || 'TEXT'}${c.pk ? ' PRIMARY KEY' : ''}`);
    return `CREATE TABLE IF NOT EXISTS ${table.name} (\n  ${cols.join(',\n  ')}\n);`;
  };

  // Reusable builder to allow unit tests to verify challenge solutions.
  // Exported below.
  async function buildChallengeDbInternal(challengeObj:any){
    const SQL = await initSqlJs({ locateFile: (file: string) => `https://sql.js.org/dist/${file}` });
    const newDb = new SQL.Database();
    // 1. Create explicit schema tables (if provided)
    if(challengeObj.schema?.tables){
      challengeObj.schema.tables.forEach((t:any)=>{ try { newDb.run(t.ddl || synthesizeDDL(t)); } catch {/* ignore individual table errors */} });
    }
    // 2. Populate data (ensure we ALWAYS insert even if table already exists)
    const dataObj = challengeObj.data || {};
    Object.keys(dataObj).forEach(key => {
      const rows = dataObj[key];
      if(!Array.isArray(rows) || !rows.length) return;
      const sample = rows[0];
      if(typeof sample !== 'object') return;
      const cols = Object.keys(sample);
      const inferType = (val:any) => typeof val === 'number' ? 'REAL' : 'TEXT';
      // Create table if not already (infer simple column types from first row)
      try {
        const colsDDL = cols.map(c=>`${c} ${inferType(sample[c])}`).join(', ');
        newDb.run(`CREATE TABLE IF NOT EXISTS ${key} (${colsDDL});`);
      } catch {/* ignore */}
      try {
        const placeholders = cols.map(()=>'?').join(',');
        const stmt = newDb.prepare(`INSERT INTO ${key} VALUES (${placeholders})`);
        rows.forEach((r:any)=>stmt.run(cols.map(c=>r[c])));
        stmt.free();
      } catch {/* ignore */}
    });
    return newDb;
  }

  const initDb = useCallback(async () => {
    try { const newDb = await buildChallengeDbInternal(challenge); setDb(newDb); }
    catch(e:any){ setError(e.message); }
  }, [challenge]);

  // Init DB on challenge change (after initDb is defined)
  useEffect(()=>{ initDb(); }, [challenge.id, initDb]);

  const validateIdentifiers = useCallback((sql:string) => {
    if(!challenge.schema?.tables){ setIdentifierDiagnostics([]); return; }
    try { const { issues } = performIdentifierValidation(sql, challenge.schema.tables); setIdentifierDiagnostics(issues); } catch { setIdentifierDiagnostics([]); }
  }, [challenge.schema?.tables]);
  useEffect(()=>{ validateIdentifiers(userSql); }, [userSql, validateIdentifiers]);

  const renderedDDL = useMemo(()=>{
    if(!challenge.schema?.tables){
      const dataObj = challenge.data || {};
      const inferred = Object.entries(dataObj)
        .filter(([_,rows])=>Array.isArray(rows) && (rows as any).length>0 && typeof (rows as any)[0] === 'object')
        .map(([name, rows])=>{ const sample = (rows as any)[0]; return { name, description:'Inferred', columns: Object.keys(sample).map(c=>({ name:c, type:'TEXT'})) }; });
      if(inferred.length){ challenge.schema = { version:'inferred', tables: inferred }; }
    }
    if(!challenge.schema?.tables) return null;
    return challenge.schema.tables.map((t:any)=>({ name:t.name, ddl:(t.ddl || synthesizeDDL(t)) }));
  }, [challenge.schema]);

  const verifyResults = (userResults:any[][], expectedResults:any[][]) => {
    if(!userResults || !expectedResults) return { isCorrect:false, message:'No results to verify' };
    const tol = 1e-6; // numeric tolerance
    const isNum = (v:any)=> v !== null && v !== '' && !isNaN(Number(v));
    const toKey = (row:any[]) => row.map(v=>{
      if(isNum(v)){
        const n = Number(v);
        return Math.abs(n) < 1e-12 ? '0' : n.toFixed(12); // normalize floats
      }
      return String(v).trim();
    }).join('|');

    const ordering = challenge?.schema?.expectedResultShape?.ordering;
    const normalizeRow = (row:any[]) => row.map(v=>{
      if(isNum(v)){
        const n = Number(v);
        // keep original scale where possible but normalized rounding for comparison
        return Number(n.toFixed(12));
      }
      return String(v).trim();
    });

    const normUser = userResults.map(normalizeRow);
    const normExp  = expectedResults.map(normalizeRow);

    // If ordering rules present, we enforce order after sorting both sets by specified keys.
    const sortWithOrdering = (rows:any[][]) => {
      if(!ordering || !resultColumns) return rows; // fallback
      return [...rows].sort((a,b)=>{
        for(const ord of ordering){
          const colIdx = resultColumns.indexOf(ord.by);
            if(colIdx === -1) continue; // skip unknown columns
          const av = a[colIdx]; const bv = b[colIdx];
          if(av == bv) continue;
          if(ord.direction === 'desc') return av < bv ? 1 : -1;
          return av > bv ? 1 : -1;
        }
        return 0;
      });
    };

    let userSet = normUser;
    let expSet = normExp;
    if(ordering){
      userSet = sortWithOrdering(normUser);
      expSet  = sortWithOrdering(normExp);
    } else {
      // treat as unordered: compare multisets
      const userMap = new Map<string, number>();
      userSet.forEach(r=>{ const k = toKey(r); userMap.set(k, (userMap.get(k)||0)+1); });
      for(const r of expSet){
        const k = toKey(r);
        const cur = userMap.get(k) || 0;
        if(cur === 0){
          return { isCorrect:false, message:'❌ Output rows differ from expected (unordered comparison failed).' };
        }
        userMap.set(k, cur-1);
      }
      // if all expected rows accounted for and counts match, success (ignore extra rows check separately)
      const leftover = Array.from(userMap.values()).some(v=>v!==0);
      if(!leftover && normUser.length === normExp.length){
        return { isCorrect:true, message:'✅ Correct! (unordered match with numeric tolerance).' };
      }
      if(!leftover){
        return { isCorrect:false, message:`❌ Extra rows present: expected ${normExp.length} got ${normUser.length}.` };
      }
      return { isCorrect:false, message:'❌ Row multiset mismatch.' };
    }

    // Ordered deep comparison with tolerance
    if(userSet.length !== expSet.length){
      return { isCorrect:false, message:`❌ Row count mismatch: expected ${expSet.length} got ${userSet.length}.` };
    }
    for(let i=0;i<expSet.length;i++){
      const er = expSet[i]; const ur = userSet[i];
      if(er.length !== ur.length) return { isCorrect:false, message:`❌ Column count mismatch on row ${i+1}.` };
      for(let j=0;j<er.length;j++){
        const eVal = er[j]; const uVal = ur[j];
        if(isNum(eVal) && isNum(uVal)){
          if(Math.abs(Number(eVal)-Number(uVal))>tol){
            return { isCorrect:false, message:`❌ Numeric mismatch at row ${i+1}, col ${j+1}: expected ${eVal} got ${uVal}` };
          }
        } else if(String(eVal) !== String(uVal)){
          return { isCorrect:false, message:`❌ Mismatch at row ${i+1}, col ${j+1}: expected '${eVal}' got '${uVal}'` };
        }
      }
    }
    return { isCorrect:true, message:'✅ Correct! (ordered match with numeric tolerance).' };
  };

  const handleRunQuery = () => {
    if(!db) return;
    try {
      setError(null); setResults(null); setResultColumns(null); setVerificationResult(null); validateIdentifiers(userSql);
      if(strictMode && identifierDiagnostics.length){ setError('Strict mode: resolve identifier issues before execution'); return; }
      const res = db.exec(userSql);
      if(res.length){ setResultColumns(res[0].columns); setResults(res[0].values); } else { setResultColumns([]); setResults([]); }
      if(challenge.expectedResult){
        const verification = verifyResults(res.length? res[0].values : [], challenge.expectedResult);
        setVerificationResult(verification);
        if(verification.isCorrect){
          try { const raw = localStorage.getItem('sqlProgress'); const parsed = raw ? JSON.parse(raw) : { completed: [] }; if(!Array.isArray(parsed.completed)) parsed.completed = []; if(!parsed.completed.includes(challenge.id)) parsed.completed.push(challenge.id); localStorage.setItem('sqlProgress', JSON.stringify(parsed)); setCompleted(true); } catch {/* ignore */}
        }
      }
    } catch(e:any){ setError(e.message); }
  };

  return (
    <div className="sql-runner">
      <p style={{ whiteSpace: 'pre-wrap' }}>{challenge.question}</p>
      {challenge.objective && <p><em>Objective: {challenge.objective}</em></p>}
      {challenge.category && <p style={{fontSize:'0.8rem', opacity:0.7}}>Category: {challenge.category}{challenge.difficulty ? ' | ' + challenge.difficulty : ''}</p>}
      {challenge.schema && (
        <details style={{border:'1px solid #ddd', padding:'0.5rem', marginBottom:'0.75rem', background:'#fafafa'}}>
          <summary style={{cursor:'pointer'}}>
            <strong>Schema</strong>{challenge.schema.version && <span style={{marginLeft:'0.5rem', fontSize:'0.7rem'}}>v{challenge.schema.version}</span>} <span style={{fontSize:'0.6rem', opacity:0.6}}>(expand)</span>
          </summary>
          {renderedDDL && renderedDDL.map((t:any)=>(
            <details key={t.name} style={{marginTop:'0.5rem'}}>
              <summary style={{cursor:'pointer'}}>{t.name}</summary>
              <pre style={{margin:0}}><code>{t.ddl}</code></pre>
              {challenge.schema.tables.find((x:any)=>x.name===t.name)?.sampleRows && (
                <table style={{marginTop:'0.25rem'}}>
                  <thead>
                    <tr>{challenge.schema.tables.find((x:any)=>x.name===t.name)?.columns.map((c:any)=>(<th key={c.name}>{c.name}</th>))}</tr>
                  </thead>
                  <tbody>
                  {challenge.schema.tables.find((x:any)=>x.name===t.name)?.sampleRows?.slice(0,3).map((r:any,i:number)=>(
                    <tr key={i}>{challenge.schema.tables.find((x:any)=>x.name===t.name)?.columns.map((c:any)=>(<td key={c.name}>{String(r[c.name])}</td>))}</tr>
                  ))}
                  </tbody>
                </table>
              )}
            </details>
          ))}
          {challenge.schema.expectedResultShape && (
            <div style={{marginTop:'0.5rem', fontSize:'0.75rem'}}>
              <em>Expected Output Columns:</em> {challenge.schema.expectedResultShape.columns?.map((c:any)=>c.name).join(', ')}
            </div>
          )}
        </details>
      )}
      <Editor height="200px" defaultLanguage="sql" onChange={(v)=>setUserSql(v||'')} />
      <div style={{display:'flex', gap:'0.5rem', alignItems:'center', marginTop:'0.25rem'}}>
        <button onClick={handleRunQuery} className="run-btn" disabled={strictMode && identifierDiagnostics.length>0}>Run Query</button>
        <label style={{fontSize:'0.7rem'}}>
          <input type="checkbox" checked={strictMode} onChange={e=>setStrictMode(e.target.checked)} /> Strict Mode
        </label>
        {completed && <span style={{fontSize:'0.7rem', color:'green'}}>Completed ✓</span>}
      </div>
      {identifierDiagnostics.length>0 && (
        <div style={{marginTop:'0.5rem', fontSize:'0.7rem', color:'#a33'}}>
          {identifierDiagnostics.map((d,i)=>(<div key={i}>⚠ {d}</div>))}
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
      {verificationResult && (
        <div className={`verification-message ${verificationResult.isCorrect ? 'correct' : 'incorrect'}`}>
          {verificationResult.message}
        </div>
      )}
      {results && resultColumns && (
        <div className="results-container">
          <h3>Results</h3>
          <table>
            <thead>
              <tr>{resultColumns.map(c=><th key={c}>{c}</th>)}</tr>
            </thead>
            <tbody>
              {results.map((row,i)=>(
                <tr key={i}>{row.map((val:any,j:number)=>(<td key={j}>{val}</td>))}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <details style={{marginTop:'0.75rem'}}>
        <summary>View Solution</summary>
        <pre><code>{challenge.solutionSql || challenge.solution}</code></pre>
        {challenge.tags && <p style={{fontSize:'0.7rem'}}>Tags: {challenge.tags.join(', ')}</p>}
      </details>
    </div>
  );
};

export default SqlRunner;

// Named export for testing / external verification without rendering component
export async function buildChallengeDb(challenge:any){
  // Use local wasm asset during tests (node environment cannot fetch remote https path w/out bundler assistance)
  const SQL = await initSqlJs({ locateFile: (file: string) => require.resolve(`sql.js/dist/${file}`) });
  const newDb = new SQL.Database();
  if(challenge.schema?.tables){
    challenge.schema.tables.forEach((t:any)=>{ try {
      const cols = t.columns.map((c:any)=>`${c.name} ${c.type || 'TEXT'}${c.pk ? ' PRIMARY KEY' : ''}`);
      const ddl = t.ddl || `CREATE TABLE IF NOT EXISTS ${t.name} (\n  ${cols.join(',\n  ')}\n);`;
      newDb.run(ddl);
    } catch {} });
  }
  const dataObj = challenge.data || {};
  Object.keys(dataObj).forEach(key => {
    const rows = dataObj[key]; if(!Array.isArray(rows) || !rows.length) return; const sample = rows[0]; if(typeof sample !== 'object') return;
    const cols = Object.keys(sample);
    const inferType = (val:any)=> typeof val === 'number' ? 'REAL' : 'TEXT';
    try { const colsDDL = cols.map(c=>`${c} ${inferType(sample[c])}`).join(', '); newDb.run(`CREATE TABLE IF NOT EXISTS ${key} (${colsDDL});`); } catch {}
    try { const placeholders = cols.map(()=>'?').join(','); const stmt = newDb.prepare(`INSERT INTO ${key} VALUES (${placeholders})`); rows.forEach((r:any)=>stmt.run(cols.map(c=>r[c]))); stmt.free(); } catch {}
  });
  return newDb;
}

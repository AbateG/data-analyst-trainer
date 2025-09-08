/**
 * SQL identifier validation utilities (engine layer)
 * Extracted from SqlRunner to allow reuse without React component coupling.
 * Supports:
 *  - Table / column existence checks (including alias resolution)
 *  - Simple CTE name capture (non-recursive)
 *  - Wildcard sanity checks
 */
export interface EngineSqlColumn { name:string; type?:string }
export interface EngineSqlTable { name:string; columns: EngineSqlColumn[] }
export interface IdentifierValidationResult { issues:string[]; aliasMap:Record<string,string>; cteNames:string[] }

export function performIdentifierValidation(sql: string, tables: EngineSqlTable[]): IdentifierValidationResult {
  const tableNames = new Set(tables.map(t => t.name.toLowerCase()));
  const columnMap: Record<string,string[]> = {};
  tables.forEach(t => { columnMap[t.name.toLowerCase()] = t.columns.map(c=>c.name.toLowerCase()); });
  const issues: string[] = [];
  const working = sql.replace(/"([^\"]+)"/g, (_, inner) => inner);

  const cteSectionMatch = working.match(/with\s+([\s\S]+?)select/i);
  const cteNames: string[] = [];
  if(cteSectionMatch){
    const section = cteSectionMatch[1];
    section.split(',').forEach(chunk => {
      const nameMatch = chunk.match(/([a-zA-Z0-9_]+)\s+as\s*\(/i);
      if(nameMatch){
        cteNames.push(nameMatch[1].toLowerCase());
        const innerColRef = /([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/g; let icm;
        while((icm = innerColRef.exec(chunk))){
          const rawTbl = icm[1].toLowerCase(); const col = icm[2].toLowerCase();
          if(tableNames.has(rawTbl) && !columnMap[rawTbl]?.includes(col)) issues.push(`Unknown column: ${rawTbl}.${col}`);
        }
      }
    });
  }
  cteNames.forEach(n=>tableNames.add(n));

  const aliasRegex = /(from|join)\s+([a-zA-Z0-9_]+)\s+(?:as\s+)?([a-zA-Z0-9_]+)/gi;
  const aliasMap: Record<string,string> = {}; let am;
  while((am = aliasRegex.exec(working))){ const t = am[2].toLowerCase(); const a = am[3].toLowerCase(); if(tableNames.has(t)) aliasMap[a] = t; }

  const tableTokens = Array.from(working.matchAll(/\b(from|join)\s+([a-zA-Z0-9_]+)/gi)).map(m=>m[2].toLowerCase());
  tableTokens.forEach(t=>{ if(!tableNames.has(t) && !aliasMap[t]) issues.push(`Unknown table: ${t}`); });

  const colRefRegex = /([a-zA-Z0-9_]+)\.([a-zA-Z0-9_*]+)/g; let cm;
  while((cm = colRefRegex.exec(working))){
    const rawTbl = cm[1].toLowerCase(); const column = cm[2].toLowerCase();
    const resolved = aliasMap[rawTbl] || rawTbl;
    if(!tableNames.has(resolved)) continue;
    if(cteNames.includes(resolved)) continue;
    if(column === '*') continue;
    if(!columnMap[resolved]?.includes(column)) issues.push(`Unknown column: ${rawTbl}.${column}`);
  }

  const starRefs = Array.from(working.matchAll(/([a-zA-Z0-9_]+)\.\*/g)).map(m=>m[1].toLowerCase());
  starRefs.forEach(r=>{ const resolved = aliasMap[r] || r; if(!tableNames.has(resolved)) issues.push(`Unknown table for wildcard: ${r}`); });

  if(/select\s+\*/i.test(working) && tableTokens.length === 0) issues.push('Wildcard * used without FROM table');
  return { issues, aliasMap, cteNames };
}

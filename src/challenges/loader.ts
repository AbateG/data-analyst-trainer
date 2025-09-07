// Dynamic challenge loader to prepare for large (>1000) challenge sets.
// Each chunk file should default-export an array of challenges.
// Naming convention: sqlChunk_<index>.ts / pythonChunk_<index>.ts placed in this folder.

import type { SqlChallenge, PythonChallenge } from './types';
import { sqlChallenges } from './sql';

export interface LoadOptions {
  type: 'sql' | 'python';
  chunkIndices: number[]; // e.g. [0,1,2]
}

// Map base type to glob prefix (manual list can be expanded or generated at build time)
const sqlChunkLoaders: Record<number, () => Promise<{ default: SqlChallenge[] }>> = {
  0: () => import('./sqlChunk_0'),
  // Additional chunk indices can be appended here
};

const pythonChunkLoaders: Record<number, () => Promise<{ default: PythonChallenge[] }>> = {
  // 0: () => import('./python'),
};

export async function loadChallengeChunks(opts: LoadOptions) : Promise<(SqlChallenge|PythonChallenge)[]> {
  const loaders = opts.type === 'sql' ? sqlChunkLoaders : pythonChunkLoaders;
  const arrays: (SqlChallenge|PythonChallenge)[][] = [];
  for (const idx of opts.chunkIndices) {
    const loader = loaders[idx];
    if (!loader) {
      console.warn(`No loader registered for ${opts.type} chunk ${idx}`);
      continue;
    }
    try {
      const mod = await loader();
      arrays.push(mod.default);
    } catch (e) {
      console.error('Failed loading chunk', opts.type, idx, e);
    }
  }
  return arrays.flat();
}

// Convenience: get combined SQL challenges including dynamic chunks
export async function getAllSqlChallengesDynamic(): Promise<SqlChallenge[]> {
  const dynamic = await loadChallengeChunks({ type: 'sql', chunkIndices: Object.keys(sqlChunkLoaders).map(Number) });
  // Schema (if present) is already embedded in each challenge object; nothing extra required here yet.
  return ([...sqlChallenges, ...dynamic]) as SqlChallenge[];
}

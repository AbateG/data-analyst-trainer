import snapshotDiff from './python_manifests/snapshot_diff.json';
import type { PythonChallengeManifest } from '../types/pythonChallengeManifest';

// Potentially later: dynamic import via import.meta.glob. For now static import for example.
export const pythonManifestChallenges: PythonChallengeManifest[] = [snapshotDiff as PythonChallengeManifest];

// Adapter: convert manifest into legacy challenge object shape for current UI/runner while we incrementally migrate.
export function adaptManifestToLegacy(m: PythonChallengeManifest){
  // Build synthetic expectedOutput strategy: we rely on evaluation harness later; for now keep expectedOutput placeholder.
  return {
    id: m.id,
    category: m.category,
    tags: m.tags || [],
    difficulty: m.difficulty,
    objective: m.objective,
    question: `${m.title}\n\n${m.narrative}\n\nContract:\n${m.contract.description}\nInputs: ${m.contract.inputs.map(i=>i.name+': '+i.type).join(', ')}\nOutput: ${m.contract.output?.type || 'None'}\nConstraints: ${(m.contract.constraints||[]).join('; ')}`,
    // Provide starter and store solution
    starter: m.code.starter,
    solution: m.code.solution,
    // Provide placeholder expectedOutput to satisfy existing tests (actual property-based eval to be added)
    expectedOutput: m.evaluation.expectedOutput || '',
  data: m.dataFixtures || {},
  __manifest: m // attach original manifest for enhanced UI features
  };
}

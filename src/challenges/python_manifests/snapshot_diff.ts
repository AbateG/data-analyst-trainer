import type { PythonChallengeManifest } from '../../types/pythonChallengeManifest';

// Manifest version of snapshot diff challenge (mirrors legacy functionality of legacy id 10)
const snapshotDiff: PythonChallengeManifest = {
  manifestVersion: 1,
  id: 1010, // keep distinct from legacy id space
  slug: 'snapshot-diff-manifest',
  title: 'Snapshot Diff (Manifest)',
  category: 'etl-diff',
  difficulty: 'intermediate',
  objective: 'Compare full vs incremental snapshots and list unexpected deletions',
  narrative: 'Given two snapshots of data (full and incremental) identify ids missing in incremental (unexpected deletions) and newly added ids.',
  enhancedSpec: {
    learningObjectives: [
      'Compare two dataset snapshots using set operations',
      'Identify unexpected deletions and additions deterministically',
      'Generate stable sorted diff outputs for downstream automation'
    ],
    scenario: 'An overnight ETL produces a full snapshot while an hourly job emits incrementals. You must detect if incremental processing accidentally dropped rows or introduced new ones.',
    dataContext: {
      files: [
        { path: 'full_snapshot (list[dict])', purpose: 'Reference complete prior state' },
        { path: 'incr_snapshot (list[dict])', purpose: 'Current incremental state' }
      ],
      schema: [
        { name: 'id', type: 'int', description: 'Primary identifier unique within each snapshot', example: 42 }
      ],
      invariants: ['Each record contains integer id', 'Ids are unique within a single snapshot']
    },
    taskOverview: 'Implement snapshot_diff to take prior full and current incremental snapshots and return which ids disappeared (missing) and which newly appeared (added) using O(n) set operations.',
    deliverableContract: {
      functions: [
        { signature: 'def snapshot_diff(full_snapshot: list[dict], incr_snapshot: list[dict]) -> dict:', description: 'Return diff mapping with missing and added lists', returns: '{"missing": list[int], "added": list[int]}' }
      ],
      performance: 'O(n) over total number of records',
      deterministic: true
    },
    evaluationCriteria: {
      categories: [
        { name: 'Correctness', weight: 0.7, notes: 'Accurate id classification' },
        { name: 'Determinism', weight: 0.2, notes: 'Sorted output lists' },
        { name: 'Clarity', weight: 0.1, notes: 'Readable minimal code' }
      ],
      hiddenTests: [
        { type: 'edge-empty', count: 1 },
        { type: 'duplicates-ignored', count: 1 },
        { type: 'large-random', count: 1 }
      ]
    },
    examples: [
      { title: 'No changes', input: { full_snapshot: [{id:1}], incr_snapshot: [{id:1}] }, output: { missing: [], added: [] }, note: 'Stable when identical' },
      { title: 'All removed', input: { full_snapshot: [{id:5},{id:6}], incr_snapshot: [] }, output: { missing: [5,6], added: [] }, note: 'Detect total loss' }
    ],
    constraints: ['Must not mutate input lists', 'Return new dict', 'Output lists must be sorted ascending'],
    pitfalls: ['Forgetting to sort causes nondeterministic ordering', 'Building lists with O(n^2) membership checks instead of sets'],
    extensions: ['Return also unchanged ids', 'Accept optional key field name'],
    glossary: [ { term: 'Snapshot', definition: 'Point-in-time full extract of a dataset' } ]
  },
  tags: ['python','etl','diff','manifest'],
  contract: {
    functionName: 'snapshot_diff',
    description: 'Return a dict with keys missing and added representing id differences.',
    inputs: [
      { name: 'full_snapshot', type: 'list[dict]', description: 'Complete prior snapshot list of objects each with id:int' },
      { name: 'incr_snapshot', type: 'list[dict]', description: 'Incremental / current snapshot list of objects each with id:int' }
    ],
    output: { name: 'diff', type: 'dict', description: '{"missing": list[int], "added": list[int]}' },
    constraints: ['Assume each dict has integer id field', 'No duplicate ids inside a single snapshot'],
    complexity: 'O(n) over union of ids'
  },
  examples: [
    {
      name: 'basic',
      description: 'Single id deleted (2) and one new id (4).',
      input: { full_snapshot: [{ id:1 },{ id:2 },{ id:3 }], incr_snapshot: [{ id:1 },{ id:3 },{ id:4 }] },
      output: { missing: [2], added: [4] }
    }
  ],
  properties: [
    { id: 'idempotent', kind: 'expression', description: 'Calling snapshot_diff twice with same inputs returns same object value', expression: 'JSON.stringify(F(snapshot_diff, args))===JSON.stringify(F(snapshot_diff, args))' }
  ],
  hints: [
    { level: 1, text: 'Convert each list to a set of ids.' },
    { level: 2, text: 'Use set difference A - B for missing and B - A for added.' },
    { level: 3, text: 'Return sorted lists for deterministic output.' }
  ],
  code: {
    language: 'python',
    starter: `def snapshot_diff(full_snapshot, incr_snapshot):\n    """Return { 'missing': [...], 'added': [...] } comparing id fields.\n    TODO: implement using set differences.\n    """\n    # 1. Build sets of ids from both lists\n    # 2. Compute missing (full - incr) and added (incr - full)\n    # 3. Return dict with sorted lists\n    pass\n`,
    solution: `def snapshot_diff(full_snapshot, incr_snapshot):\n    full_ids = {r['id'] for r in full_snapshot}\n    incr_ids = {r['id'] for r in incr_snapshot}\n    missing = sorted(full_ids - incr_ids)\n    added = sorted(incr_ids - full_ids)\n    return {'missing': missing, 'added': added}\n`
  },
  evaluation: {
    mode: 'return',
    // Harness will compare returned value to example.output for now
    strict: true
  },
  dataFixtures: {
    full_snapshot: [{ id: 1 }, { id: 2 }, { id: 3 }],
    incr_snapshot: [{ id: 1 }, { id: 3 }, { id: 4 }]
  }
};

export default snapshotDiff;

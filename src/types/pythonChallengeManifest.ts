// Rich Python Challenge Manifest schema
// Provides a more explicit contract similar to SQL schema definitions

export interface IOParam {
  name: string;
  type: string;              // human-readable type (optionally Python typing expression)
  description: string;
  optional?: boolean;
  example?: any;
}

export interface ExampleCase {
  name: string;              // short identifier
  description?: string;      // what this example demonstrates
  input: Record<string, any> | any[] | any; // shape flexible: either mapping of params or raw positional list
  output?: any;              // optional expected output (if function returns)
  printed?: string;          // expected printed output (normalized) if print-based challenge
}

export interface PropertyAssertion {
  id: string;                // e.g., 'idempotent', 'no_input_mutation'
  description: string;       // learner friendly wording
  // Simple property evaluation expression in JS executed in harness OR reserved keywords
  // We start with built-ins and can extend later.
  kind: 'builtin' | 'expression';
  expression?: string;       // Used when kind==='expression'
  message?: string;          // Optional custom message shown in UI (fallback to description)
}

export interface ProgressiveHint {
  level: number;             // 1..n increasing specificity
  text: string;
}

export interface CodeStub {
  language: 'python';
  filename?: string;         // optional logical filename
  starter: string;           // starter code shown to learner
  solution: string;          // reference solution (kept hidden until reveal)
}

export interface EvaluationSpec {
  mode: 'print' | 'return' | 'mixed';
  expectedOutput?: string;        // canonical printed output (if mode includes print)
  expectedPattern?: string;       // regex alternative instead of exact expectedOutput
  returnValidator?: string;       // optional JS expression to validate returned value (value available as 'ret')
  strict?: boolean;               // if true disable whitespace normalization
}

export interface PythonChallengeManifest {
  manifestVersion: 1;
  id: number;
  slug: string;                // stable string identifier
  title: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  objective: string;           // concise objective
  narrative: string;           // full problem narrative (multi-paragraph allowed)
  /**
   * enhancedSpec: Rich pedagogical structure presented to user before code.
   * All fields optional so we can progressively backfill. Validator script will enforce for new challenges.
   */
  enhancedSpec?: {
    learningObjectives?: string[]; // 2-4 bullet verbs ("Compute", "Aggregate")
    scenario?: string;             // Short motivating context variant if narrative is long
    dataContext?: {
      files?: { path: string; purpose?: string }[]; // Provided files tree subset
      schema?: { name: string; type: string; description?: string; example?: any }[]; // Flattened schema description
      invariants?: string[];       // e.g., 'ids unique within snapshot'
    };
    taskOverview?: string;         // One paragraph crisp "You will implement ..."
    deliverableContract?: {
      functions: { signature: string; description?: string; returns?: string; errors?: string[] }[];
      performance?: string;        // e.g. O(n)
      deterministic?: boolean;     // if outputs must be deterministic
    };
    evaluationCriteria?: {
      categories?: { name: string; weight?: number; notes?: string }[];
      hiddenTests?: { type: string; count?: number }[]; // meta info only
    };
    examples?: { title?: string; input: any; output?: any; note?: string }[]; // Optional richer examples separate from core examples field
    constraints?: string[];        // Forbidden libs/actions or required patterns
    hintsTiered?: string[][];      // Alternative simple hints structure (levels as arrays)
    pitfalls?: string[];           // Common mistakes
    extensions?: string[];         // Stretch goals
    glossary?: { term: string; definition: string }[];
  };
  // --- Guidance additions (optional) to orient learners similar to SQL schema view ---
  guidance?: {
    overview?: string;              // high-level short orientation sentence(s)
    functionSignature?: string;     // suggested starting function signature e.g. "def foo(x: int) -> str:"
    inputDescription?: string;      // plain-language description of inputs
    outputDescription?: string;     // plain-language description of output / side-effects
    edgeCases?: string[];           // list of notable edge cases to consider
    complexityHint?: string;        // guidance around expected complexity (lighter than contract.complexity)
    pitfalls?: string[];            // common mistakes to avoid
  };
  contract: {
    functionName?: string;     // optional primary function name
    description: string;       // high-level contract statement
    inputs: IOParam[];
    output: IOParam | null;    // null if purely side-effect/print challenge
    complexity?: string;       // optional Big-O or performance target
    constraints?: string[];    // e.g. ['no mutation of inputs','O(n) over union of keys']
  };
  ioSchema?: string;           // optional pseudo-schema / type block for display
  examples: ExampleCase[];
  properties: PropertyAssertion[];  // property-based expectations
  hints: ProgressiveHint[];
  code: CodeStub;
  evaluation: EvaluationSpec;
  tags?: string[];
  dataFixtures?: Record<string, any>; // named data fixtures automatically injected as raw_data or param-specific injection
  notes?: string[];                 // miscellaneous notes / clarifications
}

export type AnyPythonChallengeManifest = PythonChallengeManifest; // alias for future versioning

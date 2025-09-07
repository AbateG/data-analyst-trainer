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

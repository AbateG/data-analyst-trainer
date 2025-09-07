// Shared challenge type definitions to support large scalable challenge sets
// Normalized difficulty enum to centralize allowed labels (prevents typos like 'intermed' etc.)
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface BaseChallengeMeta {
  id: number;                // globally unique within its domain (python, sql, conceptual)
  question: string;          // learner-facing prompt
  solution: string;          // reference implementation (Python/SQL/etc.)
  tags?: string[];           // e.g. ['sql','anomaly','etl']
  category?: string;         // high-level bucket like 'data-mismatch','pipeline','api-validation'
  difficulty?: Difficulty;   // normalized difficulty tier
  objective?: string;        // short learning goal
  notes?: string;            // optional author notes
  version?: string;          // semantic version enabling evolution without breaking saved state
  learningObjectives?: string[]; // future UI surfacing for tooltips / analytics
}

export interface SqlChallenge extends BaseChallengeMeta {
  expectedResult?: any[][];  // tabular values
  data: any;                 // table seed definitions
  // Optional explicit schema metadata to remove ambiguity for learners.
  // If provided, runner will use this for rendering DDL, validating identifiers,
  // and (eventually) enforcing column types.
  schema?: SqlSchema;
  // Optional pure executable SQL version of solution (no commentary) for automated verification.
  solutionSql?: string;
}

export interface PythonChallenge extends BaseChallengeMeta {
  expectedOutput?: string;     // stdout comparison target
  data?: any;                  // injected raw data object
  skipVerification?: boolean;  // skip automated verification
  expectedPattern?: string;    // regex pattern for flexible output matching
  strictComparison?: boolean;  // require exact string match vs trimmed comparison
  heavy?: boolean;             // mark as heavy (excluded from default quick validation passes)
}

export type Challenge = SqlChallenge | PythonChallenge;

// Data validation types for Python challenges
export interface UserRecord {
  user_id?: number | null;
  amount?: string | number;
  status?: string;
  [key: string]: any;
}

export interface ApiRecord {
  user_id?: number | string;
  amount?: number;
  [key: string]: any;
}

export interface TableStatus {
  table: string;
  last_loaded_ts: string;
  sla_minutes: number;
}

export interface PurchaseEvent {
  type: string;
  value?: number;
}

export interface EventPayload {
  id?: number;
  events?: PurchaseEvent[];
}

// ----------------- SQL Schema Support (New) -----------------
// These lightweight interfaces allow each challenge to declare a precise schema
// instead of relying solely on implicit JSON seed inference. This enables:
// 1. Displaying CREATE TABLE DDL
// 2. Identifier validation (unknown table/column hints before execution)
// 3. Future: type-aware casting checks or richer sample row rendering

export interface SqlTableColumn {
  name: string;                 // column identifier
  type: string;                 // generic SQL type label (e.g. INTEGER, TEXT, REAL, DATE, TIMESTAMP)
  description?: string;         // brief semantic meaning
  nullable?: boolean;           // default false
  pk?: boolean;                 // primary key membership
}

export interface SqlTableSchema {
  name: string;                 // table name
  description?: string;         // table semantic purpose
  columns: SqlTableColumn[];    // ordered column list
  sampleRows?: Record<string, any>[]; // representative sample rows (subset of full seed data)
  // Optional raw DDL override. If absent, a basic CREATE TABLE will be synthesized.
  ddl?: string;
}

export interface ExpectedResultShape {
  columns?: { name: string; type?: string; description?: string }[]; // expected output column descriptors
  ordering?: { by: string; direction?: 'asc' | 'desc' }[];           // required ordering specification
  notes?: string;                                                   // clarifications (e.g., tie-break rules)
}

export interface SqlSchema {
  tables: SqlTableSchema[];            // all tables involved in the challenge
  expectedResultShape?: ExpectedResultShape; // shape contract for answer clarity
  version?: string;                    // schema semver for future evolution (e.g. '1.0.0')
}


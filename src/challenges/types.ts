// Shared challenge type definitions to support large scalable challenge sets
export interface BaseChallengeMeta {
  id: number;
  question: string;
  solution: string;
  tags?: string[];           // e.g. ['sql','anomaly','etl']
  category?: string;         // high-level bucket like 'data-mismatch','pipeline','api-validation'
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  objective?: string;        // short learning goal
  notes?: string;            // optional author notes
}

export interface SqlChallenge extends BaseChallengeMeta {
  expectedResult?: any[][];  // tabular values
  data: any;                 // table seed definitions
}

export interface PythonChallenge extends BaseChallengeMeta {
  expectedOutput?: string;   // stdout comparison target
  data?: any;                // injected raw data object
}

export type Challenge = SqlChallenge | PythonChallenge;

// Lightweight semantic-ish evaluator for conceptual free-form answers.
// Approach: 
// 1. Normalize text (lowercase, remove punctuation)
// 2. Extract stemmed tokens (very light stemming) and bigrams
// 3. Match against required keyTerms (exact or fuzzy via Levenshtein distance <=2)
// 4. Identify missing key concepts, extra jargon (tokens not in whitelist), and provide actionable feedback.
// 5. Return score (0-100) based on concept coverage plus minor penalty for hallucinated unrelated terms.
// This is intentionally deterministic & local (no API calls) so users can iterate quickly.

export interface ConceptEvaluationResult {
  score: number;                // 0-100 composite weighted score
  covered: string[];            // key terms found
  missing: string[];            // key terms absent at time of return (semantic upgrades applied)
  extraneous: string[];         // domain-y words user added that are not in key terms (for awareness)
  feedback: string;             // human-readable suggestions
  detail: Record<string, 'exact' | 'fuzzy' | 'missing'>; // per-term resolution
  misconceptions?: { term: string; hint: string }[];     // detected misconceptions
  axes?: { completeness: number; accuracy: number; clarity: number; weights: { completeness: number; accuracy: number; clarity: number } };
  confidenceBand?: 'high' | 'medium' | 'low';             // derived from fuzzy ratio
  semanticMatches?: { term: string; similarity: number; sentence: string }[]; // optional semantic evidence
  evaluatedAt?: number;           // epoch ms added for telemetry / future decay logic
  version?: 1;                    // result schema version for future migrations
}

// Type guard to validate shape at runtime (useful when crossing async boundaries / storage)
export function isConceptEvaluationResult(v: unknown): v is ConceptEvaluationResult {
  if (!v || typeof v !== 'object') return false;
  const obj = v as Record<string, unknown>;
  if (typeof obj.score !== 'number') return false;
  if (!Array.isArray(obj.covered) || !Array.isArray(obj.missing) || !Array.isArray(obj.extraneous)) return false;
  if (typeof obj.feedback !== 'string') return false;
  if (typeof obj.detail !== 'object' || obj.detail === null) return false;
  // lightweight detail validation
  for (const k of Object.keys(obj.detail as Record<string, unknown>)) {
    const val = (obj.detail as Record<string, unknown>)[k];
    if (val !== 'exact' && val !== 'fuzzy' && val !== 'missing') return false;
  }
  return true;
}

interface EvalOptions {
  minFuzzyDistance?: number; // max edit distance for fuzzy match
  synonyms?: Record<string, string>; // map variant -> canonical (e.g., latency->lag)
  misconceptions?: Record<string, string>; // trigger term -> hint text
  rubricWeights?: { completeness: number; accuracy: number; clarity: number };
}

const DEFAULT_OPTIONS: {
  minFuzzyDistance: number;
  synonyms: Record<string,string>;
  misconceptions: Record<string,string>;
  rubricWeights: { completeness: number; accuracy: number; clarity: number };
} = {
  minFuzzyDistance: 2,
  synonyms: {
    latency: 'lag',
    avail: 'availability',
    durable: 'durability'
  },
  misconceptions: {
    acid: 'ACID properties are unrelated to CAP tradeoffs directly—consider consistency, availability, partition tolerance.',
    eventual: 'Clarify eventual vs strong consistency in CAP context.',
    ca: 'In CAP you cannot simultaneously guarantee CA under partitions; revisit tradeoff.'
  },
  rubricWeights: { completeness: 0.5, accuracy: 0.3, clarity: 0.2 }
};

function normalize(text: string): string {
  return text
    .toLowerCase()
  .replace(/[`*_#>\-=+(){}["'.,!?;:]/g, ' ') // punctuation -> space
    .replace(/\s+/g, ' ') // collapse
    .trim();
}

function tokenize(text: string): string[] {
  return normalize(text).split(' ').filter(Boolean);
}

function applySynonyms(tokens: string[], synonyms: Record<string,string>): string[] {
  if (!synonyms || !Object.keys(synonyms).length) return tokens;
  return tokens.map(t => synonyms[t] ?? t);
}

// Simple Levenshtein for short terms
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

// Optional semantic parameter kept last for backward compatibility. If provided & loaded
// we will attempt semantic acceptance of missing terms.
export async function evaluateConceptAnswer(
  answer: string,
  keyTerms: string[],
  options?: EvalOptions,
  semantic?: { match: (answer: string, keyTerms: string[]) => Promise<{ term: string; similarity: number; sentence: string }[]> }
): Promise<ConceptEvaluationResult> {
  try {
    const safeTerms = (keyTerms || []).filter(Boolean);
    if (!answer.trim()) {
      return {
        score: 0,
        covered: [],
        missing: [...safeTerms],
        extraneous: [],
        feedback: safeTerms.length ? 'Answer is empty. Provide an attempt to receive guidance.' : 'No rubric terms defined.',
        detail: Object.fromEntries(safeTerms.map(t => [t, 'missing'] as const)),
        evaluatedAt: Date.now(),
        version: 1
      };
    }
    if (!safeTerms.length) {
      return {
        score: 100,
        covered: [],
        missing: [],
        extraneous: [],
        feedback: 'No rubric terms provided—automatic full credit (authoring issue).',
        detail: {},
        evaluatedAt: Date.now(),
        version: 1
      };
    }

    const merged = { ...DEFAULT_OPTIONS, ...options, synonyms: { ...DEFAULT_OPTIONS.synonyms, ...(options?.synonyms || {}) }, misconceptions: { ...DEFAULT_OPTIONS.misconceptions, ...(options?.misconceptions || {}) } };
    const { minFuzzyDistance, synonyms, misconceptions } = merged;
    const rawTokens = tokenize(answer);
    const tokens = applySynonyms(rawTokens, synonyms);
    const uniqueTokens = Array.from(new Set(tokens));
    const detail: ConceptEvaluationResult['detail'] = {};
    const covered: string[] = [];
    let exactCount = 0;
    let fuzzyCount = 0;
    const normalizedAnswer = normalize(answer);

    for (const term of safeTerms) {
      const normTerm = normalize(term);
      const mappedSyn = synonyms[normTerm] || normTerm;
      const exact = uniqueTokens.includes(mappedSyn) || uniqueTokens.includes(normTerm) || normalizedAnswer.includes(normTerm) || normalizedAnswer.includes(mappedSyn);
      if (exact) {
        covered.push(term);
        detail[term] = 'exact';
        exactCount++;
        continue;
      }
      let fuzzyHit = false;
      for (const t of uniqueTokens) {
        if (Math.abs(t.length - normTerm.length) > minFuzzyDistance) continue;
        if (levenshtein(t, normTerm) <= minFuzzyDistance) {
          covered.push(term);
          detail[term] = 'fuzzy';
          fuzzyCount++;
          fuzzyHit = true;
          break;
        }
      }
      if (!fuzzyHit) detail[term] = 'missing';
    }

    const missing = safeTerms.filter(k => !covered.includes(k));
    const keySet = new Set(safeTerms.map(k => normalize(k)));
    const extraneous = uniqueTokens.filter(t => t.length > 4 && !keySet.has(t));
    const misconceptionHits: { term: string; hint: string }[] = [];
    for (const trig in misconceptions) {
      if (uniqueTokens.includes(trig)) {
        misconceptionHits.push({ term: trig, hint: misconceptions[trig] });
      }
    }

    const coverageRatio = covered.length / safeTerms.length;
    const completeness = Math.round(coverageRatio * 100);
    const accuracyRatio = covered.length ? (exactCount + 0.6 * fuzzyCount) / covered.length : 0;
    const accuracy = Math.round(accuracyRatio * 100);
    const fuzzyRatio = covered.length ? fuzzyCount / covered.length : 0;
    const extraneousPenaltyRatio = Math.min(1, extraneous.length / 12);
    const clarity = Math.round(100 * (1 - 0.5 * fuzzyRatio - 0.5 * extraneousPenaltyRatio));
    const weights = options?.rubricWeights || DEFAULT_OPTIONS.rubricWeights;
    const weightedScore = Math.round(
      (completeness * weights.completeness) +
      (accuracy * weights.accuracy) +
      (clarity * weights.clarity)
    );
    let confidenceBand: 'high' | 'medium' | 'low';
    if (fuzzyRatio < 0.2) confidenceBand = 'high';
    else if (fuzzyRatio < 0.5) confidenceBand = 'medium';
    else confidenceBand = 'low';

    const feedbackParts: string[] = [];
    if (coverageRatio === 1) feedbackParts.push('Excellent coverage of all key concepts.');
    else if (coverageRatio >= 0.7) feedbackParts.push('Good answer—most key concepts present. Refine for completeness.');
    else feedbackParts.push('Several important concepts are missing—review the solution and try again.');
    if (missing.length) feedbackParts.push('Missing: ' + missing.join(', '));
    if (misconceptionHits.length) feedbackParts.push('Potential misconceptions: ' + misconceptionHits.map(m => m.term).join(', '));
    if (extraneous.length) feedbackParts.push('Extra terms (verify relevance): ' + extraneous.slice(0,8).join(', '));

    let semanticMatches: { term: string; similarity: number; sentence: string }[] | undefined;
    if (semantic && typeof semantic.match === 'function') {
      try {
        const sem = await semantic.match(answer, safeTerms);
        if (sem.length) {
          semanticMatches = sem;
          for (const m of sem) {
            if (detail[m.term] === 'missing') {
              detail[m.term] = 'exact';
              covered.push(m.term);
              const idx = missing.indexOf(m.term);
              if (idx >= 0) missing.splice(idx, 1);
            }
          }
        }
      } catch {
        // silent semantic failure keeps deterministic evaluation intact
      }
    }

    return {
      score: weightedScore,
      covered: [...new Set(covered)],
      missing,
      extraneous,
      feedback: feedbackParts.join(' '),
      detail,
      misconceptions: misconceptionHits.length ? misconceptionHits : undefined,
      axes: { completeness, accuracy, clarity, weights },
      confidenceBand,
      semanticMatches,
      evaluatedAt: Date.now(),
      version: 1
    };
  } catch (err) {
    return {
      score: 0,
      covered: [],
      missing: keyTerms || [],
      extraneous: [],
      feedback: 'Evaluation error: ' + (err instanceof Error ? err.message : 'unknown'),
      detail: Object.fromEntries((keyTerms || []).map(t => [t, 'missing'] as const)),
      evaluatedAt: Date.now(),
      version: 1
    };
  }
}
// Optional semantic layer scaffolding.
// Goal: allow plugging a small local embedding model (e.g., MiniLM) in the future without
// introducing a hard runtime dependency now. If model isn't loaded, we fallback to keyword evaluation.

export interface ConceptEmbedding {
  term: string;               // canonical key term
  explanation: string;        // short 1-2 sentence description
  vector: number[];           // embedding vector
}

export interface SemanticMatchResult {
  term: string;
  similarity: number;
  accepted: boolean;
  sentence: string;
}

export interface SemanticLayer {
  isLoaded(): boolean;
  embedText(text: string): Promise<number[]>; // embed arbitrary text
  getConceptEmbeddings(): ConceptEmbedding[]; // precomputed concept vectors
}

// Cosine similarity util
export function cosine(a: number[], b: number[]): number {
  if (!a.length || a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// Split answer into rough sentences (simple heuristic)
export function sentenceSplit(text: string): string[] {
  return text
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
}

// Attempt semantic coverage detection; fallback to empty if layer not loaded.
export async function semanticMatch(
  answer: string,
  keyTerms: string[],
  layer: SemanticLayer | undefined,
  similarityThreshold = 0.74
): Promise<SemanticMatchResult[]> {
  if (!layer || !layer.isLoaded()) return [];
  const sentences = sentenceSplit(answer);
  const conceptVectors = layer.getConceptEmbeddings();
  const results: SemanticMatchResult[] = [];
  for (const sent of sentences) {
    const v = await layer.embedText(sent);
    for (const concept of conceptVectors) {
      if (!keyTerms.includes(concept.term)) continue; // restrict to current rubric terms
      const sim = cosine(v, concept.vector);
      if (sim >= similarityThreshold) {
        results.push({ term: concept.term, similarity: sim, accepted: true, sentence: sent });
      }
    }
  }
  // Keep best per term
  const bestMap = new Map<string, SemanticMatchResult>();
  for (const r of results) {
    const existing = bestMap.get(r.term);
    if (!existing || r.similarity > existing.similarity) bestMap.set(r.term, r);
  }
  return Array.from(bestMap.values()).sort((a,b) => b.similarity - a.similarity);
}

// Placeholder in-memory layer for future injection; returns unloaded state.
export const UnloadedSemanticLayer: SemanticLayer = {
  isLoaded: () => false,
  async embedText() { return []; },
  getConceptEmbeddings() { return []; }
};

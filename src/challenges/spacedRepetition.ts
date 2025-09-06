// Simple spaced repetition helper for conceptual evaluator.
// Stores missed concept IDs (terms) with timestamps and review counts in localStorage.
// Surfaces terms due after a minimum session gap or time gap.

export interface SpacedItem {
  term: string;
  lastSeen: number; // epoch ms
  reviews: number; // times resurfaced
  nextDue: number; // epoch ms when should next appear
}

const LS_KEY = 'concept_spaced_repetition_v1';

function load(): SpacedItem[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch { /* ignore malformed localStorage content */ }
  return [];
}

function save(items: SpacedItem[]) {
  if (typeof localStorage === 'undefined') return;
  try { localStorage.setItem(LS_KEY, JSON.stringify(items)); } catch { /* ignore quota errors */ }
}

// Add or update missed terms after an evaluation.
export function recordMissedTerms(terms: string[], now: number = Date.now()) {
  if (!terms.length) return;
  const items = load();
  const map = new Map(items.map(i => [i.term, i] as const));
  for (const term of terms) {
    const existing = map.get(term);
    if (existing) {
      // increment difficulty by shortening interval if repeatedly missed
      existing.reviews = Math.max(0, existing.reviews - 1); // negative reinforcement style
      existing.lastSeen = now;
      existing.nextDue = now + computeInterval(existing.reviews);
    } else {
      map.set(term, {
        term,
        lastSeen: now,
        reviews: 0,
        nextDue: now + computeInterval(0)
      });
    }
  }
  save(Array.from(map.values()));
}

// On successful coverage include to strengthen or remove if mastered.
export function recordCoveredTerms(terms: string[], now: number = Date.now()) {
  if (!terms.length) return;
  const items = load();
  const map = new Map(items.map(i => [i.term, i] as const));
  for (const term of terms) {
    const existing = map.get(term);
    if (existing) {
      existing.reviews += 1;
      existing.lastSeen = now;
      existing.nextDue = now + computeInterval(existing.reviews);
      if (existing.reviews >= 3) { // retire after 3 successes
        map.delete(term);
      }
    }
  }
  save(Array.from(map.values()));
}

function computeInterval(successReviews: number): number {
  // simple exponential-ish schedule base 12h
  const base = 12 * 60 * 60 * 1000; // 12h
  return base * Math.max(1, Math.pow(1.8, successReviews));
}

export function getDueTerms(now: number = Date.now()): SpacedItem[] {
  return load().filter(i => i.nextDue <= now).sort((a,b) => a.nextDue - b.nextDue);
}

export function clearSpacedRepetition() { save([]); }

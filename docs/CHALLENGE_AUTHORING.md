# Python Challenge Authoring Guidelines

These guidelines help keep challenges consistent, robust, and easy to execute in the Pyodide sandbox and CI.

## 1. Structure
Each challenge object must include:
- `id` unique integer (stable; never reuse IDs)
- `category`, `tags[]`, `difficulty`, `objective`
- `question` (clear, learner-facing)
- `solution` (runnable Python code; prints results)
- Validation target: Either `expectedOutput` (preferred) or `expectedPattern` (regex string)
- `data` (JSON-serializable; injected as `raw_data` if referenced)
- Optional: `strictComparison`, `skipVerification`

## 2. Python Style
Prefer clear, idiomatic Python:
- Use list / dict / set comprehensions where natural.
- Avoid artificially expanded loops just to satisfy textual tests (tests now allow comprehensions).
- Keep functions short and single-purpose inside the snippet.
- Use f-strings for formatting.
- Deterministic ordering for printed collections (sort where needed) to avoid flaky comparisons.

## 3. Output & Determinism
- Always print deterministic order (sort dict keys or lists if natural ordering from sets/maps would be undefined).
- Multi-line output: each logical record on its own line.
- Do not rely on object memory addresses.
- Floating point: format or round if slight drift possible.

## 4. Validation Modes
1. `expectedOutput`: Exact (normalized whitespace) comparison.
2. `expectedPattern`: Use when output can vary slightly (provide a *tight* regex).
3. `strictComparison: true`: Enables exact char-for-char check (no whitespace normalization) for precision-sensitive tasks.

## 5. Error Handling / Robustness
- If the challenge is about resilience, wrap risky sections with `try/except` and log meaningful messages.
- Do not swallow exceptions silently—print a concise marker.

## 6. Data Injection Contract
- `raw_data` is injected at runtime before the solution executes.
- Keep datasets minimal but realistic.
- Include edge cases relevant to the learning objective.

## 7. Performance Constraints
- Solutions must run under ~250ms in Pyodide for typical laptops (keep loops small: O(n), n < 10k typical).
- Avoid heavy libraries (no pandas / numpy unless explicitly allowed and preloaded—currently avoided).

## 8. Security / Sandbox Awareness
- No network calls, file system writes, or dynamic code execution (`eval`, `exec`).
- Avoid non-deterministic randomness unless seeded and pedagogically necessary.

## 9. Printing Conventions
- Prefer explicit print messages: `Mismatch: ...`, `SLA_BREACH ...`, `Late: ...`.
- Use consistent labels for similar concepts (e.g., `Mismatch`, `Missing`, `Stale`).

## 10. Regex Pitfalls
- Avoid writing code that *accidentally* matches test regex heuristics for errors (e.g., incomplete control blocks).
- If using a regex in the solution, raw strings preferred: `r"pattern"`.

## 11. Adding New Challenges Checklist
1. Pick next `id` (sequential).
2. Draft `question` (learner focused, concise, includes verbs: *Detect*, *Aggregate*, *Validate*...).
3. Implement `solution` with deterministic prints.
4. Add minimal realistic `data`.
5. Run `scripts/validatePythonRuntime.ts` (browser/full env) or headless harness.
6. Add targeted unit test if the challenge introduces new validation logic patterns.

## 12. When to Use `expectedPattern`
Use only if output includes ordering that is inherently nondeterministic or if minor numeric formatting differences expected. Anchor with `^`/`$` and be specific.

## 13. Forbidden / Discouraged
- Broad `except:` without specifying at least logging.
- Large embedded multi-MB data blobs.
- Hidden state between challenges.

## 14. Hints & Examples (Progressive Guidance)
All Python challenges now support progressive `hints` and illustrative `examples`.

Hints follow ascending specificity:
1. Conceptual orientation (what problem space is this?)
2. Structural approach (data structures / iteration strategy)
3. Edge cases / pitfalls
4. Implementation direction (mutation vs pure, ordering, validation nuance)
5. Final assembly / output shape / formatting expectations

Authoring Rules:
- Provide at least 3 hints (up to 5). Keep each under ~120 chars.
- Avoid giving away full variable names or final code in early levels.
- Level numbers must be strictly increasing starting at 1.

Examples (`examples[]` objects) show realistic minimal IO. For print-style challenges include a `printed` field with the expected final line (or the core meaningful line) to reinforce pattern recognition.

Minimum: 1 example. Prefer 2–3 when edge cases matter.

Auto-Enrichment:
- Legacy (pre-manifest) challenges without hints/examples are auto-enriched at load with generic scaffolding. You should still replace those with authored domain-specific hints to maximize learner value.
- Validation (`npm run validate:python:hints`) fails if authored challenges have <3 hints or zero examples.

Recommended Example Fields:
```
{
  name: 'basic',
  description: 'Happy path with one anomaly',
  input: {...} | [...],
  output: {...},        // if function-return style
  printed: 'Mismatch: x vs y' // if print-mode
}
```

## 15. Future Extensions (Roadmap)
- Metadata field `learning_points[]` summarizing 2-3 key takeaways.
- Difficulty auto-scorer derived from static analysis (loops, branching, concepts).

## 16. Example Minimal Pattern Challenge
```
{
  id: 99,
  ...,
  solution: `print('Rows:', len(raw_data))`,
  expectedPattern: '^Rows: \\d+$',
  data: [...]
}
```

---
Questions or proposals: open a GitHub issue with label `challenge-authoring`.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Authoring Docs
Authoring new Python challenges? See: [docs/CHALLENGE_AUTHORING.md](docs/CHALLENGE_AUTHORING.md)
Run validation helpers:
```powershell
npm run validate:python     # static lint & heuristics
npm run validate:python:runtime  # executes challenges (requires browser env for Pyodide)
```

## Conceptual Answer Evaluation (New)
Free-form conceptual answers are now auto-scored locally (no external API) to encourage explaining concepts in your own words instead of memorizing.

How it works:
- Key terms per question (see `conceptual.ts`) are matched via exact, substring, or fuzzy (edit distance <=2) logic.
- Coverage score = (matched key concepts / total) * 100 minus small penalty for lots of extraneous jargon.
- Feedback lists: covered, missing, and extra terms to refine your answer.
- Deterministic + offline so you can iterate quickly.

File overview:
- `src/challenges/conceptualEvaluator.ts` – core scoring logic.
- `src/pages/ConceptualPage.tsx` – integrates evaluator, replaces old simple keyword percentage.

Extending quality (future ideas):
1. Synonym / concept mapping (e.g., 'observability' -> 'monitoring/logs').
2. Lightweight embedding similarity using a local model (e.g., MiniLM) for semantic recall (optional toggle).
3. Rubric dimensions (Accuracy, Completeness, Clarity, Structure) with per-axis scoring.
4. Misconception detector: negative keyword list triggering targeted hints.
5. Spaced repetition: track weak concepts and resurface related questions later.

Contributing improvements:
- Add `keyTerms` arrays carefully (prioritize concept nouns/verbs over filler words).
- Avoid overly generic terms ('data', 'issue')—they inflate coverage artificially.
- Add `synonyms` map inside evaluator if you notice legitimate phrasing misses.

Run locally:
```powershell
npm install
npm run dev
```

### Spaced Repetition Integration
The evaluator now records missed and covered key terms to a lightweight localStorage queue (see `spacedRepetition.ts`). After each evaluation:
- Missing terms are scheduled sooner (shorter interval if repeatedly missed)
- Covered terms graduate after 3 successful recalls
- A list of due terms (ready to be revisited) appears under each question after evaluation

### Confidence & Misconception Badges
In `ConceptualPage.tsx` evaluation results now show:
- Confidence band (high/medium/low) based on fuzzy vs exact match ratio
- Misconceptions badge counting triggered negative keywords (e.g., `acid` in a CAP theorem answer)

### Type Guards
`isConceptEvaluationResult` offers a runtime shape check when persisting or transmitting evaluation results—useful if wiring future analytics or storage.

### Semantic Layer Scaffold
`semanticLayer.ts` defines an interface + cosine similarity utilities for a future local embedding model. Current implementation is inert (returns unloaded) to avoid bundle weight until a model choice is finalized.

### Tests
Vitest added. Run:
```powershell
npm run test
```
The `conceptualEvaluator.test.ts` suite covers empty answers, exact & fuzzy matching, misconceptions, confidence band, and the type guard.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Challenge Competency Matrix (Excerpt)
Each challenge is tagged to one or more competencies (see `taxonomy.ts`). Extend as needed.

| Competency | Description | Sample Challenge IDs |
|------------|-------------|----------------------|
| investigation | Reconcile & mismatch debugging | 3,7,10,29,32 |
| flow-mapping | Lineage, DAG, partition logic | 19 (py), 24 (sql), 32 (sql), 34 (sql) |
| api-validation | API schema, pagination, raw parsing | 1,2,8 (py), 11 (sql) |
| transformation-quality | SCD, FX, tier, masking | 17,30,32,35,36,39 (sql) |
| automation | Rules, profiler, SLA monitors | 5,33,34,35 (py) |
| cloud-tools | Cloud performance, access, cost | 5,18,19,20,24 (conceptual), 15 (sql), 30 (sql) |
| monitoring-alerting | Freshness, spikes, late, null | 13,14,33,36,38 (sql) |
| anomaly-detection | Stats, z-scores, spikes | 4,11,13 (sql), 21,23 (py) |
| communication | Postmortem, escalation | 10,12,16 (conceptual) |
| performance-optimization | Query tuning, pruning | 5 (conceptual), 34 (sql) |

### Expanded Coverage Additions (Conceptual IDs 17–26)
New conceptual challenges extend evaluation to fully cover responsibilities:
- 17 Lineage reconstruction & gap detection
- 18 API reliability (rate limits, idempotency, monitoring)
- 19 Cloud IAM cross-cloud (BigQuery vs Synapse) debug
- 20 Multi-cloud freshness monitor design
- 21 Incident triage prioritization & communication
- 22 Stream vs batch late data design trade-offs
- 23 Observability instrumentation (metrics/logs/traces/cardinality)
- 24 Performance & cost trade-offs (materialization vs pruning vs migration)
- 25 Late data replay strategy (reprocessing + safeguards)
- 26 Contract change rollback & governance

Additional implementation challenges:
- Python 34 test design (pytest thinking) & 35 nested JSON flatten validation
- SQL 41 nested JSON flatten (string parsing limits) 

Responsibility → Challenge Mapping (core examples):
- Investigate mismatches: SQL 2,6,8,12,20,32–41; Python 3,7,10,15,20,21,25,35; Conceptual 1,2,9,17,18,19,21,24,25,26
- Data flow & lineage: Conceptual 17,19,20,22,24,25; SQL 24,34; Python 19,25
- API & transformations validation: Conceptual 6,18; SQL 10,11,16,18,31,34,41; Python 1,2,8,9,10,32,35
- Automation & test scripts: Python 5,11,12,13,14,16,17,18,33,34; Conceptual 15,23
- Collaboration & communication: Conceptual 10,12,16,21,26
- Cloud tooling (GCP/AWS/Azure): Conceptual 1,5,18,19,20,24; SQL 15,34; Python 31
- Anomaly/detective mindset: Conceptual 11,13,15,17,21,22,23,24,25; SQL 3,5,13,14,18,21,23,25,28,29,37,38; Python 2,4,11,13,14,18,33,35

Limitations & Future Ideas:
- Add Azure-specific operational failure log parsing lab.
- Introduce streaming state store failure recovery simulation.
- Expand semantic evaluator synonyms for new key terms (e.g., 'idempotency', 'watermark').

Run validation:
```bash
npm run validate:challenges
```

Add new challenge steps:
1. Create/update in appropriate file.
2. Tag with difficulty, tags, objective.
3. (Optional) Add competency in `challengeCompetencies`.
4. Run validation script & build.

## New Solution Rendering Features

| Feature | Description | Where |
|---------|-------------|-------|
| Raw vs Formatted Toggle | Checkbox lets you view original author text or processed formatted HTML | `ConceptualPage.tsx` |
| Configurable Tone Map | Add / remove phrase replacements (case-insensitive) persisted to localStorage | `ConceptualPage.tsx` |
| Inline Code Highlighting | Text between backticks is wrapped in `<code>` and highlighted via highlight.js (GitHub theme) | `ConceptualPage.tsx` |

### Tone Map Usage
1. Click "Edit Tone Map".
2. Review current entries (phrase → replacement).
3. Add new entries (prompt-driven) or remove with the ✕ icon.
4. Replacements apply before display; toggle Raw view to compare.

### Inline Code
Wrap inline technical terms with backticks in a solution string, e.g. `SELECT *`.
They render with `<code>` + automatic syntax highlighting pass (generic tokenization—sufficient for short snippets).

### Extensibility Ideas
- Persist tone map to a remote profile for multi-device consistency.
- Add per-question override disabling tone adjustments.
- Support fenced code blocks (```sql ... ```), choosing language class for highlight.js.
- Add a diff view (raw vs formatted side-by-side) for authors tuning phrasing.

## Deployment (GitHub Pages)

This project is configured for GitHub Pages at:
`https://abateg.github.io/data-analyst-trainer/`

Workflow file: `.github/workflows/deploy-pages.yml` builds on every push to `main` and publishes `dist/` using the GitHub Pages Actions pipeline.

### One-time GitHub setup
1. Push repo to GitHub (done).
2. In GitHub: Settings → Pages → Build and deployment → Source: GitHub Actions (should already be selected automatically after first successful run).
3. Push (or re‑push) to `main` to trigger the workflow. Watch progress under Actions → Deploy to GitHub Pages.
4. After it completes, visit the URL above (may take 1–2 minutes to propagate).

Quick redeploy (local terminal):
```powershell
git add .
git commit -m "chore: content tweak" # skip if no changes
git push origin main
```

### Local development
```powershell
npm run dev
```
Visit: `http://localhost:5173/data-analyst-trainer/` (Vite dev server injects `base`).

### Manual deployment trigger
Actions → Deploy to GitHub Pages → Run workflow (workflow_dispatch is enabled).

### Custom domain (optional)
Add a `CNAME` file inside `public/` with your domain (e.g. `trainer.example.com`) before pushing; the workflow will include it in `dist`. Keep only the bare domain (no protocol). After DNS (CNAME) points to `<username>.github.io`, Pages will use it.

### SPA deep link fallback
The workflow copies `dist/index.html` to `dist/404.html` so direct navigation to nested routes loads the React app instead of a GitHub 404.

### How base path works
`vite.config.ts` sets `base` to `'/data-analyst-trainer/'`. Use that for `<BrowserRouter basename={import.meta.env.BASE_URL}>` (if not already) so internal links resolve correctly under the subpath. If you later move to a custom domain, you can override by setting env `GH_PAGES_BASE=/` in the workflow or adjusting `vite.config.ts`.

### Cache busting
Vite fingerprints assets. A new push invalidates old bundles automatically; use a hard refresh (Ctrl+F5) if the browser caches aggressively.

### Troubleshooting
| Symptom | Fix |
|---------|-----|
| 404 on refresh of a nested route | Ensure 404.html is produced (workflow step) and base path matches repo name. |
| Old assets still loading | Hard refresh or wait a minute for CDN; confirm new commit hash appears in JS file names. |
| Workflow fails at build | Reproduce locally: `npm ci && npm run build`; check Node version (uses 20). |
| Blank page (JS error) | Check console; verify `base` matches deployment path and no script 404s. |
| Custom domain ignored | Ensure `public/CNAME` exists with only the domain and DNS CNAME points to `<user>.github.io`. |

### Deploy from a different branch (optional)
If you prefer a `release` branch, edit `on.push.branches` in `.github/workflows/deploy-pages.yml` and push there.

## SQL Schema & Validation (New)

Lightweight SQL identifier validation now assists query authors:

Features:
- Auto schema inference when a challenge omits an explicit `schema` block (columns derived from seed data rows).
- CTE awareness: leading `WITH cte AS (...)` names are recognized as tables in subsequent clauses.
- Wildcard handling: `table.*` validated, global `*` warns if no FROM table.
- Strict Mode toggle: blocks execution until unknown tables/columns are resolved.

Non-goals (current): deep nested CTE parsing, subquery alias column lineage, quoted identifiers with spaces, derived column alias checks.

Usage:
1. Draft your query; warnings list unresolved identifiers.
2. Enable Strict Mode to enforce clean resolution before running.
3. Iterate until warnings disappear; Run becomes enabled.

This balances fast iteration with optional rigor for training scenarios.

---
Happy learning & iterating! Contributions welcome—open an issue for feature ideas.

## Python Manifest Enhancements (Experimental)
New richer Python challenge manifests (see `src/types/pythonChallengeManifest.ts`) support:
- Progressive hints (`hints[]`) rendered as a collapsible list in the runner.
- Structured examples (`examples[]`) with optional expected inputs/outputs for learners.
- Property assertions (`properties[]`) including built-ins and simple expression checks.

Runtime property feedback:
1. After running code, each property is evaluated against the first example (temporary heuristic).
2. Expression properties use a constrained JS evaluator that blocks unsafe tokens (`function`, `class`, `import`, etc.).
3. Results show pass/fail with short messages below the output panel.

Authoring expression property example:
```ts
{
  id: 'has_minimum_fields',
  description: 'Solution includes required function name',
  kind: 'expression',
  expression: 'manifest.contract.functionName && !!manifest.code.solution',
  message: 'Function defined'
}
```

Legacy adapter: `adaptManifestToLegacy` attaches the original manifest on the legacy challenge object as `__manifest` so the updated `PythonRunner` can surface hints & properties without breaking older challenge definitions.

Planned next steps:
- Broaden property evaluation context (multi-example loop).
- Add diff/time complexity metadata rendering.
- Persist latest property status per attempt for spaced repetition targeting.

## Pyodide Memory Errors (Troubleshooting)
If you saw repeated console logs like:
```
RangeError: WebAssembly.Memory(): could not allocate memory
  at loadPyodide ...
```
This was caused by multiple independent calls to `loadPyodide` (each attempt allocates a large WASM memory region). Mounting the Python runner component several times or triggering hot reloads created overlapping loads.

Fix implemented:
- Added a shared singleton loader `src/utils/pyodideSingleton.ts` that stores the in‑flight promise and returns it to all callers.
- Updated `PythonRunner.tsx` and `pythonHeadlessRunner.ts` to use the singleton.

How to use going forward:
```ts
import { getPyodide } from '../utils/pyodideSingleton';
const py = await getPyodide();
```

If you ever need to force a reload (rare), refresh the page. Do NOT add new direct `window.loadPyodide(...)` calls elsewhere.

Test coverage: `pyodideSingleton.test.ts` verifies only one underlying load occurs even with concurrent calls.


## SQL Schema Metadata (New)
To eliminate ambiguity in SQL challenges, each challenge can now declare an explicit `schema` object (see example in `sql.ts` id=1).

Why:
- Learners see authoritative table + column definitions (types, PKs, semantics).
- The runner validates referenced tables/columns before execution and surfaces hints.
- Future extensions: stricter type casting checks, auto-generated ER snippets.

Interfaces (in `src/challenges/types.ts`):
- `SqlSchema` → `{ version?, tables: SqlTableSchema[], expectedResultShape? }`
- `SqlTableSchema` → `name, description?, columns[], sampleRows?, ddl?`
- `SqlTableColumn` → `name, type, description?, nullable?, pk?`
- `ExpectedResultShape` → output column contract & ordering notes.

Authoring Steps:
1. Add `schema` block to challenge object.
2. Provide at least: table `name`, each column `name` & rough `type` (TEXT/INTEGER/REAL/DATE/TIMESTAMP).
3. Include 1–3 `sampleRows` (representative & edge case if space permits).
4. Add `expectedResultShape` when the output differs from raw columns (e.g., aggregated alias columns, ordering contract).
5. (Optional) Supply custom `ddl` if you need constraints not auto-synthesized.

Validator Behavior (current):
- Parses `FROM` / `JOIN` clauses, supports simple aliases (`table t` or `table AS t`).
- Checks `alias.column` or `table.column` tokens against declared schema.
- Warns (non-blocking) with: `Unknown table: ...` or `Unknown column: table.column`.

Limitations (roadmap):
- Does not yet handle subqueries, CTE alias scoping, quoted identifiers with spaces, or wildcard column expansion.
- Does not infer types from inserted JSON (types are descriptive only).

Extending:
- Improve tokenizer to skip strings/comments.
- Add CTE detection (strip `WITH cte AS (...)`).
- Provide toggle to treat unknown identifiers as hard errors.

Migration Plan:
- Incrementally backfill schemas for existing challenges (start with earlier IDs covering core tables: users/transactions/etc.).
- Encourage new challenges to always include schema; make schema mandatory after a set date.


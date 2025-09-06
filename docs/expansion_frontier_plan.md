# Expansion Frontier Plan (Concise)

## 1. Metadata Enrichment
- Added difficulty + tags to conceptual challenges (done in code).
- Next: Expand `challengeCompetencies` to cover all conceptual IDs (auto derive missing list; script idea).
- Potential script: scan challenges, flag any missing competency mapping for non-beginner difficulty.

## 2. Execution Harness (Auto Runner)
Goal: Deterministic evaluation & JSON report for CI + learner feedback.

Components:
1. Core Runner (`scripts/runChallenges.ts`)
   - Loads challenge arrays.
   - For SQL: Uses `sql.js` (already present) to create in-memory DB per challenge, load seed tables, execute learner query or stored solution if in validation mode.
   - For Python: Use Pyodide in-browser; for CI fallback use `pyodide-node` (optional later). Minimal phase: interpret provided solution only.
2. Diff Engine
   - SQL: Deep equality on 2D arrays (normalize numbers to fixed precision, coerce null vs undefined).
   - Python: Capture stdout via wrapper; compare to `expectedOutput` using trimmed multiline comparison (optionally allow regex markers like /\d{4}/ later).
3. Report Schema (`challenge-report.json`)
   ```json
   {
     "generatedAt": "2025-09-06T12:00:00Z",
     "sql": [{"id":1,"status":"pass","durationMs":12,"rows":1}],
     "python": [{"id":2,"status":"fail","reason":"Mismatch line 3","expectedHash":"abc","actualHash":"def"}],
     "summary": {"total":88,"passed":87,"failed":1}
   }
   ```
4. CLI Flags
   - `--type=sql|python|all` filter
   - `--limit=10` sample subset
   - `--mode=solution|user` (solution executes reference; user mode will accept an input directory of user submissions later)
5. Output
   - Writes JSON to `reports/challenge-report.json`.
   - Non-zero exit code if any failure (for CI gating).

Incremental Milestones:
- M1: Implement SQL runner for solutions only + JSON report.
- M2: Add Python solution runner with stdout capture (browser only dev harness, skip CI initially).
- M3: Add diff tolerance options.
- M4: Support user submission directory.

## 3. Dynamic Scoring
Model: Weighted score per competency.
- Table `competencyWeights`: default weight (e.g., investigation=1.2, automation=1.0, communication=0.8).
- Per challenge: base points by difficulty (beginner=10, intermediate=20, advanced=35) * avg weight of mapped competencies.
- Progress aggregation: sum earned / sum possible for attempted competencies.
- Dashboard JSON: `progress.json` { competency: { earned, possible, pct } }.

## 4. Scenario Generators
Parameterized templates producing challenge variants.
- SCD Anomaly: Inputs (overlapPct, surrogateKeyGap, lateArrivalLagDays) -> emits dimension + staging tables, expected duplicates query answer.
- Freshness Drift: Parameters (expectedLagMin, injectedLagMin) -> builds events table with gaps for detection.
- Synthetic Data Utility: `generateTimeSeries({days, baseline, noise, spikes[]})` reused across templates.
Implementation path: Put generators in `src/generators/` returning `SqlChallenge` objects.

## 5. Streaming Track (Simulated)
Browser-friendly mock (no real Kafka):
- Event emitter producing partitions (arrays) with timestamps.
- Lag detector: compares `now - max(event_ts)` per partition; triggers alert objects.
- Watermark & Lateness: compute watermark = min(max_ts_partition_i - allowed_lag). Identify late events arriving after watermark advanced.
- Out-of-order repair: reorder buffer holding last N events, emits reorder metrics (#reordered, lateness distribution).
- Visual Component: React chart of lag over time + watermark position.

## 6. ML Data Quality Modules
Lightweight stats in TS for now.
- Feature Drift (KS Test): Implement two-sample Kolmogorov–Smirnov for numeric arrays; output D statistic + p-value (approx). Trigger drift if p < 0.01 and |mean_delta| > threshold.
- Label Leakage Detection: Scan feature names for target substrings + high correlation (>0.95) with target in sample; flag.
- Rolling PSI: Bucket reference vs current distributions (10 bins); compute PSI daily; alert if PSI > 0.25.
- Packaging: `src/quality/ml.ts` exposing pure functions; later Python parity.

## 7. Contract CI (Pre-commit)
Git hook `.husky/pre-commit` (or simple `.git/hooks/pre-commit` script) runs:
- `npm run validate:challenges` (add script alias).
- Additional rule: Fail if any new challenge (git diff added lines with `id:`) lacks `difficulty` OR `tags` OR is missing from competency mapping for non-beginner difficulties.
Implementation: Node script scanning staged diffs via `git diff --cached`.

## 8. Gamification
- Streak: consecutive active days (solved >=1 challenge). Stored in `localStorage` key `challengeActivity` with dates.
- Badges: JSON config `badges.json` (e.g., `investigator` => complete 5 investigation challenges advanced>=2). Awarded list stored local.
- UI: Badge shelf component + streak flame icon.

## 9. Capstone Paths
Definition object:
```ts
interface CapstonePath { id: string; title: string; steps: { challengeId: number; type: 'sql'|'python'|'conceptual'; unlockCondition?: { dependsOn: string[] } }[] }
```
- Provide curated sequences (e.g., Timezone Incident -> SQL freshness analysis -> Python anomaly script).
- Unlock: Completed all prior step challenge IDs.

## 10. Sandbox Security
- Python: Run code in Web Worker hosting Pyodide; enforce time + memory: abort if execution > 3s (worker terminate) or output > N chars.
- SQL: Wrap execution with Promise.race timeout (e.g., 1s) and limit result rows (e.g., slice 500).
- Future: Static code guards (reject `import os` patterns under restricted mode).

## 11. Next Immediate Actionable Steps
1. Implement M1 SQL execution harness (scripts + report folder).
2. Add validate script alias + pre-commit hook skeleton.
3. Add generators folder scaffolding with freshness drift stub.

(End of concise plan)

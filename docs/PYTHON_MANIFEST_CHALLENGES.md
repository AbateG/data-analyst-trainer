# Python Manifest Challenges (Rich Spec Format)

This introduces a richer, schema-like specification for Python challenges—analogous to SQL schemas—so learners see an explicit contract instead of guessing from a stub.

## Goals
- Explicit I/O contract (types, constraints, complexity target)
- Progressive hints (layered reveal)
- Property assertions (idempotence, no mutation, reconstruction correctness)
- Machine readable + UI friendly
- Backward compatible with legacy `pythonChallenges` array

## Manifest Fields (v1)
| Field | Purpose |
|-------|---------|
| `manifestVersion` | Version for future migrations |
| `id`, `slug`, `title` | Identity & display |
| `narrative` | Full problem story/context |
| `contract` | Function contract: inputs, output, constraints, complexity |
| `ioSchema` | Pseudo-type block (pretty display) |
| `examples[]` | Named example cases (input + expected) |
| `properties[]` | Property-based expectations (built-in or expression) |
| `hints[]` | Progressive hints level 1..n |
| `code.starter` | Learner starter stub |
| `code.solution` | Canonical reference solution |
| `evaluation` | Execution mode + expected printable output or pattern |
| `dataFixtures` | Named data blobs for harness / injection |

## Property Semantics (Built-ins Implemented)
- `no_input_mutation`: deep JSON snapshot pre/post call must match
- `reconstruct_new_state`: applying diff yields updated state
- `idempotent_on_full_application`: applying diff twice -> empty diff second time

## Migration Strategy
1. Introduce manifest schema + loader (done)
2. Add adapter to push manifests into legacy array (done)
3. Extend UI to surface hints/examples (partial, placeholder)
4. Gradually migrate existing numeric `id` challenges into JSON manifests
5. Enhance runner to show property evaluation results inline

## Adding a New Manifest
1. Create JSON under `src/challenges/python_manifests/*.json`
2. Import and append via `loaderPythonManifests.ts`
3. Add / adjust properties ensuring at least one simple example for evaluation
4. (Optional) Write a property test in `__tests__/pythonManifestProperties.test.ts`

## Future Enhancements
- Expression-based property evaluation (JS sandbox) for custom assertions
- UI hint progressive reveal + scoring rubric
- Automatic stub generation from manifest
- Derive doctest examples into unit tests executed in Pyodide

## Example
See `snapshot_diff.json` for end-to-end example.

# Engine Layer

Core reusable logic extracted from the application UI. This folder is the seed for a potential standalone package.

## Goals
- Pure logic (no React / DOM dependencies)
- Deterministic & side-effect free where practical
- Clear public surface via `index.ts`

## Current Modules
- `sqlValidation.ts` – identifier validation for SQL challenges (tables, columns, aliases, simple CTE capture)

## Roadmap
- Challenge manifest adapters
- Conceptual evaluator core
- Spaced repetition scheduling primitives
- Python challenge property evaluation sandbox

## Usage
Import via path alias (once configured):
```ts
import { performIdentifierValidation } from '@engine/sqlValidation';
```

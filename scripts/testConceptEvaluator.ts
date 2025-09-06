import { evaluateConceptAnswer } from '../src/challenges/conceptualEvaluator.ts';

async function run() {
  const answer = `In distributed systems under partition you must choose between availability and consistency; latency impacts perceived lag. ACID focus differs. eventual consistency may appear.`;
  const keyTerms = ['consistency','availability','partition','latency'];
  const result = await evaluateConceptAnswer(answer, keyTerms, { synonyms: { lag: 'latency' } });
  console.log(JSON.stringify(result, null, 2));
}
run();

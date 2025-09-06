// Auto-generated SQL challenge chunk (dynamic generator integration)
import type { SqlChallenge } from './types';
import { generateFreshnessDrift } from '../generators/freshnessDrift';

// Use high ID to avoid collision with static set
const generated: SqlChallenge[] = [
  generateFreshnessDrift(1000, { days: 5, baselineLagMinutes: 5, injectedLagMinutes: 30, spikeDayOffset: 3 })
];

export default generated;

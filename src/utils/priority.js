import { RECENCY_SCORE } from '../constants'

export const DEFAULT_WEIGHTS = { frequency: 40, coverage: 30, recency: 20, difficulty: 10 }

/**
 * Dataset-Based Priority (0..100). Each component is normalised to 0..1:
 *  frequency  - all.csv frequency % / 100 (relative to each company's own file)
 *  coverage   - log-scaled company count relative to the most widely shared question
 *  recency    - bucket score (30d=1 ... older=.25, unspecified=0)
 *  difficulty - 1 if it matches the preferred difficulty (or no preference), else 0
 * Weights are re-normalised so they always sum to 100%.
 */
export function priorityScore({ frequency, companyCount, bucket, difficulty }, weights, maxCompanyCount, preferredDifficulty = 'Any') {
  const total = weights.frequency + weights.coverage + weights.recency + weights.difficulty
  if (!total) return 0
  const parts = {
    frequency: (frequency ?? 0) / 100,
    coverage: maxCompanyCount > 1 ? Math.log(companyCount) / Math.log(maxCompanyCount) : 0,
    recency: RECENCY_SCORE[bucket] ?? 0,
    difficulty: preferredDifficulty === 'Any' || preferredDifficulty === difficulty ? 1 : 0,
  }
  const score = Object.keys(parts).reduce((acc, key) => acc + parts[key] * weights[key], 0) / total
  return Math.round(score * 1000) / 10
}

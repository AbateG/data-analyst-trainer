/* Freshness Drift Challenge Generator
   Produces a SqlChallenge detecting lag spike beyond threshold.
*/
import type { SqlChallenge } from '../challenges/types';

interface FreshnessParams { days: number; baselineLagMinutes: number; injectedLagMinutes: number; spikeDayOffset: number; }

export function generateFreshnessDrift(id:number, params: FreshnessParams): SqlChallenge {
  const { days, baselineLagMinutes, injectedLagMinutes, spikeDayOffset } = params;
  const events: any[] = [];
  const now = new Date('2025-01-01T00:00:00Z');
  for(let d=0; d<days; d++){
    const day = new Date(now.getTime() + d*86400000);
    const lag = d === spikeDayOffset ? injectedLagMinutes : baselineLagMinutes;
    // simulate 3 hourly events with ingestion_time = event_time + lag
    for(let h=0; h<3; h++){
      const eventTime = new Date(day.getTime() + h*3600000);
      const ingestionTime = new Date(eventTime.getTime() + lag*60000);
      events.push({ id: `${d}-${h}`, event_ts: eventTime.toISOString(), ingestion_ts: ingestionTime.toISOString() });
    }
  }
  return {
    id,
    question: `Freshness Drift: Detect the day where average ingestion delay exceeded baseline. Table events(event_ts, ingestion_ts). Baseline ~${baselineLagMinutes}m; identify the date with spike (>${injectedLagMinutes-baselineLagMinutes}m delta). Return event_date and avg_delay_minutes.`,
    solution: `WITH deltas AS (
      SELECT substr(event_ts,1,10) AS event_date,
             (julianday(ingestion_ts) - julianday(event_ts)) * 24 * 60 AS delay_min
      FROM events
    ), agg AS (
      SELECT event_date, AVG(delay_min) AS avg_delay
      FROM deltas
      GROUP BY 1
    )
    SELECT event_date, ROUND(avg_delay,2) FROM agg
    WHERE avg_delay > ${baselineLagMinutes} + (${injectedLagMinutes - baselineLagMinutes})/2
    ORDER BY avg_delay DESC
    LIMIT 1;`,
    expectedResult: [[new Date(now.getTime()+spikeDayOffset*86400000).toISOString().slice(0,10), injectedLagMinutes]],
    data: { events },
    tags: ['sql','freshness','monitoring','generator'],
    category: 'freshness-drift',
    difficulty: 'intermediate',
    objective: 'Detect freshness spike beyond threshold'
  };
}

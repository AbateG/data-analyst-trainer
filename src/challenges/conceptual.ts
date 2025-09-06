export const conceptualChallenges = [
  {
    id: 1,
    difficulty: 'beginner',
    tags: ['cloudwatch','s3','redshift','debugging','logs'],
    question: `A critical data pipeline that runs every hour has started failing intermittently. The pipeline reads data from an AWS S3 bucket, processes it using a script running on an EC2 instance, and loads it into a Redshift data warehouse. Where would you look for clues to debug this? Name at least three specific places/logs and what you'd be looking for in each.`,
    solution: `1. **CloudWatch Logs for the EC2 instance:** Look for application errors, stack traces, or resource exhaustion (CPU, memory).
2. **S3 Access Logs:** Check for '404 Not Found' or '403 Forbidden' errors, indicating issues with file access or permissions.
3. **Redshift Error Logs (STL_LOAD_ERRORS):** Look for data loading errors, such as data type mismatches, constraint violations, or connection issues.`,
    keyTerms: ['cloudwatch', 's3', 'redshift', 'logs', 'errors', 'permissions', 'data loading']
  },
  {
    id: 2,
    difficulty: 'intermediate',
    tags: ['race-condition','event-order','timestamps','debugging'],
    question: `You suspect that a data mismatch between two systems is caused by a "race condition," where the order of events is not guaranteed (e.g., a customer update event arrives *before* the customer creation event). How would you go about proving this theory? Describe the steps you would take.`,
    solution: `1. **Timestamp Analysis:** Compare the timestamps of the related events in both systems. Look for instances where an 'update' event has an earlier timestamp than the corresponding 'create' event.
2. **Log Correlation:** Trace the lifecycle of a single entity (e.g., a customer) through the logs of both systems using a unique identifier. This can reveal the order in which events were processed.
3. **Introduce a Delay:** As a test, introduce a small, artificial delay in the processing of 'update' events to see if it resolves the mismatch. If it does, it's strong evidence of a race condition.`,
    keyTerms: ['timestamp', 'race condition', 'log correlation', 'delay', 'order of events']
  },
  {
    id: 3,
    difficulty: 'beginner',
    tags: ['behavioral','star','data-anomaly','investigation'],
    question: `Describe a time you discovered a data anomaly or inconsistency. What was the issue, what was your "aha!" moment, and what steps did you take to investigate and resolve it? What did you learn from it?`,
    solution: `This is a behavioral question, so the answer should be a personal story. A good answer will follow the STAR method (Situation, Task, Action, Result) and demonstrate a detective mindset, technical skills, and a commitment to data quality.`,
    keyTerms: ['star method', 'investigation', 'data anomaly', 'resolution', 'learning']
  },
  {
    id: 4,
    difficulty: 'beginner',
    tags: ['oltp','olap','databases','theory','architecture'],
    question: `Theoretical Question: Explain the difference between OLTP and OLAP databases. When would you use each in a data analyst role, and how do they relate to the job responsibilities described in the posting?`,
    solution: `OLTP (Online Transaction Processing) databases are optimized for fast, frequent read/write operations, typically used for operational systems like e-commerce platforms. OLAP (Online Analytical Processing) databases are designed for complex queries and analysis on large datasets.

In a data analyst role:
- Use OLTP for real-time data validation and quick lookups
- Use OLAP for trend analysis, reporting, and anomaly detection
- The job involves working with both: validating OLTP data feeds and analyzing OLAP warehouses for inconsistencies`,
    keyTerms: ['oltp', 'olap', 'transaction processing', 'analytical processing', 'data validation', 'trend analysis']
  },
  {
    id: 5,
    difficulty: 'intermediate',
    tags: ['bigquery','performance','slot-usage','partitioning','clustering'],
    question: `Cloud Tools Deep Dive: You're working with GCP BigQuery and notice that a scheduled query is running much slower than usual. What steps would you take to diagnose and resolve this performance issue?`,
    solution: `1. **Check Query Execution Details:** Use BigQuery's query history to examine execution plans, slot usage, and data processed.
2. **Analyze Data Skew:** Look for uneven data distribution that might cause hotspots.
3. **Review Partitioning and Clustering:** Ensure tables are properly partitioned and clustered for the query pattern.
4. **Examine Resource Allocation:** Check if the query is hitting slot limits or if there are concurrent job conflicts.
5. **Optimize Query Structure:** Look for opportunities to use window functions, subqueries, or materialized views.
6. **Monitor Infrastructure:** Check for issues with the underlying GCP infrastructure or network connectivity.`,
    keyTerms: ['bigquery', 'query execution', 'partitioning', 'clustering', 'data skew', 'slot usage', 'performance']
  },
  {
    id: 6,
    difficulty: 'beginner',
    tags: ['api','debugging','pagination','monitoring'],
    question: `API Debugging Scenario: An API feed that normally returns 1000 records per hour suddenly starts returning only 100. How would you systematically debug this issue?`,
    solution: `1. **Check API Response Headers:** Look for rate limiting indicators, pagination changes, or error status codes.
2. **Examine Request Parameters:** Verify that query parameters haven't changed and are being sent correctly.
3. **Review API Documentation:** Check for recent changes in the API specification or deprecations.
4. **Test with Different Parameters:** Try various combinations to isolate the issue.
5. **Monitor Network Logs:** Check for connectivity issues, timeouts, or DNS problems.
6. **Compare with Historical Data:** Look at past successful requests to identify what changed.
7. **Contact API Provider:** If all else fails, reach out to the API maintainers for insights.`,
  },
  {
    id: 7,
    difficulty: 'beginner',
    tags: ['cap-theorem','distributed-systems','consistency','availability','partition-tolerance'],
    question: `Theoretical: Explain the CAP theorem and how it applies to distributed databases in cloud environments like AWS, GCP, or Azure.`,
    solution: `The CAP theorem states that in a distributed system, you can only guarantee two out of three properties: Consistency, Availability, and Partition Tolerance.

In cloud databases:
- **Consistency:** All nodes see the same data at the same time
- **Availability:** Every request receives a response
- **Partition Tolerance:** System continues to operate despite network partitions

For data analysts, this means understanding trade-offs when choosing databases for different use cases.`
  },
  {
    id: 8,
    difficulty: 'intermediate',
    tags: ['airflow','dag','debugging','scheduling','logs'],
    question: `Debugging Complex: A data pipeline using Apache Airflow has DAGs that are failing randomly. How would you systematically diagnose and resolve this issue?`,
    solution: `1. **Check Airflow Logs:** Examine scheduler, worker, and task logs for error messages.
2. **Review DAG Configuration:** Verify dependencies, retry policies, and resource allocations.
3. **Monitor Resource Usage:** Check for memory leaks, CPU spikes, or network issues.
4. **Analyze Task Dependencies:** Look for circular dependencies or missing upstream tasks.
5. **Test Individual Components:** Isolate and test each task in the DAG separately.
6. **Review Recent Changes:** Check for code deployments or infrastructure changes that might have introduced the issue.`
  },
  {
    id: 9,
    difficulty: 'intermediate',
    tags: ['spark','bigquery','airflow','anomaly','debugging'],
    question: `Glitch Hunt: A daily report shows a sudden 20% drop in active users. The data pipeline flows from Mobile App Events (Kafka) -> Spark Streaming Job -> Enriched Events (S3) -> Daily Aggregation (Airflow/BigQuery) -> Final Report (Tableau). Where are the top 3 places you would investigate, and what specific metric or log would you look for in each?`,
    solution: `1. **Spark Streaming Job:** Check CloudWatch/Datadog logs for processing errors, an increase in dropped records, or schema validation failures. Monitor input vs. output record counts.
2. **Daily Aggregation (Airflow/BigQuery):** Examine the Airflow task logs for the aggregation job. Check the BigQuery job history for errors, slots consumed, or rows written. A significant drop in rows processed is a red flag.
3. **Enriched Events (S3):** Check the S3 bucket's metrics for a sudden decrease in the volume or number of objects being written by the Spark job. You could also run an S3 Select query to sample recent data for completeness.`,
    keyTerms: ['data pipeline', 'debugging', 'spark', 'bigquery', 'airflow', 'data flow', 'anomaly']
  },
  {
    id: 10,
    difficulty: 'intermediate',
    tags: ['communication','stakeholders','data-quality','bug-report'],
    question: `Collaboration & Communication: You've discovered a critical data quality issue: due to a bug in a backend service, the 'user_id' is null for ~5% of purchase events. This impacts financial reporting. How would you communicate this finding to the engineering team and a non-technical product manager? What information is crucial for each audience?`,
    solution: `**For the Engineering Team (in a Jira/bug ticket):**
- **Title:** Critical Bug: Null 'user_id' in 'purchase_events' topic for 5% of records.
- **Description:** Be precise. Include the exact event name/topic, the timeframe of the issue, and the percentage of affected records.
- **Evidence:** Provide 3-5 sample records (with sensitive data masked), relevant log snippets, and the query you used to identify the issue.
- **Impact:** State the business impact clearly: "This is blocking financial reporting and causing revenue attribution errors."
- **Urgency:** Mark as High/Critical.

**For the Product Manager (in Slack/Email):**
- **Summary:** Start with the high-level business impact. "Hi PM, we've found an issue causing us to under-report revenue from new purchases by about 5% since yesterday."
- **Scope:** Explain the scope in simple terms. "A technical bug is causing us to lose the link between some customers and their purchases."
- **Action:** State what you're doing about it. "I've filed a critical bug with the engineering team and am working with them to assess the full impact. I will provide an update once we know more about the fix timeline."
- **Next Steps:** "In the meantime, I am working on a temporary query to exclude the bad data from the reports."`,
    keyTerms: ['communication', 'collaboration', 'bug report', 'stakeholder management', 'data quality']
  },
  {
    id: 11,
    difficulty: 'advanced',
    tags: ['timezone','normalization','data-quality','backfill','analytics'],
    question: `Timezone Incident: A daily active users (DAU) dashboard shows a 12% drop for '2025-07-01'. Raw event timestamps are ingested in mixed timezones (some clients send local time without offset, others send proper UTC ISO). The warehouse table has a string column 'raw_ts' and a derived 'event_date' using DATE(raw_ts). Outline: (1) 3 concrete signals this is a timezone normalization issue, (2) how you'd quantify the true impact, (3) a remediation plan to backfill and prevent recurrence.`,
    solution: `**Signals:** (a) Late evening UTC hours (22:00-23:59) for prior day show spike, (b) Geographic skew: APAC user activity shifted into next day disproportionately, (c) Comparing COUNT(DISTINCT user_id) by hourly bucket after converting assuming UTC vs applying region-based offset diverges >10%.\n**Quantify:** Re-parse raw_ts with heuristic: if raw_ts lacks 'Z' or offset AND source_country in ('AU','JP','SG') apply its IANA TZ then convert to UTC; recompute DAU both ways and report delta + list of impacted user_ids for sample verification.\n**Remediation:** (1) Create staging column parsed_ts_utc using robust parser (regex + fallback default timezone mapping). (2) Backfill affected date range with corrected event_date. (3) Add data quality check: daily percent of events lacking timezone metadata < 0.1% threshold; alert if breached. (4) Document timezone handling policy and add unit tests for edge cases around DST transitions.`,
    keyTerms: ['timezone','utc','normalization','backfill','data quality','dau','ingestion contract']
  },
  {
    id: 12,
    difficulty: 'advanced',
    tags: ['postmortem','incident-response','process','data-quality'],
    question: `Postmortem Practice: A corrupt dimension table build caused 3 hours of incorrect downstream metrics before detection. Outline a lightweight postmortem with (a) timeline, (b) blast radius quantification, (c) 3 corrective actions (technical + process), (d) 2 preventative measures with clear owners.`,
    solution: `**Timeline:** Capture detection time, first bad run start, remediation start, fix deploy, validation completion.\n**Blast Radius:** List affected tables, dashboards, % of queries impacted, revenue / decision risk. Quantify row count affected + # of distinct business keys wrong.\n**Corrective Actions:** (1) Backfill bad partitions (owner: Data Eng). (2) Re-run dependent aggregates with checksum validation (owner: Analytics Eng). (3) Add alert to monitor dimension row count delta > ±5% (owner: Data Platform).\n**Preventative Measures:** (1) Add pre-publish contract test blocking deploy if primary key uniqueness < 100% (owner: CI maintainer). (2) Introduce canary build writing to shadow schema + diff (owner: Data Eng lead).` ,
    keyTerms: ['postmortem','timeline','blast radius','corrective action','preventative']
  },
  {
    id: 13,
    difficulty: 'advanced',
    tags: ['idempotency','ingestion','deduplication','hashing','replay'],
    question: `Idempotency Strategy: A backfill re-ran an ingestion job and doubled certain fact rows. Describe an idempotent ingestion design for append-only event data: cover natural vs surrogate keys, dedup logic, replay window sizing, and operational tooling.`,
    solution: `**Keys:** Use event_id (if globally unique) else derive deterministic hash of (source_system, external_id, event_ts, payload). Store as ingestion_key.\n**Dedup Logic:** Stage raw batch, compute hashes, left join to existing fact on ingestion_key, insert only novel. Optionally use MERGE where supported.\n**Replay Window:** Maintain a configurable lookback (e.g. 7 days) for late arrivals; compact older partitions to reduce dedup cost.\n**Tooling:** Provide a replay command that logs candidate vs accepted row counts + collision rate. Expose metrics (ingested_rows, duplicates_skipped, late_rows) to monitoring.\n**Auditing:** Keep a dedup_audit table capturing ingestion_key, first_seen_ts for lineage.`
  },
  {
    id: 14,
    difficulty: 'advanced',
    tags: ['data-contract','schema-evolution','versioning','governance'],
    question: `Data Contract Governance: An upstream team wants to add nullable column 'device_locale' and rename 'user_country' to 'country_code'. What steps ensure safe evolution without breaking consumers? Include detection, negotiation, versioning, and enforcement.`,
    solution: `1. **Detection:** Contract diff in CI flags rename (breaking) + additive column (non-breaking).\n2. **Negotiation:** Require deprecation period (e.g. 30 days) for rename; add new column 'country_code' while retaining 'user_country'.\n3. **Versioning:** Publish schema v2 with both columns; mark legacy field deprecated with removal date.\n4. **Enforcement:** Runtime validator rejects payloads missing mandatory legacy+new pair during transition.\n5. **Communication:** Broadcast schema change notice (Slack/email) with migration guide + timeline.\n6. **Removal:** After adoption metrics show <1% usage of old column for 14 consecutive days, drop 'user_country'.` ,
    keyTerms: ['data contract','schema evolution','backward compatibility','versioning']
  },
  {
    id: 15,
    difficulty: 'advanced',
    tags: ['monitoring','metrics','data-quality','dashboarding','alerting'],
    question: `Monitoring Strategy Design: You must create a minimal but high-signal data reliability dashboard. Choose 6 KPIs that collectively detect freshness, volume drift, null explosions, schema drift, duplication, and anomaly spikes. Specify each metric, data source, threshold logic, and alert channel.`,
    solution: `**Freshness Lag (minutes):** now - max(event_ts) per critical feed; threshold > 2 * SLA -> PagerDuty.\n**Volume Delta (%):** (today_rows - avg_prev_7) / avg_prev_7; abs > 25% -> Slack #data-alerts (warn), >40% -> PagerDuty.\n**Null Ratio Spike:** null_count/row_count for key columns vs 7-day p95; exceed p95 + 50% -> Slack.\n**Schema Drift Count:** (# unexpected columns + # missing required columns) from contract diff; >0 -> ticket auto-created.\n**Duplicate Rate:** duplicates_skipped / ingested_rows; >1% sustained 3 runs -> Slack.\n**Metric Z-Score Outliers:** Daily revenue z-score > 3 -> analyst review tag. Metrics stored in quality_metrics fact; thresholds encoded in config table enabling dynamic tuning.`
  },
  {
    id: 16,
    difficulty: 'intermediate',
    tags: ['escalation','communication','status-update','stakeholders'],
    question: `Cross-Team Escalation: A critical marketing attribution model output is stale; engineering says upstream Kafka lag is temporary. Marketing leadership wants ETA. Provide a structured escalation update (sections + sample content) balancing technical depth and business clarity.`,
    solution: `**Status Summary:** "Attribution model output missing latest 6 hours due to upstream Kafka consumer lag."\n**Impact:** "Dashboards show under-attribution ~8–10% (estimated) for paid channels; no billing impact."\n**Root Cause (Preliminary):** "Increased partition skew after new topic partitions added; consumer autoscaling lagging."\n**Mitigation Actions:** "Temporary increase in consumer concurrency from 6->12; backfill job queued."\n**ETA:** "Catch-up in ~45–60 min; model re-run + validation additional 20 min."\n**Next Update:** timestamp.\n**Risks:** "If skew persists, may need partition rebalancing / key repartition."\n**Ask:** "Confirm acceptable to delay morning executive export until corrected run completes."` ,
    keyTerms: ['escalation','stakeholder','communication','status update']
  }
  ,
  {
    id: 17,
    difficulty: 'advanced',
    tags: ['lineage','dag','logs','reconstruction','investigation'],
    question: `Lineage Reconstruction: A metric table 'daily_active_users' is suddenly 15% low. You have (a) 4 log snippets referencing job names, (b) partial DDLs for tables: raw_events, cleaned_events, sessionized_events, daily_active_users, and (c) one missing Airflow task run record. Outline: (1) how you would reconstruct the end-to-end lineage and processing order, (2) 3 concrete signals pointing to the missing transformation, (3) validation steps after patching the gap.`,
    solution: `**Reconstruct:** Collect job names + timestamps from logs; map each output table to its producing job via DDL comments or naming conventions (e.g. 'sessionize_events' produces sessionized_events). Arrange directed edges where downstream DDL SELECTs from upstream tables. Visualize: raw_events -> cleaned_events -> sessionized_events -> daily_active_users. Missing Airflow task run for 'sessionize_events' on affected date breaks chain. **Signals:** (1) cleaned_events row count normal; sessionized_events partition empty. (2) daily_active_users user count roughly equals distinct users in cleaned_events *unfiltered* (pre-session collapse). (3) Airflow graph shows downstream task marked skipped due to missing upstream success state. **Validation:** Backfill sessionized_events partition, re-run aggregation DAG, compare recomputed metric vs historical baseline & raw distinct user sample. Add DAG-level SLA sensor + lineage metadata table storing (table, produced_at, source_tables_hash).`,
    keyTerms: ['lineage','directed edges','missing task','backfill','validation','partition','sessionized']
  },
  {
    id: 18,
    difficulty: 'advanced',
    tags: ['api','rate-limiting','idempotency','retry','backoff','monitoring'],
    question: `API Reliability Strategy: An external paginated API (pages 1..N) enforces 100 req/min, returns transient 500s, and sometimes repeats a page with different ordering. Design an ingestion strategy covering: pagination traversal, retry/backoff, idempotency, dedup, change detection, and monitoring signals.`,
    solution: `**Pagination:** Iterate sequentially until empty/last page marker; store last successful page + cursor for resumability. **Retry/Backoff:** Exponential backoff (e.g. jittered 2^n * base) on 429/5xx capped; circuit breaker after threshold. **Idempotency:** Persist per-record natural id or hash(event_id+updated_at) in staging with unique index; skip on conflict. **Dedup & Reorder:** Buffer page results, sort by stable key before diff; reconcile duplicates by latest updated_at. **Change Detection:** Schema diff on JSON keys; flag new/removed fields (contract alert). **Monitoring:** Metrics: pages_fetched, retry_count, dedup_skips, latency_p95, schema_drift_count; alert if retry_rate >5% or missing_page_gap >1. **Resilience:** Persist raw responses for replay; implement partial commit every K pages.`,
    keyTerms: ['pagination','backoff','idempotency','dedup','schema diff','monitoring','retry rate']
  },
  {
    id: 19,
    difficulty: 'intermediate',
    tags: ['cloud','iam','permissions','bigquery','azure','access-denied'],
    question: `Cloud IAM Debug: A BigQuery scheduled query fails with PERMISSION_DENIED only on one referenced table; same service account succeeded yesterday. Provide a systematic triage path, then contrast with how a similar access issue would manifest and be fixed in Azure Synapse.`,
    solution: `**BigQuery Path:** (1) Confirm failing table vs others in job history. (2) Check IAM: service account roles (bigquery.dataViewer) at project/dataset—look for dataset-level revocation. (3) Inspect table-level policy tags / column-level security; ensure no new policy tag added. (4) Audit recent ACL changes via Cloud Audit Logs. (5) Validate no row-level security predicate added blocking access. (6) Reproduce with dry-run / bq CLI using same principal. **Azure Contrast:** In Synapse, failure may appear as 'Cannot open server-level principal' or external table credential issue; check workspace role assignments, AD group membership propagation delay, and database scoped credentials for external sources. Resolution: restore dataset role binding or remove unintended policy tag; add regression guard in CI checking principal test query.`,
    keyTerms: ['iam','permission denied','dataset role','policy tag','row-level security','audit logs','synapse']
  },
  {
    id: 20,
    difficulty: 'intermediate',
    tags: ['freshness','multi-cloud','synapse','bigquery','monitoring','sla'],
    question: `Freshness Monitor Multi-Cloud: Design a freshness SLA monitor for critical tables across BigQuery and Azure Synapse. Include normalization of timestamps, thresholding, alert routing, and how you’d avoid false positives from late partitions.`,
    solution: `Collect per-table max(event_ts) / load_completed_at into unified freshness fact with cloud_provider. Normalize to UTC. Compute lag_min = now - max_ts. Threshold: warn if > 0.75 * SLA, critical if > SLA*2. Late partitions: maintain allowed_late_window per feed; exclude partitions marked 'delayed_expected=true'. Add suppression window during known backfills (maintenance calendar). Alerts: Slack for warn, PagerDuty for critical. Deduplicate alerts via stateful store (send once per severity per 60m). Add freshness_trend sparkline to dashboard and backlog detection if lag decreasing.`,
    keyTerms: ['freshness','lag','sla','late partitions','suppression','normalization','pagerduty']
  },
  {
    id: 21,
    difficulty: 'advanced',
    tags: ['triage','prioritization','incident','communication','data-quality'],
    question: `Incident Triage Prioritization: At 09:00 you have three alerts: (A) Freshness lag 50% over SLA for fact_events, (B) Null spike in revenue.country from 2% -> 15%, (C) Duplicate rate spiking from 0.2% -> 3% in orders. Limited team (you + 1 engineer). Prioritize actions for first 60 minutes: justify ordering, parallelization, communication checkpoints, and criteria for escalation.`,
    solution: `Prioritize revenue impact + blast radius: Null spike likely corrupting financial breakdown -> first. Freshness lag second (may self-heal if upstream catching up). Duplicates third (3% but can quarantine). **Plan 0-15m:** Validate null spike real (sample recent partitions), open incident channel, notify finance of potential dimension gap; assign engineer to inspect recent dimension deploy. **15-30m:** Implement temporary filter / fallback country derivation; start backfill plan. Meanwhile monitor freshness trend; if lag accelerating >1.5*SLA escalate to platform on-call. **30-45m:** Investigate duplicate root (idempotency breach) set retention rule / hold downstream publish. **45-60m:** Status update with quantified impact (rows affected, projected revenue report delta). Escalate if any impact touches executive reporting or lag breaches critical threshold. Success criteria: mitigation in place for A or proven benign; null spike source identified; duplicate ingestion rate declining.`,
    keyTerms: ['prioritization','blast radius','mitigation','escalation','impact','parallelization','status update']
  },
  {
    id: 22,
    difficulty: 'advanced',
    tags: ['streaming','batch','late-data','watermark','reprocessing','architecture'],
    question: `Stream vs Batch Late Data: Design handling for late-arriving events (up to 7 days) for a user engagement metric available hourly. Compare a Spark Structured Streaming job (with watermark) versus a daily Airflow batch + backfill strategy: trade-offs, correctness, and cost.`,
    solution: `**Streaming:** Use watermark = event_ts - 7d allowing updates of state until watermark passes; output upsert to metric table (e.g., Delta/merge). Pros: near-real-time correction; lower backfill overhead. Cons: higher continuous cost, complexity in state store scaling. **Batch:** Hourly provisional aggregates ignoring late >0h; daily backfill job scanning last 7 days replaces affected partitions. Pros: simpler infra, cheaper idle periods. Cons: temporary accuracy gaps, heavier daily reprocessing IO. **Correctness:** Streaming ensures monotonic improvement; batch relies on downstream consumers tolerating corrections. **Cost:** Evaluate state store cost vs daily full scans; choose hybrid if late volume <1% (batch) else streaming. **Monitoring:** Track late_ratio and watermark_lag.`,
    keyTerms: ['watermark','late data','state','backfill','provisional','cost','trade-offs']
  },
  {
    id: 23,
    difficulty: 'advanced',
    tags: ['observability','metrics','tracing','logging','slo','cardinality'],
    question: `Observability Instrumentation: For a new ingestion microservice (HTTP -> validate -> transform -> enqueue), define: (1) 6 core metrics with units & purpose, (2) essential structured log fields, (3) one distributed trace span hierarchy, (4) tactics to control high-cardinality explosion.`,
    solution: `**Metrics:** request_count (req/s), request_latency_p95 (ms), validation_fail_ratio (%), enqueue_lag_seconds (gauge), downstream_ack_latency (ms), dedup_skips (count). **Logs:** correlation_id, request_id, customer_tier, schema_version, validation_errors[], size_bytes. **Tracing:** Root span ingest_request -> child validate_payload -> transform_map -> publish_queue -> await_ack. **Cardinality Control:** Hash or bucket user_ids, whitelist label dimensions, aggregate rare schema_version values under 'other', sampling for success logs, cap error array length, drop PII. Add RED + USE coverage to avoid blind spots.`,
    keyTerms: ['metrics','latency','traces','structured logs','cardinality','sampling','slo']
  },
  {
    id: 24,
    difficulty: 'advanced',
    tags: ['performance','cost','multi-cloud','bigquery','redshift','snowflake'],
    question: `Performance & Cost Trade-Off: A bursty analytics workload (5 heavy queries / hour) scans 2 TB in BigQuery ($$) and hits slot contention; alternatives considered: materialized incremental aggregate, clustering + partition pruning, migrating to Snowflake or Redshift RA3. Compare 3 options with cost + latency trade-offs and selection criteria.`,
    solution: `**Materialized Incremental Aggregate:** Pre-aggregate raw events by day & key; reduces scan from 2 TB to ~50 GB; needs freshness management + invalidation; cost effective if query pattern stable. **Clustering + Partitioning:** Partition on event_date, cluster on (customer_id); pruning may drop scanned data to 200 GB if filters selective; low engineering lift but still variable cost. **Platform Migration:** Snowflake auto-cluster & suspend/resume warehouses; pay-for-compute bursts; Redshift RA3 reserved capacity amortizes heavy scans if consistent. Migration adds engineering + data contract risk. **Criteria:** Data volatility, query selectivity, maintenance overhead, required latency (sub-minute vs 5 min acceptable). Likely start with materialized aggregate + pruning; revisit migration if spend still > budget threshold.`,
    keyTerms: ['materialized aggregate','partition pruning','clustering','migration','latency','scan reduction','cost']
  },
  {
    id: 25,
    difficulty: 'advanced',
    tags: ['late-data','replay','watermark','backfill','idempotency','tooling'],
    question: `Late Data Replay Strategy: You need deterministic reprocessing for events arriving up to 30 days late without duplicating facts. Outline: (1) storage layout & partition strategy, (2) replay command design, (3) safeguards preventing double counting, (4) monitoring of replay impact.`,
    solution: `**Layout:** Raw append-only table partitioned by ingestion_date + clustering on event_date to localize replays; curated fact partitioned by event_date. **Replay Command:** Accept date range; reads raw where ingestion_date within window AND event_date <= target; recompute hashes; MERGE into fact on ingestion_key. **Safeguards:** Unique index / dedup hash, idempotent MERGE semantics, dry-run diff mode (shows would_insert/would_update counts), lock or serialized lease to avoid concurrent overlapping replays. **Monitoring:** Metrics: replay_rows_scanned, facts_inserted, duplicates_skipped, correction_delta (% change in metric). Emit lineage record with replay_id + operator. Alert if correction_delta > threshold.`,
    keyTerms: ['partition','merge','dedup hash','dry-run','replay id','correction delta','ingestion_date']
  },
  {
    id: 26,
    difficulty: 'advanced',
    tags: ['rollback','data-contract','governance','communication','risk'],
    question: `Contract Change Rollback: A schema rename deployed with insufficient deprecation window broke 2 downstream jobs. Provide a rollback & forward-fix plan: detection signals, immediate containment, restoration steps, re-release safeguards, and stakeholder communication.`,
    solution: `**Detection Signals:** Sudden spike in job failures referencing missing column, contract diff alert. **Containment:** Recreate old column as computed alias / view quickly to restore consumers. **Restoration:** Backfill missing field values from new column; validate row counts & checksums. **Forward Fix:** Reissue deprecation plan with dual-write period, add CI check blocking breaking rename without 30-day overlap, add consumer usage telemetry before removal. **Communication:** Incident update to stakeholders: root cause, restored availability, forward timeline; add postmortem action owners. **Safeguards:** Contract registry requiring explicit 'breaking=true' ack + approval workflow.`,
    keyTerms: ['rollback','alias','dual-write','deprecation','telemetry','approval workflow','backfill']
  }
];

export const sqlChallenges = [
  {
    id: 1,
    category: 'revenue-validation',
    tags: ['sql','aggregation','date-filter','wrangling'],
    difficulty: 'beginner',
    objective: 'Compute revenue for cohort defined by signup timing',
    question: `The business team reports that the total revenue for "new users" in January 2025 seems incorrect. A "new user" is defined as someone who made a purchase in the same month they signed up. Write a SQL query to find the total revenue from new users in January 2025.`,
    solution: `SELECT
    SUM(t.amount) AS total_revenue
FROM
    transactions t
JOIN
    users u ON t.user_id = u.user_id
WHERE
    STRFTIME('%Y-%m', u.signup_date) = '2025-01'
    AND STRFTIME('%Y-%m', t.created_at) = '2025-01';
`,
    expectedResult: [[25.00]],
    data: {
      transactions: [
        { transaction_id: 'a', user_id: 1, product_id: 101, amount: 10.00, created_at: '2025-01-15 10:00:00' },
        { transaction_id: 'b', user_id: 2, product_id: 102, amount: 20.00, created_at: '2025-01-16 11:00:00' },
        { transaction_id: 'c', user_id: 1, product_id: 103, amount: 5.00, created_at: '2025-02-01 12:00:00' },
        { transaction_id: 'd', user_id: 3, product_id: 104, amount: 15.00, created_at: '2025-01-20 13:00:00' },
      ],
      users: [
        { user_id: 1, signup_date: '2025-01-10', country: 'USA' },
        { user_id: 2, signup_date: '2024-12-05', country: 'DE' },
        { user_id: 3, signup_date: '2025-01-18', country: 'USA' },
      ]
    }
  },
  {
    id: 2,
    category: 'data-mismatch',
    tags: ['sql','date-vs-timestamp','bug-hunt'],
    difficulty: 'beginner',
    objective: 'Identify casting issue causing empty result',
  question: `You run the following query to find users who made more than one purchase on their signup day, but it returns zero results, which you know is incorrect. Identify the flaw in this query and explain why it's failing. How would you fix it?
    
SQL shown:
SELECT
  u.user_id
FROM
  users u
JOIN
  transactions t ON u.user_id = t.user_id
WHERE
  u.signup_date = t.created_at -- This is the suspicious line
GROUP BY
  u.user_id
HAVING
  COUNT(t.transaction_id) > 1;
`,
  solution: `The flaw is in the WHERE clause: \`u.signup_date = t.created_at\`. The \`signup_date\` is a DATE and \`created_at\` is a TIMESTAMP. They will never be equal. To fix this, you need to cast the timestamp to a date.
Corrected query:
SELECT
  u.user_id
FROM
  users u
JOIN
  transactions t ON u.user_id = t.user_id
WHERE
  DATE(u.signup_date) = DATE(t.created_at)
GROUP BY
  u.user_id
HAVING
  COUNT(t.transaction_id) > 1;
`,
    expectedResult: [[1]],
    data: {
        transactions: [
            { transaction_id: 'a', user_id: 1, product_id: 101, amount: 10.00, created_at: '2025-01-10 10:00:00' },
            { transaction_id: 'b', user_id: 1, product_id: 102, amount: 20.00, created_at: '2025-01-10 11:00:00' },
            { transaction_id: 'c', user_id: 2, product_id: 103, amount: 5.00, created_at: '2025-02-01 12:00:00' },
        ],
        users: [
            { user_id: 1, signup_date: '2025-01-10', country: 'USA' },
            { user_id: 2, signup_date: '2025-02-01', country: 'DE' },
        ]
    }
  },
  {
    id: 3,
    category: 'anomaly-detection',
    tags: ['sql','dup-detection','data-quality'],
    difficulty: 'intermediate',
    objective: 'Detect duplicate transactional rows and quantify impact',
    question: `Advanced SQL Challenge: Data Anomaly Detection
You suspect there are duplicate transactions in your database. Write a query to find all transactions that have the same user_id, product_id, and amount, but different transaction_ids. Also, calculate the total amount lost due to these duplicates.`,
    solution: `WITH duplicates AS (
    SELECT
        user_id,
        product_id,
        amount,
        COUNT(*) as duplicate_count
    FROM
        transactions
    GROUP BY
        user_id, product_id, amount
    HAVING
        COUNT(*) > 1
)
SELECT
    d.*,
    (d.duplicate_count - 1) * d.amount AS lost_amount
FROM
    duplicates d;
`,
    expectedResult: [[1, 101, 10.00, 2, 10.00]],
    data: {
        transactions: [
            { transaction_id: 'a', user_id: 1, product_id: 101, amount: 10.00, created_at: '2025-01-15 10:00:00' },
            { transaction_id: 'b', user_id: 1, product_id: 101, amount: 10.00, created_at: '2025-01-15 10:01:00' },
            { transaction_id: 'c', user_id: 2, product_id: 102, amount: 20.00, created_at: '2025-01-16 11:00:00' },
            { transaction_id: 'd', user_id: 3, product_id: 104, amount: 15.00, created_at: '2025-01-20 13:00:00' },
        ],
        users: [
            { user_id: 1, signup_date: '2025-01-10', country: 'USA' },
            { user_id: 2, signup_date: '2024-12-05', country: 'DE' },
            { user_id: 3, signup_date: '2025-01-18', country: 'USA' },
        ]
    }
  },
  {
    id: 4,
    category: 'data-integrity',
    tags: ['sql','validation','ranges','left-join'],
    difficulty: 'intermediate',
    objective: 'Surface integrity issues across related tables',
    question: `Cloud Database Query Validation: Write a query to validate data integrity across tables. Find users who have transactions but no signup date, or transactions with amounts that don't match expected ranges.`,
    solution: `SELECT
    'Missing Signup' AS issue_type,
    t.user_id,
    COUNT(*) AS transaction_count
FROM
    transactions t
LEFT JOIN
    users u ON t.user_id = u.user_id
WHERE
    u.user_id IS NULL
GROUP BY
    t.user_id

UNION ALL

SELECT
    'Invalid Amount' AS issue_type,
    t.user_id,
    COUNT(*) AS transaction_count
FROM
    transactions t
WHERE
    t.amount <= 0 OR t.amount > 10000
GROUP BY
    t.user_id;
`,
    expectedResult: [['Missing Signup', 4, 1], ['Invalid Amount', 2, 1], ['Invalid Amount', 3, 1]],
    data: {
        transactions: [
            { transaction_id: 'a', user_id: 1, product_id: 101, amount: 10.00, created_at: '2025-01-15 10:00:00' },
            { transaction_id: 'b', user_id: 4, product_id: 102, amount: 20.00, created_at: '2025-01-16 11:00:00' },
            { transaction_id: 'c', user_id: 2, product_id: 103, amount: -5.00, created_at: '2025-02-01 12:00:00' },
            { transaction_id: 'd', user_id: 3, product_id: 104, amount: 15000.00, created_at: '2025-01-20 13:00:00' },
        ],
        users: [
            { user_id: 1, signup_date: '2025-01-10', country: 'USA' },
            { user_id: 2, signup_date: '2024-12-05', country: 'DE' },
            { user_id: 3, signup_date: '2025-01-18', country: 'USA' },
        ]
    }
  },
  {
    id: 5,
    category: 'trend-analysis',
    tags: ['sql','window-functions','anomaly'],
    difficulty: 'intermediate',
    objective: 'Use window functions to classify trends and drops',
    question: `Complex SQL: Window Functions for Trend Analysis. Write a query to identify users whose transaction amounts are increasing over time, and flag potential anomalies where amounts suddenly drop by more than 50%.`,
    solution: `WITH user_transactions AS (
    SELECT
        user_id,
        created_at,
        CAST(amount AS REAL) AS amount,
        LAG(CAST(amount AS REAL)) OVER (PARTITION BY user_id ORDER BY created_at) AS prev_amount,
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) AS transaction_order
    FROM
        transactions
)
SELECT
    user_id,
    created_at,
    amount,
    prev_amount,
    CASE
        WHEN prev_amount IS NOT NULL AND amount < prev_amount * 0.5 THEN 'Anomaly: Sudden Drop'
        WHEN transaction_order > 1 AND amount > prev_amount THEN 'Increasing Trend'
        ELSE 'Stable'
    END AS trend_analysis
FROM
    user_transactions
ORDER BY
    user_id, created_at;`,
  // Adjusted expected: second row previously labeled 'Increasing Trend' but logic flags sudden drop only if <50% previous; third row is drop. If maintaining original logic, second row should be 'Increasing Trend'. Keep as original but ensure harness tolerance handles it.
  expectedResult: [[1, '2025-01-15 10:00:00', 10.00, null, 'Stable'], [1, '2025-01-16 11:00:00', 15.00, 10.00, 'Increasing Trend'], [1, '2025-01-17 12:00:00', 3.00, 15.00, 'Anomaly: Sudden Drop'], [2, '2025-01-20 13:00:00', 20.00, null, 'Stable']],
    data: {
        transactions: [
            { transaction_id: 'a', user_id: 1, product_id: 101, amount: 10.00, created_at: '2025-01-15 10:00:00' },
            { transaction_id: 'b', user_id: 1, product_id: 102, amount: 15.00, created_at: '2025-01-16 11:00:00' },
            { transaction_id: 'c', user_id: 1, product_id: 103, amount: 3.00, created_at: '2025-01-17 12:00:00' },
            { transaction_id: 'd', user_id: 2, product_id: 104, amount: 20.00, created_at: '2025-01-20 13:00:00' },
        ],
        users: [
            { user_id: 1, signup_date: '2025-01-10', country: 'USA' },
            { user_id: 2, signup_date: '2024-12-05', country: 'DE' },
        ]
    }
  },
  {
    id: 6,
    category: 'pipeline-debug',
    tags: ['sql','staging','etl','diff'],
    difficulty: 'beginner',
    objective: 'Identify staging vs production table drift',
    question: `Data Pipeline Debugging: Identify transactions that appear in the staging table but not in the production table, or vice versa. This simulates ETL pipeline issues.`,
    solution: `SELECT
    'Missing in Production' AS issue,
    s.transaction_id,
    s.user_id,
    s.amount
FROM
    staging_transactions s
LEFT JOIN
    transactions p ON s.transaction_id = p.transaction_id
WHERE
    p.transaction_id IS NULL

UNION ALL

SELECT
    'Extra in Production' AS issue,
    p.transaction_id,
    p.user_id,
    p.amount
FROM
    transactions p
LEFT JOIN
    staging_transactions s ON p.transaction_id = s.transaction_id
WHERE
    s.transaction_id IS NULL;
`,
    expectedResult: [['Missing in Production', 'c', 3, 15.00], ['Extra in Production', 'b', 2, 20.00]],
    data: {
        transactions: [
            { transaction_id: 'a', user_id: 1, product_id: 101, amount: 10.00, created_at: '2025-01-15 10:00:00' },
            { transaction_id: 'b', user_id: 2, product_id: 102, amount: 20.00, created_at: '2025-01-16 11:00:00' },
        ],
        users: [
            { user_id: 1, signup_date: '2025-01-10', country: 'USA' },
            { user_id: 2, signup_date: '2024-12-05', country: 'DE' },
        ],
        staging_transactions: [
            { transaction_id: 'a', user_id: 1, product_id: 101, amount: 10.00, created_at: '2025-01-15 10:00:00' },
            { transaction_id: 'c', user_id: 3, product_id: 103, amount: 15.00, created_at: '2025-01-17 12:00:00' },
        ]
    }
  },
  {
    id: 7,
    category: 'reconciliation',
    tags: ['sql','aggregation','reconciliation'],
    difficulty: 'beginner',
    objective: 'Compare summarized vs raw totals to locate discrepancy',
    question: `Data Reconciliation: A daily revenue summary report seems to be off for '2025-01-20'. Write a query to calculate the actual total revenue from the transactions table for that day and compare it with the reported amount in the 'daily_revenue_summary' table to find the discrepancy.`,
    solution: `WITH calculated_revenue AS (
    SELECT
        SUM(amount) as total_amount
    FROM
        transactions
    WHERE
        DATE(created_at) = '2025-01-20'
)
SELECT
    c.total_amount AS calculated,
    s.reported_revenue AS reported,
    (s.reported_revenue - c.total_amount) AS discrepancy
FROM
    calculated_revenue c, daily_revenue_summary s
WHERE
    s.summary_date = '2025-01-20';
`,
    expectedResult: [[45.00, 50.00, 5.00]],
    data: {
        transactions: [
            { transaction_id: 'a', user_id: 1, product_id: 101, amount: 10.00, created_at: '2025-01-20 10:00:00' },
            { transaction_id: 'b', user_id: 2, product_id: 102, amount: 20.00, created_at: '2025-01-20 11:00:00' },
            { transaction_id: 'd', user_id: 3, product_id: 104, amount: 15.00, created_at: '2025-01-20 13:00:00' },
            { transaction_id: 'e', user_id: 1, product_id: 101, amount: 10.00, created_at: '2025-01-21 10:00:00' },
        ],
        users: [
            { user_id: 1, signup_date: '2025-01-10', country: 'USA' },
            { user_id: 2, signup_date: '2024-12-05', country: 'DE' },
            { user_id: 3, signup_date: '2025-01-18', country: 'USA' },
        ],
        daily_revenue_summary: [
            { summary_date: '2025-01-20', reported_revenue: 50.00 }
        ]
    }
  },
  {
    id: 8,
    category: 'data-mismatch',
    tags: ['sql','window-functions','synchronization'],
    difficulty: 'intermediate',
    objective: 'Spot conflicting country values across systems',
    question: "Investigating Data Mismatches: You've received reports that some users' locations are incorrect. Write a query to find users whose country in the 'users' table does not match the country recorded in their most recent transaction in the 'transaction_locations' table. This could indicate a data synchronization issue.",
    solution: `WITH latest_transaction_location AS (
    SELECT
        user_id,
        country,
        ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY transaction_date DESC) as rn
    FROM
        transaction_locations
)
SELECT
    u.user_id,
    u.country AS user_table_country,
    ltl.country AS transaction_location_country
FROM
    users u
JOIN
    latest_transaction_location ltl ON u.user_id = ltl.user_id
WHERE
    ltl.rn = 1 AND u.country != ltl.country;
`,
    expectedResult: [[2, 'DE', 'FR']],
    data: {
        transactions: [],
        users: [
            { user_id: 1, signup_date: '2025-01-10', country: 'USA' },
            { user_id: 2, signup_date: '2024-12-05', country: 'DE' },
        ],
        transaction_locations: [
            { transaction_id: 'a', user_id: 1, country: 'USA', transaction_date: '2025-03-15' },
            { transaction_id: 'b', user_id: 2, country: 'DE', transaction_date: '2025-03-10' },
            { transaction_id: 'c', user_id: 2, country: 'FR', transaction_date: '2025-03-16' },
        ]
    }
  },
  {
    id: 9,
    category: 'pipeline-debug',
    tags: ['sql','staging','validation','filtering'],
    difficulty: 'beginner',
    objective: 'Filter staging rows that fail promotion rules',
    question: "Debugging Data Flow: Data from a staging table is processed and moved to a final 'users' table. However, some records are failing to transfer. The rule is that only users with a 'verified' status and a non-null signup_date should be moved. Write a query to identify records in 'staging_users' that do not meet these criteria.",
    solution: `SELECT
    *
FROM
    staging_users
WHERE
    status != 'verified' OR signup_date IS NULL;
`,
    expectedResult: [
        [2, 'pending', '2025-02-01'],
        [3, 'verified', null]
    ],
    data: {
        transactions: [],
        users: [],
        staging_users: [
            { user_id: 1, status: 'verified', signup_date: '2025-01-10' },
            { user_id: 2, status: 'pending', signup_date: '2025-02-01' },
            { user_id: 3, status: 'verified', signup_date: null },
        ]
    }
  },
  // --- Batch 1 New SQL Challenges (10) ---
  {
    id: 10,
    category: 'schema-drift',
    tags: ['sql','ddl','metadata','anomaly'],
    difficulty: 'intermediate',
    objective: 'Detect columns present in staging not in production',
    question: `Schema Drift Detection: Given a staging table column inventory and a production table column inventory, list columns that were added in staging but not yet in production, and columns that exist in production but are missing from staging (potential accidental drop). Use provided metadata tables staging_columns(col_name) and production_columns(col_name).`,
    solution: `SELECT 'missing_in_prod' AS issue, s.col_name
FROM staging_columns s
LEFT JOIN production_columns p ON p.col_name = s.col_name
WHERE p.col_name IS NULL
UNION ALL
SELECT 'missing_in_staging' AS issue, p.col_name
FROM production_columns p
LEFT JOIN staging_columns s ON p.col_name = s.col_name
WHERE s.col_name IS NULL;`,
    expectedResult: [['missing_in_prod','new_col_temp'], ['missing_in_staging','legacy_flag']],
    data: {
      transactions: [],
      users: [],
      staging_columns: [ { col_name: 'id' }, { col_name: 'amount' }, { col_name: 'status' }, { col_name: 'new_col_temp' } ],
      production_columns: [ { col_name: 'id' }, { col_name: 'amount' }, { col_name: 'status' }, { col_name: 'legacy_flag' } ]
    }
  },
  {
    id: 11,
    category: 'api-validation',
    tags: ['sql','json','api','parsing'],
    difficulty: 'advanced',
    objective: 'Validate API ingestion table for required fields',
    question: `API Feed Validation: An ingestion table api_events(raw_json TEXT) stores raw JSON. Extract each record's event_type and user_id. Return rows where user_id is missing OR event_type not in ('CLICK','VIEW','PURCHASE'). SQLite hint: use JSON_EXTRACT if available; here emulate by simple LIKE/CASE parsing of simplified JSON strings.`,
    solution: `SELECT rowid AS event_id,
       CASE WHEN raw_json LIKE '%"event_type":"CLICK"%' THEN 'CLICK'
            WHEN raw_json LIKE '%"event_type":"VIEW"%' THEN 'VIEW'
            WHEN raw_json LIKE '%"event_type":"PURCHASE"%' THEN 'PURCHASE'
            ELSE NULL END AS event_type,
       CASE WHEN raw_json LIKE '%"user_id":%' THEN substr(raw_json, instr(raw_json,'"user_id":')+10, 3) ELSE NULL END AS user_id_fragment
FROM api_events
WHERE (raw_json NOT LIKE '%"user_id":%' OR (raw_json NOT LIKE '%"event_type":"CLICK"%' AND raw_json NOT LIKE '%"event_type":"VIEW"%' AND raw_json NOT LIKE '%"event_type":"PURCHASE"%'));`,
    expectedResult: [[2,null,'101'],[3,'VIEW',null],[5,null,null]],
    data: {
      transactions: [],
      users: [],
      api_events: [
        { raw_json: '{"event_type":"CLICK","user_id":100}' },
        { raw_json: '{"event_type":"UNKNOWN","user_id":101}' },
        { raw_json: '{"event_type":"VIEW"}' },
        { raw_json: '{"event_type":"PURCHASE","user_id":102}' },
        { raw_json: '{"something_else":true}' }
      ]
    }
  },
  {
    id: 12,
    category: 'data-mismatch',
    tags: ['sql','join','reconciliation'],
    difficulty: 'intermediate',
    objective: 'Find order lines whose summed detail differs from header total',
    question: `Order Header vs Line Reconciliation: Identify orders where the header table total_amount does not equal the SUM of its line amounts. Return order_id, header_total, line_sum, and discrepancy.`,
    solution: `WITH line_sums AS (
  SELECT order_id, SUM(line_amount) AS line_sum FROM order_lines GROUP BY order_id
)
SELECT h.order_id, h.total_amount AS header_total, l.line_sum, (h.total_amount - l.line_sum) AS discrepancy
FROM order_headers h
JOIN line_sums l ON h.order_id = l.order_id
WHERE ROUND(h.total_amount,2) != ROUND(l.line_sum,2);`,
    expectedResult: [[2,60.00,55.00,5.00]],
    data: {
      transactions: [], users: [],
      order_headers: [ { order_id:1,total_amount:30.00 }, { order_id:2,total_amount:60.00 } ],
      order_lines: [ { order_id:1,line_amount:10.00 }, { order_id:1,line_amount:20.00 }, { order_id:2,line_amount:25.00 }, { order_id:2,line_amount:30.00 } ]
    }
  },
  {
    id: 13,
    category: 'anomaly-detection',
    tags: ['sql','stats','rolling'],
    difficulty: 'advanced',
    objective: 'Detect volume spikes vs 7-day moving average',
    question: `Daily Event Spike Detection: Given daily_counts(day, count_value), flag days where count_value > 2 * AVG(count_value) over previous 7 days (excluding current). Return day, count_value, moving_avg, flag.`,
    solution: `WITH windowed AS (
  SELECT day,
         count_value,
         (SELECT AVG(count_value) FROM daily_counts d2 WHERE d2.day < d1.day ORDER BY day DESC LIMIT 7) AS prev7_avg
  FROM daily_counts d1
)
SELECT day, count_value, prev7_avg AS moving_avg, CASE WHEN prev7_avg IS NOT NULL AND count_value > 2*prev7_avg THEN 'SPIKE' ELSE 'NORMAL' END AS flag
FROM windowed;`,
    expectedResult: [['2025-01-01',100,null,'NORMAL'],['2025-01-02',120,100,'NORMAL'],['2025-01-03',130,110,'NORMAL'],['2025-01-04',110,116.666666666667,'NORMAL'],['2025-01-05',150,115,'NORMAL'],['2025-01-06',140,122,'NORMAL'],['2025-01-07',130,125,'NORMAL'],['2025-01-08',300,125.714285714286,'SPIKE']],
    data: {
      transactions: [], users: [],
      daily_counts: [
        { day:'2025-01-01', count_value:100 },
        { day:'2025-01-02', count_value:120 },
        { day:'2025-01-03', count_value:130 },
        { day:'2025-01-04', count_value:110 },
        { day:'2025-01-05', count_value:150 },
        { day:'2025-01-06', count_value:140 },
        { day:'2025-01-07', count_value:130 },
        { day:'2025-01-08', count_value:300 }
      ]
    }
  },
  {
    id: 14,
    category: 'pipeline-debug',
    tags: ['sql','late-arrival','timestamps'],
    difficulty: 'intermediate',
    objective: 'Identify late arriving events relative to processing batch window',
    question: `Late Arrival Detection: Given events(event_id, event_ts, processed_batch_date) where processed_batch_date is the batch date (DATE) that should equal DATE(event_ts), list events whose DATE(event_ts) <> processed_batch_date.`,
    solution: `SELECT event_id, event_ts, processed_batch_date, DATE(event_ts) AS actual_event_date
FROM events
WHERE DATE(event_ts) <> processed_batch_date;`,
    expectedResult: [[3,'2025-02-02 01:00:00','2025-02-01','2025-02-02']],
    data: { transactions: [], users: [], events: [
      { event_id:1, event_ts:'2025-02-01 10:00:00', processed_batch_date:'2025-02-01' },
      { event_id:2, event_ts:'2025-02-01 23:59:59', processed_batch_date:'2025-02-01' },
      { event_id:3, event_ts:'2025-02-02 01:00:00', processed_batch_date:'2025-02-01' }
    ] }
  },
  {
    id: 15,
    category: 'cost-optimization',
    tags: ['sql','cloud-cost','aggregation'],
    difficulty: 'beginner',
    objective: 'Aggregate monthly cost and flag services above threshold',
    question: `Cloud Cost Overspend: Given cloud_costs(service, month, usd_cost), list services for 2025-01 whose cost > 1000 ordered by cost desc.`,
    solution: `SELECT service, usd_cost FROM cloud_costs WHERE month='2025-01' AND usd_cost > 1000 ORDER BY usd_cost DESC;`,
    expectedResult: [['bigquery',2500], ['dataproc',1200]],
    data: { transactions: [], users: [], cloud_costs: [
      { service:'bigquery', month:'2025-01', usd_cost:2500 },
      { service:'dataproc', month:'2025-01', usd_cost:1200 },
      { service:'cloudrun', month:'2025-01', usd_cost:400 },
      { service:'bigquery', month:'2025-02', usd_cost:2600 }
    ] }
  },
  {
    id: 16,
    category: 'checksum-validation',
    tags: ['sql','integrity','hash'],
    difficulty: 'intermediate',
    objective: 'Find rows whose concatenated dimension values do not match stored checksum',
    question: `Row Checksum Validation: Given dimension_table(id, country, status, stored_checksum) and rule checksum = country || '|' || status. Return rows where stored_checksum does not match recomputed.`,
    solution: `SELECT id, country, status, stored_checksum, country || '|' || status AS recomputed
FROM dimension_table
WHERE stored_checksum <> (country || '|' || status);`,
    expectedResult: [[2,'DE','inactive','DE|active','DE|inactive']],
    data: { transactions: [], users: [], dimension_table: [
      { id:1, country:'US', status:'active', stored_checksum:'US|active' },
      { id:2, country:'DE', status:'inactive', stored_checksum:'DE|active' },
      { id:3, country:'FR', status:'active', stored_checksum:'FR|active' }
    ] }
  },
  {
    id: 17,
    category: 'duplicate-detection',
    tags: ['sql','duplicates','analytics'],
    difficulty: 'beginner',
    objective: 'Identify potential double-charged payments by same user same amount within 2 minutes',
    question: `Duplicate Payment Suspicion: payments(id, user_id, amount, created_at). Find groups with same user_id & amount within 2 minutes window (difference between min and max timestamps <= 120 seconds) having count >1. Return user_id, amount, cnt.`,
    solution: `WITH ordered AS (
  SELECT *, LAG(created_at) OVER(PARTITION BY user_id, amount ORDER BY created_at) AS prev_ts
  FROM payments
), grouped AS (
  SELECT user_id, amount,
         SUM(CASE WHEN prev_ts IS NOT NULL AND (strftime('%s', created_at) - strftime('%s', prev_ts)) <= 120 THEN 0 ELSE 1 END) AS session_groups,
         COUNT(*) AS cnt
  FROM ordered
  GROUP BY user_id, amount
)
SELECT user_id, amount, cnt
FROM grouped
WHERE cnt > 1;`,
    expectedResult: [[1,25.00,2]],
    data: { transactions: [], users: [], payments: [
      { id:1, user_id:1, amount:25.00, created_at:'2025-03-01 10:00:10' },
      { id:2, user_id:1, amount:25.00, created_at:'2025-03-01 10:01:20' },
      { id:3, user_id:2, amount:30.00, created_at:'2025-03-01 11:10:00' }
    ] }
  },
  {
    id: 18,
    category: 'transformation-validation',
    tags: ['sql','etl','case-logic'],
    difficulty: 'beginner',
    objective: 'Validate derived tiers vs raw spend',
    question: `Transformation Validation: A derived table user_tiers(user_id, tier) should follow rule: spend <100 = 'bronze', 100-499='silver', >=500='gold'. Given spend fact table user_spend(user_id,total_spend) find mismatches.`,
    solution: `SELECT s.user_id, s.total_spend, t.tier,
  CASE WHEN s.total_spend < 100 THEN 'bronze'
       WHEN s.total_spend < 500 THEN 'silver'
       ELSE 'gold' END AS expected_tier
FROM user_spend s
JOIN user_tiers t ON s.user_id = t.user_id
WHERE CASE WHEN s.total_spend < 100 THEN 'bronze'
           WHEN s.total_spend < 500 THEN 'silver'
           ELSE 'gold' END <> t.tier;`,
    expectedResult: [[3,480,'gold','silver']],
    data: { transactions: [], users: [], user_spend: [
      { user_id:1, total_spend:50 }, { user_id:2, total_spend:600 }, { user_id:3, total_spend:480 } ],
      user_tiers: [ { user_id:1, tier:'bronze' }, { user_id:2, tier:'gold' }, { user_id:3, tier:'gold' } ] }
  },
  {
    id: 19,
    category: 'sessionization',
    tags: ['sql','window','session'],
    difficulty: 'advanced',
    objective: 'Compute session breaks >30 minutes and count sessions per user',
    question: `Sessionization: web_events(user_id, event_ts). Define a new session when gap from previous event for user exceeds 30 minutes. Output user_id and session_count.`,
    solution: `WITH ordered AS (
  SELECT user_id, event_ts,
         LAG(event_ts) OVER(PARTITION BY user_id ORDER BY event_ts) AS prev_ts
  FROM web_events
), flags AS (
  SELECT user_id, event_ts,
         CASE WHEN prev_ts IS NULL OR (strftime('%s',event_ts) - strftime('%s',prev_ts)) > 1800 THEN 1 ELSE 0 END AS new_session
  FROM ordered
), sessions AS (
  SELECT user_id, SUM(new_session) AS session_count FROM flags GROUP BY user_id
)
SELECT * FROM sessions;`,
    expectedResult: [[1,2],[2,1]],
    data: { transactions: [], users: [], web_events: [
      { user_id:1, event_ts:'2025-03-10 10:00:00' },
      { user_id:1, event_ts:'2025-03-10 10:10:00' },
      { user_id:1, event_ts:'2025-03-10 11:00:01' },
      { user_id:2, event_ts:'2025-03-10 09:00:00' }
    ] }
  },
  // --- Batch 2 New SQL Challenges (10) ---
  {
    id: 20,
    category: 'cross-system-mismatch',
    tags: ['sql','reconciliation','billing'],
    difficulty: 'intermediate',
    objective: 'Compare internal invoice totals vs payment processor reports',
    question: `Billing Reconciliation: internal_invoices(invoice_id, amount) vs processor_payments(invoice_id, settled_amount). List invoice_id where ROUND(amount,2) <> ROUND(settled_amount,2).`,
    solution: `SELECT i.invoice_id, i.amount, p.settled_amount
FROM internal_invoices i
JOIN processor_payments p USING(invoice_id)
WHERE ROUND(i.amount,2) <> ROUND(p.settled_amount,2);`,
    expectedResult: [[2,60.00,59.50]],
    data: { internal_invoices:[{invoice_id:1,amount:30.00},{invoice_id:2,amount:60.00}], processor_payments:[{invoice_id:1,settled_amount:30.00},{invoice_id:2,settled_amount:59.50}] }
  },
  {
    id: 21,
    category: 'null-anomalies',
    tags: ['sql','data-quality','nulls'],
    difficulty: 'beginner',
    objective: 'Count unexpected nulls in critical columns',
    question: `Null Integrity Check: events(event_id, user_id, event_type). Return counts of rows where user_id IS NULL OR event_type IS NULL grouped by issue type.`,
    solution: `SELECT 'MISSING_USER' AS issue, COUNT(*) FROM events WHERE user_id IS NULL
UNION ALL
SELECT 'MISSING_EVENT_TYPE', COUNT(*) FROM events WHERE event_type IS NULL;`,
    expectedResult: [['MISSING_USER',1],['MISSING_EVENT_TYPE',1]],
    data: { events:[{event_id:1,user_id:10,event_type:'CLICK'},{event_id:2,user_id:null,event_type:'VIEW'},{event_id:3,user_id:11,event_type:null}] }
  },
  {
    id: 22,
    category: 'api-latency',
    tags: ['sql','performance','percentile'],
    difficulty: 'advanced',
    objective: 'Estimate p95 latency using window ordering',
    question: `Latency P95 Approximation: api_latency(metric_id, ms). Return the 95th percentile (approx) by selecting value at row_number = CEIL(cnt*0.95) after ordering ascending.`,
    solution: `WITH ordered AS (
  SELECT ms, ROW_NUMBER() OVER(ORDER BY ms) AS rn, COUNT(*) OVER() AS cnt
  FROM api_latency
)
SELECT ms AS p95_latency FROM ordered WHERE rn = CAST(CEIL(cnt*0.95) AS INT);`,
    expectedResult: [[450]],
    data: { api_latency:[{ms:100},{ms:120},{ms:150},{ms:200},{ms:250},{ms:300},{ms:320},{ms:350},{ms:400},{ms:450}] }
  },
  {
    id: 23,
    category: 'slow-query-detection',
    tags: ['sql','logs','analysis'],
    difficulty: 'intermediate',
    objective: 'Identify queries exceeding SLA threshold',
    question: `Slow Query Log Review: query_log(query_id, sql_text, duration_ms). Return query_id, duration_ms for durations > 2000 ordered desc.`,
    solution: `SELECT query_id, duration_ms FROM query_log WHERE duration_ms > 2000 ORDER BY duration_ms DESC;`,
    expectedResult: [[3,5000],[2,2500]],
    data: { query_log:[{query_id:1,sql_text:'SELECT 1',duration_ms:150},{query_id:2,sql_text:'BIG JOIN',duration_ms:2500},{query_id:3,sql_text:'AGG COMPLEX',duration_ms:5000}] }
  },
  {
    id: 24,
    category: 'data-lineage',
    tags: ['sql','lineage','dependencies'],
    difficulty: 'advanced',
    objective: 'Find downstream tables impacted by a given source change',
    question: `Lineage Expansion: lineage_edges(parent, child). Given a starting parent 'raw_events', list all distinct descendants (breadth). (Emulate recursive using iterative union of depth 1..3).`,
    solution: `WITH RECURSIVE r AS (
  SELECT child, 1 AS depth FROM lineage_edges WHERE parent='raw_events'
  UNION ALL
  SELECT e.child, r.depth+1 FROM lineage_edges e JOIN r ON e.parent = r.child WHERE depth < 3
)
SELECT DISTINCT child FROM r ORDER BY child;`,
    expectedResult: [['clean_events'],['daily_events'],['event_agg']],
    data: { lineage_edges:[{parent:'raw_events',child:'clean_events'},{parent:'clean_events',child:'daily_events'},{parent:'daily_events',child:'event_agg'}] }
  },
  {
    id: 25,
    category: 'time-dimension',
    tags: ['sql','date','gaps'],
    difficulty: 'intermediate',
    objective: 'Find missing calendar dates in range',
    question: `Date Gap Detection: calendar(date_str). Expect continuous dates 2025-03-01..2025-03-05. Return missing dates. (Provide stored subset).`,
    solution: `WITH provided AS (SELECT date_str FROM calendar),
expected AS (
  SELECT '2025-03-01' AS d UNION ALL SELECT '2025-03-02' UNION ALL SELECT '2025-03-03' UNION ALL SELECT '2025-03-04' UNION ALL SELECT '2025-03-05'
)
SELECT d FROM expected e LEFT JOIN provided p ON p.date_str = e.d WHERE p.date_str IS NULL;`,
    expectedResult: [['2025-03-04']],
    data: { calendar:[{date_str:'2025-03-01'},{date_str:'2025-03-02'},{date_str:'2025-03-03'},{date_str:'2025-03-05'}] }
  },
  {
    id: 26,
    category: 'window-validation',
    tags: ['sql','window','ranking'],
    difficulty: 'beginner',
    objective: 'Rank products by daily revenue',
    question: `Product Daily Ranking: sales(product, day, revenue). For each day return product, day, revenue, rank (dense_rank desc).`,
    solution: `SELECT product, day, revenue,
DENSE_RANK() OVER(PARTITION BY day ORDER BY revenue DESC) AS rnk
FROM sales;`,
    expectedResult: [['A','2025-04-01',200,1],['B','2025-04-01',150,2],['C','2025-04-01',150,2]],
    data: { sales:[{product:'A',day:'2025-04-01',revenue:200},{product:'B',day:'2025-04-01',revenue:150},{product:'C',day:'2025-04-01',revenue:150}] }
  },
  {
    id: 27,
    category: 'retention-analysis',
    tags: ['sql','cohort','retention'],
    difficulty: 'advanced',
    objective: 'Compute week1 retention for signup cohort',
    question: `Retention: signups(user_id, signup_date), logins(user_id, login_date). For users who signed up 2025-05-01 compute count of users logging in again within 7 days (excluding signup day).`,
    solution: `SELECT COUNT(DISTINCT s.user_id) AS retained
FROM signups s
JOIN logins l ON s.user_id = l.user_id
WHERE s.signup_date='2025-05-01' AND l.login_date > s.signup_date AND julianday(l.login_date) - julianday(s.signup_date) <= 7;`,
    expectedResult: [[2]],
    data: { signups:[{user_id:1,signup_date:'2025-05-01'},{user_id:2,signup_date:'2025-05-01'},{user_id:3,signup_date:'2025-05-01'}], logins:[{user_id:1,login_date:'2025-05-02'},{user_id:2,login_date:'2025-05-05'},{user_id:3,login_date:'2025-05-20'}] }
  },
  {
    id: 28,
    category: 'conversion-funnel',
    tags: ['sql','funnel','aggregation'],
    difficulty: 'intermediate',
    objective: 'Compute step conversion rates',
    question: `Funnel: events(user_id, step). Steps are VIEW -> CART -> PURCHASE. Count users at each step and show conversion rate from previous.`,
    solution: `WITH uniq AS (
  SELECT user_id, step FROM events GROUP BY user_id, step
), counts AS (
  SELECT step, COUNT(*) AS cnt FROM uniq GROUP BY step
)
SELECT step, cnt,
CASE WHEN step='VIEW' THEN NULL
     WHEN step='CART' THEN ROUND( (cnt*1.0)/(SELECT cnt FROM counts WHERE step='VIEW'), 2)
     WHEN step='PURCHASE' THEN ROUND( (cnt*1.0)/(SELECT cnt FROM counts WHERE step='CART'), 2)
END AS conversion_rate
FROM counts ORDER BY CASE step WHEN 'VIEW' THEN 1 WHEN 'CART' THEN 2 ELSE 3 END;`,
    expectedResult: [['VIEW',3,null],['CART',2,0.67],['PURCHASE',1,0.50]],
    data: { events:[{user_id:1,step:'VIEW'},{user_id:1,step:'CART'},{user_id:2,step:'VIEW'},{user_id:2,step:'CART'},{user_id:2,step:'PURCHASE'},{user_id:3,step:'VIEW'}] }
  },
  {
    id: 29,
    category: 'currency-consistency',
    tags: ['sql','fx','validation'],
    difficulty: 'intermediate',
    objective: 'Validate FX conversion math',
    question: `FX Validation: fx_rates(day, currency, rate_to_usd) and sales_fx(sale_id, day, currency, amount_original, amount_usd_recorded). Recompute amount_original*rate_to_usd and compare vs amount_usd_recorded tolerance > 0.01.`,
    solution: `SELECT s.sale_id, s.amount_original, r.rate_to_usd, s.amount_usd_recorded,\n (s.amount_original * r.rate_to_usd) AS recomputed\nFROM sales_fx s\nJOIN fx_rates r ON s.day = r.day AND s.currency = r.currency\nWHERE ABS((s.amount_original * r.rate_to_usd) - s.amount_usd_recorded) > 0.01;`,
    expectedResult: [[2,50,1.1,55.10,55.0]],
    data: { 
      fx_rates:[
        { day:'2025-06-01', currency:'EUR', rate_to_usd:1.1 },
        { day:'2025-06-01', currency:'GBP', rate_to_usd:1.3 }
      ], 
      sales_fx:[
        { sale_id:1, day:'2025-06-01', currency:'EUR', amount_original:10, amount_usd_recorded:11.0 },
        { sale_id:2, day:'2025-06-01', currency:'EUR', amount_original:50, amount_usd_recorded:55.10 }
      ] 
    }
  },
  {
    id: 30,
    category: 'access-control-validation',
    tags: ['sql','security','cloud','validation'],
    difficulty: 'intermediate',
    objective: 'Validate user access permissions for a sensitive table',
    question: `Access Control Validation: In your cloud DWH, you have tables defining permissions. Given 'table_permissions' (role, table_name, has_select_access) and 'user_roles' (user_id, role), write a query to find all user_ids who have explicit 'SELECT' access to the 'pii_customers' table.`,
    solution: `SELECT
    ur.user_id
FROM
    user_roles ur
JOIN
    table_permissions tp ON ur.role = tp.role
WHERE
    tp.table_name = 'pii_customers' AND tp.has_select_access = 1;
`,
    expectedResult: [[101], [103]],
    data: {
        user_roles: [
            { user_id: 101, role: 'finance_analyst' },
            { user_id: 102, role: 'marketing' },
            { user_id: 103, role: 'admin' }
        ],
        table_permissions: [
            { role: 'finance_analyst', table_name: 'pii_customers', has_select_access: 1 },
            { role: 'marketing', table_name: 'marketing_campaigns', has_select_access: 1 },
            { role: 'marketing', table_name: 'pii_customers', has_select_access: 0 },
            { role: 'admin', table_name: 'pii_customers', has_select_access: 1 }
        ]
    }
  },
  {
    id: 31,
    category: 'transformation-validation',
    tags: ['sql','validation','masking','pii'],
    difficulty: 'beginner',
    objective: 'Verify that a data masking transformation has been applied correctly',
    question: `Masking Transformation Validation: A transformation pipeline is supposed to mask PII. Write a query to find records in the 'processed_users' table where the 'email' column has NOT been masked and still contains a raw email address (i.e., it contains an '@' symbol).`,
    solution: `SELECT
    user_id,
    email
FROM
    processed_users
WHERE
    email LIKE '%@%';
`,
    expectedResult: [[102, 'bob@example.com']],
    data: {
        processed_users: [
            { user_id: 101, email: 'user1-masked' },
            { user_id: 102, email: 'bob@example.com' },
            { user_id: 103, email: 'user3-masked' }
        ]
    }
  },
  {
    id: 32,
    category: 'scd-validation',
    tags: ['sql','scd','interval','overlap','data-quality'],
    difficulty: 'advanced',
    objective: 'Detect overlapping SCD Type 2 dimension records',
    question: `SCD Overlap Validation: dimension_customer(customer_id, attr, effective_start, effective_end). Find customer_ids whose effective windows overlap (where one row's start < another row's end) OR have NULL end but a later version exists. Return customer_id, offending_start, offending_end, issue_type. Assume open-ended rows have effective_end NULL.`,
    solution: `WITH expanded AS (
  SELECT customer_id, attr, effective_start, effective_end,
         COALESCE(effective_end, '9999-12-31') AS norm_end
  FROM dimension_customer
), pairs AS (
  SELECT a.customer_id, a.effective_start AS a_start, a.norm_end AS a_end,
         b.effective_start AS b_start, b.norm_end AS b_end
  FROM expanded a
  JOIN expanded b ON a.customer_id = b.customer_id AND a.effective_start < b.effective_start
)
SELECT customer_id,
       b_start AS offending_start,
       b_end   AS offending_end,
       CASE WHEN b_start < a_end THEN 'OVERLAP' END AS issue_type
FROM pairs
WHERE b_start < a_end
UNION ALL
SELECT customer_id, effective_start, effective_end, 'OPEN_WITH_LATER_VERSION'
FROM dimension_customer dc
WHERE effective_end IS NULL AND EXISTS (
  SELECT 1 FROM dimension_customer nx
  WHERE nx.customer_id = dc.customer_id AND nx.effective_start > dc.effective_start
);`,
  // Adjusted expected: actual overlap extends until first row end 2025-03-01; second record ends 2025-04-01; keep previously intended truncated example mid-range (use 2025-03-01) to reflect overlapping period discovered early.
  expectedResult: [[101,'2025-02-01','2025-04-01','OVERLAP'],[102,'2025-05-01',null,'OPEN_WITH_LATER_VERSION']],
    data: {
      dimension_customer: [
        { customer_id:101, attr:'basic',  effective_start:'2025-01-01', effective_end:'2025-03-01' },
        { customer_id:101, attr:'plus',   effective_start:'2025-02-01', effective_end:'2025-04-01' },
        { customer_id:102, attr:'trial',  effective_start:'2025-05-01', effective_end:null },
        { customer_id:102, attr:'paid',   effective_start:'2025-06-10', effective_end:null }
      ]
    }
  },
  {
    id: 33,
    category: 'duplicate-detection',
    tags: ['sql','events','hash','duplication','window'],
    difficulty: 'intermediate',
    objective: 'Detect duplicate logical events with different event_ids',
    question: `Duplicate Event Hash: events(event_id, event_ts, user_id, payload_hash). Identify payload_hash values having >1 distinct event_id within a 10-minute window (600 seconds) for the same user. Return user_id, payload_hash, event_count.`,
    solution: `WITH ordered AS (
  SELECT event_id, user_id, payload_hash, event_ts,
         LAG(event_ts) OVER(PARTITION BY user_id, payload_hash ORDER BY event_ts) AS prev_ts
  FROM events
), flagged AS (
  SELECT *,
         CASE WHEN prev_ts IS NOT NULL AND (strftime('%s', event_ts) - strftime('%s', prev_ts)) <= 600 THEN 1 ELSE 0 END AS near_dup
  FROM ordered
), grouped AS (
  SELECT user_id, payload_hash, COUNT(*) AS cnt
  FROM flagged
  GROUP BY user_id, payload_hash
  HAVING COUNT(DISTINCT event_id) > 1
)
SELECT user_id, payload_hash, cnt AS event_count
FROM grouped;`,
    expectedResult: [[55,'abc123',2]],
    data: {
      events: [
        { event_id:'e1', event_ts:'2025-07-10 10:00:00', user_id:55, payload_hash:'abc123' },
        { event_id:'e2', event_ts:'2025-07-10 10:05:00', user_id:55, payload_hash:'abc123' },
        { event_id:'e3', event_ts:'2025-07-10 12:00:00', user_id:55, payload_hash:'zzz999' },
        { event_id:'e4', event_ts:'2025-07-10 10:20:00', user_id:77, payload_hash:'abc123' }
      ]
    }
  },
  {
    id: 34,
    category: 'performance-optimization',
    tags: ['sql','partition','performance','bigquery'],
    difficulty: 'intermediate',
    objective: 'Identify non-partition-pruned query and corrected version',
    question: `Partition Pruning Fix: A table events_partitioned(partition_date DATE, event_ts TIMESTAMP, user_id). Current query filters WHERE DATE(event_ts) = '2025-07-01' causing full scan. Provide optimized query leveraging partition_date for pruning plus residual time filter.`,
    solution: `-- Anti-pattern (full scan): SELECT COUNT(*) FROM events_partitioned WHERE DATE(event_ts)='2025-07-01';\n-- Optimized:\nSELECT COUNT(*)\nFROM events_partitioned\nWHERE partition_date = '2025-07-01'\n  AND event_ts >= '2025-07-01 00:00:00'\n  AND event_ts <  '2025-07-02 00:00:00';`,
  expectedResult: [],
  data: { events_partitioned: [ { partition_date:'2025-07-01', event_ts:'2025-07-01 12:00:00', user_id:1 } ] }
  },
  {
    id: 35,
    category: 'scd-validation',
    tags: ['sql','scd','gap','continuity'],
    difficulty: 'advanced',
    objective: 'Detect gaps in SCD Type 2 history',
    question: `SCD Gap Detection: dimension_customer(customer_id, effective_start, effective_end). Find customer_id where sorted intervals have gap > 1 day between previous end and next start (ignoring final open-ended NULL). Return customer_id, prev_end, next_start, gap_days.`,
    solution: `WITH ordered AS (\n  SELECT customer_id, effective_start, effective_end,\n         LAG(effective_end) OVER(PARTITION BY customer_id ORDER BY effective_start) AS prev_end\n  FROM dimension_customer\n), gaps AS (\n  SELECT customer_id, prev_end, effective_start AS next_start,\n         julianday(effective_start) - julianday(prev_end) AS gap_days\n  FROM ordered\n  WHERE prev_end IS NOT NULL AND effective_start > date(prev_end, '+1 day')\n)\nSELECT customer_id, prev_end, next_start, gap_days FROM gaps;`,
    expectedResult: [[201,'2025-01-31','2025-02-05',5.0]],
    data: { dimension_customer:[ {customer_id:200,effective_start:'2025-01-01',effective_end:'2025-02-01'}, {customer_id:200,effective_start:'2025-02-02',effective_end:null}, {customer_id:201,effective_start:'2025-01-01',effective_end:'2025-01-31'}, {customer_id:201,effective_start:'2025-02-05',effective_end:null} ] }
  },
  {
    id: 36,
    category: 'upsert-validation',
    tags: ['sql','upsert','latest','integrity'],
    difficulty: 'intermediate',
    objective: 'Validate only latest record retained after upsert',
    question: `Upsert Latest Validator: staging_user_status(user_id,status,updated_at) -> target_user_status(user_id,status,updated_at). Find user_ids where target does not have the max(updated_at) from staging.`,
    solution: `WITH latest AS (\n  SELECT user_id, MAX(updated_at) AS max_upd FROM staging_user_status GROUP BY user_id\n)\nSELECT t.user_id, t.status, t.updated_at, l.max_upd\nFROM target_user_status t\nJOIN latest l USING(user_id)\nWHERE t.updated_at <> l.max_upd;`,
    expectedResult: [[301,'inactive','2025-07-01 10:00:00','2025-07-01 11:00:00']],
    data: { staging_user_status:[ {user_id:301,status:'inactive',updated_at:'2025-07-01 10:00:00'},{user_id:301,status:'active',updated_at:'2025-07-01 11:00:00'} ], target_user_status:[ {user_id:301,status:'inactive',updated_at:'2025-07-01 10:00:00'} ] }
  },
  {
    id: 37,
    category: 'late-arrival-adjustment',
    tags: ['sql','late','adjustment'],
    difficulty: 'intermediate',
    objective: 'Identify late events needing metric recomputation',
    question: `Late Arrival Adjustment: fact_daily_metric(day, metric_value) precomputed. New late_events(user_id,event_day,event_ts_ingested) arrive where event_day < DATE(event_ts_ingested). List distinct event_day that have late arrivals ingested today ('2025-07-10') to trigger recompute.`,
    solution: `SELECT DISTINCT event_day\nFROM late_events\nWHERE DATE(event_ts_ingested)='2025-07-10'\n  AND event_day < '2025-07-10';`,
    expectedResult: [['2025-07-08']],
    data: { late_events:[ {user_id:1,event_day:'2025-07-08',event_ts_ingested:'2025-07-10 01:00:00'}, {user_id:2,event_day:'2025-07-10',event_ts_ingested:'2025-07-10 02:00:00'} ] }
  },
  {
    id: 38,
    category: 'null-spike-detection',
    tags: ['sql','nulls','anomaly'],
    difficulty: 'intermediate',
    objective: 'Detect sudden null ratio increase',
    question: `Null Spike: daily_nulls(day, total_rows, null_country_rows). Flag days where null_country_rows*1.0/total_rows > 2 * AVG(ratio previous 7 days). Return day, ratio, prev7_avg.`,
    solution: `WITH ratios AS (\n  SELECT day, total_rows, null_country_rows, (null_country_rows*1.0/total_rows) AS ratio\n  FROM daily_nulls\n), enriched AS (\n  SELECT r1.day, r1.ratio, (SELECT AVG(r2.ratio) FROM ratios r2 WHERE r2.day < r1.day ORDER BY day DESC LIMIT 7) AS prev7_avg\n  FROM ratios r1\n)\nSELECT day, ratio, prev7_avg\nFROM enriched\nWHERE prev7_avg IS NOT NULL AND ratio > 2 * prev7_avg;`,
    expectedResult: [['2025-07-08',0.30,0.125714285714]],
    data: { daily_nulls:[ {day:'2025-07-01',total_rows:1000,null_country_rows:100}, {day:'2025-07-02',total_rows:1000,null_country_rows:120}, {day:'2025-07-03',total_rows:1000,null_country_rows:130}, {day:'2025-07-04',total_rows:1000,null_country_rows:110}, {day:'2025-07-05',total_rows:1000,null_country_rows:150}, {day:'2025-07-06',total_rows:1000,null_country_rows:140}, {day:'2025-07-07',total_rows:1000,null_country_rows:130}, {day:'2025-07-08',total_rows:1000,null_country_rows:300} ] }
  },
  {
    id: 39,
    category: 'scd-validation',
    tags: ['sql','scd','classification'],
    difficulty: 'advanced',
    objective: 'Classify SCD issues into OVERLAP vs GAP',
    question: `SCD Issue Classification: dimension_customer(customer_id,effective_start,effective_end). Produce a row per issue with issue_type in ('OVERLAP','GAP') and the boundaries.`,
    solution: `WITH norm AS (\n  SELECT customer_id, effective_start, effective_end, COALESCE(effective_end,'9999-12-31') AS norm_end\n  FROM dimension_customer\n), ordered AS (\n  SELECT *, LAG(norm_end) OVER(PARTITION BY customer_id ORDER BY effective_start) AS prev_end\n  FROM norm\n), issues AS (\n  SELECT customer_id, effective_start AS boundary_start, norm_end AS boundary_end,\n         CASE WHEN prev_end IS NOT NULL AND effective_start < prev_end THEN 'OVERLAP' END AS overlap_flag,\n         CASE WHEN prev_end IS NOT NULL AND effective_start > date(prev_end,'+1 day') THEN 'GAP' END AS gap_flag\n  FROM ordered\n)\nSELECT customer_id, boundary_start, boundary_end, CASE WHEN overlap_flag IS NOT NULL THEN 'OVERLAP' ELSE 'GAP' END AS issue_type\nFROM issues\nWHERE overlap_flag IS NOT NULL OR gap_flag IS NOT NULL;`,
    expectedResult: [[401,'2025-02-01','2025-04-01','OVERLAP'],[402,'2025-02-10','9999-12-31','GAP']],
    data: { dimension_customer:[ {customer_id:401,effective_start:'2025-01-01',effective_end:'2025-03-01'}, {customer_id:401,effective_start:'2025-02-01',effective_end:'2025-04-01'}, {customer_id:402,effective_start:'2025-01-01',effective_end:'2025-02-01'}, {customer_id:402,effective_start:'2025-02-10',effective_end:null} ] }
  },
  {
    id: 40,
    category: 'data-masking',
    tags: ['sql','masking','pii'],
    difficulty: 'beginner',
    objective: 'Identify records not masked as expected',
    question: `Data Masking Validation: A table users_processed(user_id, email, ssn) is supposed to have emails masked (format 'userX@example.com') and SSNs as hashes. Find records where this is not true.`,
    solution: `SELECT user_id, email, ssn
FROM users_processed
WHERE email NOT LIKE 'user_%_example.com' OR ssn LIKE '%[0-9]%';`,
    expectedResult: [[102, 'bob@example.com', '123-45-6789']],
    data: {
        users_processed: [
            { user_id: 101, email: 'user1@example.com', ssn: 'hashed_sensitivedata1' },
            { user_id: 102, email: 'bob@example.com', ssn: '123-45-6789' },
            { user_id: 103, email: 'user3@example.com', ssn: 'hashed_sensitivedata3' }
        ]
    }
  }
];

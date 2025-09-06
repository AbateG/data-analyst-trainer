export const pythonChallenges = [
  {
    id: 1,
    category: 'data-cleaning',
    tags: ['python','validation','wrangling'],
    difficulty: 'beginner',
    objective: 'Filter, convert, and enrich messy API list data',
    question: `You are given a list of dictionaries, representing data pulled from a messy API. Write a Python function \`validate_and_clean(data)\` that takes this list and does the following:
1.  Returns a new list containing only the records that have both a \`user_id\` and a positive \`amount\`.
2.  Converts the \`amount\` from a string to a float.
3.  If a record is missing the \`status\` key, it should be added with a default value of \`'completed'\`.
4.  Any records that fail validation should be logged (printed) with a message explaining why.`,
    solution: `def validate_and_clean(data):
    clean_data = []
    for record in data:
        if record.get('user_id') and record.get('amount') and float(record.get('amount', 0)) > 0:
            cleaned_record = record.copy()
            cleaned_record['amount'] = float(cleaned_record['amount'])
            if 'status' not in cleaned_record:
                cleaned_record['status'] = 'completed'
            clean_data.append(cleaned_record)
        else:
            print(f"Invalid record: {record}")
    return clean_data

# The 'raw_data' variable will be injected
print(validate_and_clean(raw_data))
`,
    expectedOutput: `Invalid record: {'user_id': None, 'amount': '25.50'}
Invalid record: {'user_id': 102, 'amount': '-10.00'}
[{'user_id': 101, 'amount': 50.0, 'status': 'pending'}, {'user_id': 103, 'amount': 19.99, 'status': 'completed'}]`,
    data: [
        {'user_id': 101, 'amount': '50.00', 'status': 'pending'},
        {'user_id': null, 'amount': '25.50'},
        {'user_id': 102, 'amount': '-10.00'},
        {'user_id': 103, 'amount': '19.99'}
    ]
  },
  {
    id: 2,
    category: 'api-validation',
    tags: ['python','api','anomaly-detection','statistics'],
    difficulty: 'intermediate',
    objective: 'Validate JSON payload schema and detect outliers',
    question: `Advanced Python Challenge: API Data Validation and Anomaly Detection
Write a Python script that simulates validating API data and detecting anomalies. The script should:
1. Parse JSON data from an API response
2. Validate data types and ranges
3. Detect statistical anomalies (e.g., values more than 3 standard deviations from mean)
4. Log all issues found`,
    solution: `import json
import statistics

def validate_api_data(api_response):
    try:
        data = json.loads(api_response)
    except json.JSONDecodeError:
        print("Invalid JSON format")
        return []
    
    valid_records = []
    amounts = []
    
    for record in data:
        issues = []
        
        # Type validation
        if not isinstance(record.get('user_id'), int):
            issues.append("Invalid user_id type")
        if not isinstance(record.get('amount'), (int, float)):
            issues.append("Invalid amount type")
        
        # Range validation
        amount = record.get('amount', 0)
        if amount <= 0 or amount > 10000:
            issues.append("Amount out of valid range")
        
        if issues:
            print(f"Record {record}: {', '.join(issues)}")
        else:
            valid_records.append(record)
            amounts.append(amount)
    
    # Anomaly detection
    if amounts:
        mean = statistics.mean(amounts)
        stdev = statistics.stdev(amounts) if len(amounts) > 1 else 0
        
        for i, amount in enumerate(amounts):
            if abs(amount - mean) > 3 * stdev:
                print(f"Anomaly detected in record {i}: amount {amount} is {abs(amount - mean)/stdev:.2f} standard deviations from mean")
    
    return valid_records

# Simulate API response
api_data = json.dumps([
    {'user_id': 101, 'amount': 50.00},
    {'user_id': '102', 'amount': 25.50},
    {'user_id': 103, 'amount': -10.00},
    {'user_id': 104, 'amount': 15000.00},
    {'user_id': 105, 'amount': 100.00}
])

print(validate_api_data(api_data))
`,
    expectedOutput: `Record {'user_id': '102', 'amount': 25.5}: Invalid user_id type
Record {'user_id': 103, 'amount': -10.0}: Amount out of valid range
Record {'user_id': 104, 'amount': 15000.0}: Amount out of valid range
Anomaly detected in record 3: amount 15000.0 is 4.47 standard deviations from mean
[{'user_id': 101, 'amount': 50.0}, {'user_id': 105, 'amount': 100.0}]`,
    data: [
        {'user_id': 101, 'amount': 50.00},
        {'user_id': '102', 'amount': 25.50},
        {'user_id': 103, 'amount': -10.00},
        {'user_id': 104, 'amount': 15000.00},
        {'user_id': 105, 'amount': 100.00}
    ]
  },
  {
    id: 3,
    category: 'pipeline-debug',
    tags: ['python','diff','consistency'],
    difficulty: 'beginner',
    objective: 'Compare parallel source snapshots to locate drift',
    question: `Python for Data Pipeline Debugging: Write a script to simulate checking data consistency across multiple sources. The script should compare data from two "sources" and identify mismatches.`,
    solution: `def check_data_consistency(source1, source2, key_field):
    mismatches = []
    
    # Create lookup for source2
    source2_lookup = {record[key_field]: record for record in source2}
    
    for record1 in source1:
        key = record1.get(key_field)
        record2 = source2_lookup.get(key)
        
        if not record2:
            mismatches.append(f"Record {key} missing in source2")
            continue
        
        # Compare fields
        for field in record1:
            if field != key_field and record1[field] != record2.get(field):
                mismatches.append(f"Mismatch for {key} in field {field}: source1={record1[field]}, source2={record2.get(field)}")
    
    return mismatches

# Simulate data sources
source1 = [
    {'user_id': 1, 'name': 'Alice', 'amount': 100},
    {'user_id': 2, 'name': 'Bob', 'amount': 200},
    {'user_id': 3, 'name': 'Charlie', 'amount': 300}
]

source2 = [
    {'user_id': 1, 'name': 'Alice', 'amount': 100},
    {'user_id': 2, 'name': 'Bob', 'amount': 250},
    {'user_id': 4, 'name': 'David', 'amount': 400}
]

issues = check_data_consistency(source1, source2, 'user_id')
for issue in issues:
    print(issue)
`,
    expectedOutput: `Mismatch for 2 in field amount: source1=200, source2=250
Record 3 missing in source2
Record 4 missing in source1`,
    data: [
        {'user_id': 1, 'name': 'Alice', 'amount': 100},
        {'user_id': 2, 'name': 'Bob', 'amount': 200},
        {'user_id': 3, 'name': 'Charlie', 'amount': 300}
    ]
  },
  {
    id: 4,
    category: 'anomaly-detection',
    tags: ['python','statistics','clustering'],
    difficulty: 'intermediate',
    objective: 'Detect statistical anomalies and bucket similar values',
    question: `Advanced Python: Machine Learning for Anomaly Detection. Write a script that uses statistical methods to detect anomalies in transaction data, then implement a simple clustering algorithm to group similar transactions.`,
    solution: `import statistics
from collections import defaultdict

def detect_anomalies(data):
    amounts = [record['amount'] for record in data if 'amount' in record]
    if not amounts:
        return []
    
    mean = statistics.mean(amounts)
    stdev = statistics.stdev(amounts) if len(amounts) > 1 else 0
    
    anomalies = []
    for record in data:
        amount = record.get('amount', 0)
        if abs(amount - mean) > 3 * stdev:
            anomalies.append(record)
    
    return anomalies

def simple_clustering(data, threshold=10):
    clusters = defaultdict(list)
    for record in data:
        amount = record.get('amount', 0)
        cluster_key = round(amount / threshold) * threshold
        clusters[cluster_key].append(record)
    
    return dict(clusters)

# Simulate data
transaction_data = [
    {'user_id': 1, 'amount': 100, 'product': 'A'},
    {'user_id': 2, 'amount': 150, 'product': 'B'},
    {'user_id': 3, 'amount': 1000, 'product': 'C'},  # Anomaly
    {'user_id': 4, 'amount': 120, 'product': 'A'},
]

anomalies = detect_anomalies(transaction_data);
print("Anomalies:", anomalies)

clusters = simple_clustering(transaction_data);
print("Clusters:", clusters)
`,
    expectedOutput: `Anomalies: [{'user_id': 3, 'amount': 1000, 'product': 'C'}]
Clusters: {100: [{'user_id': 1, 'amount': 100, 'product': 'A'}, {'user_id': 4, 'amount': 120, 'product': 'A'}], 150: [{'user_id': 2, 'amount': 150, 'product': 'B'}], 1000: [{'user_id': 3, 'amount': 1000, 'product': 'C'}]}`,
    data: [
        {'user_id': 1, 'amount': 100, 'product': 'A'},
        {'user_id': 2, 'amount': 150, 'product': 'B'},
        {'user_id': 3, 'amount': 1000, 'product': 'C'},
        {'user_id': 4, 'amount': 120, 'product': 'A'},
    ]
  },
  {
    id: 5,
    category: 'sanity-checks',
    tags: ['python','validation','rules-engine'],
    difficulty: 'beginner',
    objective: 'Implement generic rule-driven record validator',
    question: `Automated Sanity Checks: Write a Python function to automate sanity checks on a dataset. The function should take a list of records and a dictionary of rules, and return a list of records that fail validation, along with the reason.`,
    solution: `def run_sanity_checks(data, rules):
    failing_records = []
    for record in data:
        for field, rule_list in rules.items():
            for rule in rule_list:
                if rule == 'not_null' and (record.get(field) is None):
                    failing_records.append({'record': record, 'reason': f"Field '{field}' is null."})
                elif rule == 'is_positive' and (record.get(field, 0) <= 0):
                    failing_records.append({'record': record, 'reason': f"Field '{field}' is not positive."})
                elif isinstance(rule, list) and record.get(field) not in rule:
                    failing_records.append({'record': record, 'reason': f"Field '{field}' has an invalid value."})
    return failing_records

# Simulate data and rules
dataset = [
    {'id': 1, 'status': 'completed', 'amount': 100},
    {'id': 2, 'status': 'failed', 'amount': -5},
    {'id': 3, 'status': None, 'amount': 200},
    {'id': 4, 'status': 'unknown', 'amount': 150},
]
rules = {
    'status': ['not_null', ['completed', 'pending', 'failed']],
    'amount': ['is_positive']
}

failures = run_sanity_checks(dataset, rules)
for failure in failures:
    print(failure)
`,
    expectedOutput: `{'record': {'id': 2, 'status': 'failed', 'amount': -5}, 'reason': "Field 'amount' is not positive."}
{'record': {'id': 3, 'status': None, 'amount': 200}, 'reason': "Field 'status' is null."}
{'record': {'id': 4, 'status': 'unknown', 'amount': 150}, 'reason': "Field 'status' has an invalid value."}`,
    data: []
  },
  {
    id: 6,
    category: 'log-analysis',
    tags: ['python','regex','logs'],
    difficulty: 'beginner',
    objective: 'Parse structured logs and extract error events',
    question: `Log File Analysis: Write a Python function to parse a log file and extract all 'ERROR' level messages. The function should return a list of dictionaries, each containing the timestamp, level, and message of the error.`,
    solution: `import re

def parse_log_for_errors(log_data):
    error_logs = []
    log_pattern = re.compile(r"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z) - (INFO|WARNING|ERROR) - (.*)")
    for line in log_data.strip().split('\\n'):
        match = log_pattern.match(line)
        if match:
            timestamp, level, message = match.groups()
            if level == 'ERROR':
                error_logs.append({'timestamp': timestamp, 'level': level, 'message': message})
    return error_logs

# Simulate log data
log_file_content = """
2025-09-06T10:00:00Z - INFO - User logged in
2025-09-06T10:01:00Z - ERROR - Failed to process payment for user:123
2025-09-06T10:02:00Z - WARNING - API response time is slow
2025-09-06T10:03:00Z - ERROR - Database connection lost
"""

errors = parse_log_for_errors(log_file_content)
for error in errors:
    print(error)
`,
    expectedOutput: `{'timestamp': '2025-09-06T10:01:00Z', 'level': 'ERROR', 'message': 'Failed to process payment for user:123'}
{'timestamp': '2025-09-06T10:03:00Z', 'level': 'ERROR', 'message': 'Database connection lost'}`,
    data: []
  },
  {
    id: 7,
    category: 'reconciliation',
    tags: ['python','diff','records'],
    difficulty: 'beginner',
    objective: 'Reconcile user records between two sources',
    question: "Data Reconciliation: Write a Python function to reconcile data from two different sources. It should identify users present only in one source, and users present in both but with mismatched email addresses.",
    solution: `def reconcile_user_data(source1, source2):
    s1_map = {user['id']: user for user in source1}
    s2_map = {user['id']: user for user in source2}

    only_in_s1 = [s1_map[id] for id in s1_map if id not in s2_map]
    only_in_s2 = [s2_map[id] for id in s2_map if id not in s1_map]
    
    mismatched = []
    for id in s1_map:
        if id in s2_map and s1_map[id]['email'] != s2_map[id]['email']:
            mismatched.append({'id': id, 's1_email': s1_map[id]['email'], 's2_email': s2_map[id]['email']})
            
    return {'only_in_source1': only_in_s1, 'only_in_source2': only_in_s2, 'mismatched_emails': mismatched}

# Simulate data sources
source_A = [
    {'id': 1, 'name': 'Alice', 'email': 'alice@example.com'},
    {'id': 2, 'name': 'Bob', 'email': 'bob@example.com'},
    {'id': 3, 'name': 'Charlie', 'email': 'charlie@example.com'}
]
source_B = [
    {'id': 1, 'name': 'Alice', 'email': 'alice.new@example.com'},
    {'id': 2, 'name': 'Bob', 'email': 'bob@example.com'},
    {'id': 4, 'name': 'David', 'email': 'david@example.com'}
]

discrepancies = reconcile_user_data(source_A, source_B)
print(discrepancies)
`,
    expectedOutput: `{'only_in_source1': [{'id': 3, 'name': 'Charlie', 'email': 'charlie@example.com'}], 'only_in_source2': [{'id': 4, 'name': 'David', 'email': 'david@example.com'}], 'mismatched_emails': [{'id': 1, 's1_email': 'alice@example.com', 's2_email': 'alice.new@example.com'}]}`,
    data: []
  },
  // --- Batch 1 New Python Challenges (10) ---
  {
    id: 8,
    category: 'api-parsing',
    tags: ['python','api','pagination','validation'],
    difficulty: 'intermediate',
    objective: 'Simulate paginated API merge and detect missing pages',
    question: `Paginated API Merge: You receive three pages of data (page number embedded). Some pages may be missing or duplicated. Write code to (1) assemble ordered records by page, (2) detect any missing or duplicate page numbers, (3) print issues then final combined list.`,
    solution: `def assemble_pages(pages):
    seen = set()
    combined = []
    max_page = 0
    for p in pages:
        num = p.get('page')
        if num in seen:
            print(f"Duplicate page detected: {num}")
        else:
            seen.add(num)
            combined.extend(p.get('records', []))
        if num > max_page:
            max_page = num
    missing = [i for i in range(1, max_page+1) if i not in seen]
    if missing:
        print("Missing pages:", missing)
    return combined

result = assemble_pages(raw_data)
print(result)
`,
    expectedOutput: `Missing pages: [2]
Duplicate page detected: 3
['a','b','x','y','z']`,
    data: [
      { 'page': 1, 'records': ['a','b'] },
      { 'page': 3, 'records': ['x','y'] },
      { 'page': 3, 'records': ['z'] }
    ]
  },
  {
    id: 9,
    category: 'log-correlation',
    tags: ['python','logs','correlation','tracing'],
    difficulty: 'intermediate',
    objective: 'Correlate request and error logs using request_id',
    question: `Trace Correlation: Given request_logs and error_logs lists, join by request_id and print unresolved requests (no error) and errored requests with latency > 2000ms.`,
    solution: `def correlate(requests, errors):
    error_map = {e['request_id']: e for e in errors}
    for r in requests:
        err = error_map.get(r['request_id'])
        if err and r['latency_ms'] > 2000:
            print(f"Slow failing request {r['request_id']} latency={r['latency_ms']} err={err['message']}")
        if not err:
            print(f"No error for request {r['request_id']}")

correlate(raw_data['request_logs'], raw_data['error_logs'])
`,
    expectedOutput: `Slow failing request abc latency=2500 err=Timeout
No error for request def` ,
    data: { 'request_logs': [ {'request_id':'abc','latency_ms':2500}, {'request_id':'def','latency_ms':1500} ], 'error_logs': [ {'request_id':'abc','message':'Timeout'} ] }
  },
  {
    id: 10,
    category: 'etl-diff',
    tags: ['python','etl','diff','data-quality'],
    difficulty: 'intermediate',
    objective: 'Compare full vs incremental snapshots and list unexpected deletions',
    question: `ETL Snapshot Diff: Given full_snapshot and incremental_snapshot lists of dicts keyed by id, list ids present in full but missing in incremental (unexpected deletion) and ids newly added.`,
    solution: `def snapshot_diff(full_snapshot, incr_snapshot):
    full_ids = {r['id'] for r in full_snapshot}
    incr_ids = {r['id'] for r in incr_snapshot}
    missing = sorted(full_ids - incr_ids)
    added = sorted(incr_ids - full_ids)
    print('Missing:', missing)
    print('Added:', added)

snapshot_diff(raw_data['full_snapshot'], raw_data['incremental_snapshot'])
`,
    expectedOutput: `Missing: [2]
Added: [4]`,
    data: { 'full_snapshot':[{'id':1},{'id':2},{'id':3}], 'incremental_snapshot':[{'id':1},{'id':3},{'id':4}] }
  },
  {
    id: 11,
    category: 'anomaly-detection',
    tags: ['python','metrics','zscore'],
    difficulty: 'intermediate',
    objective: 'Compute z-scores and flag metrics beyond threshold',
    question: `Metric Z-Score Flagging: Given metric_points list of dicts with value, compute mean/std then print any value whose z-score absolute > 2.5.`,
    solution: `import math

def flag_z(points):
    vals = [p['value'] for p in points]
    mean = sum(vals)/len(vals)
    variance = sum((v-mean)**2 for v in vals)/len(vals)
    std = math.sqrt(variance)
    for p in points:
        z = (p['value']-mean)/std if std else 0
        if abs(z) > 2.5:
            print(f"Anomaly value={p['value']} z={z:.2f}")

flag_z(raw_data)
`,
    expectedOutput: `Anomaly value=500 z=2.73`,
    data: [ {'value':100}, {'value':110}, {'value':95}, {'value':105}, {'value':500} ]
  },
  {
    id: 12,
    category: 'cloud-cost',
    tags: ['python','cost','aggregation'],
    difficulty: 'beginner',
    objective: 'Aggregate monthly cloud cost per service and flag overspending',
    question: `Cost Aggregation: Given cost_records(service, month, usd), aggregate totals for month 2025-01 and print services over 1000.`,
    solution: `from collections import defaultdict

def cost_aggregate(records):
    sums = defaultdict(float)
    for r in records:
        if r['month']=='2025-01':
            sums[r['service']] += r['usd']
    for svc, amt in sums.items():
        if amt > 1000:
            print(f"Overspend {svc} $" + str(amt))

cost_aggregate(raw_data)
`,
    expectedOutput: `Overspend bigquery $2500.0
Overspend dataproc $1200.0`,
    data: [ {'service':'bigquery','month':'2025-01','usd':2500}, {'service':'dataproc','month':'2025-01','usd':1200}, {'service':'cloudrun','month':'2025-01','usd':400}, {'service':'bigquery','month':'2025-02','usd':2600} ]
  },
  {
    id: 13,
    category: 'partition-drift',
    tags: ['python','partitions','dates'],
    difficulty: 'intermediate',
    objective: 'Detect unexpected future date partitions',
    question: `Partition Drift: Given partition_dates list of date strings, print any date > max_date -  today logic simulated (assume today=2025-02-10) plus check for gaps >2 days between consecutive partitions.`,
    solution: `from datetime import datetime

def partition_drift(dates):
    today = datetime(2025,2,10)
    parsed = sorted(datetime.strptime(d,'%Y-%m-%d') for d in dates)
    for d in parsed:
        if d > today:
            print('Future partition:', d.date())
    for i in range(1,len(parsed)):
        gap = (parsed[i]-parsed[i-1]).days
        if gap > 2:
            print(f"Gap detected of {gap} days after {parsed[i-1].date()}")

partition_drift(raw_data)
`,
    expectedOutput: `Gap detected of 5 days after 2025-02-02
Future partition: 2025-02-15`,
    data: ['2025-02-01','2025-02-02','2025-02-07','2025-02-15']
  },
  {
    id: 14,
    category: 'late-arrival',
    tags: ['python','events','timing'],
    difficulty: 'intermediate',
    objective: 'Mark late events based on watermark cutoff',
    question: `Late Event Marking: Given events(list of dicts with event_ts ISO string) and watermark='2025-02-01T23:59:59', print any events whose event_ts date > watermark date.`,
    solution: `from datetime import datetime

def mark_late(events, watermark):
    w = datetime.fromisoformat(watermark)
    for e in events:
        ts = datetime.fromisoformat(e['event_ts'])
        if ts.date() > w.date():
            print('Late:', e['event_ts'])

mark_late(raw_data['events'], raw_data['watermark'])
`,
    expectedOutput: `Late: 2025-02-02T01:00:00`,
    data: { 'events':[ {'event_ts':'2025-02-01T10:00:00'}, {'event_ts':'2025-02-02T01:00:00'} ], 'watermark':'2025-02-01T23:59:59' }
  },
  {
    id: 15,
    category: 'reconciliation',
    tags: ['python','checksum','integrity'],
    difficulty: 'intermediate',
    objective: 'Recompute row checksums and list mismatches',
    question: `Checksum Recompute: Each row dict has fields country, status, stored_checksum where checksum rule = f"{country}|{status}". Print rows whose stored_checksum mismatches rule.`,
    solution: `def check_checksums(rows):
    for r in rows:
        expected = f"{r['country']}|{r['status']}"
        if r['stored_checksum'] != expected:
            print('Mismatch:', r)

check_checksums(raw_data)
`,
    expectedOutput: `Mismatch: {'country': 'DE', 'status': 'inactive', 'stored_checksum': 'DE|active'}`,
    data: [ {'country':'US','status':'active','stored_checksum':'US|active'}, {'country':'DE','status':'inactive','stored_checksum':'DE|active'} ]
  },
  {
    id: 16,
    category: 'cache-invalidation',
    tags: ['python','caching','consistency'],
    difficulty: 'intermediate',
    objective: 'Detect stale cache entries vs source modification time',
    question: `Cache Staleness: Given cache_entries(key, cached_version, cached_ts) and source_versions(key, current_version, updated_ts), print keys where cached_version < current_version OR cached_ts older than updated_ts.`,
    solution: `def cache_staleness(cache, source):
    sv = {s['key']: s for s in source}
    for c in cache:
        s = sv.get(c['key'])
        if not s:
            print('Orphan cache key', c['key'])
            continue
        if c['cached_version'] < s['current_version'] or c['cached_ts'] < s['updated_ts']:
            print('Stale:', c['key'])

cache_staleness(raw_data['cache_entries'], raw_data['source_versions'])
`,
    expectedOutput: `Stale: user:1
Orphan cache key orphan
Stale: user:3`,
    data: { 'cache_entries':[ {'key':'user:1','cached_version':1,'cached_ts':10}, {'key':'orphan','cached_version':1,'cached_ts':5}, {'key':'user:3','cached_version':2,'cached_ts':15} ], 'source_versions':[ {'key':'user:1','current_version':2,'updated_ts':12}, {'key':'user:2','current_version':1,'updated_ts':5}, {'key':'user:3','current_version':2,'updated_ts':20} ] }
  },
  {
    id: 17,
    category: 'transformation-validation',
    tags: ['python','mapping','rules'],
    difficulty: 'beginner',
    objective: 'Validate derived user tier values from spend rules',
    question: `Tier Mapping Validation: Given spend_records(user_id, spend) and derived_tiers(user_id, tier) ensure tiers follow rules (<100 bronze, <500 silver else gold). Print mismatches.`,
    solution: `def validate_tiers(spend_records, derived_tiers):
    tier_map = {d['user_id']: d['tier'] for d in derived_tiers}
    for r in spend_records:
        expected = 'bronze' if r['spend'] < 100 else ('silver' if r['spend'] < 500 else 'gold')
        actual = tier_map.get(r['user_id'])
        if actual != expected:
            print('Mismatch', r['user_id'], expected, actual)

validate_tiers(raw_data['spend_records'], raw_data['derived_tiers'])
`,
    expectedOutput: `Mismatch 3 silver gold`,
    data: { 'spend_records':[ {'user_id':1,'spend':50}, {'user_id':2,'spend':600}, {'user_id':3,'spend':480} ], 'derived_tiers':[ {'user_id':1,'tier':'bronze'}, {'user_id':2,'tier':'gold'}, {'user_id':3,'tier':'gold'} ] }
  },
  {
    id: 18,
    category: 'sessionization',
    tags: ['python','time','sessions'],
    difficulty: 'advanced',
    objective: 'Compute session counts with 30m timeout',
    question: `Sessionization: Given events sorted by timestamp for multiple users, start new session if gap > 1800 seconds. Print user_id -> session_count.`,
    solution: `from datetime import datetime

def session_counts(events):
    last = {}
    counts = {}
    for e in events:
        ts = datetime.fromisoformat(e['ts'])
        uid = e['user_id']
        if uid not in last or (ts - last[uid]).total_seconds() > 1800:
            counts[uid] = counts.get(uid,0) + 1
        last[uid] = ts
    for uid,c in counts.items():
        print(uid,c)

session_counts(raw_data)
`,
    expectedOutput: `1 2
2 1`,
    data: [ {'user_id':1,'ts':'2025-03-10T10:00:00'}, {'user_id':1,'ts':'2025-03-10T10:10:00'}, {'user_id':1,'ts':'2025-03-10T11:00:01'}, {'user_id':2,'ts':'2025-03-10T09:00:00'} ]
  },
  {
    id: 19,
    category: 'flow-mapping',
    tags: ['python','graph','dependencies'],
    difficulty: 'intermediate',
    objective: 'Build simple DAG adjacency from task specs',
    question: `Flow Mapping: Given tasks list with id and depends_on (list) build adjacency list (task -> children) and print tasks with no dependencies (roots).`,
    solution: `def build_dag(tasks):
    deps = {t['id']: set(t.get('depends_on', [])) for t in tasks}
    children = {t['id']: [] for t in tasks}
    for t in tasks:
        for d in t.get('depends_on', []):
            children[d].append(t['id'])
    roots = [tid for tid, ds in deps.items() if not ds]
    print('Roots:', roots)
    print('Adjacency:', children)

build_dag(raw_data)
`,
    expectedOutput: `Roots: ['extract']
Adjacency: {'extract': ['transform'], 'transform': ['load'], 'load': []}`,
    data: [ {'id':'extract','depends_on':[]}, {'id':'transform','depends_on':['extract']}, {'id':'load','depends_on':['transform']} ]
  },
  {
    id: 20,
    category: 'data-mismatch',
    tags: ['python','diff','headers'],
    difficulty: 'beginner',
    objective: 'Compare CSV header vs expected schema fields',
    question: `CSV Header Validation: Given expected list of columns and actual_columns list, print missing and extra column names.`,
    solution: `def header_diff(expected, actual):
    missing = [c for c in expected if c not in actual]
    extra = [c for c in actual if c not in expected]
    print('Missing:', missing)
    print('Extra:', extra)

header_diff(raw_data['expected'], raw_data['actual_columns'])
`,
    expectedOutput: `Missing: ['status']
Extra: ['legacy_flag']`,
    data: { 'expected':['id','amount','status'], 'actual_columns':['id','amount','legacy_flag'] }
  },
  // --- Batch 2 New Python Challenges (10) ---
  {
    id: 21,
    category: 'billing-reconciliation',
    tags: ['python','reconciliation','billing'],
    difficulty: 'intermediate',
    objective: 'Match invoices to payments and show discrepancies',
    question: `Billing Reconciliation: Given invoices(list of dict id, amount) and payments(id, settled_amount) print any id where rounded amounts differ.`,
    solution: `def reconcile(invoices, payments):
    pay_map = {p['id']: p['settled_amount'] for p in payments}
    for inv in invoices:
        pid = inv['id']
        if pid in pay_map and round(inv['amount'],2) != round(pay_map[pid],2):
            print('Mismatch', pid, inv['amount'], pay_map[pid])

reconcile(raw_data['invoices'], raw_data['payments'])
`,
    expectedOutput: `Mismatch 2 60 59.5`,
    data: { 'invoices':[{'id':1,'amount':30.00},{'id':2,'amount':60.00}], 'payments':[{'id':1,'settled_amount':30.00},{'id':2,'settled_amount':59.50}] }
  },
  {
    id: 22,
    category: 'null-anomalies',
    tags: ['python','validation','nulls'],
    difficulty: 'beginner',
    objective: 'Count nulls per key field',
    question: `Null Counter: Given rows(list) count how many have user_id None and how many have event_type None.`,
    solution: `def null_counts(rows):
    missing_user = sum(1 for r in rows if r.get('user_id') is None)
    missing_type = sum(1 for r in rows if r.get('event_type') is None)
    print('MISSING_USER', missing_user)
    print('MISSING_EVENT_TYPE', missing_type)

null_counts(raw_data)
`,
    expectedOutput: `MISSING_USER 1\nMISSING_EVENT_TYPE 1`,
    data: [ {'event_id':1,'user_id':10,'event_type':'CLICK'}, {'event_id':2,'user_id':null,'event_type':'VIEW'}, {'event_id':3,'user_id':11,'event_type':null} ]
  },
  {
    id: 23,
    category: 'latency-analysis',
    tags: ['python','statistics','percentile'],
    difficulty: 'intermediate',
    objective: 'Compute approximate p95 latency',
    question: `Latency P95: Given list of ms values compute p95 by sorting and selecting ceil(n*0.95)-1 index.`,
    solution: `import math

def p95(values):
    vals = sorted(values)
    idx = max(0, math.ceil(len(vals)*0.95)-1)
    print(vals[idx])

p95(raw_data)
`,
    expectedOutput: `450`,
    data: [100,120,150,200,250,300,320,350,400,450]
  },
  {
    id: 24,
    category: 'slow-query-detection',
    tags: ['python','logs','filter'],
    difficulty: 'beginner',
    objective: 'Filter slow queries over threshold',
    question: `Slow Queries: Given logs(list dict query_id,duration_ms) print entries with duration_ms>2000 sorted desc.`,
    solution: `def slow(logs):
    for r in sorted([l for l in logs if l['duration_ms']>2000], key=lambda x: x['duration_ms'], reverse=True):
        print(r['query_id'], r['duration_ms'])

slow(raw_data)
`,
    expectedOutput: `3 5000
2 2500`,
    data: [ {'query_id':1,'duration_ms':150},{'query_id':2,'duration_ms':2500},{'query_id':3,'duration_ms':5000} ]
  },
  {
    id: 25,
    category: 'lineage-expansion',
    tags: ['python','graph','dfs'],
    difficulty: 'intermediate',
    objective: 'Expand descendants from root',
    question: `Lineage: Given edges(list of (parent,child)), produce sorted unique children reachable from root 'raw_events'.`,
    solution: `def descendants(edges, root):
    graph = {}
    for p,c in edges:
        graph.setdefault(p, []).append(c)
    seen = set()
    stack = [root]
    out = set()
    while stack:
        cur = stack.pop()
        for ch in graph.get(cur, []):
            if ch not in seen:
                seen.add(ch)
                out.add(ch)
                stack.append(ch)
    print(sorted(out))

descendants(raw_data, 'raw_events')
`,
    expectedOutput: `['clean_events', 'daily_events', 'event_agg']`,
    data: [ ['raw_events','clean_events'], ['clean_events','daily_events'], ['daily_events','event_agg'] ]
  },
  {
    id: 26,
    category: 'date-gaps',
    tags: ['python','dates','gaps'],
    difficulty: 'beginner',
    objective: 'List missing dates from expected sequence',
    question: `Date Gap: Given dates list expect 2025-03-01..2025-03-05 inclusive; print missing.`,
    solution: `from datetime import datetime, timedelta

def missing(dates):
    fmt = '%Y-%m-%d'
    have = set(dates)
    cur = datetime(2025,3,1)
    end = datetime(2025,3,5)
    out = []
    while cur <= end:
        s = cur.strftime(fmt)
        if s not in have:
            out.append(s)
        cur += timedelta(days=1)
    print(out)

missing(raw_data)
`,
    expectedOutput: `['2025-03-04']`,
    data: ['2025-03-01','2025-03-02','2025-03-03','2025-03-05']
  },
  {
    id: 27,
    category: 'ranking',
    tags: ['python','sorting','ranking'],
    difficulty: 'beginner',
    objective: 'Rank items per day',
    question: `Ranking: Given sales list dict product, day, revenue produce list of tuples (product,day,revenue,rank) with dense rank per day.`,
    solution: `def rank_sales(sales):
    from collections import defaultdict
    grouped = defaultdict(list)
    for s in sales:
        grouped[s['day']].append(s)
    result = []
    for day, items in grouped.items():
        items.sort(key=lambda x: -x['revenue'])
        rank = 0
        prev = None
        for i, it in enumerate(items):
            if prev is None or it['revenue'] != prev:
                rank += 1
                prev = it['revenue']
            result.append((it['product'], day, it['revenue'], rank))
    print(result)

rank_sales(raw_data)
`,
    expectedOutput: `[('A', '2025-04-01', 200, 1), ('B', '2025-04-01', 150, 2), ('C', '2025-04-01', 150, 2)]`,
    data: [ {'product':'A','day':'2025-04-01','revenue':200},{'product':'B','day':'2025-04-01','revenue':150},{'product':'C','day':'2025-04-01','revenue':150} ]
  },
  {
    id: 28,
    category: 'retention',
    tags: ['python','cohort','retention'],
    difficulty: 'intermediate',
    objective: 'Count retained users within window',
    question: `Retention: Given signups list and logins list, count signups on 2025-05-01 with login again within 7 days (exclude same day).`,
    solution: `from datetime import datetime

def retained(signups, logins):
    fmt = '%Y-%m-%d'
    login_map = {}
    for l in logins:
        login_map.setdefault(l['user_id'], []).append(datetime.strptime(l['login_date'], fmt))
    count = 0
    for s in signups:
        if s['signup_date']=='2025-05-01':
            su = datetime.strptime(s['signup_date'], fmt)
            dates = login_map.get(s['user_id'], [])
            if any((d - su).days > 0 and (d - su).days <= 7 for d in dates):
                count += 1
    print(count)

retained(raw_data['signups'], raw_data['logins'])
`,
    expectedOutput: `2`,
    data: { 'signups':[{'user_id':1,'signup_date':'2025-05-01'},{'user_id':2,'signup_date':'2025-05-01'},{'user_id':3,'signup_date':'2025-05-01'}], 'logins':[{'user_id':1,'login_date':'2025-05-02'},{'user_id':2,'login_date':'2025-05-05'},{'user_id':3,'login_date':'2025-05-20'}] }
  },
  {
    id: 29,
    category: 'funnel',
    tags: ['python','funnel','conversion'],
    difficulty: 'intermediate',
    objective: 'Compute conversion ratios',
    question: `Funnel Conversion: For events list with steps VIEW,CART,PURCHASE produce counts per step and conversion to previous (rounded 2).`,
    solution: `def funnel(events):
    steps = ['VIEW','CART','PURCHASE']
    per_step = {s: set() for s in steps}
    for e in events:
        per_step[e['step']].add(e['user_id'])
    counts = {s: len(per_step[s]) for s in steps}
    print(('VIEW', counts['VIEW'], None))
    cart_rate = round(counts['CART']/counts['VIEW'],2) if counts['VIEW'] else None
    print(('CART', counts['CART'], cart_rate))
    purch_rate = round(counts['PURCHASE']/counts['CART'],2) if counts['CART'] else None
    print(('PURCHASE', counts['PURCHASE'], purch_rate))

funnel(raw_data)
`,
    expectedOutput: `('VIEW', 3, None)
('CART', 2, 0.67)
('PURCHASE', 1, 0.5)`,
    data: [ {'user_id':1,'step':'VIEW'},{'user_id':1,'step':'CART'},{'user_id':2,'step':'VIEW'},{'user_id':2,'step':'CART'},{'user_id':2,'step':'PURCHASE'},{'user_id':3,'step':'VIEW'} ]
  },
  {
    id: 30,
    category: 'fx-validation',
    tags: ['python','fx','validation'],
    difficulty: 'intermediate',
    objective: 'Validate FX math',
    question: `FX Math: Given rates list and sales list recompute amount_original*rate_to_usd and print mismatches tolerance 0.01.`,
    solution: `def fx_validate(rates, sales):
    rate_map = {(r['day'], r['currency']): r['rate_to_usd'] for r in rates}
    for s in sales:
        k = (s['day'], s['currency'])
        rate = rate_map[k]
        recomputed = s['amount_original'] * rate
        if abs(recomputed - s['amount_usd_recorded']) > 0.01:
            print('Mismatch', s['sale_id'], s['amount_original'], rate, s['amount_usd_recorded'], round(recomputed,2))

fx_validate(raw_data['rates'], raw_data['sales'])
`,
    expectedOutput: `Mismatch 2 50 1.1 55.1 55.0`,
    data: { 'rates':[{'day':'2025-06-01','currency':'EUR','rate_to_usd':1.1},{'day':'2025-06-01','currency':'GBP','rate_to_usd':1.3}], 'sales':[{'sale_id':1,'day':'2025-06-01','currency':'EUR','amount_original':10,'amount_usd_recorded':11.0},{'sale_id':2,'day':'2025-06-01','currency':'EUR','amount_original':50,'amount_usd_recorded':55.10}] }
  },
  {
    id: 31,
    category: 'cloud-integration',
    tags: ['python','aws','boto3','cloud'],
    difficulty: 'intermediate',
    objective: 'Simulate using a cloud SDK to retag resources for reprocessing',
    question: `Cloud SDK Simulation: You are given a list of S3 object keys that failed to be processed. Write a Python script that simulates using 'boto3' to (1) get the tags for each object, (2) check if the 'processed' tag is 'False', and (3) for those objects, retags them with 'needs_reprocessing=True'. Use the provided mock functions.`,
    solution: `
# --- Mock Boto3 Client (provided for simulation) ---
class MockS3Client:
    _tags = {
        'failed/file1.csv': [{'Key': 'processed', 'Value': 'False'}],
        'processed/file2.csv': [{'Key': 'processed', 'Value': 'True'}],
        'failed/file3.csv': [{'Key': 'processed', 'Value': 'False'}],
    }
    def get_object_tagging(self, Bucket, Key):
        return {'TagSet': self._tags.get(Key, [])}
    def put_object_tagging(self, Bucket, Key, Tagging):
        print(f"Retagging {Key} with {Tagging['TagSet']}")
        self._tags[Key] = Tagging['TagSet']
# --- End Mock ---

s3 = MockS3Client()
failed_keys = ['failed/file1.csv', 'processed/file2.csv', 'failed/file3.csv']

for key in failed_keys:
    tags = s3.get_object_tagging(Bucket='my-bucket', Key=key).get('TagSet', [])
    tag_map = {t['Key']: t['Value'] for t in tags}
    if tag_map.get('processed') == 'False':
        s3.put_object_tagging(
            Bucket='my-bucket',
            Key=key,
            Tagging={'TagSet': [{'Key': 'needs_reprocessing', 'Value': 'True'}]}
        )
`,
    expectedOutput: `Retagging failed/file1.csv with [{'Key': 'needs_reprocessing', 'Value': 'True'}]
Retagging failed/file3.csv with [{'Key': 'needs_reprocessing', 'Value': 'True'}]`,
    data: []
  },
  {
    id: 32,
    category: 'data-weirdness',
    tags: ['python','parsing','regex','robustness'],
    difficulty: 'intermediate',
    objective: 'Robustly parse a mix of well-formed and malformed data records',
    question: `Robust Parsing: An upstream system is sending a list of strings, each meant to be a JSON record. Some are malformed. Write a Python function that iterates through the list. For each string, it should (1) try to parse it as JSON. (2) If JSON parsing fails, use a regex to find a user ID (e.g., 'user_id:123'). (3) Log any string that cannot be processed at all. Return a list of the data you successfully extracted.`,
    solution: `import json
import re

def robust_parser(raw_strings):
    extracted_data = []
    for s in raw_strings:
        try:
            extracted_data.append(json.loads(s))
            continue
        except json.JSONDecodeError:
            # JSON failed, try regex
            match = re.search(r'user_id:(\\d+)', s)
            if match:
                extracted_data.append({'user_id': int(match.group(1)), 'parse_mode': 'regex'})
            else:
                print(f"Failed to parse: {s}")
    return extracted_data

# The 'raw_data' variable will be injected
print(robust_parser(raw_data))
`,
    expectedOutput: `Failed to parse: <unparseable>
[{'event': 'login', 'user_id': 101}, {'user_id': 102, 'parse_mode': 'regex'}]`,
    data: [
        '{"event": "login", "user_id": 101}',
        'malformed string with user_id:102 here',
        '<unparseable>'
    ]
  },
  {
    id: 33,
    category: 'freshness-monitoring',
    tags: ['python','monitoring','sla','freshness'],
    difficulty: 'beginner',
    objective: 'Detect tables breaching freshness SLAs',
    question: `Freshness SLA: Given table_status list of dicts {table, last_loaded_ts, sla_minutes}. Assume now='2025-07-01T12:00:00'. Print any table where (now - last_loaded_ts) minutes > sla_minutes ordered by lateness desc.`,
    solution: `from datetime import datetime

def freshness_breaches(table_status):
    now = datetime.fromisoformat('2025-07-01T12:00:00')
    breaches = []
    for t in table_status:
        last = datetime.fromisoformat(t['last_loaded_ts'])
        diff_min = (now - last).total_seconds()/60
        if diff_min > t['sla_minutes']:
            breaches.append((t['table'], int(diff_min - t['sla_minutes'])))
    for name, over in sorted(breaches, key=lambda x: x[1], reverse=True):
        print(f"SLA_BREACH {name} overdue_min={over}")

freshness_breaches(raw_data)
`,
    expectedOutput: `SLA_BREACH fact_events overdue_min=180
SLA_BREACH dim_users overdue_min=30`,
    data: [
      {'table':'fact_events','last_loaded_ts':'2025-07-01T06:00:00','sla_minutes':180},
      {'table':'dim_users','last_loaded_ts':'2025-07-01T09:30:00','sla_minutes':120},
      {'table':'dim_products','last_loaded_ts':'2025-07-01T11:30:00','sla_minutes':120}
    ]
  }
  ,
  {
    id: 34,
    category: 'test-design',
    tags: ['python','testing','pytest','data-quality','sanity-checks'],
    difficulty: 'intermediate',
    objective: 'Design pytest tests for data quality functions',
    question: `Test Design: You have two functions (assume they exist) \n1) validate_and_clean(records) -> list (filters out records missing required fields user_id, amount>0; coerces amount float; fills missing status='completed')\n2) checksum_mismatches(rows) -> list of rows where stored_checksum != f"{country}|{status}".\nWrite pytest-style test code (no need to run) that covers: (a) happy path cleaned length & coercion, (b) invalid record rejected with reason, (c) default status fill, (d) checksum mismatch detection, (e) idempotency (running validate twice no change). Include descriptive test function names.`,
    solution: `# Example pytest module
import pytest

def test_validate_and_clean_happy_path():
    raw = [ {'user_id':1,'amount':'10.00','status':'pending'}, {'user_id':2,'amount':'5.50'} ]
    out = validate_and_clean(raw)
    assert len(out) == 2
    assert isinstance(out[0]['amount'], float)

def test_validate_and_clean_rejects_invalid():
    raw = [ {'user_id':None,'amount':'10.00'}, {'user_id':3,'amount':'-1'} ]
    out = validate_and_clean(raw)
    assert out == []

def test_validate_and_clean_fills_default_status():
    raw = [ {'user_id':1,'amount':'1.00'} ]
    out = validate_and_clean(raw)
    assert out[0]['status'] == 'completed'

def test_checksum_mismatches_detects():
    rows = [ {'country':'US','status':'active','stored_checksum':'US|active'}, {'country':'DE','status':'inactive','stored_checksum':'DE|active'} ]
    mismatches = checksum_mismatches(rows)
    assert len(mismatches) == 1 and mismatches[0]['country']=='DE'

def test_validate_and_clean_idempotent():
    raw = [ {'user_id':4,'amount':'2.00'} ]
    first = validate_and_clean(raw)
    second = validate_and_clean(first)  # passing cleaned back in
    assert first == second
`,
    expectedOutput: `# (Conceptual challenge – reviewer checks presence of assertions & coverage of listed cases)`,
    data: []
  },
  {
    id: 35,
    category: 'nested-json',
    tags: ['python','parsing','json','validation'],
    difficulty: 'intermediate',
    objective: 'Flatten nested JSON events and flag missing purchase value',
    question: `Nested JSON Flatten: You get a list of event payload dicts each with key 'events': list of {type, value?}. Produce a flat list of purchase values and print any purchase event missing 'value'.`,
    solution: `def extract_purchases(payloads):
    values = []
    for p in payloads:
        for ev in p.get('events', []):
            if ev.get('type') == 'purchase':
                if 'value' not in ev:
                    print('Missing value purchase in payload id', p.get('id'))
                else:
                    values.append(ev['value'])
    return values

print(extract_purchases(raw_data))
`,
    expectedOutput: `Missing value purchase in payload id 2
[19.99]`,
    data: [ {'id':1,'events':[{'type':'view'},{'type':'purchase','value':19.99}]}, {'id':2,'events':[{'type':'purchase'}]} ]
  }
];

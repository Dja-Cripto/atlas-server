import sqlite3
import json

conn = sqlite3.connect('/home/ubuntu/.n8n/database.sqlite')
cur = conn.cursor()
cur.execute('SELECT data FROM execution_data WHERE executionId = 53496')
row = cur.fetchone()
if row:
    d = json.loads(row[0])
    print("DATA LEN:", len(d))
    for i, item in enumerate(d):
        s = str(item)
        if 'error' in s.lower() or 'oauth' in s.lower() or 'token' in s.lower() or 'node' in s.lower():
            if isinstance(item, dict):
                print(f"Index {i}: {json.dumps(item)[:400]}")
            else:
                print(f"Index {i}: {str(item)[:200]}")

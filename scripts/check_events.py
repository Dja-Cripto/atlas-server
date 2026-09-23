import sqlite3
import json
import sys

db_path = '/srv/robo/portal-bot/data/atlas-storage/database.sqlite'
try:
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT data FROM jobs WHERE id = '54204f15-86ce-4fd5-8de6-b4d43c671a7a'")
    row = cur.fetchone()
    if not row:
        print("Job not found.")
        sys.exit(0)
    data = json.loads(row[0])
    print(f"Job Status: {data.get('status')}")
    print(f"Current Action: {data.get('current')}")
    auto = data.get('auto', {})
    print(f"Auto Stage: {auto.get('stage')}, Progress: {auto.get('progress')}%")
    print(f"Live Status: {auto.get('liveStatus')}")
    print(f"Render Progress: {auto.get('renderProgress')}%")
    print(f"Rendered Frames: {auto.get('renderedFrames')} / {auto.get('totalFrames')}")
    events = data.get('events', [])
    print(f"\nTotal Events: {len(events)}")
    print("Last 6 events:")
    for e in events[-6:]:
        print(f"  [{e.get('at', '')}] {e.get('message', '')}")
except Exception as err:
    print(f"Error querying database: {err}")

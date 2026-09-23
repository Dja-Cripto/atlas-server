import sqlite3
import json
import sys
import os

db_paths = [
    '/srv/robo/portal-bot/data/atlas-storage/data/studio.sqlite',
    '/srv/atlas-studio/data/studio.sqlite',
    'data/studio.sqlite'
]

db_path = next((p for p in db_paths if os.path.exists(p)), None)
if not db_path:
    print("Database file not found.")
    sys.exit(1)

try:
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT value FROM records WHERE id = '54204f15-86ce-4fd5-8de6-b4d43c671a7a'")
    row = cur.fetchone()
    if not row:
        print("Job 54204f15-86ce-4fd5-8de6-b4d43c671a7a not found in records.")
        sys.exit(0)
    data = json.loads(row[0])
    print(f"=== JOB STATUS ===")
    print(f"Title: {data.get('title')}")
    print(f"Job Status: {data.get('status')}")
    print(f"Current Action: {data.get('current')}")
    auto = data.get('auto', {})
    print(f"Auto Stage: {auto.get('stage')}, Progress: {auto.get('progress')}%")
    print(f"Rendering MP4: {auto.get('renderingMp4')}")
    print(f"Live Status: {auto.get('liveStatus')}")
    print(f"Render Progress: {auto.get('renderProgress')}%")
    if auto.get('renderedFrames'):
        print(f"Rendered Frames: {auto.get('renderedFrames')} / {auto.get('totalFrames')}")
    events = data.get('events', [])
    print(f"\nTotal Events: {len(events)}")
    print("Last 8 events:")
    for e in events[-8:]:
        print(f"  [{e.get('at', '')}] {e.get('message', '')}")
except Exception as err:
    print(f"Error querying database: {err}")

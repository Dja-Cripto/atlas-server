import sqlite3
import json

conn = sqlite3.connect('/home/ubuntu/.n8n/database.sqlite')
cur = conn.cursor()
cur.execute("SELECT nodes FROM workflow_entity WHERE id = 'CXeQ7kICnWCazhzy'")
row = cur.fetchone()
if row:
    nodes = json.loads(row[0])
    for n in nodes:
        print(f"Node: '{n.get('name')}' type: {n.get('type')} credentials: {n.get('credentials')}")

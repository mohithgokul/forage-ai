import asyncio
from app import db
import json
import re

async def main():
    rows = await db.fetch('SELECT id, config FROM "App"')
    if not rows:
        print("No apps found")
        return
    app = rows[0]
    print(app['id'])
    
    config = app['config'] if isinstance(app['config'], dict) else json.loads(app['config'])
    if not config.get('tables'):
        print("No tables")
        return
    table_name = config['tables'][0]['name']
    
    safe_table = re.sub(r"[^a-z0-9_]", "", table_name, flags=re.IGNORECASE)
    safe_id    = re.sub(r"[^a-z0-9]",  "", app['id'],     flags=re.IGNORECASE)
    tbl = f"app_{safe_id}_{safe_table}"
    
    print("Table:", tbl)
    
    try:
        # Try a real insert mirroring data.py
        keys = ["course_title", "course_code", "instructor_name", "department"]
        vals = ["dd", "dddd", "dddd", "ddd"]
        placeholders = ", ".join(f"${i+1}" for i in range(len(vals)))
        cols = ", ".join(f'"{k}"' for k in keys)
        q = f'INSERT INTO "{tbl}" ({cols}) VALUES ({placeholders}) RETURNING *'
        print("Query:", q)
        row = await db.fetchrow(q, *vals)
        print("Insert ok", row)
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(main())

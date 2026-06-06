import asyncio
import httpx
import json
from app import db
from app.mailer import send_mail


async def fire_automations(app_id: str, trigger: str, table_name: str, record_id: str, record_data: dict):
    rows = await db.fetch(
        """SELECT * FROM "Automation"
           WHERE "appId" = $1 AND trigger = $2 AND "tableName" = $3 AND enabled = TRUE""",
        app_id, trigger, table_name,
    )

    for row in rows:
        cfg = row["config"] if isinstance(row["config"], dict) else json.loads(row["config"])
        action = row["action"]

        try:
            if action == "log_event":
                continue  # Already handled via ActivityLog in routes

            elif action == "send_email":
                subject = cfg.get("subject", "").replace("{{tableName}}", table_name)\
                                               .replace("{{recordId}}", record_id)\
                                               .replace("{{event}}", trigger)
                body = cfg.get("body", "").replace("{{tableName}}", table_name)\
                                          .replace("{{recordId}}", record_id)\
                                          .replace("{{event}}", trigger)
                await send_mail(to=cfg["to"], subject=subject, html=body)

            elif action == "webhook":
                payload = {
                    "event": trigger,
                    "tableName": table_name,
                    "recordId": record_id,
                    "data": record_data,
                    "timestamp": str(asyncio.get_event_loop().time()),
                }
                async with httpx.AsyncClient(timeout=5.0) as client:
                    await client.post(cfg["url"], json=payload)

        except Exception as e:
            print(f"Automation {row['id']} failed: {e}")

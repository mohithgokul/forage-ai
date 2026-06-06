import asyncio
import json
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app import db
from app.dependencies import get_current_user
from app.sql_builder import (
    build_create_table_sql,
    build_alter_add_column_sql,
    build_drop_table_sql,
    build_count_sql,
)

router = APIRouter(prefix="/api/apps", tags=["apps"])


def _owned_or_403(app, user_id: str):
    if not app:
        raise HTTPException(404, {"error": "NOT_FOUND", "message": "App not found"})
    if app["userId"] != user_id:
        raise HTTPException(403, {"error": "FORBIDDEN", "message": "Not authorized"})


class CreateAppBody(BaseModel):
    config: dict


class PatchAppBody(BaseModel):
    config: dict


async def _provision_tables(app_id: str, config: dict):
    try:
        for table in config.get("tables", []):
            sql = build_create_table_sql(app_id, table["name"], table.get("fields", []))
            await db.execute(sql)
        await db.execute(
            'UPDATE "App" SET status = $1, "updatedAt" = NOW() WHERE id = $2',
            "LIVE", app_id,
        )
    except Exception as e:
        await db.execute(
            'UPDATE "App" SET status = $1, "errorMessage" = $2, "updatedAt" = NOW() WHERE id = $3',
            "ERROR", str(e), app_id,
        )


@router.get("")
async def list_apps(current_user: dict = Depends(get_current_user)):
    rows = await db.fetch(
        'SELECT * FROM "App" WHERE "userId" = $1 ORDER BY "createdAt" DESC',
        current_user["id"],
    )
    result = []
    for app in rows:
        config = app["config"] if isinstance(app["config"], dict) else json.loads(app["config"])
        total = 0
        counts = {}
        for table in config.get("tables", []):
            try:
                cnt = await db.fetchval(build_count_sql(app["id"], table["name"]))
                counts[table["name"]] = int(cnt or 0)
                total += int(cnt or 0)
            except Exception:
                counts[table["name"]] = 0
        app["tableCounts"] = counts
        app["totalRecords"] = total
        result.append(app)
    return {"apps": result}


@router.post("", status_code=201)
async def create_app(body: CreateAppBody, current_user: dict = Depends(get_current_user)):
    config = body.config
    app = await db.fetchrow(
        'INSERT INTO "App" (name, description, config, "userId", status) '
        'VALUES ($1, $2, $3, $4, $5) RETURNING *',
        config.get("appName", "Untitled"),
        config.get("description", ""),
        json.dumps(config),
        current_user["id"],
        "BUILDING",
    )
    asyncio.create_task(_provision_tables(app["id"], config))
    return {"app": {"id": app["id"], "status": "BUILDING"}}


@router.get("/{app_id}")
async def get_app(app_id: str, current_user: dict = Depends(get_current_user)):
    app = await db.fetchrow('SELECT * FROM "App" WHERE id = $1', app_id)
    _owned_or_403(app, current_user["id"])
    automations = await db.fetch('SELECT * FROM "Automation" WHERE "appId" = $1', app_id)
    activity = await db.fetch(
        'SELECT * FROM "ActivityLog" WHERE "appId" = $1 ORDER BY "createdAt" DESC LIMIT 10',
        app_id,
    )
    app["automations"] = automations
    app["recentActivity"] = activity
    return {"app": app}


@router.get("/{app_id}/status")
async def get_status(app_id: str, current_user: dict = Depends(get_current_user)):
    app = await db.fetchrow(
        'SELECT status, "errorMessage", "userId" FROM "App" WHERE id = $1', app_id
    )
    _owned_or_403(app, current_user["id"])
    return {"status": app["status"], "errorMessage": app["errorMessage"]}


@router.patch("/{app_id}")
async def update_app(app_id: str, body: PatchAppBody, current_user: dict = Depends(get_current_user)):
    app = await db.fetchrow('SELECT * FROM "App" WHERE id = $1', app_id)
    _owned_or_403(app, current_user["id"])
    old_config = app["config"] if isinstance(app["config"], dict) else json.loads(app["config"])
    new_config = body.config

    # Non-destructively add new columns
    old_fields = {
        t["name"]: {f["name"] for f in t.get("fields", [])}
        for t in old_config.get("tables", [])
    }
    for table in new_config.get("tables", []):
        existing = old_fields.get(table["name"], set())
        for field in table.get("fields", []):
            if field["name"] not in existing:
                try:
                    await db.execute(build_alter_add_column_sql(app_id, table["name"], field))
                except Exception:
                    pass

    updated = await db.fetchrow(
        'UPDATE "App" SET config = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
        json.dumps(new_config), app_id,
    )
    return {"app": updated}


@router.delete("/{app_id}")
async def delete_app(app_id: str, current_user: dict = Depends(get_current_user)):
    app = await db.fetchrow('SELECT * FROM "App" WHERE id = $1', app_id)
    _owned_or_403(app, current_user["id"])
    config = app["config"] if isinstance(app["config"], dict) else json.loads(app["config"])
    for table in config.get("tables", []):
        try:
            await db.execute(build_drop_table_sql(app_id, table["name"]))
        except Exception:
            pass
    await db.execute('DELETE FROM "App" WHERE id = $1', app_id)
    return {"success": True}

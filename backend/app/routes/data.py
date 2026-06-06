import json
import re
import asyncio
from fastapi import APIRouter, HTTPException, Depends
from app import db
from app.dependencies import get_current_user
from app.sql_builder import get_table_name
from app.automations import fire_automations

router = APIRouter(prefix="/api/apps", tags=["data"])


async def _get_app_and_table(app_id: str, user_id: str, table_name: str):
    app = await db.fetchrow('SELECT * FROM "App" WHERE id = $1', app_id)
    if not app:
        raise HTTPException(404, {"error": "NOT_FOUND", "message": "App not found"})
    if app["userId"] != user_id:
        raise HTTPException(403, {"error": "FORBIDDEN", "message": "Not authorized"})
    config = app["config"] if isinstance(app["config"], dict) else json.loads(app["config"])
    table_cfg = next((t for t in config.get("tables", []) if t["name"] == table_name), None)
    if not table_cfg:
        raise HTTPException(404, {"error": "TABLE_NOT_FOUND", "message": "Table not found in config"})
    return app, table_cfg


def _validate_row(data: dict, fields: list) -> dict:
    errors = {}
    for field in fields:
        val = data.get(field["name"])
        if field.get("required") and (val is None or str(val).strip() == ""):
            errors[field["name"]] = "This field is required"
            continue
        if val is not None and str(val).strip() != "":
            if field["type"] == "number":
                try:
                    float(val)
                except (ValueError, TypeError):
                    errors[field["name"]] = "Must be a number"
            if field["type"] == "email":
                if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", str(val)):
                    errors[field["name"]] = "Invalid email address"
            if field["type"] == "select":
                options = field.get("options", [])
                if options and val not in options:
                    errors[field["name"]] = f"Must be one of: {', '.join(options)}"
    return errors


@router.get("/{app_id}/data/{table_name}")
async def list_records(
    app_id: str, table_name: str,
    page: int = 1, limit: int = 10,
    search: str = "", sort_by: str = "created_at", sort_order: str = "desc",
    current_user: dict = Depends(get_current_user),
):
    _, table_cfg = await _get_app_and_table(app_id, current_user["id"], table_name)
    tbl = get_table_name(app_id, table_name)
    safe_sort = re.sub(r"[^a-z0-9_]", "", sort_by, flags=re.IGNORECASE)
    direction = "ASC" if sort_order.lower() == "asc" else "DESC"
    offset = (page - 1) * limit

    if search:
        # Search across text-like fields
        text_fields = [f["name"] for f in table_cfg.get("fields", []) if f["type"] in ("text", "email", "url", "textarea", "select")]
        if text_fields:
            conditions = " OR ".join(f'"{re.sub(chr(91)+"^a-z0-9_"+chr(93), "", fn, flags=re.IGNORECASE)}"::text ILIKE $1' for fn in text_fields)
            rows = await db.fetch(
                f'SELECT * FROM "{tbl}" WHERE {conditions} ORDER BY "{safe_sort}" {direction} LIMIT $2 OFFSET $3',
                f"%{search}%", limit, offset,
            )
            total = await db.fetchval(
                f'SELECT COUNT(*) FROM "{tbl}" WHERE {conditions}', f"%{search}%"
            )
        else:
            rows = await db.fetch(f'SELECT * FROM "{tbl}" ORDER BY "{safe_sort}" {direction} LIMIT $1 OFFSET $2', limit, offset)
            total = await db.fetchval(f'SELECT COUNT(*) FROM "{tbl}"')
    else:
        rows = await db.fetch(f'SELECT * FROM "{tbl}" ORDER BY "{safe_sort}" {direction} LIMIT $1 OFFSET $2', limit, offset)
        total = await db.fetchval(f'SELECT COUNT(*) FROM "{tbl}"')

    return {
        "records": [dict(r) for r in rows],
        "pagination": {"page": page, "limit": limit, "total": int(total or 0), "totalPages": -(-int(total or 0) // limit)},
    }


@router.post("/{app_id}/data/{table_name}", status_code=201)
async def create_record(app_id: str, table_name: str, body: dict, current_user: dict = Depends(get_current_user)):
    app, table_cfg = await _get_app_and_table(app_id, current_user["id"], table_name)
    errors = _validate_row(body, table_cfg.get("fields", []))
    if errors:
        raise HTTPException(400, {"error": "VALIDATION_ERROR", "message": "Invalid data", "details": errors})

    tbl = get_table_name(app_id, table_name)
    keys = [re.sub(r"[^a-z0-9_]", "", k, flags=re.IGNORECASE) for k in body.keys()]
    vals = list(body.values())
    placeholders = ", ".join(f"${i+1}" for i in range(len(vals)))
    cols = ", ".join(f'"{k}"' for k in keys)
    row = await db.fetchrow(f'INSERT INTO "{tbl}" ({cols}) VALUES ({placeholders}) RETURNING *', *vals)

    record = dict(row)
    await db.execute(
        'INSERT INTO "ActivityLog" ("appId", event, "tableName", "recordId", metadata) VALUES ($1,$2,$3,$4,$5)',
        app_id, "record_created", table_name, str(record.get("id", "")), json.dumps(record, default=str),
    )
    asyncio.create_task(fire_automations(app_id, "on_create", table_name, str(record.get("id", "")), record))
    return {"record": record}


@router.patch("/{app_id}/data/{table_name}/{record_id}")
async def update_record(app_id: str, table_name: str, record_id: str, body: dict, current_user: dict = Depends(get_current_user)):
    _, table_cfg = await _get_app_and_table(app_id, current_user["id"], table_name)
    errors = _validate_row(body, [f for f in table_cfg.get("fields", []) if f["name"] in body])
    if errors:
        raise HTTPException(400, {"error": "VALIDATION_ERROR", "message": "Invalid data", "details": errors})

    tbl = get_table_name(app_id, table_name)
    keys = [re.sub(r"[^a-z0-9_]", "", k, flags=re.IGNORECASE) for k in body.keys()]
    vals = list(body.values())
    set_clause = ", ".join(f'"{k}" = ${i+1}' for i, k in enumerate(keys))
    vals.append(record_id)
    row = await db.fetchrow(
        f'UPDATE "{tbl}" SET {set_clause}, updated_at = NOW() WHERE id = ${len(vals)} RETURNING *', *vals
    )
    record = dict(row)
    await db.execute(
        'INSERT INTO "ActivityLog" ("appId", event, "tableName", "recordId", metadata) VALUES ($1,$2,$3,$4,$5)',
        app_id, "record_updated", table_name, record_id, json.dumps(body, default=str),
    )
    asyncio.create_task(fire_automations(app_id, "on_update", table_name, record_id, record))
    return {"record": record}


@router.delete("/{app_id}/data/{table_name}/{record_id}")
async def delete_record(app_id: str, table_name: str, record_id: str, current_user: dict = Depends(get_current_user)):
    _, _ = await _get_app_and_table(app_id, current_user["id"], table_name)
    tbl = get_table_name(app_id, table_name)
    await db.execute(f'DELETE FROM "{tbl}" WHERE id = $1', record_id)
    await db.execute(
        'INSERT INTO "ActivityLog" ("appId", event, "tableName", "recordId") VALUES ($1,$2,$3,$4)',
        app_id, "record_deleted", table_name, record_id,
    )
    asyncio.create_task(fire_automations(app_id, "on_delete", table_name, record_id, {}))
    return {"success": True}

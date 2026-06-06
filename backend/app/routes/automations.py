import json
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from app import db
from app.dependencies import get_current_user
from app.constants import VALID_TRIGGERS, VALID_ACTIONS

router = APIRouter(prefix="/api/apps", tags=["automations"])


class AutomationBody(BaseModel):
    name: str
    trigger: str
    tableName: str
    action: str
    config: dict


class PatchAutomationBody(BaseModel):
    enabled: Optional[bool] = None
    name: Optional[str] = None


async def _check_app_ownership(app_id: str, user_id: str):
    app = await db.fetchrow('SELECT id, config FROM "App" WHERE id = $1 AND "userId" = $2', app_id, user_id)
    if not app:
        raise HTTPException(403, {"error": "FORBIDDEN", "message": "Not authorized"})
    return app


@router.get("/{app_id}/automations")
async def list_automations(app_id: str, current_user: dict = Depends(get_current_user)):
    await _check_app_ownership(app_id, current_user["id"])
    rows = await db.fetch('SELECT * FROM "Automation" WHERE "appId" = $1 ORDER BY "createdAt" DESC', app_id)
    return {"automations": [dict(r) for r in rows]}


@router.post("/{app_id}/automations", status_code=201)
async def create_automation(app_id: str, body: AutomationBody, current_user: dict = Depends(get_current_user)):
    app = await _check_app_ownership(app_id, current_user["id"])

    if body.trigger not in VALID_TRIGGERS:
        raise HTTPException(400, {"error": "BAD_REQUEST", "message": f"trigger must be one of {VALID_TRIGGERS}"})
    if body.action not in VALID_ACTIONS:
        raise HTTPException(400, {"error": "BAD_REQUEST", "message": f"action must be one of {VALID_ACTIONS}"})

    # Validate tableName exists in config
    config = app["config"] if isinstance(app["config"], dict) else json.loads(app["config"])
    table_names = [t["name"] for t in config.get("tables", [])]
    if body.tableName not in table_names:
        raise HTTPException(400, {"error": "BAD_REQUEST", "message": "tableName not found in app config"})

    if body.action == "send_email":
        if not all(k in body.config for k in ("to", "subject", "body")):
            raise HTTPException(400, {"error": "BAD_REQUEST", "message": "send_email config requires: to, subject, body"})
    if body.action == "webhook":
        if "url" not in body.config:
            raise HTTPException(400, {"error": "BAD_REQUEST", "message": "webhook config requires: url"})

    row = await db.fetchrow(
        'INSERT INTO "Automation" ("appId", name, trigger, "tableName", action, config) '
        'VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
        app_id, body.name, body.trigger, body.tableName, body.action, json.dumps(body.config),
    )
    return {"automation": dict(row)}


@router.patch("/{app_id}/automations/{automation_id}")
async def update_automation(
    app_id: str, automation_id: str, body: PatchAutomationBody,
    current_user: dict = Depends(get_current_user),
):
    await _check_app_ownership(app_id, current_user["id"])
    row = await db.fetchrow(
        'UPDATE "Automation" SET '
        'enabled = COALESCE($1, enabled), '
        'name = COALESCE($2, name), '
        '"updatedAt" = NOW() '
        'WHERE id = $3 AND "appId" = $4 RETURNING *',
        body.enabled, body.name, automation_id, app_id,
    )
    if not row:
        raise HTTPException(404, {"error": "NOT_FOUND", "message": "Automation not found"})
    return {"automation": dict(row)}


@router.delete("/{app_id}/automations/{automation_id}")
async def delete_automation(app_id: str, automation_id: str, current_user: dict = Depends(get_current_user)):
    await _check_app_ownership(app_id, current_user["id"])
    await db.execute('DELETE FROM "Automation" WHERE id = $1 AND "appId" = $2', automation_id, app_id)
    return {"success": True}

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from app import db
from app.dependencies import get_current_user
from app.gemini import generate_config, refine_config

router = APIRouter(prefix="/api/ai", tags=["ai"])

# Simple in-memory rate limiting per user (production: use Redis)
import time
_request_log: dict[str, list[float]] = {}
AI_LIMIT = 10
AI_WINDOW = 3600  # 1 hour


def _check_rate_limit(user_id: str):
    now = time.time()
    calls = _request_log.get(user_id, [])
    calls = [t for t in calls if now - t < AI_WINDOW]
    if len(calls) >= AI_LIMIT:
        raise HTTPException(429, {"error": "AI_RATE_LIMIT", "message": "AI generation limit reached (10/hour)"})
    calls.append(now)
    _request_log[user_id] = calls


class GenerateBody(BaseModel):
    prompt: str


class RefineBody(BaseModel):
    appId: str
    prompt: str
    currentConfig: dict


@router.post("/generate-config")
async def generate(body: GenerateBody, current_user: dict = Depends(get_current_user)):
    _check_rate_limit(current_user["id"])
    if not body.prompt or len(body.prompt) > 1000:
        raise HTTPException(400, {"error": "BAD_REQUEST", "message": "Prompt must be 1–1000 characters"})
    try:
        config = await generate_config(body.prompt)
    except ValueError:
        raise HTTPException(422, {"error": "AI_INVALID_RESPONSE", "message": "AI returned invalid JSON"})
    return {"config": config}


@router.post("/refine-config")
async def refine(body: RefineBody, current_user: dict = Depends(get_current_user)):
    _check_rate_limit(current_user["id"])
    app = await db.fetchrow('SELECT id FROM "App" WHERE id = $1 AND "userId" = $2', body.appId, current_user["id"])
    if not app:
        raise HTTPException(403, {"error": "FORBIDDEN", "message": "Not authorized"})
    try:
        config = await refine_config(body.currentConfig, body.prompt)
    except ValueError:
        raise HTTPException(422, {"error": "AI_INVALID_RESPONSE", "message": "AI returned invalid JSON"})
    return {"config": config}

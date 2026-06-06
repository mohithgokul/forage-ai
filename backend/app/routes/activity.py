from fastapi import APIRouter, HTTPException, Depends
from app import db
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/apps", tags=["activity"])


@router.get("/{app_id}/activity")
async def get_activity(app_id: str, current_user: dict = Depends(get_current_user)):
    app = await db.fetchrow('SELECT id FROM "App" WHERE id = $1 AND "userId" = $2', app_id, current_user["id"])
    if not app:
        raise HTTPException(403, {"error": "FORBIDDEN", "message": "Not authorized"})
    rows = await db.fetch(
        'SELECT * FROM "ActivityLog" WHERE "appId" = $1 ORDER BY "createdAt" DESC LIMIT 50', app_id
    )
    return {"logs": [dict(r) for r in rows]}

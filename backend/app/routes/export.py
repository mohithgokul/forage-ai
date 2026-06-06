import json
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from app import db
from app.dependencies import get_current_user
from app.zip_generator import generate_app_zip

router = APIRouter(prefix="/api/apps", tags=["export"])


@router.get("/{app_id}/export/zip")
async def export_zip(
    app_id: str,
    repoName: str,
    includeSeedData: bool = False,
    current_user: dict = Depends(get_current_user),
):
    if not repoName or not repoName.replace("-", "").replace("_", "").isalnum():
        raise HTTPException(400, {"error": "BAD_REQUEST", "message": "repoName must be alphanumeric with hyphens"})

    app = await db.fetchrow('SELECT * FROM "App" WHERE id = $1', app_id)
    if not app:
        raise HTTPException(404, {"error": "NOT_FOUND", "message": "App not found"})
    if app["userId"] != current_user["id"]:
        raise HTTPException(403, {"error": "FORBIDDEN", "message": "Not authorized"})

    zip_bytes = generate_app_zip(dict(app), repoName, includeSeedData)
    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={repoName}.zip"},
    )

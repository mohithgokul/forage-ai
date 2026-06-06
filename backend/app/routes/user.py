from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from app import db
from app.auth_utils import hash_password, verify_password
from app.dependencies import get_current_user
from app.sql_builder import build_drop_table_sql
import re

router = APIRouter(prefix="/api/user", tags=["user"])


class ProfileBody(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None


class PasswordBody(BaseModel):
    currentPassword: str
    newPassword: str


class DeleteBody(BaseModel):
    password: str


@router.patch("/profile")
async def update_profile(body: ProfileBody, current_user: dict = Depends(get_current_user)):
    user = await db.fetchrow(
        'UPDATE "User" SET name = COALESCE($1, name), avatar = COALESCE($2, avatar), "updatedAt" = NOW() '
        'WHERE id = $3 RETURNING id, name, email, avatar',
        body.name, body.avatar, current_user["id"],
    )
    return {"user": dict(user)}


@router.patch("/password")
async def change_password(body: PasswordBody, current_user: dict = Depends(get_current_user)):
    if len(body.newPassword) < 8:
        raise HTTPException(400, "New password must be at least 8 characters")
    user = await db.fetchrow('SELECT password FROM "User" WHERE id = $1', current_user["id"])
    if not user["password"] or not verify_password(body.currentPassword, user["password"]):
        raise HTTPException(401, {"error": "UNAUTHORIZED", "message": "Incorrect current password"})
    hashed = hash_password(body.newPassword)
    await db.execute('UPDATE "User" SET password = $1, "updatedAt" = NOW() WHERE id = $2', hashed, current_user["id"])
    await db.execute('DELETE FROM "RefreshToken" WHERE "userId" = $1', current_user["id"])
    return {"success": True}


@router.delete("/account")
async def delete_account(body: DeleteBody, current_user: dict = Depends(get_current_user)):
    user = await db.fetchrow('SELECT password FROM "User" WHERE id = $1', current_user["id"])
    if not user["password"] or not verify_password(body.password, user["password"]):
        raise HTTPException(401, {"error": "UNAUTHORIZED", "message": "Incorrect password"})

    # Drop all dynamic tables
    apps = await db.fetch('SELECT id, config FROM "App" WHERE "userId" = $1', current_user["id"])
    for app in apps:
        config = app["config"] if isinstance(app["config"], dict) else {}
        for table in config.get("tables", []):
            sql = build_drop_table_sql(app["id"], table["name"])
            try:
                await db.execute(sql)
            except Exception:
                pass

    await db.execute('DELETE FROM "User" WHERE id = $1', current_user["id"])
    return {"success": True}

import json
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Response, Request, Depends, Cookie
from pydantic import BaseModel, EmailStr
from app import db
from app.auth_utils import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_refresh_token,
)
from app.config import settings
from app.dependencies import get_current_user
from jose import JWTError

router = APIRouter(prefix="/api/auth", tags=["auth"])

COOKIE_OPTS = dict(httponly=True, samesite="none", secure=True, max_age=7 * 24 * 3600)


def _set_refresh_cookie(response: Response, token: str):
    response.set_cookie("refreshToken", token, **COOKIE_OPTS)


class RegisterBody(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginBody(BaseModel):
    email: EmailStr
    password: str

class GoogleBody(BaseModel):
    googleToken: str


@router.post("/register", status_code=201)
async def register(body: RegisterBody, response: Response):
    if len(body.name) < 2:
        raise HTTPException(400, "Name must be at least 2 characters")
    if len(body.password) < 8:
        raise HTTPException(400, "Password must be at least 8 characters")

    existing = await db.fetchrow('SELECT id FROM "User" WHERE email = $1', body.email)
    if existing:
        raise HTTPException(409, {"error": "USER_EXISTS", "message": "Email already exists"})

    hashed = hash_password(body.password)
    user = await db.fetchrow(
        'INSERT INTO "User" (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
        body.name, body.email, hashed,
    )

    access_token = create_access_token(user["id"], user["email"])
    refresh_token, expires_at = create_refresh_token(user["id"])
    await db.execute(
        'INSERT INTO "RefreshToken" (token, "userId", "expiresAt") VALUES ($1, $2, $3)',
        refresh_token, user["id"], expires_at,
    )
    _set_refresh_cookie(response, refresh_token)
    return {"user": dict(user), "accessToken": access_token}


@router.post("/login")
async def login(body: LoginBody, response: Response):
    user = await db.fetchrow('SELECT * FROM "User" WHERE email = $1', body.email)
    if not user or not user["password"]:
        raise HTTPException(401, {"error": "UNAUTHORIZED", "message": "Invalid credentials"})
    if not verify_password(body.password, user["password"]):
        raise HTTPException(401, {"error": "UNAUTHORIZED", "message": "Invalid credentials"})

    access_token = create_access_token(user["id"], user["email"])
    refresh_token, expires_at = create_refresh_token(user["id"])
    await db.execute(
        'INSERT INTO "RefreshToken" (token, "userId", "expiresAt") VALUES ($1, $2, $3)',
        refresh_token, user["id"], expires_at,
    )
    _set_refresh_cookie(response, refresh_token)
    return {
        "user": {"id": user["id"], "name": user["name"], "email": user["email"], "avatar": user["avatar"]},
        "accessToken": access_token,
    }


@router.post("/google")
async def google_login(body: GoogleBody, response: Response):
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests
    try:
        idinfo = id_token.verify_oauth2_token(
            body.googleToken, google_requests.Request(), settings.GOOGLE_CLIENT_ID
        )
    except Exception:
        raise HTTPException(400, {"error": "BAD_REQUEST", "message": "Invalid Google token"})

    g_id, email = idinfo["sub"], idinfo["email"]
    name    = idinfo.get("name", "Google User")
    picture = idinfo.get("picture")

    user = await db.fetchrow('SELECT * FROM "User" WHERE "googleId" = $1 OR email = $2', g_id, email)
    if user:
        if not user["googleId"]:
            user = await db.fetchrow(
                'UPDATE "User" SET "googleId" = $1, avatar = $2 WHERE id = $3 RETURNING *',
                g_id, picture, user["id"],
            )
    else:
        user = await db.fetchrow(
            'INSERT INTO "User" (email, name, "googleId", avatar) VALUES ($1,$2,$3,$4) RETURNING *',
            email, name, g_id, picture,
        )

    access_token = create_access_token(user["id"], user["email"])
    refresh_token, expires_at = create_refresh_token(user["id"])
    await db.execute(
        'INSERT INTO "RefreshToken" (token, "userId", "expiresAt") VALUES ($1, $2, $3)',
        refresh_token, user["id"], expires_at,
    )
    _set_refresh_cookie(response, refresh_token)
    return {
        "user": {"id": user["id"], "name": user["name"], "email": user["email"], "avatar": user["avatar"]},
        "accessToken": access_token,
    }


@router.post("/refresh")
async def refresh(response: Response, request: Request):
    token = request.cookies.get("refreshToken")
    if not token:
        raise HTTPException(401, {"error": "UNAUTHORIZED", "message": "No refresh token"})

    saved = await db.fetchrow('SELECT * FROM "RefreshToken" WHERE token = $1', token)
    if not saved or saved["expiresAt"].replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        if saved:
            await db.execute('DELETE FROM "RefreshToken" WHERE id = $1', saved["id"])
        raise HTTPException(401, {"error": "UNAUTHORIZED", "message": "Refresh token expired"})

    try:
        decode_refresh_token(token)
    except JWTError:
        raise HTTPException(401, {"error": "INVALID_TOKEN", "message": "Invalid refresh token"})

    # Rotate token
    await db.execute('DELETE FROM "RefreshToken" WHERE id = $1', saved["id"])
    new_access = create_access_token(saved["userId"], "")
    new_refresh, new_expires = create_refresh_token(saved["userId"])
    await db.execute(
        'INSERT INTO "RefreshToken" (token, "userId", "expiresAt") VALUES ($1, $2, $3)',
        new_refresh, saved["userId"], new_expires,
    )
    _set_refresh_cookie(response, new_refresh)
    return {"accessToken": new_access}


@router.post("/logout")
async def logout(response: Response, request: Request):
    token = request.cookies.get("refreshToken")
    if token:
        await db.execute('DELETE FROM "RefreshToken" WHERE token = $1', token)
    response.delete_cookie("refreshToken")
    return {"success": True}


@router.get("/me")
async def me(current_user: dict = Depends(get_current_user)):
    user = await db.fetchrow(
        'SELECT id, name, email, avatar, "createdAt" FROM "User" WHERE id = $1',
        current_user["id"],
    )
    if not user:
        raise HTTPException(404, {"error": "NOT_FOUND", "message": "User not found"})
    return dict(user)

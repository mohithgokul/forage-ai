from fastapi import Depends, HTTPException, Cookie, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, ExpiredSignatureError
from app.auth_utils import decode_access_token
from app import db

bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
) -> dict:
    if not credentials:
        raise HTTPException(status_code=401, detail={"error": "NO_TOKEN", "message": "Authorization header missing"})
    try:
        payload = decode_access_token(credentials.credentials)
        return {"id": payload["userId"], "email": payload.get("email", "")}
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail={"error": "TOKEN_EXPIRED", "message": "Access token expired"})
    except JWTError:
        raise HTTPException(status_code=401, detail={"error": "INVALID_TOKEN", "message": "Invalid access token"})

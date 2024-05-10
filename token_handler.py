from fastapi import Depends, Security, status, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
import jwt


class UnauthorizedUserError(Exception):
    def __init__(self):
        super().__init__("Unauthorized User")


class TokenHandler:
    SECRET_KEY = "ddyuddya"
    ALGORITHM = "HS256"

    @classmethod
    def create_token(cls, sub: str, expires_delta: timedelta):
        to_encode = {"sub": sub, "exp": datetime.utcnow() + expires_delta}
        encoded_jwt = jwt.encode(
            to_encode, cls.SECRET_KEY, algorithm=cls.ALGORITHM)
        return encoded_jwt

    @classmethod
    def verify_token(cls, auth: HTTPAuthorizationCredentials = Depends(HTTPBearer())):
        try:
            payload = jwt.decode(
                auth.credentials, cls.SECRET_KEY, algorithms=[cls.ALGORITHM]
            )
            print("payload:", payload)
            if payload.get("sub") != "sgn04088":
                raise UnauthorizedUserError()
            return payload
        except jwt.PyJWTError:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
        except UnauthorizedUserError:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

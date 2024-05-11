from fastapi import Depends, Security, Request, Cookie, status, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from exceptions import UnregisteredUserError, ExpiredAccessTokenError
import jwt
import time


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
    def verify_access_token(
        cls,
        crendentials: HTTPAuthorizationCredentials = Security(HTTPBearer()),
        refresh_token: dict = Cookie(None),
    ):
        try:
            token_payload = jwt.decode(
                crendentials.credentials, cls.SECRET_KEY, algorithms=[
                    cls.ALGORITHM]
            )
            print("payload:", token_payload)
            print(
                "Expiration Date:",
                datetime.fromtimestamp(token_payload.get("exp")).strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),
            )
            if token_payload.get("sub") != "sgn04088":
                raise UnregisteredUserError()
            return token_payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                detail="Access Token Expired", status_code=status.HTTP_40
            )
        except jwt.PyJWTError:
            raise HTTPException(
                detail="Token Error", status_code=status.HTTP_400_BAD_REQUEST
            )

    @classmethod
    def verify_refresh_token(cls, ):

from typing import Annotated
from fastapi import Depends, Security, Request, Cookie, status, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from exceptions import (
    UnregisteredUserError,
    ExpiredAccessTokenError,
    NeedLoginError,
    AllTokensExpiredError,
)
import jwt
import time

security = HTTPBearer()


class TokenInfo:
    def __init__(self, access_token: HTTPAuthorizationCredentials, username: str):
        self.access_token = access_token
        self.username = username


class TokenHandler:
    SECRET_KEY = "ddyuddya"
    ALGORITHM = "HS256"
    REFRESH_TOKEN_EXPIRES = timedelta(days=1)
    ACCESS_TOKEN_EXPIRES = timedelta(hours=1)

    @classmethod
    def create_token(cls, sub: str, expires_delta: timedelta):
        to_encode = {"sub": sub, "exp": datetime.utcnow() + expires_delta}
        encoded_jwt = jwt.encode(to_encode, cls.SECRET_KEY, algorithm=cls.ALGORITHM)
        return encoded_jwt

    @classmethod
    def create_access_token(cls, sub: str):
        return cls.create_token(sub=sub, expires_delta=cls.ACCESS_TOKEN_EXPIRES)

    @classmethod
    def create_refresh_token(cls, sub: str):
        return cls.create_token(sub=sub, expires_delta=cls.REFRESH_TOKEN_EXPIRES)

    @classmethod
    def verify_access_token(
        cls,
        credentials: HTTPAuthorizationCredentials = Security(security),
    ):
        try:
            token_payload = jwt.decode(
                credentials.credentials, cls.SECRET_KEY, algorithms=[cls.ALGORITHM]
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
            return TokenInfo(credentials, token_payload.get("sub"))

        except jwt.ExpiredSignatureError:
            # raise HTTPException(
            #     detail="Access Token Expired", status_code=status.HTTP_40
            # )
            print("Access Token has expired")
            return cls.verify_refresh_token()
        except jwt.PyJWTError:
            raise HTTPException(
                detail="Token Error", status_code=status.HTTP_400_BAD_REQUEST
            )

    @classmethod
    def verify_refresh_token(
        cls, refresh_token: Annotated[str | None, Cookie()] = None
    ):
        if refresh_token is None:
            raise NeedLoginError

        try:
            token_payload = jwt.decode(
                refresh_token, cls.SECRET_KEY, algorithms=[cls.ALGORITHM]
            )
            new_access_token = cls.create_token(
                sub=token_payload.get("sub"), expires_delta=cls.ACCESS_TOKEN_EXPIRES
            )
            return new_access_token
        except jwt.ExpiredSignatureError:
            print("Refresh Token has expired")
            raise AllTokensExpiredError()

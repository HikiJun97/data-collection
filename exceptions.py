from fastapi import HTTPException, status


class UnregisteredUserError(HTTPException):
    def __init__(self):
        super().__init__(
            detail="Unregistered User", status_code=status.HTTP_403_FORBIDDEN
        )


class ExpiredAccessTokenError(HTTPException):
    def __init__(self):
        super().__init__(
            detail="Access Token Expired", status_code=status.HTTP_401_UNAUTHORIZED
        )


class NeedLoginError(HTTPException):
    def __init__(self):
        super().__init__(detail="Need Login", status_code=status.HTTP_403_FORBIDDEN)

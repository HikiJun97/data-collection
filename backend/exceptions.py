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


class AllTokensExpiredError(HTTPException):
    def __init__(self):
        super().__init__(
            detail="All Tokens have been exipred", status_code=status.HTTP_403_FORBIDDEN
        )


class VideoProcessingError(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)


class ValidationError(Exception):
    def __init__(self, msg):
        super().__init__(msg)

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    userId: str
    userPw: str
    remember: bool = Field(default=False)

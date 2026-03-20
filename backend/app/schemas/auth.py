from pydantic import BaseModel, Field


class SignupRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=254)
    password: str = Field(..., min_length=6, max_length=128)
    name: str | None = Field(default=None, max_length=100)


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=254)
    password: str = Field(..., min_length=6, max_length=128)


class UserPublic(BaseModel):
    email: str
    name: str | None = None


class AuthResponse(BaseModel):
    token: str
    user: UserPublic

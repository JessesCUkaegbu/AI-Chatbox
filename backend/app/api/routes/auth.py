from fastapi import APIRouter, HTTPException, status

from app.schemas.auth import AuthResponse, LoginRequest, SignupRequest, UserPublic
from app.services.auth import authenticate_user, create_session, register_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest) -> AuthResponse:
    try:
        user = register_user(payload.email, payload.password, payload.name)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered.",
        ) from exc

    token = create_session(user.email)
    return AuthResponse(token=token, user=UserPublic(email=user.email, name=user.name))


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest) -> AuthResponse:
    user = authenticate_user(payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_session(user.email)
    return AuthResponse(token=token, user=UserPublic(email=user.email, name=user.name))

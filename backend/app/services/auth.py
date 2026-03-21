from __future__ import annotations

import hashlib
import hmac
import secrets
import time
from dataclasses import dataclass


@dataclass(frozen=True)
class UserRecord:
    email: str
    name: str | None
    password_hash: str
    created_at: float


_USERS: dict[str, UserRecord] = {}
_SESSIONS: dict[str, str] = {}
_PBKDF2_ITERATIONS = 120_000


def _hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    derived_key = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, _PBKDF2_ITERATIONS
    )
    return f"{salt.hex()}${derived_key.hex()}"


def _verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt_hex, hash_hex = stored_hash.split("$", 1)
    except ValueError:
        return False

    salt = bytes.fromhex(salt_hex)
    expected = bytes.fromhex(hash_hex)
    derived_key = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, _PBKDF2_ITERATIONS
    )
    return hmac.compare_digest(derived_key, expected)


def register_user(email: str, password: str, name: str | None) -> UserRecord:
    normalized_email = email.strip().lower()
    if normalized_email in _USERS:
        raise ValueError("User already exists.")

    record = UserRecord(
        email=normalized_email,
        name=name.strip() if name else None,
        password_hash=_hash_password(password),
        created_at=time.time(),
    )
    _USERS[normalized_email] = record
    return record


def authenticate_user(email: str, password: str) -> UserRecord | None:
    normalized_email = email.strip().lower()
    record = _USERS.get(normalized_email)
    if not record or not _verify_password(password, record.password_hash):
        return None
    return record


def create_session(email: str) -> str:
    token = secrets.token_urlsafe(32)
    _SESSIONS[token] = email
    return token


def get_user_by_token(token: str) -> UserRecord | None:
    email = _SESSIONS.get(token)
    if not email:
        return None
    return _USERS.get(email)

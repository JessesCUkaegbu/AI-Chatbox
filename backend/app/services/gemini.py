import re

from fastapi import HTTPException
from google import genai
from google.genai import types

from app.core.config import settings


def _friendly_quota_error(detail: str) -> HTTPException:
    lower_detail = detail.lower()
    if "resource_exhausted" not in lower_detail and "quota" not in lower_detail:
        return HTTPException(status_code=500, detail=detail)

    retry_after = None
    match = re.search(r"retry in ([0-9]+(?:\.[0-9]+)?)s", lower_detail)
    if match:
        retry_after = match.group(1)

    if retry_after:
        message = f"Quota exceeded. Please retry in about {retry_after} seconds."
    else:
        message = "Quota exceeded. Please retry shortly or check your Gemini API plan."

    return HTTPException(status_code=429, detail=message)


_client: genai.Client | None = None


def get_client() -> genai.Client:
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is not set in the environment.")
    return genai.Client(api_key=settings.gemini_api_key)


def generate_reply(user_message: str) -> str:
    try:
        global _client
        if _client is None:
            _client = get_client()

        response = _client.models.generate_content(
            model=settings.gemini_model,
            contents=user_message,
            config=types.GenerateContentConfig(
                max_output_tokens=settings.gemini_max_output_tokens,
                temperature=settings.gemini_temperature,
            ),
        )
        return (response.text or "").strip() or "I could not generate a response."
    except Exception as exc:
        raise _friendly_quota_error(str(exc))

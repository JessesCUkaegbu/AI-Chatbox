from fastapi import HTTPException
from openai import OpenAI

from app.core.config import settings

_client: OpenAI | None = None


def _get_client() -> OpenAI:
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is not set in the environment.")
    return OpenAI(api_key=settings.openai_api_key)


def generate_reply(user_message: str) -> str:
    try:
        global _client
        if _client is None:
            _client = _get_client()

        response = _client.responses.create(
            model=settings.openai_model,
            input=user_message,
            max_output_tokens=settings.openai_max_output_tokens,
            temperature=settings.openai_temperature,
        )
        text = getattr(response, "output_text", "") or ""
        return text.strip() or "I could not generate a response."
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

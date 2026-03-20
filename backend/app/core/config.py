import os
from dataclasses import dataclass, field

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    gemini_api_key: str | None = os.environ.get("GEMINI_API_KEY")
    gemini_model: str = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
    gemini_max_output_tokens: int = int(
        os.environ.get("GEMINI_MAX_OUTPUT_TOKENS", "256")
    )
    gemini_temperature: float = float(os.environ.get("GEMINI_TEMPERATURE", "0.3"))
    openai_api_key: str | None = os.environ.get("OPENAI_API_KEY")
    openai_model: str = os.environ.get("OPENAI_MODEL", "gpt-4.1-mini")
    openai_max_output_tokens: int = int(
        os.environ.get("OPENAI_MAX_OUTPUT_TOKENS", "256")
    )
    openai_temperature: float = float(os.environ.get("OPENAI_TEMPERATURE", "0.3"))
    cors_origins: list[str] = field(
        default_factory=lambda: os.environ.get(
            "CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
        ).split(",")
    )


settings = Settings()

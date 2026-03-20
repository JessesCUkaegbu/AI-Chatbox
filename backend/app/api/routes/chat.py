from fastapi import APIRouter

from app.schemas.chat import ChatRequest, ChatResponse
from app.services.gemini import generate_reply as generate_gemini_reply
from app.services.openai_gpt import generate_reply as generate_gpt_reply

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    return ChatResponse(reply=generate_gemini_reply(request.message))


@router.post("/chat/gpt", response_model=ChatResponse)
async def chat_gpt(request: ChatRequest) -> ChatResponse:
    return ChatResponse(reply=generate_gpt_reply(request.message))

from pyclbr import Class

from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, chat
from app.core.config import settings



app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




def read_root():
    return {"message": "Welcome to the FastAPI application!"}



app.include_router(chat.router)
app.include_router(auth.router)

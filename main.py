"""
CaloriX — Combined Backend
FastAPI app with: user auth, recipes/meals/goals DB, and local LLM chat —
all in one server.

Run:
    uvicorn app.main:app --reload --port 8000

First-time setup:
    python seed_recipes.py     # populate the recipes table
"""

import os
from pathlib import Path
from contextlib import asynccontextmanager

from dotenv import load_dotenv

# Resolve .env explicitly relative to this file, so it's found no matter
# which directory you launch uvicorn from, and regardless of whether
# main.py lives at the project root or inside app/.
_ENV_PATH = Path(__file__).resolve().parent / ".env"
if not _ENV_PATH.exists():
    _ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=_ENV_PATH)

print(f"[CaloriX] Looking for .env at: {_ENV_PATH}  (exists: {_ENV_PATH.exists()})")
for _key in ("GROQ_API_KEY", "OPENAI_API_KEY", "GEMINI_API_KEY", "ANTHROPIC_API_KEY"):
    print(f"[CaloriX]   {_key} loaded: {bool(os.getenv(_key))}")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app import models
from app.routers import auth_router, recipes_router, meals_router, goals_router, chat_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    # NOTE: the local model is no longer force-loaded at startup. It only
    # loads lazily (see app/llm.py) the first time someone actually selects
    # "Local Model" in the chatbot's model picker. This means the server
    # starts instantly and works fine with just cloud providers configured
    # in .env — no GPU or downloaded model files required unless you use it.
    yield


app = FastAPI(title="CaloriX API", version="1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten this to your frontend origin in production
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(recipes_router.router)
app.include_router(meals_router.router)
app.include_router(goals_router.router)
app.include_router(chat_router.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "CaloriX API is running 🥗"}

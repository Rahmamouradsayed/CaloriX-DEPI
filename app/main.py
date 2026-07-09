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
import asyncio
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
from sqlalchemy import text

from app.database import Base, engine, SessionLocal
from app import models, auth
from app import cleanup
from app.routers import (
    auth_router,
    recipes_router,
    meals_router,
    goals_router,
    chat_router,
    admin_router,
)

ADMIN_EMAIL = "admin@gmail.com"
ADMIN_PASSWORD = "admin1"


def ensure_schema():
    """Lightweight SQLite-only migration for older local database files.

    Production Postgres deployments get the current schema from create_all().
    """
    database_url = os.getenv("DATABASE_URL", "sqlite:///./calorix.db")

    if not database_url.startswith("sqlite"):
        return

    with engine.begin() as conn:
        cols = [row[1] for row in conn.execute(text("PRAGMA table_info(users)")).fetchall()]

        if cols and "is_admin" not in cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0"))
            print("[CaloriX] Migrated users table: added is_admin column")


def ensure_seed_recipes():
    """Seed the default recipe list when using a fresh production database.

    This keeps Neon/Postgres deployments working without needing to SSH into
    the server and run seed_recipes.py manually.
    """
    db = SessionLocal()

    try:
        if db.query(models.Recipe).count() == 0:
            from seed_recipes import RECIPES

            for recipe in RECIPES:
                db.add(models.Recipe(**recipe))

            db.commit()
            print(f"[CaloriX] Seeded {len(RECIPES)} recipes")
    finally:
        db.close()


def ensure_admin_account():
    """Create the default admin account on startup, or reset it back to the
    known-good credentials if it already exists.
    """
    db = SessionLocal()

    try:
        admin = db.query(models.User).filter(models.User.email == ADMIN_EMAIL).first()

        if not admin:
            admin = models.User(
                email=ADMIN_EMAIL,
                password_hash=auth.hash_password(ADMIN_PASSWORD),
                name="Admin",
                is_admin=True,
            )
            db.add(admin)
            db.commit()
            print(f"[CaloriX] Created default admin account ({ADMIN_EMAIL} / {ADMIN_PASSWORD})")
        else:
            changed = False

            if not admin.is_admin:
                admin.is_admin = True
                changed = True

            if not auth.verify_password(ADMIN_PASSWORD, admin.password_hash):
                admin.password_hash = auth.hash_password(ADMIN_PASSWORD)
                changed = True

            if changed:
                db.commit()
                print(f"[CaloriX] Reset {ADMIN_EMAIL} to default admin credentials ({ADMIN_EMAIL} / {ADMIN_PASSWORD})")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)

    ensure_schema()
    ensure_admin_account()
    ensure_seed_recipes()

    # NOTE:
    # The local model is no longer force-loaded at startup.
    # It only loads lazily when someone actually selects "Local Model"
    # in the chatbot's model picker.
    #
    # For Vercel/serverless deployment, background loops should be disabled,
    # because Vercel functions are not designed for long-running background tasks.

    cleanup_task = None

    if os.getenv("DISABLE_BACKGROUND_TASKS") != "1" and not os.getenv("VERCEL"):
        cleanup_task = asyncio.create_task(cleanup.run_meal_cleanup_loop())
        print("[CaloriX] Background cleanup task started")
    else:
        print("[CaloriX] Background cleanup task disabled")

    try:
        yield
    finally:
        if cleanup_task:
            cleanup_task.cancel()

            try:
                await cleanup_task
            except asyncio.CancelledError:
                pass


app = FastAPI(title="CaloriX API", version="1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your frontend origin in production
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(recipes_router.router)
app.include_router(meals_router.router)
app.include_router(goals_router.router)
app.include_router(chat_router.router)
app.include_router(admin_router.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "CaloriX API is running 🥗"}

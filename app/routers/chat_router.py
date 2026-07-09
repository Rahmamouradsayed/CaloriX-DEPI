from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth, providers

router = APIRouter(prefix="/chat", tags=["chat"])


@router.get("/models")
def list_models():
    """Available models for the frontend's model picker (no keys exposed)."""
    return {"models": providers.list_models()}


@router.post("/completions")
def chat_completions(
    payload: schemas.ChatRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    provider = payload.provider or "groq"
    messages = [m.model_dump() for m in payload.messages]

    try:
        if provider == "local":
            from app import llm  # lazy import — only needed if the local model is actually selected
            reply = llm.generate(
                messages,
                max_new_tokens=payload.max_tokens or 800,
                temperature=payload.temperature or 0.7,
            )
        else:
            reply = providers.call_provider(
                provider,
                messages,
                max_tokens=payload.max_tokens or 800,
                temperature=payload.temperature or 0.7,
            )
    except ValueError as e:
        # Missing/invalid API key, unknown provider, etc — a clear client-facing error
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Persist the latest user message + assistant reply
    if payload.save_history and messages:
        last_user_msg = next((m for m in reversed(messages) if m["role"] == "user"), None)
        if last_user_msg:
            db.add(models.ChatMessage(user_id=current_user.id, role="user", content=last_user_msg["content"]))
        db.add(models.ChatMessage(user_id=current_user.id, role="assistant", content=reply))
        db.commit()

    return {"reply": reply, "provider": provider}


@router.get("/history", response_model=List[schemas.ChatMessageOut])
def get_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.user_id == current_user.id)
        .order_by(models.ChatMessage.created_at.asc())
        .all()
    )


@router.delete("/history")
def clear_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    db.query(models.ChatMessage).filter(models.ChatMessage.user_id == current_user.id).delete()
    db.commit()
    return {"cleared": True}

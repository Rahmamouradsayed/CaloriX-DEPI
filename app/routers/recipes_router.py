from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/recipes", tags=["recipes"])


@router.get("", response_model=List[schemas.RecipeOut])
def list_recipes(
    search: Optional[str] = None,
    category: Optional[str] = None,
    max_calories: Optional[float] = None,
    db: Session = Depends(get_db),
):
    q = db.query(models.Recipe)
    if search:
        like = f"%{search.lower()}%"
        q = q.filter(models.Recipe.name.ilike(like))
    if category and category != "All":
        q = q.filter(models.Recipe.category == category)
    if max_calories:
        q = q.filter(models.Recipe.calories <= max_calories)
    return q.all()


@router.get("/{recipe_id}", response_model=schemas.RecipeOut)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe


# ── SAVED / BOOKMARKED RECIPES (requires login) ───────────────────
@router.get("/saved/list", response_model=List[schemas.RecipeOut])
def list_saved_recipes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    saved = db.query(models.SavedRecipe).filter(models.SavedRecipe.user_id == current_user.id).all()
    return [s.recipe for s in saved]


@router.post("/saved/{recipe_id}")
def toggle_saved_recipe(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    existing = db.query(models.SavedRecipe).filter(
        models.SavedRecipe.user_id == current_user.id,
        models.SavedRecipe.recipe_id == recipe_id,
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"saved": False}

    db.add(models.SavedRecipe(user_id=current_user.id, recipe_id=recipe_id))
    db.commit()
    return {"saved": True}

import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/meals", tags=["meals"])

# Rolling 24h window rather than calendar midnight — a meal logged at
# 11pm still counts as "today" until 24h have actually passed, and the
# background cleanup job (see app/cleanup.py) permanently deletes meals
# once they age out of this window.
WINDOW_HOURS = 24


def _cutoff() -> datetime.datetime:
    return datetime.datetime.utcnow() - datetime.timedelta(hours=WINDOW_HOURS)


@router.get("", response_model=List[schemas.MealOut])
def list_today_meals(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return (
        db.query(models.Meal)
        .filter(models.Meal.user_id == current_user.id, models.Meal.logged_at >= _cutoff())
        .order_by(models.Meal.logged_at.desc())
        .all()
    )


@router.post("", response_model=schemas.MealOut)
def log_meal(
    payload: schemas.MealCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    meal = models.Meal(user_id=current_user.id, **payload.model_dump())
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return meal


@router.delete("/{meal_id}")
def delete_meal(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    meal = db.query(models.Meal).filter(
        models.Meal.id == meal_id, models.Meal.user_id == current_user.id
    ).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    db.delete(meal)
    db.commit()
    return {"deleted": True}


@router.delete("")
def clear_today_meals(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    db.query(models.Meal).filter(
        models.Meal.user_id == current_user.id, models.Meal.logged_at >= _cutoff()
    ).delete()
    db.commit()
    return {"cleared": True}

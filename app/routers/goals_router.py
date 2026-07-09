from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/goals", tags=["goals"])


@router.get("", response_model=schemas.GoalOut)
def get_goal(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    goal = db.query(models.Goal).filter(models.Goal.user_id == current_user.id).first()
    if not goal:
        goal = models.Goal(user_id=current_user.id, calorie_goal=2000, diet_type="Weight Loss")
        db.add(goal)
        db.commit()
        db.refresh(goal)
    return goal


@router.put("", response_model=schemas.GoalOut)
def update_goal(
    payload: schemas.GoalUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    goal = db.query(models.Goal).filter(models.Goal.user_id == current_user.id).first()
    if not goal:
        goal = models.Goal(user_id=current_user.id)
        db.add(goal)

    goal.calorie_goal = payload.calorie_goal
    goal.diet_type = payload.diet_type
    db.commit()
    db.refresh(goal)
    return goal

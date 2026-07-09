import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, ConfigDict


# ── AUTH ──────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    name: Optional[str] = None
    is_admin: Optional[bool] = False

class UserUpdate(BaseModel):
    name: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ── ADMIN ─────────────────────────────────────────────────────────
class AdminUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    name: Optional[str] = None
    is_admin: bool = False
    created_at: datetime.datetime

class AdminUserUpdate(BaseModel):
    name: Optional[str] = None
    is_admin: Optional[bool] = None


# ── RECIPES ───────────────────────────────────────────────────────
class RecipeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    name_ar: Optional[str] = None
    emoji: Optional[str] = None
    category: Optional[str] = None
    cuisine: Optional[str] = None
    difficulty: Optional[str] = None
    calories: Optional[float] = None
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fat: Optional[float] = None
    fiber: Optional[float] = None
    time: Optional[int] = None
    goal: Optional[str] = None
    tags: Optional[str] = None
    health: Optional[float] = None
    vegan: Optional[bool] = False
    vegetarian: Optional[bool] = False
    allergens: Optional[str] = "None"
    rating: Optional[float] = 0
    reviews: Optional[int] = 0


class RecipeCreate(BaseModel):
    name: str
    name_ar: Optional[str] = None
    emoji: Optional[str] = None
    category: Optional[str] = None
    cuisine: Optional[str] = None
    difficulty: Optional[str] = None
    calories: Optional[float] = 0
    protein: Optional[float] = 0
    carbs: Optional[float] = 0
    fat: Optional[float] = 0
    fiber: Optional[float] = 0
    time: Optional[int] = 0
    goal: Optional[str] = None
    tags: Optional[str] = ""
    health: Optional[float] = 0
    vegan: Optional[bool] = False
    vegetarian: Optional[bool] = False
    allergens: Optional[str] = "None"
    rating: Optional[float] = 0
    reviews: Optional[int] = 0


# ── MEALS ─────────────────────────────────────────────────────────
class MealCreate(BaseModel):
    name: str
    kcal: float
    protein: float = 0
    carbs: float = 0
    fat: float = 0

class MealOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    kcal: float
    protein: float
    carbs: float
    fat: float
    logged_at: datetime.datetime


# ── GOALS ─────────────────────────────────────────────────────────
class GoalUpdate(BaseModel):
    calorie_goal: int
    diet_type: str

class GoalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    calorie_goal: int
    diet_type: str


# ── SAVED RECIPES ─────────────────────────────────────────────────
class SavedRecipeOut(BaseModel):
    recipe_id: int


# ── CHAT ──────────────────────────────────────────────────────────
class ChatMessageIn(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessageIn]
    provider: Optional[str] = "groq"
    max_tokens: Optional[int] = 800
    temperature: Optional[float] = 0.7
    save_history: Optional[bool] = True

class ChatMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    role: str
    content: str
    created_at: datetime.datetime

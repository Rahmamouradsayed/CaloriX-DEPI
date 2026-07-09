import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    email         = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name          = Column(String, nullable=True)
    is_admin      = Column(Boolean, default=False)
    created_at    = Column(DateTime, default=datetime.datetime.utcnow)

    goal          = relationship("Goal", back_populates="user", uselist=False, cascade="all, delete-orphan")
    meals         = relationship("Meal", back_populates="user", cascade="all, delete-orphan")
    saved_recipes = relationship("SavedRecipe", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")


class Recipe(Base):
    __tablename__ = "recipes"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String, nullable=False)
    name_ar     = Column(String, nullable=True)
    emoji       = Column(String, nullable=True)
    category    = Column(String, index=True)
    cuisine     = Column(String, index=True)
    difficulty  = Column(String)
    calories    = Column(Float)
    protein     = Column(Float)
    carbs       = Column(Float)
    fat         = Column(Float)
    fiber       = Column(Float)
    time        = Column(Integer)          # minutes
    goal        = Column(String)
    tags        = Column(String)           # comma-separated
    health      = Column(Float)
    vegan       = Column(Boolean, default=False)
    vegetarian  = Column(Boolean, default=False)
    allergens   = Column(String, default="None")
    rating      = Column(Float, default=0)
    reviews     = Column(Integer, default=0)

    saved_by = relationship("SavedRecipe", back_populates="recipe", cascade="all, delete-orphan")

    def tag_list(self):
        return [t.strip() for t in (self.tags or "").split(",") if t.strip()]


class SavedRecipe(Base):
    __tablename__ = "saved_recipes"
    __table_args__ = (UniqueConstraint("user_id", "recipe_id", name="uq_user_recipe"),)

    id        = Column(Integer, primary_key=True, index=True)
    user_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    saved_at  = Column(DateTime, default=datetime.datetime.utcnow)

    user   = relationship("User", back_populates="saved_recipes")
    recipe = relationship("Recipe", back_populates="saved_by")


class Meal(Base):
    __tablename__ = "meals"

    id        = Column(Integer, primary_key=True, index=True)
    user_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    name      = Column(String, nullable=False)
    kcal      = Column(Float, default=0)
    protein   = Column(Float, default=0)
    carbs     = Column(Float, default=0)
    fat       = Column(Float, default=0)
    logged_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="meals")


class Goal(Base):
    __tablename__ = "goals"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    calorie_goal  = Column(Integer, default=2000)
    diet_type     = Column(String, default="Weight Loss")

    user = relationship("User", back_populates="goal")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    role       = Column(String, nullable=False)   # user | assistant
    content    = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="chat_messages")

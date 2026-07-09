"""
Run this once to populate the recipes table:
    python seed_recipes.py
"""

from app.database import SessionLocal, engine, Base
from app import models

RECIPES = [
    dict(id=1, name='Grilled Chicken Breast', name_ar='صدر دجاج مشوي', emoji='🍗', category='Main Course', cuisine='Mediterranean', difficulty='Easy', calories=323, protein=34.4, carbs=3.8, fat=13.2, fiber=0.5, time=27, goal='High Protein / Weight Loss', tags='high-protein,low-carb,grilled,keto,gluten-free,meal-prep', health=46.8, vegan=False, vegetarian=False, allergens='None', rating=5, reviews=2),
    dict(id=2, name='Egg White Omelette', name_ar='عجة بياض البيض', emoji='🍳', category='Breakfast', cuisine='International', difficulty='Very Easy', calories=185, protein=23.4, carbs=3.6, fat=6.4, fiber=1.1, time=12, goal='High Protein / Low Cal', tags='breakfast,high-protein,low-calorie,vegetarian,quick', health=53.1, vegan=False, vegetarian=True, allergens='Eggs', rating=4.33, reviews=3),
    dict(id=3, name='Quinoa Veggie Bowl', name_ar='وعاء كينوا', emoji='🥗', category='Main Course', cuisine='International', difficulty='Easy', calories=410, protein=16, carbs=58, fat=12, fiber=8, time=35, goal='Balanced / Vegan', tags='vegan,vegetarian,gluten-free,high-fiber,balanced', health=72, vegan=True, vegetarian=True, allergens='None', rating=4.7, reviews=12),
    dict(id=4, name='Greek Salad', name_ar='سلطة يونانية', emoji='🥙', category='Salad', cuisine='Mediterranean', difficulty='Very Easy', calories=180, protein=5, carbs=12, fat=13, fiber=2.5, time=10, goal='Weight Loss', tags='low-calorie,vegetarian,mediterranean,quick,weight-loss', health=68, vegan=False, vegetarian=True, allergens='Dairy', rating=4.8, reviews=20),
    dict(id=5, name='Lentil Soup', name_ar='شوربة عدس', emoji='🍲', category='Soup', cuisine='Middle Eastern', difficulty='Easy', calories=240, protein=18, carbs=38, fat=3, fiber=12, time=45, goal='High Protein / Vegan', tags='vegan,high-protein,high-fiber,low-fat,comfort', health=78, vegan=True, vegetarian=True, allergens='None', rating=4.6, reviews=15),
    dict(id=6, name='Avocado Toast', name_ar='توست أفوكادو', emoji='🥑', category='Breakfast', cuisine='International', difficulty='Very Easy', calories=290, protein=8, carbs=28, fat=18, fiber=7, time=8, goal='Healthy Fats / Balanced', tags='vegetarian,quick,breakfast,healthy-fats,trendy', health=62, vegan=True, vegetarian=True, allergens='Gluten', rating=4.5, reviews=18),
    dict(id=7, name='Tuna Salad', name_ar='سلطة تونة', emoji='🐟', category='Lunch', cuisine='International', difficulty='Very Easy', calories=220, protein=30, carbs=5, fat=9, fiber=1.5, time=10, goal='High Protein / Weight Loss', tags='high-protein,low-carb,keto,quick,gluten-free', health=70, vegan=False, vegetarian=False, allergens='Fish', rating=4.2, reviews=8),
    dict(id=8, name='Overnight Oats', name_ar='شوفان الليل', emoji='🫙', category='Breakfast', cuisine='International', difficulty='Very Easy', calories=310, protein=10, carbs=55, fat=6, fiber=6.5, time=5, goal='Energy / Balanced', tags='vegetarian,breakfast,high-fiber,meal-prep,easy', health=75, vegan=True, vegetarian=True, allergens='Gluten,Dairy', rating=4.9, reviews=35),
    dict(id=9, name='Salmon with Asparagus', name_ar='سلمون مع هليون', emoji='🐠', category='Main Course', cuisine='Mediterranean', difficulty='Medium', calories=420, protein=42, carbs=8, fat=24, fiber=3, time=30, goal='High Protein / Omega-3', tags='high-protein,keto,gluten-free,healthy-fats,omega3', health=85, vegan=False, vegetarian=False, allergens='Fish', rating=4.8, reviews=22),
    dict(id=10, name='Hummus & Veggie Plate', name_ar='حمص مع خضار', emoji='🫘', category='Snack', cuisine='Middle Eastern', difficulty='Easy', calories=160, protein=7, carbs=18, fat=7, fiber=5, time=5, goal='Snack / Vegan', tags='vegan,vegetarian,gluten-free,quick,snack,healthy', health=80, vegan=True, vegetarian=True, allergens='Sesame', rating=4.7, reviews=28),
    dict(id=11, name='Chicken Stir Fry', name_ar='دجاج مع خضار', emoji='🥢', category='Main Course', cuisine='Asian', difficulty='Medium', calories=380, protein=35, carbs=22, fat=15, fiber=4, time=25, goal='High Protein / Balanced', tags='high-protein,asian,balanced,colorful', health=60, vegan=False, vegetarian=False, allergens='Soy,Gluten', rating=4.4, reviews=11),
    dict(id=12, name='Shakshuka', name_ar='شكشوكة', emoji='🫕', category='Breakfast', cuisine='Middle Eastern', difficulty='Easy', calories=245, protein=14, carbs=22, fat=12, fiber=4.5, time=25, goal='Balanced / Vegetarian', tags='vegetarian,breakfast,spiced,comfort,middle-eastern', health=65, vegan=False, vegetarian=True, allergens='Eggs', rating=4.9, reviews=40),
    dict(id=13, name='Black Bean Tacos', name_ar='تاكو فاصوليا', emoji='🌮', category='Main Course', cuisine='Mexican', difficulty='Easy', calories=350, protein=15, carbs=52, fat=9, fiber=11, time=20, goal='Vegan / High Fiber', tags='vegan,vegetarian,high-fiber,mexican,fun', health=69, vegan=True, vegetarian=True, allergens='Gluten', rating=4.5, reviews=14),
    dict(id=14, name='Berry Smoothie Bowl', name_ar='وعاء سموذي', emoji='🫐', category='Breakfast', cuisine='International', difficulty='Very Easy', calories=270, protein=8, carbs=48, fat=7, fiber=8, time=10, goal='Antioxidants / Energy', tags='vegan,breakfast,high-fiber,antioxidants,colorful', health=74, vegan=True, vegetarian=True, allergens='None', rating=4.6, reviews=19),
    dict(id=15, name='Beef Kofta', name_ar='كفتة لحم', emoji='🍢', category='Main Course', cuisine='Middle Eastern', difficulty='Medium', calories=385, protein=28, carbs=8, fat=28, fiber=1.5, time=30, goal='High Protein / Keto', tags='high-protein,keto,grilled,middle-eastern,family', health=52, vegan=False, vegetarian=False, allergens='None', rating=4.7, reviews=31),
    dict(id=16, name='Caprese Salad', name_ar='سلطة كابريزي', emoji='🍅', category='Salad', cuisine='Italian', difficulty='Very Easy', calories=190, protein=10, carbs=6, fat=14, fiber=1, time=8, goal='Light / Mediterranean', tags='vegetarian,italian,light,quick,elegant', health=66, vegan=False, vegetarian=True, allergens='Dairy', rating=4.8, reviews=17),
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing_count = db.query(models.Recipe).count()
        if existing_count > 0:
            print(f"[Seed] {existing_count} recipes already exist — skipping seed.")
            return

        for r in RECIPES:
            db.add(models.Recipe(**r))
        db.commit()
        print(f"[Seed] Inserted {len(RECIPES)} recipes ✓")
    finally:
        db.close()


if __name__ == "__main__":
    seed()

// ═══════════════════════════════════════════
// CALORIX — OFFLINE FALLBACK RESPONSES
// Used only when the visitor isn't logged in (no backend chat
// access) or the backend request fails. All real AI calls go
// through the FastAPI backend (see backend.js), which holds the
// provider API keys server-side via .env — never in the browser.
// ═══════════════════════════════════════════

function localFallback(text) {
  const t = text.toLowerCase();
  const hour = new Date().getHours();
  const mealTime = hour < 10 ? 'breakfast' : hour < 14 ? 'lunch' : hour < 17 ? 'snack' : 'dinner';

  if (t.includes('weight loss') || t.includes('lose weight') || t.includes('diet')) {
    return `For **weight loss**, I recommend focusing on high-protein, high-fiber meals:\n\n• **Grilled Chicken Breast** — 323 kcal, 34g protein 🍗\n• **Egg White Omelette** — 185 kcal, 23g protein 🍳\n• **Greek Salad** — 180 kcal, filling and fresh 🥗\n• **Lentil Soup** — 240 kcal, 18g protein + 12g fiber 🍲\n\n**Key tip:** Aim for a 300–500 kcal daily deficit. Protein keeps you full, fiber slows digestion. Would you like a specific meal plan? 💪`;
  }
  if (t.includes('protein') || t.includes('muscle') || t.includes('gym')) {
    return `**Top high-protein picks** in our database:\n\n• **Salmon with Asparagus** — 420 kcal, **42g protein** 🐠\n• **Grilled Chicken Breast** — 323 kcal, **34g protein** 🍗\n• **Tuna Salad** — 220 kcal, **30g protein** 🐟\n• **Egg White Omelette** — 185 kcal, **23g protein** 🍳\n\n**Daily target for muscle gain:** 1.8–2.2g protein per kg of body weight. Want a full day meal plan? 💪`;
  }
  if (t.includes('breakfast') || t.includes('morning')) {
    return `Great breakfast options for you this morning:\n\n• **Shakshuka** — 245 kcal, spiced tomatoes + eggs 🫕\n• **Overnight Oats** — 310 kcal, perfect meal prep 🫙\n• **Egg White Omelette** — 185 kcal, lowest calorie option 🍳\n• **Berry Smoothie Bowl** — 270 kcal, antioxidant-rich 🫐\n• **Avocado Toast** — 290 kcal, healthy fats 🥑\n\nAll are ready in under 15 minutes! Which dietary style do you prefer?`;
  }
  if (t.includes('vegan') || t.includes('plant')) {
    return `**Top vegan options** in the CaloriX database:\n\n• **Lentil Soup** — 240 kcal, 18g protein, 12g fiber 🍲\n• **Quinoa Veggie Bowl** — 410 kcal, complete amino acids 🥗\n• **Hummus & Veggie Plate** — 160 kcal, great snack 🫘\n• **Berry Smoothie Bowl** — 270 kcal, antioxidants 🫐\n• **Black Bean Tacos** — 350 kcal, 11g fiber 🌮\n\n**Watch:** B12, Iron, Zinc, and Omega-3 on a plant-based diet. Would you like supplement tips?`;
  }
  if (t.includes('keto') || t.includes('low carb')) {
    return `**Keto-friendly meals** (under 10g carbs):\n\n• **Grilled Chicken Breast** — 323 kcal, only **3.8g carbs** 🍗\n• **Tuna Salad** — 220 kcal, **5g carbs** 🐟\n• **Salmon with Asparagus** — 420 kcal, **8g carbs**, high omega-3 🐠\n• **Beef Kofta** — 385 kcal, **8g carbs** 🍢\n\n**Keto goal:** Keep carbs under 20-50g/day. These meals will keep you in ketosis! 🔥`;
  }
  if (t.includes('calori') || t.includes('how many') || t.includes('kcal')) {
    return `Happy to help with calorie info! Here are some benchmarks:\n\n• **Grilled Chicken** (100g): ~165 kcal\n• **Brown Rice** (cooked, 100g): ~112 kcal\n• **Avocado** (½): ~120 kcal\n• **Large Egg**: ~70 kcal\n• **Banana**: ~90 kcal\n\n**Daily needs (approximate):**\n• Sedentary: 1600–1800 kcal\n• Active: 2000–2500 kcal\n• Athletic: 2500–3500 kcal\n\nWant me to calculate your TDEE? Just tell me your weight, height, age and activity level! 📊`;
  }
  if (t.includes('snack') || t.includes('hungry')) {
    return `**Smart snack ideas** under 200 kcal:\n\n• **Hummus + Veggies** — 160 kcal 🫘\n• **Greek Yogurt** — ~100 kcal, high protein 🥛\n• **Apple + Almond Butter** — ~180 kcal\n• **Hard-boiled Eggs** (2) — ~140 kcal\n• **Mixed Nuts** (30g) — ~185 kcal, healthy fats\n\nFor ${mealTime} snacking, aim for something with protein to prevent overeating at the next meal! 💡`;
  }

  return `Welcome to **CaloriX AI**! 🥗\n\nYou're currently in **offline demo mode**. Log in to chat with real AI models (Local, Groq, OpenAI, Gemini, or Claude).\n\nEven offline, I can help with:\n• Weight loss meal suggestions\n• High-protein food lists\n• Calorie breakdowns\n• Breakfast, lunch & dinner ideas\n• Vegan & keto options\n\nWhat nutrition question can I help you with?`;
}

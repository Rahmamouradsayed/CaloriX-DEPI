# CaloriX 🥗
**AI-Powered Nutrition & Food Recommendation Platform**
*Built by Team DEPI — Mohamed Alaa, Youssif, Zeyad, Rahma, Ahmed, Abanob*

---

## 📁 Project Structure

```
calorix/
├── index.html                  ← SPA entry point
├── package.json                ← Project config
├── README.md                   ← This file
└── src/
    ├── app.js                  ← App bootstrap & route registration
    ├── data/
    │   └── recipes.js          ← Recipe database (16+ recipes from dataset)
    ├── utils/
    │   ├── router.js           ← Hash-based client-side router + scroll reveal
    │   ├── api.js              ← LLM API layer (OpenAI/Groq/Gemini/Anthropic)
    │   └── store.js            ← localStorage state + format helpers
    ├── components/
    │   ├── navbar.js           ← Sticky navbar + mobile hamburger menu
    │   ├── toast.js            ← Toast notifications + API key modal
    │   └── modal.js            ← (placeholder, logic in toast.js)
    ├── pages/
    │   ├── home.js             ← Landing page with hero, features, stats
    │   ├── chatbot.js          ← Full AI chat interface
    │   ├── recipes.js          ← Recipe explorer with filters & search
    │   └── tracker.js          ← Calorie & macro tracker with donut chart
    └── styles/
        ├── main.css            ← Variables, reset, typography, buttons, inputs
        ├── animations.css      ← All keyframe animations & transitions
        ├── components.css      ← Navbar, toasts, modal, recipe card styles
        └── pages.css           ← Page-specific layouts (hero, chat, recipes, tracker)
```

---

## 🚀 How to Run

### Option 1 — Double Click (Simplest)
Just open `index.html` directly in your browser:
```
File Explorer → double-click index.html
```
> ⚠️ Some features (API calls) may be blocked by CORS in file:// mode. Use Option 2 for full functionality.

---

### Option 2 — VS Code Live Server (Recommended)
1. Open the `calorix` folder in VS Code
2. Install the **Live Server** extension (ritwickdey.LiveServer)
3. Right-click `index.html` → **Open with Live Server**
4. Opens at: `http://127.0.0.1:5500`

---

### Option 3 — Python Server (No install needed)
```bash
cd calorix
python -m http.server 8000
```
Open: http://localhost:8000

---

### Option 4 — Node.js serve
```bash
cd calorix
npm install -g serve
serve . -p 3000
```
Open: http://localhost:3000

---

## 🤖 Setting Up the AI Chatbot

The chatbot works in **offline mode** without any API key (smart pre-built responses).
For full AI power:

1. Click **"Chat with AI"** in the navbar
2. Click **⚙️ Settings** or the banner button
3. Choose your provider and paste your API key

### Provider Options:

| Provider | Model | Cost | Get Key |
|---|---|---|---|
| **Groq** ⭐ | Llama 3.3-70B | ✅ **FREE** | [console.groq.com](https://console.groq.com) |
| OpenAI | GPT-4o Mini | ~$0.15/1M tokens | [platform.openai.com](https://platform.openai.com) |
| Google | Gemini 1.5 Flash | Free tier | [aistudio.google.com](https://aistudio.google.com) |
| Anthropic | Claude Haiku | Free tier | [console.anthropic.com](https://console.anthropic.com) |

> 💡 **Groq is the easiest** — free, no credit card, instant setup.

---

## 🎨 Features

### 🏠 Home Page
- Animated hero with floating UI cards
- Morphing blob background + parallax
- Feature showcase with scroll reveal
- Animated stat counters

### 💬 AI Chatbot
- Full multi-turn conversation with context memory
- 4 LLM provider support (OpenAI, Groq, Gemini, Anthropic)
- Smart offline fallback responses
- Quick topic sidebar + suggestion chips
- Real-time typing indicator
- Markdown rendering in messages

### 🍽️ Recipe Explorer
- 16 recipes from the enhanced dataset
- Search by name, cuisine, tag
- Filter by category, dietary goal, max calories
- Sort by calories, protein, cook time, health score
- Bookmark/save recipes (localStorage)
- Recipe detail modal with full macros & health score

### 📊 Calorie Tracker
- Animated SVG donut chart for calorie progress
- Real-time macro breakdown (protein/carbs/fat)
- Log custom meals or quick-add from database
- Goal settings: calorie target + diet type
- Persistent data (survives page refresh)
- One-click quick-add chips

---

## 🛠️ Tech Stack

- **Vanilla HTML/CSS/JS** — no framework needed, runs anywhere
- **CSS Custom Properties** — consistent theming
- **Hash-based Router** — SPA navigation without a server
- **localStorage** — persistent state for meals, goals, API key
- **Fetch API** — direct LLM API calls from browser
- **Google Fonts** — Playfair Display + Plus Jakarta Sans
- **SVG** — custom donut charts

---

## 📊 Dataset Integration

Recipes come from `calorix_enhanced_dataset.csv` with fields:
- `recipe_id`, `name`, `name_ar`, `category`, `cuisine`
- `calories`, `protein_g`, `carbohydrates_g`, `fat_g`, `fiber_g`
- `dietary_goal`, `tags`, `health_score`, `is_vegan`, `allergens`
- `difficulty`, `prep_time_min`, `cook_time_min`

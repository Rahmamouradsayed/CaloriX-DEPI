"""
Server-side cloud LLM provider calls.
API keys are read from environment variables (populate them via a .env
file at the project root — see .env.example). Keys never touch the browser.
"""

import os
from typing import List, Dict

import httpx

SYSTEM_PROMPT = """You are CaloriX AI, an expert nutritionist and food recommendation assistant built for the CaloriX platform. You help users with:

1. Personalized meal and recipe recommendations based on their calorie goals and dietary preferences
2. Detailed calorie and macronutrient information (protein, carbs, fat, fiber)
3. Meal planning for weight loss, muscle gain, or maintenance
4. Dietary guidance for: keto, vegan, vegetarian, Mediterranean, gluten-free, diabetic-friendly, etc.
5. Nutrition science questions answered simply and practically

Formatting rules:
- Use **bold** for food names and key numbers
- Use bullet points for lists
- Keep responses concise but helpful (3-5 sentences or a short list)
- Always mention calories when recommending foods
- Be warm, encouraging, and practical"""

REQUEST_TIMEOUT = 60.0


def _require_key(name: str) -> str:
    key = os.getenv(name)
    if not key:
        raise ValueError(f"{name} is not set. Add it to your .env file to use this model.")
    return key


def _groq(messages: List[Dict], max_tokens: int, temperature: float) -> str:
    key = _require_key("GROQ_API_KEY")
    r = httpx.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        json={
            "model": "llama-3.3-70b-versatile",
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        },
        timeout=REQUEST_TIMEOUT,
    )
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"]


def _openai(messages: List[Dict], max_tokens: int, temperature: float) -> str:
    key = _require_key("OPENAI_API_KEY")
    r = httpx.post(
        "https://api.openai.com/v1/chat/completions",
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        json={
            "model": "gpt-4o-mini",
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        },
        timeout=REQUEST_TIMEOUT,
    )
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"]


def _gemini(messages: List[Dict], max_tokens: int, temperature: float) -> str:
    key = _require_key("GEMINI_API_KEY")
    contents = [
        {"role": "model" if m["role"] == "assistant" else "user", "parts": [{"text": m["content"]}]}
        for m in messages if m["role"] != "system"
    ]
    r = httpx.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key}",
        json={
            "contents": contents,
            "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
            "generationConfig": {"maxOutputTokens": max_tokens, "temperature": temperature},
        },
        timeout=REQUEST_TIMEOUT,
    )
    r.raise_for_status()
    return r.json()["candidates"][0]["content"]["parts"][0]["text"]


def _anthropic(messages: List[Dict], max_tokens: int, temperature: float) -> str:
    key = _require_key("ANTHROPIC_API_KEY")
    filtered = [m for m in messages if m["role"] != "system"]
    r = httpx.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        },
        json={
            "model": "claude-haiku-4-5-20251001",
            "max_tokens": max_tokens,
            "system": SYSTEM_PROMPT,
            "messages": filtered,
        },
        timeout=REQUEST_TIMEOUT,
    )
    r.raise_for_status()
    return r.json()["content"][0]["text"]


PROVIDER_FUNCS = {
    "groq": _groq,
    "openai": _openai,
    "gemini": _gemini,
    "anthropic": _anthropic,
}

PROVIDER_LABELS = {
    "local": "Local Model (Llama 3.2 3B)",
    "groq": "Groq (Llama 3.3 70B — Free)",
    "openai": "OpenAI GPT-4o Mini",
    "gemini": "Google Gemini 1.5 Flash",
    "anthropic": "Claude Haiku",
}


def list_models() -> List[Dict[str, str]]:
    """Models available to pick from.

    In hosted/free deployments, the local Llama model is hidden by default
    because free web services usually do not provide the GPU/RAM needed to run it.
    Set ENABLE_LOCAL_MODEL=1 only when deploying to a machine that has the model files
    and enough resources.
    """
    items = []
    for pid, label in PROVIDER_LABELS.items():
        if pid == "local" and os.getenv("ENABLE_LOCAL_MODEL") != "1":
            continue
        items.append({"id": pid, "label": label})
    return items


def call_provider(provider: str, messages: List[Dict], max_tokens: int = 800, temperature: float = 0.7) -> str:
    func = PROVIDER_FUNCS.get(provider)
    if not func:
        raise ValueError(f"Unknown or unsupported provider: {provider}")
    return func(messages, max_tokens, temperature)

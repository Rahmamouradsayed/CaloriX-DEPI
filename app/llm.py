"""
Loads the local Llama 3.2 3B model once at startup and exposes a
generate() function used by the /chat router.
"""

import os
import glob
from typing import List

import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig

MODEL_CACHE_DIR = os.getenv(
    "MODEL_CACHE_DIR",
    "./models--unsloth--llama-3.2-3b-instruct-unsloth-bnb-4bit"
)

SYSTEM_PROMPT = """You are CaloriX AI — a warm, knowledgeable nutrition coach embedded in the CaloriX platform. You combine the expertise of a registered dietitian with the approachability of a supportive friend.

## RESPONSE FORMAT RULES
- Use **bold** for recipe names and key numbers
- Use bullet points (•) for lists of options
- Keep replies under 200 words unless asked for a detailed plan
- Always include calories when mentioning food
- Match the user's language (reply in Arabic if they write in Arabic)

## GUARDRAILS
- You are not a medical doctor. For serious conditions, recommend a professional.
- Never recommend extreme restriction (under 1200 kcal/day) without flagging it.
"""

_tokenizer = None
_model = None


def find_model_path(cache_dir: str) -> str:
    snapshots = glob.glob(os.path.join(cache_dir, "snapshots", "*"))
    if not snapshots:
        return cache_dir
    return max(snapshots, key=os.path.getmtime)


def load_model():
    global _tokenizer, _model
    if _model is not None:
        return

    model_path = find_model_path(MODEL_CACHE_DIR)
    print(f"[CaloriX] Loading model from: {model_path}")

    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_use_double_quant=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16,
    )

    _tokenizer = AutoTokenizer.from_pretrained(model_path)
    _model = AutoModelForCausalLM.from_pretrained(
        model_path,
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True,
    )
    _model.eval()
    print("[CaloriX] Model loaded ✓")


def build_prompt(messages: List[dict]) -> str:
    prompt = "<|begin_of_text|>"
    prompt += f"<|start_header_id|>system<|end_header_id|>\n\n{SYSTEM_PROMPT}<|eot_id|>\n"
    for msg in messages:
        if msg["role"] == "system":
            continue
        prompt += f"<|start_header_id|>{msg['role']}<|end_header_id|>\n\n{msg['content']}<|eot_id|>\n"
    prompt += "<|start_header_id|>assistant<|end_header_id|>\n\n"
    return prompt


def generate(messages: List[dict], max_new_tokens: int = 800, temperature: float = 0.7) -> str:
    if _model is None:
        load_model()

    prompt = build_prompt(messages)
    inputs = _tokenizer(prompt, return_tensors="pt").to(_model.device)

    with torch.no_grad():
        output_ids = _model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            temperature=temperature,
            do_sample=temperature > 0,
            pad_token_id=_tokenizer.eos_token_id,
            eos_token_id=_tokenizer.eos_token_id,
        )

    new_tokens = output_ids[0][inputs["input_ids"].shape[1]:]
    return _tokenizer.decode(new_tokens, skip_special_tokens=True).strip()

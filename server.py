"""
CaloriX — Local LLM Server
Loads your local Llama 3.2 3B model and serves it via an
OpenAI-compatible API so the CaloriX website can use it.

Requirements:
    pip install fastapi uvicorn transformers bitsandbytes accelerate torch

Usage:
    python server.py
    Then open http://localhost:11434 to confirm it's running.
    The CaloriX website will auto-connect when you choose "Local Model".
"""

import glob
import os
import time
from typing import List, Optional

# ── Model loading ────────────────────────────────────────────────
import torch
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig

# ── Find the snapshot folder inside the HF cache dir ─────────────
MODEL_CACHE_DIR = "./models--unsloth--llama-3.2-3b-instruct-unsloth-bnb-4bit"

def find_model_path(cache_dir: str) -> str:
    """
    HF cache layout:
      models--<org>--<name>/
        snapshots/
          <hash>/          ← actual model files live here
    """
    snapshots = glob.glob(os.path.join(cache_dir, "snapshots", "*"))
    if not snapshots:
        # Maybe the folder IS the model (flat layout)
        return cache_dir
    # Pick the latest snapshot
    return max(snapshots, key=os.path.getmtime)

MODEL_PATH = find_model_path(MODEL_CACHE_DIR)
print(f"[CaloriX] Loading model from: {MODEL_PATH}")

# 4-bit config — matches the bnb-4bit checkpoint
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_use_double_quant=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
)

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    quantization_config=bnb_config,
    device_map="auto",
    trust_remote_code=True,
)
model.eval()
print("[CaloriX] Model loaded ✓")

# ── FastAPI app ───────────────────────────────────────────────────
app = FastAPI(title="CaloriX Local LLM", version="1.0")

# Allow the browser to call this server (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # fine for localhost dev
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request / Response schemas ────────────────────────────────────
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    model: Optional[str] = "local"
    messages: List[Message]
    max_tokens: Optional[int] = 800
    temperature: Optional[float] = 0.7

# ── Helpers ───────────────────────────────────────────────────────
def build_prompt(messages: List[Message]) -> str:
    """
    Builds the chat prompt using Llama 3 instruct format.
    <|begin_of_text|>
    <|start_header_id|>system<|end_header_id|>…<|eot_id|>
    <|start_header_id|>user<|end_header_id|>…<|eot_id|>
    <|start_header_id|>assistant<|end_header_id|>
    """
    prompt = "<|begin_of_text|>"
    for msg in messages:
        role = msg.role  # "system" | "user" | "assistant"
        prompt += f"<|start_header_id|>{role}<|end_header_id|>\n\n{msg.content}<|eot_id|>\n"
    prompt += "<|start_header_id|>assistant<|end_header_id|>\n\n"
    return prompt

def generate(messages: List[Message], max_new_tokens: int = 2000, temperature: float = 0.5) -> str:
    prompt = build_prompt(messages)
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

    with torch.no_grad():
        output_ids = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            temperature=temperature,
            do_sample=temperature > 0,
            pad_token_id=tokenizer.eos_token_id,
            eos_token_id=tokenizer.eos_token_id,
        )

    # Decode only the newly generated tokens
    new_tokens = output_ids[0][inputs["input_ids"].shape[1]:]
    return tokenizer.decode(new_tokens, skip_special_tokens=True).strip()

# ── Routes ────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ok", "message": "CaloriX Local LLM is running 🥗"}

@app.get("/v1/models")
def list_models():
    return {
        "object": "list",
        "data": [{"id": "local", "object": "model", "created": int(time.time()), "owned_by": "calorix"}]
    }

@app.post("/v1/chat/completions")
def chat_completions(req: ChatRequest):
    try:
        reply = generate(req.messages, max_new_tokens=req.max_tokens or 2000, temperature=req.temperature or 0.5)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "id": f"chatcmpl-local-{int(time.time())}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": "local",
        "choices": [{
            "index": 0,
            "message": {"role": "assistant", "content": reply},
            "finish_reason": "stop"
        }],
        "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
    }

# ── Entry point ───────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=11434, log_level="info")

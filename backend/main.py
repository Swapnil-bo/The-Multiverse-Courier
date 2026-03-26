from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
import requests
import json
import re
import logging
from datetime import date
from typing import Optional
import time

# ── Logging ─────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
log = logging.getLogger(__name__)

# ── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(title="Parallel Universe News API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Config ───────────────────────────────────────────────────────────────────
OLLAMA_URL   = "http://localhost:11434/api/generate"
OLLAMA_TAGS  = "http://localhost:11434/api/tags"
MODEL        = "mistral:7b-instruct"
MAX_RETRIES  = 3
TIMEOUT      = 120  # seconds

# ── Request schema ───────────────────────────────────────────────────────────
class EventRequest(BaseModel):
    event: str

    @field_validator("event")
    @classmethod
    def event_must_be_valid(cls, v):
        v = v.strip()
        if len(v) < 5:
            raise ValueError("Event description too short (min 5 chars)")
        if len(v) > 300:
            raise ValueError("Event description too long (max 300 chars)")
        return v

# ── Prompt builder ───────────────────────────────────────────────────────────
def build_prompt(event: str, strict: bool = False) -> str:
    today = date.today().strftime("%B %d, %Y")
    strictness = (
        "IMPORTANT: Output ONLY the raw JSON array. "
        "Absolutely no text before or after. No backticks. No markdown."
        if strict else
        "Respond ONLY with a valid JSON array. No markdown, no explanation, no backticks."
    )
    return f"""You are a news editor in a parallel universe where this historical event changed:
"{event}"

Generate exactly 6 news headlines dated TODAY ({today}) from this alternate timeline.
Make them feel like real, varied journalism — mix breaking news, analysis, and human interest.

{strictness}

[
  {{
    "headline": "Punchy, attention-grabbing headline",
    "blurb": "2-3 sentences of real-feeling journalism with specific details.",
    "category": "POLITICS | TECH | SCIENCE | WORLD | ECONOMY | CULTURE",
    "outlet": "Fictional but believable outlet name (e.g. The Meridian Post)"
  }}
]"""

# ── JSON repair ───────────────────────────────────────────────────────────────
def extract_json(raw: str) -> Optional[list]:
    """Try multiple strategies to extract valid JSON from messy LLM output."""

    # Strategy 1: clean and direct parse
    cleaned = raw.strip().replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Strategy 2: find first [ ... ] block via regex
    match = re.search(r'\[.*\]', cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    # Strategy 3: fix trailing commas before ] or }
    fixed = re.sub(r',\s*([\]}])', r'\1', cleaned)
    try:
        return json.loads(fixed)
    except json.JSONDecodeError:
        pass

    # Strategy 4: extract individual objects and build array manually
    objects = re.findall(r'\{[^{}]+\}', cleaned, re.DOTALL)
    if objects:
        try:
            return [json.loads(obj) for obj in objects]
        except json.JSONDecodeError:
            pass

    return None

# ── Ollama call ───────────────────────────────────────────────────────────────
def call_ollama(prompt: str) -> str:
    try:
        response = requests.post(
            OLLAMA_URL,
            json={"model": MODEL, "prompt": prompt, "stream": False},
            timeout=TIMEOUT
        )
        response.raise_for_status()
        return response.json()["response"]
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Ollama is not running. Start it with: ollama serve")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="Ollama timed out. Model may be loading — try again.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ollama error: {str(e)}")

# ── Validate headline shape ───────────────────────────────────────────────────
def validate_headlines(data: list) -> bool:
    required = {"headline", "blurb", "category", "outlet"}
    return (
        isinstance(data, list) and
        len(data) >= 4 and
        all(isinstance(h, dict) and required.issubset(h.keys()) for h in data)
    )

# ── Main endpoint ─────────────────────────────────────────────────────────────
@app.post("/generate")
async def generate_headlines(request: EventRequest):
    log.info(f"Generating headlines for event: '{request.event}'")
    last_error = None

    for attempt in range(1, MAX_RETRIES + 1):
        strict = attempt > 1  # stricter prompt on retries
        prompt = build_prompt(request.event, strict=strict)

        log.info(f"Attempt {attempt}/{MAX_RETRIES} — strict={strict}")
        start = time.time()

        raw = call_ollama(prompt)
        elapsed = round(time.time() - start, 2)
        log.info(f"Ollama responded in {elapsed}s")

        headlines = extract_json(raw)

        if headlines and validate_headlines(headlines):
            log.info(f"Success on attempt {attempt} — {len(headlines)} headlines generated")
            return {
                "headlines": headlines[:6],
                "event": request.event,
                "universe_id": f"UNIVERSE-{abs(hash(request.event)) % 9999:04d}",
                "generated_at": date.today().isoformat(),
                "attempt": attempt
            }

        last_error = f"Invalid or unparseable JSON on attempt {attempt}"
        log.warning(f"{last_error}. Raw snippet: {raw[:200]}")

    log.error(f"All {MAX_RETRIES} attempts failed for event: '{request.event}'")
    raise HTTPException(
        status_code=422,
        detail=f"Model returned malformed output after {MAX_RETRIES} attempts. Try rephrasing your event."
    )

# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    try:
        res = requests.get(OLLAMA_TAGS, timeout=5)
        models = [m["name"] for m in res.json().get("models", [])]
        model_ready = any(MODEL in m for m in models)
        return {
            "status": "ok" if model_ready else "degraded",
            "ollama": "running",
            "model": MODEL,
            "model_loaded": model_ready,
            "available_models": models
        }
    except Exception:
        return {"status": "error", "ollama": "unreachable", "model_loaded": False}

@app.get("/")
async def root():
    return {"status": "Parallel Universe News API is running", "version": "2.0.0"}

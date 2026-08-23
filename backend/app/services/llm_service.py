import json
import time

from google import genai
from google.genai import errors, types

from app.config import settings

_client: genai.Client | None = None

# Free-tier rate limit (429) and transient overload (503) both resolve themselves if you
# wait - the free tier's RPM window resets every ~60s. Back off and retry instead of failing
# the whole meeting over a temporary quota bump.
_RETRYABLE_CODES = {429, 503}
_BACKOFF_SECONDS = [15, 35, 60]


def get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


def _generate(model: str, system: str, user: str):
    client = get_client()
    last_error: Exception | None = None
    for attempt, wait in enumerate([0, *_BACKOFF_SECONDS]):
        if wait:
            time.sleep(wait)
        try:
            return client.models.generate_content(
                model=model,
                contents=user,
                config=types.GenerateContentConfig(
                    system_instruction=system,
                    response_mime_type="application/json",
                ),
            )
        except errors.APIError as exc:
            if exc.code not in _RETRYABLE_CODES or attempt == len(_BACKOFF_SECONDS):
                raise
            last_error = exc
            continue
    raise last_error  # unreachable, satisfies type checker


def chat_json(system: str, user: str, model: str = "gemini-3.6-flash") -> dict:
    last_error: Exception | None = None
    for _ in range(2):  # one retry on malformed JSON
        response = _generate(model, system, user)
        content = response.text or "{}"
        try:
            return json.loads(content)
        except json.JSONDecodeError as exc:
            last_error = exc
            continue
    raise ValueError(f"LLM did not return valid JSON after retry: {last_error}")


EMBED_BATCH_SIZE = 100  # Gemini's embed_content caps at 100 texts per request


def _embed_batch(model: str, batch: list[str]):
    client = get_client()
    last_error: Exception | None = None
    for attempt, wait in enumerate([0, *_BACKOFF_SECONDS]):
        if wait:
            time.sleep(wait)
        try:
            return client.models.embed_content(model=model, contents=batch)
        except errors.APIError as exc:
            if exc.code not in _RETRYABLE_CODES or attempt == len(_BACKOFF_SECONDS):
                raise
            last_error = exc
            continue
    raise last_error  # unreachable, satisfies type checker


def embed(texts: list[str], model: str = "gemini-embedding-001") -> list[list[float]]:
    all_embeddings: list[list[float]] = []
    for i in range(0, len(texts), EMBED_BATCH_SIZE):
        batch = texts[i : i + EMBED_BATCH_SIZE]
        response = _embed_batch(model, batch)
        all_embeddings.extend(e.values for e in response.embeddings)
    return all_embeddings

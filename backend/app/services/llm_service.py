import json
import time

from openai import InternalServerError, OpenAI, RateLimitError

from app.config import settings

_client: OpenAI | None = None

# Rate limits (429) and transient server errors (5xx) both resolve themselves if you wait a
# short moment - back off and retry instead of failing the whole meeting over a momentary blip.
_RETRYABLE_EXCEPTIONS = (RateLimitError, InternalServerError)
_BACKOFF_SECONDS = [5, 15, 30]


def get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(api_key=settings.openai_api_key)
    return _client


def _create_completion(model: str, system: str, user: str):
    client = get_client()
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]
    last_error: Exception | None = None
    for attempt, wait in enumerate([0, *_BACKOFF_SECONDS]):
        if wait:
            time.sleep(wait)
        try:
            return client.chat.completions.create(
                model=model,
                response_format={"type": "json_object"},
                messages=messages,
            )
        except _RETRYABLE_EXCEPTIONS as exc:
            if attempt == len(_BACKOFF_SECONDS):
                raise
            last_error = exc
            continue
    raise last_error  # unreachable, satisfies type checker


def chat_json(system: str, user: str, model: str = "gpt-4o-mini") -> dict:
    last_error: Exception | None = None
    for _ in range(2):  # one retry on malformed JSON
        response = _create_completion(model, system, user)
        content = response.choices[0].message.content or "{}"
        try:
            return json.loads(content)
        except json.JSONDecodeError as exc:
            last_error = exc
            continue
    raise ValueError(f"LLM did not return valid JSON after retry: {last_error}")


def embed(texts: list[str], model: str = "text-embedding-3-small") -> list[list[float]]:
    client = get_client()
    last_error: Exception | None = None
    for attempt, wait in enumerate([0, *_BACKOFF_SECONDS]):
        if wait:
            time.sleep(wait)
        try:
            response = client.embeddings.create(model=model, input=texts)
            return [item.embedding for item in response.data]
        except _RETRYABLE_EXCEPTIONS as exc:
            if attempt == len(_BACKOFF_SECONDS):
                raise
            last_error = exc
            continue
    raise last_error  # unreachable, satisfies type checker

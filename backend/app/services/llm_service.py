import json

from google import genai
from google.genai import types

from app.config import settings

_client: genai.Client | None = None


def get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


def chat_json(system: str, user: str, model: str = "gemini-3.6-flash") -> dict:
    client = get_client()
    last_error: Exception | None = None
    for _ in range(2):  # one retry on malformed JSON
        response = client.models.generate_content(
            model=model,
            contents=user,
            config=types.GenerateContentConfig(
                system_instruction=system,
                response_mime_type="application/json",
            ),
        )
        content = response.text or "{}"
        try:
            return json.loads(content)
        except json.JSONDecodeError as exc:
            last_error = exc
            continue
    raise ValueError(f"LLM did not return valid JSON after retry: {last_error}")


EMBED_BATCH_SIZE = 100  # Gemini's embed_content caps at 100 texts per request


def embed(texts: list[str], model: str = "gemini-embedding-001") -> list[list[float]]:
    client = get_client()
    all_embeddings: list[list[float]] = []
    for i in range(0, len(texts), EMBED_BATCH_SIZE):
        batch = texts[i : i + EMBED_BATCH_SIZE]
        response = client.models.embed_content(model=model, contents=batch)
        all_embeddings.extend(e.values for e in response.embeddings)
    return all_embeddings

import json

from openai import OpenAI

from app.config import settings

_client: OpenAI | None = None


def get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(api_key=settings.openai_api_key)
    return _client


def chat_json(system: str, user: str, model: str = "gpt-4o-mini") -> dict:
    client = get_client()
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]
    last_error: Exception | None = None
    for _ in range(2):  # one retry on malformed JSON
        response = client.chat.completions.create(
            model=model,
            response_format={"type": "json_object"},
            messages=messages,
        )
        content = response.choices[0].message.content or "{}"
        try:
            return json.loads(content)
        except json.JSONDecodeError as exc:
            last_error = exc
            continue
    raise ValueError(f"LLM did not return valid JSON after retry: {last_error}")


def embed(texts: list[str], model: str = "text-embedding-3-small") -> list[list[float]]:
    client = get_client()
    response = client.embeddings.create(model=model, input=texts)
    return [item.embedding for item in response.data]

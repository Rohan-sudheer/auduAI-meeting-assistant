from pathlib import Path

import httpx

from app.config import settings

DEEPGRAM_URL = "https://api.deepgram.com/v1/listen"

_CONTENT_TYPES = {
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".webm": "audio/webm",
    ".m4a": "audio/mp4",
    ".ogg": "audio/ogg",
}


class Utterance:
    def __init__(self, speaker: int, start: float, end: float, text: str, confidence: float):
        self.speaker = speaker
        self.start = start
        self.end = end
        self.text = text
        self.confidence = confidence


def transcribe(audio_path: Path) -> list[Utterance]:
    content_type = _CONTENT_TYPES.get(audio_path.suffix.lower(), "audio/mpeg")

    params = {
        "model": "nova-2",
        "diarize": "true",
        "punctuate": "true",
        "utterances": "true",
        "smart_format": "true",
        "filler_words": "true",
    }
    headers = {
        "Authorization": f"Token {settings.deepgram_api_key}",
        "Content-Type": content_type,
    }

    audio_bytes = audio_path.read_bytes()
    timeout = httpx.Timeout(connect=30.0, write=900.0, read=900.0, pool=30.0)

    last_error: Exception | None = None
    for attempt in range(2):  # one retry in case of a transient network stall
        try:
            with httpx.Client(timeout=timeout) as client:
                response = client.post(
                    DEEPGRAM_URL,
                    params=params,
                    headers=headers,
                    content=audio_bytes,
                )
                response.raise_for_status()
                data = response.json()
            break
        except (httpx.WriteTimeout, httpx.ReadTimeout, httpx.ConnectTimeout) as exc:
            last_error = exc
            continue
    else:
        raise TimeoutError(
            f"Upload to Deepgram timed out after {len(audio_bytes) / 1_000_000:.1f}MB / 2 attempts. "
            "This usually means a slow upload connection combined with a large (e.g. uncompressed WAV) "
            "file - try converting to MP3 first, which is typically 5-10x smaller for the same duration."
        ) from last_error

    raw_utterances = data.get("results", {}).get("utterances", [])
    return [
        Utterance(
            speaker=u.get("speaker", 0),
            start=u["start"],
            end=u["end"],
            text=u["transcript"],
            confidence=u.get("confidence", 1.0),
        )
        for u in raw_utterances
        if u.get("transcript", "").strip()
    ]

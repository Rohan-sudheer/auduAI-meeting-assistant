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

    with httpx.Client(timeout=180.0) as client:
        response = client.post(
            DEEPGRAM_URL,
            params=params,
            headers=headers,
            content=audio_path.read_bytes(),
        )
        response.raise_for_status()
        data = response.json()

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

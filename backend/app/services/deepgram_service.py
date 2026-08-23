import subprocess
import tempfile
from pathlib import Path

import httpx

from app.config import settings

DEEPGRAM_URL = "https://api.deepgram.com/v1/listen"


class Utterance:
    def __init__(self, speaker: int, start: float, end: float, text: str, confidence: float):
        self.speaker = speaker
        self.start = start
        self.end = end
        self.text = text
        self.confidence = confidence


def _compress_for_upload(audio_path: Path) -> Path:
    """Re-encode to mono 16kHz/32kbps MP3 before uploading. Speech-to-text doesn't need
    high-fidelity audio, and shrinking the file directly shrinks upload time - which matters
    far more than transcription time on a slow/constrained connection."""
    tmp_path = Path(tempfile.mkstemp(suffix=".mp3")[1])
    subprocess.run(
        ["ffmpeg", "-y", "-i", str(audio_path), "-ac", "1", "-ar", "16000", "-b:a", "32k", str(tmp_path)],
        check=True,
        capture_output=True,
    )
    return tmp_path


def transcribe(audio_path: Path) -> list[Utterance]:
    compressed_path = _compress_for_upload(audio_path)
    try:
        audio_bytes = compressed_path.read_bytes()

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
            "Content-Type": "audio/mpeg",
        }
        timeout = httpx.Timeout(connect=30.0, write=300.0, read=300.0, pool=30.0)

        last_error: Exception | None = None
        for _ in range(2):  # one retry in case of a transient network stall
            try:
                with httpx.Client(timeout=timeout) as client:
                    response = client.post(DEEPGRAM_URL, params=params, headers=headers, content=audio_bytes)
                    response.raise_for_status()
                    data = response.json()
                break
            except (httpx.WriteTimeout, httpx.ReadTimeout, httpx.ConnectTimeout) as exc:
                last_error = exc
                continue
        else:
            raise TimeoutError(
                f"Upload to Deepgram timed out after {len(audio_bytes) / 1_000_000:.1f}MB / 2 attempts "
                "even after compression - your upload connection is unusually slow right now. Try again "
                "on a faster/more stable connection."
            ) from last_error
    finally:
        compressed_path.unlink(missing_ok=True)

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

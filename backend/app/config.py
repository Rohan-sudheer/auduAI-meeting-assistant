from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BACKEND_DIR / "data"
AUDIO_DIR = DATA_DIR / "audio"
CHROMA_DIR = DATA_DIR / "chroma"
DB_PATH = DATA_DIR / "db.sqlite3"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", extra="ignore")

    openai_api_key: str = ""
    deepgram_api_key: str = ""
    allowed_origins: str = "http://localhost:5173"
    # Regex for origins that change per deploy (every Vercel preview/deployment URL)
    # plus the custom domain, so they work without touching ALLOWED_ORIGINS.
    allowed_origin_regex: str | None = r"https://(audu-ai-meeting-assistant[a-z0-9-]*\.vercel\.app|auduai\.rohantech\.in)"


settings = Settings()

AUDIO_DIR.mkdir(parents=True, exist_ok=True)
CHROMA_DIR.mkdir(parents=True, exist_ok=True)

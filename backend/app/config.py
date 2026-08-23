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


settings = Settings()

AUDIO_DIR.mkdir(parents=True, exist_ok=True)
CHROMA_DIR.mkdir(parents=True, exist_ok=True)

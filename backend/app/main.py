from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import action_items, chat, meetings, speakers, summaries, topics, transcripts

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Meeting Summariser API")

app.add_middleware(
    CORSMiddleware,
    # Browsers send the origin without a trailing slash, so strip any that were pasted in.
    # The custom domain is always allowed so a misconfigured env var can't lock it out.
    allow_origins=["https://auduai.rohantech.in"]
    + [o.strip().rstrip("/") for o in settings.allowed_origins.split(",") if o.strip()],
    allow_origin_regex=settings.allowed_origin_regex or None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meetings.router)
app.include_router(transcripts.router)
app.include_router(speakers.router)
app.include_router(summaries.router)
app.include_router(action_items.router)
app.include_router(topics.router)
app.include_router(chat.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}

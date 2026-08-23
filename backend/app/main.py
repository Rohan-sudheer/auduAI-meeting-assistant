from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import action_items, chat, meetings, speakers, summaries, topics, transcripts

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Meeting Summariser API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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

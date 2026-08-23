from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Topic
from app.schemas import TopicOut

router = APIRouter(prefix="/api/meetings", tags=["topics"])


@router.get("/{meeting_id}/topics", response_model=list[TopicOut])
def list_topics(meeting_id: str, db: Session = Depends(get_db)):
    topics = (
        db.execute(select(Topic).where(Topic.meeting_id == meeting_id).order_by(Topic.topic_index))
        .scalars()
        .all()
    )
    return topics

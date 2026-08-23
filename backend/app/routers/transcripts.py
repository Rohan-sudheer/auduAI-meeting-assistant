from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Segment
from app.schemas import SegmentOut

router = APIRouter(prefix="/api/meetings", tags=["transcript"])


@router.get("/{meeting_id}/transcript", response_model=list[SegmentOut])
def get_transcript(meeting_id: str, db: Session = Depends(get_db)):
    segments = (
        db.execute(
            select(Segment).where(Segment.meeting_id == meeting_id).order_by(Segment.order_index)
        )
        .scalars()
        .all()
    )
    out = []
    for s in segments:
        item = SegmentOut.model_validate(s)
        if s.speaker is not None:
            item.speaker_label = s.speaker.display_name or s.speaker.display_label
        out.append(item)
    return out

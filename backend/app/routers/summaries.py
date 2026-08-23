import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Summary
from app.schemas import SummaryOut

router = APIRouter(prefix="/api/meetings", tags=["summary"])


@router.get("/{meeting_id}/summary", response_model=SummaryOut)
def get_summary(meeting_id: str, db: Session = Depends(get_db)):
    summary = db.execute(select(Summary).where(Summary.meeting_id == meeting_id)).scalar_one_or_none()
    if summary is None:
        raise HTTPException(status_code=404, detail="Summary not ready yet")
    return SummaryOut(
        executive_summary=summary.executive_summary,
        meeting_purpose=summary.meeting_purpose,
        key_discussion_points=json.loads(summary.key_discussion_points),
        decisions=json.loads(summary.decisions),
        outcomes=json.loads(summary.outcomes),
        critique_notes=json.loads(summary.critique_notes),
        verified=summary.verified,
    )

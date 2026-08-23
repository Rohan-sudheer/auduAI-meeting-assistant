from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Speaker
from app.schemas import SpeakerOut, SpeakerRenameRequest

router = APIRouter(prefix="/api/meetings", tags=["speakers"])


@router.get("/{meeting_id}/speakers", response_model=list[SpeakerOut])
def list_speakers(meeting_id: str, db: Session = Depends(get_db)):
    speakers = (
        db.execute(select(Speaker).where(Speaker.meeting_id == meeting_id).order_by(Speaker.display_label))
        .scalars()
        .all()
    )
    return speakers


@router.patch("/{meeting_id}/speakers/{speaker_id}", response_model=SpeakerOut)
def rename_speaker(meeting_id: str, speaker_id: str, body: SpeakerRenameRequest, db: Session = Depends(get_db)):
    speaker = db.get(Speaker, speaker_id)
    if speaker is None or speaker.meeting_id != meeting_id:
        raise HTTPException(status_code=404, detail="Speaker not found")
    speaker.display_name = body.display_name
    db.commit()
    db.refresh(speaker)
    return speaker

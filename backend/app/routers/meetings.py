from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import AUDIO_DIR
from app.database import get_db
from app.models import Meeting
from app.schemas import MeetingOut, UploadResponse
from app.services.pipeline import process_meeting

router = APIRouter(prefix="/api/meetings", tags=["meetings"])


def _save_and_start(
    file: UploadFile,
    title: str | None,
    source: str,
    db: Session,
    background_tasks: BackgroundTasks,
) -> UploadResponse:
    meeting = Meeting(
        title=title or file.filename or "Untitled meeting",
        audio_path="",
        source=source,
        status="uploaded",
    )
    db.add(meeting)
    db.flush()

    suffix = Path(file.filename or "").suffix or (".webm" if source == "recording" else ".mp3")
    audio_path = AUDIO_DIR / f"{meeting.id}{suffix}"
    audio_path.write_bytes(file.file.read())
    meeting.audio_path = str(audio_path)
    db.commit()

    background_tasks.add_task(process_meeting, meeting.id)
    return UploadResponse(meeting_id=meeting.id, status=meeting.status)


@router.post("/upload", response_model=UploadResponse)
def upload_meeting(
    background_tasks: BackgroundTasks,
    file: UploadFile,
    title: str | None = None,
    db: Session = Depends(get_db),
):
    return _save_and_start(file, title, "upload", db, background_tasks)


@router.post("/record", response_model=UploadResponse)
def record_meeting(
    background_tasks: BackgroundTasks,
    file: UploadFile,
    title: str | None = None,
    db: Session = Depends(get_db),
):
    return _save_and_start(file, title, "recording", db, background_tasks)


@router.get("", response_model=list[MeetingOut])
def list_meetings(db: Session = Depends(get_db)):
    meetings = db.execute(select(Meeting).order_by(Meeting.created_at.desc())).scalars().all()
    return meetings


@router.get("/{meeting_id}", response_model=MeetingOut)
def get_meeting(meeting_id: str, db: Session = Depends(get_db)):
    meeting = db.get(Meeting, meeting_id)
    if meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MeetingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    source: str
    status: str
    error_message: str | None
    duration_sec: float | None
    created_at: datetime


class UploadResponse(BaseModel):
    meeting_id: str
    status: str


class SegmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    order_index: int
    start_time: float
    end_time: float
    text: str
    confidence: float
    is_uncertain: bool
    speaker_id: str | None
    speaker_label: str | None = None


class SpeakerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    display_label: str
    display_name: str | None
    total_speaking_time_sec: float


class SpeakerRenameRequest(BaseModel):
    display_name: str

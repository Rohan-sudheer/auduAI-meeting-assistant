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


class DecisionOut(BaseModel):
    decision: str
    reason: str | None = None


class CritiqueIssueOut(BaseModel):
    type: str | None = None
    description: str | None = None
    suggested_fix: str | None = None


class SummaryOut(BaseModel):
    executive_summary: str
    meeting_purpose: str
    key_discussion_points: list[str]
    decisions: list[DecisionOut]
    outcomes: list[str]
    critique_notes: list[CritiqueIssueOut]
    verified: bool


class ActionItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    task: str
    owner: str
    deadline_raw: str | None
    deadline_normalized: str | None
    priority: str
    status: str
    source_quote: str | None


class ActionItemUpdateRequest(BaseModel):
    status: str


class TopicOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    topic_index: str
    title: str
    start_time: float
    end_time: float
    summary: str


class AskRequest(BaseModel):
    question: str


class CitationOut(BaseModel):
    speaker: str | None = None
    timestamp: str | None = None
    start_time: float | None = None
    quote: str | None = None


class ChatMessageOut(BaseModel):
    role: str
    content: str
    citations: list[CitationOut]
    created_at: datetime | None = None

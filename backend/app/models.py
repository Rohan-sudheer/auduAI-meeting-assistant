import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Meeting(Base):
    __tablename__ = "meetings"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    title: Mapped[str] = mapped_column(String, default="Untitled meeting")
    audio_path: Mapped[str] = mapped_column(String)
    source: Mapped[str] = mapped_column(String)  # 'upload' | 'recording'
    duration_sec: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String, default="uploaded")
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    speakers: Mapped[list["Speaker"]] = relationship(back_populates="meeting", cascade="all, delete-orphan")
    segments: Mapped[list["Segment"]] = relationship(back_populates="meeting", cascade="all, delete-orphan")
    topics: Mapped[list["Topic"]] = relationship(back_populates="meeting", cascade="all, delete-orphan")
    action_items: Mapped[list["ActionItem"]] = relationship(back_populates="meeting", cascade="all, delete-orphan")
    summary: Mapped["Summary | None"] = relationship(back_populates="meeting", cascade="all, delete-orphan", uselist=False)
    chat_messages: Mapped[list["ChatMessage"]] = relationship(back_populates="meeting", cascade="all, delete-orphan")


class Speaker(Base):
    __tablename__ = "speakers"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    meeting_id: Mapped[str] = mapped_column(ForeignKey("meetings.id"))
    deepgram_speaker_index: Mapped[int] = mapped_column(Integer)
    display_label: Mapped[str] = mapped_column(String)  # "Speaker 1"
    display_name: Mapped[str | None] = mapped_column(String, nullable=True)  # user-renamed
    total_speaking_time_sec: Mapped[float] = mapped_column(Float, default=0.0)

    meeting: Mapped["Meeting"] = relationship(back_populates="speakers")
    segments: Mapped[list["Segment"]] = relationship(back_populates="speaker")


class Segment(Base):
    __tablename__ = "segments"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    meeting_id: Mapped[str] = mapped_column(ForeignKey("meetings.id"))
    speaker_id: Mapped[str | None] = mapped_column(ForeignKey("speakers.id"), nullable=True)
    order_index: Mapped[int] = mapped_column(Integer)
    start_time: Mapped[float] = mapped_column(Float)
    end_time: Mapped[float] = mapped_column(Float)
    text: Mapped[str] = mapped_column(Text)
    confidence: Mapped[float] = mapped_column(Float, default=1.0)
    is_uncertain: Mapped[bool] = mapped_column(Boolean, default=False)

    meeting: Mapped["Meeting"] = relationship(back_populates="segments")
    speaker: Mapped["Speaker | None"] = relationship(back_populates="segments")


class Topic(Base):
    __tablename__ = "topics"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    meeting_id: Mapped[str] = mapped_column(ForeignKey("meetings.id"))
    topic_index: Mapped[str] = mapped_column(String)  # "01"
    title: Mapped[str] = mapped_column(String)
    start_time: Mapped[float] = mapped_column(Float)
    end_time: Mapped[float] = mapped_column(Float)
    summary: Mapped[str] = mapped_column(Text)

    meeting: Mapped["Meeting"] = relationship(back_populates="topics")


class ActionItem(Base):
    __tablename__ = "action_items"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    meeting_id: Mapped[str] = mapped_column(ForeignKey("meetings.id"))
    task: Mapped[str] = mapped_column(Text)
    owner: Mapped[str] = mapped_column(String, default="Unassigned")
    deadline_raw: Mapped[str | None] = mapped_column(String, nullable=True)
    deadline_normalized: Mapped[str | None] = mapped_column(String, nullable=True)
    priority: Mapped[str] = mapped_column(String, default="Medium")  # High | Medium | Low
    status: Mapped[str] = mapped_column(String, default="Open")  # Open | In Progress | Done
    source_segment_id: Mapped[str | None] = mapped_column(ForeignKey("segments.id"), nullable=True)
    source_quote: Mapped[str | None] = mapped_column(Text, nullable=True)

    meeting: Mapped["Meeting"] = relationship(back_populates="action_items")


class Summary(Base):
    __tablename__ = "summaries"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    meeting_id: Mapped[str] = mapped_column(ForeignKey("meetings.id"), unique=True)
    executive_summary: Mapped[str] = mapped_column(Text, default="")
    meeting_purpose: Mapped[str] = mapped_column(Text, default="")
    key_discussion_points: Mapped[str] = mapped_column(Text, default="[]")  # JSON list[str]
    decisions: Mapped[str] = mapped_column(Text, default="[]")  # JSON list[{decision,reason}]
    outcomes: Mapped[str] = mapped_column(Text, default="[]")  # JSON list[str]
    critique_notes: Mapped[str] = mapped_column(Text, default="[]")  # JSON list[{type,description,suggested_fix}]
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    meeting: Mapped["Meeting"] = relationship(back_populates="summary")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    meeting_id: Mapped[str] = mapped_column(ForeignKey("meetings.id"))
    role: Mapped[str] = mapped_column(String)  # 'user' | 'assistant'
    content: Mapped[str] = mapped_column(Text)
    citations: Mapped[str] = mapped_column(Text, default="[]")  # JSON list
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    meeting: Mapped["Meeting"] = relationship(back_populates="chat_messages")

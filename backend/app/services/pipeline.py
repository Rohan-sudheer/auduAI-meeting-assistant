import json
import traceback
from pathlib import Path

from app.database import SessionLocal
from app.models import ActionItem, Meeting, Segment, Speaker, Summary, Topic
from app.services import action_item_service, deepgram_service, rag_service, summary_service, topic_service

UNCERTAIN_CONFIDENCE_THRESHOLD = 0.6


def process_meeting(meeting_id: str) -> None:
    db = SessionLocal()
    try:
        meeting = db.get(Meeting, meeting_id)
        if meeting is None:
            return

        meeting.status = "transcribing"
        db.commit()

        utterances = deepgram_service.transcribe(Path(meeting.audio_path))

        speaker_by_index: dict[int, Speaker] = {}
        next_display_num = 1
        max_end_time = 0.0

        for order_index, u in enumerate(utterances):
            if u.speaker not in speaker_by_index:
                speaker = Speaker(
                    meeting_id=meeting.id,
                    deepgram_speaker_index=u.speaker,
                    display_label=f"Speaker {next_display_num}",
                    total_speaking_time_sec=0.0,
                )
                next_display_num += 1
                db.add(speaker)
                db.flush()
                speaker_by_index[u.speaker] = speaker

            speaker = speaker_by_index[u.speaker]
            duration = max(0.0, u.end - u.start)
            speaker.total_speaking_time_sec += duration
            max_end_time = max(max_end_time, u.end)

            db.add(
                Segment(
                    meeting_id=meeting.id,
                    speaker_id=speaker.id,
                    order_index=order_index,
                    start_time=u.start,
                    end_time=u.end,
                    text=u.text,
                    confidence=u.confidence,
                    is_uncertain=u.confidence < UNCERTAIN_CONFIDENCE_THRESHOLD,
                )
            )

        meeting.duration_sec = max_end_time
        meeting.status = "summarizing"
        db.commit()

        segments = (
            db.query(Segment)
            .filter(Segment.meeting_id == meeting.id)
            .order_by(Segment.order_index)
            .all()
        )

        summary_data = summary_service.generate_summary_with_critique(segments)
        db.add(
            Summary(
                meeting_id=meeting.id,
                executive_summary=summary_data.get("executive_summary", ""),
                meeting_purpose=summary_data.get("meeting_purpose", ""),
                key_discussion_points=json.dumps(summary_data.get("key_discussion_points", [])),
                decisions=json.dumps(summary_data.get("decisions", [])),
                outcomes=json.dumps(summary_data.get("outcomes", [])),
                critique_notes=json.dumps(summary_data.get("critique_notes", [])),
                verified=summary_data.get("verified", False),
            )
        )

        topics = topic_service.generate_topics(segments)
        for t in topics:
            db.add(
                Topic(
                    meeting_id=meeting.id,
                    topic_index=str(t.get("index", "")),
                    title=t.get("title", ""),
                    start_time=t.get("start_time", 0.0),
                    end_time=t.get("end_time", 0.0),
                    summary=t.get("summary", ""),
                )
            )

        action_items = action_item_service.generate_action_items(segments, meeting.created_at.date())
        for item in action_items:
            source_segment = action_item_service.find_segment_for_time(segments, item.get("start_time"))
            db.add(
                ActionItem(
                    meeting_id=meeting.id,
                    task=item.get("task", ""),
                    owner=item.get("owner") or "Unassigned",
                    deadline_raw=item.get("deadline_raw"),
                    deadline_normalized=item.get("deadline_normalized"),
                    priority=item.get("priority") or "Medium",
                    status="Open",
                    source_segment_id=source_segment.id if source_segment else None,
                    source_quote=item.get("source_quote"),
                )
            )

        meeting.status = "embedding"
        db.commit()

        rag_service.embed_and_store(meeting.id, segments)

        meeting.status = "ready"
        db.commit()
    except Exception as exc:  # noqa: BLE001 - background pipeline, must not raise
        db.rollback()
        meeting = db.get(Meeting, meeting_id)
        if meeting is not None:
            meeting.status = "failed"
            meeting.error_message = f"{exc}\n{traceback.format_exc()}"
            db.commit()
    finally:
        db.close()

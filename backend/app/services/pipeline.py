import traceback
from pathlib import Path

from app.database import SessionLocal
from app.models import Meeting, Segment, Speaker
from app.services import deepgram_service

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

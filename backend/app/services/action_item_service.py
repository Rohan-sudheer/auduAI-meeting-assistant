from datetime import date

from app.models import Segment
from app.prompts.action_item_prompt import ACTION_ITEM_SYSTEM_PROMPT, build_action_item_user_prompt
from app.services import llm_service
from app.services.transcript_format import format_transcript


def generate_action_items(segments: list[Segment], meeting_date: date) -> list[dict]:
    transcript_text = format_transcript(segments)
    result = llm_service.chat_json(
        ACTION_ITEM_SYSTEM_PROMPT,
        build_action_item_user_prompt(transcript_text, meeting_date.isoformat()),
    )
    return result.get("action_items", [])


def find_segment_for_time(segments: list[Segment], start_time: float | None) -> Segment | None:
    if start_time is None or not segments:
        return None
    for s in segments:
        if s.start_time <= start_time <= s.end_time:
            return s
    return min(segments, key=lambda s: abs(s.start_time - start_time))

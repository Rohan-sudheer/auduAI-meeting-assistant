from app.models import Segment
from app.prompts.topic_prompt import TOPIC_SYSTEM_PROMPT, build_topic_user_prompt
from app.services import llm_service
from app.services.transcript_format import format_transcript


def generate_topics(segments: list[Segment]) -> list[dict]:
    transcript_text = format_transcript(segments)
    result = llm_service.chat_json(TOPIC_SYSTEM_PROMPT, build_topic_user_prompt(transcript_text))
    return result.get("topics", [])

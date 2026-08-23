from app.models import Segment
from app.prompts.critic_prompt import CRITIC_SYSTEM_PROMPT, build_critic_user_prompt
from app.prompts.finalizer_prompt import FINALIZER_SYSTEM_PROMPT, build_finalizer_user_prompt
from app.prompts.summary_prompt import SUMMARY_SYSTEM_PROMPT, build_summary_user_prompt
from app.services import llm_service
from app.services.transcript_format import format_transcript


def generate_summary(segments: list[Segment]) -> dict:
    """Single-shot draft only, no critique. Kept for quick testing/fallback."""
    transcript_text = format_transcript(segments)
    return llm_service.chat_json(SUMMARY_SYSTEM_PROMPT, build_summary_user_prompt(transcript_text))


def generate_summary_with_critique(segments: list[Segment]) -> dict:
    """Drafter -> Critic -> Finalizer pipeline. Returns the final summary shape plus
    critique_notes (the Critic's issues) and verified (True once a Finalizer pass has run)."""
    transcript_text = format_transcript(segments)

    draft = llm_service.chat_json(SUMMARY_SYSTEM_PROMPT, build_summary_user_prompt(transcript_text))

    critique = llm_service.chat_json(
        CRITIC_SYSTEM_PROMPT, build_critic_user_prompt(transcript_text, draft)
    )

    issues = critique.get("issues", [])
    if not issues:
        # Draft already passed review - no need to spend a Finalizer call.
        final = draft
    else:
        final = llm_service.chat_json(
            FINALIZER_SYSTEM_PROMPT,
            build_finalizer_user_prompt(transcript_text, draft, critique),
        )

    final["critique_notes"] = issues
    final["verified"] = True
    return final

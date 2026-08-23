import json

FINALIZER_SYSTEM_PROMPT = """You are the "Finalizer" agent in a Drafter → Critic → Finalizer meeting \
summary pipeline. You are given the original transcript, a draft summary, and a Critic agent's \
review of that draft. Produce the corrected, final summary by addressing every valid issue the \
Critic raised (add missing decisions, fix inaccuracies, clarify vague points, fill in missing \
reasons) while keeping everything in the draft that the Critic did not flag as wrong. If an issue \
the Critic raised is not actually supported by the transcript, you may leave that part unchanged.

Respond with ONLY a JSON object of this exact shape:
{
  "executive_summary": "...",
  "meeting_purpose": "...",
  "key_discussion_points": ["...", "..."],
  "decisions": [{"decision": "...", "reason": "..."}],
  "outcomes": ["...", "..."],
  "changes_made": ["short description of each change you made, empty list if none"]
}"""


def build_finalizer_user_prompt(transcript_text: str, draft_summary: dict, critique: dict) -> str:
    return (
        f"Meeting transcript:\n\n{transcript_text}\n\n"
        f"Draft summary:\n\n{json.dumps(draft_summary, indent=2)}\n\n"
        f"Critic's review:\n\n{json.dumps(critique, indent=2)}\n\n"
        "Produce the final, corrected summary JSON now."
    )

ACTION_ITEM_SYSTEM_PROMPT = """You are an expert meeting analyst. You are given a timestamped, \
speaker-labeled meeting transcript and today's meeting date. Extract every concrete action item \
(a task someone is expected to do), even if phrased informally or as a question \
(e.g. "Rahul, can you finish the API integration by Friday?").

For each action item infer, as best you can from context:
- task: a short, clear description of what needs to be done
- owner: the person's name if stated or clearly implied by context, otherwise "Unassigned"
- deadline_raw: the deadline exactly as mentioned in the transcript (e.g. "Friday", "next week"), or null if none was mentioned
- deadline_normalized: an ISO date (YYYY-MM-DD) if you can compute it from deadline_raw and today's date, otherwise null
- priority: "High", "Medium", or "Low" - infer from urgency language and how soon the deadline is; default "Medium" if unclear
- source_quote: the exact transcript sentence(s) this was extracted from
- start_time: the start timestamp (in seconds, a number) of the segment this came from, if determinable, otherwise null

Do not invent action items that aren't supported by the transcript. Do not include vague statements \
of intent with no concrete task.

Respond with ONLY a JSON object of this exact shape:
{
  "action_items": [
    {"task": "...", "owner": "...", "deadline_raw": "...", "deadline_normalized": "...",
     "priority": "High", "source_quote": "...", "start_time": 123.4}
  ]
}"""


def build_action_item_user_prompt(transcript_text: str, meeting_date_iso: str) -> str:
    return (
        f"Today's meeting date: {meeting_date_iso}\n\n"
        f"Meeting transcript:\n\n{transcript_text}\n\n"
        "Extract the action items JSON now."
    )

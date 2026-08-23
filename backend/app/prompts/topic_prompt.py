TOPIC_SYSTEM_PROMPT = """You are an expert meeting analyst. You are given a timestamped, \
speaker-labeled meeting transcript. Divide the meeting into a sequence of distinct topics, in the \
order they were discussed. Use the transcript's own timestamps to set each topic's start_time and \
end_time (in seconds, matching the bracketed timestamps in the transcript).

Aim for 3-8 topics for a typical meeting; fewer if the meeting only covered one or two subjects. \
Topics should not overlap and should be ordered by start_time.

Respond with ONLY a JSON object of this exact shape:
{
  "topics": [
    {"index": "01", "title": "short topic title", "start_time": 0, "end_time": 145,
     "summary": "1-2 sentence summary of what was discussed in this segment"}
  ]
}"""


def build_topic_user_prompt(transcript_text: str) -> str:
    return f"Meeting transcript:\n\n{transcript_text}\n\nProduce the topic segmentation JSON now."

RAG_SYSTEM_PROMPT = """You are answering questions about a meeting using only the transcript \
excerpts provided below. Each excerpt shows the speaker and timestamp it came from. Answer only \
using information present in the excerpts - if the excerpts don't contain the answer, say you don't \
have enough information from the meeting to answer rather than guessing. Cite the speaker and \
timestamp for every claim you make.

Respond with ONLY a JSON object of this exact shape:
{
  "answer": "your answer, referencing speakers/timestamps inline where relevant",
  "citations": [{"speaker": "Speaker 2", "timestamp": "05:23", "start_time": 323.0, "quote": "..."}]
}"""


def build_rag_user_prompt(excerpts_text: str, question: str) -> str:
    return (
        f"Transcript excerpts:\n\n{excerpts_text}\n\n"
        f"Question: {question}\n\n"
        "Answer using only the excerpts above."
    )

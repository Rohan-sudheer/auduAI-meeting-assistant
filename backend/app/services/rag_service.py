import chromadb

from app.config import CHROMA_DIR
from app.models import Segment
from app.prompts.rag_prompt import RAG_SYSTEM_PROMPT, build_rag_user_prompt
from app.services import llm_service
from app.services.transcript_format import format_timestamp

MAX_CHUNK_CHARS = 400
MAX_CHUNK_SECONDS = 45

_chroma_client: chromadb.ClientAPI | None = None


def get_chroma_client() -> chromadb.ClientAPI:
    global _chroma_client
    if _chroma_client is None:
        _chroma_client = chromadb.PersistentClient(path=str(CHROMA_DIR))
    return _chroma_client


def _collection_name(meeting_id: str) -> str:
    return f"meeting_{meeting_id}"


def chunk_transcript(segments: list[Segment]) -> list[dict]:
    """Merge consecutive same-speaker segments into turns, capped by size/duration."""
    chunks: list[dict] = []
    current: dict | None = None

    for s in segments:
        label = (s.speaker.display_name or s.speaker.display_label) if s.speaker else "Unknown"
        fits_current = (
            current is not None
            and current["speaker_label"] == label
            and len(current["text"]) < MAX_CHUNK_CHARS
            and (s.end_time - current["start_time"]) < MAX_CHUNK_SECONDS
        )
        if fits_current:
            current["text"] += " " + s.text
            current["end_time"] = s.end_time
        else:
            if current is not None:
                chunks.append(current)
            current = {"speaker_label": label, "start_time": s.start_time, "end_time": s.end_time, "text": s.text}

    if current is not None:
        chunks.append(current)
    for i, c in enumerate(chunks):
        c["chunk_index"] = i
    return chunks


def embed_and_store(meeting_id: str, segments: list[Segment]) -> None:
    chunks = chunk_transcript(segments)
    if not chunks:
        return

    client = get_chroma_client()
    try:
        client.delete_collection(_collection_name(meeting_id))
    except Exception:
        pass
    collection = client.create_collection(_collection_name(meeting_id))

    embeddings = llm_service.embed([c["text"] for c in chunks])
    collection.add(
        ids=[f"{meeting_id}_{c['chunk_index']}" for c in chunks],
        documents=[c["text"] for c in chunks],
        embeddings=embeddings,
        metadatas=[
            {"speaker_label": c["speaker_label"], "start_time": c["start_time"], "end_time": c["end_time"]}
            for c in chunks
        ],
    )


def retrieve(meeting_id: str, question: str, top_k: int = 5) -> list[dict]:
    client = get_chroma_client()
    try:
        collection = client.get_collection(_collection_name(meeting_id))
    except Exception:
        return []

    [question_embedding] = llm_service.embed([question])
    result = collection.query(query_embeddings=[question_embedding], n_results=top_k)
    if not result["documents"] or not result["documents"][0]:
        return []

    return [
        {"text": doc, **meta} for doc, meta in zip(result["documents"][0], result["metadatas"][0])
    ]


def answer_question(meeting_id: str, question: str) -> dict:
    excerpts = retrieve(meeting_id, question)
    if not excerpts:
        return {
            "answer": "I don't have a processed transcript to search for this meeting yet.",
            "citations": [],
        }

    excerpts_text = "\n\n".join(
        f'[{e["speaker_label"]} @ {format_timestamp(e["start_time"])}] "{e["text"]}"' for e in excerpts
    )
    result = llm_service.chat_json(RAG_SYSTEM_PROMPT, build_rag_user_prompt(excerpts_text, question))
    return {"answer": result.get("answer", ""), "citations": result.get("citations", [])}

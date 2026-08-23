import json

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ChatMessage
from app.schemas import AskRequest, ChatMessageOut
from app.services import rag_service

router = APIRouter(prefix="/api/meetings", tags=["chat"])


@router.post("/{meeting_id}/ask", response_model=ChatMessageOut)
def ask_question(meeting_id: str, body: AskRequest, db: Session = Depends(get_db)):
    db.add(ChatMessage(meeting_id=meeting_id, role="user", content=body.question, citations="[]"))
    db.commit()

    result = rag_service.answer_question(meeting_id, body.question)

    assistant_msg = ChatMessage(
        meeting_id=meeting_id,
        role="assistant",
        content=result["answer"],
        citations=json.dumps(result["citations"]),
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return ChatMessageOut(
        role="assistant",
        content=assistant_msg.content,
        citations=result["citations"],
        created_at=assistant_msg.created_at,
    )


@router.get("/{meeting_id}/chat", response_model=list[ChatMessageOut])
def get_chat_history(meeting_id: str, db: Session = Depends(get_db)):
    messages = (
        db.execute(select(ChatMessage).where(ChatMessage.meeting_id == meeting_id).order_by(ChatMessage.created_at))
        .scalars()
        .all()
    )
    return [
        ChatMessageOut(role=m.role, content=m.content, citations=json.loads(m.citations), created_at=m.created_at)
        for m in messages
    ]

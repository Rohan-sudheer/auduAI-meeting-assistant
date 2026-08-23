from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ActionItem
from app.schemas import ActionItemOut, ActionItemUpdateRequest

router = APIRouter(prefix="/api/meetings", tags=["action-items"])


@router.get("/{meeting_id}/action-items", response_model=list[ActionItemOut])
def list_action_items(meeting_id: str, db: Session = Depends(get_db)):
    items = db.execute(select(ActionItem).where(ActionItem.meeting_id == meeting_id)).scalars().all()
    return items


@router.patch("/{meeting_id}/action-items/{item_id}", response_model=ActionItemOut)
def update_action_item(meeting_id: str, item_id: str, body: ActionItemUpdateRequest, db: Session = Depends(get_db)):
    item = db.get(ActionItem, item_id)
    if item is None or item.meeting_id != meeting_id:
        raise HTTPException(status_code=404, detail="Action item not found")
    item.status = body.status
    db.commit()
    db.refresh(item)
    return item

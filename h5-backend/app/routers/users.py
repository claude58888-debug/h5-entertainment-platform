from fastapi import APIRouter, Depends, HTTPException
import aiosqlite

from app.database import get_db
from app.auth import get_current_user, get_admin_user
from app.models import UserUpdate

router = APIRouter()


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user), db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT * FROM users WHERE id = ?", (current_user["sub"],))
    user = await cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user["id"],
        "phone": user["phone"],
        "nickname": user["nickname"],
        "avatar": user["avatar"],
        "email": user["email"],
        "telegram_id": user["telegram_id"],
        "vip_level": user["vip_level"],
        "total_deposit": user["total_deposit"],
        "total_turnover": user["total_turnover"],
        "invite_code": user["invite_code"],
        "language": user["language"],
        "created_at": user["created_at"],
    }


@router.put("/me")
async def update_me(data: UserUpdate, current_user: dict = Depends(get_current_user), db: aiosqlite.Connection = Depends(get_db)):
    fields = []
    values = []
    for field, value in data.model_dump(exclude_none=True).items():
        fields.append(f"{field} = ?")
        values.append(value)

    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    values.append(current_user["sub"])
    await db.execute(f"UPDATE users SET {', '.join(fields)}, updated_at = datetime('now') WHERE id = ?", values)
    await db.commit()
    return {"success": True}


@router.get("")
async def list_users(admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT id, phone, nickname, vip_level, total_deposit, created_at FROM users WHERE is_admin = 0 ORDER BY id DESC")
    rows = await cursor.fetchall()
    return [dict(r) for r in rows]

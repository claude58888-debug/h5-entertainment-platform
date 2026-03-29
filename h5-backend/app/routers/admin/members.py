from fastapi import APIRouter, Depends, HTTPException
import aiosqlite

from app.database import get_db
from app.auth import get_admin_user
from app.models import MemberAction

router = APIRouter()


@router.get("/members")
async def list_members(status: str = None, agent: str = None, admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    query = "SELECT * FROM members WHERE 1=1"
    params = []
    if status:
        query += " AND status = ?"
        params.append(status)
    if agent:
        query += " AND agent = ?"
        params.append(agent)
    query += " ORDER BY id"
    cursor = await db.execute(query, params)
    rows = await cursor.fetchall()
    return [{
        "id": r["member_id"],
        "username": r["username"],
        "agent": r["agent"],
        "vip": r["vip"],
        "balance": r["balance"],
        "status": r["status"],
        "registered": r["registered"],
        "lastLogin": r["last_login"],
        "totalDeposit": r["total_deposit"],
        "totalWithdraw": r["total_withdraw"],
        "tags": eval(r["tags"]) if r["tags"] and r["tags"] != '[]' else [],
    } for r in rows]


@router.get("/members/{member_id}")
async def get_member(member_id: str, admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT * FROM members WHERE member_id = ?", (member_id,))
    r = await cursor.fetchone()
    if not r:
        raise HTTPException(status_code=404, detail="Member not found")
    return {
        "id": r["member_id"],
        "username": r["username"],
        "agent": r["agent"],
        "vip": r["vip"],
        "balance": r["balance"],
        "status": r["status"],
        "registered": r["registered"],
        "lastLogin": r["last_login"],
        "totalDeposit": r["total_deposit"],
        "totalWithdraw": r["total_withdraw"],
        "tags": eval(r["tags"]) if r["tags"] and r["tags"] != '[]' else [],
    }


@router.put("/members/{member_id}/action")
async def member_action(member_id: str, data: MemberAction, admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    if data.action == "freeze":
        await db.execute("UPDATE members SET status = 'frozen' WHERE member_id = ?", (member_id,))
    elif data.action == "unfreeze":
        await db.execute("UPDATE members SET status = 'active' WHERE member_id = ?", (member_id,))
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    await db.commit()
    return {"success": True}

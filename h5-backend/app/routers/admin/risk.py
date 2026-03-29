from fastapi import APIRouter, Depends, HTTPException
import aiosqlite

from app.database import get_db
from app.auth import get_admin_user
from app.models import BlacklistAdd

router = APIRouter()


@router.get("/risk/rules")
async def list_rules(admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT * FROM risk_rules ORDER BY id")
    rows = await cursor.fetchall()
    return [{
        "id": r["id"],
        "name": r["name"],
        "description": r["description"],
        "threshold": r["threshold"],
        "status": r["status"],
        "triggers": r["triggers"],
    } for r in rows]


@router.put("/risk/rules/{rule_id}")
async def toggle_rule(rule_id: int, admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT status FROM risk_rules WHERE id = ?", (rule_id,))
    rule = await cursor.fetchone()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    new_status = "inactive" if rule["status"] == "active" else "active"
    await db.execute("UPDATE risk_rules SET status = ? WHERE id = ?", (new_status, rule_id))
    await db.commit()
    return {"success": True, "status": new_status}


@router.get("/risk/blacklist")
async def list_blacklist(admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT * FROM ip_blacklist ORDER BY id DESC")
    rows = await cursor.fetchall()
    return [{
        "ip": r["ip"],
        "reason": r["reason"],
        "addedBy": r["added_by"],
        "addedTime": r["added_time"],
        "hitCount": r["hit_count"],
    } for r in rows]


@router.post("/risk/blacklist")
async def add_blacklist(data: BlacklistAdd, admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    try:
        await db.execute(
            "INSERT INTO ip_blacklist (ip, reason, added_by, added_time) VALUES (?, ?, ?, datetime('now'))",
            (data.ip, data.reason, admin.get("username", "admin"))
        )
        await db.commit()
        return {"success": True}
    except Exception:
        raise HTTPException(status_code=400, detail="IP already in blacklist")


@router.delete("/risk/blacklist/{ip}")
async def remove_blacklist(ip: str, admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    await db.execute("DELETE FROM ip_blacklist WHERE ip = ?", (ip,))
    await db.commit()
    return {"success": True}

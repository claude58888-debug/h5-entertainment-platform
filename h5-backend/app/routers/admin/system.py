from fastapi import APIRouter, Depends, HTTPException
import aiosqlite

from app.database import get_db
from app.auth import get_admin_user, get_password_hash
from app.models import AdminCreate, AnnouncementCreate

router = APIRouter()


# Admin accounts
@router.get("/admins")
async def list_admins(admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT id, username, role, status, last_login, created_at FROM admin_accounts ORDER BY id")
    rows = await cursor.fetchall()
    return [{
        "id": r["id"],
        "username": r["username"],
        "role": r["role"],
        "status": r["status"],
        "lastLogin": r["last_login"],
        "created": r["created_at"],
    } for r in rows]


@router.post("/admins")
async def create_admin(data: AdminCreate, admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    password_hash = get_password_hash(data.password)
    try:
        await db.execute(
            "INSERT INTO admin_accounts (username, password_hash, role) VALUES (?, ?, ?)",
            (data.username, password_hash, data.role)
        )
        await db.commit()
        return {"success": True}
    except Exception:
        raise HTTPException(status_code=400, detail="Username already exists")


@router.put("/admins/{admin_id}/status")
async def toggle_admin(admin_id: int, admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT status FROM admin_accounts WHERE id = ?", (admin_id,))
    acc = await cursor.fetchone()
    if not acc:
        raise HTTPException(status_code=404, detail="Admin not found")

    new_status = "inactive" if acc["status"] == "active" else "active"
    await db.execute("UPDATE admin_accounts SET status = ? WHERE id = ?", (new_status, admin_id))
    await db.commit()
    return {"success": True, "status": new_status}


@router.delete("/admins/{admin_id}")
async def delete_admin(admin_id: int, admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    await db.execute("DELETE FROM admin_accounts WHERE id = ?", (admin_id,))
    await db.commit()
    return {"success": True}


# Audit logs
@router.get("/logs")
async def list_logs(admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100")
    rows = await cursor.fetchall()
    return [{
        "id": r["id"],
        "operator": r["operator"],
        "action": r["action"],
        "target": r["target"],
        "detail": r["detail"],
        "time": r["created_at"],
        "ip": r["ip"],
    } for r in rows]


# Announcements
@router.get("/announcements")
async def list_announcements(admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT * FROM admin_announcements ORDER BY id DESC")
    rows = await cursor.fetchall()
    return [{
        "id": r["id"],
        "title": r["title"],
        "content": r["content"],
        "target": r["target"],
        "status": r["status"],
        "created": r["created_at"],
    } for r in rows]


@router.post("/announcements")
async def create_announcement(data: AnnouncementCreate, admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    await db.execute(
        "INSERT INTO admin_announcements (title, content, target, status) VALUES (?, ?, ?, ?)",
        (data.title, data.content, data.target, data.status)
    )
    await db.commit()
    return {"success": True}


@router.delete("/announcements/{ann_id}")
async def delete_announcement(ann_id: int, admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    await db.execute("DELETE FROM admin_announcements WHERE id = ?", (ann_id,))
    await db.commit()
    return {"success": True}


# Activities
@router.get("/activities")
async def list_activities(admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT * FROM activities ORDER BY id")
    rows = await cursor.fetchall()
    return [{
        "id": r["activity_id"],
        "name": r["name"],
        "type": r["type"],
        "status": r["status"],
        "startTime": r["start_time"],
        "endTime": r["end_time"],
        "minDeposit": r["min_deposit"],
        "bonusRate": r["bonus_rate"],
        "wagering": r["wagering"],
        "maxBonus": r["max_bonus"],
        "participants": r["participants"],
    } for r in rows]


# VIP levels
@router.get("/vip-levels")
async def list_vip_levels(admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT * FROM vip_levels ORDER BY level")
    rows = await cursor.fetchall()
    return [dict(r) for r in rows]


# Settings placeholder
@router.get("/settings")
async def get_settings(admin: dict = Depends(get_admin_user)):
    return {
        "siteName": "大大娱乐",
        "maintenanceMode": False,
        "registrationOpen": True,
        "minDeposit": 100,
        "maxWithdrawal": 500000,
        "withdrawalFee": 0,
    }


@router.put("/settings")
async def update_settings(admin: dict = Depends(get_admin_user)):
    return {"success": True}

from fastapi import APIRouter, Depends, HTTPException
import aiosqlite

from app.database import get_db
from app.auth import get_admin_user
from app.models import AgentCreate, AgentUpdate

router = APIRouter()


@router.get("/agents")
async def list_agents(status: str = None, admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    query = "SELECT * FROM agents"
    params = []
    if status:
        query += " WHERE status = ?"
        params.append(status)
    query += " ORDER BY id"
    cursor = await db.execute(query, params)
    rows = await cursor.fetchall()
    return [{
        "id": r["agent_id"],
        "brand": r["brand"],
        "domain": r["domain"],
        "contact": r["contact"],
        "balance": r["balance"],
        "status": r["status"],
        "created": r["created_at"],
        "members": r["members"],
        "monthRevenue": r["month_revenue"],
        "shareMode": r["share_mode"],
        "shareRate": r["share_rate"],
    } for r in rows]


@router.get("/agents/{agent_id}")
async def get_agent(agent_id: str, admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT * FROM agents WHERE agent_id = ?", (agent_id,))
    r = await cursor.fetchone()
    if not r:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {
        "id": r["agent_id"],
        "brand": r["brand"],
        "domain": r["domain"],
        "contact": r["contact"],
        "balance": r["balance"],
        "status": r["status"],
        "created": r["created_at"],
        "members": r["members"],
        "monthRevenue": r["month_revenue"],
        "shareMode": r["share_mode"],
        "shareRate": r["share_rate"],
    }


@router.post("/agents")
async def create_agent(data: AgentCreate, admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    # Generate agent_id
    cursor = await db.execute("SELECT COUNT(*) as c FROM agents")
    count = (await cursor.fetchone())["c"]
    agent_id = f"AG{count + 1:03d}"

    await db.execute(
        "INSERT INTO agents (agent_id, brand, domain, contact, balance, share_mode, share_rate) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (agent_id, data.brand, data.domain, data.contact, data.balance, data.share_mode, data.share_rate)
    )
    await db.commit()
    return {"success": True, "id": agent_id}


@router.put("/agents/{agent_id}")
async def update_agent(agent_id: str, data: AgentUpdate, admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    fields = []
    values = []
    for field, value in data.model_dump(exclude_none=True).items():
        col = field
        if field == "share_mode":
            col = "share_mode"
        elif field == "share_rate":
            col = "share_rate"
        fields.append(f"{col} = ?")
        values.append(value)

    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    values.append(agent_id)
    await db.execute(f"UPDATE agents SET {', '.join(fields)} WHERE agent_id = ?", values)
    await db.commit()
    return {"success": True}


@router.delete("/agents/{agent_id}")
async def delete_agent(agent_id: str, admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    await db.execute("DELETE FROM agents WHERE agent_id = ?", (agent_id,))
    await db.commit()
    return {"success": True}

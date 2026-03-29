from fastapi import APIRouter, Depends, HTTPException
import aiosqlite

from app.database import get_db
from app.auth import get_admin_user
from app.models import GameCreate, GameUpdate, ProviderCreate, ProviderUpdate

router = APIRouter()


@router.get("/games")
async def list_games(category: str = None, provider: str = None, admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    query = "SELECT * FROM games_list WHERE 1=1"
    params = []
    if category:
        query += " AND category = ?"
        params.append(category)
    if provider:
        query += " AND provider = ?"
        params.append(provider)
    query += " ORDER BY id"
    cursor = await db.execute(query, params)
    rows = await cursor.fetchall()
    return [{
        "id": r["game_id"],
        "name": r["name"],
        "provider": r["provider"],
        "category": r["category"],
        "status": r["status"],
        "rtp": r["rtp"],
        "isHot": bool(r["is_hot"]),
        "isNew": bool(r["is_new"]),
        "bets": r["bets"],
        "revenue": r["revenue"],
    } for r in rows]


@router.post("/games")
async def create_game(data: GameCreate, admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT COUNT(*) as c FROM games_list")
    count = (await cursor.fetchone())["c"]
    game_id = f"G{count + 1:03d}"

    await db.execute(
        "INSERT INTO games_list (game_id, name, provider, category, rtp, is_hot, is_new) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (game_id, data.name, data.provider, data.category, data.rtp, int(data.is_hot), int(data.is_new))
    )
    await db.commit()
    return {"success": True, "id": game_id}


@router.put("/games/{game_id}")
async def update_game(game_id: str, data: GameUpdate, admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    fields = []
    values = []
    for field, value in data.model_dump(exclude_none=True).items():
        col = field
        if field == "is_hot":
            value = int(value)
        elif field == "is_new":
            value = int(value)
        fields.append(f"{col} = ?")
        values.append(value)

    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    values.append(game_id)
    await db.execute(f"UPDATE games_list SET {', '.join(fields)} WHERE game_id = ?", values)
    await db.commit()
    return {"success": True}


@router.delete("/games/{game_id}")
async def delete_game(game_id: str, admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    await db.execute("DELETE FROM games_list WHERE game_id = ?", (game_id,))
    await db.commit()
    return {"success": True}


@router.get("/providers")
async def list_providers(admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT * FROM game_providers ORDER BY id")
    rows = await cursor.fetchall()
    return [{
        "id": r["provider_id"],
        "name": r["name"],
        "category": r["category"],
        "games": r["games"],
        "status": r["status"],
        "apiHealth": r["api_health"],
        "balance": r["balance"],
        "responseTime": r["response_time"],
    } for r in rows]


@router.post("/providers")
async def create_provider(data: ProviderCreate, admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    await db.execute(
        "INSERT INTO game_providers (provider_id, name, category, games, status) VALUES (?, ?, ?, ?, ?)",
        (data.id, data.name, data.category, data.games, data.status)
    )
    await db.commit()
    return {"success": True}


@router.put("/providers/{provider_id}")
async def update_provider(provider_id: str, data: ProviderUpdate, admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    fields = []
    values = []
    for field, value in data.model_dump(exclude_none=True).items():
        fields.append(f"{field} = ?")
        values.append(value)

    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    values.append(provider_id)
    await db.execute(f"UPDATE game_providers SET {', '.join(fields)} WHERE provider_id = ?", values)
    await db.commit()
    return {"success": True}


@router.get("/bets")
async def list_bets(admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT * FROM betting_records ORDER BY created_at DESC")
    rows = await cursor.fetchall()
    return [{
        "id": r["bet_id"],
        "member": r["member"],
        "game": r["game"],
        "provider": r["provider"],
        "betAmount": r["bet_amount"],
        "winAmount": r["win_amount"],
        "time": r["created_at"],
        "status": r["status"],
    } for r in rows]

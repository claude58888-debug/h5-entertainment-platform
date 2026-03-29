from fastapi import APIRouter, Depends
import aiosqlite

from app.database import get_db

router = APIRouter()


@router.get("")
async def list_games(category: str = None, provider: str = None, db: aiosqlite.Connection = Depends(get_db)):
    query = "SELECT * FROM games WHERE status = 1"
    params = []
    if category:
        query += " AND category = ?"
        params.append(category)
    if provider:
        query += " AND provider = ?"
        params.append(provider)
    query += " ORDER BY sort_order, is_hot DESC, id"
    cursor = await db.execute(query, params)
    rows = await cursor.fetchall()
    return [dict(r) for r in rows]


@router.get("/categories")
async def get_categories(db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT DISTINCT category FROM games WHERE status = 1")
    rows = await cursor.fetchall()
    return [r["category"] for r in rows]


@router.get("/{game_id}")
async def get_game(game_id: int, db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT * FROM games WHERE id = ?", (game_id,))
    game = await cursor.fetchone()
    if not game:
        return {"error": "Game not found"}
    return dict(game)

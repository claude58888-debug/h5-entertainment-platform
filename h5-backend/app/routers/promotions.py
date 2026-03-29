from fastapi import APIRouter, Depends
import aiosqlite

from app.database import get_db

router = APIRouter()


@router.get("")
async def list_promotions(db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT * FROM promotions WHERE status = 1 ORDER BY id")
    rows = await cursor.fetchall()
    return [dict(r) for r in rows]

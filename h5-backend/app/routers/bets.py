from fastapi import APIRouter, Depends, HTTPException
import aiosqlite
import random
import string

from app.database import get_db
from app.auth import get_current_user
from app.models import PlaceBet

router = APIRouter()


@router.get("")
async def get_bets(current_user: dict = Depends(get_current_user), db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute(
        "SELECT * FROM bet_records WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
        (current_user["sub"],)
    )
    rows = await cursor.fetchall()
    return [dict(r) for r in rows]


@router.post("")
async def place_bet(data: PlaceBet, current_user: dict = Depends(get_current_user), db: aiosqlite.Connection = Depends(get_db)):
    user_id = current_user["sub"]

    # Check wallet balance
    cursor = await db.execute("SELECT balance FROM wallets WHERE user_id = ?", (user_id,))
    wallet = await cursor.fetchone()
    if not wallet or wallet["balance"] < data.bet_amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    # Deduct from wallet
    new_balance = wallet["balance"] - data.bet_amount
    await db.execute("UPDATE wallets SET balance = ? WHERE user_id = ?", (new_balance, user_id))

    # Generate round ID
    round_id = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))

    # Insert bet record
    await db.execute(
        "INSERT INTO bet_records (user_id, game_name, game_type, provider, bet_amount, status, round_id) VALUES (?, ?, ?, ?, ?, 'pending', ?)",
        (user_id, data.game_name, data.game_type, data.provider, data.bet_amount, round_id)
    )

    # Update turnover
    await db.execute("UPDATE users SET total_turnover = total_turnover + ? WHERE id = ?", (data.bet_amount, user_id))

    await db.commit()
    return {"success": True, "round_id": round_id, "balance": new_balance}

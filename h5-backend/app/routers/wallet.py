from fastapi import APIRouter, Depends, HTTPException
import aiosqlite

from app.database import get_db
from app.auth import get_current_user
from app.models import WalletAction

router = APIRouter()


@router.get("")
async def get_wallet(current_user: dict = Depends(get_current_user), db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT * FROM wallets WHERE user_id = ?", (current_user["sub"],))
    wallet = await cursor.fetchone()
    if not wallet:
        return {"balance": 0, "frozen": 0}
    return {"balance": wallet["balance"], "frozen": wallet["frozen"], "deposit_address": wallet["deposit_address"]}


@router.post("/deposit")
async def deposit(data: WalletAction, current_user: dict = Depends(get_current_user), db: aiosqlite.Connection = Depends(get_db)):
    user_id = current_user["sub"]

    # Update wallet balance
    await db.execute("UPDATE wallets SET balance = balance + ? WHERE user_id = ?", (data.amount, user_id))

    # Get new balance
    cursor = await db.execute("SELECT balance FROM wallets WHERE user_id = ?", (user_id,))
    wallet = await cursor.fetchone()
    new_balance = wallet["balance"] if wallet else data.amount

    # Record transaction
    await db.execute(
        "INSERT INTO transactions (user_id, type, amount, balance_after, method, status) VALUES (?, 'deposit', ?, ?, ?, 'completed')",
        (user_id, data.amount, new_balance, data.method)
    )

    # Update user total deposit
    await db.execute("UPDATE users SET total_deposit = total_deposit + ? WHERE id = ?", (data.amount, user_id))

    await db.commit()
    return {"success": True, "balance": new_balance}


@router.post("/withdraw")
async def withdraw(data: WalletAction, current_user: dict = Depends(get_current_user), db: aiosqlite.Connection = Depends(get_db)):
    user_id = current_user["sub"]

    cursor = await db.execute("SELECT balance FROM wallets WHERE user_id = ?", (user_id,))
    wallet = await cursor.fetchone()
    if not wallet or wallet["balance"] < data.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    new_balance = wallet["balance"] - data.amount
    await db.execute("UPDATE wallets SET balance = ? WHERE user_id = ?", (new_balance, user_id))

    await db.execute(
        "INSERT INTO transactions (user_id, type, amount, balance_after, method, status) VALUES (?, 'withdraw', ?, ?, ?, 'pending')",
        (user_id, data.amount, new_balance, data.method)
    )

    await db.commit()
    return {"success": True, "balance": new_balance}


@router.get("/transactions")
async def get_transactions(current_user: dict = Depends(get_current_user), db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute(
        "SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
        (current_user["sub"],)
    )
    rows = await cursor.fetchall()
    return [dict(r) for r in rows]

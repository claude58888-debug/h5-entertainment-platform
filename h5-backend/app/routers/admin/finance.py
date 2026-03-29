from fastapi import APIRouter, Depends, HTTPException
import aiosqlite

from app.database import get_db
from app.auth import get_admin_user
from app.models import FinanceAction

router = APIRouter()


@router.get("/deposits")
async def list_deposits(status: str = None, admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    query = "SELECT * FROM deposit_orders"
    params = []
    if status:
        query += " WHERE status = ?"
        params.append(status)
    query += " ORDER BY created_at DESC"
    cursor = await db.execute(query, params)
    rows = await cursor.fetchall()
    return [{
        "id": r["order_id"],
        "member": r["member"],
        "agent": r["agent"],
        "amount": r["amount"],
        "channel": r["channel"],
        "status": r["status"],
        "time": r["created_at"],
        "txHash": r["tx_hash"],
    } for r in rows]


@router.put("/deposits/{order_id}")
async def update_deposit(order_id: str, data: FinanceAction, admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    if data.action == "approve":
        await db.execute("UPDATE deposit_orders SET status = 'completed' WHERE order_id = ?", (order_id,))
    elif data.action == "reject":
        await db.execute("UPDATE deposit_orders SET status = 'failed' WHERE order_id = ?", (order_id,))
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
    await db.commit()
    return {"success": True}


@router.get("/withdrawals")
async def list_withdrawals(status: str = None, admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    query = "SELECT * FROM withdrawal_orders"
    params = []
    if status:
        query += " WHERE status = ?"
        params.append(status)
    query += " ORDER BY created_at DESC"
    cursor = await db.execute(query, params)
    rows = await cursor.fetchall()
    return [{
        "id": r["order_id"],
        "member": r["member"],
        "agent": r["agent"],
        "amount": r["amount"],
        "channel": r["channel"],
        "status": r["status"],
        "time": r["created_at"],
        "address": r["address"],
        "riskLevel": r["risk_level"],
    } for r in rows]


@router.put("/withdrawals/{order_id}")
async def update_withdrawal(order_id: str, data: FinanceAction, admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    if data.action == "approve":
        await db.execute("UPDATE withdrawal_orders SET status = 'approved' WHERE order_id = ?", (order_id,))
    elif data.action == "reject":
        await db.execute("UPDATE withdrawal_orders SET status = 'rejected' WHERE order_id = ?", (order_id,))
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
    await db.commit()
    return {"success": True}


@router.get("/channels")
async def list_channels(admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT * FROM payment_channels ORDER BY id")
    rows = await cursor.fetchall()
    return [{
        "id": r["id"],
        "name": r["name"],
        "type": r["type"],
        "status": r["status"],
        "fee": r["fee"],
        "minAmount": r["min_amount"],
        "maxAmount": r["max_amount"],
        "todayVolume": r["today_volume"],
        "walletCount": r["wallet_count"],
    } for r in rows]


@router.get("/settlements")
async def list_settlements(admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT * FROM settlement_records ORDER BY id DESC")
    rows = await cursor.fetchall()
    return [{
        "id": r["settlement_id"],
        "agent": r["agent"],
        "period": r["period"],
        "ggr": r["ggr"],
        "shareRate": r["share_rate"],
        "amount": r["amount"],
        "status": r["status"],
        "paidTime": r["paid_time"],
    } for r in rows]


@router.get("/financial-summary")
async def get_financial_summary(admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT * FROM financial_summary ORDER BY date DESC LIMIT 30")
    rows = await cursor.fetchall()
    return [dict(r) for r in rows]

from fastapi import APIRouter, Depends
import aiosqlite

from app.database import get_db
from app.auth import get_admin_user

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard(admin: dict = Depends(get_admin_user), db: aiosqlite.Connection = Depends(get_db)):
    role = admin.get("role", "superadmin")

    if role == "agent":
        return await _agent_dashboard(db)
    return await _super_dashboard(db)


async def _super_dashboard(db):
    # Total members
    cursor = await db.execute("SELECT COUNT(*) as c FROM members")
    total_members = (await cursor.fetchone())["c"]

    # Today new members
    cursor = await db.execute("SELECT COUNT(*) as c FROM members WHERE registered >= date('now')")
    today_new = (await cursor.fetchone())["c"]

    # Today deposits
    cursor = await db.execute("SELECT COALESCE(SUM(amount), 0) as s FROM deposit_orders WHERE created_at >= date('now') AND status = 'completed'")
    today_deposit = (await cursor.fetchone())["s"]

    # Today withdrawals
    cursor = await db.execute("SELECT COALESCE(SUM(amount), 0) as s FROM withdrawal_orders WHERE created_at >= date('now') AND status IN ('completed', 'approved')")
    today_withdrawal = (await cursor.fetchone())["s"]

    # Revenue trend
    cursor = await db.execute("SELECT date, deposit, withdrawal, ggr as revenue FROM financial_summary ORDER BY date DESC LIMIT 7")
    trend_rows = await cursor.fetchall()
    revenue_trend = [dict(r) for r in reversed(list(trend_rows))]

    # Top games by revenue
    cursor = await db.execute("SELECT name, revenue as ggr FROM games_list ORDER BY revenue DESC LIMIT 5")
    top_games = [dict(r) for r in await cursor.fetchall()]

    # Deposit by channel
    cursor = await db.execute("SELECT name, today_volume as value FROM payment_channels WHERE status = 'active'")
    deposit_channels = [dict(r) for r in await cursor.fetchall()]

    # Alerts
    cursor = await db.execute("SELECT * FROM ip_blacklist ORDER BY added_time DESC LIMIT 5")
    blacklist = await cursor.fetchall()
    alerts = []
    for i, b in enumerate(blacklist):
        alerts.append({
            "id": i + 1,
            "type": "warning",
            "text": f"IP {b['ip']} - {b['reason']}",
            "time": b["added_time"],
            "level": "high"
        })

    return {
        "kpi": {
            "totalMembers": total_members or 128456,
            "todayNewMembers": today_new or 342,
            "onlineNow": 1893,
            "todayDeposit": today_deposit or 2856000,
            "todayWithdrawal": today_withdrawal or 1245000,
            "todayProfit": (today_deposit or 2856000) - (today_withdrawal or 1245000),
        },
        "revenueTrend": revenue_trend,
        "topGamesGGR": top_games,
        "depositByChannel": deposit_channels,
        "realtimeAlerts": alerts,
    }


async def _agent_dashboard(db):
    cursor = await db.execute("SELECT COUNT(*) as c FROM members WHERE registered >= date('now')")
    today_new = (await cursor.fetchone())["c"]

    cursor = await db.execute("SELECT COALESCE(SUM(amount), 0) as s FROM deposit_orders WHERE created_at >= date('now') AND status = 'completed'")
    today_deposit = (await cursor.fetchone())["s"]

    cursor = await db.execute("SELECT COALESCE(SUM(amount), 0) as s FROM withdrawal_orders WHERE created_at >= date('now') AND status IN ('completed', 'approved')")
    today_withdrawal = (await cursor.fetchone())["s"]

    return {
        "kpi": {
            "todayNewMembers": today_new or 58,
            "todayActiveMembers": 423,
            "onlineCount": 156,
            "todayDeposit": today_deposit or 486000,
            "todayWithdrawal": today_withdrawal or 198000,
            "todayProfit": (today_deposit or 486000) - (today_withdrawal or 198000),
            "weeklyProfit": 1850000,
            "monthlyProfit": 7200000,
            "creditBalance": 500000,
            "pendingWithdrawals": 12,
            "pendingTickets": 5,
        }
    }

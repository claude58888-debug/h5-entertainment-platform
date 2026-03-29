from fastapi import APIRouter, Depends, HTTPException, status
import aiosqlite
import random
import string

from app.database import get_db
from app.auth import verify_password, get_password_hash, create_access_token
from app.models import LoginRequest, AdminLoginRequest, RegisterRequest, TokenResponse

router = APIRouter()


def generate_invite_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT * FROM users WHERE phone = ?", (req.phone,))
    user = await cursor.fetchone()
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token({"sub": str(user["id"]), "phone": user["phone"], "role": "user"})
    return TokenResponse(
        access_token=token,
        user={
            "id": user["id"],
            "phone": user["phone"],
            "nickname": user["nickname"],
            "avatar": user["avatar"],
            "vip_level": user["vip_level"],
            "invite_code": user["invite_code"],
        }
    )


@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest, db: aiosqlite.Connection = Depends(get_db)):
    # Check if phone already exists
    cursor = await db.execute("SELECT id FROM users WHERE phone = ?", (req.phone,))
    if await cursor.fetchone():
        raise HTTPException(status_code=400, detail="Phone already registered")

    password_hash = get_password_hash(req.password)
    invite_code = generate_invite_code()

    invited_by = None
    if req.invite_code:
        cursor = await db.execute("SELECT id FROM users WHERE invite_code = ?", (req.invite_code,))
        inviter = await cursor.fetchone()
        if inviter:
            invited_by = inviter["id"]

    cursor = await db.execute(
        "INSERT INTO users (phone, password_hash, nickname, invite_code, invited_by) VALUES (?, ?, ?, ?, ?)",
        (req.phone, password_hash, f"用户{req.phone[-4:]}", invite_code, invited_by)
    )
    user_id = cursor.lastrowid

    # Create wallet
    await db.execute("INSERT INTO wallets (user_id, balance) VALUES (?, 0)", (user_id,))

    # Also add to members table for admin visibility
    member_id = f"M{10000 + user_id}"
    await db.execute(
        "INSERT INTO members (member_id, username, agent, vip, balance, status, registered, last_login) VALUES (?, ?, '', 0, 0, 'active', datetime('now'), datetime('now'))",
        (member_id, f"用户{req.phone[-4:]}")
    )

    await db.commit()

    token = create_access_token({"sub": str(user_id), "phone": req.phone, "role": "user"})
    return TokenResponse(
        access_token=token,
        user={
            "id": user_id,
            "phone": req.phone,
            "nickname": f"用户{req.phone[-4:]}",
            "avatar": "",
            "vip_level": 0,
            "invite_code": invite_code,
        }
    )


@router.post("/admin-login", response_model=TokenResponse)
async def admin_login(req: AdminLoginRequest, db: aiosqlite.Connection = Depends(get_db)):
    # Check admin_accounts table
    cursor = await db.execute("SELECT * FROM admin_accounts WHERE username = ?", (req.username,))
    admin = await cursor.fetchone()
    if not admin or not verify_password(req.password, admin["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")

    if admin["status"] != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")

    # Update last login
    await db.execute("UPDATE admin_accounts SET last_login = datetime('now') WHERE id = ?", (admin["id"],))
    await db.commit()

    role = req.role if req.role in ("superadmin", "agent") else "superadmin"
    token = create_access_token({
        "sub": str(admin["id"]),
        "username": admin["username"],
        "role": role,
        "admin_role": admin["role"],
    })
    return TokenResponse(
        access_token=token,
        user={
            "id": admin["id"],
            "username": admin["username"],
            "role": role,
            "adminRole": admin["role"],
            "agentName": "金沙娱乐" if role == "agent" else "总平台",
            "loginTime": admin["last_login"],
        }
    )

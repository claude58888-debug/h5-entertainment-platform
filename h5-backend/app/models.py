from pydantic import BaseModel
from typing import Optional, List


# Auth
class LoginRequest(BaseModel):
    phone: str
    password: str


class AdminLoginRequest(BaseModel):
    username: str
    password: str
    role: str = "superadmin"


class RegisterRequest(BaseModel):
    phone: str
    password: str
    invite_code: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# User
class UserUpdate(BaseModel):
    nickname: Optional[str] = None
    avatar: Optional[str] = None
    email: Optional[str] = None
    telegram_id: Optional[str] = None
    language: Optional[str] = None
    withdraw_password: Optional[str] = None
    wallet_address: Optional[str] = None


# Wallet
class WalletAction(BaseModel):
    amount: float
    method: str = "USDT-TRC20"
    address: Optional[str] = None


# Bets
class PlaceBet(BaseModel):
    game_name: str
    game_type: str
    provider: str
    bet_amount: float
    selections: Optional[List[str]] = None


# Admin models
class AgentCreate(BaseModel):
    brand: str
    domain: str
    contact: str
    share_mode: str = "revenue"
    share_rate: float = 40
    balance: float = 0


class AgentUpdate(BaseModel):
    brand: Optional[str] = None
    domain: Optional[str] = None
    contact: Optional[str] = None
    status: Optional[str] = None
    share_mode: Optional[str] = None
    share_rate: Optional[float] = None
    balance: Optional[float] = None


class MemberAction(BaseModel):
    action: str  # freeze, unfreeze
    reason: Optional[str] = None


class FinanceAction(BaseModel):
    action: str  # approve, reject
    remark: Optional[str] = None


class BlacklistAdd(BaseModel):
    ip: str
    reason: str


class AdminCreate(BaseModel):
    username: str
    password: str
    role: str


class AnnouncementCreate(BaseModel):
    title: str
    content: str
    target: str = "全部代理"
    status: str = "active"


class GameCreate(BaseModel):
    name: str
    category: str
    provider: str
    rtp: float = 96.0
    is_hot: bool = False
    is_new: bool = False


class GameUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    provider: Optional[str] = None
    status: Optional[str] = None
    rtp: Optional[float] = None
    is_hot: Optional[bool] = None
    is_new: Optional[bool] = None


class ProviderCreate(BaseModel):
    id: str
    name: str
    category: str
    games: int = 0
    status: str = "active"


class ProviderUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    games: Optional[int] = None

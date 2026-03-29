from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db, DB_PATH
from app.seed import seed_data
from app.routers import auth, users, wallet, games, bets, promotions
from app.routers.admin import dashboard, agents, members, finance
from app.routers.admin import games as admin_games
from app.routers.admin import risk, system


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await seed_data(DB_PATH)
    yield


app = FastAPI(title="H5 Entertainment Platform API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# H5 user routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(wallet.router, prefix="/api/wallet", tags=["wallet"])
app.include_router(games.router, prefix="/api/games", tags=["games"])
app.include_router(bets.router, prefix="/api/bets", tags=["bets"])
app.include_router(promotions.router, prefix="/api/promotions", tags=["promotions"])

# Admin routes
app.include_router(dashboard.router, prefix="/api/admin", tags=["admin-dashboard"])
app.include_router(agents.router, prefix="/api/admin", tags=["admin-agents"])
app.include_router(members.router, prefix="/api/admin", tags=["admin-members"])
app.include_router(finance.router, prefix="/api/admin", tags=["admin-finance"])
app.include_router(admin_games.router, prefix="/api/admin", tags=["admin-games"])
app.include_router(risk.router, prefix="/api/admin", tags=["admin-risk"])
app.include_router(system.router, prefix="/api/admin", tags=["admin-system"])


@app.get("/api/health")
async def health():
    return {"status": "ok"}

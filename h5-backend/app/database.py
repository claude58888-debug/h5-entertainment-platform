import aiosqlite
import os

DB_PATH = os.getenv("DB_PATH", "/data/app.db")

async def get_db():
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    try:
        yield db
    finally:
        await db.close()

async def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    db = await aiosqlite.connect(DB_PATH)
    await db.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            nickname TEXT DEFAULT '',
            avatar TEXT DEFAULT '',
            email TEXT DEFAULT '',
            telegram_id TEXT DEFAULT '',
            vip_level INTEGER DEFAULT 0,
            total_deposit REAL DEFAULT 0,
            total_turnover REAL DEFAULT 0,
            withdraw_password TEXT DEFAULT '',
            wallet_address TEXT DEFAULT '',
            invite_code TEXT UNIQUE,
            invited_by INTEGER REFERENCES users(id),
            language TEXT DEFAULT 'zh-CN',
            is_admin INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
        CREATE INDEX IF NOT EXISTS idx_users_invite_code ON users(invite_code);
        CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);

        CREATE TABLE IF NOT EXISTS wallets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
            balance REAL DEFAULT 0,
            frozen REAL DEFAULT 0,
            deposit_address TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);

        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id),
            type TEXT NOT NULL,
            amount REAL NOT NULL,
            balance_after REAL DEFAULT 0,
            method TEXT DEFAULT '',
            status TEXT DEFAULT 'pending',
            remark TEXT DEFAULT '',
            admin_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_trans_user ON transactions(user_id);
        CREATE INDEX IF NOT EXISTS idx_trans_type ON transactions(type);
        CREATE INDEX IF NOT EXISTS idx_trans_status ON transactions(status);
        CREATE INDEX IF NOT EXISTS idx_trans_created ON transactions(created_at);

        CREATE TABLE IF NOT EXISTS games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            name_zh TEXT DEFAULT '',
            name_vi TEXT DEFAULT '',
            category TEXT NOT NULL,
            provider TEXT NOT NULL,
            thumbnail TEXT DEFAULT '',
            is_hot INTEGER DEFAULT 0,
            is_new INTEGER DEFAULT 0,
            sort_order INTEGER DEFAULT 0,
            status INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_games_category ON games(category);
        CREATE INDEX IF NOT EXISTS idx_games_provider ON games(provider);

        CREATE TABLE IF NOT EXISTS bet_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id),
            game_id INTEGER REFERENCES games(id),
            game_name TEXT DEFAULT '',
            game_type TEXT DEFAULT '',
            provider TEXT DEFAULT '',
            bet_amount REAL NOT NULL,
            win_amount REAL DEFAULT 0,
            status TEXT DEFAULT 'settled',
            round_id TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_bets_user ON bet_records(user_id);
        CREATE INDEX IF NOT EXISTS idx_bets_game_type ON bet_records(game_type);
        CREATE INDEX IF NOT EXISTS idx_bets_created ON bet_records(created_at);

        CREATE TABLE IF NOT EXISTS promotions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            title_zh TEXT DEFAULT '',
            title_vi TEXT DEFAULT '',
            description TEXT DEFAULT '',
            description_zh TEXT DEFAULT '',
            description_vi TEXT DEFAULT '',
            image TEXT DEFAULT '',
            type TEXT DEFAULT 'general',
            start_date TEXT,
            end_date TEXT,
            rules TEXT DEFAULT '',
            status INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            title_zh TEXT DEFAULT '',
            title_vi TEXT DEFAULT '',
            description TEXT DEFAULT '',
            type TEXT DEFAULT 'daily',
            reward REAL DEFAULT 0,
            target INTEGER DEFAULT 1,
            status INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS user_tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id),
            task_id INTEGER NOT NULL REFERENCES tasks(id),
            progress INTEGER DEFAULT 0,
            claimed INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_user_tasks ON user_tasks(user_id, task_id);

        CREATE TABLE IF NOT EXISTS vip_levels (
            level INTEGER PRIMARY KEY,
            deposit_required REAL DEFAULT 0,
            turnover_required REAL DEFAULT 0,
            upgrade_bonus REAL DEFAULT 0,
            monthly_packet REAL DEFAULT 0,
            loss_rebate_rate REAL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS red_packets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER NOT NULL REFERENCES users(id),
            total_amount REAL NOT NULL,
            remaining_amount REAL NOT NULL,
            total_count INTEGER NOT NULL,
            remaining_count INTEGER NOT NULL,
            type TEXT DEFAULT 'random',
            password TEXT DEFAULT '',
            turnover_multiplier REAL DEFAULT 3,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_rp_sender ON red_packets(sender_id);

        CREATE TABLE IF NOT EXISTS red_packet_claims (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            red_packet_id INTEGER NOT NULL REFERENCES red_packets(id),
            user_id INTEGER NOT NULL REFERENCES users(id),
            amount REAL NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_rpc_user ON red_packet_claims(user_id);

        CREATE TABLE IF NOT EXISTS referral_rewards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id),
            from_user_id INTEGER NOT NULL REFERENCES users(id),
            bet_amount REAL DEFAULT 0,
            commission REAL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_ref_user ON referral_rewards(user_id);

        CREATE TABLE IF NOT EXISTS announcements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            content_zh TEXT DEFAULT '',
            content_vi TEXT DEFAULT '',
            status INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS banners (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            image TEXT NOT NULL,
            link TEXT DEFAULT '',
            sort_order INTEGER DEFAULT 0,
            status INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # Seed VIP levels
    await db.execute("INSERT OR IGNORE INTO vip_levels VALUES (0, 0, 0, 0, 0, 0)")
    await db.execute("INSERT OR IGNORE INTO vip_levels VALUES (1, 500, 5000, 18, 8, 0.005)")
    await db.execute("INSERT OR IGNORE INTO vip_levels VALUES (2, 2000, 20000, 58, 18, 0.008)")
    await db.execute("INSERT OR IGNORE INTO vip_levels VALUES (3, 5000, 80000, 128, 38, 0.01)")
    await db.execute("INSERT OR IGNORE INTO vip_levels VALUES (4, 20000, 300000, 388, 88, 0.012)")
    await db.execute("INSERT OR IGNORE INTO vip_levels VALUES (5, 50000, 1000000, 888, 188, 0.015)")

    await db.commit()
    await db.close()

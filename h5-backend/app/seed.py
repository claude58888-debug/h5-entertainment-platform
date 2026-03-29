import aiosqlite
from app.auth import get_password_hash


async def seed_data(db_path: str):
    """Seed database with demo data matching the admin mock data."""
    db = await aiosqlite.connect(db_path)

    # Check if already seeded
    cursor = await db.execute("SELECT COUNT(*) FROM users")
    count = (await cursor.fetchone())[0]
    if count > 0:
        await db.close()
        return

    admin_hash = get_password_hash("123456")
    user_hash = get_password_hash("password123")

    # Admin accounts
    await db.executescript(f"""
        INSERT INTO admin_accounts (username, password_hash, role, status, last_login, created_at)
        VALUES
        ('admin', '{admin_hash}', '超级管理员', 'active', '2026-03-07 16:00', '2025-01-01'),
        ('admin_finance', '{admin_hash}', '财务管理员', 'active', '2026-03-07 15:30', '2025-03-15'),
        ('admin_cs', '{admin_hash}', '客服管理员', 'active', '2026-03-07 14:00', '2025-06-20'),
        ('admin_risk', '{admin_hash}', '风控管理员', 'active', '2026-03-06 18:00', '2025-08-10'),
        ('admin_backup', '{admin_hash}', '备用管理员', 'inactive', '2026-01-15 10:00', '2025-12-01');
    """)

    # Agents
    await db.executescript("""
        INSERT INTO agents (agent_id, brand, domain, contact, balance, status, created_at, members, month_revenue, share_mode, share_rate)
        VALUES
        ('AG001', '金沙娱乐', 'jinsha88.com', 'admin_js', 520000, 'active', '2025-08-15', 12500, 1850000, 'revenue', 45),
        ('AG002', '皇冠体育', 'hg-sport.com', 'admin_hg', 380000, 'active', '2025-09-20', 8900, 1200000, 'revenue', 40),
        ('AG003', '新濠天地', 'xinhaotd.com', 'admin_xh', 150000, 'active', '2025-10-05', 6200, 950000, 'turnover', 8),
        ('AG004', '永利娱乐', 'wynn168.com', 'admin_yl', 95000, 'suspended', '2025-11-12', 4500, 620000, 'revenue', 42),
        ('AG005', '澳门威尼斯', 'venice-mo.com', 'admin_wns', 280000, 'active', '2025-12-01', 7800, 1100000, 'revenue', 38),
        ('AG006', '大三元', 'dsy888.com', 'admin_dsy', 5000, 'banned', '2026-01-10', 2100, 0, 'revenue', 35);
    """)

    # Users (H5 members)
    await db.execute("""
        INSERT INTO users (phone, password_hash, nickname, vip_level, total_deposit, invite_code, is_admin)
        VALUES (?, ?, '测试用户', 3, 50000, 'TEST01', 0)
    """, ('13800138000', user_hash))

    members_data = [
        ('M10001', 'player_wang', '金沙娱乐', 6, 125000, 'active', '2025-08-20', '2026-03-07 16:30', 850000, 720000),
        ('M10002', 'lucky_star88', '皇冠体育', 4, 45000, 'active', '2025-09-15', '2026-03-07 15:45', 320000, 275000),
        ('M10003', 'dragon_888', '金沙娱乐', 8, 380000, 'active', '2025-07-10', '2026-03-07 16:28', 2500000, 2100000),
        ('M10004', 'test_user01', '新濠天地', 1, 500, 'frozen', '2026-01-20', '2026-02-15 10:00', 5000, 4500),
        ('M10005', 'king_poker', '永利娱乐', 5, 78000, 'active', '2025-10-25', '2026-03-07 14:20', 560000, 480000),
        ('M10006', 'fish_lover', '澳门威尼斯', 3, 22000, 'active', '2025-11-30', '2026-03-06 22:10', 180000, 158000),
        ('M10007', 'slot_queen', '金沙娱乐', 7, 210000, 'active', '2025-08-05', '2026-03-07 16:15', 1800000, 1590000),
        ('M10008', 'newbie_2026', '皇冠体育', 1, 2000, 'active', '2026-03-01', '2026-03-07 12:00', 10000, 8000),
    ]

    for m in members_data:
        await db.execute("""
            INSERT INTO members (member_id, username, agent, vip, balance, status, registered, last_login, total_deposit, total_withdraw)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, m)

    # Wallets for the test user
    await db.execute("INSERT INTO wallets (user_id, balance) VALUES (1, 1288.50)")

    # Game providers
    providers = [
        ('PG', 'PG电子', 'slots', 58, 'active', 99.8, 2500000, '120ms'),
        ('PP', 'PP电子', 'slots', 120, 'active', 99.5, 1800000, '95ms'),
        ('CQ9', 'CQ9电子', 'slots', 85, 'active', 98.9, 1200000, '150ms'),
        ('EVO', 'EVO真人', 'live', 35, 'active', 99.9, 3500000, '80ms'),
        ('AG', 'AG真人', 'live', 28, 'active', 99.2, 2800000, '110ms'),
        ('JDB', 'JDB捕鱼', 'fishing', 15, 'active', 99.1, 800000, '130ms'),
        ('JILI', 'JILI', 'multi', 65, 'active', 99.6, 1500000, '105ms'),
        ('FC', 'FC游戏', 'multi', 38, 'active', 98.5, 600000, '160ms'),
        ('WM', 'WM真人', 'live', 20, 'maintenance', 0, 2000000, 'N/A'),
    ]
    for p in providers:
        await db.execute("""
            INSERT INTO game_providers (provider_id, name, category, games, status, api_health, balance, response_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, p)

    # Games
    games_data = [
        ('G001', '麻将胡了2', 'PG', '电子游戏', 'active', 96.8, 1, 0, 125000, 520000),
        ('G002', '极速糖果1000', 'PP', '电子游戏', 'active', 96.5, 1, 1, 98000, 380000),
        ('G003', '奥林匹斯之门', 'PP', '电子游戏', 'active', 96.2, 1, 0, 87000, 310000),
        ('G004', '闪电轮盘', 'EVO', '真人视讯', 'active', 97.3, 1, 0, 76000, 280000),
        ('G005', '百家乐', 'AG', '真人视讯', 'active', 98.9, 0, 0, 150000, 250000),
        ('G006', '海洋之王', 'JDB', '捕鱼游戏', 'active', 95.5, 0, 0, 45000, 180000),
        ('G007', '招财猫', 'PG', '电子游戏', 'active', 96.0, 0, 0, 62000, 150000),
        ('G008', '德州扑克', 'FC', '棋牌游戏', 'active', 97.5, 0, 1, 35000, 120000),
        ('G009', '加拿大4.2-4.6', 'TCG', '彩票', 'active', 97.0, 0, 0, 55000, 200000),
        ('G010', 'CR皇冠体育', 'CROWN', '体育竞猜', 'active', 96.5, 0, 0, 80000, 350000),
    ]
    for g in games_data:
        await db.execute("""
            INSERT INTO games_list (game_id, name, provider, category, status, rtp, is_hot, is_new, bets, revenue)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, g)

    # Deposit orders
    deposits = [
        ('D20260307001', 'player_wang', '金沙娱乐', 50000, 'USDT-TRC20', 'completed', '2026-03-07 16:25', 'TxH...a8f2'),
        ('D20260307002', 'lucky_star88', '皇冠体育', 10000, 'USDT-TRC20', 'completed', '2026-03-07 16:18', 'TxH...b3c1'),
        ('D20260307003', 'dragon_888', '金沙娱乐', 100000, 'USDT-ERC20', 'pending', '2026-03-07 16:10', ''),
        ('D20260307004', 'king_poker', '永利娱乐', 20000, '银行转账', 'pending', '2026-03-07 15:55', ''),
        ('D20260307005', 'slot_queen', '金沙娱乐', 80000, 'USDT-TRC20', 'completed', '2026-03-07 15:30', 'TxH...d5e4'),
        ('D20260307006', 'fish_lover', '澳门威尼斯', 5000, 'USDT-TRC20', 'failed', '2026-03-07 15:15', ''),
    ]
    for d in deposits:
        await db.execute("""
            INSERT INTO deposit_orders (order_id, member, agent, amount, channel, status, created_at, tx_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, d)

    # Withdrawal orders
    withdrawals = [
        ('W20260307001', 'player_wang', '金沙娱乐', 30000, 'USDT-TRC20', 'pending', '2026-03-07 16:28', 'TRC...x8f2', 'low'),
        ('W20260307002', 'dragon_888', '金沙娱乐', 50000, 'USDT-TRC20', 'review', '2026-03-07 16:20', 'TRC...a3b1', 'high'),
        ('W20260307003', 'slot_queen', '金沙娱乐', 25000, 'USDT-ERC20', 'approved', '2026-03-07 16:00', 'ERC...c4d5', 'low'),
        ('W20260307004', 'king_poker', '永利娱乐', 15000, '银行转账', 'pending', '2026-03-07 15:45', '工商银行 ***8823', 'medium'),
        ('W20260307005', 'lucky_star88', '皇冠体育', 8000, 'USDT-TRC20', 'completed', '2026-03-07 14:30', 'TRC...e6f7', 'low'),
    ]
    for w in withdrawals:
        await db.execute("""
            INSERT INTO withdrawal_orders (order_id, member, agent, amount, channel, status, created_at, address, risk_level)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, w)

    # Betting records
    bets = [
        ('B001', 'player_wang', '麻将胡了2', 'PG', 500, 1200, '2026-03-07 16:29:45', 'settled'),
        ('B002', 'dragon_888', '百家乐', 'AG', 10000, 0, '2026-03-07 16:29:30', 'settled'),
        ('B003', 'slot_queen', '极速糖果1000', 'PP', 200, 5800, '2026-03-07 16:29:15', 'settled'),
        ('B004', 'king_poker', '德州扑克', 'FC', 2000, 3500, '2026-03-07 16:28:50', 'settled'),
        ('B005', 'lucky_star88', '闪电轮盘', 'EVO', 1000, 0, '2026-03-07 16:28:30', 'settled'),
        ('B006', 'fish_lover', '海洋之王', 'JDB', 100, 450, '2026-03-07 16:28:10', 'settled'),
        ('B007', 'newbie_2026', '麻将胡了', 'PG', 50, 0, '2026-03-07 16:27:55', 'settled'),
        ('B008', 'player_wang', '奥林匹斯之门', 'PP', 300, 0, '2026-03-07 16:27:30', 'settled'),
    ]
    for b in bets:
        await db.execute("""
            INSERT INTO betting_records (bet_id, member, game, provider, bet_amount, win_amount, created_at, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, b)

    # Risk rules
    risk_rules = [
        (1, '大额提现预警', '单笔提现超过50,000元触发预警', 50000, 'active', 28),
        (2, '频繁提现检测', '24小时内提现超过3次触发预警', 3, 'active', 15),
        (3, '多账号IP检测', '同一IP登录超过3个账号', 3, 'active', 8),
        (4, '异常投注检测', '单笔投注超过账户余额50%', 50, 'active', 42),
        (5, '设备指纹异常', '同一设备注册超过2个账号', 2, 'inactive', 0),
    ]
    for r in risk_rules:
        await db.execute("""
            INSERT INTO risk_rules (id, name, description, threshold, status, triggers)
            VALUES (?, ?, ?, ?, ?, ?)
        """, r)

    # IP blacklist
    blacklist = [
        ('103.45.67.89', '多账号操作', 'admin', '2026-03-05 10:30', 12),
        ('192.168.1.100', '恶意刷单', 'system', '2026-03-04 15:20', 5),
        ('45.67.89.123', '疑似机器人', 'admin', '2026-03-01 08:00', 28),
    ]
    for bl in blacklist:
        await db.execute("""
            INSERT INTO ip_blacklist (ip, reason, added_by, added_time, hit_count)
            VALUES (?, ?, ?, ?, ?)
        """, bl)

    # Audit logs
    logs = [
        (1, 'superadmin', '审批提现', 'W20260307003', '审批通过 ¥25,000', '2026-03-07 16:05', '10.0.0.1'),
        (2, 'admin_finance', '充值确认', 'D20260307001', '确认到账 ¥50,000', '2026-03-07 16:02', '10.0.0.2'),
        (3, 'superadmin', '冻结账户', 'M10004', '风险账户冻结', '2026-03-07 15:50', '10.0.0.1'),
        (4, 'admin_risk', '添加IP黑名单', '103.45.67.89', '多账号操作', '2026-03-05 10:30', '10.0.0.3'),
        (5, 'superadmin', '修改代理配置', 'AG001', '分成比例 42% -> 45%', '2026-03-04 14:20', '10.0.0.1'),
    ]
    for l in logs:
        await db.execute("""
            INSERT INTO audit_logs (id, operator, action, target, detail, created_at, ip)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, l)

    # Announcements
    await db.executescript("""
        INSERT INTO admin_announcements (id, title, content, target, status, created_at)
        VALUES
        (1, '系统维护通知', '3月8日凌晨2:00-4:00进行系统升级维护', '全部代理', 'active', '2026-03-06'),
        (2, '新游戏上线', 'PP电子新游戏"极速糖果2000"即将上线', '全部代理', 'active', '2026-03-05'),
        (3, '结算周期调整', '自4月1日起，结算周期调整为每周结算', '指定代理', 'draft', '2026-03-04');
    """)

    # Activities / promotions
    activities = [
        ('ACT001', '首充双倍', '首充奖励', 'active', '2026-03-01', '2026-03-31', 100, 100, 20, 5000, 856),
        ('ACT002', '每日返水', '返水优惠', 'active', '2026-01-01', '2026-12-31', 0, 0.8, 1, 50000, 12500),
        ('ACT003', '周末存送', '存送优惠', 'active', '2026-03-01', '2026-03-31', 500, 30, 15, 10000, 2340),
        ('ACT004', '签到有礼', '签到奖励', 'active', '2026-01-01', '2026-12-31', 0, 0, 5, 888, 8900),
        ('ACT005', '邀请好友', '邀请奖励', 'active', '2026-01-01', '2026-12-31', 0, 0, 10, 2000, 3200),
        ('ACT006', '幸运转盘', '幸运转盘', 'inactive', '2026-02-01', '2026-02-28', 100, 0, 8, 8888, 5600),
    ]
    for a in activities:
        await db.execute("""
            INSERT INTO activities (activity_id, name, type, status, start_time, end_time, min_deposit, bonus_rate, wagering, max_bonus, participants)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, a)

    # Payment channels
    channels = [
        (1, 'USDT-TRC20', 'crypto', 'active', 0, 100, 500000, 1850000, 5),
        (2, 'USDT-ERC20', 'crypto', 'active', 0.5, 500, 500000, 650000, 3),
        (3, '银行转账', 'bank', 'active', 0, 200, 200000, 356000, 0),
    ]
    for c in channels:
        await db.execute("""
            INSERT INTO payment_channels (id, name, type, status, fee, min_amount, max_amount, today_volume, wallet_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, c)

    # Settlement records
    settlements = [
        ('STL001', '金沙娱乐', '2026-02-24 ~ 2026-03-02', 1250000, 45, 562500, 'paid', '2026-03-03 10:00'),
        ('STL002', '皇冠体育', '2026-02-24 ~ 2026-03-02', 850000, 40, 340000, 'paid', '2026-03-03 10:00'),
        ('STL003', '新濠天地', '2026-02-24 ~ 2026-03-02', 620000, 8, 49600, 'pending', ''),
        ('STL004', '澳门威尼斯', '2026-02-24 ~ 2026-03-02', 780000, 38, 296400, 'approved', ''),
    ]
    for s in settlements:
        await db.execute("""
            INSERT INTO settlement_records (settlement_id, agent, period, ggr, share_rate, amount, status, paid_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, s)

    # Financial summary
    financial = [
        ('2026-03-07', 2856000, 1245000, 125000, 1611000, 1486000),
        ('2026-03-06', 2650000, 1180000, 118000, 1470000, 1352000),
        ('2026-03-05', 2400000, 1080000, 105000, 1320000, 1215000),
        ('2026-03-04', 2800000, 1200000, 112000, 1600000, 1488000),
        ('2026-03-03', 2200000, 980000, 95000, 1220000, 1125000),
        ('2026-03-02', 2100000, 920000, 88000, 1180000, 1092000),
        ('2026-03-01', 1950000, 850000, 82000, 1100000, 1018000),
    ]
    for f in financial:
        await db.execute("""
            INSERT INTO financial_summary (date, deposit, withdrawal, bonus, ggr, ngr)
            VALUES (?, ?, ?, ?, ?, ?)
        """, f)

    # H5 promotions
    await db.executescript("""
        INSERT INTO promotions (title, title_zh, description, description_zh, image, type, start_date, end_date, status)
        VALUES
        ('首充双倍', '首充双倍', '首次充值即享双倍奖励', '首次充值即享双倍奖励，最高5000元', '/img/banners/banner-allbonus.webp', 'deposit', '2026-03-01', '2026-03-31', 1),
        ('每日返水', '每日返水', '每日0.8%返水优惠', '投注越多返水越多，每日自动发放', '/img/banners/banner-slotrekeback2.webp', 'rebate', '2026-01-01', '2026-12-31', 1),
        ('周末存送', '周末存送', '周末充值送30%', '周末充值满500即送30%，最高10000', '/img/banners/banner-yessc2.webp', 'deposit', '2026-03-01', '2026-03-31', 1);
    """)

    await db.commit()
    await db.close()

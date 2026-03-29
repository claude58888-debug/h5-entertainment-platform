import db, { initDB } from './db.js'

// Initialize tables
initDB()

// Clear existing data
const tables = [
  'admins', 'agents', 'members', 'deposits', 'withdrawals',
  'providers', 'games', 'bets', 'vip_levels', 'rakeback_config',
  'rakeback_records', 'promotions', 'messages', 'system_notifications',
  'chat_sessions', 'risk_rules', 'ip_blacklist', 'audit_logs',
  'announcements', 'payment_channels', 'settlements', 'financial_summary',
  'revenue_trend', 'system_settings', 'banners'
]
for (const t of tables) {
  db.exec(`DELETE FROM ${t}`)
}

// ===== Admin accounts =====
// Default seed credential is read from SEED_ADMIN_PWD env var, fallback for local dev only
const seedPwd = process.env.SEED_ADMIN_PWD || 'demo'
const insertAdmin = db.prepare(`INSERT INTO admins (username, password, role, display_name, status, last_login, created_at) VALUES (?,?,?,?,?,?,?)`)
const adminAccounts = [
  ['admin', seedPwd, 'superadmin', '管理员', 'active', '2026-03-07 16:00', '2025-01-01'],
  ['admin_finance', seedPwd, 'finance', '财务管理员', 'active', '2026-03-07 15:30', '2025-03-15'],
  ['admin_cs', seedPwd, 'cs', '客服管理员', 'active', '2026-03-07 14:00', '2025-06-20'],
  ['admin_risk', seedPwd, 'risk', '风控管理员', 'active', '2026-03-06 18:00', '2025-08-10'],
  ['admin_backup', seedPwd, 'admin', '备用管理员', 'inactive', '2026-01-15 10:00', '2025-12-01']
]
for (const row of adminAccounts) insertAdmin.run(...row)

// ===== Agents =====
const insertAgent = db.prepare(`INSERT INTO agents (id, brand, domain, contact, balance, status, created_at, members, month_revenue, share_mode, share_rate) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
insertAgent.run('AG001', '金沙娱乐', 'jinsha88.com', 'admin_js', 520000, 'active', '2025-08-15', 12500, 1850000, 'revenue', 45)
insertAgent.run('AG002', '皇冠体育', 'hg-sport.com', 'admin_hg', 380000, 'active', '2025-09-20', 8900, 1200000, 'revenue', 40)
insertAgent.run('AG003', '新濠天地', 'xinhaotd.com', 'admin_xh', 150000, 'active', '2025-10-05', 6200, 950000, 'turnover', 8)
insertAgent.run('AG004', '永利娱乐', 'wynn168.com', 'admin_yl', 95000, 'suspended', '2025-11-12', 4500, 620000, 'revenue', 42)
insertAgent.run('AG005', '澳门威尼斯', 'venice-mo.com', 'admin_wns', 280000, 'active', '2025-12-01', 7800, 1100000, 'revenue', 38)
insertAgent.run('AG006', '大三元', 'dsy888.com', 'admin_dsy', 5000, 'banned', '2026-01-10', 2100, 0, 'revenue', 35)

// ===== Members =====
const insertMember = db.prepare(`INSERT INTO members (id, username, agent, vip, balance, status, registered, last_login, total_deposit, total_withdraw, tags) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
insertMember.run('M10001', 'player_wang', '金沙娱乐', 6, 125000, 'active', '2025-08-20', '2026-03-07 16:30', 850000, 720000, '["高价值"]')
insertMember.run('M10002', 'lucky_star88', '皇冠体育', 4, 45000, 'active', '2025-09-15', '2026-03-07 15:45', 320000, 275000, '["活跃"]')
insertMember.run('M10003', 'dragon_888', '金沙娱乐', 8, 380000, 'active', '2025-07-10', '2026-03-07 16:28', 2500000, 2100000, '["高价值","VIP"]')
insertMember.run('M10004', 'test_user01', '新濠天地', 1, 500, 'frozen', '2026-01-20', '2026-02-15 10:00', 5000, 4500, '["风险"]')
insertMember.run('M10005', 'king_poker', '永利娱乐', 5, 78000, 'active', '2025-10-25', '2026-03-07 14:20', 560000, 480000, '["活跃"]')
insertMember.run('M10006', 'fish_lover', '澳门威尼斯', 3, 22000, 'active', '2025-11-30', '2026-03-06 22:10', 180000, 158000, '[]')
insertMember.run('M10007', 'slot_queen', '金沙娱乐', 7, 210000, 'active', '2025-08-05', '2026-03-07 16:15', 1800000, 1590000, '["高价值","VIP"]')
insertMember.run('M10008', 'newbie_2026', '皇冠体育', 1, 2000, 'active', '2026-03-01', '2026-03-07 12:00', 10000, 8000, '["新人"]')

// ===== Deposits =====
const insertDeposit = db.prepare(`INSERT INTO deposits (id, member, agent, amount, channel, status, time, tx_hash) VALUES (?,?,?,?,?,?,?,?)`)
insertDeposit.run('D20260307001', 'player_wang', '金沙娱乐', 50000, 'USDT-TRC20', 'completed', '2026-03-07 16:25', 'TxH...a8f2')
insertDeposit.run('D20260307002', 'lucky_star88', '皇冠体育', 10000, 'USDT-TRC20', 'completed', '2026-03-07 16:18', 'TxH...b3c1')
insertDeposit.run('D20260307003', 'dragon_888', '金沙娱乐', 100000, 'USDT-ERC20', 'pending', '2026-03-07 16:10', '')
insertDeposit.run('D20260307004', 'king_poker', '永利娱乐', 20000, '银行转账', 'pending', '2026-03-07 15:55', '')
insertDeposit.run('D20260307005', 'slot_queen', '金沙娱乐', 80000, 'USDT-TRC20', 'completed', '2026-03-07 15:30', 'TxH...d5e4')
insertDeposit.run('D20260307006', 'fish_lover', '澳门威尼斯', 5000, 'USDT-TRC20', 'failed', '2026-03-07 15:15', '')

// ===== Withdrawals =====
const insertWithdrawal = db.prepare(`INSERT INTO withdrawals (id, member, agent, amount, channel, status, time, address, risk_level) VALUES (?,?,?,?,?,?,?,?,?)`)
insertWithdrawal.run('W20260307001', 'player_wang', '金沙娱乐', 30000, 'USDT-TRC20', 'pending', '2026-03-07 16:28', 'TRC...x8f2', 'low')
insertWithdrawal.run('W20260307002', 'dragon_888', '金沙娱乐', 50000, 'USDT-TRC20', 'review', '2026-03-07 16:20', 'TRC...a3b1', 'high')
insertWithdrawal.run('W20260307003', 'slot_queen', '金沙娱乐', 25000, 'USDT-ERC20', 'approved', '2026-03-07 16:00', 'ERC...c4d5', 'low')
insertWithdrawal.run('W20260307004', 'king_poker', '永利娱乐', 15000, '银行转账', 'pending', '2026-03-07 15:45', '工商银行 ***8823', 'medium')
insertWithdrawal.run('W20260307005', 'lucky_star88', '皇冠体育', 8000, 'USDT-TRC20', 'completed', '2026-03-07 14:30', 'TRC...e6f7', 'low')

// ===== Game Providers =====
const insertProvider = db.prepare(`INSERT INTO providers (id, name, category, games, status, api_health, balance, response_time, api_key, api_latency) VALUES (?,?,?,?,?,?,?,?,?,?)`)
insertProvider.run('PG', 'PG电子', 'slots', 58, 'active', 99.8, 2500000, '120ms', 'demo_key_pg', 120)
insertProvider.run('PP', 'PP电子', 'slots', 120, 'active', 99.5, 1800000, '95ms', 'demo_key_pp', 95)
insertProvider.run('CQ9', 'CQ9电子', 'slots', 85, 'active', 98.9, 1200000, '150ms', 'demo_key_cq9', 150)
insertProvider.run('EVO', 'EVO真人', 'live', 35, 'active', 99.9, 3500000, '80ms', 'demo_key_evo', 80)
insertProvider.run('AG', 'AG真人', 'live', 28, 'active', 99.2, 2800000, '110ms', 'demo_key_ag', 110)
insertProvider.run('JDB', 'JDB捕鱼', 'fishing', 15, 'active', 99.1, 800000, '130ms', 'demo_key_jdb', 130)
insertProvider.run('JILI', 'JILI', 'multi', 65, 'active', 99.6, 1500000, '105ms', 'demo_key_jili', 105)
insertProvider.run('FC', 'FC游戏', 'multi', 38, 'active', 98.5, 600000, '160ms', 'demo_key_fc', 160)
insertProvider.run('WM', 'WM真人', 'live', 20, 'maintenance', 0, 2000000, 'N/A', 'demo_key_wm', 0)

// ===== Games =====
const insertGame = db.prepare(`INSERT INTO games (id, name, provider, category, status, rtp, is_hot, is_new, bets, revenue) VALUES (?,?,?,?,?,?,?,?,?,?)`)
insertGame.run('G001', '麻将胡了2', 'PG', '电子游戏', 'active', 96.8, 1, 0, 125000, 520000)
insertGame.run('G002', '极速糖果1000', 'PP', '电子游戏', 'active', 96.5, 1, 1, 98000, 380000)
insertGame.run('G003', '奥林匹斯之门', 'PP', '电子游戏', 'active', 96.2, 1, 0, 87000, 310000)
insertGame.run('G004', '闪电轮盘', 'EVO', '真人视讯', 'active', 97.3, 1, 0, 76000, 280000)
insertGame.run('G005', '百家乐', 'AG', '真人视讯', 'active', 98.9, 0, 0, 150000, 250000)
insertGame.run('G006', '海洋之王', 'JDB', '捕鱼游戏', 'active', 95.5, 0, 0, 45000, 180000)
insertGame.run('G007', '招财猫', 'PG', '电子游戏', 'active', 96.0, 0, 0, 62000, 150000)
insertGame.run('G008', '德州扑克', 'FC', '棋牌游戏', 'active', 97.5, 0, 1, 35000, 120000)
insertGame.run('G009', '加拿大4.2-4.6', 'TCG', '彩票', 'active', 97.0, 0, 0, 55000, 200000)
insertGame.run('G010', 'CR皇冠体育', 'CROWN', '体育竞猜', 'active', 96.5, 0, 0, 80000, 350000)

// ===== Betting records =====
const insertBet = db.prepare(`INSERT INTO bets (id, member, game, provider, bet_amount, win_amount, time, status) VALUES (?,?,?,?,?,?,?,?)`)
insertBet.run('B001', 'player_wang', '麻将胡了2', 'PG', 500, 1200, '2026-03-07 16:29:45', 'settled')
insertBet.run('B002', 'dragon_888', '百家乐', 'AG', 10000, 0, '2026-03-07 16:29:30', 'settled')
insertBet.run('B003', 'slot_queen', '极速糖果1000', 'PP', 200, 5800, '2026-03-07 16:29:15', 'settled')
insertBet.run('B004', 'king_poker', '德州扑克', 'FC', 2000, 3500, '2026-03-07 16:28:50', 'settled')
insertBet.run('B005', 'lucky_star88', '闪电轮盘', 'EVO', 1000, 0, '2026-03-07 16:28:30', 'settled')
insertBet.run('B006', 'fish_lover', '海洋之王', 'JDB', 100, 450, '2026-03-07 16:28:10', 'settled')
insertBet.run('B007', 'newbie_2026', '麻将胡了', 'PG', 50, 0, '2026-03-07 16:27:55', 'settled')
insertBet.run('B008', 'player_wang', '奥林匹斯之门', 'PP', 300, 0, '2026-03-07 16:27:30', 'settled')

// ===== VIP Levels =====
const insertVip = db.prepare(`INSERT INTO vip_levels (level, name, upgrade_deposit, upgrade_wager, monthly_bonus, birthday_bonus, withdraw_limit) VALUES (?,?,?,?,?,?,?)`)
insertVip.run(0, '新手', 0, 0, 0, 0, '50000')
insertVip.run(1, '青铜', 5000, 50000, 88, 188, '100000')
insertVip.run(2, '白银', 20000, 200000, 288, 588, '200000')
insertVip.run(3, '黄金', 50000, 500000, 588, 1288, '500000')
insertVip.run(4, '铂金', 100000, 1000000, 1288, 2888, '1000000')
insertVip.run(5, '钻石', 200000, 2000000, 2888, 5888, '2000000')
insertVip.run(6, '至尊', 500000, 5000000, 5888, 12888, '5000000')
insertVip.run(7, '王者', 1000000, 10000000, 12888, 28888, '10000000')
insertVip.run(8, '传奇', 2000000, 20000000, 28888, 58888, 'unlimited')

// ===== Rakeback Config =====
const insertRakeback = db.prepare(`INSERT INTO rakeback_config (game_type, rate, min_bet, status) VALUES (?,?,?,?)`)
insertRakeback.run('电子游戏', 0.8, 10, 'active')
insertRakeback.run('真人视讯', 0.5, 50, 'active')
insertRakeback.run('体育竞猜', 0.3, 100, 'active')
insertRakeback.run('捕鱼游戏', 1.0, 10, 'active')
insertRakeback.run('棋牌游戏', 0.6, 20, 'active')
insertRakeback.run('彩票', 0.2, 50, 'inactive')

// ===== Rakeback Records =====
const insertRakebackRecord = db.prepare(`INSERT INTO rakeback_records (member, game_type, bet_amount, rakeback_amount, time, status) VALUES (?,?,?,?,?,?)`)
insertRakebackRecord.run('player_wang', '电子游戏', 50000, 400, '2026-03-07 00:00', 'settled')
insertRakebackRecord.run('dragon_888', '真人视讯', 120000, 600, '2026-03-07 00:00', 'settled')
insertRakebackRecord.run('slot_queen', '电子游戏', 80000, 640, '2026-03-07 00:00', 'settled')
insertRakebackRecord.run('king_poker', '棋牌游戏', 30000, 180, '2026-03-07 00:00', 'settled')
insertRakebackRecord.run('lucky_star88', '真人视讯', 25000, 125, '2026-03-07 00:00', 'settled')
insertRakebackRecord.run('fish_lover', '捕鱼游戏', 15000, 150, '2026-03-06 00:00', 'settled')

// ===== Promotions =====
const insertPromo = db.prepare(`INSERT INTO promotions (id, name, type, status, start_time, end_time, min_deposit, bonus_rate, wagering, max_bonus, participants) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
insertPromo.run('ACT001', '首充双倍', '首充奖励', 'active', '2026-03-01', '2026-03-31', 100, 100, 20, 5000, 856)
insertPromo.run('ACT002', '每日返水', '返水优惠', 'active', '2026-01-01', '2026-12-31', 0, 0.8, 1, 50000, 12500)
insertPromo.run('ACT003', '周末存送', '存送优惠', 'active', '2026-03-01', '2026-03-31', 500, 30, 15, 10000, 2340)
insertPromo.run('ACT004', '签到有礼', '签到奖励', 'active', '2026-01-01', '2026-12-31', 0, 0, 5, 888, 8900)
insertPromo.run('ACT005', '邀请好友', '邀请奖励', 'active', '2026-01-01', '2026-12-31', 0, 0, 10, 2000, 3200)
insertPromo.run('ACT006', '幸运转盘', '幸运转盘', 'inactive', '2026-02-01', '2026-02-28', 100, 0, 8, 8888, 5600)

// ===== Messages =====
const insertMessage = db.prepare(`INSERT INTO messages (title, target, target_type, type, status, sent_at, content) VALUES (?,?,?,?,?,?,?)`)
insertMessage.run('欢迎加入平台', '全部用户', 'all', 'mail', 'sent', '2026-03-07 10:00:00', '感谢您注册成为我们的会员，祝您游戏愉快！')
insertMessage.run('VIP升级通知', 'VIP3+', 'vip', 'notification', 'read', '2026-03-06 15:30:00', '恭喜您升级为VIP3会员，可享受更多专属权益。')
insertMessage.run('首充活动提醒', '全部用户', 'all', 'promotion', 'sent', '2026-03-05 09:00:00', '首充100%奖励活动进行中，充值即享双倍！')
insertMessage.run('提现审核通知', 'player_wang', 'user', 'notification', 'read', '2026-03-07 16:30:00', '您的提现申请 ¥30,000 正在审核中，请耐心等待。')
insertMessage.run('系统维护通知', '全部用户', 'all', 'mail', 'sent', '2026-03-04 18:00:00', '3月8日凌晨2:00-4:00系统维护，届时无法使用。')
insertMessage.run('VIP月度红包到账', 'VIP5+', 'vip', 'promotion', 'unread', '2026-03-01 00:00:00', '尊敬的VIP会员，您的月度红包已发放，请查收。')

// ===== System Notifications =====
const insertSysNotif = db.prepare(`INSERT INTO system_notifications (title, level, content, created_at) VALUES (?,?,?,?)`)
insertSysNotif.run('大额提现预警', 'warning', '会员 user_8823 发起大额提现 ¥50,000', '2026-03-07 16:28:00')
insertSysNotif.run('疑似多开账号', 'error', '检测到疑似多开账号 IP: 103.45.67.89，涉及3个账户', '2026-03-07 16:25:00')
insertSysNotif.run('代理余额不足', 'warning', '代理 "金沙娱乐" 余额不足 ¥10,000，请及时充值', '2026-03-07 16:18:00')
insertSysNotif.run('API响应延迟', 'warning', 'PG电子 API 响应延迟升高 (>2s)，请关注', '2026-03-07 16:12:00')
insertSysNotif.run('每日结算完成', 'info', '2026-03-06 返水结算已完成，共结算 ¥125,000', '2026-03-07 00:05:00')
insertSysNotif.run('新代理注册', 'info', '新代理 "大三元" 已完成注册审核', '2026-03-06 14:00:00')

// ===== Chat Sessions =====
const insertChat = db.prepare(`INSERT INTO chat_sessions (id, username, subject, status, last_message, updated_at) VALUES (?,?,?,?,?,?)`)
insertChat.run('CS001', 'player_wang', '提现未到账', 'active', '您好，我的提现已经2小时了还没到账', '2026-03-07 16:35:00')
insertChat.run('CS002', 'lucky_star88', 'VIP升级咨询', 'active', '请问VIP3需要多少积分？', '2026-03-07 16:20:00')
insertChat.run('CS003', 'dragon_888', '充值优惠', 'waiting', '有没有大额充值优惠？', '2026-03-07 15:50:00')
insertChat.run('CS004', 'newbie_2026', '新手引导', 'closed', '谢谢客服的帮助！', '2026-03-07 14:00:00')
insertChat.run('CS005', 'fish_lover', '游戏异常', 'waiting', '海洋之王游戏卡住了', '2026-03-07 13:30:00')

// ===== Risk Rules =====
const insertRisk = db.prepare(`INSERT INTO risk_rules (name, description, threshold, status, triggers) VALUES (?,?,?,?,?)`)
insertRisk.run('大额提现预警', '单笔提现超过50,000元触发预警', 50000, 'active', 28)
insertRisk.run('频繁提现检测', '24小时内提现超过3次触发预警', 3, 'active', 15)
insertRisk.run('多账号IP检测', '同一IP登录超过3个账号', 3, 'active', 8)
insertRisk.run('异常投注检测', '单笔投注超过账户余额50%', 50, 'active', 42)
insertRisk.run('设备指纹异常', '同一设备注册超过2个账号', 2, 'inactive', 0)

// ===== IP Blacklist =====
const insertIP = db.prepare(`INSERT INTO ip_blacklist (ip, reason, added_by, added_time, hit_count) VALUES (?,?,?,?,?)`)
insertIP.run('103.45.67.89', '多账号操作', 'admin', '2026-03-05 10:30', 12)
insertIP.run('192.168.1.100', '恶意刷单', 'system', '2026-03-04 15:20', 5)
insertIP.run('45.67.89.123', '疑似机器人', 'admin', '2026-03-01 08:00', 28)

// ===== Audit Logs =====
const insertLog = db.prepare(`INSERT INTO audit_logs (operator, action, target, detail, time, ip) VALUES (?,?,?,?,?,?)`)
insertLog.run('superadmin', '审批提现', 'W20260307003', '审批通过 ¥25,000', '2026-03-07 16:05', '10.0.0.1')
insertLog.run('admin_finance', '充值确认', 'D20260307001', '确认到账 ¥50,000', '2026-03-07 16:02', '10.0.0.2')
insertLog.run('superadmin', '冻结账户', 'M10004', '风险账户冻结', '2026-03-07 15:50', '10.0.0.1')
insertLog.run('admin_risk', '添加IP黑名单', '103.45.67.89', '多账号操作', '2026-03-05 10:30', '10.0.0.3')
insertLog.run('superadmin', '修改代理配置', 'AG001', '分成比例 42% -> 45%', '2026-03-04 14:20', '10.0.0.1')

// ===== Announcements =====
const insertAnnouncement = db.prepare(`INSERT INTO announcements (title, content, target, status, created_at) VALUES (?,?,?,?,?)`)
insertAnnouncement.run('系统维护通知', '3月8日凌晨2:00-4:00进行系统升级维护', '全部代理', 'active', '2026-03-06')
insertAnnouncement.run('新游戏上线', 'PP电子新游戏"极速糖果2000"即将上线', '全部代理', 'active', '2026-03-05')
insertAnnouncement.run('结算周期调整', '自4月1日起，结算周期调整为每周结算', '指定代理', 'draft', '2026-03-04')

// ===== Payment Channels =====
const insertChannel = db.prepare(`INSERT INTO payment_channels (name, type, status, fee, min_amount, max_amount, today_volume, wallet_count) VALUES (?,?,?,?,?,?,?,?)`)
insertChannel.run('USDT-TRC20', 'crypto', 'active', 0, 100, 500000, 1850000, 5)
insertChannel.run('USDT-ERC20', 'crypto', 'active', 0.5, 500, 500000, 650000, 3)
insertChannel.run('银行转账', 'bank', 'active', 0, 200, 200000, 356000, 0)

// ===== Settlement Records =====
const insertSettlement = db.prepare(`INSERT INTO settlements (id, agent, period, ggr, share_rate, amount, status, paid_time) VALUES (?,?,?,?,?,?,?,?)`)
insertSettlement.run('STL001', '金沙娱乐', '2026-02-24 ~ 2026-03-02', 1250000, 45, 562500, 'paid', '2026-03-03 10:00')
insertSettlement.run('STL002', '皇冠体育', '2026-02-24 ~ 2026-03-02', 850000, 40, 340000, 'paid', '2026-03-03 10:00')
insertSettlement.run('STL003', '新濠天地', '2026-02-24 ~ 2026-03-02', 620000, 8, 49600, 'pending', '')
insertSettlement.run('STL004', '澳门威尼斯', '2026-02-24 ~ 2026-03-02', 780000, 38, 296400, 'approved', '')

// ===== Financial Summary =====
const insertFinancial = db.prepare(`INSERT INTO financial_summary (date, deposit, withdrawal, bonus, ggr, ngr) VALUES (?,?,?,?,?,?)`)
insertFinancial.run('2026-03-07', 2856000, 1245000, 125000, 1611000, 1486000)
insertFinancial.run('2026-03-06', 2650000, 1180000, 118000, 1470000, 1352000)
insertFinancial.run('2026-03-05', 2400000, 1080000, 105000, 1320000, 1215000)
insertFinancial.run('2026-03-04', 2200000, 980000, 95000, 1220000, 1125000)
insertFinancial.run('2026-03-03', 2100000, 920000, 88000, 1180000, 1092000)
insertFinancial.run('2026-03-02', 1950000, 850000, 82000, 1100000, 1018000)
insertFinancial.run('2026-03-01', 1800000, 780000, 75000, 1020000, 945000)

// ===== Revenue Trend =====
const insertTrend = db.prepare(`INSERT INTO revenue_trend (date, revenue, deposit, withdrawal) VALUES (?,?,?,?)`)
insertTrend.run('03-01', 1520000, 2100000, 980000)
insertTrend.run('03-02', 1680000, 2350000, 1050000)
insertTrend.run('03-03', 1450000, 2000000, 920000)
insertTrend.run('03-04', 1890000, 2600000, 1150000)
insertTrend.run('03-05', 1720000, 2400000, 1080000)
insertTrend.run('03-06', 1950000, 2800000, 1200000)
insertTrend.run('03-07', 1611000, 2856000, 1245000)

// ===== System Settings =====
const insertSetting = db.prepare(`INSERT INTO system_settings (key, value, category) VALUES (?,?,?)`)
insertSetting.run('site_name', '总控管理系统', 'global')
insertSetting.run('maintenance_mode', 'false', 'global')
insertSetting.run('max_withdraw_daily', '500000', 'finance')
insertSetting.run('min_deposit', '100', 'finance')
insertSetting.run('auto_approve_withdraw', '10000', 'finance')
insertSetting.run('register_enabled', 'true', 'global')
insertSetting.run('captcha_enabled', 'true', 'security')
insertSetting.run('ip_whitelist_enabled', 'false', 'security')
insertSetting.run('two_factor_enabled', 'true', 'security')
insertSetting.run('session_timeout', '30', 'security')

// ===== Banners =====
const insertBanner = db.prepare(`INSERT INTO banners (title, image, link, sort, status, start_time, end_time) VALUES (?,?,?,?,?,?,?)`)
insertBanner.run('首充双倍活动', '/img/banners/banner-allbonus.webp', '/activity/ACT001', 1, 'active', '2026-03-01', '2026-03-31')
insertBanner.run('新游推荐', '/img/banners/banner-yessc2.webp', '/games/slots', 2, 'active', '2026-03-01', '2026-04-30')
insertBanner.run('返水优惠', '/img/banners/banner-slotrekeback2.webp', '/activity/ACT002', 3, 'active', '2026-01-01', '2026-12-31')

console.log('Database seeded successfully!')
db.close()

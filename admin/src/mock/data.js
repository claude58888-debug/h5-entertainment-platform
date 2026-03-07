// ============ MOCK DATA FOR ADMIN BACKEND ============

// KPI Data
export const superDashboardKPI = {
  totalMembers: 128456,
  todayNewMembers: 342,
  onlineNow: 1893,
  todayDeposit: 2856000,
  todayWithdrawal: 1245000,
  todayProfit: 1611000
}

export const agentDashboardKPI = {
  todayNewMembers: 58,
  todayActiveMembers: 423,
  onlineCount: 156,
  todayDeposit: 486000,
  todayWithdrawal: 198000,
  todayProfit: 288000,
  weeklyProfit: 1850000,
  monthlyProfit: 7200000,
  creditBalance: 500000,
  pendingWithdrawals: 12,
  pendingTickets: 5
}

// Revenue trend 7 days
export const revenueTrend = [
  { date: '03-01', revenue: 1520000, deposit: 2100000, withdrawal: 980000 },
  { date: '03-02', revenue: 1680000, deposit: 2350000, withdrawal: 1050000 },
  { date: '03-03', revenue: 1450000, deposit: 2000000, withdrawal: 920000 },
  { date: '03-04', revenue: 1890000, deposit: 2600000, withdrawal: 1150000 },
  { date: '03-05', revenue: 1720000, deposit: 2400000, withdrawal: 1080000 },
  { date: '03-06', revenue: 1950000, deposit: 2800000, withdrawal: 1200000 },
  { date: '03-07', revenue: 1611000, deposit: 2856000, withdrawal: 1245000 }
]

// Top 5 games by GGR
export const topGamesGGR = [
  { name: '麻将胡了2', ggr: 520000 },
  { name: '极速糖果1000', ggr: 380000 },
  { name: '奥林匹斯之门', ggr: 310000 },
  { name: '闪电轮盘', ggr: 280000 },
  { name: '百家乐', ggr: 250000 }
]

// Deposit by channel
export const depositByChannel = [
  { name: 'USDT-TRC20', value: 1850000 },
  { name: 'USDT-ERC20', value: 650000 },
  { name: '银行转账', value: 356000 }
]

// Alerts
export const realtimeAlerts = [
  { id: 1, type: 'warning', text: '会员 user_8823 发起大额提现 ¥50,000', time: '2分钟前', level: 'high' },
  { id: 2, type: 'danger', text: '检测到疑似多开账号 IP: 103.45.67.89', time: '5分钟前', level: 'high' },
  { id: 3, type: 'warning', text: '代理 "金沙娱乐" 余额不足 ¥10,000', time: '12分钟前', level: 'medium' },
  { id: 4, type: 'info', text: 'PG电子 API 响应延迟升高 (>2s)', time: '18分钟前', level: 'medium' },
  { id: 5, type: 'warning', text: '会员 user_5521 连续提现3次，累计 ¥80,000', time: '25分钟前', level: 'high' }
]

// Agents list
export const agentsList = [
  { id: 'AG001', brand: '金沙娱乐', domain: 'jinsha88.com', contact: 'admin_js', balance: 520000, status: 'active', created: '2025-08-15', members: 12500, monthRevenue: 1850000, shareMode: 'revenue', shareRate: 45 },
  { id: 'AG002', brand: '皇冠体育', domain: 'hg-sport.com', contact: 'admin_hg', balance: 380000, status: 'active', created: '2025-09-20', members: 8900, monthRevenue: 1200000, shareMode: 'revenue', shareRate: 40 },
  { id: 'AG003', brand: '新濠天地', domain: 'xinhaotd.com', contact: 'admin_xh', balance: 150000, status: 'active', created: '2025-10-05', members: 6200, monthRevenue: 950000, shareMode: 'turnover', shareRate: 8 },
  { id: 'AG004', brand: '永利娱乐', domain: 'wynn168.com', contact: 'admin_yl', balance: 95000, status: 'suspended', created: '2025-11-12', members: 4500, monthRevenue: 620000, shareMode: 'revenue', shareRate: 42 },
  { id: 'AG005', brand: '澳门威尼斯', domain: 'venice-mo.com', contact: 'admin_wns', balance: 280000, status: 'active', created: '2025-12-01', members: 7800, monthRevenue: 1100000, shareMode: 'revenue', shareRate: 38 },
  { id: 'AG006', brand: '大三元', domain: 'dsy888.com', contact: 'admin_dsy', balance: 5000, status: 'banned', created: '2026-01-10', members: 2100, monthRevenue: 0, shareMode: 'revenue', shareRate: 35 }
]

// Members list
export const membersList = [
  { id: 'M10001', username: 'player_wang', agent: '金沙娱乐', vip: 6, balance: 125000, status: 'active', registered: '2025-08-20', lastLogin: '2026-03-07 16:30', totalDeposit: 850000, totalWithdraw: 720000, tags: ['高价值'] },
  { id: 'M10002', username: 'lucky_star88', agent: '皇冠体育', vip: 4, balance: 45000, status: 'active', registered: '2025-09-15', lastLogin: '2026-03-07 15:45', totalDeposit: 320000, totalWithdraw: 275000, tags: ['活跃'] },
  { id: 'M10003', username: 'dragon_888', agent: '金沙娱乐', vip: 8, balance: 380000, status: 'active', registered: '2025-07-10', lastLogin: '2026-03-07 16:28', totalDeposit: 2500000, totalWithdraw: 2100000, tags: ['高价值', 'VIP'] },
  { id: 'M10004', username: 'test_user01', agent: '新濠天地', vip: 1, balance: 500, status: 'frozen', registered: '2026-01-20', lastLogin: '2026-02-15 10:00', totalDeposit: 5000, totalWithdraw: 4500, tags: ['风险'] },
  { id: 'M10005', username: 'king_poker', agent: '永利娱乐', vip: 5, balance: 78000, status: 'active', registered: '2025-10-25', lastLogin: '2026-03-07 14:20', totalDeposit: 560000, totalWithdraw: 480000, tags: ['活跃'] },
  { id: 'M10006', username: 'fish_lover', agent: '澳门威尼斯', vip: 3, balance: 22000, status: 'active', registered: '2025-11-30', lastLogin: '2026-03-06 22:10', totalDeposit: 180000, totalWithdraw: 158000, tags: [] },
  { id: 'M10007', username: 'slot_queen', agent: '金沙娱乐', vip: 7, balance: 210000, status: 'active', registered: '2025-08-05', lastLogin: '2026-03-07 16:15', totalDeposit: 1800000, totalWithdraw: 1590000, tags: ['高价值', 'VIP'] },
  { id: 'M10008', username: 'newbie_2026', agent: '皇冠体育', vip: 1, balance: 2000, status: 'active', registered: '2026-03-01', lastLogin: '2026-03-07 12:00', totalDeposit: 10000, totalWithdraw: 8000, tags: ['新人'] }
]

// Deposit orders
export const depositOrders = [
  { id: 'D20260307001', member: 'player_wang', agent: '金沙娱乐', amount: 50000, channel: 'USDT-TRC20', status: 'completed', time: '2026-03-07 16:25', txHash: 'TxH...a8f2' },
  { id: 'D20260307002', member: 'lucky_star88', agent: '皇冠体育', amount: 10000, channel: 'USDT-TRC20', status: 'completed', time: '2026-03-07 16:18', txHash: 'TxH...b3c1' },
  { id: 'D20260307003', member: 'dragon_888', agent: '金沙娱乐', amount: 100000, channel: 'USDT-ERC20', status: 'pending', time: '2026-03-07 16:10', txHash: '' },
  { id: 'D20260307004', member: 'king_poker', agent: '永利娱乐', amount: 20000, channel: '银行转账', status: 'pending', time: '2026-03-07 15:55', txHash: '' },
  { id: 'D20260307005', member: 'slot_queen', agent: '金沙娱乐', amount: 80000, channel: 'USDT-TRC20', status: 'completed', time: '2026-03-07 15:30', txHash: 'TxH...d5e4' },
  { id: 'D20260307006', member: 'fish_lover', agent: '澳门威尼斯', amount: 5000, channel: 'USDT-TRC20', status: 'failed', time: '2026-03-07 15:15', txHash: '' }
]

// Withdrawal orders
export const withdrawalOrders = [
  { id: 'W20260307001', member: 'player_wang', agent: '金沙娱乐', amount: 30000, channel: 'USDT-TRC20', status: 'pending', time: '2026-03-07 16:28', address: 'TRC...x8f2', riskLevel: 'low' },
  { id: 'W20260307002', member: 'dragon_888', agent: '金沙娱乐', amount: 50000, channel: 'USDT-TRC20', status: 'review', time: '2026-03-07 16:20', address: 'TRC...a3b1', riskLevel: 'high' },
  { id: 'W20260307003', member: 'slot_queen', agent: '金沙娱乐', amount: 25000, channel: 'USDT-ERC20', status: 'approved', time: '2026-03-07 16:00', address: 'ERC...c4d5', riskLevel: 'low' },
  { id: 'W20260307004', member: 'king_poker', agent: '永利娱乐', amount: 15000, channel: '银行转账', status: 'pending', time: '2026-03-07 15:45', address: '工商银行 ***8823', riskLevel: 'medium' },
  { id: 'W20260307005', member: 'lucky_star88', agent: '皇冠体育', amount: 8000, channel: 'USDT-TRC20', status: 'completed', time: '2026-03-07 14:30', address: 'TRC...e6f7', riskLevel: 'low' }
]

// Game providers
export const gameProviders = [
  { id: 'PG', name: 'PG电子', category: 'slots', games: 58, status: 'active', apiHealth: 99.8, balance: 2500000, responseTime: '120ms' },
  { id: 'PP', name: 'PP电子', category: 'slots', games: 120, status: 'active', apiHealth: 99.5, balance: 1800000, responseTime: '95ms' },
  { id: 'CQ9', name: 'CQ9电子', category: 'slots', games: 85, status: 'active', apiHealth: 98.9, balance: 1200000, responseTime: '150ms' },
  { id: 'EVO', name: 'EVO真人', category: 'live', games: 35, status: 'active', apiHealth: 99.9, balance: 3500000, responseTime: '80ms' },
  { id: 'AG', name: 'AG真人', category: 'live', games: 28, status: 'active', apiHealth: 99.2, balance: 2800000, responseTime: '110ms' },
  { id: 'JDB', name: 'JDB捕鱼', category: 'fishing', games: 15, status: 'active', apiHealth: 99.1, balance: 800000, responseTime: '130ms' },
  { id: 'JILI', name: 'JILI', category: 'multi', games: 65, status: 'active', apiHealth: 99.6, balance: 1500000, responseTime: '105ms' },
  { id: 'FC', name: 'FC游戏', category: 'multi', games: 38, status: 'active', apiHealth: 98.5, balance: 600000, responseTime: '160ms' },
  { id: 'WM', name: 'WM真人', category: 'live', games: 20, status: 'maintenance', apiHealth: 0, balance: 2000000, responseTime: 'N/A' }
]

// Games list
export const gamesList = [
  { id: 'G001', name: '麻将胡了2', provider: 'PG', category: '电子游戏', status: 'active', rtp: 96.8, isHot: true, isNew: false, bets: 125000, revenue: 520000 },
  { id: 'G002', name: '极速糖果1000', provider: 'PP', category: '电子游戏', status: 'active', rtp: 96.5, isHot: true, isNew: true, bets: 98000, revenue: 380000 },
  { id: 'G003', name: '奥林匹斯之门', provider: 'PP', category: '电子游戏', status: 'active', rtp: 96.2, isHot: true, isNew: false, bets: 87000, revenue: 310000 },
  { id: 'G004', name: '闪电轮盘', provider: 'EVO', category: '真人视讯', status: 'active', rtp: 97.3, isHot: true, isNew: false, bets: 76000, revenue: 280000 },
  { id: 'G005', name: '百家乐', provider: 'AG', category: '真人视讯', status: 'active', rtp: 98.9, isHot: false, isNew: false, bets: 150000, revenue: 250000 },
  { id: 'G006', name: '海洋之王', provider: 'JDB', category: '捕鱼游戏', status: 'active', rtp: 95.5, isHot: false, isNew: false, bets: 45000, revenue: 180000 },
  { id: 'G007', name: '招财猫', provider: 'PG', category: '电子游戏', status: 'active', rtp: 96.0, isHot: false, isNew: false, bets: 62000, revenue: 150000 },
  { id: 'G008', name: '德州扑克', provider: 'FC', category: '棋牌游戏', status: 'active', rtp: 97.5, isHot: false, isNew: true, bets: 35000, revenue: 120000 },
  { id: 'G009', name: '加拿大4.2-4.6', provider: 'TCG', category: '彩票', status: 'active', rtp: 97.0, isHot: false, isNew: false, bets: 55000, revenue: 200000 },
  { id: 'G010', name: 'CR皇冠体育', provider: 'CROWN', category: '体育竞猜', status: 'active', rtp: 96.5, isHot: false, isNew: false, bets: 80000, revenue: 350000 }
]

// Betting records
export const bettingRecords = [
  { id: 'B001', member: 'player_wang', game: '麻将胡了2', provider: 'PG', betAmount: 500, winAmount: 1200, time: '2026-03-07 16:29:45', status: 'settled' },
  { id: 'B002', member: 'dragon_888', game: '百家乐', provider: 'AG', betAmount: 10000, winAmount: 0, time: '2026-03-07 16:29:30', status: 'settled' },
  { id: 'B003', member: 'slot_queen', game: '极速糖果1000', provider: 'PP', betAmount: 200, winAmount: 5800, time: '2026-03-07 16:29:15', status: 'settled' },
  { id: 'B004', member: 'king_poker', game: '德州扑克', provider: 'FC', betAmount: 2000, winAmount: 3500, time: '2026-03-07 16:28:50', status: 'settled' },
  { id: 'B005', member: 'lucky_star88', game: '闪电轮盘', provider: 'EVO', betAmount: 1000, winAmount: 0, time: '2026-03-07 16:28:30', status: 'settled' },
  { id: 'B006', member: 'fish_lover', game: '海洋之王', provider: 'JDB', betAmount: 100, winAmount: 450, time: '2026-03-07 16:28:10', status: 'settled' },
  { id: 'B007', member: 'newbie_2026', game: '麻将胡了', provider: 'PG', betAmount: 50, winAmount: 0, time: '2026-03-07 16:27:55', status: 'settled' },
  { id: 'B008', member: 'player_wang', game: '奥林匹斯之门', provider: 'PP', betAmount: 300, winAmount: 0, time: '2026-03-07 16:27:30', status: 'settled' }
]

// Risk rules
export const riskRules = [
  { id: 1, name: '大额提现预警', description: '单笔提现超过50,000元触发预警', threshold: 50000, status: 'active', triggers: 28 },
  { id: 2, name: '频繁提现检测', description: '24小时内提现超过3次触发预警', threshold: 3, status: 'active', triggers: 15 },
  { id: 3, name: '多账号IP检测', description: '同一IP登录超过3个账号', threshold: 3, status: 'active', triggers: 8 },
  { id: 4, name: '异常投注检测', description: '单笔投注超过账户余额50%', threshold: 50, status: 'active', triggers: 42 },
  { id: 5, name: '设备指纹异常', description: '同一设备注册超过2个账号', threshold: 2, status: 'inactive', triggers: 0 }
]

// IP blacklist
export const ipBlacklist = [
  { ip: '103.45.67.89', reason: '多账号操作', addedBy: 'admin', addedTime: '2026-03-05 10:30', hitCount: 12 },
  { ip: '192.168.1.100', reason: '恶意刷单', addedBy: 'system', addedTime: '2026-03-04 15:20', hitCount: 5 },
  { ip: '45.67.89.123', reason: '疑似机器人', addedBy: 'admin', addedTime: '2026-03-01 08:00', hitCount: 28 }
]

// Admin accounts
export const adminAccounts = [
  { id: 1, username: 'superadmin', role: '超级管理员', status: 'active', lastLogin: '2026-03-07 16:00', created: '2025-01-01' },
  { id: 2, username: 'admin_finance', role: '财务管理员', status: 'active', lastLogin: '2026-03-07 15:30', created: '2025-03-15' },
  { id: 3, username: 'admin_cs', role: '客服管理员', status: 'active', lastLogin: '2026-03-07 14:00', created: '2025-06-20' },
  { id: 4, username: 'admin_risk', role: '风控管理员', status: 'active', lastLogin: '2026-03-06 18:00', created: '2025-08-10' },
  { id: 5, username: 'admin_backup', role: '备用管理员', status: 'inactive', lastLogin: '2026-01-15 10:00', created: '2025-12-01' }
]

// Audit logs
export const auditLogs = [
  { id: 1, operator: 'superadmin', action: '审批提现', target: 'W20260307003', detail: '审批通过 ¥25,000', time: '2026-03-07 16:05', ip: '10.0.0.1' },
  { id: 2, operator: 'admin_finance', action: '充值确认', target: 'D20260307001', detail: '确认到账 ¥50,000', time: '2026-03-07 16:02', ip: '10.0.0.2' },
  { id: 3, operator: 'superadmin', action: '冻结账户', target: 'M10004', detail: '风险账户冻结', time: '2026-03-07 15:50', ip: '10.0.0.1' },
  { id: 4, operator: 'admin_risk', action: '添加IP黑名单', target: '103.45.67.89', detail: '多账号操作', time: '2026-03-05 10:30', ip: '10.0.0.3' },
  { id: 5, operator: 'superadmin', action: '修改代理配置', target: 'AG001', detail: '分成比例 42% -> 45%', time: '2026-03-04 14:20', ip: '10.0.0.1' }
]

// Announcements
export const announcements = [
  { id: 1, title: '系统维护通知', content: '3月8日凌晨2:00-4:00进行系统升级维护', target: '全部代理', status: 'active', created: '2026-03-06' },
  { id: 2, title: '新游戏上线', content: 'PP电子新游戏"极速糖果2000"即将上线', target: '全部代理', status: 'active', created: '2026-03-05' },
  { id: 3, title: '结算周期调整', content: '自4月1日起，结算周期调整为每周结算', target: '指定代理', status: 'draft', created: '2026-03-04' }
]

// Promotions / Activities
export const activities = [
  { id: 'ACT001', name: '首充双倍', type: '首充奖励', status: 'active', startTime: '2026-03-01', endTime: '2026-03-31', minDeposit: 100, bonusRate: 100, wagering: 20, maxBonus: 5000, participants: 856 },
  { id: 'ACT002', name: '每日返水', type: '返水优惠', status: 'active', startTime: '2026-01-01', endTime: '2026-12-31', minDeposit: 0, bonusRate: 0.8, wagering: 1, maxBonus: 50000, participants: 12500 },
  { id: 'ACT003', name: '周末存送', type: '存送优惠', status: 'active', startTime: '2026-03-01', endTime: '2026-03-31', minDeposit: 500, bonusRate: 30, wagering: 15, maxBonus: 10000, participants: 2340 },
  { id: 'ACT004', name: '签到有礼', type: '签到奖励', status: 'active', startTime: '2026-01-01', endTime: '2026-12-31', minDeposit: 0, bonusRate: 0, wagering: 5, maxBonus: 888, participants: 8900 },
  { id: 'ACT005', name: '邀请好友', type: '邀请奖励', status: 'active', startTime: '2026-01-01', endTime: '2026-12-31', minDeposit: 0, bonusRate: 0, wagering: 10, maxBonus: 2000, participants: 3200 },
  { id: 'ACT006', name: '幸运转盘', type: '幸运转盘', status: 'inactive', startTime: '2026-02-01', endTime: '2026-02-28', minDeposit: 100, bonusRate: 0, wagering: 8, maxBonus: 8888, participants: 5600 }
]

// Banners
export const banners = [
  { id: 1, title: '首充双倍活动', image: '/img/banners/banner-allbonus.webp', link: '/activity/ACT001', sort: 1, status: 'active', startTime: '2026-03-01', endTime: '2026-03-31' },
  { id: 2, title: '新游推荐', image: '/img/banners/banner-yessc2.webp', link: '/games/slots', sort: 2, status: 'active', startTime: '2026-03-01', endTime: '2026-04-30' },
  { id: 3, title: '返水优惠', image: '/img/banners/banner-slotrekeback2.webp', link: '/activity/ACT002', sort: 3, status: 'active', startTime: '2026-01-01', endTime: '2026-12-31' }
]

// VIP levels
export const vipLevels = [
  { level: 0, name: '新手', upgradeDeposit: 0, upgradeWager: 0, monthlyBonus: 0, birthdayBonus: 0, withdrawLimit: 50000 },
  { level: 1, name: '青铜', upgradeDeposit: 5000, upgradeWager: 50000, monthlyBonus: 88, birthdayBonus: 188, withdrawLimit: 100000 },
  { level: 2, name: '白银', upgradeDeposit: 20000, upgradeWager: 200000, monthlyBonus: 288, birthdayBonus: 588, withdrawLimit: 200000 },
  { level: 3, name: '黄金', upgradeDeposit: 50000, upgradeWager: 500000, monthlyBonus: 588, birthdayBonus: 1288, withdrawLimit: 500000 },
  { level: 4, name: '铂金', upgradeDeposit: 100000, upgradeWager: 1000000, monthlyBonus: 1288, birthdayBonus: 2888, withdrawLimit: 1000000 },
  { level: 5, name: '钻石', upgradeDeposit: 200000, upgradeWager: 2000000, monthlyBonus: 2888, birthdayBonus: 5888, withdrawLimit: 2000000 },
  { level: 6, name: '至尊', upgradeDeposit: 500000, upgradeWager: 5000000, monthlyBonus: 5888, birthdayBonus: 12888, withdrawLimit: 5000000 },
  { level: 7, name: '王者', upgradeDeposit: 1000000, upgradeWager: 10000000, monthlyBonus: 12888, birthdayBonus: 28888, withdrawLimit: 10000000 },
  { level: 8, name: '传奇', upgradeDeposit: 2000000, upgradeWager: 20000000, monthlyBonus: 28888, birthdayBonus: 58888, withdrawLimit: 'unlimited' }
]

// Referral data
export const referralData = {
  totalReferrals: 3200,
  totalCommission: 856000,
  activeReferrers: 450,
  levels: [
    { level: 1, rate: 10, members: 2800 },
    { level: 2, rate: 5, members: 850 },
    { level: 3, rate: 2, members: 120 }
  ],
  topReferrers: [
    { username: 'player_wang', referrals: 156, commission: 125000 },
    { username: 'dragon_888', referrals: 98, commission: 85000 },
    { username: 'slot_queen', referrals: 75, commission: 62000 },
    { username: 'king_poker', referrals: 45, commission: 38000 },
    { username: 'lucky_star88', referrals: 32, commission: 25000 }
  ]
}

// Payment channels
export const paymentChannels = [
  { id: 1, name: 'USDT-TRC20', type: 'crypto', status: 'active', fee: 0, minAmount: 100, maxAmount: 500000, todayVolume: 1850000, walletCount: 5 },
  { id: 2, name: 'USDT-ERC20', type: 'crypto', status: 'active', fee: 0.5, minAmount: 500, maxAmount: 500000, todayVolume: 650000, walletCount: 3 },
  { id: 3, name: '银行转账', type: 'bank', status: 'active', fee: 0, minAmount: 200, maxAmount: 200000, todayVolume: 356000, walletCount: 0 }
]

// Settlement records
export const settlementRecords = [
  { id: 'STL001', agent: '金沙娱乐', period: '2026-02-24 ~ 2026-03-02', ggr: 1250000, shareRate: 45, amount: 562500, status: 'paid', paidTime: '2026-03-03 10:00' },
  { id: 'STL002', agent: '皇冠体育', period: '2026-02-24 ~ 2026-03-02', ggr: 850000, shareRate: 40, amount: 340000, status: 'paid', paidTime: '2026-03-03 10:00' },
  { id: 'STL003', agent: '新濠天地', period: '2026-02-24 ~ 2026-03-02', ggr: 620000, shareRate: 8, amount: 49600, status: 'pending', paidTime: '' },
  { id: 'STL004', agent: '澳门威尼斯', period: '2026-02-24 ~ 2026-03-02', ggr: 780000, shareRate: 38, amount: 296400, status: 'approved', paidTime: '' }
]

// Financial summary
export const financialSummary = [
  { date: '2026-03-07', deposit: 2856000, withdrawal: 1245000, bonus: 125000, ggr: 1611000, ngr: 1486000 },
  { date: '2026-03-06', deposit: 2650000, withdrawal: 1180000, bonus: 118000, ggr: 1470000, ngr: 1352000 },
  { date: '2026-03-05', deposit: 2400000, withdrawal: 1080000, bonus: 105000, ggr: 1320000, ngr: 1215000 },
  { date: '2026-03-04', deposit: 2800000, withdrawal: 1200000, bonus: 130000, ggr: 1600000, ngr: 1470000 },
  { date: '2026-03-03', deposit: 2200000, withdrawal: 980000, bonus: 98000, ggr: 1220000, ngr: 1122000 },
  { date: '2026-03-02', deposit: 2500000, withdrawal: 1100000, bonus: 112000, ggr: 1400000, ngr: 1288000 },
  { date: '2026-03-01', deposit: 2350000, withdrawal: 1050000, bonus: 108000, ggr: 1300000, ngr: 1192000 }
]

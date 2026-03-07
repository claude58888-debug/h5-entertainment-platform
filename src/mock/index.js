export const mockBanners = [
  { id: 1, title: '每日百充 最多赠送588U', subtitle: 'Daily Deposit Bonus', link: '/promotions', gradient: 'linear-gradient(135deg, #6c5ce7, #a855f7)' },
  { id: 2, title: '每周有效投注', subtitle: 'Weekly Valid Bets Bonus', link: '/promotions', gradient: 'linear-gradient(135deg, #f0c040, #e67e22)' },
  { id: 3, title: '电子游戏闯关', subtitle: 'Slot Game Challenge', link: '/promotions', gradient: 'linear-gradient(135deg, #00b894, #00cec9)' },
  { id: 4, title: '棋牌游戏闯关', subtitle: 'Chess Game Challenge', link: '/promotions', gradient: 'linear-gradient(135deg, #e17055, #d63031)' },
  { id: 5, title: '首充好礼', subtitle: 'First Deposit Gift', link: '/promotions', gradient: 'linear-gradient(135deg, #6c5ce7, #fd79a8)' }
]

export const mockAnnouncements = [
  { id: 1, content: '请大家认准平台唯一客服 @RRYL666 @RRYL555 我们客服绝对不会让会员私下转账，请大家不要上外面冒充客服的骗子的当，充值请一定到人人娱乐官网首页自助充值。' }
]

export const mockGames = [
  { id: 1, name: '极速糖果1000', category: 'slots', provider: 'PRAGMATIC PLAY', image: 'https://picsum.photos/240/320?random=10', hot: true },
  { id: 2, name: '麻将胡了2', category: 'slots', provider: 'PGSOFT', image: 'https://picsum.photos/240/320?random=11', hot: true },
  { id: 3, name: '麻将胡了', category: 'slots', provider: 'PGSOFT', image: 'https://picsum.photos/240/320?random=12', hot: true },
  { id: 4, name: '奥林匹斯之门', category: 'slots', provider: 'PRAGMATIC PLAY', image: 'https://picsum.photos/240/320?random=13', hot: true },
  { id: 5, name: '甜入蜜境', category: 'slots', provider: 'PRAGMATIC PLAY', image: 'https://picsum.photos/240/320?random=14', hot: true },
  { id: 6, name: '招财猫', category: 'slots', provider: 'PGSOFT', image: 'https://picsum.photos/240/320?random=15', hot: true },
  { id: 7, name: '幸运尼柯', category: 'slots', provider: 'PGSOFT', image: 'https://picsum.photos/240/320?random=16', hot: true },
  { id: 8, name: '淘金热', category: 'slots', provider: 'PRAGMATIC PLAY', image: 'https://picsum.photos/240/320?random=17', hot: true },
  { id: 9, name: '宝石糖果', category: 'slots', provider: 'CQ9', image: 'https://picsum.photos/240/320?random=18', hot: false },
  { id: 10, name: '闪电轮盘', category: 'live', provider: 'EVO', image: 'https://picsum.photos/240/320?random=19', hot: true },
  { id: 11, name: '疯狂时间', category: 'live', provider: 'EVO', image: 'https://picsum.photos/240/320?random=20', hot: false },
  { id: 12, name: '百家乐', category: 'live', provider: 'AG', image: 'https://picsum.photos/240/320?random=21', hot: false },
  { id: 13, name: '龙虎斗', category: 'live', provider: 'SA', image: 'https://picsum.photos/240/320?random=22', hot: false },
  { id: 14, name: '海洋之王', category: 'fishing', provider: 'JDB', image: 'https://picsum.photos/240/320?random=23', hot: true },
  { id: 15, name: '欢乐捕鱼', category: 'fishing', provider: 'JILI', image: 'https://picsum.photos/240/320?random=24', hot: false },
  { id: 16, name: '捕鱼大战', category: 'fishing', provider: 'FC', image: 'https://picsum.photos/240/320?random=25', hot: false },
  { id: 17, name: '加拿大4.2-4.6', category: 'lottery', provider: 'TCG', image: 'https://picsum.photos/240/320?random=26', hot: true },
  { id: 18, name: '极速彩票', category: 'lottery', provider: 'VR', image: 'https://picsum.photos/240/320?random=27', hot: false },
  { id: 19, name: 'CR皇冠体育', category: 'sports', provider: 'CROWN', image: 'https://picsum.photos/240/320?random=28', hot: true },
  { id: 20, name: 'IM体育', category: 'sports', provider: 'IM', image: 'https://picsum.photos/240/320?random=29', hot: false },
  { id: 21, name: '德州扑克', category: 'chess', provider: 'FC', image: 'https://picsum.photos/240/320?random=30', hot: true },
  { id: 22, name: '中国象棋', category: 'chess', provider: 'JILI', image: 'https://picsum.photos/240/320?random=31', hot: false },
  { id: 23, name: '成人', category: 'video', provider: 'SEXY', image: 'https://picsum.photos/240/320?random=32', hot: true },
  { id: 24, name: '电影', category: 'video', provider: 'MOVIE', image: 'https://picsum.photos/240/320?random=33', hot: false }
]

export const mockProviders = {
  slots: [
    { id: 'PG', name: 'PG电子', gameCount: 58, gradient: 'linear-gradient(135deg, #1a237e, #4a148c)', label: 'PGSOFT' },
    { id: 'PP', name: 'PP电子', gameCount: 120, gradient: 'linear-gradient(135deg, #004d40, #00695c)', label: 'PRAGMATIC PLAY' },
    { id: 'CQ9', name: 'CQ9电子', gameCount: 85, gradient: 'linear-gradient(135deg, #b71c1c, #880e4f)', label: 'CQ9' }
  ],
  live: [
    { id: 'PP', name: 'PP真人', gameCount: 45, gradient: 'linear-gradient(135deg, #311b92, #4527a0)', label: 'PRAGMATIC PLAY' },
    { id: 'EVO', name: 'EVO真人', gameCount: 32, gradient: 'linear-gradient(135deg, #0d47a1, #1565c0)', label: 'EVOLUTION' },
    { id: 'AG', name: 'AG真人', gameCount: 28, gradient: 'linear-gradient(135deg, #e65100, #bf360c)', label: 'ASIA GAMING' }
  ],
  fishing: [
    { id: 'JDB', name: 'JDB捕鱼', gameCount: 15, gradient: 'linear-gradient(135deg, #01579b, #0277bd)', label: 'JDB' },
    { id: 'FC', name: 'FC捕鱼', gameCount: 12, gradient: 'linear-gradient(135deg, #1b5e20, #2e7d32)', label: 'FC GAMING' },
    { id: 'JILI', name: 'JILI捕鱼', gameCount: 20, gradient: 'linear-gradient(135deg, #f57f17, #f9a825)', label: 'JILI' }
  ],
  lottery: [
    { id: 'TCG1', name: '加拿大4.2-4.6', gameCount: 30, gradient: 'linear-gradient(135deg, #4a148c, #6a1b9a)', label: '彩票' },
    { id: 'TCG2', name: '加拿大高倍网盘', gameCount: 18, gradient: 'linear-gradient(135deg, #880e4f, #ad1457)', label: '彩票' },
    { id: 'HASH', name: '1分哈希', gameCount: 10, gradient: 'linear-gradient(135deg, #1a237e, #283593)', label: '哈希' }
  ],
  sports: [
    { id: 'CROWN', name: 'CR皇冠体育', gameCount: 1, gradient: 'linear-gradient(135deg, #b71c1c, #c62828)', label: 'CROWN SPORTS' }
  ],
  chess: [
    { id: 'FC', name: 'FC棋牌', gameCount: 10, gradient: 'linear-gradient(135deg, #004d40, #00695c)', label: 'FC GAMING' },
    { id: 'JILI', name: 'JILI棋牌', gameCount: 8, gradient: 'linear-gradient(135deg, #e65100, #ef6c00)', label: 'JILI' }
  ]
}

export const mockPromotions = [
  { id: 1, title: '每日百充 最多赠送588U', description: '每日充值即可获得丰厚奖金，最高赠送588U，3倍流水即可提现', type: 'deposit' },
  { id: 2, title: '每周有效投注', description: '每周有效投注达标，最高可获得12888U奖金', type: 'cashback' },
  { id: 3, title: 'VIP专属特权', description: 'VIP会员专享特权，升级即送红包，月月领红包', type: 'vip' },
  { id: 4, title: '邀请好友 赚取佣金', description: '邀请好友注册，获得下级0.6%投注佣金', type: 'referral' },
  { id: 5, title: '首充好礼', description: '首次充值即送丰厚奖励，最高赠送588U', type: 'event' }
]

export const mockTasks = [
  { id: 1, title: '每日签到', description: '每日登录平台签到', reward: 5, rewardUnit: 'USDT', progress: 1, target: 1, claimed: false },
  { id: 2, title: '投注10次', description: '今日投注至少10次', reward: 10, rewardUnit: 'USDT', progress: 3, target: 10, claimed: false },
  { id: 3, title: '邀请好友', description: '邀请一位新朋友注册', reward: 50, rewardUnit: 'USDT', progress: 0, target: 1, claimed: false }
]

export const mockUser = {
  id: 10086,
  phone: '138****8888',
  nickname: 'Player10086',
  avatar: 'https://picsum.photos/100/100?random=60',
  vipLevel: 3,
  balance: 1288.50,
  inviteCode: 'ABC123'
}

export const mockCategories = [
  { id: 'home', label: '首页', icon: 'home' },
  { id: 'hot', label: '热门', icon: 'fire' },
  { id: 'slots', label: '电子游戏', icon: 'slots' },
  { id: 'live', label: '真人视讯', icon: 'live' },
  { id: 'fishing', label: '捕鱼游戏', icon: 'fish' },
  { id: 'lottery', label: '彩票', icon: 'lottery' },
  { id: 'sports', label: '体育竞猜', icon: 'sports' },
  { id: 'chess', label: '棋牌游戏', icon: 'chess' },
  { id: 'video', label: '人人影视', icon: 'video' }
]

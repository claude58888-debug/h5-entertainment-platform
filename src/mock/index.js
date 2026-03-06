export const mockBanners = [
  { id: 1, image: 'https://picsum.photos/750/360?random=1', title: 'Welcome Bonus 100%', link: '/promotions' },
  { id: 2, image: 'https://picsum.photos/750/360?random=2', title: 'VIP Exclusive Rewards', link: '/promotions' },
  { id: 3, image: 'https://picsum.photos/750/360?random=3', title: 'Daily Cashback 10%', link: '/promotions' },
  { id: 4, image: 'https://picsum.photos/750/360?random=4', title: 'Refer & Earn', link: '/invite' },
  { id: 5, image: 'https://picsum.photos/750/360?random=5', title: 'Lucky Spin Event', link: '/promotions' }
]

export const mockAnnouncements = [
  { id: 1, content: '🎉 Welcome bonus up to 100%! Register now and claim your reward!' },
  { id: 2, content: '🔥 New game launched: Fortune Tiger by PG Soft! Try it now!' },
  { id: 3, content: '💰 Weekend cashback promotion: Get 15% cashback on all losses!' }
]

export const mockGames = [
  { id: 1, name: 'Fortune Tiger', category: 'slots', provider: 'PG', image: 'https://picsum.photos/240/320?random=10', hot: true },
  { id: 2, name: 'Sweet Bonanza', category: 'slots', provider: 'PP', image: 'https://picsum.photos/240/320?random=11', hot: true },
  { id: 3, name: 'Lucky Neko', category: 'slots', provider: 'PG', image: 'https://picsum.photos/240/320?random=12', hot: true },
  { id: 4, name: 'Gates of Olympus', category: 'slots', provider: 'PP', image: 'https://picsum.photos/240/320?random=13', hot: true },
  { id: 5, name: 'Treasure Bowl', category: 'slots', provider: 'CQ9', image: 'https://picsum.photos/240/320?random=14', hot: false },
  { id: 6, name: 'Lightning Roulette', category: 'live', provider: 'EVO', image: 'https://picsum.photos/240/320?random=15', hot: true },
  { id: 7, name: 'Crazy Time', category: 'live', provider: 'EVO', image: 'https://picsum.photos/240/320?random=16', hot: true },
  { id: 8, name: 'Baccarat Live', category: 'live', provider: 'AG', image: 'https://picsum.photos/240/320?random=17', hot: false },
  { id: 9, name: 'Dragon Tiger', category: 'live', provider: 'SA', image: 'https://picsum.photos/240/320?random=18', hot: false },
  { id: 10, name: 'Ocean King', category: 'fishing', provider: 'JDB', image: 'https://picsum.photos/240/320?random=19', hot: true },
  { id: 11, name: 'Happy Fishing', category: 'fishing', provider: 'JILI', image: 'https://picsum.photos/240/320?random=20', hot: true },
  { id: 12, name: 'Fishing War', category: 'fishing', provider: 'FC', image: 'https://picsum.photos/240/320?random=21', hot: false },
  { id: 13, name: 'Mark Six', category: 'lottery', provider: 'TCG', image: 'https://picsum.photos/240/320?random=22', hot: true },
  { id: 14, name: 'Speed Lotto', category: 'lottery', provider: 'VR', image: 'https://picsum.photos/240/320?random=23', hot: false },
  { id: 15, name: 'Crown Sports', category: 'sports', provider: 'CROWN', image: 'https://picsum.photos/240/320?random=24', hot: true },
  { id: 16, name: 'IM Sports', category: 'sports', provider: 'IM', image: 'https://picsum.photos/240/320?random=25', hot: false },
  { id: 17, name: 'Texas Hold\'em', category: 'chess', provider: 'FC', image: 'https://picsum.photos/240/320?random=26', hot: true },
  { id: 18, name: 'Chinese Chess', category: 'chess', provider: 'JILI', image: 'https://picsum.photos/240/320?random=27', hot: false },
  { id: 19, name: 'Adult Live', category: 'video', provider: 'SEXY', image: 'https://picsum.photos/240/320?random=28', hot: true },
  { id: 20, name: 'Movie Zone', category: 'video', provider: 'MOVIE', image: 'https://picsum.photos/240/320?random=29', hot: false }
]

export const mockProviders = {
  slots: [
    { id: 'PG', name: 'PG Soft', logo: 'https://picsum.photos/160/80?random=30', gameCount: 58 },
    { id: 'PP', name: 'Pragmatic Play', logo: 'https://picsum.photos/160/80?random=31', gameCount: 120 },
    { id: 'CQ9', name: 'CQ9 Gaming', logo: 'https://picsum.photos/160/80?random=32', gameCount: 85 }
  ],
  live: [
    { id: 'EVO', name: 'Evolution', logo: 'https://picsum.photos/160/80?random=33', gameCount: 45 },
    { id: 'AG', name: 'Asia Gaming', logo: 'https://picsum.photos/160/80?random=34', gameCount: 32 },
    { id: 'SA', name: 'SA Gaming', logo: 'https://picsum.photos/160/80?random=35', gameCount: 28 }
  ],
  fishing: [
    { id: 'JDB', name: 'JDB', logo: 'https://picsum.photos/160/80?random=36', gameCount: 15 },
    { id: 'FC', name: 'FC Gaming', logo: 'https://picsum.photos/160/80?random=37', gameCount: 12 },
    { id: 'JILI', name: 'JILI', logo: 'https://picsum.photos/160/80?random=38', gameCount: 20 }
  ],
  lottery: [
    { id: 'TCG', name: 'TCG Lottery', logo: 'https://picsum.photos/160/80?random=39', gameCount: 30 },
    { id: 'VR', name: 'VR Lottery', logo: 'https://picsum.photos/160/80?random=40', gameCount: 18 }
  ],
  sports: [
    { id: 'CROWN', name: 'Crown Sports', logo: 'https://picsum.photos/160/80?random=41', gameCount: 1 }
  ],
  chess: [
    { id: 'FC', name: 'FC Gaming', logo: 'https://picsum.photos/160/80?random=42', gameCount: 10 },
    { id: 'JILI', name: 'JILI', logo: 'https://picsum.photos/160/80?random=43', gameCount: 8 }
  ]
}

export const mockPromotions = [
  {
    id: 1,
    title: 'Welcome Bonus 100%',
    description: 'Get 100% bonus on your first deposit up to 1000 USDT',
    image: 'https://picsum.photos/750/360?random=50',
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    type: 'deposit'
  },
  {
    id: 2,
    title: 'Daily Cashback 10%',
    description: 'Receive 10% cashback on daily losses, no wagering required',
    image: 'https://picsum.photos/750/360?random=51',
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    type: 'cashback'
  },
  {
    id: 3,
    title: 'VIP Exclusive',
    description: 'VIP members enjoy exclusive rewards and privileges',
    image: 'https://picsum.photos/750/360?random=52',
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    type: 'vip'
  },
  {
    id: 4,
    title: 'Refer & Earn',
    description: 'Invite friends and earn 20% commission on their bets',
    image: 'https://picsum.photos/750/360?random=53',
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    type: 'referral'
  },
  {
    id: 5,
    title: 'Lucky Spin',
    description: 'Spin the wheel daily for a chance to win big prizes',
    image: 'https://picsum.photos/750/360?random=54',
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    type: 'event'
  }
]

export const mockTasks = [
  {
    id: 1,
    title: 'Daily Login',
    description: 'Login to the platform daily',
    reward: 5,
    rewardUnit: 'USDT',
    progress: 1,
    target: 1,
    claimed: false
  },
  {
    id: 2,
    title: 'Place 10 Bets',
    description: 'Place at least 10 bets today',
    reward: 10,
    rewardUnit: 'USDT',
    progress: 3,
    target: 10,
    claimed: false
  },
  {
    id: 3,
    title: 'Invite a Friend',
    description: 'Invite a new friend to register',
    reward: 50,
    rewardUnit: 'USDT',
    progress: 0,
    target: 1,
    claimed: false
  }
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
  { id: 'home', key: 'tab.home', icon: '🏠' },
  { id: 'hot', key: 'home.hotGames', icon: '🔥' },
  { id: 'slots', key: 'home.slots', icon: '🎰' },
  { id: 'live', key: 'home.live', icon: '🎲' },
  { id: 'fishing', key: 'home.fishing', icon: '🐟' },
  { id: 'lottery', key: 'home.lottery', icon: '🎱' },
  { id: 'sports', key: 'home.sports', icon: '⚽' },
  { id: 'chess', key: 'home.chess', icon: '♟️' },
  { id: 'video', key: 'home.video', icon: '🎬' }
]

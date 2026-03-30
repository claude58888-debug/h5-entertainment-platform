import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/common/LoginPage.vue'),
    meta: { title: '登录' }
  },
  // Super Admin routes
  {
    path: '/super',
    component: () => import('@/components/AdminLayout.vue'),
    meta: { role: 'superadmin' },
    children: [
      { path: '', redirect: '/super/dashboard' },
      { path: 'dashboard', name: 'SuperDashboard', component: () => import('@/views/super/dashboard/DashboardPage.vue'), meta: { title: '仪表盘', icon: 'Odometer' } },
      { path: 'agents', name: 'AgentList', component: () => import('@/views/super/agents/AgentListPage.vue'), meta: { title: '代理列表', icon: 'UserFilled' } },
      { path: 'agents/create', name: 'AgentCreate', component: () => import('@/views/super/agents/AgentCreatePage.vue'), meta: { title: '创建代理', parent: 'AgentList' } },
      { path: 'agents/:id', name: 'AgentDetail', component: () => import('@/views/super/agents/AgentDetailPage.vue'), meta: { title: '代理详情', parent: 'AgentList' } },
      { path: 'members', name: 'SuperMembers', component: () => import('@/views/super/members/MemberListPage.vue'), meta: { title: '会员管理', icon: 'User' } },
      { path: 'finance/deposits', name: 'SuperDeposits', component: () => import('@/views/super/finance/DepositsPage.vue'), meta: { title: '充值订单', icon: 'Wallet' } },
      { path: 'finance/deposit', name: 'DepositManage', component: () => import('@/views/super/finance/DepositManagePage.vue'), meta: { title: '充值管理' } },
      { path: 'finance/withdrawals', name: 'SuperWithdrawals', component: () => import('@/views/super/finance/WithdrawalsPage.vue'), meta: { title: '提现订单' } },
      { path: 'finance/withdraw', name: 'WithdrawManage', component: () => import('@/views/super/finance/WithdrawManagePage.vue'), meta: { title: '提现管理' } },
      { path: 'finance/channels', name: 'PaymentChannels', component: () => import('@/views/super/finance/ChannelsPage.vue'), meta: { title: '支付通道' } },
      { path: 'finance/report', name: 'FinanceReport', component: () => import('@/views/super/finance/ReportPage.vue'), meta: { title: '财务报表' } },
      { path: 'finance/report-enhanced', name: 'FinanceReportEnhanced', component: () => import('@/views/super/finance/FinanceReportPage.vue'), meta: { title: '财务报表增强' } },
      { path: 'finance/balance-adjust', name: 'BalanceAdjust', component: () => import('@/views/super/finance/BalanceAdjustPage.vue'), meta: { title: '余额调整' } },
      { path: 'games/providers', name: 'GameProviders', component: () => import('@/views/super/games/ProvidersPage.vue'), meta: { title: '游戏厂商', icon: 'GameController' } },
      { path: 'games/list', name: 'GameList', component: () => import('@/views/super/games/GameListPage.vue'), meta: { title: '游戏列表' } },
      { path: 'games/bets', name: 'BettingRecords', component: () => import('@/views/super/games/BetsPage.vue'), meta: { title: '投注记录' } },
      { path: 'games/stats', name: 'GameStats', component: () => import('@/views/super/games/GameStatsPage.vue'), meta: { title: '游戏统计' } },
      { path: 'vip', name: 'VipManage', component: () => import('@/views/super/vip/VipManagePage.vue'), meta: { title: 'VIP管理', icon: 'Trophy' } },
      { path: 'rakeback', name: 'RakebackManage', component: () => import('@/views/super/rakeback/RakebackPage.vue'), meta: { title: '返水管理', icon: 'Coin' } },
      { path: 'promotions', name: 'SuperPromotions', component: () => import('@/views/super/promotions/PromotionsPage.vue'), meta: { title: '活动管理', icon: 'Present' } },
      { path: 'agents/settlement', name: 'AgentSettlement', component: () => import('@/views/super/agents/AgentSettlementPage.vue'), meta: { title: '代理结算', parent: 'AgentList' } },
      { path: 'messages', name: 'MessageCenter', component: () => import('@/views/super/messages/MessageCenterPage.vue'), meta: { title: '消息中心', icon: 'ChatDotRound' } },
      { path: 'risk', name: 'SuperRisk', component: () => import('@/views/super/risk/RiskPage.vue'), meta: { title: '风控管理', icon: 'Warning' } },
      { path: 'compliance', name: 'ComplianceDashboard', component: () => import('@/views/super/compliance/ComplianceDashboardPage.vue'), meta: { title: '合规总览', icon: 'DocumentChecked' } },
      { path: 'compliance/kyc', name: 'KycManagement', component: () => import('@/views/super/compliance/KycManagementPage.vue'), meta: { title: 'KYC管理', parent: 'ComplianceDashboard' } },
      { path: 'compliance/aml', name: 'AmlMonitoring', component: () => import('@/views/super/compliance/AmlMonitoringPage.vue'), meta: { title: 'AML监控', parent: 'ComplianceDashboard' } },
      { path: 'compliance/exclusion', name: 'SelfExclusion', component: () => import('@/views/super/compliance/SelfExclusionPage.vue'), meta: { title: '自我排除', parent: 'ComplianceDashboard' } },
      { path: 'compliance/settings', name: 'ComplianceSettings', component: () => import('@/views/super/compliance/ComplianceSettingsPage.vue'), meta: { title: '负责任博彩', parent: 'ComplianceDashboard' } },
      { path: 'system/admins', name: 'AdminAccounts', component: () => import('@/views/super/system/AdminsPage.vue'), meta: { title: '管理员', icon: 'Setting' } },
      { path: 'system/logs', name: 'AuditLogs', component: () => import('@/views/super/system/LogsPage.vue'), meta: { title: '操作日志' } },
      { path: 'system/announcements', name: 'Announcements', component: () => import('@/views/super/system/AnnouncementsPage.vue'), meta: { title: '公告管理' } },
      { path: 'system/settings', name: 'SystemSettings', component: () => import('@/views/super/system/SettingsPage.vue'), meta: { title: '系统设置' } }
    ]
  },
  // Agent Admin routes
  {
    path: '/agent',
    component: () => import('@/components/AdminLayout.vue'),
    meta: { role: 'agent' },
    children: [
      { path: '', redirect: '/agent/dashboard' },
      { path: 'dashboard', name: 'AgentDashboard', component: () => import('@/views/agent/dashboard/DashboardPage.vue'), meta: { title: '仪表盘', icon: 'Odometer' } },
      { path: 'members', name: 'AgentMembers', component: () => import('@/views/agent/members/MemberListPage.vue'), meta: { title: '会员管理', icon: 'User' } },
      { path: 'members/:id', name: 'AgentMemberDetail', component: () => import('@/views/agent/members/MemberDetailPage.vue'), meta: { title: '会员详情', parent: 'AgentMembers' } },
      { path: 'finance/deposits', name: 'AgentDeposits', component: () => import('@/views/agent/finance/DepositsPage.vue'), meta: { title: '充值订单', icon: 'Wallet' } },
      { path: 'finance/withdrawals', name: 'AgentWithdrawals', component: () => import('@/views/agent/finance/WithdrawalsPage.vue'), meta: { title: '提现订单' } },
      { path: 'finance/flow', name: 'FundFlow', component: () => import('@/views/agent/finance/FundFlowPage.vue'), meta: { title: '资金流水' } },
      { path: 'games', name: 'AgentGames', component: () => import('@/views/agent/games/GameListPage.vue'), meta: { title: '游戏管理', icon: 'Trophy' } },
      { path: 'games/bets', name: 'AgentBets', component: () => import('@/views/agent/games/BetsPage.vue'), meta: { title: '投注记录' } },
      { path: 'promotions', name: 'Promotions', component: () => import('@/views/agent/promotions/ActivityListPage.vue'), meta: { title: '活动管理', icon: 'Present' } },
      { path: 'promotions/create', name: 'CreateActivity', component: () => import('@/views/agent/promotions/CreateActivityPage.vue'), meta: { title: '创建活动', parent: 'Promotions' } },
      { path: 'promotions/vip', name: 'VIPConfig', component: () => import('@/views/agent/promotions/VIPConfigPage.vue'), meta: { title: 'VIP配置' } },
      { path: 'content/banners', name: 'BannerManage', component: () => import('@/views/agent/content/BannersPage.vue'), meta: { title: 'Banner管理', icon: 'Picture' } },
      { path: 'content/announcements', name: 'AgentAnnouncements', component: () => import('@/views/agent/content/AnnouncementsPage.vue'), meta: { title: '公告管理' } },
      { path: 'content/messages', name: 'Messages', component: () => import('@/views/agent/content/MessagesPage.vue'), meta: { title: '站内信' } },
      { path: 'referral', name: 'Referral', component: () => import('@/views/agent/referral/ReferralPage.vue'), meta: { title: '推广管理', icon: 'Share' } },
      { path: 'risk', name: 'AgentRisk', component: () => import('@/views/agent/risk/RiskPage.vue'), meta: { title: '风控管理', icon: 'Warning' } },
      { path: 'reports', name: 'Reports', component: () => import('@/views/agent/reports/ReportsPage.vue'), meta: { title: '数据报表', icon: 'DataAnalysis' } },
      { path: 'settings', name: 'AgentSettings', component: () => import('@/views/agent/settings/SettingsPage.vue'), meta: { title: '账户设置', icon: 'Setting' } }
    ]
  },
  { path: '/', redirect: '/login' },
  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
  history: createWebHashHistory('/admin/'),
  routes
})

router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('admin_user') || 'null')
  if (to.path !== '/login' && !user) {
    next('/login')
  } else if (to.path === '/login' && user) {
    next(user.role === 'superadmin' ? '/super/dashboard' : '/agent/dashboard')
  } else {
    next()
  }
})

export default router

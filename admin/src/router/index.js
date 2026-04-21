import { createRouter, createWebHashHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

NProgress.configure({ showSpinner: false, trickleSpeed: 120, minimum: 0.1 })

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/super/LoginPage.vue'),
    meta: { title: '登录', public: true },
  },
  // Super Admin
  {
    path: '/super',
    component: () => import('@/components/AdminLayout.vue'),
    meta: { role: 'superadmin' },
    children: [
      { path: '', redirect: '/super/dashboard' },
      { path: 'dashboard', name: 'SuperDashboard', component: () => import('@/views/super/DashboardPage.vue'), meta: { title: '仪表盘', icon: 'Odometer', permission: 'dashboard:view' } },
      { path: 'agents', name: 'AgentList', component: () => import('@/views/super/agents/AgentListPage.vue'), meta: { title: '代理列表', icon: 'UserFilled', permission: 'agents:view' } },
      { path: 'agents/create', name: 'AgentCreate', component: () => import('@/views/super/agents/AgentCreatePage.vue'), meta: { title: '创建代理', parent: 'AgentList', permission: 'agents:create' } },
      { path: 'agents/:id', name: 'AgentDetail', component: () => import('@/views/super/agents/AgentDetailPage.vue'), meta: { title: '代理详情', parent: 'AgentList', permission: 'agents:view' } },
      { path: 'agents/settlement', name: 'AgentSettlement', component: () => import('@/views/super/agents/AgentSettlementPage.vue'), meta: { title: '代理结算', parent: 'AgentList', permission: 'agents:view' } },
      { path: 'members', name: 'SuperMembers', component: () => import('@/views/super/members/MemberListPage.vue'), meta: { title: '会员管理', icon: 'User', permission: 'members:view' } },
      { path: 'finance/deposits', name: 'SuperDeposits', component: () => import('@/views/super/finance/DepositsPage.vue'), meta: { title: '充值订单', icon: 'Wallet', permission: 'finance:view' } },
      { path: 'finance/deposit', name: 'DepositManage', component: () => import('@/views/super/finance/DepositManagePage.vue'), meta: { title: '充值管理', permission: 'finance:approve' } },
      { path: 'finance/withdrawals', name: 'SuperWithdrawals', component: () => import('@/views/super/finance/WithdrawalsPage.vue'), meta: { title: '提现订单', permission: 'finance:view' } },
      { path: 'finance/withdraw', name: 'WithdrawManage', component: () => import('@/views/super/finance/WithdrawManagePage.vue'), meta: { title: '提现管理', permission: 'finance:approve' } },
      { path: 'finance/channels', name: 'PaymentChannels', component: () => import('@/views/super/finance/ChannelsPage.vue'), meta: { title: '支付通道', permission: 'finance:view' } },
      { path: 'finance/report', name: 'FinanceReport', component: () => import('@/views/super/finance/ReportPage.vue'), meta: { title: '财务报表', permission: 'finance:view' } },
      { path: 'finance/report-enhanced', name: 'FinanceReportEnhanced', component: () => import('@/views/super/finance/FinanceReportPage.vue'), meta: { title: '财务报表增强', permission: 'finance:view' } },
      { path: 'finance/balance-adjust', name: 'BalanceAdjust', component: () => import('@/views/super/finance/BalanceAdjustPage.vue'), meta: { title: '余额调整', permission: 'finance:adjust' } },
      { path: 'games/providers', name: 'GameProviders', component: () => import('@/views/super/games/ProvidersPage.vue'), meta: { title: '游戏厂商', icon: 'GameController', permission: 'games:view' } },
      { path: 'games/list', name: 'GameList', component: () => import('@/views/super/games/GameListPage.vue'), meta: { title: '游戏列表', permission: 'games:view' } },
      { path: 'games/bets', name: 'BettingRecords', component: () => import('@/views/super/games/BetsPage.vue'), meta: { title: '投注记录', permission: 'games:view' } },
      { path: 'games/stats', name: 'GameStats', component: () => import('@/views/super/games/GameStatsPage.vue'), meta: { title: '游戏统计', permission: 'games:view' } },
      { path: 'vip', name: 'VipManage', component: () => import('@/views/super/vip/VipManagePage.vue'), meta: { title: 'VIP管理', icon: 'Trophy', permission: 'vip:view' } },
      { path: 'rakeback', name: 'RakebackManage', component: () => import('@/views/super/rakeback/RakebackPage.vue'), meta: { title: '返水管理', icon: 'Coin', permission: 'rakeback:view' } },
      { path: 'promotions', name: 'SuperPromotions', component: () => import('@/views/super/promotions/PromotionsPage.vue'), meta: { title: '活动管理', icon: 'Present', permission: 'promotions:view' } },
      { path: 'messages', name: 'MessageCenter', component: () => import('@/views/super/messages/MessageCenterPage.vue'), meta: { title: '消息中心', icon: 'ChatDotRound', permission: 'messages:view' } },
      { path: 'risk', name: 'SuperRisk', component: () => import('@/views/super/risk/RiskPage.vue'), meta: { title: '风控管理', icon: 'Warning', permission: 'risk:view' } },
      { path: 'compliance', name: 'ComplianceDashboard', component: () => import('@/views/super/compliance/ComplianceDashboardPage.vue'), meta: { title: '合规总览', icon: 'DocumentChecked', permission: 'compliance:view' } },
      { path: 'compliance/kyc', name: 'KycManagement', component: () => import('@/views/super/compliance/KycManagementPage.vue'), meta: { title: 'KYC管理', parent: 'ComplianceDashboard', permission: 'compliance:view' } },
      { path: 'compliance/aml', name: 'AmlMonitoring', component: () => import('@/views/super/compliance/AmlMonitoringPage.vue'), meta: { title: 'AML监控', parent: 'ComplianceDashboard', permission: 'compliance:view' } },
      { path: 'compliance/exclusion', name: 'SelfExclusion', component: () => import('@/views/super/compliance/SelfExclusionPage.vue'), meta: { title: '自我排除', parent: 'ComplianceDashboard', permission: 'compliance:view' } },
      { path: 'compliance/settings', name: 'ComplianceSettings', component: () => import('@/views/super/compliance/ComplianceSettingsPage.vue'), meta: { title: '负责任博彩', parent: 'ComplianceDashboard', permission: 'compliance:manage' } },
      { path: 'system/admins', name: 'AdminAccounts', component: () => import('@/views/super/system/AdminsPage.vue'), meta: { title: '管理员', icon: 'Setting', permission: 'system:view' } },
      { path: 'system/logs', name: 'AuditLogs', component: () => import('@/views/super/system/LogsPage.vue'), meta: { title: '操作日志', permission: 'system:view' } },
      { path: 'system/announcements', name: 'Announcements', component: () => import('@/views/super/system/AnnouncementsPage.vue'), meta: { title: '公告管理', permission: 'system:edit' } },
      { path: 'system/settings', name: 'SystemSettings', component: () => import('@/views/super/system/SettingsPage.vue'), meta: { title: '系统设置', permission: 'system:edit' } },
    ],
  },
  // Agent Admin
  {
    path: '/agent',
    component: () => import('@/components/AdminLayout.vue'),
    meta: { role: 'agent' },
    children: [
      { path: '', redirect: '/agent/dashboard' },
      { path: 'dashboard', name: 'AgentDashboard', component: () => import('@/views/agent/dashboard/DashboardPage.vue'), meta: { title: '仪表盘', icon: 'Odometer', permission: 'dashboard:view' } },
      { path: 'members', name: 'AgentMembers', component: () => import('@/views/agent/members/MemberListPage.vue'), meta: { title: '会员管理', icon: 'User', permission: 'members:view' } },
      { path: 'members/:id', name: 'AgentMemberDetail', component: () => import('@/views/agent/members/MemberDetailPage.vue'), meta: { title: '会员详情', parent: 'AgentMembers', permission: 'members:view' } },
      { path: 'finance/deposits', name: 'AgentDeposits', component: () => import('@/views/agent/finance/DepositsPage.vue'), meta: { title: '充值订单', icon: 'Wallet', permission: 'finance:view' } },
      { path: 'finance/withdrawals', name: 'AgentWithdrawals', component: () => import('@/views/agent/finance/WithdrawalsPage.vue'), meta: { title: '提现订单', permission: 'finance:view' } },
      { path: 'finance/flow', name: 'FundFlow', component: () => import('@/views/agent/finance/FundFlowPage.vue'), meta: { title: '资金流水', permission: 'finance:view' } },
      { path: 'games', name: 'AgentGames', component: () => import('@/views/agent/games/GameListPage.vue'), meta: { title: '游戏管理', icon: 'Trophy', permission: 'games:view' } },
      { path: 'games/bets', name: 'AgentBets', component: () => import('@/views/agent/games/BetsPage.vue'), meta: { title: '投注记录', permission: 'games:view' } },
      { path: 'promotions', name: 'Promotions', component: () => import('@/views/agent/promotions/ActivityListPage.vue'), meta: { title: '活动管理', icon: 'Present', permission: 'promotions:view' } },
      { path: 'promotions/create', name: 'CreateActivity', component: () => import('@/views/agent/promotions/CreateActivityPage.vue'), meta: { title: '创建活动', parent: 'Promotions', permission: 'promotions:edit' } },
      { path: 'promotions/vip', name: 'VIPConfig', component: () => import('@/views/agent/promotions/VIPConfigPage.vue'), meta: { title: 'VIP配置', permission: 'promotions:edit' } },
      { path: 'content/banners', name: 'BannerManage', component: () => import('@/views/agent/content/BannersPage.vue'), meta: { title: 'Banner管理', icon: 'Picture', permission: 'content:edit' } },
      { path: 'content/announcements', name: 'AgentAnnouncements', component: () => import('@/views/agent/content/AnnouncementsPage.vue'), meta: { title: '公告管理', permission: 'content:edit' } },
      { path: 'content/messages', name: 'Messages', component: () => import('@/views/agent/content/MessagesPage.vue'), meta: { title: '站内信', permission: 'content:edit' } },
      { path: 'referral', name: 'Referral', component: () => import('@/views/agent/referral/ReferralPage.vue'), meta: { title: '推广管理', icon: 'Share', permission: 'referral:view' } },
      { path: 'risk', name: 'AgentRisk', component: () => import('@/views/agent/risk/RiskPage.vue'), meta: { title: '风控管理', icon: 'Warning', permission: 'risk:view' } },
      { path: 'reports', name: 'Reports', component: () => import('@/views/agent/reports/ReportsPage.vue'), meta: { title: '数据报表', icon: 'DataAnalysis', permission: 'reports:view' } },
      { path: 'settings', name: 'AgentSettings', component: () => import('@/views/agent/settings/SettingsPage.vue'), meta: { title: '账户设置', icon: 'Setting', permission: 'settings:view' } },
    ],
  },
  { path: '/', redirect: '/login' },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/common/LoginPage.vue'),
    meta: { title: '无权访问', public: true },
  },
  { path: '/:pathMatch(.*)*', redirect: '/login' },
]

const router = createRouter({
  history: createWebHashHistory('/admin/'),
  routes,
})

function findRouteMeta(matched) {
  // Return the nearest ancestor with a role/permission — useful when guards
  // live on the parent layout route and pages only declare permissions.
  for (let i = matched.length - 1; i >= 0; i--) {
    if (matched[i].meta?.role || matched[i].meta?.permission) return matched[i].meta
  }
  return matched[matched.length - 1]?.meta || {}
}

router.beforeEach((to, from, next) => {
  NProgress.start()
  const appStore = useAppStore()
  appStore.setPageLoading(true)

  const authStore = useAuthStore()
  const user = authStore.user

  // Public routes bypass auth
  if (to.meta?.public) {
    // If logged in, bounce away from /login
    if (to.path === '/login' && user) {
      const home = user.role === 'superadmin' ? '/super/dashboard' : '/agent/dashboard'
      return next(home)
    }
    return next()
  }

  if (!user) return next({ path: '/login', query: { redirect: to.fullPath } })

  // Role guard — declared on parent layout via meta.role
  const requiredRole = to.matched.map(r => r.meta?.role).filter(Boolean).pop()
  if (requiredRole && user.role !== requiredRole) {
    const home = user.role === 'superadmin' ? '/super/dashboard' : '/agent/dashboard'
    return next(home)
  }

  // Permission guard — declared on leaf route via meta.permission
  const perm = to.meta?.permission
  if (perm && !authStore.can(perm)) {
    return next('/403')
  }

  next()
})

router.afterEach((to) => {
  NProgress.done()
  const appStore = useAppStore()
  appStore.setPageLoading(false)

  const title = to.meta?.title
  if (title) document.title = title + ' - 大大娱乐管理后台'
})

router.onError(() => { NProgress.done() })

export default router

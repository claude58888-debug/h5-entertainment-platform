import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/HomePage.vue'),
    meta: { title: 'Home' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginPage.vue'),
    meta: { title: 'Login' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterPage.vue'),
    meta: { title: 'Register' }
  },
  {
    path: '/games/canada-28',
    name: 'Canada28',
    component: () => import('@/views/Canada28Page.vue'),
    meta: { title: 'Canada 28' }
  },
  {
    path: '/games/canada-high',
    name: 'CanadaHigh',
    component: () => import('@/views/CanadaHighPage.vue'),
    meta: { title: 'Canada High' }
  },
  {
    path: '/games/hash-1m',
    name: 'Hash1m',
    component: () => import('@/views/Hash1mPage.vue'),
    meta: { title: 'Hash 1 Min' }
  },
  {
    path: '/games/:category',
    name: 'Games',
    component: () => import('@/views/GamesPage.vue'),
    meta: { title: 'Games' }
  },
  {
    path: '/game/:id',
    name: 'GameDetail',
    component: () => import('@/views/GameDetailPage.vue'),
    meta: { requiresAuth: true, title: 'Game Detail' }
  },
  {
    path: '/deposit',
    name: 'Deposit',
    component: () => import('@/views/DepositPage.vue'),
    meta: { requiresAuth: true, title: 'Deposit' }
  },
  {
    path: '/withdraw',
    name: 'Withdraw',
    component: () => import('@/views/WithdrawPage.vue'),
    meta: { requiresAuth: true, title: 'Withdraw' }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('@/views/TasksPage.vue'),
    meta: { requiresAuth: true, title: 'Tasks' }
  },
  {
    path: '/income',
    name: 'Income',
    component: () => import('@/views/IncomePage.vue'),
    meta: { requiresAuth: true, title: 'Income' }
  },
  {
    path: '/invite',
    name: 'Invite',
    component: () => import('@/views/InvitePage.vue'),
    meta: { requiresAuth: true, title: 'Invite Friends' }
  },
  {
    path: '/promotions',
    name: 'Promotions',
    component: () => import('@/views/PromotionsPage.vue'),
    meta: { title: 'Promotions' }
  },
  {
    path: '/activities',
    name: 'Activities',
    component: () => import('@/views/ActivitiesPage.vue'),
    meta: { requiresAuth: true, title: 'Activities' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfilePage.vue'),
    meta: { requiresAuth: true, title: 'Profile' }
  },
  {
    path: '/video',
    name: 'Video',
    component: () => import('@/views/VideoPage.vue'),
    meta: { title: 'Video' }
  },
  {
    path: '/download',
    name: 'Download',
    component: () => import('@/views/DownloadPage.vue'),
    meta: { title: 'Download' }
  },
  {
    path: '/support',
    name: 'Support',
    component: () => import('@/views/SupportPage.vue'),
    meta: { title: 'Support' }
  },
  {
    path: '/recharge',
    name: 'Recharge',
    component: () => import('@/views/RechargePage.vue'),
    meta: { requiresAuth: true, title: 'Recharge' }
  },
  {
    path: '/vip',
    name: 'Vip',
    component: () => import('@/views/VipPage.vue'),
    meta: { requiresAuth: true, title: 'VIP' }
  },
  {
    path: '/safeCenter',
    name: 'SecurityCenter',
    component: () => import('@/views/SecurityCenterPage.vue'),
    meta: { requiresAuth: true, title: 'Security Center' }
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('@/views/MessagesPage.vue'),
    meta: { title: 'Messages' }
  },
  {
    path: '/bets',
    name: 'Bets',
    component: () => import('@/views/BetsPage.vue'),
    meta: { requiresAuth: true, title: 'Betting History' }
  },
  {
    path: '/monthka',
    name: 'ActivityDetail',
    component: () => import('@/views/ActivityDetailPage.vue'),
    meta: { title: 'Activity Detail' }
  },
  {
    path: '/redbag',
    name: 'RedPacket',
    component: () => import('@/views/RedPacketPage.vue'),
    meta: { requiresAuth: true, title: 'Red Packet' }
  },
  {
    path: '/pwdRedbag',
    name: 'PasswordRedPacket',
    component: () => import('@/views/PasswordRedPacketPage.vue'),
    meta: { requiresAuth: true, title: 'Password Red Packet' }
  },
  {
    path: '/report',
    name: 'Report',
    component: () => import('@/views/ReportPage.vue'),
    meta: { requiresAuth: true, title: 'Report' }
  },
  {
    path: '/transRecord',
    name: 'TransactionRecord',
    component: () => import('@/views/TransactionRecordPage.vue'),
    meta: { requiresAuth: true, title: 'Transaction Records' }
  },
  {
    path: '/orderRecordSummary',
    name: 'BetRecord',
    component: () => import('@/views/BetRecordPage.vue'),
    meta: { requiresAuth: true, title: 'Bet Records' }
  },
  {
    path: '/prizeRecord',
    name: 'PrizeRecord',
    component: () => import('@/views/PrizeRecordPage.vue'),
    meta: { requiresAuth: true, title: 'Prize Records' }
  },
  {
    path: '/buyBit',
    name: 'BuyCrypto',
    component: () => import('@/views/BuyCryptoPage.vue'),
    meta: { title: 'Buy Crypto' }
  },
  {
    path: '/softwareDownload',
    name: 'SoftwareDownload',
    component: () => import('@/views/SoftwareDownloadPage.vue'),
    meta: { title: 'Software Download' }
  },
  {
    path: '/agentCooperation',
    name: 'AgentCooperation',
    component: () => import('@/views/AgentCooperationPage.vue'),
    meta: { title: 'Agent Cooperation' }
  },
  {
    path: '/self-exclusion',
    name: 'SelfExclusion',
    component: () => import('@/views/SelfExclusionPage.vue'),
    meta: { requiresAuth: true, title: 'Self Exclusion' }
  },
  {
    path: '/limits',
    name: 'Limits',
    component: () => import('@/views/LimitsPage.vue'),
    meta: { requiresAuth: true, title: 'Deposit Limits' }
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('@/views/PrivacyPolicyPage.vue'),
    meta: { title: 'Privacy Policy' }
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('@/views/TermsPage.vue'),
    meta: { title: 'Terms of Service' }
  },
  {
    path: '/responsible-gaming',
    name: 'ResponsibleGaming',
    component: () => import('@/views/ResponsibleGamingPage.vue'),
    meta: { title: 'Responsible Gaming' }
  },
  {
    path: '/network-error',
    name: 'NetworkError',
    component: () => import('@/views/NetworkErrorPage.vue'),
    meta: { title: 'Network Error' }
  },
  {
    path: '/server-error',
    name: 'ServerError',
    component: () => import('@/views/ServerErrorPage.vue'),
    meta: { title: 'Server Error' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundPage.vue'),
    meta: { title: 'Page Not Found' }
  },
]


const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const userStore = useUserStore()
    if (!userStore.isLoggedIn) {
      userStore.showLoginModal = true
      return false
    }
  }
  return true
})

// Update document title based on route meta
router.afterEach((to) => {
  const baseTitle = 'H5 Entertainment'
  document.title = to.meta.title ? `${to.meta.title} | ${baseTitle}` : baseTitle
})

export default router

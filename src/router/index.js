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
    component: () => import('@/views/HomePage.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginPage.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterPage.vue')
  },
  {
    path: '/games/canada-28',
    name: 'Canada28',
    component: () => import('@/views/Canada28Page.vue')
  },
  {
    path: '/games/canada-high',
    name: 'CanadaHigh',
    component: () => import('@/views/CanadaHighPage.vue')
  },
  {
    path: '/games/hash-1m',
    name: 'Hash1m',
    component: () => import('@/views/Hash1mPage.vue')
  },
  {
    path: '/games/:category',
    name: 'Games',
    component: () => import('@/views/GamesPage.vue')
  },
  {
    path: '/game/:id',
    name: 'GameDetail',
    component: () => import('@/views/GameDetailPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/deposit',
    name: 'Deposit',
    component: () => import('@/views/DepositPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/withdraw',
    name: 'Withdraw',
    component: () => import('@/views/WithdrawPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('@/views/TasksPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/income',
    name: 'Income',
    component: () => import('@/views/IncomePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/invite',
    name: 'Invite',
    component: () => import('@/views/InvitePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/promotions',
    name: 'Promotions',
    component: () => import('@/views/PromotionsPage.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfilePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/video',
    name: 'Video',
    component: () => import('@/views/VideoPage.vue')
  },
  {
    path: '/download',
    name: 'Download',
    component: () => import('@/views/DownloadPage.vue')
  },
  {
    path: '/support',
    name: 'Support',
    component: () => import('@/views/SupportPage.vue')
  },
  {
    path: '/recharge',
    name: 'Recharge',
    component: () => import('@/views/RechargePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/vip',
    name: 'Vip',
    component: () => import('@/views/VipPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/safeCenter',
    name: 'SecurityCenter',
    component: () => import('@/views/SecurityCenterPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/monthka',
    name: 'ActivityDetail',
    component: () => import('@/views/ActivityDetailPage.vue')
  },
  {
    path: '/redbag',
    name: 'RedPacket',
    component: () => import('@/views/RedPacketPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pwdRedbag',
    name: 'PasswordRedPacket',
    component: () => import('@/views/PasswordRedPacketPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/report',
    name: 'Report',
    component: () => import('@/views/ReportPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/transRecord',
    name: 'TransactionRecord',
    component: () => import('@/views/TransactionRecordPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/orderRecordSummary',
    name: 'BetRecord',
    component: () => import('@/views/BetRecordPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/prizeRecord',
    name: 'PrizeRecord',
    component: () => import('@/views/PrizeRecordPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/buyBit',
    name: 'BuyCrypto',
    component: () => import('@/views/BuyCryptoPage.vue')
  },
  {
    path: '/softwareDownload',
    name: 'SoftwareDownload',
    component: () => import('@/views/SoftwareDownloadPage.vue')
  },
  {
    path: '/agentCooperation',
    name: 'AgentCooperation',
    component: () => import('@/views/AgentCooperationPage.vue')
  },
  {
    path: '/self-exclusion',
    name: 'SelfExclusion',
    component: () => import('@/views/SelfExclusionPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/limits',
    name: 'Limits',
    component: () => import('@/views/LimitsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('@/views/PrivacyPolicyPage.vue')
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('@/views/TermsPage.vue')
  },
  {
    path: '/responsible-gaming',
    name: 'ResponsibleGaming',
    component: () => import('@/views/ResponsibleGamingPage.vue')
  },
  {
    path: '/network-error',
    name: 'NetworkError',
    component: () => import('@/views/NetworkErrorPage.vue')
  },
  {
    path: '/server-error',
    name: 'ServerError',
    component: () => import('@/views/ServerErrorPage.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundPage.vue')
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

export default router

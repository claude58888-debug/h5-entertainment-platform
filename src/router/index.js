import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import i18n from '@/i18n'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/HomePage.vue'),
    meta: { titleKey: 'routes.home' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginPage.vue'),
    meta: { titleKey: 'routes.login' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterPage.vue'),
    meta: { titleKey: 'routes.register' }
  },
  {
    path: '/games/canada-28',
    name: 'Canada28',
    component: () => import('@/views/Canada28Page.vue'),
    meta: { titleKey: 'routes.canada28' }
  },
  {
    path: '/games/canada-high',
    name: 'CanadaHigh',
    component: () => import('@/views/CanadaHighPage.vue'),
    meta: { titleKey: 'routes.canadaHigh' }
  },
  {
    path: '/games/hash-1m',
    name: 'Hash1m',
    component: () => import('@/views/Hash1mPage.vue'),
    meta: { titleKey: 'routes.hash1m' }
  },
  {
    path: '/games/:category',
    name: 'Games',
    component: () => import('@/views/GamesPage.vue'),
    meta: { titleKey: 'routes.games' }
  },
  {
    path: '/game/:id',
    name: 'GameDetail',
    component: () => import('@/views/GameDetailPage.vue'),
    meta: { requiresAuth: true, titleKey: 'routes.gameDetail' }
  },
  {
    path: '/deposit',
    name: 'Deposit',
    component: () => import('@/views/DepositPage.vue'),
    meta: { requiresAuth: true, titleKey: 'routes.deposit' }
  },
  {
    path: '/withdraw',
    name: 'Withdraw',
    component: () => import('@/views/WithdrawPage.vue'),
    meta: { requiresAuth: true, titleKey: 'routes.withdraw' }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('@/views/TasksPage.vue'),
    meta: { requiresAuth: true, titleKey: 'routes.tasks' }
  },
  {
    path: '/income',
    name: 'Income',
    component: () => import('@/views/IncomePage.vue'),
    meta: { requiresAuth: true, titleKey: 'routes.income' }
  },
  {
    path: '/invite',
    name: 'Invite',
    component: () => import('@/views/InvitePage.vue'),
    meta: { requiresAuth: true, titleKey: 'routes.invite' }
  },
  {
    path: '/promotions',
    name: 'Promotions',
    component: () => import('@/views/PromotionsPage.vue'),
    meta: { titleKey: 'routes.promotions' }
  },
  {
    path: '/activities',
    name: 'Activities',
    component: () => import('@/views/ActivitiesPage.vue'),
    meta: { requiresAuth: true, titleKey: 'routes.activities' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfilePage.vue'),
    meta: { requiresAuth: true, titleKey: 'routes.profile' }
  },
  {
    path: '/video',
    name: 'Video',
    component: () => import('@/views/VideoPage.vue'),
    meta: { titleKey: 'routes.video' }
  },
  {
    path: '/download',
    name: 'Download',
    component: () => import('@/views/DownloadPage.vue'),
    meta: { titleKey: 'routes.download' }
  },
  {
    path: '/support',
    name: 'Support',
    component: () => import('@/views/SupportPage.vue'),
    meta: { titleKey: 'routes.support' }
  },
  {
    path: '/recharge',
    name: 'Recharge',
    component: () => import('@/views/RechargePage.vue'),
    meta: { requiresAuth: true, titleKey: 'routes.recharge' }
  },
  {
    path: '/vip',
    name: 'Vip',
    component: () => import('@/views/VipPage.vue'),
    meta: { requiresAuth: true, titleKey: 'routes.vip' }
  },
  {
    path: '/safeCenter',
    name: 'SecurityCenter',
    component: () => import('@/views/SecurityCenterPage.vue'),
    meta: { requiresAuth: true, titleKey: 'routes.securityCenter' }
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('@/views/MessagesPage.vue'),
    meta: { requiresAuth: true, titleKey: 'routes.messages' }
  },
  {
    path: '/bets',
    name: 'Bets',
    component: () => import('@/views/BetsPage.vue'),
    meta: { requiresAuth: true, titleKey: 'routes.bets' }
  },
  {
    path: '/monthka',
    name: 'ActivityDetail',
    component: () => import('@/views/ActivityDetailPage.vue'),
    meta: { titleKey: 'routes.activityDetail' }
  },
  {
    path: '/redbag',
    name: 'RedPacket',
    component: () => import('@/views/RedPacketPage.vue'),
    meta: { requiresAuth: true, titleKey: 'routes.redPacket' }
  },
  {
    path: '/pwdRedbag',
    name: 'PasswordRedPacket',
    component: () => import('@/views/PasswordRedPacketPage.vue'),
    meta: { requiresAuth: true, titleKey: 'routes.passwordRedPacket' }
  },
  {
    path: '/report',
    name: 'Report',
    component: () => import('@/views/ReportPage.vue'),
    meta: { requiresAuth: true, titleKey: 'routes.report' }
  },
  {
    path: '/transRecord',
    name: 'TransactionRecord',
    component: () => import('@/views/TransactionRecordPage.vue'),
    meta: { requiresAuth: true, titleKey: 'routes.transactionRecord' }
  },
  {
    path: '/orderRecordSummary',
    name: 'BetRecord',
    component: () => import('@/views/BetRecordPage.vue'),
    meta: { requiresAuth: true, titleKey: 'routes.betRecord' }
  },
  {
    path: '/prizeRecord',
    name: 'PrizeRecord',
    component: () => import('@/views/PrizeRecordPage.vue'),
    meta: { requiresAuth: true, titleKey: 'routes.prizeRecord' }
  },
  {
    path: '/buyCrypto',
    name: 'BuyCrypto',
    component: () => import('@/views/BuyCryptoPage.vue'),
    meta: { titleKey: 'routes.buyCrypto' }
  },
  {
    path: '/agentCooperation',
    name: 'AgentCooperation',
    component: () => import('@/views/AgentCooperationPage.vue'),
    meta: { titleKey: 'routes.agentCooperation' }
  },
  {
    path: '/self-exclusion',
    name: 'SelfExclusion',
    component: () => import('@/views/SelfExclusionPage.vue'),
    meta: { requiresAuth: true, titleKey: 'routes.selfExclusion' }
  },
  {
    path: '/limits',
    name: 'Limits',
    component: () => import('@/views/LimitsPage.vue'),
    meta: { requiresAuth: true, titleKey: 'routes.limits' }
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('@/views/PrivacyPolicyPage.vue'),
    meta: { titleKey: 'routes.privacy' }
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('@/views/TermsPage.vue'),
    meta: { titleKey: 'routes.terms' }
  },
  {
    path: '/responsible-gaming',
    name: 'ResponsibleGaming',
    component: () => import('@/views/ResponsibleGamingPage.vue'),
    meta: { titleKey: 'routes.responsibleGaming' }
  },
  {
    path: '/network-error',
    name: 'NetworkError',
    component: () => import('@/views/NetworkErrorPage.vue'),
    meta: { titleKey: 'routes.networkError' }
  },
  {
    path: '/server-error',
    name: 'ServerError',
    component: () => import('@/views/ServerErrorPage.vue'),
    meta: { titleKey: 'routes.serverError' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundPage.vue'),
    meta: { titleKey: 'routes.notFound' }
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

function updateDocumentTitle(to) {
  const t = i18n.global.t
  const baseTitle = t('seo.siteName')
  const pageTitle = to.meta.titleKey ? t(to.meta.titleKey) : ''
  document.title = pageTitle ? `${pageTitle} | ${baseTitle}` : baseTitle
}

// Update document title based on route meta, localized via i18n
router.afterEach((to) => {
  updateDocumentTitle(to)
})

// Re-apply title when the locale changes
if (i18n.global.locale && typeof i18n.global.locale === 'object' && 'value' in i18n.global.locale) {
  // vue-i18n v9 composition API: locale is a ref
  import('vue').then(({ watch }) => {
    watch(i18n.global.locale, () => {
      updateDocumentTitle(router.currentRoute.value)
    })
  })
}

export default router

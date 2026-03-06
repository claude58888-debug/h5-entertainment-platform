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
    component: () => import('@/views/PromotionsPage.vue'),
    meta: { requiresAuth: true }
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
  }
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

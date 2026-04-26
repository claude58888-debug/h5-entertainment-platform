<template>
  <div class="admin-layout" :class="{ dark: isDarkMode }">
    <aside class="sidebar" :class="{ 'sidebar-hidden': isMobileMenuHidden }" :style="{ width: isCollapsed ? '64px' : '220px' }" role="navigation" aria-label="管理导航">
      <div class="logo-container">
        <span v-if="!isCollapsed" class="logo-text">🎮 大大娱乐</span>
        <span v-else class="logo-icon">🎮</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        background-color="#1a1a2e"
        text-color="#a0a0b0"
        active-text-color="#e6a23c"
        router
      >
        <template v-if="isSuperAdmin">
          <el-menu-item index="/super/dashboard">
            <el-icon><Odometer /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-sub-menu index="agents-menu">
            <template #title>
              <el-icon><UserFilled /></el-icon>
              <span>代理管理</span>
            </template>
            <el-menu-item index="/super/agents">代理列表</el-menu-item>
            <el-menu-item index="/super/agents/create">创建代理</el-menu-item>
            <el-menu-item index="/super/agents/settlement">代理结算</el-menu-item>
          </el-sub-menu>
          <el-menu-item index="/super/members">
            <el-icon><User /></el-icon>
            <span>会员管理</span>
          </el-menu-item>
          <el-sub-menu index="finance-menu">
            <template #title>
              <el-icon><Wallet /></el-icon>
              <span>财务管理</span>
            </template>
            <el-menu-item index="/super/finance/deposits">充值订单</el-menu-item>
            <el-menu-item index="/super/finance/deposit">充值管理</el-menu-item>
            <el-menu-item index="/super/finance/withdrawals">提现订单</el-menu-item>
            <el-menu-item index="/super/finance/withdraw">提现管理</el-menu-item>
            <el-menu-item index="/super/finance/channels">支付通道</el-menu-item>
            <el-menu-item index="/super/finance/report">财务报表</el-menu-item>
            <el-menu-item index="/super/finance/report-enhanced">财务报表增强</el-menu-item>
            <el-menu-item index="/super/finance/balance-adjust">余额调整</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="games-menu">
            <template #title>
              <el-icon><Trophy /></el-icon>
              <span>游戏管理</span>
            </template>
            <el-menu-item index="/super/games/providers">游戏厂商</el-menu-item>
            <el-menu-item index="/super/games/list">游戏列表</el-menu-item>
            <el-menu-item index="/super/games/bets">投注记录</el-menu-item>
            <el-menu-item index="/super/games/stats">游戏统计</el-menu-item>
            <el-menu-item index="/super/games/sk7755">SK7755平台</el-menu-item>
            <el-menu-item index="/super/games/sk7755-bets">SK7755投注</el-menu-item>
          </el-sub-menu>
          <el-menu-item index="/super/vip">
            <el-icon><Trophy /></el-icon>
            <span>VIP管理</span>
          </el-menu-item>
          <el-menu-item index="/super/rakeback">
            <el-icon><Coin /></el-icon>
            <span>返水管理</span>
          </el-menu-item>
          <el-menu-item index="/super/promotions">
            <el-icon><Present /></el-icon>
            <span>活动管理</span>
          </el-menu-item>
          <el-menu-item index="/super/messages">
            <el-icon><ChatDotRound /></el-icon>
            <span>消息中心</span>
          </el-menu-item>
          <el-menu-item index="/super/risk">
            <el-icon><Warning /></el-icon>
            <span>风控管理</span>
          </el-menu-item>
          <el-sub-menu index="compliance-menu">
            <template #title>
              <el-icon><DocumentChecked /></el-icon>
              <span>合规管理</span>
            </template>
            <el-menu-item index="/super/compliance">合规总览</el-menu-item>
            <el-menu-item index="/super/compliance/kyc">KYC管理</el-menu-item>
            <el-menu-item index="/super/compliance/aml">AML监控</el-menu-item>
            <el-menu-item index="/super/compliance/exclusion">自我排除</el-menu-item>
            <el-menu-item index="/super/compliance/settings">负责任博彩</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="system-menu">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统设置</span>
            </template>
            <el-menu-item index="/super/system/admins">管理员</el-menu-item>
            <el-menu-item index="/super/system/logs">操作日志</el-menu-item>
            <el-menu-item index="/super/system/announcements">公告管理</el-menu-item>
            <el-menu-item index="/super/system/settings">系统设置</el-menu-item>
          </el-sub-menu>
        </template>

        <template v-else>
          <el-menu-item index="/agent/dashboard">
            <el-icon><Odometer /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/agent/members">
            <el-icon><User /></el-icon>
            <span>会员管理</span>
          </el-menu-item>
          <el-sub-menu index="agent-finance-menu">
            <template #title>
              <el-icon><Wallet /></el-icon>
              <span>财务管理</span>
            </template>
            <el-menu-item index="/agent/finance/deposits">充值订单</el-menu-item>
            <el-menu-item index="/agent/finance/withdrawals">提现订单</el-menu-item>
            <el-menu-item index="/agent/finance/flow">资金流水</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="agent-games-menu">
            <template #title>
              <el-icon><Trophy /></el-icon>
              <span>游戏管理</span>
            </template>
            <el-menu-item index="/agent/games">游戏列表</el-menu-item>
            <el-menu-item index="/agent/games/bets">投注记录</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="agent-promo-menu">
            <template #title>
              <el-icon><Present /></el-icon>
              <span>活动优惠</span>
            </template>
            <el-menu-item index="/agent/promotions">活动列表</el-menu-item>
            <el-menu-item index="/agent/promotions/create">创建活动</el-menu-item>
            <el-menu-item index="/agent/promotions/vip">VIP配置</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="agent-content-menu">
            <template #title>
              <el-icon><Picture /></el-icon>
              <span>内容管理</span>
            </template>
            <el-menu-item index="/agent/content/banners">Banner管理</el-menu-item>
            <el-menu-item index="/agent/content/announcements">公告管理</el-menu-item>
            <el-menu-item index="/agent/content/messages">站内信</el-menu-item>
          </el-sub-menu>
          <el-menu-item index="/agent/referral">
            <el-icon><Share /></el-icon>
            <span>推广管理</span>
          </el-menu-item>
          <el-menu-item index="/agent/risk">
            <el-icon><Warning /></el-icon>
            <span>风控管理</span>
          </el-menu-item>
          <el-menu-item index="/agent/reports">
            <el-icon><DataAnalysis /></el-icon>
            <span>数据报表</span>
          </el-menu-item>
          <el-menu-item index="/agent/settings">
            <el-icon><Setting /></el-icon>
            <span>账户设置</span>
          </el-menu-item>
        </template>
      </el-menu>
    </aside>

    <!-- Mobile sidebar overlay -->
    <div v-if="!isMobileMenuHidden" class="sidebar-overlay" @click="isMobileMenuHidden = true"></div>

    <div class="main-area">
      <div class="header">
        <div class="header-left">
          <el-button :icon="isCollapsed ? 'Expand' : 'Fold'" text @click="isCollapsed = !isCollapsed" />
          <el-breadcrumb separator="/" class="breadcrumb-area">
            <el-breadcrumb-item :to="{ path: isSuperAdmin ? '/super/dashboard' : '/agent/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute.meta?.parent">
              {{ getParentTitle() }}
            </el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentRoute.meta?.title || '' }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-button text @click="isDarkMode = !isDarkMode" :title="isDarkMode ? '切换亮色' : '切换暗色'">
            <el-icon><component :is="isDarkMode ? 'Sunny' : 'Moon'" /></el-icon>
          </el-button>
          <el-tag :type="isSuperAdmin ? 'danger' : 'warning'" size="small">
            {{ isSuperAdmin ? '超级管理员' : '代理管理员' }}
          </el-tag>
          <span style="color: #a0a0b0; font-size: 14px;">{{ authStore.user?.agentName }}</span>
          <el-dropdown @command="handleCommand">
            <span style="color: #e0e0e0; cursor: pointer; display: flex; align-items: center; gap: 4px;">
              {{ authStore.user?.username }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <div class="main-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isCollapsed = ref(false)
const isDarkMode = ref(true)
const isMobileMenuHidden = ref(true)
const isSuperAdmin = computed(() => authStore.isSuperAdmin)
const currentRoute = computed(() => route)
const activeMenu = computed(() => route.path)

// Auto-collapse sidebar on small screens
function handleResize() {
  if (window.innerWidth < 768) {
    isCollapsed.value = true
    isMobileMenuHidden.value = true
  } else {
    isMobileMenuHidden.value = false
  }
}
onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

function getParentTitle() {
  const parentName = route.meta?.parent
  if (!parentName) return ''
  const parentRoute = router.getRoutes().find(r => r.name === parentName)
  return parentRoute?.meta?.title || ''
}

function handleCommand(cmd) {
  if (cmd === 'logout') {
    authStore.logout()
    router.push('/login')
  }
}

function toggleMobileMenu() {
  isMobileMenuHidden.value = !isMobileMenuHidden.value
}
</script>

<style scoped>
.sidebar-hidden {
  transform: translateX(-100%);
}
.sidebar-overlay {
  display: none;
}
@media (max-width: 767px) {
  .sidebar {
    position: fixed !important;
    z-index: 1001;
    height: 100vh;
    transition: transform 0.3s ease;
  }
  .sidebar-hidden {
    transform: translateX(-100%);
  }
  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }
  .main-area {
    margin-left: 0 !important;
  }
}

/* Light mode overrides */
.admin-layout:not(.dark) {
  background: #f5f5f5;
}
.admin-layout:not(.dark) .sidebar {
  background: #fff;
  border-right: 1px solid #e0e0e0;
}
.admin-layout:not(.dark) .header {
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
}
.admin-layout:not(.dark) .main-content {
  background: #f5f5f5;
}
</style>

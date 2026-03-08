<template>
  <div class="admin-layout" :class="{ dark: true }">
    <div class="sidebar" :style="{ width: isCollapsed ? '64px' : '220px' }">
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
            <el-menu-item index="/super/finance/withdrawals">提现订单</el-menu-item>
            <el-menu-item index="/super/finance/channels">支付通道</el-menu-item>
            <el-menu-item index="/super/finance/report">财务报表</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="games-menu">
            <template #title>
              <el-icon><Trophy /></el-icon>
              <span>游戏管理</span>
            </template>
            <el-menu-item index="/super/games/providers">游戏厂商</el-menu-item>
            <el-menu-item index="/super/games/list">游戏列表</el-menu-item>
            <el-menu-item index="/super/games/bets">投注记录</el-menu-item>
          </el-sub-menu>
          <el-menu-item index="/super/risk">
            <el-icon><Warning /></el-icon>
            <span>风控管理</span>
          </el-menu-item>
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
    </div>

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
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isCollapsed = ref(false)
const isSuperAdmin = computed(() => authStore.isSuperAdmin)
const currentRoute = computed(() => route)
const activeMenu = computed(() => route.path)

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
</script>

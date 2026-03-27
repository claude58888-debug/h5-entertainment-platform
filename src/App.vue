<template>
  <div class="app-container">
    <AppHeader v-if="showAppHeader" />
    <main class="app-main" :class="{ 'has-tabbar': showTabBar, 'no-header': !showAppHeader }">
      <router-view v-slot="{ Component }">
        <transition name="slide-fade" mode="out-in">
          <component :is="Component" :key="$route.path" />
        </transition>
      </router-view>
    </main>
    <BottomTabBar v-if="showTabBar" />
    <LoginModal />
    <BackToTop />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import BottomTabBar from '@/components/common/BottomTabBar.vue'
import LoginModal from '@/components/common/LoginModal.vue'
import BackToTop from '@/components/common/BackToTop.vue'

const route = useRoute()

const tabBarPages = ['/', '/home', '/promotions', '/support', '/download', '/profile']
const showTabBar = computed(() => {
  return tabBarPages.some(p => route.path === p || route.path === p + '/')
})

// Sub-pages with their own nav-bar should hide the main app header
const subPages = ['/deposit', '/withdraw', '/tasks', '/income', '/invite', '/recharge', '/vip', '/safeCenter', '/report', '/transRecord', '/orderRecordSummary', '/prizeRecord', '/buyBit', '/softwareDownload', '/agentCooperation', '/video', '/login', '/register']
const subPagePrefixes = ['/games/', '/game/']
const showAppHeader = computed(() => {
  const path = route.path
  if (subPages.some(p => path === p || path === p + '/')) return false
  if (subPagePrefixes.some(prefix => path.startsWith(prefix))) return false
  return true
})
</script>

<style lang="scss">
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  padding-top: $header-height;

  &.no-header {
    padding-top: 0;
  }
  padding-bottom: 0;

  &.has-tabbar {
    padding-bottom: $tab-bar-height;
  }
}

/* Center van-nav-bar title on all sub-pages */
.van-nav-bar__title {
  position: absolute !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  text-align: center !important;
}
</style>

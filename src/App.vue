<template>
  <div class="app-container" role="application" :aria-label="$route.meta?.title || '大大娱乐'">
    <a class="skip-link" href="#main-content">跳转到主要内容</a>
    <AppHeader v-if="showAppHeader" />
    <main id="main-content" class="app-main" :class="{ 'has-tabbar': showTabBar, 'no-header': !showAppHeader }" role="main">
      <router-view v-slot="{ Component, route: viewRoute }">
        <transition :name="transitionName" mode="out-in">
          <component :is="Component" :key="viewRoute.path" />
        </transition>
      </router-view>
    </main>
    <BottomTabBar v-if="showTabBar" />
    <LoginModal />
    <BackToTop />
    <AgeVerificationGate />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import BottomTabBar from '@/components/common/BottomTabBar.vue'
import LoginModal from '@/components/common/LoginModal.vue'
import BackToTop from '@/components/common/BackToTop.vue'
import AgeVerificationGate from '@/components/common/AgeVerificationGate.vue'

const route = useRoute()
const router = useRouter()

const transitionName = ref('slide-fade')

router.beforeEach((to, from) => {
  const mainPages = ['/', '/home', '/promotions', '/support', '/download', '/profile']
  const toIsMain = mainPages.includes(to.path)
  const fromIsMain = mainPages.includes(from.path)
  if (toIsMain && fromIsMain) {
    transitionName.value = 'slide-fade'
  } else if (!toIsMain && fromIsMain) {
    transitionName.value = 'slide-right'
  } else if (toIsMain && !fromIsMain) {
    transitionName.value = 'slide-left'
  } else {
    transitionName.value = 'slide-fade'
  }
})

const tabBarPages = ['/', '/home', '/promotions', '/support', '/download', '/profile']
const showTabBar = computed(() => {
  return tabBarPages.some(p => route.path === p || route.path === p + '/')
})

// Sub-pages with their own nav-bar should hide the main app header
const subPages = ['/deposit', '/withdraw', '/tasks', '/income', '/invite', '/recharge', '/vip', '/safeCenter', '/report', '/transRecord', '/orderRecordSummary', '/prizeRecord', '/buyBit', '/softwareDownload', '/agentCooperation', '/video', '/login', '/register', '/self-exclusion', '/limits', '/privacy', '/terms', '/responsible-gaming']
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

/* Fix van-nav-bar to align with centered content area */
.van-nav-bar {
  max-width: 480px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  right: auto !important;
}

/* Keep title centered within the nav bar */
.van-nav-bar__title {
  position: absolute !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  text-align: center !important;
}
</style>

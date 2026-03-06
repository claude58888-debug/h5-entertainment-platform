<template>
  <div class="app-container">
    <AppHeader />
    <main class="app-main" :class="{ 'has-tabbar': showTabBar }">
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
  padding-bottom: 0;

  &.has-tabbar {
    padding-bottom: $tab-bar-height;
  }
}
</style>

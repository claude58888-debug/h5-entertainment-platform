<template>
  <div class="app-notice" v-if="appStore.announcements.length">
    <van-notice-bar
      scrollable
      left-icon="volume-o"
      :text="noticeText"
      background="#1e2a4a"
      color="#f0c040"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const noticeText = computed(() => {
  return appStore.announcements.map(a => a.content).join('    |    ')
})
</script>

<style lang="scss" scoped>
.app-notice {
  margin: 8px 12px;
  border-radius: 8px;
  overflow: hidden;

  :deep(.van-notice-bar) {
    border-radius: 8px;
    height: 32px;
    font-size: 12px;
  }
}
</style>

<template>
  <transition name="fade">
    <div class="back-to-top" v-show="visible" @click="scrollToTop">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="18 15 12 9 6 15"/>
      </svg>
      <span>TOP</span>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(false)

function onScroll() {
  visible.value = window.scrollY > 300
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style lang="scss" scoped>
.back-to-top {
  position: fixed;
  bottom: 80px;
  left: calc(50% + 179px);
  width: auto;
  padding: 6px 8px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.5);
  color: rgba(255,255,255,0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 9px;
  cursor: pointer;
  z-index: 9999;
  transition: all 0.2s;
  backdrop-filter: blur(4px);

  &:active {
    background: rgba(0, 0, 0, 0.7);
  }

  @media (max-width: 450px) {
    left: auto;
    right: 10px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

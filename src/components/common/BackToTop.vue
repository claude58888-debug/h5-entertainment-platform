<template>
  <transition name="fade">
    <div class="back-to-top" v-show="visible" @click="scrollToTop">
      <span>↑</span>
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
  right: 16px;
  bottom: 80px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: $accent-purple;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba($accent-purple, 0.4);
  z-index: 99;
  transition: transform 0.2s;

  &:active {
    transform: scale(0.9);
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

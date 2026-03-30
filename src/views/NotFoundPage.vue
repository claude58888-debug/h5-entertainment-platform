<template>
  <div class="error-page" role="main" aria-label="页面未找到">
    <van-nav-bar
      title="页面未找到"
      left-arrow
      @click-left="goBack"
      fixed
      :style="{ maxWidth: '480px', margin: '0 auto' }"
    />
    <div class="error-content" style="padding-top: 46px;">
      <div class="error-icon">
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="rgba(124,58,237,0.4)" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 15s1.5-2 4-2 4 2 4 2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      </div>
      <h1 class="error-code">404</h1>
      <p class="error-title">页面未找到</p>
      <p class="error-desc">您访问的页面不存在或已被移除</p>
      <van-button type="primary" round @click="$router.push('/home')" class="error-btn">
        返回首页
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/home')
  }
}
</script>

<style lang="scss" scoped>
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 40px 20px;
  text-align: center;
}

.error-icon {
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.error-code {
  font-size: 72px;
  font-weight: 800;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  margin-bottom: 8px;
}

.error-title {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
}

.error-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 32px;
}

.error-btn {
  min-width: 160px;
}
</style>

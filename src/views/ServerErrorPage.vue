<template>
  <div class="error-page" role="main" aria-label="服务器错误">
    <div class="error-icon">
      <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="rgba(124,58,237,0.4)" stroke-width="1.5">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
        <line x1="6" y1="6" x2="6.01" y2="6"/>
        <line x1="6" y1="18" x2="6.01" y2="18"/>
        <path d="M14 6l2-2 2 2" stroke="#ef4444" stroke-width="2"/>
        <path d="M16 4v4" stroke="#ef4444" stroke-width="2"/>
      </svg>
    </div>
    <h1 class="error-code">500</h1>
    <p class="error-title">服务器开小差了</p>
    <p class="error-desc">服务器遇到了一些问题，请稍后再试</p>
    <van-button type="primary" round @click="retry" class="error-btn">
      重新加载
    </van-button>
    <van-button plain round @click="$router.push('/home')" class="error-btn-secondary">
      返回首页
    </van-button>
  </div>
</template>

<script setup>
function retry() {
  window.location.reload()
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
}

.error-code {
  font-size: 72px;
  font-weight: 800;
  background: linear-gradient(135deg, #ef4444, #f97316);
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
  margin-bottom: 12px;
}

.error-btn-secondary {
  min-width: 160px;
  color: rgba(255, 255, 255, 0.6) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
}
</style>

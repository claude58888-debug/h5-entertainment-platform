<template>
  <teleport to="body">
    <div v-if="showGate" class="age-gate-overlay">
      <div class="age-gate-modal">
        <div class="age-icon">🔞</div>
        <h2>年龄验证</h2>
        <p>本平台仅面向18岁及以上用户。请确认您已年满18周岁。</p>
        <div class="age-actions">
          <van-button type="primary" block round @click="confirmAge">我已年满18岁</van-button>
          <van-button plain block round @click="denyAge" style="margin-top: 10px;">我未满18岁</van-button>
        </div>
        <div class="age-links">
          <a @click.prevent="goToResponsible">负责任博彩</a>
          <span>|</span>
          <a @click.prevent="goToTerms">服务条款</a>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showGate = ref(false)

onMounted(() => {
  const verified = localStorage.getItem('age_verified')
  if (!verified) {
    showGate.value = true
  }
})

function confirmAge() {
  localStorage.setItem('age_verified', 'true')
  showGate.value = false
}

function denyAge() {
  window.location.href = 'https://www.google.com'
}

function goToResponsible() {
  localStorage.setItem('age_verified', 'true')
  showGate.value = false
  router.push('/responsible-gaming')
}

function goToTerms() {
  localStorage.setItem('age_verified', 'true')
  showGate.value = false
  router.push('/terms')
}
</script>

<style lang="scss" scoped>
.age-gate-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.92);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.age-gate-modal {
  background: $bg-card;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  max-width: 360px;
  width: 100%;

  .age-icon {
    font-size: 56px;
    margin-bottom: 12px;
  }

  h2 {
    font-size: 20px;
    margin-bottom: 10px;
  }

  p {
    font-size: 14px;
    color: $text-secondary;
    line-height: 1.6;
    margin-bottom: 24px;
  }
}

.age-actions {
  margin-bottom: 16px;
}

.age-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;

  a {
    color: $text-muted;
    text-decoration: underline;
    cursor: pointer;

    &:hover {
      color: $text-secondary;
    }
  }

  span {
    color: $text-muted;
  }
}
</style>

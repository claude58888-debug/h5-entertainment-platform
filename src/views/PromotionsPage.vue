<template>
  <div class="promotions-page">
    <van-nav-bar
      title="活动中心"
      left-arrow
      @click-left="$router.back()"
      fixed
      :style="{ maxWidth: '480px', margin: '0 auto' }"
    />
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
    <div class="page-content" style="padding-top: 46px;">
      <!-- Skeleton loading -->
      <template v-if="loading">
        <div v-for="i in 3" :key="i" class="promo-skeleton">
          <van-skeleton title :row="2" />
        </div>
      </template>

      <div
        v-for="promo in promotions"
        v-else
        :key="promo.id"
        class="promo-card"
        :style="{ background: promo.gradient }"
        @click="$router.push('/activity/' + promo.id)"
      >
        <div class="promo-content">
          <h3 class="promo-title">{{ promo.title }}</h3>
          <p class="promo-subtitle">{{ promo.description }}</p>
          <span class="promo-btn">了解详情</span>
        </div>
        <div class="promo-decoration">
          <div class="deco-circle deco-circle-1"></div>
          <div class="deco-circle deco-circle-2"></div>
        </div>
      </div>
    </div>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getPromotionsApi } from '@/api/promo'

const loading = ref(true)
const refreshing = ref(false)

const defaultGradients = [
  'linear-gradient(135deg, #f0a030, #e67e22)',
  'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  'linear-gradient(135deg, #8b5cf6, #6d28d9)',
  'linear-gradient(135deg, #e17055, #d63031)',
  'linear-gradient(135deg, #00b894, #00897b)'
]

const promotions = ref([
  { id: 1, title: '每日首充', description: '最多赠送588U', gradient: defaultGradients[0] },
  { id: 2, title: '每日翻盘金', description: '最多1888U', gradient: defaultGradients[1] },
  { id: 3, title: '电子闯关', description: '每日最多85U', gradient: defaultGradients[2] },
  { id: 4, title: '棋牌闯关', description: '每日最多85U', gradient: defaultGradients[3] },
  { id: 5, title: '当周有效投注', description: '最多12888U', gradient: defaultGradients[4] }
])

async function loadPromotions() {
  try {
    const res = await getPromotionsApi()
    if (Array.isArray(res) && res.length) {
      promotions.value = res.map((p, i) => ({
        ...p,
        gradient: p.gradient || defaultGradients[i % defaultGradients.length]
      }))
    }
  } catch (e) {
    console.warn('Promotions API failed, using default data', e)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

async function onRefresh() {
  await loadPromotions()
}

onMounted(() => loadPromotions())
</script>

<style lang="scss" scoped>
.page-content {
  padding: 16px;
  min-height: 80vh;
}

.promo-skeleton {
  border-radius: 14px;
  padding: 24px 20px;
  margin-bottom: 14px;
  background: rgba(255, 255, 255, 0.04);
}

.promo-card {
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 14px;
  padding: 24px 20px;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s;
  min-height: 110px;
  display: flex;
  align-items: center;

  &:active {
    transform: scale(0.98);
  }
}

.promo-content {
  position: relative;
  z-index: 1;
}

.promo-title {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 6px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.promo-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 14px;
}

.promo-btn {
  display: inline-block;
  padding: 6px 18px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 12px;
  color: #fff;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.promo-decoration {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 50%;
  overflow: hidden;
  pointer-events: none;
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}

.deco-circle-1 {
  width: 120px;
  height: 120px;
  top: -20px;
  right: -10px;
}

.deco-circle-2 {
  width: 80px;
  height: 80px;
  bottom: -20px;
  right: 40px;
}
</style>

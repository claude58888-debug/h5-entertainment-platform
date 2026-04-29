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

      <template v-else>
        <div
          v-for="promo in promotions"
          :key="promo.id"
          class="promo-card"
          :style="{ background: promo.gradient }"
          @click="openDetail(promo)"
        >
          <div class="promo-badge" v-if="promo.tag">{{ promo.tag }}</div>
          <div class="promo-content">
            <h3 class="promo-title">{{ promo.title }}</h3>
            <p class="promo-subtitle">{{ promo.description }}</p>
            <div class="promo-countdown" v-if="promo.endTime">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>{{ formatCountdown(promo.remaining) }}</span>
            </div>
            <span class="promo-btn">了解详情</span>
          </div>
          <div class="promo-decoration">
            <div class="deco-circle deco-circle-1"></div>
            <div class="deco-circle deco-circle-2"></div>
          </div>
        </div>
      </template>
    </div>
    </van-pull-refresh>

    <!-- Promotion Detail Popup -->
    <van-popup
      v-model:show="showDetail"
      position="bottom"
      round
      :style="{ maxHeight: '80vh', maxWidth: '480px', margin: '0 auto' }"
    >
      <div class="detail-popup" v-if="selectedPromo">
        <div class="detail-header" :style="{ background: selectedPromo.gradient }">
          <h3>{{ selectedPromo.title }}</h3>
          <p>{{ selectedPromo.description }}</p>
          <div class="detail-countdown" v-if="selectedPromo.endTime">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>剩余 {{ formatCountdown(selectedPromo.remaining) }}</span>
          </div>
        </div>
        <div class="detail-body">
          <div class="detail-section">
            <h4>活动详情</h4>
            <p>{{ selectedPromo.detail }}</p>
          </div>
          <div class="detail-section">
            <h4>参与条件</h4>
            <ul>
              <li v-for="(rule, i) in selectedPromo.rules" :key="i">{{ rule }}</li>
            </ul>
          </div>
          <van-button type="primary" block round class="detail-apply-btn">
            立即参与
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getPromotionsApi } from '@/api/promo'

const loading = ref(true)
const refreshing = ref(false)
const showDetail = ref(false)
const selectedPromo = ref(null)

const defaultGradients = [
  'linear-gradient(135deg, #f0a030, #e67e22)',
  'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  'linear-gradient(135deg, #8b5cf6, #6d28d9)',
  'linear-gradient(135deg, #e17055, #d63031)',
  'linear-gradient(135deg, #00b894, #00897b)'
]

const now = ref(Date.now())
let timer = null

const promotions = ref([
  {
    id: 1, title: '每日首充', description: '最多赠送588U',
    gradient: defaultGradients[0], tag: '热门',
    endTime: Date.now() + 8 * 3600 * 1000, remaining: 0,
    detail: '每日首次充值即可获得额外奖励，充值越多奖励越大。最高可获得588U的额外赠送。',
    rules: ['每日首次充值有效', '最低充值100U', '奖金需完成3倍流水', '每日00:00重置']
  },
  {
    id: 2, title: '每日翻盘金', description: '最多1888U',
    gradient: defaultGradients[1], tag: '限时',
    endTime: Date.now() + 4 * 3600 * 1000, remaining: 0,
    detail: '当日亏损达到一定额度，即可申请翻盘金。最高可获得1888U的翻盘资金。',
    rules: ['当日亏损500U以上可申请', '翻盘金需完成5倍流水', '每日仅限申请一次', '次日00:00前有效']
  },
  {
    id: 3, title: '电子闯关', description: '每日最多85U',
    gradient: defaultGradients[2], tag: null,
    endTime: null, remaining: 0,
    detail: '完成指定电子游戏闯关任务，即可获得丰厚奖励。每日最多可获得85U。',
    rules: ['完成任意电子游戏10局', '单局投注不低于5U', '奖励自动发放', '每日可参与多次']
  },
  {
    id: 4, title: '棋牌闯关', description: '每日最多85U',
    gradient: defaultGradients[3], tag: null,
    endTime: null, remaining: 0,
    detail: '完成棋牌游戏闯关任务，层层递进奖励递增。每日最多可获得85U。',
    rules: ['参与任意棋牌游戏', '完成5/10/20局解锁不同奖励', '奖励自动发放到账户', '每日00:00重置进度']
  },
  {
    id: 5, title: '当周有效投注', description: '最多12888U',
    gradient: defaultGradients[4], tag: '推荐',
    endTime: Date.now() + 72 * 3600 * 1000, remaining: 0,
    detail: '当周有效投注达到指定额度，即可获得超高额返利。最高可获得12888U。',
    rules: ['统计周一至周日有效投注', '投注越多返利比例越高', '奖励于次周一发放', '所有游戏均计入统计']
  }
])

function updateCountdowns() {
  now.value = Date.now()
  promotions.value.forEach(p => {
    if (p.endTime) {
      p.remaining = Math.max(0, p.endTime - now.value)
    }
  })
  if (selectedPromo.value && selectedPromo.value.endTime) {
    selectedPromo.value.remaining = Math.max(0, selectedPromo.value.endTime - now.value)
  }
}

function formatCountdown(ms) {
  if (!ms || ms <= 0) return '已结束'
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  const pad = (n) => String(n).padStart(2, '0')
  return pad(h) + ':' + pad(m) + ':' + pad(s)
}

function openDetail(promo) {
  selectedPromo.value = { ...promo }
  showDetail.value = true
}

async function loadPromotions() {
  try {
    const res = await getPromotionsApi()
    if (Array.isArray(res) && res.length) {
      promotions.value = res.map((p, i) => ({
        ...p,
        gradient: p.gradient || defaultGradients[i % defaultGradients.length],
        remaining: 0
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

onMounted(() => {
  loadPromotions()
  updateCountdowns()
  timer = setInterval(updateCountdowns, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
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

.promo-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: linear-gradient(90deg, $accent-gold, $accent-gold-light);
  color: #1a0a2e;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 0 14px 0 10px;
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
  margin-bottom: 8px;
}

.promo-countdown {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.25);
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  color: #fff;
  margin-bottom: 10px;
  font-variant-numeric: tabular-nums;
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

/* Detail Popup */
.detail-popup {
  max-height: 80vh;
  overflow-y: auto;
}

.detail-header {
  padding: 28px 20px 20px;
  color: #fff;

  h3 {
    font-size: 24px;
    font-weight: 800;
    margin-bottom: 6px;
  }

  p {
    font-size: 14px;
    opacity: 0.85;
    margin-bottom: 8px;
  }
}

.detail-countdown {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.detail-body {
  padding: 20px;
  background: $bg-primary;
}

.detail-section {
  margin-bottom: 20px;

  h4 {
    font-size: 15px;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: 10px;
    padding-left: 10px;
    border-left: 3px solid $accent-purple;
  }

  p {
    font-size: 13px;
    color: $text-secondary;
    line-height: 1.6;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    font-size: 13px;
    color: $text-secondary;
    padding: 6px 0;
    padding-left: 16px;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: $accent-purple;
    }
  }
}

.detail-apply-btn {
  margin-top: 8px;
}
</style>

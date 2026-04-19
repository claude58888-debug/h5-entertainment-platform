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
    <div class="page-content" style="padding-top: 54px;">
      <!-- Category filters -->
      <div class="filter-bar hide-scrollbar">
        <button
          v-for="f in filters"
          :key="f.id"
          class="filter-chip"
          :class="{ active: activeFilter === f.id }"
          @click="activeFilter = f.id"
        >{{ f.label }}</button>
      </div>

      <!-- Skeleton loading -->
      <template v-if="loading">
        <div v-for="i in 3" :key="i" class="promo-skeleton">
          <van-skeleton title :row="2" />
        </div>
      </template>

      <template v-else>
        <div
          v-for="promo in filteredPromotions"
          :key="promo.id"
          class="promo-card"
          @click="openDetail(promo)"
        >
          <div class="promo-media" :style="promo.image ? { backgroundImage: `url(${promo.image})` } : {}">
            <span v-if="promo.tag" class="promo-tag">{{ promo.tag }}</span>
          </div>
          <div class="promo-body">
            <h3 class="promo-title">{{ promo.title }}</h3>
            <p class="promo-subtitle">{{ promo.description }}</p>
            <div class="promo-meta">
              <span v-if="promo.endTime" class="promo-countdown num-mono">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {{ formatCountdown(promo.remaining) }}
              </span>
              <span class="promo-btn">查看详情</span>
            </div>
          </div>
        </div>
        <div v-if="filteredPromotions.length === 0" class="empty-promos">{{ $t('common.noData') }}</div>
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
        <div class="detail-header">
          <h3>{{ selectedPromo.title }}</h3>
          <p>{{ selectedPromo.description }}</p>
          <div class="detail-countdown num-mono" v-if="selectedPromo.endTime">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getPromotionsApi } from '@/api/promo'

const loading = ref(true)
const refreshing = ref(false)
const showDetail = ref(false)
const selectedPromo = ref(null)
const activeFilter = ref('all')

const filters = [
  { id: 'all', label: '全部' },
  { id: 'hot', label: '热门' },
  { id: 'limited', label: '限时' },
  { id: 'daily', label: '每日' },
  { id: 'weekly', label: '每周' }
]

const now = ref(Date.now())
let timer = null

const promotions = ref([
  {
    id: 1, title: '每日首充', description: '最多赠送588U',
    tag: '热门', category: 'daily',
    endTime: Date.now() + 8 * 3600 * 1000, remaining: 0,
    detail: '每日首次充值即可获得额外奖励，充值越多奖励越大。最高可获得588U的额外赠送。',
    rules: ['每日首次充值有效', '最低充值100U', '奖金需完成3倍流水', '每日00:00重置']
  },
  {
    id: 2, title: '每日翻盘金', description: '最多1888U',
    tag: '限时', category: 'limited',
    endTime: Date.now() + 4 * 3600 * 1000, remaining: 0,
    detail: '当日亏损达到一定额度，即可申请翻盘金。最高可获得1888U的翻盘资金。',
    rules: ['当日亏损500U以上可申请', '翻盘金需完成5倍流水', '每日仅限申请一次', '次日00:00前有效']
  },
  {
    id: 3, title: '电子闯关', description: '每日最多85U',
    tag: null, category: 'daily',
    endTime: null, remaining: 0,
    detail: '完成指定电子游戏闯关任务，即可获得丰厚奖励。每日最多可获得85U。',
    rules: ['完成任意电子游戏10局', '单局投注不低于5U', '奖励自动发放', '每日可参与多次']
  },
  {
    id: 4, title: '棋牌闯关', description: '每日最多85U',
    tag: null, category: 'daily',
    endTime: null, remaining: 0,
    detail: '完成棋牌游戏闯关任务，层层递进奖励递增。每日最多可获得85U。',
    rules: ['参与任意棋牌游戏', '完成5/10/20局解锁不同奖励', '奖励自动发放到账户', '每日00:00重置进度']
  },
  {
    id: 5, title: '当周有效投注', description: '最多12888U',
    tag: '推荐', category: 'weekly',
    endTime: Date.now() + 72 * 3600 * 1000, remaining: 0,
    detail: '当周有效投注达到指定额度，即可获得超高额返利。最高可获得12888U。',
    rules: ['统计周一至周日有效投注', '投注越多返利比例越高', '奖励于次周一发放', '所有游戏均计入统计']
  }
])

const filteredPromotions = computed(() => {
  if (activeFilter.value === 'all') return promotions.value
  if (activeFilter.value === 'hot') return promotions.value.filter(p => p.tag === '热门' || p.tag === '推荐')
  if (activeFilter.value === 'limited') return promotions.value.filter(p => p.tag === '限时')
  return promotions.value.filter(p => p.category === activeFilter.value)
})

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
      promotions.value = res.map((p) => ({
        ...p,
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
.promotions-page {
  background: $bg-primary;
  min-height: 100vh;
}

.page-content {
  padding: 12px 12px 24px;
  min-height: 80vh;
}

.filter-bar {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 4px 0 12px;
}

.filter-chip {
  flex-shrink: 0;
  padding: 6px 14px;
  background: $bg-card;
  border: 1px solid $border-subtle;
  color: $text-secondary;
  border-radius: $radius-md;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;

  &.active {
    background: $bg-card-hover;
    color: $accent-gold;
    border-color: rgba(212, 168, 67, 0.3);
  }
}

.promo-skeleton {
  border-radius: $radius-lg;
  padding: 16px;
  margin-bottom: 10px;
  background: $bg-card;
}

.promo-card {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
  padding: 12px;
  background: $surface-translucent;
  border: 1px solid $border-subtle;
  border-radius: $radius-lg;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:active {
    background: $surface-translucent-hover;
    border-color: rgba(212, 168, 67, 0.25);
  }
}

.promo-media {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border-radius: $radius-md;
  background-color: $bg-card-hover;
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
}

.promo-tag {
  position: absolute;
  top: 6px;
  left: 6px;
  padding: 2px 6px;
  background: $accent-gold;
  color: #0b1a23;
  font-size: 10px;
  font-weight: 700;
  border-radius: $radius-sm;
}

.promo-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.promo-title {
  font-size: 15px;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 4px;
}

.promo-subtitle {
  font-size: 12px;
  color: $text-secondary;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.promo-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.promo-countdown {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: $accent-gold;
  font-size: 11px;
  font-weight: 600;
}

.promo-btn {
  display: inline-block;
  padding: 4px 10px;
  font-size: 11px;
  color: $text-secondary;
  border: 1px solid $border-subtle;
  border-radius: $radius-sm;
}

.empty-promos {
  text-align: center;
  padding: 60px 0;
  color: $text-muted;
  font-size: 13px;
}

/* Detail Popup */
.detail-popup {
  max-height: 80vh;
  overflow-y: auto;
  background: $bg-secondary;
}

.detail-header {
  padding: 24px 20px 16px;
  background: $bg-card;
  color: $text-primary;

  h3 {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 6px;
  }

  p {
    font-size: 13px;
    color: $text-secondary;
    margin-bottom: 10px;
  }
}

.detail-countdown {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: $bg-primary;
  padding: 4px 12px;
  border-radius: $radius-md;
  font-size: 12px;
  color: $accent-gold;
  font-weight: 600;
}

.detail-body {
  padding: 20px;
  background: $bg-secondary;
}

.detail-section {
  margin-bottom: 20px;

  h4 {
    font-size: 14px;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: 10px;
    padding-left: 10px;
    border-left: 3px solid $accent-gold;
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
    padding: 6px 0 6px 16px;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: $accent-gold;
    }
  }
}

.detail-apply-btn {
  margin-top: 8px;
}
</style>

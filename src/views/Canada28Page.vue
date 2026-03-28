<template>
  <div class="canada28-page">
    <!-- Header -->
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <van-icon name="arrow-left" />
      </button>
      <h1 class="page-title">加拿大4.2-4.6</h1>
      <div class="balance-display">
        <span class="balance-icon">T</span>
        <span class="balance-amount">{{ userStore.balance?.toFixed(2) || '0.00' }}</span>
      </div>
    </div>

    <!-- Result Card -->
    <div class="result-card">
      <div class="result-header">
        <span class="period-label">{{ currentPeriod }} 期开奖结果</span>
        <button class="history-btn" @click="showHistory = !showHistory">
          <van-icon :name="showHistory ? 'arrow-up' : 'arrow-down'" />
        </button>
      </div>
      <div class="result-balls">
        <div class="ball ball-green">{{ resultBalls[0] }}</div>
        <span class="ball-op">+</span>
        <div class="ball ball-orange">{{ resultBalls[1] }}</div>
        <span class="ball-op">+</span>
        <div class="ball ball-purple">{{ resultBalls[2] }}</div>
        <span class="ball-op">=</span>
        <div class="ball ball-result">{{ resultSum }}</div>
      </div>
      <div v-if="showHistory" class="history-list">
        <div v-for="h in historyResults" :key="h.period" class="history-item">
          <span class="history-period">{{ h.period }}</span>
          <div class="history-balls">
            <span class="mini-ball green">{{ h.balls[0] }}</span>
            <span class="mini-op">+</span>
            <span class="mini-ball orange">{{ h.balls[1] }}</span>
            <span class="mini-op">+</span>
            <span class="mini-ball purple">{{ h.balls[2] }}</span>
            <span class="mini-op">=</span>
            <span class="mini-ball result">{{ h.sum }}</span>
          </div>
        </div>
      </div>
      <div class="next-period">
        <span>{{ nextPeriod }} 期</span>
        <span class="countdown-label">下注倒计时:</span>
        <span class="countdown-timer">{{ countdownStr }}</span>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tab-bar">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Bet Area -->
      <div v-if="activeTab === 'bet'" class="bet-area">
        <div class="bet-sidebar">
          <div
            v-for="cat in sidebarItems"
            :key="cat.key"
            class="sidebar-item"
            :class="{ active: activeSidebar === cat.key }"
            @click="activeSidebar = cat.key"
          >
            {{ cat.label }}
          </div>
        </div>
        <div class="bet-content">
          <!-- Special Code -->
          <template v-if="activeSidebar === 'tema'">
            <div class="bet-section">
              <h4 class="section-title">大小单双</h4>
              <div class="bet-grid grid-4">
                <button
                  v-for="item in daxiaodanshuang"
                  :key="item.label"
                  class="bet-btn"
                  :class="{ selected: isSelected(item.id) }"
                  @click="toggleBet(item)"
                >
                  <span class="bet-label">{{ item.label }}</span>
                  <span class="bet-odds">{{ item.odds }}</span>
                </button>
              </div>
            </div>
            <div class="bet-section">
              <h4 class="section-title">组合</h4>
              <div class="bet-grid grid-4">
                <button
                  v-for="item in zuhe"
                  :key="item.label"
                  class="bet-btn"
                  :class="{ selected: isSelected(item.id) }"
                  @click="toggleBet(item)"
                >
                  <span class="bet-label">{{ item.label }}</span>
                  <span class="bet-odds">{{ item.odds }}</span>
                </button>
              </div>
            </div>
            <div class="bet-section">
              <h4 class="section-title">极大小</h4>
              <div class="bet-grid grid-2">
                <button
                  v-for="item in jidaxiao"
                  :key="item.label"
                  class="bet-btn"
                  :class="{ selected: isSelected(item.id) }"
                  @click="toggleBet(item)"
                >
                  <span class="bet-label">{{ item.label }}</span>
                  <span class="bet-odds">{{ item.odds }}</span>
                </button>
              </div>
            </div>
          </template>

          <!-- Three Digit -->
          <template v-if="activeSidebar === 'sanwei'">
            <div class="bet-section">
              <h4 class="section-title">三位整合</h4>
              <div class="bet-grid grid-3">
                <button
                  v-for="item in sanweiItems"
                  :key="item.label"
                  class="bet-btn"
                  :class="{ selected: isSelected(item.id) }"
                  @click="toggleBet(item)"
                >
                  <span class="bet-label">{{ item.label }}</span>
                  <span class="bet-odds">{{ item.odds }}</span>
                </button>
              </div>
            </div>
          </template>

          <!-- Single Point -->
          <template v-if="activeSidebar === 'dandian'">
            <div class="bet-section">
              <h4 class="section-title">单点 (0-27)</h4>
              <div class="bet-grid grid-4">
                <button
                  v-for="item in dandianItems"
                  :key="item.label"
                  class="bet-btn"
                  :class="{ selected: isSelected(item.id) }"
                  @click="toggleBet(item)"
                >
                  <span class="bet-label">{{ item.label }}</span>
                  <span class="bet-odds">{{ item.odds }}</span>
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Road Map -->
      <div v-if="activeTab === 'road'" class="empty-tab">
        <van-icon name="chart-trending-o" size="48" color="#666" />
        <p>路单图功能开发中</p>
      </div>

      <!-- Game Records -->
      <div v-if="activeTab === 'records'" class="empty-tab">
        <van-icon name="orders-o" size="48" color="#666" />
        <p>暂无游戏记录</p>
      </div>

      <!-- Game Rules -->
      <div v-if="activeTab === 'rules'" class="rules-content">
        <div class="rule-block">
          <h4>游戏说明</h4>
          <p>加拿大4.2-4.6是基于加拿大PC28彩票的竞猜游戏。每期开出3个0-9的数字，三个数字之和（0-27）为开奖结果。</p>
        </div>
        <div class="rule-block">
          <h4>大小单双</h4>
          <p>结果0-13为小，14-27为大；结果为奇数为单，偶数为双。赔率1.99。</p>
        </div>
        <div class="rule-block">
          <h4>组合</h4>
          <p>大单/大双/小单/小双组合投注。大单、小双赔率4.2；大双、小单赔率4.6。</p>
        </div>
        <div class="rule-block">
          <h4>极大小</h4>
          <p>结果0-1为极小，26-27为极大。赔率15。</p>
        </div>
        <div class="rule-block">
          <h4>单点</h4>
          <p>直接竞猜开奖结果数字（0-27），不同数字赔率不同。</p>
        </div>
      </div>
    </div>

    <!-- Bet Footer -->
    <div class="bet-footer">
      <div class="footer-top">
        <span class="footer-label">每注押注</span>
        <div class="quick-amounts">
          <button
            v-for="amt in quickAmounts"
            :key="amt.value"
            class="quick-btn"
            :class="{ active: betAmount === amt.value }"
            @click="betAmount = amt.value"
          >
            {{ amt.label }}
          </button>
        </div>
        <input
          v-model.number="customAmount"
          type="number"
          class="amount-input"
          placeholder="请输入投注金额"
          @input="onCustomAmount"
        />
      </div>
      <div class="footer-actions">
        <button class="clear-btn" @click="clearAll">
          <van-icon name="delete-o" />
          清空
        </button>
        <button class="submit-btn" @click="submitBet" :disabled="selectedBets.length === 0">
          立即下注
          <span v-if="selectedBets.length > 0" class="bet-summary">
            已选{{ selectedBets.length }}注，共计{{ totalBet }}元
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// Tabs
const tabs = [
  { key: 'bet', label: '投注区' },
  { key: 'road', label: '路单图' },
  { key: 'records', label: '游戏记录' },
  { key: 'rules', label: '游戏规则' }
]
const activeTab = ref('bet')

// Sidebar
const sidebarItems = [
  { key: 'tema', label: '特码整合' },
  { key: 'sanwei', label: '三位整合' },
  { key: 'dandian', label: '单点' }
]
const activeSidebar = ref('tema')

// Mock data
const currentPeriod = ref(3413452)
const nextPeriod = ref(3413453)
const resultBalls = ref([6, 0, 7])
const resultSum = computed(() => resultBalls.value.reduce((a, b) => a + b, 0))
const showHistory = ref(false)

const historyResults = [
  { period: 3413451, balls: [3, 5, 8], sum: 16 },
  { period: 3413450, balls: [9, 1, 4], sum: 14 },
  { period: 3413449, balls: [2, 7, 3], sum: 12 },
  { period: 3413448, balls: [8, 6, 1], sum: 15 },
  { period: 3413447, balls: [4, 0, 9], sum: 13 }
]

// Countdown
const countdown = ref(90)
let timer = null
const countdownStr = computed(() => {
  const m = Math.floor(countdown.value / 60)
  const s = countdown.value % 60
  return `00:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

onMounted(() => {
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      countdown.value = 90
      currentPeriod.value++
      nextPeriod.value++
      resultBalls.value = [
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10)
      ]
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// Bet options
const daxiaodanshuang = [
  { id: 'da', label: '大', odds: 1.99 },
  { id: 'xiao', label: '小', odds: 1.99 },
  { id: 'dan', label: '单', odds: 1.99 },
  { id: 'shuang', label: '双', odds: 1.99 }
]

const zuhe = [
  { id: 'dadan', label: '大单', odds: 4.2 },
  { id: 'dashuang', label: '大双', odds: 4.6 },
  { id: 'xiaodan', label: '小单', odds: 4.6 },
  { id: 'xiaoshuang', label: '小双', odds: 4.2 }
]

const jidaxiao = [
  { id: 'jida', label: '极大', odds: 15 },
  { id: 'jixiao', label: '极小', odds: 15 }
]

const sanweiItems = [
  { id: 'duizi', label: '对子', odds: 3.5 },
  { id: 'shunzi', label: '顺子', odds: 15 },
  { id: 'baozi', label: '豹子', odds: 88 }
]

const dandianOdds = [
  888, 280, 135, 83, 48, 35, 30, 25,
  20, 17, 14, 13, 12, 12, 12, 12,
  13, 14, 17, 20, 25, 30, 35, 48,
  83, 135, 280, 888
]
const dandianItems = dandianOdds.map((odds, i) => ({
  id: `num_${i}`,
  label: String(i),
  odds
}))

// Bet state
const selectedBets = ref([])
const betAmount = ref(5)
const customAmount = ref(null)

const quickAmounts = [
  { label: '5', value: 5 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
  { label: '1k', value: 1000 }
]

function isSelected(id) {
  return selectedBets.value.some(b => b.id === id)
}

function toggleBet(item) {
  const idx = selectedBets.value.findIndex(b => b.id === item.id)
  if (idx >= 0) {
    selectedBets.value.splice(idx, 1)
  } else {
    selectedBets.value.push(item)
  }
}

function onCustomAmount() {
  if (customAmount.value && customAmount.value > 0) {
    betAmount.value = customAmount.value
  }
}

const totalBet = computed(() => selectedBets.value.length * betAmount.value)

function clearAll() {
  selectedBets.value = []
  customAmount.value = null
}

function submitBet() {
  if (selectedBets.value.length === 0) {
    showToast('请先选择投注项')
    return
  }
  showToast({
    message: `下注成功！共${selectedBets.value.length}注，合计${totalBet.value}元`,
    type: 'success'
  })
  selectedBets.value = []
}
</script>

<style lang="scss" scoped>
.canada28-page {
  min-height: 100vh;
  background: #1a1235;
  color: #fff;
  padding-bottom: 140px;
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, #2d1f5e, #1a1235);
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  padding: 4px;
  cursor: pointer;
}

.page-title {
  font-size: 17px;
  font-weight: 700;
  margin: 0;
}

.balance-display {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 4px 12px;
}

.balance-icon {
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #f0c040, #e67e22);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
}

.balance-amount {
  font-size: 14px;
  font-weight: 600;
}

/* Result Card */
.result-card {
  margin: 12px;
  background: linear-gradient(135deg, #2d1f5e, #1e1650);
  border-radius: 12px;
  padding: 16px;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.period-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.history-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 16px;
}

.result-balls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.ball {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;

  &.ball-green { background: linear-gradient(135deg, #00b894, #00a085); }
  &.ball-orange { background: linear-gradient(135deg, #f0a030, #e67e22); }
  &.ball-purple { background: linear-gradient(135deg, #8b5cf6, #6d28d9); }
  &.ball-result {
    background: linear-gradient(135deg, #f0a030, #e67e22);
    width: 44px;
    height: 44px;
    font-size: 20px;
  }
}

.ball-op {
  font-size: 18px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
}

.history-list {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 8px;
  margin-bottom: 12px;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
}

.history-period {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.history-balls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.mini-ball {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;

  &.green { background: #00b894; }
  &.orange { background: #e67e22; }
  &.purple { background: #8b5cf6; }
  &.result { background: #e67e22; }
}

.mini-op {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.next-period {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 13px;
}

.countdown-label {
  color: rgba(255, 255, 255, 0.6);
  margin-left: auto;
}

.countdown-timer {
  font-size: 16px;
  font-weight: 700;
  color: #f0c040;
  font-family: monospace;
  letter-spacing: 1px;
}

/* Tabs */
.tab-bar {
  display: flex;
  margin: 0 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    color: #fff;
    background: linear-gradient(135deg, #8b5cf6, #6d28d9);
    font-weight: 600;
  }
}

/* Tab Content */
.tab-content {
  margin: 12px;
}

/* Bet Area */
.bet-area {
  display: flex;
  gap: 10px;
}

.bet-sidebar {
  width: 80px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar-item {
  padding: 12px 8px;
  text-align: center;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.2s;

  &.active {
    background: linear-gradient(135deg, #8b5cf6, #6d28d9);
    color: #fff;
    font-weight: 600;
  }
}

.bet-content {
  flex: 1;
  min-width: 0;
}

.bet-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 8px;
}

.bet-grid {
  display: grid;
  gap: 8px;

  &.grid-4 { grid-template-columns: repeat(4, 1fr); }
  &.grid-3 { grid-template-columns: repeat(3, 1fr); }
  &.grid-2 { grid-template-columns: repeat(2, 1fr); }
}

.bet-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 4px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #fff;

  &.selected {
    background: linear-gradient(135deg, #8b5cf6, #6d28d9);
    border-color: #8b5cf6;
  }

  &:active {
    transform: scale(0.96);
  }
}

.bet-label {
  font-size: 14px;
  font-weight: 600;
}

.bet-odds {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;

  .selected & {
    color: rgba(255, 255, 255, 0.8);
  }
}

/* Empty tab */
.empty-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 12px;

  p {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.4);
  }
}

/* Rules */
.rules-content {
  padding: 4px 0;
}

.rule-block {
  margin-bottom: 16px;

  h4 {
    font-size: 14px;
    font-weight: 600;
    color: #f0c040;
    margin: 0 0 6px;
  }

  p {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
    margin: 0;
  }
}

/* Bet Footer */
.bet-footer {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  background: #1e1650;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px 12px;
  z-index: 20;
}

.footer-top {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.footer-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
}

.quick-amounts {
  display: flex;
  gap: 4px;
}

.quick-btn {
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    background: linear-gradient(135deg, #8b5cf6, #6d28d9);
    border-color: #8b5cf6;
  }
}

.amount-input {
  flex: 1;
  min-width: 0;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  font-size: 12px;
  outline: none;

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
}

.footer-actions {
  display: flex;
  gap: 8px;
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  cursor: pointer;
}

.submit-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.bet-summary {
  font-size: 11px;
  font-weight: 400;
  opacity: 0.8;
  margin-top: 2px;
}
</style>

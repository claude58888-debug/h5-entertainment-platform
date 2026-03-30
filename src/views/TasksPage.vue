<template>
  <div class="tasks-page">
    <van-nav-bar
      title="任务中心"
      left-arrow
      @click-left="$router.back()"
      fixed
      :style="{ maxWidth: '480px', margin: '0 auto' }"
    />
    <div class="page-content" style="padding-top: 46px;">
      <!-- Sign-in Section -->
      <div class="signin-card">
        <div class="signin-header">
          <h3>每日签到</h3>
          <span class="signin-streak">已连续签到 {{ signInStreak }} 天</span>
        </div>
        <div class="signin-days">
          <div
            v-for="day in signInDays"
            :key="day.day"
            class="signin-day"
            :class="{ claimed: day.claimed, today: day.day === currentSignInDay && !day.claimed }"
            @click="claimSignIn(day)"
          >
            <span class="day-label">第{{ day.day }}天</span>
            <span class="day-reward">+{{ day.reward }}</span>
            <span class="day-unit">USDT</span>
            <span v-if="day.claimed" class="day-check">✓</span>
          </div>
        </div>
      </div>

      <!-- Task Type Tabs -->
      <div class="task-tabs">
        <div
          v-for="tab in taskTabs"
          :key="tab.id"
          class="task-tab"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
          <span class="tab-badge" v-if="getUnclaimedCount(tab.id) > 0">{{ getUnclaimedCount(tab.id) }}</span>
        </div>
      </div>

      <!-- Task Summary -->
      <div class="task-summary">
        <div class="summary-item">
          <span class="summary-value">{{ completedCount }}</span>
          <span class="summary-label">已完成</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <span class="summary-value highlight">{{ totalReward }}</span>
          <span class="summary-label">可领取奖励 (USDT)</span>
        </div>
      </div>

      <!-- Task List -->
      <div class="task-list">
        <div v-for="task in filteredTasks" :key="task.id" class="task-card">
          <div class="task-header">
            <div class="task-icon-wrap">
              <span class="task-icon">{{ getTaskIcon(task) }}</span>
            </div>
            <div class="task-info">
              <h4>{{ task.title }}</h4>
              <p>{{ task.description }}</p>
            </div>
          </div>

          <!-- Reward Tier Progress Nodes -->
          <div v-if="task.tiers && task.tiers.length" class="tier-progress-section">
            <div class="tier-progress-bar">
              <button class="tier-nav-btn" @click="scrollTierLeft(task.id)">&lt;</button>
              <div class="tier-steps">
                <div class="tier-line"></div>
                <div
                  v-for="tier in getVisibleTiers(task)"
                  :key="tier.level"
                  class="tier-step"
                  :class="{ active: tier.level === task.currentTier, completed: tier.level < task.currentTier }"
                >
                  <div class="step-indicator">
                    <span class="step-num">{{ tier.level }}</span>
                    <div v-if="tier.level === task.currentTier" class="step-arrow"></div>
                  </div>
                  <span class="step-reward">{{ tier.reward }}U</span>
                </div>
              </div>
              <button class="tier-nav-btn" @click="scrollTierRight(task.id)">&gt;</button>
            </div>
          </div>

          <!-- Task Progress -->
          <div class="task-bottom">
            <div class="task-progress-row">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: Math.min(100, (task.progress / task.target) * 100) + '%' }"
                ></div>
              </div>
              <span class="progress-text">{{ task.progress }}/{{ task.target }}</span>
            </div>
            <van-button
              size="small"
              round
              :type="task.claimed ? 'default' : task.progress >= task.target ? 'primary' : 'default'"
              :disabled="task.claimed || task.progress < task.target"
              :class="{ 'btn-claimable': !task.claimed && task.progress >= task.target }"
              @click="claimTask(task)"
            >
              {{ task.claimed ? '已领取' : task.progress >= task.target ? '领取' : '不可领取' }}
            </van-button>
          </div>
        </div>
      </div>

      <div v-if="filteredTasks.length === 0" class="empty-tasks">
        暂无任务
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { showToast } from 'vant'

const defaultTasks = [
  { id: 1, title: '每日登录', description: '每日登录平台即可领取奖励', reward: 5, rewardUnit: 'USDT', progress: 1, target: 1, claimed: false, type: 'daily', tiers: [{ level: 1, reward: 5 }, { level: 2, reward: 15 }, { level: 3, reward: 38 }, { level: 4, reward: 88 }, { level: 5, reward: 188 }], currentTier: 1 },
  { id: 2, title: '每日首充', description: '今日完成首次充值', reward: 18, rewardUnit: 'USDT', progress: 0, target: 1, claimed: false, type: 'daily', tiers: [{ level: 1, reward: 18 }, { level: 2, reward: 38 }, { level: 3, reward: 68 }, { level: 4, reward: 128 }, { level: 5, reward: 288 }], currentTier: 1 },
  { id: 3, title: '邀请好友', description: '今日成功邀请一位好友注册', reward: 50, rewardUnit: 'USDT', progress: 0, target: 1, claimed: false, type: 'daily', tiers: [{ level: 1, reward: 50 }, { level: 2, reward: 108 }, { level: 3, reward: 228 }, { level: 4, reward: 468 }, { level: 5, reward: 888 }], currentTier: 1 },
  { id: 4, title: '游戏5局', description: '今日完成5局任意游戏', reward: 10, rewardUnit: 'USDT', progress: 2, target: 5, claimed: false, type: 'daily', tiers: [{ level: 1, reward: 10 }, { level: 2, reward: 28 }, { level: 3, reward: 58 }, { level: 4, reward: 128 }, { level: 5, reward: 288 }], currentTier: 1 },
  { id: 5, title: '游戏20局', description: '今日完成20局任意游戏', reward: 30, rewardUnit: 'USDT', progress: 2, target: 20, claimed: false, type: 'daily', tiers: [{ level: 1, reward: 30 }, { level: 2, reward: 68 }, { level: 3, reward: 128 }, { level: 4, reward: 268 }, { level: 5, reward: 588 }], currentTier: 1 },
  { id: 6, title: '分享平台', description: '分享平台链接到社交媒体', reward: 3, rewardUnit: 'USDT', progress: 0, target: 1, claimed: false, type: 'daily', tiers: [{ level: 1, reward: 3 }, { level: 2, reward: 8 }, { level: 3, reward: 18 }, { level: 4, reward: 38 }, { level: 5, reward: 88 }], currentTier: 1 },
  { id: 7, title: '完善个人信息', description: '填写个人基本资料', reward: 10, rewardUnit: 'USDT', progress: 0, target: 1, claimed: false, type: 'newbie', tiers: [{ level: 1, reward: 10 }, { level: 2, reward: 28 }, { level: 3, reward: 58 }, { level: 4, reward: 108 }, { level: 5, reward: 218 }], currentTier: 1 },
  { id: 8, title: '首次充值', description: '完成首次充值操作', reward: 28, rewardUnit: 'USDT', progress: 0, target: 1, claimed: false, type: 'newbie', tiers: [{ level: 1, reward: 28 }, { level: 2, reward: 58 }, { level: 3, reward: 128 }, { level: 4, reward: 288 }, { level: 5, reward: 588 }], currentTier: 1 },
  { id: 9, title: '首次投注', description: '完成首次游戏投注', reward: 18, rewardUnit: 'USDT', progress: 0, target: 1, claimed: false, type: 'newbie', tiers: [{ level: 1, reward: 18 }, { level: 2, reward: 38 }, { level: 3, reward: 88 }, { level: 4, reward: 188 }, { level: 5, reward: 388 }], currentTier: 1 },
  { id: 10, title: '邀请首位好友', description: '成功邀请一位好友注册', reward: 50, rewardUnit: 'USDT', progress: 0, target: 1, claimed: false, type: 'newbie', tiers: [{ level: 1, reward: 50 }, { level: 2, reward: 108 }, { level: 3, reward: 228 }, { level: 4, reward: 468 }, { level: 5, reward: 888 }], currentTier: 1 },
  { id: 11, title: '绑定银行卡', description: '绑定一张银行卡', reward: 15, rewardUnit: 'USDT', progress: 0, target: 1, claimed: false, type: 'newbie', tiers: [{ level: 1, reward: 15 }, { level: 2, reward: 35 }, { level: 3, reward: 68 }, { level: 4, reward: 138 }, { level: 5, reward: 268 }], currentTier: 1 },
  { id: 12, title: '游戏10局', description: '完成10局任意游戏', reward: 20, rewardUnit: 'USDT', progress: 0, target: 10, claimed: false, type: 'newbie', tiers: [{ level: 1, reward: 20 }, { level: 2, reward: 48 }, { level: 3, reward: 98 }, { level: 4, reward: 198 }, { level: 5, reward: 388 }], currentTier: 1 },
  { id: 13, title: '周累计充值5000', description: '本周累计充值达到5000', reward: 88, rewardUnit: 'USDT', progress: 1200, target: 5000, claimed: false, type: 'weekly', tiers: [{ level: 1, reward: 38 }, { level: 2, reward: 88 }, { level: 3, reward: 188 }, { level: 4, reward: 388 }, { level: 5, reward: 888 }], currentTier: 1 },
  { id: 14, title: '周游戏100局', description: '本周完成100局任意游戏', reward: 128, rewardUnit: 'USDT', progress: 35, target: 100, claimed: false, type: 'weekly', tiers: [{ level: 1, reward: 58 }, { level: 2, reward: 128 }, { level: 3, reward: 288 }, { level: 4, reward: 588 }, { level: 5, reward: 1288 }], currentTier: 1 },
  { id: 15, title: '邀请3位好友', description: '本周邀请3位好友注册', reward: 128, rewardUnit: 'USDT', progress: 1, target: 3, claimed: false, type: 'weekly', tiers: [{ level: 1, reward: 58 }, { level: 2, reward: 128 }, { level: 3, reward: 288 }, { level: 4, reward: 588 }, { level: 5, reward: 1288 }], currentTier: 1 },
  { id: 16, title: '连续登录7天', description: '本周每天都登录平台', reward: 58, rewardUnit: 'USDT', progress: 3, target: 7, claimed: false, type: 'weekly', tiers: [{ level: 1, reward: 28 }, { level: 2, reward: 58 }, { level: 3, reward: 128 }, { level: 4, reward: 288 }, { level: 5, reward: 588 }], currentTier: 1 }
]

const defaultSignInDays = [
  { day: 1, reward: 1, claimed: true },
  { day: 2, reward: 2, claimed: true },
  { day: 3, reward: 3, claimed: true },
  { day: 4, reward: 5, claimed: false },
  { day: 5, reward: 8, claimed: false },
  { day: 6, reward: 10, claimed: false },
  { day: 7, reward: 18, claimed: false }
]

const tasks = ref(JSON.parse(JSON.stringify(defaultTasks)))
const signInDays = ref(JSON.parse(JSON.stringify(defaultSignInDays)))
const activeTab = ref('daily')

const taskTabs = [
  { id: 'daily', label: '每日任务' },
  { id: 'newbie', label: '新手任务' },
  { id: 'weekly', label: '每周任务' }
]

const signInStreak = computed(() => {
  return signInDays.value.filter(d => d.claimed).length
})

const currentSignInDay = computed(() => {
  const unclaimed = signInDays.value.find(d => !d.claimed)
  return unclaimed ? unclaimed.day : signInDays.value.length + 1
})

const filteredTasks = computed(() => {
  return tasks.value.filter(t => t.type === activeTab.value)
})

const completedCount = computed(() => {
  return filteredTasks.value.filter(t => t.progress >= t.target).length
})

const totalReward = computed(() => {
  return filteredTasks.value
    .filter(t => t.progress >= t.target && !t.claimed)
    .reduce((sum, t) => sum + t.reward, 0)
})

function getUnclaimedCount(tabId) {
  return tasks.value.filter(t => t.type === tabId && t.progress >= t.target && !t.claimed).length
}

const taskIconMap = {
  '每日登录': '🔑',
  '每日首充': '💰',
  '邀请好友': '👥',
  '游戏5局': '🎮',
  '游戏20局': '🎮',
  '分享平台': '📤',
  '完善个人信息': '📝',
  '首次充值': '💎',
  '首次投注': '🎯',
  '邀请首位好友': '👥',
  '绑定银行卡': '💳',
  '游戏10局': '🎮',
  '周累计充值5000': '💰',
  '周游戏100局': '🎮',
  '邀请3位好友': '👥',
  '连续登录7天': '📅'
}

function getTaskIcon(task) {
  return taskIconMap[task.title] || (task.type === 'daily' ? '📋' : task.type === 'newbie' ? '🌟' : '📅')
}

function claimSignIn(day) {
  if (day.claimed) return
  if (day.day !== currentSignInDay.value) {
    showToast({ message: '请按顺序签到', type: 'fail' })
    return
  }
  day.claimed = true
  showToast({ message: `签到成功！+${day.reward} USDT`, type: 'success' })
}

const tierOffsets = ref({})

function getVisibleTiers(task) {
  const offset = tierOffsets.value[task.id] || 0
  if (task.tiers && task.tiers.length > 5) {
    return task.tiers.slice(offset, offset + 5)
  }
  return task.tiers || []
}

function scrollTierLeft(taskId) {
  const current = tierOffsets.value[taskId] || 0
  if (current > 0) {
    tierOffsets.value[taskId] = current - 1
  }
}

function scrollTierRight(taskId) {
  const task = tasks.value.find(t => t.id === taskId)
  if (!task || !task.tiers) return
  const current = tierOffsets.value[taskId] || 0
  if (current + 5 < task.tiers.length) {
    tierOffsets.value[taskId] = current + 1
  }
}

function claimTask(task) {
  if (task.claimed || task.progress < task.target) return
  task.claimed = true
  showToast({ message: `+${task.reward} ${task.rewardUnit}`, type: 'success' })
}
</script>

<style lang="scss" scoped>
.page-content {
  padding: 16px;
}

/* Sign-in Card */
.signin-card {
  background: linear-gradient(135deg, #6c5ce7, #a855f7);
  border-radius: 16px;
  padding: 18px;
  margin-bottom: 20px;
}

.signin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;

  h3 {
    font-size: 16px;
    font-weight: 700;
  }
}

.signin-streak {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.signin-days {
  display: flex;
  gap: 6px;
}

.signin-day {
  flex: 1;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 8px 4px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;

  &.claimed {
    background: rgba(255, 255, 255, 0.25);
  }

  &.today {
    background: rgba(245, 158, 11, 0.3);
    border: 1px solid rgba(245, 158, 11, 0.5);
  }
}

.day-label {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.6);
}

.day-reward {
  font-size: 14px;
  font-weight: 700;
}

.day-unit {
  font-size: 8px;
  color: rgba(255, 255, 255, 0.5);
}

.day-check {
  position: absolute;
  top: 2px;
  right: 4px;
  font-size: 10px;
  color: #10b981;
}

/* Task Tabs */
.task-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 16px;
  background: $bg-card;
  border-radius: 12px;
  padding: 3px;
}

.task-tab {
  flex: 1;
  padding: 10px 0;
  text-align: center;
  font-size: 14px;
  color: $text-secondary;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.2s;
  position: relative;

  &.active {
    background: $accent-purple;
    color: #fff;
    font-weight: 600;
  }
}

.tab-badge {
  position: absolute;
  top: 2px;
  right: 12px;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

/* Task Summary */
.task-summary {
  display: flex;
  align-items: center;
  background: $bg-card;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 16px;
}

.summary-item {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-value {
  font-size: 22px;
  font-weight: 700;

  &.highlight {
    color: $accent-gold;
  }
}

.summary-label {
  font-size: 11px;
  color: $text-muted;
}

.summary-divider {
  width: 1px;
  height: 30px;
  background: $border-color;
}

/* Task Cards */
.task-card {
  background: $bg-card;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 10px;
}

.task-header {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.task-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(124, 58, 237, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.task-icon {
  font-size: 20px;
}

.task-info {
  flex: 1;
  min-width: 0;

  h4 {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  p {
    font-size: 11px;
    color: $text-muted;
    margin-bottom: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/* Tier Progress Nodes */
.tier-progress-section {
  margin-bottom: 12px;
}

.tier-progress-bar {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.tier-nav-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
  }
}

.tier-steps {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  padding: 0 4px;
}

.tier-line {
  position: absolute;
  top: 12px;
  left: 16px;
  right: 16px;
  height: 2px;
  background: rgba(255, 255, 255, 0.12);
  z-index: 0;
}

.tier-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
  z-index: 1;
}

.step-indicator {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-num {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: $bg-card;
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.tier-step.active .step-num {
  background: $accent-purple;
  border-color: $accent-purple;
  color: #fff;
  box-shadow: 0 0 8px rgba(124, 58, 237, 0.4);
}

.tier-step.completed .step-num {
  background: rgba(124, 58, 237, 0.3);
  border-color: $accent-purple;
  color: #fff;
}

.step-arrow {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid $accent-purple;
}

.step-reward {
  font-size: 10px;
  color: $accent-gold;
  font-weight: 600;
  margin-top: 2px;
}

/* Task Bottom */
.task-bottom {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-progress-row {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: $accent-purple;
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 10px;
  color: $text-muted;
  white-space: nowrap;
}

.btn-claimable {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.empty-tasks {
  text-align: center;
  padding: 40px;
  color: $text-muted;
  font-size: 13px;
}
</style>

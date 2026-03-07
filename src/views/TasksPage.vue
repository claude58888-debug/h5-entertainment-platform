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
          <div class="task-left">
            <div class="task-icon-wrap">
              <span class="task-icon">{{ getTaskIcon(task) }}</span>
            </div>
            <div class="task-info">
              <h4>{{ task.title }}</h4>
              <p>{{ task.description }}</p>
              <div class="task-progress">
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: Math.min(100, (task.progress / task.target) * 100) + '%' }"
                  ></div>
                </div>
                <span class="progress-text">{{ task.progress }}/{{ task.target }}</span>
              </div>
            </div>
          </div>
          <div class="task-reward-section">
            <span class="reward-amount">+{{ task.reward }}</span>
            <span class="reward-unit">{{ task.rewardUnit }}</span>
            <van-button
              size="small"
              round
              :type="task.claimed ? 'default' : task.progress >= task.target ? 'primary' : 'default'"
              :disabled="task.claimed || task.progress < task.target"
              :class="{ 'btn-claimable': !task.claimed && task.progress >= task.target }"
              @click="claimTask(task)"
            >
              {{ task.claimed ? '已领取' : task.progress >= task.target ? '领取' : '未完成' }}
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
import { mockTasks, mockSignInDays } from '@/mock'
import { showToast } from 'vant'

const tasks = ref(JSON.parse(JSON.stringify(mockTasks)))
const signInDays = ref(JSON.parse(JSON.stringify(mockSignInDays)))
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
  'daily': '📋',
  'newbie': '🌟',
  'weekly': '📅'
}

function getTaskIcon(task) {
  return taskIconMap[task.type] || '📋'
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.task-left {
  flex: 1;
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 0;
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
    margin-bottom: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.task-progress {
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

.task-reward-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.reward-amount {
  font-size: 18px;
  font-weight: 700;
  color: $accent-gold;
}

.reward-unit {
  font-size: 10px;
  color: $text-muted;
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

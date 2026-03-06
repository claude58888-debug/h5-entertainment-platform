<template>
  <div class="tasks-page">
    <van-nav-bar
      :title="t('tasks.title')"
      left-arrow
      @click-left="$router.back()"
      fixed
      :style="{ maxWidth: '480px', margin: '0 auto' }"
    />
    <div class="page-content" style="padding-top: 46px;">
      <div class="section-title">{{ t('tasks.daily') }}</div>
      <div class="task-list">
        <div v-for="task in tasks" :key="task.id" class="task-card">
          <div class="task-info">
            <h4>{{ task.title }}</h4>
            <p>{{ task.description }}</p>
            <div class="task-progress">
              <van-progress
                :percentage="(task.progress / task.target) * 100"
                stroke-width="6"
                color="#7c3aed"
                track-color="#1e2a4a"
              />
              <span class="progress-text">{{ task.progress }}/{{ task.target }}</span>
            </div>
          </div>
          <div class="task-reward">
            <span class="reward-amount">+{{ task.reward }}</span>
            <span class="reward-unit">{{ task.rewardUnit }}</span>
            <van-button
              size="small"
              round
              :type="task.claimed ? 'default' : 'primary'"
              :disabled="task.claimed || task.progress < task.target"
              @click="claimTask(task)"
            >
              {{ task.claimed ? t('tasks.claimed') : t('tasks.claim') }}
            </van-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { mockTasks } from '@/mock'
import { showToast } from 'vant'

const { t } = useI18n()
const tasks = ref(JSON.parse(JSON.stringify(mockTasks)))

function claimTask(task) {
  task.claimed = true
  showToast({ message: `+${task.reward} ${task.rewardUnit}`, type: 'success' })
}
</script>

<style lang="scss" scoped>
.page-content {
  padding: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
}

.task-card {
  background: $bg-card;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.task-info {
  flex: 1;

  h4 {
    font-size: 15px;
    margin-bottom: 4px;
  }

  p {
    font-size: 12px;
    color: $text-secondary;
    margin-bottom: 8px;
  }
}

.task-progress {
  display: flex;
  align-items: center;
  gap: 8px;

  :deep(.van-progress) {
    flex: 1;
  }
}

.progress-text {
  font-size: 11px;
  color: $text-muted;
  white-space: nowrap;
}

.task-reward {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
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
</style>

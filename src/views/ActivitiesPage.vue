<template>
  <div class="activities-page">
    <van-nav-bar
      title="活动中心"
      left-arrow
      @click-left="$router.back()"
      fixed
      :style="{ maxWidth: '480px', margin: '0 auto' }"
    />
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="page-content" style="padding-top: 46px;">
        <!-- Activity Type Tabs -->
        <div class="activity-tabs">
          <div
            v-for="tab in activityTabs"
            :key="tab.id"
            class="activity-tab"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <span class="tab-icon">{{ tab.icon }}</span>
            <span>{{ tab.label }}</span>
          </div>
        </div>

        <!-- Activity Cards -->
        <div class="activity-list">
          <div
            v-for="activity in filteredActivities"
            :key="activity.id"
            class="activity-card"
            :style="{ background: activity.gradient }"
          >
            <div class="activity-badge" v-if="activity.tag">{{ activity.tag }}</div>
            <div class="activity-header">
              <span class="activity-icon">{{ activity.icon }}</span>
              <div class="activity-title-wrap">
                <h3 class="activity-title">{{ activity.title }}</h3>
                <p class="activity-desc">{{ activity.description }}</p>
              </div>
            </div>
            <div class="activity-details">
              <div class="activity-reward">
                <span class="reward-label">奖励</span>
                <span class="reward-value">{{ activity.reward }}</span>
              </div>
              <div class="activity-time">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <span>{{ activity.timeRange }}</span>
              </div>
            </div>
            <div class="activity-progress" v-if="activity.progress !== undefined">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: Math.min(100, (activity.progress / activity.target) * 100) + '%' }"></div>
              </div>
              <span class="progress-text">{{ activity.progress }}/{{ activity.target }}</span>
            </div>
            <div class="activity-footer">
              <van-button
                size="small"
                round
                :type="activity.claimed ? 'default' : 'primary'"
                :disabled="activity.claimed"
                :class="{ 'btn-claim': !activity.claimed }"
                @click="claimActivity(activity)"
              >
                {{ activity.claimed ? '已领取' : '立即领取' }}
              </van-button>
              <span class="activity-participants">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                {{ activity.participants }}人已参与
              </span>
            </div>
          </div>
        </div>

        <div v-if="filteredActivities.length === 0" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/></svg>
          <p>暂无活动</p>
        </div>
      </div>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { showToast } from 'vant'

const refreshing = ref(false)
const activeTab = ref('all')

const activityTabs = [
  { id: 'all', label: '全部', icon: '📋' },
  { id: 'deposit', label: '充值', icon: '💰' },
  { id: 'invite', label: '邀请', icon: '👥' },
  { id: 'daily', label: '每日', icon: '📅' }
]

const activities = ref([
  {
    id: 1,
    title: '新人欢迎礼',
    description: '新用户注册即可领取丰厚奖励，首次充值额外赠送100%',
    reward: '最高588 USDT',
    timeRange: '长期有效',
    icon: '🎁',
    tag: '热门',
    gradient: 'linear-gradient(135deg, #f0a030, #e67e22)',
    type: 'deposit',
    claimed: false,
    participants: 12580
  },
  {
    id: 2,
    title: '首充双倍',
    description: '每日首次充值享受双倍赠送，最高可获得1888U奖励',
    reward: '最高1888 USDT',
    timeRange: '每日 00:00 - 23:59',
    icon: '💎',
    tag: '限时',
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    type: 'deposit',
    claimed: false,
    progress: 0,
    target: 1,
    participants: 8920
  },
  {
    id: 3,
    title: '邀请好友奖励',
    description: '每成功邀请一位好友注册并充值，即可获得50U奖励',
    reward: '50 USDT/人',
    timeRange: '长期有效',
    icon: '👥',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    type: 'invite',
    claimed: false,
    progress: 3,
    target: 10,
    participants: 5630
  },
  {
    id: 4,
    title: '每日签到',
    description: '每日签到可领取随机奖励，连续签到7天额外获得大礼包',
    reward: '最高18 USDT/天',
    timeRange: '每日 00:00 可签到',
    icon: '✅',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    type: 'daily',
    claimed: false,
    progress: 4,
    target: 7,
    participants: 23450
  },
  {
    id: 5,
    title: '充值返利',
    description: '单笔充值满500U，即可获得额外5%返利奖励',
    reward: '充值金额5%',
    timeRange: '2026-03-01 至 2026-04-30',
    icon: '🔥',
    tag: '限时',
    gradient: 'linear-gradient(135deg, #e17055, #d63031)',
    type: 'deposit',
    claimed: false,
    participants: 6780
  },
  {
    id: 6,
    title: '推广达人',
    description: '邀请10位好友注册并活跃，获得超级推广大礼包',
    reward: '888 USDT',
    timeRange: '长期有效',
    icon: '🏆',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    type: 'invite',
    claimed: false,
    progress: 3,
    target: 10,
    participants: 1250
  }
])

const filteredActivities = computed(() => {
  if (activeTab.value === 'all') return activities.value
  return activities.value.filter(a => a.type === activeTab.value)
})

function claimActivity(activity) {
  if (activity.claimed) return
  if (activity.progress !== undefined && activity.progress < activity.target) {
    showToast({ message: '任务未完成，无法领取', position: 'bottom' })
    return
  }
  activity.claimed = true
  showToast({ message: '领取成功！', type: 'success' })
}

async function onRefresh() {
  await new Promise(r => setTimeout(r, 800))
  refreshing.value = false
  showToast({ message: '刷新成功', position: 'bottom' })
}
</script>

<style lang="scss" scoped>
.page-content {
  padding: 12px;
  min-height: 80vh;
}

.activity-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding: 4px 0;
}

.activity-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 20px;
  background: $bg-card;
  font-size: 13px;
  color: $text-secondary;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    background: linear-gradient(135deg, $accent-purple, $accent-purple-glow);
    color: #fff;
  }

  .tab-icon {
    font-size: 14px;
  }
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.activity-card {
  border-radius: 14px;
  padding: 18px;
  position: relative;
  overflow: hidden;
}

.activity-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: $accent-red;
  color: #fff;
  font-size: 10px;
  padding: 2px 10px 2px 14px;
  border-radius: 0 14px 0 14px;
  font-weight: 600;
}

.activity-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.activity-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.activity-title {
  font-size: 17px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.activity-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}

.activity-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 8px;
}

.activity-reward {
  display: flex;
  flex-direction: column;
  gap: 2px;

  .reward-label {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.6);
  }

  .reward-value {
    font-size: 15px;
    font-weight: 700;
    color: $accent-gold-light;
  }
}

.activity-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

.activity-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;

  .progress-bar {
    flex: 1;
    height: 6px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, $accent-gold, $accent-gold-light);
    border-radius: 3px;
    transition: width 0.3s;
  }

  .progress-text {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.7);
    white-space: nowrap;
  }
}

.activity-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .btn-claim {
    background: linear-gradient(135deg, #fff, #f0f0f0) !important;
    color: #333 !important;
    border: none !important;
    font-weight: 600;
  }
}

.activity-participants {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: $text-muted;

  p { margin-top: 12px; }
}
</style>

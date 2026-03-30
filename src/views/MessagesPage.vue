<template>
  <div class="messages-page">
    <van-nav-bar :title="$t('messages.title')" left-arrow @click-left="$router.back()" fixed :style="{ maxWidth: '480px', margin: '0 auto' }">
      <template #right>
        <span v-if="notificationStore.unreadCount > 0" class="mark-all-btn" @click="notificationStore.markAllAsRead()">{{ $t('messages.markAllRead') }}</span>
      </template>
    </van-nav-bar>
    <div class="page-content" style="padding-top: 46px;">
      <!-- Tabs: All / System / Personal -->
      <van-tabs v-model:active="activeTab" shrink sticky :offset-top="46" class="msg-tabs">
        <van-tab :title="tabTitle('all')" name="all" />
        <van-tab :title="tabTitle('system')" name="system" />
        <van-tab :title="tabTitle('personal')" name="personal" />
      </van-tabs>

      <!-- Message Detail View -->
      <template v-if="selectedMessage">
        <div class="message-detail">
          <div class="detail-header">
            <div class="detail-icon-wrap" :class="selectedMessage.type">
              <van-icon :name="selectedMessage.icon" />
            </div>
            <div class="detail-meta">
              <h3>{{ selectedMessage.title }}</h3>
              <span class="detail-time">{{ selectedMessage.time }}</span>
              <span class="detail-type-badge" :class="selectedMessage.type">{{ $t('messages.' + selectedMessage.type) }}</span>
            </div>
          </div>
          <div class="detail-body">
            <p>{{ selectedMessage.content }}</p>
          </div>
          <div class="detail-actions">
            <van-button size="small" round plain @click="selectedMessage = null">{{ $t('messages.back') }}</van-button>
            <van-button size="small" round type="danger" plain @click="handleDelete(selectedMessage.id)">{{ $t('messages.delete') }}</van-button>
          </div>
        </div>
      </template>

      <!-- Message List -->
      <template v-else>
        <div class="message-list">
          <div
            v-for="msg in filteredMessages"
            :key="msg.id"
            class="message-item"
            :class="{ unread: !msg.read }"
            @click="openMessage(msg)"
          >
            <div class="msg-icon-wrap" :class="msg.type">
              <van-icon :name="msg.icon" />
            </div>
            <div class="msg-content">
              <div class="msg-top">
                <span class="msg-title">{{ msg.title }}</span>
                <span class="msg-time">{{ formatTime(msg.time) }}</span>
              </div>
              <p class="msg-summary">{{ msg.summary }}</p>
            </div>
            <div v-if="!msg.read" class="unread-dot"></div>
          </div>
          <van-empty v-if="!filteredMessages.length" :description="$t('messages.noMessages')" image="search" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNotificationStore } from '@/stores/notification'

const { t } = useI18n()
const notificationStore = useNotificationStore()

const activeTab = ref('all')
const selectedMessage = ref(null)

const filteredMessages = computed(() => {
  return notificationStore.getMessagesByType(activeTab.value)
})

function tabTitle(type) {
  const unread = notificationStore.getUnreadByType(type).length
  const label = type === 'all' ? t('messages.all') : t('messages.' + type)
  return unread > 0 ? `${label} (${unread})` : label
}

function formatTime(timeStr) {
  const date = new Date(timeStr)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) {
    return timeStr.split(' ')[1] || timeStr
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays}d ago`
  }
  return timeStr.split(' ')[0]
}

function openMessage(msg) {
  notificationStore.markAsRead(msg.id)
  selectedMessage.value = msg
}

function handleDelete(id) {
  notificationStore.deleteMessage(id)
  selectedMessage.value = null
}
</script>

<style lang="scss" scoped>
.page-content {
  min-height: 100vh;
}

.msg-tabs {
  :deep(.van-tabs__nav) {
    background: $bg-secondary;
  }
  :deep(.van-tab) {
    color: $text-muted;
  }
  :deep(.van-tab--active) {
    color: $accent-purple-light;
  }
  :deep(.van-tabs__line) {
    background: $accent-purple;
  }
}

.mark-all-btn {
  font-size: 12px;
  color: $accent-purple-light;
  cursor: pointer;
  white-space: nowrap;
}

.message-list {
  padding: 8px 16px 16px;
}

.message-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  background: $bg-card;
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  position: relative;
  transition: background 0.2s;

  &:active {
    background: $bg-card-hover;
  }

  &.unread {
    border-left: 3px solid $accent-purple;
  }
}

.msg-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .van-icon {
    font-size: 20px;
    color: #fff;
  }

  &.system {
    background: rgba($accent-blue, 0.2);
    .van-icon { color: $accent-blue; }
  }
  &.personal {
    background: rgba($accent-green, 0.2);
    .van-icon { color: $accent-green; }
  }
}

.msg-content {
  flex: 1;
  min-width: 0;
}

.msg-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.msg-title {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 8px;
}

.msg-time {
  font-size: 11px;
  color: $text-muted;
  white-space: nowrap;
}

.msg-summary {
  font-size: 12px;
  color: $text-muted;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: $accent-red;
  flex-shrink: 0;
  margin-top: 6px;
}

/* Message Detail */
.message-detail {
  padding: 16px;
}

.detail-header {
  display: flex;
  gap: 14px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid $border-color;
}

.detail-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .van-icon {
    font-size: 24px;
  }

  &.system {
    background: rgba($accent-blue, 0.2);
    .van-icon { color: $accent-blue; }
  }
  &.personal {
    background: rgba($accent-green, 0.2);
    .van-icon { color: $accent-green; }
  }
}

.detail-meta {
  h3 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 6px;
  }
}

.detail-time {
  font-size: 12px;
  color: $text-muted;
  display: block;
  margin-bottom: 6px;
}

.detail-type-badge {
  display: inline-block;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 8px;

  &.system {
    background: rgba($accent-blue, 0.15);
    color: $accent-blue;
  }
  &.personal {
    background: rgba($accent-green, 0.15);
    color: $accent-green;
  }
}

.detail-body {
  padding: 16px;
  background: $bg-card;
  border-radius: 12px;
  margin-bottom: 20px;

  p {
    font-size: 14px;
    line-height: 1.8;
    color: $text-secondary;
  }
}

.detail-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>

<template>
  <div class="video-page">
    <van-nav-bar
      :title="t('video.title')"
      left-arrow
      @click-left="$router.back()"
      fixed
      :style="{ maxWidth: '480px', margin: '0 auto' }"
    />
    <div class="page-content" style="padding-top: 46px;">
      <div class="video-tabs">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-item"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span>{{ tab.name }}</span>
        </div>
      </div>

      <div class="video-grid">
        <div v-for="i in 6" :key="i" class="video-card">
          <div class="video-thumb">
            <img :src="`https://picsum.photos/360/200?random=${80 + i}`" alt="video" />
            <div class="play-btn">▶</div>
            <span class="duration">{{ Math.floor(Math.random() * 30 + 5) }}:{{ String(Math.floor(Math.random() * 60)).padStart(2, '0') }}</span>
          </div>
          <div class="video-info">
            <span class="video-title">Video Title {{ i }}</span>
            <span class="video-views">{{ Math.floor(Math.random() * 10000) }} views</span>
          </div>
        </div>
      </div>

      <div class="coming-soon-banner">
        <span>🔮</span>
        <p>{{ t('common.comingSoon') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const activeTab = ref('adult')

const tabs = [
  { id: 'adult', name: t('video.adult'), icon: '🔞' },
  { id: 'movies', name: t('video.movies'), icon: '🎬' },
  { id: 'hot', name: t('video.hot'), icon: '🔥' }
]
</script>

<style lang="scss" scoped>
.page-content {
  padding: 16px;
}

.video-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab-item {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  background: $bg-card;
  text-align: center;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 2px solid transparent;

  &.active {
    border-color: $accent-purple;
    background: rgba($accent-purple, 0.15);
  }
}

.video-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.video-card {
  border-radius: 10px;
  overflow: hidden;
  background: $bg-card;
}

.video-thumb {
  position: relative;
  height: 100px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .play-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 14px;
  }

  .duration {
    position: absolute;
    bottom: 4px;
    right: 4px;
    background: rgba(0, 0, 0, 0.7);
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 10px;
  }
}

.video-info {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.video-title {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-views {
  font-size: 10px;
  color: $text-muted;
}

.coming-soon-banner {
  text-align: center;
  padding: 40px;
  margin-top: 20px;
  border: 1px dashed $border-color;
  border-radius: 12px;
  color: $text-muted;

  span { font-size: 36px; }
  p { margin-top: 8px; font-size: 14px; }
}
</style>

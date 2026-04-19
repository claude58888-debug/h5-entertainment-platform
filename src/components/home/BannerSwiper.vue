<template>
  <div class="banner-swiper">
    <van-skeleton :loading="!banners.length" :row="0" class="banner-skeleton">
      <template #template>
        <div class="skeleton-banner"></div>
      </template>
    </van-skeleton>
    <swiper
      v-if="banners.length"
      :modules="[Autoplay, Pagination]"
      :autoplay="{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }"
      :pagination="{ clickable: true }"
      :loop="true"
      :space-between="0"
      :speed="600"
      class="banner-container"
    >
      <swiper-slide v-for="banner in banners" :key="banner.id">
        <router-link :to="banner.link" class="banner-slide">
          <img v-if="bannerHasImage(banner)" :src="banner.image" :alt="banner.title" class="banner-image" @error="(e) => onImgError(e, banner.id)" />
          <div v-if="!bannerHasImage(banner)" class="banner-placeholder">
            <div class="banner-content">
              <h3 class="banner-title">{{ banner.title }}</h3>
              <p class="banner-subtitle">{{ banner.subtitle }}</p>
              <span class="banner-btn">{{ $t('banner.learnMore') }}</span>
            </div>
          </div>
        </router-link>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination } from 'swiper/modules'
import { useAppStore } from '@/stores/app'
import 'swiper/css'
import 'swiper/css/pagination'

const appStore = useAppStore()
const banners = computed(() => appStore.banners)
const failedImages = ref(new Set())

function bannerHasImage(banner) {
  return banner.image && !failedImages.value.has(banner.id)
}

function onImgError(e, bannerId) {
  e.target.style.display = 'none'
  failedImages.value.add(bannerId)
  failedImages.value = new Set(failedImages.value)
}
</script>

<style lang="scss" scoped>
.banner-swiper {
  margin: 10px 12px 4px;
  border-radius: $radius-lg;
  overflow: hidden;
}

.banner-container {
  height: $banner-height;
  border-radius: $radius-lg;

  :deep(.swiper-pagination-bullet) {
    background: rgba(255, 255, 255, 0.35);
    opacity: 1;
    width: 6px;
    height: 6px;
  }
  :deep(.swiper-pagination-bullet-active) {
    background: $accent-gold;
    width: 16px;
    border-radius: 3px;
  }
}

.banner-slide {
  display: block;
  height: $banner-height;
  position: relative;
  overflow: hidden;
  background: $bg-card;
}

.banner-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #213743 0%, #1a2c38 100%);
}

.banner-content {
  position: relative;
  z-index: 2;
}

.banner-title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 6px;
}

.banner-subtitle {
  font-size: 12px;
  color: $text-secondary;
  margin-bottom: 12px;
}

.banner-btn {
  display: inline-block;
  padding: 6px 14px;
  background: $accent-gold;
  color: #0b1a23;
  border-radius: $radius-md;
  font-size: 12px;
  font-weight: 700;
}

.skeleton-banner {
  width: 100%;
  height: $banner-height;
  background: $bg-card;
  border-radius: $radius-lg;
}
</style>

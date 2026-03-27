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
      :autoplay="{ delay: 3000, disableOnInteraction: false }"
      :pagination="{ clickable: true }"
      :loop="true"
      :space-between="0"
      class="banner-container"
    >
      <swiper-slide v-for="banner in banners" :key="banner.id">
        <router-link :to="banner.link" class="banner-slide" :style="{ background: banner.gradient }">
          <img v-if="bannerHasImage(banner)" :src="banner.image" :alt="banner.title" class="banner-image" @error="(e) => onImgError(e, banner.id)" />
          <div v-if="!bannerHasImage(banner)" class="banner-content">
            <h3 class="banner-title">{{ banner.title }}</h3>
            <p class="banner-subtitle">{{ banner.subtitle }}</p>
            <span class="banner-btn">了解详情</span>
          </div>
          <div v-if="!bannerHasImage(banner)" class="banner-decos">
            <div class="deco-circle d1"></div>
            <div class="deco-circle d2"></div>
            <div class="deco-circle d3"></div>
            <div class="deco-diamond"></div>
            <div class="deco-coin">
              <div class="coin-inner">$</div>
            </div>
            <div class="deco-dots">
              <span></span><span></span><span></span>
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
  margin: 2px 12px 0px;
  border-radius: 12px;
  overflow: hidden;
}

.banner-container {
  height: $banner-height;
  border-radius: 12px;

  :deep(.swiper-pagination-bullet) {
    background: rgba(255, 255, 255, 0.5);
    opacity: 1;
    width: 6px;
    height: 6px;
  }
  :deep(.swiper-pagination-bullet-active) {
    background: #fff;
    width: 16px;
    border-radius: 3px;
  }
}

.banner-slide {
  display: flex;
  align-items: center;
  height: $banner-height;
  padding: 20px 24px;
  position: relative;
  overflow: hidden;
}

.banner-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.banner-content {
  position: relative;
  z-index: 3;
}

.banner-title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 6px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.banner-subtitle {
  font-size: 12px;
  color: rgba(255,255,255,0.8);
  margin-bottom: 12px;
}

.banner-btn {
  display: inline-block;
  padding: 4px 14px;
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.4);
  border-radius: 14px;
  font-size: 11px;
  color: #fff;
}

.banner-decos {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.1);

  &.d1 {
    width: 120px;
    height: 120px;
    right: -20px;
    top: -30px;
    background: rgba(255,255,255,0.05);
  }
  &.d2 {
    width: 80px;
    height: 80px;
    right: 40px;
    bottom: -20px;
    border-color: rgba(255,255,255,0.08);
  }
  &.d3 {
    width: 40px;
    height: 40px;
    right: 100px;
    top: 15px;
    background: rgba(255,255,255,0.06);
    border: none;
  }
}

.deco-diamond {
  position: absolute;
  width: 30px;
  height: 30px;
  right: 80px;
  top: 50%;
  transform: rotate(45deg) translateY(-50%);
  border: 2px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.04);
}

.deco-coin {
  position: absolute;
  width: 44px;
  height: 44px;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
  border: 2px solid rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.coin-inner {
  font-size: 20px;
  font-weight: 700;
  color: rgba(255,255,255,0.3);
}

.deco-dots {
  position: absolute;
  right: 130px;
  bottom: 25px;
  display: flex;
  gap: 4px;

  span {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
  }
}

.skeleton-banner {
  width: 100%;
  height: $banner-height;
  border-radius: 12px;
  background: $bg-card;
}
</style>

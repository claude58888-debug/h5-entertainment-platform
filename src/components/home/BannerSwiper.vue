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
      :autoplay="{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }"
      :pagination="{ clickable: true }"
      :loop="true"
      :space-between="0"
      :speed="600"
      class="banner-container"
    >
      <swiper-slide v-for="banner in banners" :key="banner.id">
        <router-link :to="banner.link" class="banner-slide" :style="{ background: banner.gradient }">
          <img v-if="bannerHasImage(banner)" :src="banner.image" :alt="banner.title" class="banner-image" @error="(e) => onImgError(e, banner.id)" />
          <div v-if="!bannerHasImage(banner)" class="banner-content">
            <h3 class="banner-title">{{ banner.title }}</h3>
            <p class="banner-subtitle">{{ banner.subtitle }}</p>
          </div>
          <div v-if="!bannerHasImage(banner)" class="banner-decos">
            <span v-if="banner.highlight" class="deco-big-number" :data-len="banner.highlight.length">{{ banner.highlight }}</span>
            <div class="deco-gold-sheen"></div>
            <div class="deco-circle d1"></div>
            <div class="deco-circle d2"></div>
            <div class="deco-circle d3"></div>
            <div class="deco-diamond"></div>
            <!-- stacked coins -->
            <svg class="deco-coin-stack" viewBox="0 0 80 80" fill="none" aria-hidden="true">
              <ellipse cx="40" cy="64" rx="28" ry="8" fill="#f0d78c" fill-opacity="0.65"/>
              <ellipse cx="40" cy="56" rx="28" ry="8" fill="#d4a843" fill-opacity="0.55"/>
              <rect x="12" y="56" width="56" height="8" fill="#c9a654" fill-opacity="0.55"/>
              <ellipse cx="40" cy="44" rx="28" ry="8" fill="#f0d78c" fill-opacity="0.75"/>
              <rect x="12" y="44" width="56" height="12" fill="#d4a843" fill-opacity="0.65"/>
              <ellipse cx="40" cy="44" rx="28" ry="8" fill="none" stroke="#fff6d9" stroke-opacity="0.8" stroke-width="1"/>
              <text x="40" y="49" text-anchor="middle" font-size="14" font-weight="900" fill="#1a1407" fill-opacity="0.9" font-family="Manrope, system-ui, sans-serif">$</text>
            </svg>
            <!-- sparkles -->
            <svg class="deco-sparkle s1" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z" fill="#fff6d9" fill-opacity="0.95"/>
            </svg>
            <svg class="deco-sparkle s2" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z" fill="#f0d78c" fill-opacity="0.85"/>
            </svg>
            <svg class="deco-sparkle s3" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z" fill="#ffffff" fill-opacity="0.8"/>
            </svg>
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
  margin: 10px 14px 4px;
  border-radius: $radius-lg;
  overflow: hidden;
}

.banner-container {
  height: $banner-height;
  border-radius: $radius-lg;

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
  border-radius: $radius-lg;
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
  max-width: 62%;
}

.banner-title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 6px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.45);
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

// Large faded number/highlight text as background decoration
.deco-big-number {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  font-family: 'Manrope', 'SF Pro Display', system-ui, sans-serif;
  font-size: 78px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -2px;
  color: transparent;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.04) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-stroke: 1px rgba(255, 255, 255, 0.22);
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  pointer-events: none;
  z-index: 2;
  white-space: nowrap;
  font-feature-settings: "tnum";

  &[data-len="4"] { font-size: 68px; }
  &[data-len="5"] { font-size: 60px; letter-spacing: -3px; }
}

// Gold sheen overlay for 2.5D feel
.deco-gold-sheen {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(220px 120px at 90% 50%, rgba(240, 215, 140, 0.28), transparent 70%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, transparent 40%);
  pointer-events: none;
}

.deco-coin-stack {
  position: absolute;
  right: 18px;
  bottom: 14px;
  width: 76px;
  height: 76px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.35));
  animation: coinBob 3.6s ease-in-out infinite;
}

@keyframes coinBob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.deco-sparkle {
  position: absolute;
  animation: sparkleTwinkle 2.4s ease-in-out infinite;

  &.s1 { top: 14px; right: 86px; width: 14px; height: 14px; animation-delay: 0s; }
  &.s2 { bottom: 28px; right: 100px; width: 10px; height: 10px; animation-delay: 0.6s; }
  &.s3 { top: 38px; right: 40px; width: 8px;  height: 8px;  animation-delay: 1.2s; }
}

@keyframes sparkleTwinkle {
  0%, 100% { transform: scale(0.6); opacity: 0.3; }
  50%      { transform: scale(1);   opacity: 1; }
}

.skeleton-banner {
  width: 100%;
  height: $banner-height;
  border-radius: 12px;
  background: $bg-card;
}
</style>

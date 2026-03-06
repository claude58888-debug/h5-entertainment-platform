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
        <router-link :to="banner.link">
          <img v-lazy="banner.image" :alt="banner.title" class="banner-img" />
        </router-link>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination } from 'swiper/modules'
import { useAppStore } from '@/stores/app'
import 'swiper/css'
import 'swiper/css/pagination'

const appStore = useAppStore()
const banners = computed(() => appStore.banners)
</script>

<style lang="scss" scoped>
.banner-swiper {
  margin: 8px 12px;
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
    background: $accent-purple-light;
    width: 16px;
    border-radius: 3px;
  }
}

.banner-img {
  width: 100%;
  height: $banner-height;
  object-fit: cover;
}

.skeleton-banner {
  width: 100%;
  height: $banner-height;
  border-radius: 12px;
  background: $bg-card;
}
</style>

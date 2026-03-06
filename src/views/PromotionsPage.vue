<template>
  <div class="promotions-page">
    <van-nav-bar
      :title="t('promotions.title')"
      left-arrow
      @click-left="$router.back()"
      fixed
      :style="{ maxWidth: '480px', margin: '0 auto' }"
    />
    <div class="page-content" style="padding-top: 46px;">
      <div v-for="promo in promotions" :key="promo.id" class="promo-card">
        <div class="promo-image">
          <img v-lazy="promo.image" :alt="promo.title" />
        </div>
        <div class="promo-info">
          <h3>{{ promo.title }}</h3>
          <p>{{ promo.description }}</p>
          <div class="promo-footer">
            <span class="promo-date">{{ promo.startDate }} ~ {{ promo.endDate }}</span>
            <van-button size="small" type="primary" round>{{ t('promotions.apply') }}</van-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { mockPromotions } from '@/mock'

const { t } = useI18n()
const promotions = mockPromotions
</script>

<style lang="scss" scoped>
.page-content {
  padding: 16px;
}

.promo-card {
  background: $bg-card;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
}

.promo-image {
  width: 100%;
  height: 160px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.promo-info {
  padding: 12px 16px 16px;

  h3 {
    font-size: 16px;
    margin-bottom: 6px;
  }

  p {
    font-size: 13px;
    color: $text-secondary;
    margin-bottom: 12px;
    line-height: 1.4;
  }
}

.promo-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.promo-date {
  font-size: 11px;
  color: $text-muted;
}
</style>

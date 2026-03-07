<template>
  <div class="income-page">
    <van-nav-bar
      :title="t('income.title')"
      left-arrow
      @click-left="$router.back()"
      fixed
      :style="{ maxWidth: '480px', margin: '0 auto' }"
    />
    <div class="page-content" style="padding-top: 46px;">
      <div class="income-cards">
        <div class="income-card primary">
          <span class="card-label">{{ t('income.total') }}</span>
          <span class="card-amount">2,580.00</span>
          <span class="card-unit">USDT</span>
        </div>
        <div class="income-row">
          <div class="income-card">
            <span class="card-label">{{ t('income.today') }}</span>
            <span class="card-amount small">128.50</span>
          </div>
          <div class="income-card">
            <span class="card-label">{{ t('income.commission') }}</span>
            <span class="card-amount small">356.00</span>
          </div>
        </div>
      </div>

      <div class="history-section">
        <h3>{{ t('income.history') }}</h3>
        <div class="history-list">
          <div v-for="i in 5" :key="i" class="history-item">
            <div class="item-left">
              <span class="item-type">{{ i % 2 === 0 ? 'Commission' : 'Betting Reward' }}</span>
              <span class="item-time">2024-0{{ i }}-15 14:30</span>
            </div>
            <span class="item-amount">+{{ (Math.random() * 100).toFixed(2) }} USDT</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<style lang="scss" scoped>
.page-content {
  padding: 16px;
}

.income-cards {
  margin-bottom: 24px;
}

.income-card {
  background: $bg-card;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &.primary {
    background: linear-gradient(135deg, $accent-purple, #4c1d95);
    margin-bottom: 10px;
  }
}

.income-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.card-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.card-amount {
  font-size: 28px;
  font-weight: 700;

  &.small { font-size: 20px; }
}

.card-unit {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.history-section {
  h3 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 12px;
  }
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: $bg-card;
  border-radius: 10px;
  margin-bottom: 8px;
}

.item-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-type {
  font-size: 14px;
}

.item-time {
  font-size: 11px;
  color: $text-muted;
}

.item-amount {
  font-size: 15px;
  font-weight: 600;
  color: $accent-gold;
}
</style>

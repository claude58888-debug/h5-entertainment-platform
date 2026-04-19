<template>
  <section class="live-feed">
    <header class="feed-header">
      <div class="feed-title">
        <span class="live-dot" aria-hidden="true"></span>
        {{ $t('header.liveFeedTitle') }}
      </div>
    </header>
    <div class="feed-list">
      <transition-group name="feed">
        <div
          v-for="row in visibleRows"
          :key="row.id"
          class="feed-row"
        >
          <div class="feed-user">
            <span class="user-avatar" aria-hidden="true">{{ row.user[0] }}</span>
            <span class="user-name">{{ row.user }}</span>
          </div>
          <div class="feed-game">{{ row.game }}</div>
          <div class="feed-amount num-mono" :class="row.amount >= 0 ? 'positive' : 'negative'">
            {{ formatAmount(row.amount) }}
          </div>
        </div>
      </transition-group>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const USERS = ['Alpha_7', 'Ryu88', 'HighRoller', 'LuckyCat', 'Prism', 'NovaX', 'Crown', 'Sushi', 'Mono9', 'Kairo', 'Falcon', 'Pixel']
const GAMES = ['Plinko', 'Crash', 'Mines', 'Sweet Bonanza', 'Gates of Olympus', 'Dice', 'Baccarat', 'Fortune Tiger', 'Limbo']

function randomRow(id) {
  const user = USERS[Math.floor(Math.random() * USERS.length)]
  const game = GAMES[Math.floor(Math.random() * GAMES.length)]
  const win = Math.random() > 0.35
  const base = (Math.random() * 920 + 5)
  return {
    id,
    user: user.length > 9 ? user.slice(0, 7) + '*' : user[0] + '***' + user.slice(-1),
    game,
    amount: win ? base : -base * 0.5
  }
}

const rows = ref(Array.from({ length: 6 }, (_, i) => randomRow(i)))
let nextId = rows.value.length
let timerId = null

const visibleRows = computed(() => rows.value.slice(0, 6))

function formatAmount(amount) {
  const sign = amount >= 0 ? '+' : '-'
  const abs = Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${sign}${abs}`
}

function tick() {
  rows.value = [randomRow(nextId++), ...rows.value].slice(0, 6)
}

onMounted(() => {
  timerId = setInterval(tick, 2500)
})

onUnmounted(() => {
  if (timerId) clearInterval(timerId)
})
</script>

<style lang="scss" scoped>
.live-feed {
  margin: 16px 12px 0;
  background: $bg-card;
  border: 1px solid $border-subtle;
  border-radius: $radius-lg;
  padding: 12px;
}

.feed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.feed-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: $text-primary;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: $accent-green;
  box-shadow: 0 0 6px rgba(0, 231, 1, 0.6);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.feed-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.feed-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 12px;
  border-bottom: 1px solid $border-subtle;

  &:last-child { border-bottom: none; }
}

.feed-user {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.user-avatar {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: $bg-card-hover;
  color: $accent-gold;
  font-size: 10px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-name {
  color: $text-secondary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.feed-game {
  color: $text-muted;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.feed-amount {
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.2px;

  &.positive { color: $accent-green; }
  &.negative { color: $text-muted; }
}

.feed-enter-active,
.feed-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.feed-enter-from { opacity: 0; transform: translateY(-8px); }
.feed-leave-to   { opacity: 0; transform: translateY(4px); }
</style>

<template>
  <div class="balance-card glass-card">
    <div class="balance-top">
      <div class="balance-meta">
        <span class="balance-label">{{ $t('home.availableBalance') }} <span class="usdt-tag">USDT</span></span>
        <div class="balance-amount-row">
          <span class="balance-amount num">{{ displayAmount }}</span>
          <button
            class="refresh-btn"
            :class="{ spinning: refreshing }"
            @click="refresh"
            :aria-label="$t('common.refresh')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 4v6h-6"/>
              <path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="vip-badge" @click="$router.push('/vip')" role="button">
        <span class="vip-crown">👑</span>
        <span class="vip-text">VIP{{ vipLevel }}</span>
      </div>
    </div>

    <div class="balance-actions">
      <button class="qa" :class="{ 'qa-primary': a.key === 'deposit' }" v-for="a in actions" :key="a.key" @click="handleAction(a)">
        <span class="qa-icon">
          <svg v-if="a.icon === 'deposit'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <svg v-else-if="a.icon === 'withdraw'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
          </svg>
          <svg v-else-if="a.icon === 'transfer'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
          </svg>
          <svg v-else-if="a.icon === 'support'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 18v-6a9 9 0 0118 0v6"/>
            <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/>
          </svg>
        </span>
        <span class="qa-label">{{ $t(a.labelKey) }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useWalletStore } from '@/stores/wallet'

const router = useRouter()
const userStore = useUserStore()
const walletStore = useWalletStore()

const refreshing = ref(false)
const vipLevel = computed(() => userStore.user?.vipLevel ?? 5)

const displayAmount = computed(() => {
  if (!userStore.isLoggedIn) return '****.**'
  const v = Number(walletStore.balance || 0)
  return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})

async function refresh() {
  if (refreshing.value) return
  refreshing.value = true
  try {
    if (userStore.isLoggedIn) await walletStore.fetchBalance?.()
  } catch (e) { /* ignore */ }
  // full 360 spin takes ~0.7s; then stop
  setTimeout(() => { refreshing.value = false }, 700)
}

const actions = [
  { key: 'deposit',  labelKey: 'actions.deposit',  icon: 'deposit',  path: '/deposit',  authRequired: true },
  { key: 'withdraw', labelKey: 'actions.withdraw', icon: 'withdraw', path: '/withdraw', authRequired: true },
  { key: 'transfer', labelKey: 'actions.transfer', icon: 'transfer', path: '/recharge', authRequired: true },
  { key: 'support',  labelKey: 'actions.support',  icon: 'support',  path: '/support',  authRequired: false }
]

function handleAction(a) {
  if (a.authRequired && !userStore.isLoggedIn) {
    userStore.showLoginModal = true
    return
  }
  router.push(a.path)
}
</script>

<style lang="scss" scoped>
.balance-card {
  margin: 10px 14px 12px;
  padding: 14px 16px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(212, 168, 67, 0.28) !important;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.04) inset,
    0 8px 32px rgba(212, 168, 67, 0.08);

  // gold-tinted radial glow top-left + subtle inner gold hairline
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(420px 140px at 20% 0%, rgba(240, 215, 140, 0.18), transparent 70%),
      radial-gradient(320px 180px at 100% 100%, rgba(212, 168, 67, 0.10), transparent 70%);
    pointer-events: none;
  }

  // hairline gold top edge
  &::after {
    content: '';
    position: absolute;
    top: 0; left: 16px; right: 16px;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(240, 215, 140, 0.6) 50%, transparent 100%);
    pointer-events: none;
  }
}

.balance-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.balance-meta {
  flex: 1;
  min-width: 0;
}

.balance-label {
  font-size: 12px;
  color: $text-muted;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.usdt-tag {
  font-family: $font-mono;
  font-size: 10.5px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(212, 168, 67, 0.18);
  color: $gold-light;
  border: 1px solid rgba(201, 166, 84, 0.3);
}

.balance-amount-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}

.balance-amount {
  font-size: 28px;
  font-weight: 700;
  background: $gold-gradient;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.5px;
  line-height: 1.1;
}

.refresh-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid $border-color;
  color: $gold-light;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;

  &:hover { background: rgba(201, 166, 84, 0.12); }

  &.spinning svg {
    animation: spin360 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

@keyframes spin360 {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.vip-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: $radius-pill;
  background: $gold-gradient;
  color: #1a1407;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  box-shadow: $shadow-gold-soft;
  cursor: pointer;
  flex-shrink: 0;
}

.vip-crown { font-size: 12px; }

.balance-actions {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  position: relative;
  z-index: 1;
}

.qa {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px 8px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: $text-primary;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, transform 0.15s;

  &:hover {
    background: rgba(201, 166, 84, 0.08);
    border-color: rgba(201, 166, 84, 0.25);
  }

  &:active { transform: scale(0.96); }
}

.qa-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: $gold-light;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

// Deposit gets the prominent rectangular gold-gradient CTA treatment
.qa-primary {
  background: none;
  border: none;
  padding: 0;

  &:hover { background: none; }
}

.qa-primary .qa-icon {
  width: 100%;
  height: 44px;
  border-radius: 12px;
  background: $gold-gradient;
  border: 1px solid rgba(240, 215, 140, 0.65);
  color: #1a1407;
  box-shadow:
    0 4px 20px rgba(212, 168, 67, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
  position: relative;
  overflow: hidden;

  svg { width: 22px; height: 22px; }

  // subtle diagonal shine sweep
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -60%;
    width: 40%;
    height: 200%;
    background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.55) 50%, transparent 70%);
    transform: skewX(-20deg);
    animation: qaShine 3.5s ease-in-out infinite;
  }
}

// Primary deposit button caption sits below the rect CTA
.qa-primary .qa-label {
  color: $gold-light;
  font-weight: 700;
  margin-top: 2px;
}

@keyframes qaShine {
  0%, 60% { left: -60%; opacity: 0; }
  65% { opacity: 1; }
  100% { left: 140%; opacity: 0; }
}

.qa-label {
  font-size: 11.5px;
  color: $text-secondary;
  font-weight: 500;
}
</style>

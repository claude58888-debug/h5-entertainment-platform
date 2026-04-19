<template>
  <div class="search-bar">
    <label class="search-input-wrapper">
      <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7"/>
        <path d="M20 20l-3.5-3.5"/>
      </svg>
      <input
        v-model="query"
        type="search"
        class="search-input"
        :placeholder="$t('header.searchPlaceholder')"
        :aria-label="$t('header.searchPlaceholder')"
        @keyup.enter="emitSearch"
      />
      <button
        v-if="query"
        class="search-clear"
        :aria-label="$t('common.cancel')"
        @click="clear"
      >×</button>
    </label>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['search'])

const query = ref('')

function emitSearch() {
  emit('search', query.value.trim())
}

function clear() {
  query.value = ''
  emit('search', '')
}
</script>

<style lang="scss" scoped>
.search-bar {
  padding: 10px 12px 4px;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 12px;
  background: $bg-card;
  border: 1px solid $border-subtle;
  border-radius: $radius-md;
  transition: border-color 0.15s ease;

  &:focus-within {
    border-color: rgba(212, 168, 67, 0.4);
  }
}

.search-icon {
  color: $text-muted;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: $text-primary;
  font-size: 13px;

  &::placeholder {
    color: $text-muted;
  }
}

.search-clear {
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  color: $text-secondary;
  border: none;
  border-radius: $radius-pill;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
}
</style>

<template>
  <div class="self-exclusion-page">
    <van-nav-bar title="自我排除" left-arrow @click-left="$router.back()" />

    <div class="page-content">
      <div v-if="exclusionStatus.active" class="active-exclusion">
        <div class="status-icon">🚫</div>
        <h3>自我排除已生效</h3>
        <p>排除类型: {{ typeLabels[exclusionStatus.exclusionType] || exclusionStatus.exclusionType }}</p>
        <p>开始时间: {{ exclusionStatus.startDate }}</p>
        <p>结束时间: {{ exclusionStatus.endDate }}</p>
        <p class="hint">在排除期间，您的账户将被暂停。如需帮助，请联系客服。</p>
      </div>

      <template v-else>
        <div class="info-section">
          <div class="info-icon">⚠️</div>
          <h3>什么是自我排除？</h3>
          <p>如果您觉得需要暂停游戏活动，可以选择自我排除。排除期间，您将无法登录或进行任何游戏活动。</p>
        </div>

        <div class="options-section">
          <h3>选择排除期限</h3>
          <van-radio-group v-model="selectedType">
            <van-cell-group inset>
              <van-cell v-for="opt in exclusionOptions" :key="opt.value" :title="opt.label" :label="opt.desc" clickable @click="selectedType = opt.value">
                <template #right-icon>
                  <van-radio :name="opt.value" />
                </template>
              </van-cell>
            </van-cell-group>
          </van-radio-group>
        </div>

        <div class="reason-section">
          <van-field v-model="reason" type="textarea" rows="3" placeholder="原因（可选）" />
        </div>

        <div class="action-section">
          <van-button type="danger" block round :loading="submitting" @click="handleSubmit">
            确认自我排除
          </van-button>
          <p class="warning-text">此操作不可自行撤销。排除期间您将无法访问账户。</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import request from '@/utils/request'

const selectedType = ref('24h')
const reason = ref('')
const submitting = ref(false)
const exclusionStatus = reactive({ active: false, exclusionType: '', startDate: '', endDate: '' })

const exclusionOptions = [
  { value: '24h', label: '24小时', desc: '暂停一天，冷静思考' },
  { value: '7d', label: '7天', desc: '暂停一周' },
  { value: '30d', label: '30天', desc: '暂停一个月' },
  { value: '6m', label: '6个月', desc: '暂停半年' },
  { value: 'permanent', label: '永久', desc: '永久自我排除，需联系客服解除' }
]

const typeLabels = { '24h': '24小时', '7d': '7天', '30d': '30天', '6m': '6个月', 'permanent': '永久' }

onMounted(async () => {
  try {
    const data = await request.get('/compliance/self-exclude/status')
    if (data?.active) {
      Object.assign(exclusionStatus, data)
    }
  } catch (e) {
    // Not excluded
  }
})

async function handleSubmit() {
  try {
    await showConfirmDialog({
      title: '确认自我排除',
      message: `您确定要自我排除 ${typeLabels[selectedType.value]} 吗？排除期间您将无法访问账户。此操作不可自行撤销。`,
      confirmButtonText: '确认排除',
      confirmButtonColor: '#ee0a24'
    })
  } catch {
    return
  }

  submitting.value = true
  try {
    await request.post('/compliance/self-exclude', {
      exclusionType: selectedType.value,
      reason: reason.value
    })
    showToast({ message: '自我排除已生效', position: 'bottom' })
    exclusionStatus.active = true
    exclusionStatus.exclusionType = selectedType.value
  } catch (e) {
    showToast({ message: e?.response?.data?.error || '操作失败', position: 'bottom' })
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.self-exclusion-page {
  min-height: 100vh;
  background: $bg-primary;
}

.page-content {
  padding: 16px;
}

.active-exclusion {
  text-align: center;
  padding: 40px 20px;
  background: $bg-card;
  border-radius: 12px;
  margin-bottom: 16px;

  .status-icon { font-size: 56px; margin-bottom: 12px; }
  h3 { font-size: 18px; color: #f56c6c; margin-bottom: 12px; }
  p { font-size: 14px; color: $text-secondary; margin-bottom: 6px; }
  .hint { margin-top: 16px; color: $text-muted; font-size: 12px; }
}

.info-section {
  text-align: center;
  padding: 24px 16px;
  background: $bg-card;
  border-radius: 12px;
  margin-bottom: 16px;

  .info-icon { font-size: 40px; margin-bottom: 8px; }
  h3 { font-size: 16px; margin-bottom: 8px; }
  p { font-size: 13px; color: $text-secondary; line-height: 1.6; }
}

.options-section {
  margin-bottom: 16px;
  h3 { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
}

.reason-section {
  margin-bottom: 16px;
}

.action-section {
  padding: 0 8px;
  .warning-text {
    text-align: center;
    font-size: 12px;
    color: #f56c6c;
    margin-top: 12px;
  }
}
</style>

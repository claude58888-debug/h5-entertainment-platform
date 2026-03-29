<template>
  <div>
    <h2 class="section-title">公告管理</h2>
    <div class="table-card">
      <div class="page-header" style="margin-bottom: 0;">
        <div></div>
        <el-button type="primary" @click="openAddDialog"><el-icon><Plus /></el-icon>发布公告</el-button>
      </div>
      <el-table :data="list" stripe style="margin-top: 16px;">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="target" label="推送对象" width="120">
          <template #default="{ row }"><el-tag size="small">{{ row.target }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }"><el-tag :type="row.type === '紧急' ? 'danger' : 'info'" size="small">{{ row.type || '普通' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="定时发布" width="180">
          <template #default="{ row }">
            <span v-if="row.scheduledAt" style="color: #e6a23c; font-size: 12px;">{{ row.scheduledAt }}</span>
            <span v-else style="color: #a0a0b0; font-size: 12px;">—</span>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" width="180">
          <template #default="{ row }">
            <span style="font-size: 12px;">{{ row.publishedAt || row.created || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <el-button size="small" type="primary" text @click="openEditDialog(row)">编辑</el-button>
            <el-button v-if="row.status !== 'published'" size="small" type="success" text @click="publishAnn(row)">发布</el-button>
            <el-button size="small" type="danger" text @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="addDialog" :title="isEditing ? '编辑公告' : '发布公告'" width="700px">
      <el-form label-width="100px">
        <el-form-item label="标题"><el-input v-model="form.title" placeholder="请输入公告标题" /></el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="8"
            placeholder="请输入公告内容，支持富文本格式..."
            show-word-limit
            :maxlength="5000"
          />
          <div style="margin-top: 4px; color: #a0a0b0; font-size: 12px;">
            支持换行与段落，后续版本将升级为富文本编辑器
          </div>
        </el-form-item>
        <el-form-item label="推送对象">
          <el-select v-model="form.targetType" style="width: 160px;" @change="onTargetTypeChange">
            <el-option label="全部用户" value="all" />
            <el-option label="仅VIP用户" value="vip_only" />
            <el-option label="指定VIP等级" value="vip_level" />
          </el-select>
          <el-input-number
            v-if="form.targetType === 'vip_level'"
            v-model="form.targetVipLevel"
            :min="0"
            :max="10"
            style="margin-left: 12px; width: 140px;"
            size="small"
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="form.type">
            <el-radio value="普通">普通</el-radio>
            <el-radio value="紧急">紧急</el-radio>
            <el-radio value="活动">活动</el-radio>
            <el-radio value="维护">维护</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="定时发布">
          <div style="display: flex; align-items: center; gap: 12px;">
            <el-switch v-model="useScheduled" active-text="定时" inactive-text="立即" />
            <el-date-picker
              v-if="useScheduled"
              v-model="form.scheduledAt"
              type="datetime"
              placeholder="选择定时发布时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              :disabled-date="disabledDate"
              style="width: 240px;"
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialog = false">取消</el-button>
        <el-button v-if="!isEditing" @click="saveDraft">存为草稿</el-button>
        <el-button type="primary" @click="publish">{{ isEditing ? '保存' : (useScheduled ? '定时发布' : '立即发布') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getAnnouncements, createAnnouncement, deleteAnnouncement, updateAnnouncement } from '@/api/system'
import { ElMessage, ElMessageBox } from 'element-plus'

const list = ref([])
const isEditing = ref(false)
const editingId = ref(null)
const useScheduled = ref(false)

onMounted(async () => {
  try {
    const data = await getAnnouncements()
    list.value = data || []
  } catch (e) { console.warn('API request failed', e) }
})

const addDialog = ref(false)
const form = reactive({
  title: '',
  content: '',
  targetType: 'all',
  targetVipLevel: 0,
  type: '普通',
  scheduledAt: ''
})

function targetLabel(targetType, vipLevel) {
  if (targetType === 'all') return '全部用户'
  if (targetType === 'vip_only') return '仅VIP用户'
  if (targetType === 'vip_level') return `VIP${vipLevel}`
  return '全部用户'
}

function onTargetTypeChange(val) {
  if (val !== 'vip_level') form.targetVipLevel = 0
}

function statusType(status) {
  const map = { published: 'success', draft: 'info', scheduled: 'warning', active: 'success' }
  return map[status] || 'info'
}

function statusLabel(status) {
  const map = { published: '已发布', draft: '草稿', scheduled: '定时发布', active: '已发布' }
  return map[status] || status
}

function disabledDate(time) {
  return time.getTime() < Date.now() - 86400000
}

function resetForm() {
  form.title = ''
  form.content = ''
  form.targetType = 'all'
  form.targetVipLevel = 0
  form.type = '普通'
  form.scheduledAt = ''
  useScheduled.value = false
  isEditing.value = false
  editingId.value = null
}

function openAddDialog() {
  resetForm()
  addDialog.value = true
}

function openEditDialog(row) {
  isEditing.value = true
  editingId.value = row.id
  form.title = row.title
  form.content = row.content || ''
  form.targetType = row.targetType || 'all'
  form.targetVipLevel = row.targetVipLevel || 0
  form.type = row.type || '普通'
  form.scheduledAt = row.scheduledAt || ''
  useScheduled.value = !!row.scheduledAt
  addDialog.value = true
}

async function publish() {
  if (!form.title) return ElMessage.warning('请输入公告标题')

  const target = targetLabel(form.targetType, form.targetVipLevel)
  const payload = {
    title: form.title,
    content: form.content,
    target,
    targetType: form.targetType,
    targetVipLevel: form.targetType === 'vip_level' ? form.targetVipLevel : null,
    type: form.type,
    scheduledAt: useScheduled.value ? form.scheduledAt : null,
    status: useScheduled.value ? 'scheduled' : 'published'
  }

  try {
    if (isEditing.value) {
      await updateAnnouncement(editingId.value, payload)
      const idx = list.value.findIndex(a => a.id === editingId.value)
      if (idx !== -1) Object.assign(list.value[idx], payload, { publishedAt: list.value[idx].publishedAt })
      ElMessage.success('公告已更新')
    } else {
      const result = await createAnnouncement(payload)
      const newItem = {
        id: result?.id || list.value.length + 1,
        ...payload,
        publishedAt: useScheduled.value ? null : new Date().toLocaleString('zh-CN'),
        created: new Date().toLocaleString('zh-CN')
      }
      list.value.unshift(newItem)
      ElMessage.success(useScheduled.value ? '公告已设置定时发布' : '公告已发布')
    }
    addDialog.value = false
  } catch (e) {
    ElMessage.error(isEditing.value ? '更新失败' : '发布失败')
  }
}

async function saveDraft() {
  if (!form.title) return ElMessage.warning('请输入公告标题')
  const target = targetLabel(form.targetType, form.targetVipLevel)
  try {
    const result = await createAnnouncement({
      title: form.title,
      content: form.content,
      target,
      targetType: form.targetType,
      targetVipLevel: form.targetType === 'vip_level' ? form.targetVipLevel : null,
      type: form.type,
      status: 'draft'
    })
    list.value.unshift({
      id: result?.id || list.value.length + 1,
      title: form.title,
      content: form.content,
      target,
      type: form.type,
      status: 'draft',
      created: new Date().toLocaleString('zh-CN')
    })
    addDialog.value = false
    ElMessage.success('草稿已保存')
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

async function publishAnn(row) {
  try {
    await updateAnnouncement(row.id, { status: 'published' })
    row.status = 'published'
    row.publishedAt = new Date().toLocaleString('zh-CN')
    ElMessage.success('已发布')
  } catch (e) {
    ElMessage.error('发布失败')
  }
}

function remove(row) {
  ElMessageBox.confirm('确定删除此公告?', '确认删除', { type: 'warning' }).then(async () => {
    try {
      await deleteAnnouncement(row.id)
      list.value = list.value.filter(a => a.id !== row.id)
      ElMessage.success('已删除')
    } catch (e) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}
</script>

<template>
  <div>
    <div class="page-header">
      <h2 class="section-title">消息中心</h2>
      <el-button type="primary" @click="openSendDialog">
        <el-icon><EditPen /></el-icon>发送消息
      </el-button>
    </div>

    <div class="table-card">
      <el-tabs v-model="activeTab">
        <!-- Tab 1: Inbox (Site Mail) -->
        <el-tab-pane label="站内信" name="inbox">
          <div class="filter-bar">
            <el-input v-model="inboxSearch" placeholder="搜索标题" style="width: 200px;" clearable prefix-icon="Search" />
            <el-select v-model="inboxStatusFilter" placeholder="状态" style="width: 120px;" clearable>
              <el-option label="已发送" value="sent" />
              <el-option label="已读" value="read" />
              <el-option label="未读" value="unread" />
            </el-select>
          </div>
          <el-table :data="filteredInbox" stripe>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="title" label="标题" min-width="180" />
            <el-table-column label="目标" width="140">
              <template #default="{ row }">
                <el-tag size="small" :type="row.targetType === 'all' ? 'danger' : row.targetType === 'vip' ? 'warning' : 'info'">
                  {{ row.target }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="类型" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ messageTypeLabel(row.type) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="row.status === 'read' ? 'success' : row.status === 'sent' ? 'warning' : 'info'" size="small">
                  {{ row.status === 'read' ? '已读' : row.status === 'sent' ? '已发送' : '未读' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sentAt" label="发送时间" width="170" />
            <el-table-column label="操作" width="130" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" text @click="viewMessage(row)">查看</el-button>
                <el-button size="small" type="danger" text @click="deleteMessage(row, 'inbox')">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin-top: 16px; text-align: right;">
            <el-pagination layout="total, prev, pager, next" :total="filteredInbox.length" :page-size="10" />
          </div>
        </el-tab-pane>

        <!-- Tab 2: System Notifications -->
        <el-tab-pane label="系统通知" name="system">
          <div class="filter-bar">
            <el-input v-model="systemSearch" placeholder="搜索通知" style="width: 200px;" clearable prefix-icon="Search" />
          </div>
          <el-table :data="filteredSystemNotifications" stripe>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="title" label="标题" min-width="200" />
            <el-table-column label="级别" width="90">
              <template #default="{ row }">
                <el-tag :type="row.level === 'error' ? 'danger' : row.level === 'warning' ? 'warning' : 'info'" size="small">
                  {{ row.level === 'error' ? '错误' : row.level === 'warning' ? '警告' : '信息' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="内容" min-width="250" show-overflow-tooltip />
            <el-table-column prop="createdAt" label="时间" width="170" />
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" text @click="viewNotification(row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- Tab 3: Customer Service Chat -->
        <el-tab-pane label="客服会话" name="chat">
          <div class="filter-bar">
            <el-input v-model="chatSearch" placeholder="搜索用户名" style="width: 200px;" clearable prefix-icon="Search" />
            <el-select v-model="chatStatusFilter" placeholder="状态" style="width: 120px;" clearable>
              <el-option label="进行中" value="active" />
              <el-option label="已关闭" value="closed" />
              <el-option label="等待中" value="waiting" />
            </el-select>
          </div>
          <el-table :data="filteredChats" stripe>
            <el-table-column prop="id" label="会话ID" width="100" />
            <el-table-column prop="username" label="用户" width="130" />
            <el-table-column prop="subject" label="主题" min-width="200" />
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'success' : row.status === 'waiting' ? 'warning' : 'info'" size="small">
                  {{ row.status === 'active' ? '进行中' : row.status === 'waiting' ? '等待中' : '已关闭' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastMessage" label="最新消息" min-width="200" show-overflow-tooltip />
            <el-table-column prop="updatedAt" label="更新时间" width="170" />
            <el-table-column label="操作" width="130" fixed="right">
              <template #default="{ row }">
                <el-button v-if="row.status !== 'closed'" size="small" type="primary" text @click="replyChat(row)">回复</el-button>
                <el-button v-if="row.status !== 'closed'" size="small" type="danger" text @click="closeChat(row)">关闭</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin-top: 16px; text-align: right;">
            <el-pagination layout="total, prev, pager, next" :total="filteredChats.length" :page-size="10" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- Send Message Dialog -->
    <el-dialog v-model="sendDialogVisible" title="发送消息" width="560px">
      <el-form :model="sendForm" label-width="90px">
        <el-form-item label="发送目标" required>
          <el-select v-model="sendForm.targetType" placeholder="选择目标" style="width: 100%;" @change="onTargetTypeChange">
            <el-option label="全部用户" value="all" />
            <el-option label="VIP用户" value="vip" />
            <el-option label="指定用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="sendForm.targetType === 'user'" label="用户名">
          <el-input v-model="sendForm.targetUser" placeholder="输入用户名" />
        </el-form-item>
        <el-form-item v-if="sendForm.targetType === 'vip'" label="VIP等级">
          <el-select v-model="sendForm.targetVip" placeholder="选择VIP等级" style="width: 100%;">
            <el-option v-for="i in 6" :key="i-1" :label="'VIP' + (i-1) + ' 及以上'" :value="i-1" />
          </el-select>
        </el-form-item>
        <el-form-item label="消息标题" required>
          <el-input v-model="sendForm.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="消息类型">
          <el-select v-model="sendForm.type" style="width: 100%;">
            <el-option label="站内信" value="mail" />
            <el-option label="系统通知" value="notification" />
            <el-option label="活动推送" value="promotion" />
          </el-select>
        </el-form-item>
        <el-form-item label="消息内容" required>
          <el-input v-model="sendForm.content" type="textarea" :rows="4" placeholder="请输入消息内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="sendDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="sendMessage">发送</el-button>
      </template>
    </el-dialog>

    <!-- View Message Dialog -->
    <el-dialog v-model="viewDialogVisible" title="消息详情" width="500px">
      <div v-if="currentMessage">
        <p><strong>标题：</strong>{{ currentMessage.title }}</p>
        <p><strong>类型：</strong>{{ messageTypeLabel(currentMessage.type) }}</p>
        <p><strong>时间：</strong>{{ currentMessage.sentAt || currentMessage.createdAt }}</p>
        <el-divider />
        <p style="color: #e0e0e0;">{{ currentMessage.content || '暂无详细内容' }}</p>
      </div>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMessages, sendMessage as apiSendMessage, deleteMessage as apiDeleteMessage, getSystemNotifications, getChatSessions, updateChatSession } from '@/api/messages'

const activeTab = ref('inbox')

// Inbox state
const inboxSearch = ref('')
const inboxStatusFilter = ref('')
const inboxMessages = ref([])

// System notifications state
const systemSearch = ref('')
const systemNotifications = ref([])

// Chat state
const chatSearch = ref('')
const chatStatusFilter = ref('')
const chatSessions = ref([])

onMounted(async () => {
  try {
    const [msgs, notifications, chats] = await Promise.all([getMessages(), getSystemNotifications(), getChatSessions()])
    inboxMessages.value = msgs || []
    systemNotifications.value = notifications || []
    chatSessions.value = chats || []
  } catch (e) { console.warn('API request failed', e) }
})

// Send dialog state
const sendDialogVisible = ref(false)
const viewDialogVisible = ref(false)
const currentMessage = ref(null)

const sendForm = ref({
  targetType: 'all',
  targetUser: '',
  targetVip: 0,
  title: '',
  type: 'mail',
  content: ''
})

// Computed filtered data
const filteredInbox = computed(() => {
  return inboxMessages.value.filter(m => {
    if (inboxSearch.value && !m.title.includes(inboxSearch.value)) return false
    if (inboxStatusFilter.value && m.status !== inboxStatusFilter.value) return false
    return true
  })
})

const filteredSystemNotifications = computed(() => {
  return systemNotifications.value.filter(n => {
    if (systemSearch.value && !n.title.includes(systemSearch.value) && !n.content.includes(systemSearch.value)) return false
    return true
  })
})

const filteredChats = computed(() => {
  return chatSessions.value.filter(c => {
    if (chatSearch.value && !c.username.includes(chatSearch.value)) return false
    if (chatStatusFilter.value && c.status !== chatStatusFilter.value) return false
    return true
  })
})

function messageTypeLabel(type) {
  const map = { mail: '站内信', notification: '系统通知', promotion: '活动推送' }
  return map[type] || type
}

function openSendDialog() {
  sendForm.value = { targetType: 'all', targetUser: '', targetVip: 0, title: '', type: 'mail', content: '' }
  sendDialogVisible.value = true
}

function onTargetTypeChange() {
  sendForm.value.targetUser = ''
  sendForm.value.targetVip = 0
}

async function sendMessage() {
  if (!sendForm.value.title || !sendForm.value.content) {
    ElMessage.warning('请填写标题和内容')
    return
  }
  let target = '全部用户'
  if (sendForm.value.targetType === 'vip') target = `VIP${sendForm.value.targetVip}+`
  if (sendForm.value.targetType === 'user') target = sendForm.value.targetUser

  try {
    const result = await apiSendMessage({ ...sendForm.value, target })
    const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
    inboxMessages.value.unshift({
      id: result?.id || Date.now(),
      title: sendForm.value.title,
      target,
      targetType: sendForm.value.targetType,
      type: sendForm.value.type,
      status: 'sent',
      sentAt: now,
      content: sendForm.value.content
    })
    sendDialogVisible.value = false
    ElMessage.success('消息已发送')
  } catch (e) {
    ElMessage.error('发送失败')
  }
}

function viewMessage(row) {
  currentMessage.value = row
  viewDialogVisible.value = true
}

function viewNotification(row) {
  currentMessage.value = { ...row, sentAt: row.createdAt }
  viewDialogVisible.value = true
}

function deleteMessage(row, source) {
  ElMessageBox.confirm(`确定删除消息 "${row.title}" 吗?`, '确认', { type: 'warning' }).then(async () => {
    try {
      await apiDeleteMessage(row.id)
      if (source === 'inbox') {
        inboxMessages.value = inboxMessages.value.filter(m => m.id !== row.id)
      }
      ElMessage.success('消息已删除')
    } catch (e) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

function replyChat(row) {
  ElMessage.info(`打开与 ${row.username} 的客服会话`)
}

function closeChat(row) {
  ElMessageBox.confirm(`确定关闭与 "${row.username}" 的会话吗?`, '确认', { type: 'warning' }).then(async () => {
    try {
      await updateChatSession(row.id, { status: 'closed' })
      row.status = 'closed'
      ElMessage.success('会话已关闭')
    } catch (e) {
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}
</script>

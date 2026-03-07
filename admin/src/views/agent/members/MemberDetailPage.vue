<template>
  <div>
    <div class="page-header">
      <h2 class="section-title">会员详情 - {{ member.username }}</h2>
      <el-button @click="$router.back()">返回列表</el-button>
    </div>
    <el-descriptions :column="3" border style="margin-bottom: 20px;">
      <el-descriptions-item label="会员ID">{{ member.id }}</el-descriptions-item>
      <el-descriptions-item label="用户名">{{ member.username }}</el-descriptions-item>
      <el-descriptions-item label="VIP等级"><el-tag type="warning" size="small">VIP{{ member.vip }}</el-tag></el-descriptions-item>
      <el-descriptions-item label="余额"><span style="color:#409eff;font-weight:600;">¥{{ member.balance?.toLocaleString() }}</span></el-descriptions-item>
      <el-descriptions-item label="总充值">¥{{ ((member.totalDeposit || 0) / 10000).toFixed(1) }}万</el-descriptions-item>
      <el-descriptions-item label="总提现">¥{{ ((member.totalWithdraw || 0) / 10000).toFixed(1) }}万</el-descriptions-item>
      <el-descriptions-item label="注册时间">{{ member.registered }}</el-descriptions-item>
      <el-descriptions-item label="最后登录">{{ member.lastLogin }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="member.status === 'active' ? 'success' : 'danger'" size="small">{{ member.status === 'active' ? '正常' : '冻结' }}</el-tag>
      </el-descriptions-item>
    </el-descriptions>

    <div style="margin-bottom: 20px;">
      <el-space>
        <el-button type="primary" @click="adjustBalance">手动调额</el-button>
        <el-button type="warning" @click="resetPwd">重置密码</el-button>
        <el-button :type="member.status === 'active' ? 'danger' : 'success'" @click="toggleFreeze">{{ member.status === 'active' ? '冻结账户' : '解冻账户' }}</el-button>
        <el-button type="info" @click="forceLogout">强制下线</el-button>
      </el-space>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="充值记录" name="deposits">
        <el-table :data="deposits" stripe size="small">
          <el-table-column prop="id" label="订单号" width="160" />
          <el-table-column label="金额" width="120"><template #default="{ row }"><span style="color:#67c23a;">+¥{{ row.amount.toLocaleString() }}</span></template></el-table-column>
          <el-table-column prop="channel" label="渠道" width="120" />
          <el-table-column prop="status" label="状态" width="80"><template #default="{ row }"><el-tag type="success" size="small">{{ row.status }}</el-tag></template></el-table-column>
          <el-table-column prop="time" label="时间" width="180" />
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="提现记录" name="withdrawals">
        <el-table :data="withdrawals" stripe size="small">
          <el-table-column prop="id" label="订单号" width="160" />
          <el-table-column label="金额" width="120"><template #default="{ row }"><span style="color:#f56c6c;">-¥{{ row.amount.toLocaleString() }}</span></template></el-table-column>
          <el-table-column prop="channel" label="渠道" width="120" />
          <el-table-column prop="status" label="状态" width="80"><template #default="{ row }"><el-tag type="warning" size="small">{{ row.status }}</el-tag></template></el-table-column>
          <el-table-column prop="time" label="时间" width="180" />
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="投注记录" name="bets">
        <el-table :data="bets" stripe size="small">
          <el-table-column prop="game" label="游戏" width="140" />
          <el-table-column label="投注" width="100"><template #default="{ row }">¥{{ row.bet.toLocaleString() }}</template></el-table-column>
          <el-table-column label="派彩" width="100"><template #default="{ row }"><span :style="{color: row.payout > row.bet ? '#67c23a' : '#f56c6c'}">¥{{ row.payout.toLocaleString() }}</span></template></el-table-column>
          <el-table-column prop="time" label="时间" width="180" />
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="操作日志" name="logs">
        <el-table :data="operationLogs" stripe size="small">
          <el-table-column prop="action" label="操作" width="200" />
          <el-table-column prop="operator" label="操作人" width="120" />
          <el-table-column prop="detail" label="详情" />
          <el-table-column prop="time" label="时间" width="180" />
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { membersList } from '@/mock/data'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const activeTab = ref('deposits')
const member = ref(membersList.find(m => m.id === route.params.id) || membersList[0])

const deposits = ref([
  { id: 'D202603071001', amount: 5000, channel: 'USDT-TRC20', status: '已完成', time: '2026-03-07 10:01' },
  { id: 'D202603061502', amount: 10000, channel: '银行转账', status: '已完成', time: '2026-03-06 15:02' },
  { id: 'D202603051201', amount: 2000, channel: 'USDT-TRC20', status: '已完成', time: '2026-03-05 12:01' }
])
const withdrawals = ref([
  { id: 'W202603071101', amount: 3000, channel: 'USDT-TRC20', status: '审核中', time: '2026-03-07 11:01' },
  { id: 'W202603060901', amount: 8000, channel: '银行卡', status: '已完成', time: '2026-03-06 09:01' }
])
const bets = ref([
  { game: '麻将胡了2', bet: 500, payout: 1250, time: '2026-03-07 14:30' },
  { game: '极速糖果1000', bet: 200, payout: 80, time: '2026-03-07 14:15' },
  { game: 'PG电子-宝石传说', bet: 100, payout: 350, time: '2026-03-07 13:50' },
  { game: '奥林匹斯之门', bet: 1000, payout: 200, time: '2026-03-07 12:20' }
])
const operationLogs = ref([
  { action: '登录', operator: '系统', detail: 'IP: 103.45.67.89', time: '2026-03-07 09:00' },
  { action: '充值', operator: '系统', detail: '¥5,000 USDT-TRC20', time: '2026-03-07 10:01' },
  { action: 'VIP升级', operator: '系统', detail: 'VIP2 → VIP3', time: '2026-03-06 20:00' }
])

function adjustBalance() {
  ElMessageBox.prompt('请输入调整金额和原因 (格式: 金额,原因)', '手动调额').then(({ value }) => {
    const [amount] = value.split(',')
    member.value.balance += parseInt(amount)
    ElMessage.success(`余额已调整 ${amount}`)
  }).catch(() => {})
}
function resetPwd() { ElMessageBox.confirm('确定重置密码?', '确认').then(() => ElMessage.success('密码已重置')).catch(() => {}) }
function toggleFreeze() {
  const a = member.value.status === 'active' ? '冻结' : '解冻'
  ElMessageBox.confirm(`确定${a}?`, '确认').then(() => { member.value.status = member.value.status === 'active' ? 'frozen' : 'active'; ElMessage.success(`已${a}`) }).catch(() => {})
}
function forceLogout() { ElMessage.success('已强制下线') }
</script>

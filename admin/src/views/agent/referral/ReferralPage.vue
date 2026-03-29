<template>
  <div>
    <h2 class="section-title">推广与推荐</h2>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="推广链接" name="links">
        <div class="form-card">
          <el-form label-width="120px" style="max-width: 600px;">
            <el-form-item label="推广链接">
              <el-input v-model="referralLink" readonly>
                <template #append><el-button type="primary" @click="copyLink">复制</el-button></template>
              </el-input>
            </el-form-item>
            <el-form-item label="推广参数">
              <el-input v-model="trackingParam" placeholder="自定义追踪参数" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="generateLink">生成新链接</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="kpi-row" style="margin-top: 20px;">
          <div class="kpi-card"><div class="kpi-label">总推广注册</div><div class="kpi-value" style="color:#409eff;">{{ referralData.totalRegistrations }}</div></div>
          <div class="kpi-card"><div class="kpi-label">有效充值用户</div><div class="kpi-value" style="color:#67c23a;">{{ referralData.activeDepositors }}</div></div>
          <div class="kpi-card"><div class="kpi-label">总佣金</div><div class="kpi-value" style="color:#e6a23c;">¥{{ referralData.totalCommission.toLocaleString() }}</div></div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="团队层级" name="tree">
        <div class="table-card">
          <el-tree :data="teamTree" :props="{ children: 'children', label: 'name' }" default-expand-all>
            <template #default="{ node, data }">
              <span style="display: flex; align-items: center; gap: 12px; width: 100%;">
                <span>{{ data.name }}</span>
                <el-tag size="small" :type="data.level === 1 ? 'danger' : data.level === 2 ? 'warning' : 'info'">
                  {{ data.level === 1 ? '总代' : data.level === 2 ? '一级' : '二级' }}
                </el-tag>
                <span style="color:#888;">会员: {{ data.members }}</span>
                <span style="color:#67c23a;">佣金: ¥{{ data.commission.toLocaleString() }}</span>
              </span>
            </template>
          </el-tree>
        </div>
      </el-tab-pane>

      <el-tab-pane label="佣金配置" name="config">
        <div class="form-card">
          <el-form label-width="140px" style="max-width: 600px;">
            <el-form-item label="一级佣金比例"><el-slider v-model="commissionConfig.level1" :min="1" :max="30" :format-tooltip="v => v + '%'" show-input /></el-form-item>
            <el-form-item label="二级佣金比例"><el-slider v-model="commissionConfig.level2" :min="0" :max="15" :format-tooltip="v => v + '%'" show-input /></el-form-item>
            <el-form-item label="三级佣金比例"><el-slider v-model="commissionConfig.level3" :min="0" :max="10" :format-tooltip="v => v + '%'" show-input /></el-form-item>
            <el-form-item><el-button type="primary" @click="ElMessage.success('佣金配置已保存')">保存</el-button></el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <el-tab-pane label="团队成员" name="members">
        <div class="table-card">
          <el-table :data="teamMembers" stripe>
            <el-table-column prop="username" label="用户名" width="130" />
            <el-table-column prop="level" label="层级" width="80"><template #default="{ row }"><el-tag size="small">{{ row.level }}级</el-tag></template></el-table-column>
            <el-table-column prop="referrer" label="推荐人" width="130" />
            <el-table-column label="充值" width="120"><template #default="{ row }">¥{{ row.deposit.toLocaleString() }}</template></el-table-column>
            <el-table-column label="投注" width="120"><template #default="{ row }">¥{{ row.bet.toLocaleString() }}</template></el-table-column>
            <el-table-column label="产生佣金" width="120"><template #default="{ row }"><span style="color:#e6a23c;">¥{{ row.commission.toLocaleString() }}</span></template></el-table-column>
            <el-table-column prop="registered" label="注册时间" width="120" />
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="结算记录" name="settlement">
        <div class="table-card">
          <el-table :data="settlementList" stripe>
            <el-table-column prop="id" label="结算ID" width="120" />
            <el-table-column prop="period" label="结算周期" width="200" />
            <el-table-column label="佣金总额" width="130"><template #default="{ row }"><span style="color:#e6a23c;">¥{{ row.amount.toLocaleString() }}</span></template></el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }"><el-tag :type="row.status === 'paid' ? 'success' : 'warning'" size="small">{{ row.status === 'paid' ? '已结算' : '待结算' }}</el-tag></template>
            </el-table-column>
            <el-table-column prop="settledAt" label="结算时间" width="180" />
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('links')
const referralLink = ref('https://jinsha.com/r/AGT001?ref=promo1')
const trackingParam = ref('')
const referralData = ref({ totalRegistrations: 0, activeDepositors: 0, totalCommission: 0 })
const commissionConfig = reactive({ level1: 15, level2: 5, level3: 2 })

const teamTree = ref([
  { name: '金沙娱乐(总代)', level: 1, members: 1280, commission: 156000, children: [
    { name: 'sub_agent_01', level: 2, members: 450, commission: 52000, children: [
      { name: 'player_group_a', level: 3, members: 120, commission: 8500 },
      { name: 'player_group_b', level: 3, members: 85, commission: 6200 }
    ]},
    { name: 'sub_agent_02', level: 2, members: 380, commission: 45000, children: [
      { name: 'player_group_c', level: 3, members: 200, commission: 12000 }
    ]}
  ]}
])

const teamMembers = ref([
  { username: 'sub_01', level: 1, referrer: '金沙娱乐', deposit: 85000, bet: 520000, commission: 15200, registered: '2026-01-15' },
  { username: 'sub_02', level: 1, referrer: '金沙娱乐', deposit: 62000, bet: 380000, commission: 11400, registered: '2026-01-20' },
  { username: 'player_a1', level: 2, referrer: 'sub_01', deposit: 15000, bet: 98000, commission: 2940, registered: '2026-02-01' },
  { username: 'player_a2', level: 2, referrer: 'sub_01', deposit: 8500, bet: 55000, commission: 1650, registered: '2026-02-10' },
  { username: 'player_b1', level: 2, referrer: 'sub_02', deposit: 22000, bet: 145000, commission: 4350, registered: '2026-02-05' }
])

const settlementList = ref([
  { id: 'CS20260307', period: '2026-03-01 ~ 2026-03-07', amount: 18500, status: 'pending', settledAt: '-' },
  { id: 'CS20260228', period: '2026-02-22 ~ 2026-02-28', amount: 22300, status: 'paid', settledAt: '2026-03-01 10:00' },
  { id: 'CS20260221', period: '2026-02-15 ~ 2026-02-21', amount: 19800, status: 'paid', settledAt: '2026-02-22 10:00' }
])

function copyLink() { navigator.clipboard?.writeText(referralLink.value); ElMessage.success('链接已复制') }
function generateLink() { referralLink.value = `https://jinsha.com/r/AGT001?ref=${trackingParam.value || Date.now()}`; ElMessage.success('新链接已生成') }
</script>

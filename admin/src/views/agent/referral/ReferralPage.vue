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
const referralLink = ref('')
const trackingParam = ref('')
const referralData = ref({ totalRegistrations: 0, activeDepositors: 0, totalCommission: 0 })
const commissionConfig = reactive({ level1: 15, level2: 5, level3: 2 })

const teamTree = ref([])

const teamMembers = ref([])

const settlementList = ref([])

function copyLink() { navigator.clipboard?.writeText(referralLink.value); ElMessage.success('链接已复制') }
function generateLink() { referralLink.value = `${window.location.origin}/r/?ref=${trackingParam.value || Date.now()}`; ElMessage.success('新链接已生成') }
</script>

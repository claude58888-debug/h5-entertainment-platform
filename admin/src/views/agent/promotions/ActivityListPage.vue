<template>
  <div>
    <h2 class="section-title">活动管理</h2>
    <div class="table-card">
      <div class="page-header" style="margin-bottom: 0;">
        <el-radio-group v-model="tab">
          <el-radio-button value="platform">平台活动</el-radio-button>
          <el-radio-button value="own">自定义活动</el-radio-button>
        </el-radio-group>
        <el-button type="primary" @click="$router.push('/agent/promotions/create')"><el-icon><Plus /></el-icon>创建活动</el-button>
      </div>
      <el-table :data="filteredActivities" stripe style="margin-top: 16px;">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="活动名称" width="180" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }"><el-tag size="small">{{ row.type }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="period" label="时间" width="220" />
        <el-table-column label="参与人数" width="100">
          <template #default="{ row }">{{ row.participants }}</template>
        </el-table-column>
        <el-table-column label="发放奖金" width="120">
          <template #default="{ row }">¥{{ row.totalBonus.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="来源" width="80">
          <template #default="{ row }">
            <el-tag :type="row.source === '平台' ? 'info' : 'success'" size="small">{{ row.source }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : row.status === 'upcoming' ? 'warning' : 'info'" size="small">
              {{ { active: '进行中', upcoming: '未开始', ended: '已结束' }[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" type="primary" text>详情</el-button>
            <el-button v-if="row.source === '自定义'" size="small" type="warning" text>编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAnnouncements } from '@/api/system'
import { activities } from '@/mock/data'

const tab = ref('platform')
const allActivities = ref([...activities])

onMounted(async () => {
  try {
    const data = await getAnnouncements()
    if (data?.length) {
      const mapped = data.map((a, i) => ({ id: i + 1, name: a.title, type: a.type === 'activity' ? '充值返利' : '首充优惠', period: `${a.publishTime} ~ 长期`, participants: Math.floor(Math.random() * 500) + 100, totalBonus: Math.floor(Math.random() * 50000) + 10000, source: i < 3 ? '平台' : '自定义', status: a.status === 'published' ? 'active' : 'upcoming' }))
      if (mapped.length) allActivities.value = mapped
    }
  } catch (e) { console.warn('Activities API failed, using mock data', e) }
})

const filteredActivities = computed(() => {
  if (tab.value === 'platform') return allActivities.value.filter(a => a.source === '平台')
  return allActivities.value.filter(a => a.source === '自定义')
})
</script>

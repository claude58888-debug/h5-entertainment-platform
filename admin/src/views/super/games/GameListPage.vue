<template>
  <div>
    <h2 class="section-title">游戏列表</h2>
    <div class="table-card">
      <div class="filter-bar">
        <el-input v-model="search" placeholder="搜索游戏名称" style="width: 200px;" clearable prefix-icon="Search" />
        <el-select v-model="providerFilter" placeholder="厂商" style="width: 120px;" clearable>
          <el-option v-for="p in providerList" :key="p" :label="p" :value="p" />
        </el-select>
        <el-select v-model="categoryFilter" placeholder="分类" style="width: 120px;" clearable>
          <el-option label="电子" value="电子" />
          <el-option label="真人" value="真人" />
          <el-option label="捕鱼" value="捕鱼" />
          <el-option label="体育" value="体育" />
          <el-option label="彩票" value="彩票" />
          <el-option label="棋牌" value="棋牌" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="状态" style="width: 120px;" clearable>
          <el-option label="启用" value="active" />
          <el-option label="停用" value="inactive" />
        </el-select>
        <el-button :type="sortByHot ? 'warning' : 'default'" @click="toggleHotSort">
          <el-icon><Flame /></el-icon>{{ sortByHot ? '热度排序中' : '按热度排序' }}
        </el-button>
      </div>
      <!-- Loading skeleton -->
      <div v-if="loading" class="skeleton-table">
        <el-skeleton :rows="8" animated />
      </div>

      <!-- Empty state -->
      <div v-else-if="!filteredGames.length" class="empty-state">
        <el-empty description="暂无游戏数据" />
      </div>

      <el-table v-else :data="paginatedGames" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="游戏名称" width="160" />
        <el-table-column prop="provider" label="厂商" width="80" />
        <el-table-column prop="category" label="分类" width="80" />
        <el-table-column label="RTP" width="80">
          <template #default="{ row }">{{ row.rtp }}%</template>
        </el-table-column>
        <el-table-column label="热度分" width="120">
          <template #default="{ row }">
            <el-input-number v-model="row.hotScore" :min="0" size="small" controls-position="right" style="width: 90px;" @change="saveHotScore(row)" />
          </template>
        </el-table-column>
        <el-table-column label="推荐" width="140">
          <template #default="{ row }">
            <el-switch v-model="row.isRecommended" size="small" @change="saveRecommend(row)" style="margin-right: 6px;" />
            <el-input-number v-if="row.isRecommended" v-model="row.recommendSort" :min="0" size="small" controls-position="right" style="width: 70px;" @change="saveRecommend(row)" />
          </template>
        </el-table-column>
        <el-table-column label="标签" width="140">
          <template #default="{ row }">
            <el-tag v-if="row.isHot" type="danger" size="small" style="margin-right:4px;">热门</el-tag>
            <el-tag v-if="row.isNew" type="success" size="small">新游</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">{{ row.status === 'active' ? '启用' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button size="small" :type="row.isHot ? 'danger' : 'default'" text @click="row.isHot = !row.isHot">{{ row.isHot ? '取消热门' : '设为热门' }}</el-button>
            <el-button size="small" :type="row.isNew ? 'success' : 'default'" text @click="row.isNew = !row.isNew">{{ row.isNew ? '取消新游' : '设为新游' }}</el-button>
            <el-switch v-model="row.status" active-value="active" inactive-value="inactive" size="small" style="margin-left: 8px;" />
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 16px; text-align: right;">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredGames.length"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getGames, updateHotScore, updateRecommend } from '@/api/games'
import { ElMessage } from 'element-plus'
import { Flame } from '@element-plus/icons-vue'

const search = ref('')
const providerFilter = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')
const games = ref([])
const loading = ref(true)
const currentPage = ref(1)
const pageSize = ref(20)
const sortByHot = ref(false)

onMounted(async () => {
  try {
    loading.value = true
    const data = await getGames()
    games.value = data || []
  } catch (e) { console.warn('API request failed', e) } finally {
    loading.value = false
  }
})
const providerList = ['PG', 'PP', 'CQ9', 'EVO', 'AG', 'JDB', 'JILI', 'FC', 'WM']

function toggleHotSort() {
  sortByHot.value = !sortByHot.value
}

const filteredGames = computed(() => {
  let result = games.value.filter(g => {
    if (search.value && !g.name.includes(search.value)) return false
    if (providerFilter.value && g.provider !== providerFilter.value) return false
    if (categoryFilter.value && g.category !== categoryFilter.value) return false
    if (statusFilter.value && g.status !== statusFilter.value) return false
    return true
  })
  if (sortByHot.value) {
    result = [...result].sort((a, b) => (b.hotScore || 0) - (a.hotScore || 0))
  }
  return result
})

const paginatedGames = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredGames.value.slice(start, start + pageSize.value)
})

async function saveHotScore(row) {
  try {
    await updateHotScore(row.id, row.hotScore)
    ElMessage.success('热度分已更新')
  } catch (e) {
    ElMessage.error('更新失败')
  }
}

async function saveRecommend(row) {
  try {
    await updateRecommend(row.id, row.isRecommended, row.recommendSort || 0)
    ElMessage.success('推荐设置已更新')
  } catch (e) {
    ElMessage.error('更新失败')
  }
}
</script>

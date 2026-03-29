<template>
  <div>
    <h2 class="section-title">游戏管理</h2>
    <div class="table-card">
      <div class="filter-bar">
        <el-input v-model="search" placeholder="搜索游戏名称" style="width: 200px;" clearable prefix-icon="Search" />
        <el-select v-model="providerFilter" placeholder="厂商" style="width: 120px;" clearable>
          <el-option v-for="p in ['PG','PP','CQ9','EVO','AG','JDB','JILI','FC']" :key="p" :label="p" :value="p" />
        </el-select>
        <el-select v-model="categoryFilter" placeholder="分类" style="width: 120px;" clearable>
          <el-option label="电子" value="电子" /><el-option label="真人" value="真人" /><el-option label="捕鱼" value="捕鱼" />
        </el-select>
      </div>
      <el-table :data="filteredGames" stripe>
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="name" label="游戏名称" width="160" />
        <el-table-column prop="provider" label="厂商" width="80" />
        <el-table-column prop="category" label="分类" width="80" />
        <el-table-column label="RTP" width="80"><template #default="{ row }">{{ row.rtp }}%</template></el-table-column>
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
        <el-table-column label="排序" width="120">
          <template #default="{ row }">
            <el-button size="small" text @click="moveUp(row)">↑</el-button>
            <el-button size="small" text @click="moveDown(row)">↓</el-button>
            <span style="color:#888;">{{ row.sort }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" :type="row.isHot ? 'danger' : 'default'" text @click="row.isHot = !row.isHot">{{ row.isHot ? '取消热门' : '设热门' }}</el-button>
            <el-button size="small" :type="row.isNew ? 'success' : 'default'" text @click="row.isNew = !row.isNew">{{ row.isNew ? '取消新游' : '设新游' }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getGames } from '@/api/games'
import { gamesList } from '@/mock/data'

const search = ref('')
const providerFilter = ref('')
const categoryFilter = ref('')
const games = ref(gamesList.map((g, i) => ({ ...g, sort: i + 1 })))

onMounted(async () => {
  try {
    const data = await getGames()
    if (data?.length) games.value = data.map((g, i) => ({ ...g, sort: i + 1 }))
  } catch (e) { console.warn('Games API failed, using mock data', e) }
})

const filteredGames = computed(() => games.value.filter(g => {
  if (search.value && !g.name.includes(search.value)) return false
  if (providerFilter.value && g.provider !== providerFilter.value) return false
  if (categoryFilter.value && g.category !== categoryFilter.value) return false
  return true
}).sort((a, b) => a.sort - b.sort))

function moveUp(row) { if (row.sort > 1) { const prev = games.value.find(g => g.sort === row.sort - 1); if (prev) { prev.sort++; row.sort-- } } }
function moveDown(row) { const next = games.value.find(g => g.sort === row.sort + 1); if (next) { next.sort--; row.sort++ } }
</script>

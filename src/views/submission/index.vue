<template>
  <div class="submission-container">
    <el-card>
      <!-- 搜索栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input
            v-model="queryParams.problemId"
            placeholder="题目ID"
            clearable
            style="width: 160px; margin-right: 10px;"
            @keyup.enter="handleSearch"
          />
          <el-input
            v-model="queryParams.userId"
            placeholder="用户ID"
            clearable
            style="width: 160px; margin-right: 10px;"
            @keyup.enter="handleSearch"
          />
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        style="margin-top: 20px;"
        @row-click="handleRowClick"
        highlight-current-row
      >
        <el-table-column prop="id" label="提交ID" width="120" />
        <el-table-column prop="problemId" label="题目ID" width="100" />
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="languageId" label="语言ID" width="80" />
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="通过率" width="100">
          <template #default="{ row }">
            {{ row.passedCaseCount }} / {{ row.totalCaseCount }}
          </template>
        </el-table-column>
        <el-table-column prop="score" label="得分" width="70" />
        <el-table-column label="最大耗时" width="110">
          <template #default="{ row }">
            {{ row.maxTimeUsed }} ms
          </template>
        </el-table-column>
        <el-table-column label="最大内存" width="110">
          <template #default="{ row }">
            {{ row.maxMemoryUsed }} KB
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="提交时间" width="180" show-overflow-tooltip />
        <el-table-column prop="finishTime" label="完成时间" width="180" show-overflow-tooltip />
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchData"
        @current-change="fetchData"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 提交详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="提交详情"
      width="900px"
      destroy-on-close
    >
      <template v-if="detail">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="提交ID">{{ detail.id }}</el-descriptions-item>
          <el-descriptions-item label="题目ID">{{ detail.problemId }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ detail.userId }}</el-descriptions-item>
          <el-descriptions-item label="语言ID">{{ detail.languageId }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(detail.status)" size="small">
              {{ getStatusLabel(detail.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="得分">{{ detail.score }}</el-descriptions-item>
          <el-descriptions-item label="通过用例">{{ detail.passedCaseCount }} / {{ detail.totalCaseCount }}</el-descriptions-item>
          <el-descriptions-item label="最大耗时">{{ detail.maxTimeUsed }} ms</el-descriptions-item>
          <el-descriptions-item label="最大内存">{{ detail.maxMemoryUsed }} KB</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ detail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="完成时间">{{ detail.finishTime || '-' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 错误信息 -->
        <div v-if="detail.errorMessage" style="margin-top: 16px;">
          <el-alert :title="detail.errorMessage" type="error" :closable="false" show-icon />
        </div>

        <!-- 编译信息 -->
        <div v-if="detail.compileMessage" style="margin-top: 10px;">
          <el-alert :title="'编译信息'" :description="detail.compileMessage" type="warning" :closable="false" show-icon />
        </div>

        <!-- 测试用例明细 -->
        <div v-if="detail.caseResults && detail.caseResults.length > 0" style="margin-top: 20px;">
          <h4 style="margin-bottom: 10px;">测试用例明细</h4>
          <el-table :data="detail.caseResults" size="small" border>
            <el-table-column prop="caseOrder" label="#" width="50" />
            <el-table-column prop="testCaseId" label="用例ID" width="80" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)" size="small">
                  {{ getStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="score" label="得分" width="60" />
            <el-table-column label="耗时" width="100">
              <template #default="{ row }">
                {{ row.timeUsed }} ms
              </template>
            </el-table-column>
            <el-table-column label="内存" width="100">
              <template #default="{ row }">
                {{ row.memoryUsed }} KB
              </template>
            </el-table-column>
            <el-table-column prop="errorMessage" label="错误信息" min-width="150" show-overflow-tooltip />
          </el-table>
        </div>
      </template>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getSubmissionPage, getSubmissionById } from '@/api/submission'
import type { SubmissionVO, SubmissionDetailVO, SubmissionQueryDTO } from '@/types/api'
import { SubmissionStatus } from '@/types/api'

type TagType = 'success' | 'primary' | 'warning' | 'info' | 'danger'

const loading = ref(false)
const tableData = ref<SubmissionVO[]>([])
const total = ref(0)

const queryParams = reactive<SubmissionQueryDTO>({
  pageNum: 1,
  pageSize: 10,
  problemId: undefined,
  userId: undefined
})

// 详情对话框
const detailDialogVisible = ref(false)
const detailLoading = ref(false)
const detail = ref<SubmissionDetailVO | null>(null)

/** 获取列表数据 */
async function fetchData() {
  loading.value = true
  try {
    const params: SubmissionQueryDTO = {
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize
    }
    if (queryParams.problemId) params.problemId = queryParams.problemId
    if (queryParams.userId) params.userId = queryParams.userId

    const res = await getSubmissionPage(params)
    if (res.data) {
      // 兼容不同分页返回格式
      tableData.value = res.data.records || res.data.list || []
      total.value = res.data.total || 0
    }
  } catch {
    // 错误已在拦截器中处理
  } finally {
    loading.value = false
  }
}

/** 搜索 */
function handleSearch() {
  queryParams.pageNum = 1
  fetchData()
}

/** 重置 */
function handleReset() {
  queryParams.problemId = undefined
  queryParams.userId = undefined
  queryParams.pageNum = 1
  fetchData()
}

/** 点击行查看详情 */
async function handleRowClick(row: SubmissionVO) {
  detailLoading.value = true
  detailDialogVisible.value = true
  detail.value = null
  try {
    const res = await getSubmissionById(row.id)
    detail.value = res.data
  } catch {
    detailDialogVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

/** 状态码 -> 标签类型 */
function getStatusTagType(status: SubmissionStatus): TagType {
  const map: Record<number, TagType> = {
    [SubmissionStatus.PENDING]: 'info',
    [SubmissionStatus.JUDGING]: 'warning',
    [SubmissionStatus.AC]: 'success',
    [SubmissionStatus.CE]: 'info',
    [SubmissionStatus.SE]: 'danger',
    [SubmissionStatus.WA]: 'danger',
    [SubmissionStatus.TLE]: 'warning',
    [SubmissionStatus.MLE]: 'warning',
    [SubmissionStatus.RE]: 'danger',
    [SubmissionStatus.OLE]: 'warning',
    [SubmissionStatus.PA]: 'warning'
  }
  return map[status] || 'info'
}

/** 状态码 -> 文本 */
function getStatusLabel(status: SubmissionStatus): string {
  const labels: Record<number, string> = {
    [SubmissionStatus.PENDING]: '待判题',
    [SubmissionStatus.JUDGING]: '判题中',
    [SubmissionStatus.AC]: 'Accepted',
    [SubmissionStatus.CE]: '编译错误',
    [SubmissionStatus.SE]: '系统错误',
    [SubmissionStatus.WA]: '答案错误',
    [SubmissionStatus.TLE]: '时间超限',
    [SubmissionStatus.MLE]: '内存超限',
    [SubmissionStatus.RE]: '运行错误',
    [SubmissionStatus.OLE]: '输出超限',
    [SubmissionStatus.PA]: '部分通过'
  }
  return labels[status] || '未知'
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.submission-container {
  padding: 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>

<template>
  <div class="testcase-container">
    <el-card>
      <!-- 头部信息 -->
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button type="text" @click="goBack">
              <el-icon><ArrowLeft /></el-icon>
              返回题目列表
            </el-button>
            <span class="problem-title" v-if="problemTitle">
              题目: {{ problemTitle }}
            </span>
          </div>
          <div class="header-right" v-if="problemId">
            <el-button type="primary" v-permission="'TESTCASE.ADD'" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新增测试用例
            </el-button>
            <el-button type="danger" v-permission="'TESTCASE.DELETE'" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              批量删除
            </el-button>
          </div>
        </div>
      </template>

      <!-- 提示信息 -->
      <el-alert
        v-if="!problemId"
        title="请从题目管理页面选择一个题目来管理测试用例"
        type="warning"
        :closable="false"
        show-icon
      />

      <!-- 表格 -->
      <el-table
        v-if="problemId"
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
        style="margin-top: 20px;"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column label="是否样例" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isSample === 1 ? 'success' : 'info'">
              {{ row.isSample === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="分值" width="80" />
        <el-table-column label="输入数据" min-width="200">
          <template #default="{ row }">
            <el-text class="data-preview" truncated>{{ row.input }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="预期输出" min-width="200">
          <template #default="{ row }">
            <el-text class="data-preview" truncated>{{ row.output }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button type="warning" size="small" v-permission="'TESTCASE.EDIT'" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" v-permission="'TESTCASE.DELETE'" @click="handleDelete(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="排序" prop="sortOrder">
              <el-input-number v-model="formData.sortOrder" :min="0" :max="9999" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否样例" prop="isSample">
              <el-radio-group v-model="formData.isSample">
                <el-radio :value="1">是</el-radio>
                <el-radio :value="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="分值" prop="score">
              <el-input-number v-model="formData.score" :min="0" :max="100" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="输入数据" prop="input">
          <el-input v-model="formData.input" type="textarea" :rows="8" placeholder="请输入测试输入数据" />
        </el-form-item>
        <el-form-item label="预期输出" prop="output">
          <el-input v-model="formData.output" type="textarea" :rows="8" placeholder="请输入预期输出数据" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="测试用例详情"
      width="700px"
    >
      <el-descriptions :column="3" border>
        <el-descriptions-item label="ID">{{ currentTestCase?.id }}</el-descriptions-item>
        <el-descriptions-item label="排序">{{ currentTestCase?.sortOrder }}</el-descriptions-item>
        <el-descriptions-item label="分值">{{ currentTestCase?.score }}</el-descriptions-item>
        <el-descriptions-item label="是否样例">
          <el-tag :type="currentTestCase?.isSample === 1 ? 'success' : 'info'">
            {{ currentTestCase?.isSample === 1 ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <div class="data-section">
        <div class="data-block">
          <h4>输入数据</h4>
          <pre class="data-content">{{ currentTestCase?.input }}</pre>
        </div>
        <div class="data-block">
          <h4>预期输出</h4>
          <pre class="data-content">{{ currentTestCase?.output }}</pre>
        </div>
      </div>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import {
  getTestCasesByProblemId,
  addTestCase,
  updateTestCase,
  deleteTestCase,
  batchDeleteTestCases
} from '@/api/testcase'
import type { TestCaseVO, TestCaseSaveDTO } from '@/types/api'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const formRef = ref<FormInstance>()
const tableData = ref<TestCaseVO[]>([])
const selectedIds = ref<number[]>([])
const currentTestCase = ref<TestCaseVO | null>(null)

const problemId = computed(() => {
  const id = route.query.problemId
  return id ? Number(id) : null
})

const problemTitle = computed(() => {
  return route.query.problemTitle as string || ''
})

const formData = reactive<TestCaseSaveDTO>({
  problemId: 0,
  input: '',
  output: '',
  isSample: 0,
  score: 10,
  sortOrder: 1
})

const rules: FormRules = {
  input: [
    { required: true, message: '请输入测试输入数据', trigger: 'blur' }
  ],
  output: [
    { required: true, message: '请输入预期输出数据', trigger: 'blur' }
  ]
}

const dialogTitle = ref('新增测试用例')

// 返回题目列表
const goBack = () => {
  router.push('/problem')
}

// 查询数据
const fetchData = async () => {
  if (!problemId.value) return
  
  loading.value = true
  try {
    const res = await getTestCasesByProblemId(problemId.value)
    tableData.value = (res.data || []) as unknown as TestCaseVO[]
  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    loading.value = false
  }
}

// 新增
const handleAdd = () => {
  if (!problemId.value) return
  dialogTitle.value = '新增测试用例'
  formData.problemId = problemId.value
  // 设置默认排序为当前最大排序+1
  const maxSort = tableData.value.reduce((max, item) => Math.max(max, item.sortOrder), 0)
  formData.sortOrder = maxSort + 1
  dialogVisible.value = true
}

// 查看
const handleView = (row: TestCaseVO) => {
  currentTestCase.value = row
  viewDialogVisible.value = true
}

// 编辑
const handleEdit = (row: TestCaseVO) => {
  if (!problemId.value) return
  dialogTitle.value = '编辑测试用例'
  Object.assign(formData, {
    id: row.id,
    problemId: row.problemId,
    input: row.input,
    output: row.output,
    isSample: row.isSample,
    score: row.score,
    sortOrder: row.sortOrder
  })
  dialogVisible.value = true
}

// 删除
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确认删除该测试用例吗？', '提示', { type: 'warning' })
    await deleteTestCase(id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 个测试用例吗？`, '提示', { type: 'warning' })
    await batchDeleteTestCases(selectedIds.value)
    ElMessage.success('删除成功')
    selectedIds.value = []
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (formData.id) {
          await updateTestCase(formData)
          ElMessage.success('修改成功')
        } else {
          await addTestCase(formData)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        fetchData()
      } catch (error) {
        console.error('操作失败:', error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 选择变化
const handleSelectionChange = (selection: TestCaseVO[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: undefined,
    problemId: problemId.value || 0,
    input: '',
    output: '',
    isSample: 0,
    score: 10,
    sortOrder: 1
  })
}

onMounted(() => {
  if (problemId.value) {
    fetchData()
  }
})
</script>

<style scoped>
.testcase-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-right {
  display: flex;
  gap: 10px;
}

.problem-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.data-preview {
  font-family: monospace;
  font-size: 12px;
  max-width: 300px;
}

.data-section {
  margin-top: 20px;
  display: flex;
  gap: 20px;
}

.data-block {
  flex: 1;
}

.data-block h4 {
  margin-bottom: 10px;
  color: #303133;
}

.data-content {
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  margin: 0;
  font-family: monospace;
  font-size: 13px;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
}
</style>

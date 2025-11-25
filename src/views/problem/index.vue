<template>
  <div class="problem-container">
    <el-card>
      <!-- 搜索栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input
            v-model="queryParams.keyword"
            placeholder="请输入题目标题"
            clearable
            style="width: 200px; margin-right: 10px;"
            @keyup.enter="handleSearch"
          />
          <el-select
            v-model="queryParams.difficulty"
            placeholder="难度筛选"
            clearable
            style="width: 120px; margin-right: 10px;"
          >
            <el-option label="简单" :value="1" />
            <el-option label="中等" :value="2" />
            <el-option label="困难" :value="3" />
          </el-select>
          <el-select
            v-model="queryParams.status"
            placeholder="状态筛选"
            clearable
            style="width: 120px; margin-right: 10px;"
          >
            <el-option label="公开" :value="1" />
            <el-option label="隐藏" :value="0" />
          </el-select>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </div>
        <div class="toolbar-right">
          <el-button type="primary" v-permission="'PROBLEM.ADD'" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增题目
          </el-button>
          <el-button type="danger" v-permission="'PROBLEM.DELETE'" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
        style="margin-top: 20px;"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="题目标题" min-width="200" show-overflow-tooltip />
        <el-table-column label="难度" width="100">
          <template #default="{ row }">
            <el-tag :type="getDifficultyType(row.difficulty)">
              {{ getDifficultyLabel(row.difficulty) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="timeLimit" label="时间限制" width="100">
          <template #default="{ row }">
            {{ row.timeLimit }} ms
          </template>
        </el-table-column>
        <el-table-column prop="memoryLimit" label="内存限制" width="100">
          <template #default="{ row }">
            {{ row.memoryLimit }} MB
          </template>
        </el-table-column>
        <el-table-column label="通过率" width="100">
          <template #default="{ row }">
            {{ getAcceptRate(row) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
              v-permission="'PROBLEM.EDIT'"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" v-permission="'PROBLEM.EDIT'" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="warning" size="small" v-permission="'TESTCASE.LIST'" @click="handleTestCase(row)">
              测试用例
            </el-button>
            <el-button type="danger" size="small" v-permission="'PROBLEM.DELETE'" @click="handleDelete(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryParams.pageNo"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchData"
        @current-change="fetchData"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="题目标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入题目标题" maxlength="255" show-word-limit />
        </el-form-item>
        <el-form-item label="题目描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="5" placeholder="请输入题目描述" />
        </el-form-item>
        <el-form-item label="输入描述" prop="inputDescription">
          <el-input v-model="formData.inputDescription" type="textarea" :rows="3" placeholder="请输入输入描述" />
        </el-form-item>
        <el-form-item label="输出描述" prop="outputDescription">
          <el-input v-model="formData.outputDescription" type="textarea" :rows="3" placeholder="请输入输出描述" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="样例输入" prop="sampleInput">
              <el-input v-model="formData.sampleInput" type="textarea" :rows="3" placeholder="请输入样例输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="样例输出" prop="sampleOutput">
              <el-input v-model="formData.sampleOutput" type="textarea" :rows="3" placeholder="请输入样例输出" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="提示信息" prop="hint">
          <el-input v-model="formData.hint" type="textarea" :rows="2" placeholder="请输入提示信息" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="难度" prop="difficulty">
              <el-select v-model="formData.difficulty" placeholder="请选择难度" style="width: 100%;">
                <el-option label="简单" :value="1" />
                <el-option label="中等" :value="2" />
                <el-option label="困难" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="时间限制" prop="timeLimit">
              <el-input-number v-model="formData.timeLimit" :min="100" :max="60000" :step="100" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="内存限制" prop="memoryLimit">
              <el-input-number v-model="formData.memoryLimit" :min="16" :max="1024" :step="16" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="栈限制" prop="stackLimit">
              <el-input-number v-model="formData.stackLimit" :min="8" :max="512" :step="8" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="题目来源" prop="source">
              <el-input v-model="formData.source" placeholder="请输入题目来源" maxlength="255" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio :value="1">公开</el-radio>
                <el-radio :value="0">隐藏</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import {
  getProblemPage,
  addProblem,
  updateProblem,
  deleteProblem,
  batchDeleteProblems,
  updateProblemStatus
} from '@/api/problem'
import type { ProblemVO, ProblemSaveDTO, ProblemQueryDTO, PageVO } from '@/types/api'

const router = useRouter()
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const tableData = ref<ProblemVO[]>([])
const total = ref(0)
const selectedIds = ref<number[]>([])

const queryParams = reactive<ProblemQueryDTO>({
  pageNo: 1,
  pageSize: 10,
  difficulty: undefined,
  status: undefined,
  keyword: ''
})

const formData = reactive<ProblemSaveDTO>({
  title: '',
  description: '',
  inputDescription: '',
  outputDescription: '',
  sampleInput: '',
  sampleOutput: '',
  hint: '',
  difficulty: 1,
  timeLimit: 1000,
  memoryLimit: 256,
  stackLimit: 128,
  source: '',
  status: 1
})

const rules: FormRules = {
  title: [
    { required: true, message: '请输入题目标题', trigger: 'blur' },
    { max: 255, message: '题目标题最多255个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入题目描述', trigger: 'blur' }
  ],
  timeLimit: [
    { required: true, message: '请输入时间限制', trigger: 'blur' }
  ],
  memoryLimit: [
    { required: true, message: '请输入内存限制', trigger: 'blur' }
  ]
}

const dialogTitle = ref('新增题目')

// 获取难度标签
const getDifficultyLabel = (difficulty: number) => {
  const map: Record<number, string> = {
    1: '简单',
    2: '中等',
    3: '困难'
  }
  return map[difficulty] || '未知'
}

// 获取难度类型
const getDifficultyType = (difficulty: number): 'success' | 'warning' | 'danger' | 'info' => {
  const map: Record<number, 'success' | 'warning' | 'danger' | 'info'> = {
    1: 'success',
    2: 'warning',
    3: 'danger'
  }
  return map[difficulty] || 'info'
}

// 获取通过率
const getAcceptRate = (row: ProblemVO) => {
  if (row.submitCount === 0) return '0%'
  return ((row.acceptCount / row.submitCount) * 100).toFixed(1) + '%'
}

// 查询数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getProblemPage(queryParams)
    const pageData = res.data as unknown as PageVO<ProblemVO>
    tableData.value = pageData.list
    total.value = pageData.total
  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryParams.pageNo = 1
  fetchData()
}

// 重置
const handleReset = () => {
  queryParams.pageNo = 1
  queryParams.pageSize = 10
  queryParams.difficulty = undefined
  queryParams.status = undefined
  queryParams.keyword = ''
  fetchData()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增题目'
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: ProblemVO) => {
  dialogTitle.value = '编辑题目'
  Object.assign(formData, {
    id: row.id,
    title: row.title,
    description: row.description,
    inputDescription: row.inputDescription,
    outputDescription: row.outputDescription,
    sampleInput: row.sampleInput,
    sampleOutput: row.sampleOutput,
    hint: row.hint,
    difficulty: row.difficulty,
    timeLimit: row.timeLimit,
    memoryLimit: row.memoryLimit,
    stackLimit: row.stackLimit,
    source: row.source,
    status: row.status
  })
  dialogVisible.value = true
}

// 删除
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确认删除该题目吗？', '提示', { type: 'warning' })
    await deleteProblem(id)
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
    await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 个题目吗？`, '提示', { type: 'warning' })
    await batchDeleteProblems(selectedIds.value)
    ElMessage.success('删除成功')
    selectedIds.value = []
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
    }
  }
}

// 修改状态
const handleStatusChange = async (row: ProblemVO) => {
  try {
    await updateProblemStatus(row.id, row.status)
    ElMessage.success('状态修改成功')
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1
  }
}

// 跳转测试用例管理
const handleTestCase = (row: ProblemVO) => {
  router.push(`/testcase?problemId=${row.id}&problemTitle=${encodeURIComponent(row.title)}`)
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (formData.id) {
          await updateProblem(formData)
          ElMessage.success('修改成功')
        } else {
          await addProblem(formData)
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
const handleSelectionChange = (selection: ProblemVO[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: undefined,
    title: '',
    description: '',
    inputDescription: '',
    outputDescription: '',
    sampleInput: '',
    sampleOutput: '',
    hint: '',
    difficulty: 1,
    timeLimit: 1000,
    memoryLimit: 256,
    stackLimit: 128,
    source: '',
    status: 1
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.problem-container {
  padding: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.toolbar-right {
  display: flex;
  gap: 10px;
}
</style>

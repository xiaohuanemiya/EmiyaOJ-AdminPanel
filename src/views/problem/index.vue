<template>
  <div class="problem-container">
    <el-card>
      <!-- 搜索栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input
            v-model="queryParams.title"
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
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        style="margin-top: 20px;"
      >
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
              :before-change="() => handleStatusChange(row)"
              v-permission="'PROBLEM.EDIT'"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              :loading="editingProblemId === row.id"
              :disabled="editingProblemId !== undefined && editingProblemId !== row.id"
              v-permission="'PROBLEM.EDIT'"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button type="warning" size="small" v-permission="'TESTCASE.LIST'" @click="handleTestCase(row)">
              测试用例
            </el-button>
            <el-button type="success" size="small" v-permission="'TESTCASE.LIST'" @click="handleGenerator(row)">
              生成器
            </el-button>
            <el-button type="danger" size="small" v-permission="'PROBLEM.DELETE'" @click="handleDelete(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="1100px"
      destroy-on-close
      @close="resetForm"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="题目标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入题目标题" maxlength="255" show-word-limit />
        </el-form-item>
        <el-form-item label="题面内容" prop="description">
          <div class="markdown-section">
            <el-tabs v-model="activeMarkdownField" class="markdown-tabs">
              <el-tab-pane
                v-for="tab in markdownTabs"
                :key="tab.name"
                :label="tab.label"
                :name="tab.name"
              />
            </el-tabs>
            <ProblemMarkdownEditor
              ref="markdownEditorRef"
              v-model="activeMarkdownContent"
              :placeholder="activeMarkdownPlaceholder"
              @image-uploaded="handleImageUploaded"
            />
          </div>
        </el-form-item>
        <el-form-item label="题目图片">
          <div class="picture-section">
            <el-empty v-if="currentPictures.length === 0" description="暂无题目图片" :image-size="60" />
            <div v-else class="picture-grid">
              <div v-for="picture in currentPictures" :key="picture.id" class="picture-card">
                <el-image
                  :src="picture.url"
                  :preview-src-list="[picture.url]"
                  fit="cover"
                  class="picture-preview"
                  preview-teleported
                />
                <div class="picture-info">
                  <el-text truncated>{{ picture.originalFilename }}</el-text>
                  <span>{{ formatPictureSize(picture.size) }}</span>
                </div>
                <div class="picture-actions">
                  <el-button size="small" text type="primary" @click="handleInsertPicture(picture)">插入</el-button>
                  <el-button size="small" text type="primary" @click="handleDownloadPicture(picture)">下载</el-button>
                  <el-button size="small" text type="danger" @click="handleDeletePicture(picture)">删除</el-button>
                </div>
              </div>
            </div>
          </div>
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

    <!-- 测试用例管理对话框 -->
    <el-dialog
      v-model="testCaseDialogVisible"
      :title="'测试用例管理 - ' + currentProblem?.title"
      width="900px"
      destroy-on-close
    >
      <div class="testcase-header">
        <el-button type="primary" v-permission="'TESTCASE.ADD'" @click="handleAddTestCase">
          <el-icon><Plus /></el-icon>
          新增测试用例
        </el-button>
        <el-button type="danger" v-permission="'TESTCASE.DELETE'" :disabled="selectedTestCaseIds.length === 0" @click="handleBatchDeleteTestCase">
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
      </div>

      <el-table
        v-loading="testCaseLoading"
        :data="testCaseTableData"
        @selection-change="handleTestCaseSelectionChange"
        style="margin-top: 15px;"
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
        <el-table-column label="输入数据" min-width="150">
          <template #default="{ row }">
            <el-text v-if="row.input != null" class="data-preview" truncated>{{ row.input }}</el-text>
            <el-text v-else class="data-preview" type="info" size="small">（空）</el-text>
          </template>
        </el-table-column>
        <el-table-column label="预期输出" min-width="150">
          <template #default="{ row }">
            <el-text v-if="row.output != null" class="data-preview" truncated>{{ row.output }}</el-text>
            <el-text v-else class="data-preview" type="info" size="small">（空）</el-text>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleViewTestCase(row)">
              查看
            </el-button>
            <el-button type="warning" size="small" v-permission="'TESTCASE.EDIT'" @click="handleEditTestCase(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" v-permission="'TESTCASE.DELETE'" @click="handleDeleteTestCase(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <el-button @click="testCaseDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑测试用例对话框 -->
    <el-dialog
      v-model="testCaseFormDialogVisible"
      :title="testCaseFormDialogTitle"
      width="700px"
      @close="resetTestCaseForm"
    >
      <el-form ref="testCaseFormRef" :model="testCaseFormData" :rules="testCaseRules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="排序" prop="sortOrder">
              <el-input-number v-model="testCaseFormData.sortOrder" :min="0" :max="9999" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否样例" prop="isSample">
              <el-radio-group v-model="testCaseFormData.isSample">
                <el-radio :value="1">是</el-radio>
                <el-radio :value="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="分值" prop="score">
              <el-input-number v-model="testCaseFormData.score" :min="0" :max="100" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="输入数据（可选）" prop="input">
          <el-input v-model="testCaseFormData.input" type="textarea" :rows="8" placeholder="留空表示无标准输入" />
        </el-form-item>
        <el-form-item label="预期输出（可选）" prop="output">
          <el-input v-model="testCaseFormData.output" type="textarea" :rows="8" placeholder="留空表示期望无输出" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="testCaseFormDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleTestCaseSubmit" :loading="testCaseSubmitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看测试用例详情对话框 -->
    <el-dialog
      v-model="testCaseViewDialogVisible"
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
        <el-button @click="testCaseViewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import {
  getProblemPage,
  getProblemById,
  addProblem,
  updateProblem,
  deleteProblem,
  deleteProblemImage,
  downloadProblemImage
} from '@/api/problem'
import {
  getTestCasesByProblemId,
  addTestCase,
  updateTestCase,
  deleteTestCase,
  batchDeleteTestCases
} from '@/api/testcase'
import ProblemMarkdownEditor from '@/components/ProblemMarkdownEditor.vue'
import { removeProblemImageMarkdown } from '@/utils/markdown'
import type {
  ProblemPictureVO,
  ProblemVO,
  ProblemSaveDTO,
  ProblemQueryDTO,
  PageVO,
  TestCaseVO,
  TestCaseSaveDTO
} from '@/types/api'

type MarkdownField = 'description' | 'inputDescription' | 'outputDescription' | 'hint'
type ProblemMarkdownEditorExpose = {
  insertImage: (picture: ProblemPictureVO) => void
}

const router = useRouter()

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const editingProblemId = ref<number>()
const formRef = ref<FormInstance>()
const markdownEditorRef = ref<ProblemMarkdownEditorExpose>()
const tableData = ref<ProblemVO[]>([])
const total = ref(0)
const activeMarkdownField = ref<MarkdownField>('description')
const currentPictures = ref<ProblemPictureVO[]>([])
const newlyUploadedPictureIds = ref<Set<string>>(new Set())
const cleanupUploadsOnClose = ref(true)
let problemDetailRequestId = 0

const markdownTabs: Array<{ name: MarkdownField; label: string; placeholder: string }> = [
  { name: 'description', label: '题目描述', placeholder: '请输入题目描述 Markdown' },
  { name: 'inputDescription', label: '输入描述', placeholder: '请输入输入描述 Markdown' },
  { name: 'outputDescription', label: '输出描述', placeholder: '请输入输出描述 Markdown' },
  { name: 'hint', label: '提示信息', placeholder: '请输入提示信息 Markdown' }
]

const queryParams = reactive<ProblemQueryDTO>({
  pageNum: 1,
  pageSize: 10,
  difficulty: undefined,
  status: undefined,
  title: ''
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
  status: 1,
  pictureIds: []
})

const activeMarkdownContent = computed({
  get: () => formData[activeMarkdownField.value] || '',
  set: (value: string) => {
    formData[activeMarkdownField.value] = value
  }
})

const activeMarkdownPlaceholder = computed(() => {
  return markdownTabs.find(tab => tab.name === activeMarkdownField.value)?.placeholder || ''
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

// 测试用例相关
const testCaseDialogVisible = ref(false)
const testCaseFormDialogVisible = ref(false)
const testCaseViewDialogVisible = ref(false)
const testCaseLoading = ref(false)
const testCaseSubmitLoading = ref(false)
const testCaseTableData = ref<TestCaseVO[]>([])
const selectedTestCaseIds = ref<number[]>([])
const currentProblem = ref<ProblemVO | null>(null)
const currentTestCase = ref<TestCaseVO | null>(null)
const testCaseFormRef = ref<FormInstance>()
const testCaseFormDialogTitle = ref('新增测试用例')

const testCaseFormData = reactive<TestCaseSaveDTO>({
  problemId: 0,
  input: '',
  output: '',
  isSample: 0,
  score: 10,
  sortOrder: 1
})

const testCaseRules: FormRules = {}

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
  queryParams.pageNum = 1
  fetchData()
}

// 重置
const handleReset = () => {
  queryParams.pageNum = 1
  queryParams.pageSize = 10
  queryParams.difficulty = undefined
  queryParams.status = undefined
  queryParams.title = ''
  fetchData()
}

// 新增
const handleAdd = () => {
  problemDetailRequestId += 1
  editingProblemId.value = undefined
  dialogTitle.value = '新增题目'
  cleanupUploadsOnClose.value = true
  activeMarkdownField.value = 'description'
  dialogVisible.value = true
}

// 编辑
const handleEdit = async (row: ProblemVO) => {
  const requestId = ++problemDetailRequestId
  editingProblemId.value = row.id
  dialogTitle.value = '编辑题目'
  cleanupUploadsOnClose.value = true
  activeMarkdownField.value = 'description'
  try {
    const res = await getProblemById(row.id)
    if (requestId !== problemDetailRequestId) return

    const detail = res.data
    const pictures = detail.pictures || []
    Object.assign(formData, {
      id: detail.id,
      title: detail.title,
      description: detail.description,
      inputDescription: detail.inputDescription,
      outputDescription: detail.outputDescription,
      sampleInput: detail.sampleInput,
      sampleOutput: detail.sampleOutput,
      hint: detail.hint,
      difficulty: detail.difficulty,
      timeLimit: detail.timeLimit,
      memoryLimit: detail.memoryLimit,
      stackLimit: detail.stackLimit,
      source: detail.source,
      status: detail.status,
      pictureIds: pictures.map(picture => picture.id)
    })
    currentPictures.value = pictures
    dialogVisible.value = true
  } catch (error) {
    if (requestId === problemDetailRequestId) {
      console.error('获取题目详情失败:', error)
    }
  } finally {
    if (requestId === problemDetailRequestId) {
      editingProblemId.value = undefined
    }
  }
}

const formatPictureSize = (size: number) => {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

const handleImageUploaded = (picture: ProblemPictureVO) => {
  if (!dialogVisible.value) {
    void deleteProblemImage(picture.id)
    return
  }

  if (!currentPictures.value.some(item => item.id === picture.id)) {
    currentPictures.value.push(picture)
  }
  const pictureIds = new Set(formData.pictureIds || [])
  pictureIds.add(picture.id)
  formData.pictureIds = [...pictureIds]
  newlyUploadedPictureIds.value.add(picture.id)
}

const handleInsertPicture = (picture: ProblemPictureVO) => {
  markdownEditorRef.value?.insertImage(picture)
}

const handleDownloadPicture = async (picture: ProblemPictureVO) => {
  try {
    const blob = await downloadProblemImage(picture.id)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = picture.originalFilename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('下载题目图片失败:', error)
  }
}

const handleDeletePicture = async (picture: ProblemPictureVO) => {
  try {
    await ElMessageBox.confirm(`确认删除图片「${picture.originalFilename}」吗？`, '提示', { type: 'warning' })
    await deleteProblemImage(picture.id)
    currentPictures.value = currentPictures.value.filter(item => item.id !== picture.id)
    formData.pictureIds = (formData.pictureIds || []).filter(id => id !== picture.id)
    newlyUploadedPictureIds.value.delete(picture.id)
    const markdownFields: MarkdownField[] = ['description', 'inputDescription', 'outputDescription', 'hint']
    markdownFields.forEach(field => {
      formData[field] = removeProblemImageMarkdown(formData[field], picture.url)
    })
    ElMessage.success('图片删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除题目图片失败:', error)
    }
  }
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

// 修改状态（通过updateProblem修改）
const handleStatusChange = async (row: ProblemVO): Promise<boolean> => {
  const newStatus = row.status === 1 ? 0 : 1
  try {
    await updateProblem({ id: row.id, title: row.title, description: row.description, timeLimit: row.timeLimit, memoryLimit: row.memoryLimit, status: newStatus })
    ElMessage.success('状态修改成功')
    return true
  } catch (error) {
    return false
  }
}

// 打开测试用例管理
const handleTestCase = async (row: ProblemVO) => {
  currentProblem.value = row
  testCaseDialogVisible.value = true
  await fetchTestCaseData()
}

// 打开测试数据生成器
const handleGenerator = (row: ProblemVO) => {
  router.push({ path: '/testcase-generator', query: { problemId: row.id, problemTitle: row.title } })
}

// 获取测试用例数据
const fetchTestCaseData = async () => {
  if (!currentProblem.value) return
  
  testCaseLoading.value = true
  try {
    const res = await getTestCasesByProblemId(currentProblem.value.id)
    testCaseTableData.value = (res.data || []) as unknown as TestCaseVO[]
  } catch (error) {
    console.error('查询测试用例失败:', error)
  } finally {
    testCaseLoading.value = false
  }
}

// 新增测试用例
const handleAddTestCase = () => {
  if (!currentProblem.value) return
  testCaseFormDialogTitle.value = '新增测试用例'
  testCaseFormData.problemId = currentProblem.value.id
  // 设置默认排序为当前最大排序+1
  const maxSort = testCaseTableData.value.reduce((max, item) => Math.max(max, item.sortOrder), 0)
  testCaseFormData.sortOrder = maxSort + 1
  testCaseFormDialogVisible.value = true
}

// 查看测试用例
const handleViewTestCase = (row: TestCaseVO) => {
  currentTestCase.value = row
  testCaseViewDialogVisible.value = true
}

// 编辑测试用例
const handleEditTestCase = (row: TestCaseVO) => {
  testCaseFormDialogTitle.value = '编辑测试用例'
  Object.assign(testCaseFormData, {
    id: row.id,
    problemId: row.problemId,
    input: row.input ?? '',
    output: row.output ?? '',
    isSample: row.isSample,
    score: row.score,
    sortOrder: row.sortOrder
  })
  testCaseFormDialogVisible.value = true
}

// 删除测试用例
const handleDeleteTestCase = async (id: number) => {
  try {
    await ElMessageBox.confirm('确认删除该测试用例吗？', '提示', { type: 'warning' })
    await deleteTestCase(id)
    ElMessage.success('删除成功')
    fetchTestCaseData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除测试用例失败:', error)
    }
  }
}

// 批量删除测试用例
const handleBatchDeleteTestCase = async () => {
  try {
    await ElMessageBox.confirm(`确认删除选中的 ${selectedTestCaseIds.value.length} 个测试用例吗？`, '提示', { type: 'warning' })
    await batchDeleteTestCases(selectedTestCaseIds.value)
    ElMessage.success('删除成功')
    selectedTestCaseIds.value = []
    fetchTestCaseData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除测试用例失败:', error)
    }
  }
}

// 提交测试用例表单
const handleTestCaseSubmit = async () => {
  if (!testCaseFormRef.value) return
  
  await testCaseFormRef.value.validate(async (valid) => {
    if (valid) {
      testCaseSubmitLoading.value = true
      try {
        const submitData = {
          ...testCaseFormData,
          input: testCaseFormData.input?.trim() || null,
          output: testCaseFormData.output?.trim() || null
        }
        if (submitData.id) {
          await updateTestCase(submitData)
          ElMessage.success('修改成功')
        } else {
          await addTestCase(submitData)
          ElMessage.success('新增成功')
        }
        testCaseFormDialogVisible.value = false
        fetchTestCaseData()
      } catch (error) {
        console.error('操作失败:', error)
      } finally {
        testCaseSubmitLoading.value = false
      }
    }
  })
}

// 测试用例选择变化
const handleTestCaseSelectionChange = (selection: TestCaseVO[]) => {
  selectedTestCaseIds.value = selection.map(item => item.id)
}

// 重置测试用例表单
const resetTestCaseForm = () => {
  testCaseFormRef.value?.resetFields()
  Object.assign(testCaseFormData, {
    id: undefined,
    problemId: currentProblem.value?.id || 0,
    input: '',
    output: '',
    isSample: 0,
    score: 10,
    sortOrder: 1
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        const submitData: ProblemSaveDTO = {
          ...formData,
          pictureIds: [...(formData.pictureIds || [])]
        }
        if (submitData.id) {
          await updateProblem(submitData)
          ElMessage.success('修改成功')
        } else {
          await addProblem(submitData)
          ElMessage.success('新增成功')
        }
        cleanupUploadsOnClose.value = false
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

// 重置表单
const resetForm = () => {
  problemDetailRequestId += 1
  editingProblemId.value = undefined
  if (cleanupUploadsOnClose.value) {
    const pictureIds = [...newlyUploadedPictureIds.value]
    void Promise.allSettled(pictureIds.map(id => deleteProblemImage(id)))
  }
  newlyUploadedPictureIds.value = new Set()
  currentPictures.value = []
  cleanupUploadsOnClose.value = true
  activeMarkdownField.value = 'description'
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
    status: 1,
    pictureIds: []
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

.markdown-section,
.picture-section {
  width: 100%;
}

.markdown-tabs {
  margin-bottom: 8px;
}

.picture-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.picture-card {
  overflow: hidden;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #fff;
}

.picture-preview {
  display: block;
  width: 100%;
  height: 110px;
}

.picture-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px 4px;
  color: #909399;
  font-size: 12px;
}

.picture-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0 6px 6px;
}

.testcase-header {
  display: flex;
  gap: 10px;
}

.data-preview {
  font-family: monospace;
  font-size: 12px;
  max-width: 200px;
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

<template>
  <div class="generator-container">
    <el-card>
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
            <el-button type="primary" @click="showProblemSearch = true">
              <el-icon><Search /></el-icon>
              选择题目
            </el-button>
          </div>
        </div>
      </template>

      <!-- 未选择题目提示 -->
      <el-alert
        v-if="!problemId"
        title="请选择一道题目来管理测试数据生成器"
        type="warning"
        :closable="false"
        show-icon
      >
        <template #default>
          <el-button type="primary" style="margin-top: 8px;" @click="showProblemSearch = true">
            <el-icon><Search /></el-icon>
            搜索题目
          </el-button>
        </template>
      </el-alert>

      <!-- 生成器标签页 -->
      <el-tabs v-if="problemId" v-model="activeTab" type="border-card">
        <!-- Tab 1: 生成器描述 -->
        <el-tab-pane label="生成器描述" name="spec">
          <div v-if="!generatorExists" class="empty-state">
            <el-empty description="该题目尚未创建测试数据生成器">
              <el-button type="primary" v-permission="'TESTCASE.EDIT'" @click="handleCreateSpec">
                <el-icon><Plus /></el-icon>
                创建生成器描述
              </el-button>
            </el-empty>
          </div>
          <div v-else v-loading="specLoading" class="spec-content">
            <div class="spec-info">
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="创建者 ID">{{ specData?.createBy }}</el-descriptions-item>
                <el-descriptions-item label="更新者 ID">{{ specData?.updateBy }}</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ specData?.createTime }}</el-descriptions-item>
                <el-descriptions-item label="更新时间">{{ specData?.updateTime }}</el-descriptions-item>
              </el-descriptions>
            </div>
            <div class="spec-text">
              <h4>生成器描述</h4>
              <div class="spec-content-text">{{ specData?.spec || '暂无描述' }}</div>
            </div>
            <div class="spec-actions">
              <el-button type="primary" v-permission="'TESTCASE.EDIT'" @click="handleEditSpec">
                <el-icon><Edit /></el-icon>
                编辑描述
              </el-button>
            </div>
          </div>
        </el-tab-pane>

        <!-- Tab 2: 生成器脚本 -->
        <el-tab-pane label="生成器脚本" name="script">
          <div v-if="!generatorExists" class="empty-state">
            <el-empty description="请先在「生成器描述」中创建生成器描述" />
          </div>
          <div v-else v-loading="scriptLoading" class="script-content">
            <el-form label-width="80px">
              <el-form-item label="Python 脚本">
                <el-input
                  v-model="scriptCode"
                  type="textarea"
                  :rows="20"
                  placeholder="请输入 Python 生成器脚本，脚本必须向 stdout 输出 JSON 数组..."
                  class="code-editor"
                />
              </el-form-item>
            </el-form>
            <div class="script-hint">
              <el-alert type="info" :closable="false" show-icon>
                <template #title>
                  脚本输出要求：脚本必须向标准输出 (stdout) 输出 JSON 数组
                </template>
                每条用例包含 <code>input</code>（可选，缺省/null 表示空输入）、<code>output</code>（可选，缺省/null 表示期望无输出）、<code>isSample</code>（0/1，默认0）、<code>score</code>（≥0，默认0）、<code>sortOrder</code>（≥1）
              </el-alert>
            </div>
            <div class="script-actions">
              <el-button v-permission="'TESTCASE.EDIT'" @click="handleUseTemplate">
                <el-icon><Document /></el-icon>
                使用模板
              </el-button>
              <el-button type="primary" v-permission="'TESTCASE.EDIT'" :loading="scriptSaving" @click="handleSaveScript">
                <el-icon><Check /></el-icon>
                保存脚本
              </el-button>
            </div>
          </div>
        </el-tab-pane>

        <!-- Tab 3: 运行生成器 -->
        <el-tab-pane label="运行生成器" name="run">
          <div v-if="!generatorExists" class="empty-state">
            <el-empty description="请先创建生成器描述和脚本" />
          </div>
          <div v-else-if="!scriptCode" class="empty-state">
            <el-empty description="请先在「生成器脚本」中编写并保存脚本" />
          </div>
          <div v-else class="run-content">
            <div class="run-config">
              <el-form label-width="100px">
                <el-form-item label="保存策略">
                  <el-radio-group v-model="saveMode">
                    <el-radio value="APPEND">追加 (保留已有用例)</el-radio>
                    <el-radio value="REPLACE">替换 (删除已有用例)</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-form>
            </div>
            <div class="run-actions">
              <el-button
                type="primary"
                v-permission="'TESTCASE.ADD'"
                :loading="runLoading"
                @click="handleRun"
              >
                <el-icon><VideoPlay /></el-icon>
                运行生成器
              </el-button>
            </div>

            <!-- 运行结果 -->
            <div v-if="runResult" class="run-result">
              <el-divider />
              <h4>运行结果</h4>
              <el-descriptions :column="4" border size="small">
                <el-descriptions-item label="保存策略">
                  <el-tag>{{ runResult.saveMode === 'APPEND' ? '追加' : '替换' }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="生成数量">{{ runResult.generatedCount }}</el-descriptions-item>
                <el-descriptions-item label="保存数量">{{ runResult.savedCount }}</el-descriptions-item>
                <el-descriptions-item label="运行耗时">{{ runResult.timeUsed }} ms</el-descriptions-item>
                <el-descriptions-item label="内存使用">{{ runResult.memoryUsed }} KB</el-descriptions-item>
              </el-descriptions>

              <!-- 生成用例列表 -->
              <h4 style="margin-top: 20px;">生成的测试用例</h4>
              <el-table :data="runResult.testCases" style="margin-top: 10px;">
                <el-table-column type="index" label="#" width="50" />
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
                <el-table-column label="操作" width="80" fixed="right">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" @click="handleViewResult(row)">
                      查看
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 题目搜索对话框 -->
    <ProblemSearchDialog
      v-if="showProblemSearch"
      v-model="showProblemSearch"
      @confirm="handleProblemSelected"
    />

    <!-- 编辑描述对话框 -->
    <el-dialog
      v-model="specDialogVisible"
      :title="specDialogTitle"
      width="700px"
      @close="resetSpecForm"
    >
      <el-form ref="specFormRef" :model="specFormData" :rules="specRules" label-width="100px">
        <el-form-item label="生成器描述" prop="spec">
          <el-input
            v-model="specFormData.spec"
            type="textarea"
            :rows="10"
            placeholder="请输入生成器描述，说明数据范围、边界条件、分组策略和输出要求..."
          />
        </el-form-item>
      </el-form>
      <el-alert type="info" :closable="false" show-icon style="margin-bottom: 16px;">
        <template #title>编写建议</template>
        <ul class="spec-hint-list">
          <li>说明数据范围（如 1 ≤ N ≤ 10<sup>5</sup>）和边界条件</li>
          <li>描述测试用例分组策略（样例 / 小数据 / 大数据 / 边界）</li>
          <li>脚本须向 stdout 输出 JSON 数组，每条用例格式：<br/>
            <code>{{ formatHint }}</code>
          </li>
          <li>脚本仅依赖 Python 标准库，沙箱内不安装第三方库</li>
        </ul>
      </el-alert>
      <template #footer>
        <el-button @click="specDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSpecSubmit" :loading="specSubmitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看生成用例详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="测试用例详情"
      width="700px"
    >
      <el-descriptions :column="3" border>
        <el-descriptions-item label="ID">{{ currentViewCase?.id }}</el-descriptions-item>
        <el-descriptions-item label="排序">{{ currentViewCase?.sortOrder }}</el-descriptions-item>
        <el-descriptions-item label="分值">{{ currentViewCase?.score }}</el-descriptions-item>
        <el-descriptions-item label="是否样例">
          <el-tag :type="currentViewCase?.isSample === 1 ? 'success' : 'info'">
            {{ currentViewCase?.isSample === 1 ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <div class="data-section">
        <div class="data-block">
          <h4>输入数据</h4>
          <pre class="data-content">{{ currentViewCase?.input }}</pre>
        </div>
        <div class="data-block">
          <h4>预期输出</h4>
          <pre class="data-content">{{ currentViewCase?.output }}</pre>
        </div>
      </div>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import ProblemSearchDialog from '@/components/ProblemSearchDialog.vue'
import {
  createTestCaseGeneratorSpec,
  updateTestCaseGeneratorSpec,
  getTestCaseGeneratorSpec,
  getTestCaseGenerator,
  updateTestCaseGenerator,
  runTestCaseGenerator
} from '@/api/testcaseGenerator'
import type {
  TestCaseGeneratorSpecVO,
  RunTestCaseGeneratorVO,
  TestCaseVO,
  ProblemVO
} from '@/types/api'

// ========== Python 模板 ==========
const PYTHON_TEMPLATE = `import json

cases = [
    {
        "input": "",
        "output": "",
        "isSample": 0,
        "score": 100,
        "sortOrder": 1
    }
]

print(json.dumps(cases, ensure_ascii=False))
`

const formatHint = `{"input":"...","output":"...","isSample":0,"score":100,"sortOrder":1}`

const route = useRoute()
const router = useRouter()

// ========== 基本状态 ==========
const activeTab = ref('spec')
const showProblemSearch = ref(false)
const problemId = ref<number | null>(null)
const problemTitle = ref('')
const generatorExists = ref(false)

// ========== 题目选择 ==========
const handleProblemSelected = (problems: ProblemVO[]) => {
  if (problems.length > 0) {
    const p = problems[0]
    router.replace({ query: { problemId: p.id, problemTitle: p.title } })
    showProblemSearch.value = false
  }
}

const initProblemFromRoute = () => {
  const id = route.query.problemId
  const title = route.query.problemTitle
  if (id) {
    problemId.value = Number(id)
    problemTitle.value = (title as string) || ''
    loadGeneratorData()
  }
}

// ========== Spec 管理 ==========
const specLoading = ref(false)
const specData = ref<TestCaseGeneratorSpecVO | null>(null)
const specDialogVisible = ref(false)
const specDialogTitle = ref('创建生成器描述')
const specSubmitLoading = ref(false)
const specFormRef = ref<FormInstance>()

const specFormData = reactive({
  spec: ''
})

const specRules: FormRules = {
  spec: [
    { required: true, message: '请输入生成器描述', trigger: 'blur' }
  ]
}

const loadSpecData = async () => {
  if (!problemId.value) return
  specLoading.value = true
  try {
    const res = await getTestCaseGeneratorSpec(problemId.value)
    specData.value = res.data
    generatorExists.value = true
  } catch {
    specData.value = null
    generatorExists.value = false
  } finally {
    specLoading.value = false
  }
}

const handleCreateSpec = () => {
  specDialogTitle.value = '创建生成器描述'
  specFormData.spec = ''
  specDialogVisible.value = true
}

const handleEditSpec = () => {
  specDialogTitle.value = '编辑生成器描述'
  specFormData.spec = specData.value?.spec || ''
  specDialogVisible.value = true
}

const handleSpecSubmit = async () => {
  if (!specFormRef.value || !problemId.value) return
  await specFormRef.value.validate(async (valid) => {
    if (valid) {
      specSubmitLoading.value = true
      try {
        if (generatorExists.value) {
          await updateTestCaseGeneratorSpec(problemId.value!, { spec: specFormData.spec })
          ElMessage.success('描述更新成功')
        } else {
          await createTestCaseGeneratorSpec(problemId.value!, { spec: specFormData.spec })
          ElMessage.success('生成器创建成功')
        }
        specDialogVisible.value = false
        await loadGeneratorData()
        await loadSpecData()
      } catch {
        // error handled by interceptor
      } finally {
        specSubmitLoading.value = false
      }
    }
  })
}

const resetSpecForm = () => {
  specFormRef.value?.resetFields()
  specFormData.spec = ''
}

// ========== Script 管理 ==========
const scriptLoading = ref(false)
const scriptSaving = ref(false)
const scriptCode = ref('')

const loadScriptData = async () => {
  if (!problemId.value || !generatorExists.value) return
  scriptLoading.value = true
  try {
    const res = await getTestCaseGenerator(problemId.value)
    scriptCode.value = res.data.generatorCode || ''
  } catch {
    scriptCode.value = ''
  } finally {
    scriptLoading.value = false
  }
}

const handleSaveScript = async () => {
  if (!problemId.value) return
  if (!scriptCode.value.trim()) {
    ElMessage.warning('请输入生成器脚本')
    return
  }
  scriptSaving.value = true
  try {
    await updateTestCaseGenerator(problemId.value, { generatorCode: scriptCode.value })
    ElMessage.success('脚本保存成功')
  } catch {
    // error handled by interceptor
  } finally {
    scriptSaving.value = false
  }
}

const handleUseTemplate = () => {
  if (scriptCode.value.trim()) {
    ElMessageBox.confirm(
      '当前编辑器中已有内容，使用模板将覆盖现有代码，是否继续？',
      '确认覆盖',
      { type: 'warning', confirmButtonText: '覆盖', cancelButtonText: '取消' }
    ).then(() => {
      scriptCode.value = PYTHON_TEMPLATE
    }).catch(() => {})
  } else {
    scriptCode.value = PYTHON_TEMPLATE
  }
}

// ========== Run 管理 ==========
const saveMode = ref('APPEND')
const runLoading = ref(false)
const runResult = ref<RunTestCaseGeneratorVO | null>(null)

const handleRun = async () => {
  if (!problemId.value) return
  try {
    await ElMessageBox.confirm(
      saveMode.value === 'REPLACE'
        ? '替换模式将删除该题目已有的所有测试用例，确认运行？'
        : '将以追加方式生成测试用例，确认运行？',
      '确认运行',
      { type: 'warning' }
    )
  } catch {
    return
  }

  runLoading.value = true
  try {
    const res = await runTestCaseGenerator(problemId.value, { saveMode: saveMode.value })
    runResult.value = res.data
    ElMessage.success(`成功生成 ${res.data.savedCount} 条测试用例`)
  } catch {
    runResult.value = null
  } finally {
    runLoading.value = false
  }
}

// ========== 查看生成结果 ==========
const viewDialogVisible = ref(false)
const currentViewCase = ref<TestCaseVO | null>(null)

const handleViewResult = (row: TestCaseVO) => {
  currentViewCase.value = row
  viewDialogVisible.value = true
}

// ========== 综合加载 ==========
const loadGeneratorData = async () => {
  await loadSpecData()
  await loadScriptData()
}

// ========== Tab 切换加载 ==========
watch(activeTab, (tab) => {
  if (tab === 'script' && generatorExists.value && !scriptCode.value) {
    loadScriptData()
  }
})

// ========== 路由变化监听 ==========
watch(() => route.query, () => {
  initProblemFromRoute()
}, { immediate: false })

// ========== 生命周期 ==========
onMounted(() => {
  initProblemFromRoute()
})

// ========== 导航 ==========
const goBack = () => {
  router.push('/problem')
}
</script>

<style scoped>
.generator-container {
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

.empty-state {
  padding: 40px 0;
}

.spec-content,
.script-content,
.run-content {
  padding: 10px 0;
}

.spec-info {
  margin-bottom: 16px;
}

.spec-text h4 {
  margin-bottom: 10px;
  color: #303133;
}

.spec-content-text {
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
  white-space: pre-wrap;
  line-height: 1.6;
  min-height: 80px;
}

.spec-hint-list {
  margin: 0;
  padding-left: 18px;
  line-height: 1.8;
}

.spec-hint-list code {
  background: #f0f0f0;
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 12px;
}

.script-actions,
.run-actions {
  margin-top: 16px;
  display: flex;
  gap: 10px;
}

.script-hint {
  margin: 12px 0;
}

.script-hint code {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  word-break: break-all;
}

.code-editor :deep(textarea) {
  font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, monospace;
  font-size: 13px;
  line-height: 1.5;
}

.run-config {
  margin-bottom: 10px;
}

.run-result {
  margin-top: 10px;
}

.run-result h4 {
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

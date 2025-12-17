<template>
  <div class="blog-container">
    <el-card>
      <!-- 搜索栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input
            v-model="queryParams.keyword"
            placeholder="请输入博客标题或内容"
            clearable
            style="width: 200px; margin-right: 10px;"
            @keyup.enter="handleSearch"
          />
          <el-input
            v-model="queryParams.category"
            placeholder="分类筛选"
            clearable
            style="width: 120px; margin-right: 10px;"
          />
          <el-select
            v-model="queryParams.status"
            placeholder="状态筛选"
            clearable
            style="width: 120px; margin-right: 10px;"
          >
            <el-option label="已发布" :value="1" />
            <el-option label="草稿" :value="0" />
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
          <el-button type="primary" v-permission="'BLOG.ADD'" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增博客
          </el-button>
          <el-button type="danger" v-permission="'BLOG.DELETE'" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
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
        <el-table-column prop="title" label="博客标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column label="标签" width="150">
          <template #default="{ row }">
            <el-tag v-for="tag in row.tags" :key="tag" size="small" style="margin-right: 5px;">
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="浏览量" width="100" />
        <el-table-column prop="likeCount" label="点赞数" width="100" />
        <el-table-column label="置顶" width="80">
          <template #default="{ row }">
            <el-switch
              v-model="row.isTop"
              :active-value="1"
              :inactive-value="0"
              :before-change="() => handleTopChange(row)"
              v-permission="'BLOG.EDIT'"
            />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              :before-change="() => handleStatusChange(row)"
              v-permission="'BLOG.EDIT'"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" v-permission="'BLOG.EDIT'" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" v-permission="'BLOG.DELETE'" @click="handleDelete(row.id)">
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
      width="900px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="博客标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入博客标题" maxlength="255" show-word-limit />
        </el-form-item>
        <el-form-item label="摘要" prop="summary">
          <el-input v-model="formData.summary" type="textarea" :rows="3" placeholder="请输入摘要" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="博客内容" prop="content">
          <el-input v-model="formData.content" type="textarea" :rows="10" placeholder="请输入博客内容" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="作者" prop="author">
              <el-input v-model="formData.author" placeholder="请输入作者" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="分类" prop="category">
              <el-input v-model="formData.category" placeholder="请输入分类" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="封面图片" prop="coverImage">
              <el-input v-model="formData.coverImage" placeholder="请输入封面图片URL" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="标签" prop="tags">
          <el-select
            v-model="formData.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请输入标签（可多选）"
            style="width: 100%;"
          >
            <el-option
              v-for="tag in commonTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio :value="1">已发布</el-radio>
                <el-radio :value="0">草稿</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="置顶" prop="isTop">
              <el-radio-group v-model="formData.isTop">
                <el-radio :value="1">是</el-radio>
                <el-radio :value="0">否</el-radio>
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
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import {
  getBlogPage,
  addBlog,
  updateBlog,
  deleteBlog,
  batchDeleteBlogs,
  updateBlogStatus,
  updateBlogTop
} from '@/api/blog'
import type { BlogVO, BlogSaveDTO, BlogQueryDTO, PageVO } from '@/types/api'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const tableData = ref<BlogVO[]>([])
const total = ref(0)
const selectedIds = ref<number[]>([])

// 常用标签
const commonTags = ref(['算法', '数据结构', '前端', '后端', '数据库', '系统设计', '编程技巧', '学习笔记'])

const queryParams = reactive<BlogQueryDTO>({
  pageNo: 1,
  pageSize: 10,
  status: undefined,
  category: undefined,
  keyword: ''
})

const formData = reactive<BlogSaveDTO>({
  title: '',
  summary: '',
  content: '',
  author: '',
  category: '',
  tags: [],
  coverImage: '',
  status: 1,
  isTop: 0
})

const rules: FormRules = {
  title: [
    { required: true, message: '请输入博客标题', trigger: 'blur' },
    { max: 255, message: '标题长度不能超过255个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入博客内容', trigger: 'blur' }
  ],
  summary: [
    { max: 500, message: '摘要长度不能超过500个字符', trigger: 'blur' }
  ],
  author: [
    { max: 50, message: '作者长度不能超过50个字符', trigger: 'blur' }
  ],
  category: [
    { max: 50, message: '分类长度不能超过50个字符', trigger: 'blur' }
  ]
}

const dialogTitle = computed(() => {
  return formData.id ? '编辑博客' : '新增博客'
})

// 获取博客列表
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getBlogPage(queryParams)
    const pageData = res.data as unknown as PageVO<BlogVO>
    tableData.value = pageData.list
    total.value = pageData.total
  } catch (error) {
    console.error('获取博客列表失败:', error)
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
  queryParams.status = undefined
  queryParams.category = undefined
  queryParams.keyword = ''
  fetchData()
}

// 新增
const handleAdd = () => {
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: BlogVO) => {
  Object.assign(formData, {
    id: row.id,
    title: row.title,
    summary: row.summary,
    content: row.content,
    author: row.author,
    category: row.category,
    tags: row.tags || [],
    coverImage: row.coverImage,
    status: row.status,
    isTop: row.isTop
  })
  dialogVisible.value = true
}

// 删除
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该博客吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteBlog(id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个博客吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await batchDeleteBlogs(selectedIds.value)
    ElMessage.success('批量删除成功')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
    }
  }
}

// 表格选择变化
const handleSelectionChange = (selection: BlogVO[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 修改状态
const handleStatusChange = async (row: BlogVO) => {
  try {
    const newStatus = row.status === 1 ? 0 : 1
    await updateBlogStatus(row.id, newStatus)
    ElMessage.success('状态修改成功')
    row.status = newStatus
    return true
  } catch (error) {
    console.error('状态修改失败:', error)
    return false
  }
}

// 修改置顶状态
const handleTopChange = async (row: BlogVO) => {
  try {
    const newTop = row.isTop === 1 ? 0 : 1
    await updateBlogTop(row.id, newTop)
    ElMessage.success('置顶状态修改成功')
    row.isTop = newTop
    return true
  } catch (error) {
    console.error('置顶状态修改失败:', error)
    return false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        formData.id 
          ? await updateBlog(formData) 
          : await addBlog(formData)
        
        ElMessage.success(formData.id ? '修改成功' : '新增成功')
        dialogVisible.value = false
        fetchData()
      } catch (error) {
        console.error('提交失败:', error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: undefined,
    title: '',
    summary: '',
    content: '',
    author: '',
    category: '',
    tags: [],
    coverImage: '',
    status: 1,
    isTop: 0
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.blog-container {
  padding: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>

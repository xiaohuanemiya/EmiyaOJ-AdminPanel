<template>
  <div class="blog-container">
    <!-- 博客列表卡片 -->
    <el-card>
      <!-- 搜索栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input
            v-model="queryParams.title"
            placeholder="请输入博客标题"
            clearable
            style="width: 200px; margin-right: 10px;"
            @keyup.enter="handleSearch"
          />
          <el-date-picker
            v-model="queryParams.createTime"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DDTHH:mm:ss"
            clearable
            style="width: 180px; margin-right: 10px;"
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
        <div class="toolbar-right">
          <el-button type="primary" v-permission="'BLOG.ADD'" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增博客
          </el-button>
        </div>
      </div>

      <!-- 博客表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        style="margin-top: 20px;"
      >
        <el-table-column prop="id" label="ID" width="120" show-overflow-tooltip />
        <el-table-column prop="title" label="博客标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="userId" label="用户ID" width="120" show-overflow-tooltip />
        <el-table-column label="标签" width="200">
          <template #default="{ row }">
            <template v-if="row.tags && row.tags.length > 0">
              <el-tag
                v-for="tag in row.tags"
                :key="tag.id"
                size="small"
                style="margin-right: 4px; margin-bottom: 4px;"
              >
                {{ tag.name }}
              </el-tag>
            </template>
            <span v-else style="color: #909399;">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容预览" min-width="200">
          <template #default="{ row }">
            <span>{{ truncateContent(row.content) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="info" size="small" @click="handleViewComments(row)">
              评论
            </el-button>
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

    <!-- 标签管理卡片 -->
    <el-card style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>博客标签</span>
          <el-button type="primary" size="small" @click="fetchTags" :loading="tagsLoading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      <div class="tags-container" v-loading="tagsLoading">
        <el-tag
          v-for="tag in tagList"
          :key="tag.id"
          size="large"
          style="margin: 5px;"
        >
          {{ tag.name }}
          <el-tooltip v-if="tag.desc" :content="tag.desc" placement="top">
            <el-icon style="margin-left: 4px; cursor: help;"><InfoFilled /></el-icon>
          </el-tooltip>
        </el-tag>
        <el-empty v-if="tagList.length === 0" description="暂无标签" :image-size="60" />
      </div>
    </el-card>

    <!-- 新增/编辑博客对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="博客标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入博客标题" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="博客内容" prop="content">
          <el-input v-model="formData.content" type="textarea" :rows="10" placeholder="请输入博客内容" maxlength="10000" show-word-limit />
        </el-form-item>
        <!-- 标签只在新增时可选择，编辑时不支持修改标签 -->
        <el-form-item v-if="!editingBlogId" label="标签" prop="tagIds">
          <el-select
            v-model="formData.tagIds"
            multiple
            placeholder="请选择标签"
            style="width: 100%;"
            :loading="tagsLoading"
          >
            <el-option
              v-for="tag in tagList"
              :key="tag.id"
              :label="tag.name"
              :value="Number(tag.id)"
            />
          </el-select>
          <div class="el-form-item__tip" style="color: #909399; font-size: 12px; margin-top: 4px;">
            提示：标签在博客发布后无法修改
          </div>
        </el-form-item>
        <el-alert v-else type="info" :closable="false" style="margin-bottom: 15px;">
          注意：修改博客不支持更新标签，如需修改标签请删除后重新发布
        </el-alert>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 评论管理对话框 -->
    <el-dialog
      v-model="commentDialogVisible"
      :title="`评论管理 - ${currentBlog?.title || ''}`"
      width="900px"
    >
      <div class="comment-header">
        <el-button type="primary" size="small" v-permission="'COMMENT.ADD'" @click="showAddComment">
          <el-icon><Plus /></el-icon>
          发表评论
        </el-button>
        <el-button size="small" @click="fetchComments" :loading="commentLoading">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
      
      <!-- 评论列表 -->
      <el-table
        v-loading="commentLoading"
        :data="commentList"
        style="margin-top: 15px;"
        max-height="400"
      >
        <el-table-column prop="id" label="ID" width="120" show-overflow-tooltip />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="content" label="评论内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="评论时间" width="180" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" size="small" v-permission="'COMMENT.DELETE'" @click="handleDeleteComment(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 评论分页 -->
      <el-pagination
        v-model:current-page="commentPageParams.pageNo"
        v-model:page-size="commentPageParams.pageSize"
        :total="commentTotal"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchComments"
        @current-change="fetchComments"
        style="margin-top: 15px; justify-content: flex-end;"
      />
    </el-dialog>

    <!-- 发表评论对话框 -->
    <el-dialog
      v-model="addCommentDialogVisible"
      title="发表评论"
      width="500px"
    >
      <el-form ref="commentFormRef" :model="commentFormData" :rules="commentRules" label-width="80px">
        <el-form-item label="评论内容" prop="content">
          <el-input
            v-model="commentFormData.content"
            type="textarea"
            :rows="4"
            placeholder="请输入评论内容"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addCommentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddComment" :loading="commentSubmitLoading">发表</el-button>
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
  getBlogTags,
  getBlogComments,
  addComment,
  deleteComment
} from '@/api/blog'
import type { BlogVO, BlogAddDTO, BlogUpdateDTO, BlogQueryDTO, PageVO, BlogTagVO, CommentVO, PageDTO, CommentSaveDTO } from '@/types/api'

// ==================== 博客相关状态 ====================
const loading = ref(false)
const submitLoading = ref(false)
const tagsLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const tableData = ref<BlogVO[]>([])
const total = ref(0)
const tagList = ref<BlogTagVO[]>([])
const editingBlogId = ref<number | undefined>()

const queryParams = reactive<BlogQueryDTO>({
  pageNo: 1,
  pageSize: 10,
  title: undefined,
  createTime: undefined
})

const formData = reactive<BlogAddDTO>({
  title: '',
  content: '',
  tagIds: []
})

// 动态规则：新增时标签必填，编辑时标签不验证
const rules = computed<FormRules>(() => {
  const baseRules: FormRules = {
    title: [
      { required: true, message: '请输入博客标题', trigger: 'blur' },
      { max: 50, message: '标题长度不能超过50个字符', trigger: 'blur' }
    ],
    content: [
      { required: true, message: '请输入博客内容', trigger: 'blur' },
      { max: 10000, message: '内容长度不能超过10000个字符', trigger: 'blur' }
    ]
  }
  // 新增时标签必填
  if (!editingBlogId.value) {
    baseRules.tagIds = [
      { required: true, message: '请至少选择一个标签', trigger: 'change', type: 'array', min: 1 }
    ]
  }
  return baseRules
})

// ==================== 评论相关状态 ====================
const commentDialogVisible = ref(false)
const addCommentDialogVisible = ref(false)
const commentLoading = ref(false)
const commentSubmitLoading = ref(false)
const commentList = ref<CommentVO[]>([])
const commentTotal = ref(0)
const currentBlog = ref<BlogVO | null>(null)
const commentFormRef = ref<FormInstance>()

const commentPageParams = reactive<PageDTO>({
  pageNo: 1,
  pageSize: 10
})

const commentFormData = reactive<CommentSaveDTO>({
  content: ''
})

const commentRules: FormRules = {
  content: [
    { required: true, message: '请输入评论内容', trigger: 'blur' },
    { max: 200, message: '评论内容不能超过200个字符', trigger: 'blur' }
  ]
}

// ==================== 计算属性 ====================
const dialogTitle = computed(() => {
  return editingBlogId.value ? '编辑博客' : '新增博客'
})

// ==================== 工具函数 ====================
const truncateContent = (content: string) => {
  if (!content) return ''
  return content.length > 100 ? content.substring(0, 100) + '...' : content
}

// ==================== 博客相关方法 ====================
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getBlogPage(queryParams)
    const pageData = res.data as unknown as PageVO<BlogVO>
    tableData.value = pageData.list || []
    total.value = pageData.total || 0
  } catch (error) {
    console.error('获取博客列表失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchTags = async () => {
  tagsLoading.value = true
  try {
    const res = await getBlogTags()
    tagList.value = (res.data as unknown as BlogTagVO[]) || []
  } catch (error) {
    console.error('获取标签列表失败:', error)
  } finally {
    tagsLoading.value = false
  }
}

const handleSearch = () => {
  queryParams.pageNo = 1
  fetchData()
}

const handleReset = () => {
  queryParams.pageNo = 1
  queryParams.pageSize = 10
  queryParams.title = undefined
  queryParams.createTime = undefined
  fetchData()
}

const handleAdd = () => {
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: BlogVO) => {
  editingBlogId.value = Number(row.id)
  Object.assign(formData, {
    title: row.title,
    content: row.content,
    tagIds: []
  })
  dialogVisible.value = true
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该博客吗？删除后相关评论也会被删除。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteBlog(Number(id))
    ElMessage.success('删除成功')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (editingBlogId.value) {
          // 编辑模式：只发送 title 和 content
          const updateData: BlogUpdateDTO = {
            title: formData.title,
            content: formData.content
          }
          await updateBlog(editingBlogId.value, updateData)
        } else {
          // 新增模式：发送完整数据包括 tagIds
          await addBlog(formData)
        }
        
        ElMessage.success(editingBlogId.value ? '修改成功' : '新增成功')
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

const resetForm = () => {
  formRef.value?.resetFields()
  editingBlogId.value = undefined
  Object.assign(formData, {
    title: '',
    content: '',
    tagIds: []
  })
}

// ==================== 评论相关方法 ====================
const handleViewComments = (row: BlogVO) => {
  currentBlog.value = row
  commentPageParams.pageNo = 1
  commentPageParams.pageSize = 10
  commentDialogVisible.value = true
  fetchComments()
}

const fetchComments = async () => {
  if (!currentBlog.value) return
  
  commentLoading.value = true
  try {
    const res = await getBlogComments(Number(currentBlog.value.id), commentPageParams)
    const pageData = res.data as unknown as PageVO<CommentVO>
    commentList.value = pageData.list || []
    commentTotal.value = pageData.total || 0
  } catch (error) {
    console.error('获取评论列表失败:', error)
  } finally {
    commentLoading.value = false
  }
}

const showAddComment = () => {
  commentFormData.content = ''
  addCommentDialogVisible.value = true
}

const handleAddComment = async () => {
  if (!commentFormRef.value || !currentBlog.value) return
  
  await commentFormRef.value.validate(async (valid) => {
    if (valid) {
      commentSubmitLoading.value = true
      try {
        await addComment(Number(currentBlog.value!.id), commentFormData)
        ElMessage.success('评论发表成功')
        addCommentDialogVisible.value = false
        commentFormData.content = ''
        fetchComments()
      } catch (error) {
        console.error('发表评论失败:', error)
      } finally {
        commentSubmitLoading.value = false
      }
    }
  })
}

const handleDeleteComment = async (commentId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteComment(Number(commentId))
    ElMessage.success('删除成功')
    fetchComments()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
    }
  }
}

// ==================== 生命周期 ====================
onMounted(() => {
  fetchData()
  fetchTags()
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tags-container {
  min-height: 60px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.comment-header {
  display: flex;
  gap: 10px;
}
</style>

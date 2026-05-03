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
            style="width: 180px; margin-right: 10px;"
            @keyup.enter="handleSearch"
          />
          <el-select
            v-model="queryParams.blogType"
            placeholder="博客类型"
            clearable
            style="width: 130px; margin-right: 10px;"
          >
            <el-option label="普通博客" :value="0" />
            <el-option label="题解" :value="1" />
          </el-select>
          <el-select
            v-model="queryParams.tagId"
            placeholder="按标签筛选"
            clearable
            style="width: 150px; margin-right: 10px;"
            :loading="tagsLoading"
          >
            <el-option
              v-for="tag in tagList"
              :key="tag.id"
              :label="tag.name"
              :value="Number(tag.id)"
            />
          </el-select>
          <el-select
            v-model="queryParams.sortBy"
            placeholder="排序方式"
            clearable
            style="width: 140px; margin-right: 10px;"
          >
            <el-option label="创建时间" value="createTime" />
            <el-option label="更新时间" value="updateTime" />
            <el-option label="浏览量" value="viewCount" />
            <el-option label="点赞数" value="likeCount" />
          </el-select>
          <el-date-picker
            v-model="queryParams.createTime"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DDTHH:mm:ss"
            clearable
            style="width: 160px; margin-right: 10px;"
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
        <el-table-column prop="id" label="ID" width="80" show-overflow-tooltip />
        <el-table-column prop="title" label="博客标题" min-width="180" show-overflow-tooltip />
        <el-table-column prop="userId" label="用户ID" width="100" show-overflow-tooltip />
        <el-table-column label="类型" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.blogType === 1 ? 'success' : ''" size="small">
              {{ row.blogType === 1 ? '题解' : '博客' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="标签" width="180">
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
        <el-table-column prop="viewCount" label="浏览量" width="90" align="center" sortable />
        <el-table-column prop="likeCount" label="点赞" width="80" align="center" sortable />
        <el-table-column prop="content" label="内容预览" min-width="160">
          <template #default="{ row }">
            <span>{{ truncateContent(row.content) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column prop="updateTime" label="更新时间" width="170" />
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
          <div class="tag-actions">
            <el-button size="small" v-permission="'BLOG.TAG.LIST'" @click="fetchTags" :loading="tagsLoading">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button type="primary" size="small" v-permission="'BLOG.TAG.ADD'" @click="handleAddTag">
              <el-icon><Plus /></el-icon>
              新增标签
            </el-button>
          </div>
        </div>
      </template>
      <el-table
        v-loading="tagsLoading"
        :data="tagList"
        style="width: 100%;"
        empty-text="暂无标签"
      >
        <el-table-column prop="id" label="ID" width="160" show-overflow-tooltip />
        <el-table-column prop="name" label="标签名称" width="180" show-overflow-tooltip />
        <el-table-column prop="desc" label="标签描述" min-width="240" show-overflow-tooltip />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" v-permission="'BLOG.TAG.EDIT'" @click="handleEditTag(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" v-permission="'BLOG.TAG.DELETE'" @click="handleDeleteTag(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
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
        <el-form-item label="博客类型" prop="blogType">
          <el-radio-group v-model="formData.blogType">
            <el-radio :value="0">普通博客</el-radio>
            <el-radio :value="1">题解</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="formData.blogType === 1" label="关联题目ID" prop="problemId">
          <el-input-number v-model="formData.problemId" :min="1" placeholder="请输入题目ID" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="博客内容" prop="content">
          <el-input v-model="formData.content" type="textarea" :rows="10" placeholder="请输入博客内容" maxlength="10000" show-word-limit />
        </el-form-item>
        <el-form-item label="标签" prop="tagIds">
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
        </el-form-item>
        <el-form-item label="已绑图片">
          <div v-if="formData.pictureIds && formData.pictureIds.length > 0" style="display: flex; flex-wrap: wrap; gap: 8px;">
            <span v-for="pid in formData.pictureIds" :key="pid" style="color: #409EFF;">ID: {{ pid }}</span>
          </div>
          <span v-else style="color: #909399;">暂无绑定图片</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑标签对话框 -->
    <el-dialog
      v-model="tagDialogVisible"
      :title="tagDialogTitle"
      width="500px"
      @close="resetTagForm"
    >
      <el-form ref="tagFormRef" :model="tagFormData" :rules="tagRules" label-width="90px">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="tagFormData.name" placeholder="请输入标签名称" maxlength="255" show-word-limit />
        </el-form-item>
        <el-form-item label="标签描述" prop="desc">
          <el-input
            v-model="tagFormData.desc"
            type="textarea"
            :rows="4"
            placeholder="请输入标签描述"
            maxlength="255"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="tagDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleTagSubmit" :loading="tagSubmitLoading">确定</el-button>
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
  getBlogTagById,
  addBlogTag,
  updateBlogTag,
  deleteBlogTag,
  getBlogComments,
  addComment,
  deleteComment
} from '@/api/blog'
import type { BlogVO, BlogSaveDTO, BlogUpdateDTO, BlogQueryDTO, PageVO, BlogTagVO, BlogTagSaveDTO, CommentVO, PageDTO, CommentSaveDTO } from '@/types/api'

// ==================== 博客相关状态 ====================
const loading = ref(false)
const submitLoading = ref(false)
const tagsLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const tableData = ref<BlogVO[]>([])
const total = ref(0)
const tagList = ref<BlogTagVO[]>([])
const editingBlogId = ref<string | undefined>()

const queryParams = reactive<BlogQueryDTO>({
  pageNo: 1,
  pageSize: 10,
  title: undefined,
  blogType: undefined,
  tagId: undefined,
  sortBy: undefined,
  createTime: undefined
})

const formData = reactive<BlogSaveDTO>({
  title: '',
  content: '',
  blogType: 0,
  problemId: undefined,
  tagIds: [],
  pictureIds: []
})

// ==================== 标签相关状态 ====================
const tagDialogVisible = ref(false)
const tagSubmitLoading = ref(false)
const tagFormRef = ref<FormInstance>()
const editingTagId = ref<string | undefined>()

const tagFormData = reactive<BlogTagSaveDTO>({
  name: '',
  desc: ''
})

const tagRules: FormRules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { max: 255, message: '标签名称不能超过255个字符', trigger: 'blur' }
  ],
  desc: [
    { required: true, message: '请输入标签描述', trigger: 'blur' },
    { max: 255, message: '标签描述不能超过255个字符', trigger: 'blur' }
  ]
}

// 动态规则
const rules = computed<FormRules>(() => {
  const baseRules: FormRules = {
    title: [
      { required: true, message: '请输入博客标题', trigger: 'blur' },
      { max: 50, message: '标题长度不能超过50个字符', trigger: 'blur' }
    ],
    blogType: [
      { required: true, message: '请选择博客类型', trigger: 'change' }
    ],
    content: [
      { required: true, message: '请输入博客内容', trigger: 'blur' },
      { max: 10000, message: '内容长度不能超过10000个字符', trigger: 'blur' }
    ]
  }
  if (formData.blogType === 1) {
    baseRules.problemId = [
      { required: true, message: '题解必须关联题目', trigger: 'blur' }
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

const tagDialogTitle = computed(() => {
  return editingTagId.value ? '编辑标签' : '新增标签'
})

// ==================== 工具函数 ====================
const truncateContent = (content: string) => {
  if (!content) return ''
  return content.length > 100 ? content.substring(0, 100) + '...' : content
}

const getPageList = <T,>(pageData: PageVO<T>) => {
  return pageData.list || pageData.records || []
}

// ==================== 博客相关方法 ====================
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getBlogPage(queryParams)
    const pageData = res.data as unknown as PageVO<BlogVO>
    tableData.value = getPageList(pageData)
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
  queryParams.blogType = undefined
  queryParams.tagId = undefined
  queryParams.sortBy = undefined
  queryParams.createTime = undefined
  fetchData()
}

const handleAdd = () => {
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: BlogVO) => {
  editingBlogId.value = row.id
  Object.assign(formData, {
    title: row.title,
    content: row.content,
    blogType: row.blogType ?? 0,
    problemId: row.problemId ? Number(row.problemId) : undefined,
    tagIds: (row.tags || []).map(t => Number(t.id)),
    pictureIds: (row.pictures || []).map(p => Number(p.id))
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
    
    await deleteBlog(id)
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
          // 新增模式：发送完整数据
          const saveData: BlogSaveDTO = {
            title: formData.title,
            content: formData.content,
            blogType: formData.blogType,
            tagIds: formData.tagIds,
            pictureIds: formData.pictureIds
          }
          if (formData.blogType === 1 && formData.problemId) {
            saveData.problemId = formData.problemId
          }
          await addBlog(saveData)
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
    blogType: 0,
    problemId: undefined,
    tagIds: [],
    pictureIds: []
  })
}

// ==================== 标签相关方法 ====================
const handleAddTag = () => {
  resetTagForm()
  tagDialogVisible.value = true
}

const handleEditTag = async (row: BlogTagVO) => {
  editingTagId.value = row.id
  tagDialogVisible.value = true
  try {
    const res = await getBlogTagById(row.id)
    const tag = res.data as unknown as BlogTagVO
    Object.assign(tagFormData, {
      name: tag.name,
      desc: tag.desc
    })
  } catch (error) {
    Object.assign(tagFormData, {
      name: row.name,
      desc: row.desc
    })
    console.error('获取标签详情失败:', error)
  }
}

const handleDeleteTag = async (row: BlogTagVO) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除标签「${row.name}」吗？删除后该标签与博客的关联也会被移除。`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteBlogTag(row.id)
    ElMessage.success('删除成功')
    fetchTags()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除标签失败:', error)
    }
  }
}

const handleTagSubmit = async () => {
  if (!tagFormRef.value) return
  
  await tagFormRef.value.validate(async (valid) => {
    if (valid) {
      tagSubmitLoading.value = true
      try {
        const payload: BlogTagSaveDTO = {
          name: tagFormData.name,
          desc: tagFormData.desc
        }
        
        if (editingTagId.value) {
          await updateBlogTag(editingTagId.value, payload)
        } else {
          await addBlogTag(payload)
        }
        
        ElMessage.success(editingTagId.value ? '修改成功' : '新增成功')
        tagDialogVisible.value = false
        fetchTags()
      } catch (error) {
        console.error('提交标签失败:', error)
      } finally {
        tagSubmitLoading.value = false
      }
    }
  })
}

const resetTagForm = () => {
  tagFormRef.value?.resetFields()
  editingTagId.value = undefined
  Object.assign(tagFormData, {
    name: '',
    desc: ''
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
    const res = await getBlogComments(currentBlog.value.id, commentPageParams)
    const pageData = res.data as unknown as PageVO<CommentVO>
    commentList.value = getPageList(pageData)
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
        await addComment(currentBlog.value!.id, commentFormData)
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
    
    await deleteComment(commentId)
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

.tag-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.comment-header {
  display: flex;
  gap: 10px;
}
</style>

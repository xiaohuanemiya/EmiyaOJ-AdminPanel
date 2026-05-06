<template>
  <div class="moderation-container">
    <!-- 博客审核 -->
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span style="font-weight: bold;">博客审核</span>
          <el-button size="small" @click="fetchBlogs" :loading="blogLoading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <!-- 博客审核分类栏 -->
      <div class="toolbar">
        <el-radio-group
          v-model="blogQuery.auditStatus"
          @change="handleBlogFilterChange"
        >
          <el-radio-button :value="0">待审核</el-radio-button>
          <el-radio-button :value="1">已通过</el-radio-button>
          <el-radio-button :value="2">已驳回</el-radio-button>
          <el-radio-button :value="3">人工复核</el-radio-button>
        </el-radio-group>
        <el-input
          v-model="blogQuery.title"
          placeholder="搜索博客标题"
          clearable
          style="width: 200px; margin-left: 15px;"
          @keyup.enter="handleBlogFilterChange"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <el-table
        v-loading="blogLoading"
        :data="blogTableData"
        style="margin-top: 15px;"
      >
        <el-table-column prop="id" label="ID" width="80" show-overflow-tooltip />
        <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
        <el-table-column prop="userId" label="用户ID" width="100" show-overflow-tooltip />
        <el-table-column label="类型" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.blogType === 1 ? 'success' : 'info'" size="small">
              {{ row.blogType === 1 ? '题解' : '博客' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getAuditTagType(row.auditStatus)" size="small">
              {{ getAuditStatusText(row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核原因" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.auditReason || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleViewBlogDetail(row)">
              查看
            </el-button>
            <el-button
              v-if="row.auditStatus !== BlogAuditStatus.APPROVED"
              type="success"
              size="small"
              @click="handleApproveBlog(row)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.auditStatus !== BlogAuditStatus.REJECTED"
              type="warning"
              size="small"
              @click="handleRejectBlog(row)"
            >
              驳回
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="blogQuery.pageNo"
        v-model:page-size="blogQuery.pageSize"
        :total="blogTotal"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchBlogs"
        @current-change="fetchBlogs"
        style="margin-top: 15px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 评论审核 -->
    <el-card shadow="never" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span style="font-weight: bold;">评论审核</span>
          <el-button size="small" @click="fetchComments" :loading="commentLoading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <!-- 评论审核分类栏 -->
      <div class="toolbar">
        <el-radio-group
          v-model="commentQuery.auditStatus"
          @change="handleCommentFilterChange"
        >
          <el-radio-button :value="0">待审核</el-radio-button>
          <el-radio-button :value="1">已通过</el-radio-button>
          <el-radio-button :value="2">已驳回</el-radio-button>
          <el-radio-button :value="3">人工复核</el-radio-button>
        </el-radio-group>
      </div>

      <el-table
        v-loading="commentLoading"
        :data="commentTableData"
        style="margin-top: 15px;"
      >
        <el-table-column prop="id" label="ID" width="120" show-overflow-tooltip />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="content" label="评论内容" min-width="200" show-overflow-tooltip />
        <el-table-column label="审核状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getAuditTagType(row.auditStatus)" size="small">
              {{ getAuditStatusText(row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核原因" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.auditReason || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="评论时间" width="180" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.auditStatus !== BlogAuditStatus.APPROVED"
              type="success"
              size="small"
              @click="handleApproveComment(row)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.auditStatus !== BlogAuditStatus.REJECTED"
              type="warning"
              size="small"
              @click="handleRejectComment(row)"
            >
              驳回
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="commentQuery.pageNo"
        v-model:page-size="commentQuery.pageSize"
        :total="commentTotal"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchComments"
        @current-change="fetchComments"
        style="margin-top: 15px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 博客详情对话框 -->
    <el-dialog
      v-model="blogDetailVisible"
      title="博客详情"
      width="750px"
    >
      <el-descriptions v-if="blogDetail" :column="2" border>
        <el-descriptions-item label="ID" :span="1">{{ blogDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="用户ID" :span="1">{{ blogDetail.userId }}</el-descriptions-item>
        <el-descriptions-item label="标题" :span="2">{{ blogDetail.title }}</el-descriptions-item>
        <el-descriptions-item label="类型">
          <el-tag :type="blogDetail.blogType === 1 ? 'success' : 'info'" size="small">
            {{ blogDetail.blogType === 1 ? '题解' : '博客' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <el-tag :type="getAuditTagType(blogDetail.auditStatus)" size="small">
            {{ getAuditStatusText(blogDetail.auditStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="浏览量">{{ blogDetail.viewCount }}</el-descriptions-item>
        <el-descriptions-item label="点赞数">{{ blogDetail.likeCount }}</el-descriptions-item>
        <el-descriptions-item label="标签" :span="2">
          <template v-if="blogDetail.tags && blogDetail.tags.length > 0">
            <el-tag v-for="tag in blogDetail.tags" :key="tag.id" size="small" style="margin-right: 4px;">
              {{ tag.name }}
            </el-tag>
          </template>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ blogDetail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ blogDetail.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="审核原因" :span="2">{{ blogDetail.auditReason || '-' }}</el-descriptions-item>
        <el-descriptions-item label="博客内容" :span="2">
          <div class="blog-content-preview">{{ blogDetail.content }}</div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="blogDetailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBlogPage, getBlogById, updateBlogAuditStatus, updateCommentAuditStatus, queryComments } from '@/api/blog'
import type { BlogVO, BlogQueryDTO, PageVO, CommentVO, CommentQueryDTO } from '@/types/api'
import { BlogAuditStatus } from '@/types/api'

// ==================== 审核状态工具 ====================
const getAuditStatusText = (status?: number) => {
  switch (status) {
    case BlogAuditStatus.PENDING: return '待审核'
    case BlogAuditStatus.APPROVED: return '已通过'
    case BlogAuditStatus.REJECTED: return '已驳回'
    case BlogAuditStatus.MANUAL_REVIEW: return '人工复核'
    default: return '未知'
  }
}

const getAuditTagType = (status?: number): 'success' | 'warning' | 'danger' | 'info' | undefined => {
  switch (status) {
    case BlogAuditStatus.PENDING: return 'info'
    case BlogAuditStatus.APPROVED: return 'success'
    case BlogAuditStatus.REJECTED: return 'danger'
    case BlogAuditStatus.MANUAL_REVIEW: return 'warning'
    default: return undefined
  }
}

const getPageList = <T,>(pageData: PageVO<T>) => {
  return pageData.list || pageData.records || []
}

// ==================== 博客审核 ====================
const blogLoading = ref(false)
const blogTableData = ref<BlogVO[]>([])
const blogTotal = ref(0)

const blogQuery = reactive<BlogQueryDTO>({
  pageNo: 1,
  pageSize: 10,
  title: undefined,
  auditStatus: BlogAuditStatus.PENDING
})

const fetchBlogs = async () => {
  blogLoading.value = true
  try {
    const res = await getBlogPage(blogQuery)
    const pageData = res.data as unknown as PageVO<BlogVO>
    blogTableData.value = getPageList(pageData)
    blogTotal.value = pageData.total || 0
  } catch (error) {
    console.error('获取博客审核列表失败:', error)
  } finally {
    blogLoading.value = false
  }
}

const handleBlogFilterChange = () => {
  blogQuery.pageNo = 1
  fetchBlogs()
}

const handleApproveBlog = async (row: BlogVO) => {
  try {
    await ElMessageBox.confirm(
      `确定要「通过」博客「${row.title}」的审核吗？`,
      '审核确认',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    await updateBlogAuditStatus(row.id, BlogAuditStatus.APPROVED, '管理员审核通过')
    ElMessage.success('审核通过')
    fetchBlogs()
  } catch (error: any) {
    if (error !== 'cancel') console.error('审核操作失败:', error)
  }
}

const handleRejectBlog = async (row: BlogVO) => {
  try {
    const { value: reason } = await ElMessageBox.prompt(
      `请输入驳回博客「${row.title}」的原因：`,
      '审核驳回',
      { confirmButtonText: '确定', cancelButtonText: '取消', inputType: 'text' }
    )
    if (reason !== undefined) {
      await updateBlogAuditStatus(row.id, BlogAuditStatus.REJECTED, reason || '管理员驳回')
      ElMessage.success('已驳回')
      fetchBlogs()
    }
  } catch (error: any) {
    if (error !== 'cancel') console.error('驳回操作失败:', error)
  }
}

// ==================== 博客详情 ====================
const blogDetailVisible = ref(false)
const blogDetail = ref<BlogVO | null>(null)

const handleViewBlogDetail = async (row: BlogVO) => {
  try {
    const res = await getBlogById(row.id)
    blogDetail.value = res.data as unknown as BlogVO
    blogDetailVisible.value = true
  } catch (error) {
    blogDetail.value = row
    blogDetailVisible.value = true
  }
}

// ==================== 评论审核 ====================
const commentLoading = ref(false)
const commentTableData = ref<CommentVO[]>([])
const commentTotal = ref(0)

const commentQuery = reactive<CommentQueryDTO & { pageNo: number; pageSize: number }>({
  pageNo: 1,
  pageSize: 10,
  auditStatus: BlogAuditStatus.PENDING
})

const fetchComments = async () => {
  commentLoading.value = true
  try {
    const res = await queryComments({
      auditStatus: commentQuery.auditStatus
    })
    // 全局评论查询返回数组，手动分页
    const allData = (res.data as unknown as CommentVO[]) || []
    const start = (commentQuery.pageNo - 1) * commentQuery.pageSize
    commentTableData.value = allData.slice(start, start + commentQuery.pageSize)
    commentTotal.value = allData.length
  } catch (error) {
    console.error('获取评论审核列表失败:', error)
  } finally {
    commentLoading.value = false
  }
}

const handleCommentFilterChange = () => {
  commentQuery.pageNo = 1
  fetchComments()
}

const handleApproveComment = async (row: CommentVO) => {
  try {
    await ElMessageBox.confirm(
      '确定要「通过」该评论的审核吗？',
      '审核确认',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    await updateCommentAuditStatus(row.id, BlogAuditStatus.APPROVED, '管理员审核通过')
    ElMessage.success('评论审核通过')
    fetchComments()
  } catch (error: any) {
    if (error !== 'cancel') console.error('审核操作失败:', error)
  }
}

const handleRejectComment = async (row: CommentVO) => {
  try {
    const { value: reason } = await ElMessageBox.prompt(
      '请输入驳回该评论的原因：',
      '审核驳回',
      { confirmButtonText: '确定', cancelButtonText: '取消', inputType: 'text' }
    )
    if (reason !== undefined) {
      await updateCommentAuditStatus(row.id, BlogAuditStatus.REJECTED, reason || '管理员驳回')
      ElMessage.success('评论已驳回')
      fetchComments()
    }
  } catch (error: any) {
    if (error !== 'cancel') console.error('驳回操作失败:', error)
  }
}

// ==================== 生命周期 ====================
onMounted(() => {
  fetchBlogs()
  fetchComments()
})
</script>

<style scoped>
.moderation-container {
  /* no extra padding needed, parent card handles it */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar {
  display: flex;
  align-items: center;
}

.blog-content-preview {
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
}
</style>

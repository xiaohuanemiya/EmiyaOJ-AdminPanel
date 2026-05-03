import request from '@/utils/request'
import type { 
  ResponseResult, 
  PageVO, 
  PageDTO,
  BlogQueryDTO,
  BlogVO, 
  BlogSaveDTO,
  BlogUpdateDTO,
  BlogTagVO,
  BlogTagSaveDTO,
  BlogPictureVO,
  CommentVO,
  CommentQueryDTO,
  CommentSaveDTO
} from '@/types/api'

// ==================== 博客相关接口 ====================

/**
 * 分页条件查询博客列表 (POST /blog/query)
 */
export function getBlogPage(data: BlogQueryDTO) {
  return request<ResponseResult<PageVO<BlogVO>>>({
    url: '/blog/query',
    method: 'post',
    data
  })
}

/**
 * 根据ID查询博客 (GET /blog/{bid})
 */
export function getBlogById(id: string | number) {
  return request<ResponseResult<BlogVO>>({
    url: `/blog/${id}`,
    method: 'get'
  })
}

/**
 * 新增博客 (POST /blog)
 */
export function addBlog(data: BlogSaveDTO) {
  return request<ResponseResult<null>>({
    url: '/blog',
    method: 'post',
    data
  })
}

/**
 * 修改博客 (PUT /blog/{bid})
 */
export function updateBlog(id: string | number, data: BlogUpdateDTO) {
  return request<ResponseResult<null>>({
    url: `/blog/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除博客 (DELETE /blog/{bid})
 */
export function deleteBlog(id: string | number) {
  return request<ResponseResult<null>>({
    url: `/blog/${id}`,
    method: 'delete'
  })
}

// ==================== 评论相关接口 ====================

/**
 * 分页查询博客评论 (POST /blog/{bid}/comments/query)
 */
export function getBlogComments(blogId: string | number, data: PageDTO) {
  return request<ResponseResult<PageVO<CommentVO>>>({
    url: `/blog/${blogId}/comments/query`,
    method: 'post',
    data
  })
}

/**
 * 发表评论 (POST /blog/{bid}/comments)
 */
export function addComment(blogId: string | number, data: CommentSaveDTO) {
  return request<ResponseResult<void>>({
    url: `/blog/${blogId}/comments`,
    method: 'post',
    data
  })
}

/**
 * 条件查询评论 (POST /blog/comments/query)
 */
export function queryComments(data: CommentQueryDTO) {
  return request<ResponseResult<CommentVO[]>>({
    url: '/blog/comments/query',
    method: 'post',
    data
  })
}

/**
 * 获取指定评论 (GET /blog/comments/{cid})
 */
export function getCommentById(cid: string | number) {
  return request<ResponseResult<CommentVO>>({
    url: `/blog/comments/${cid}`,
    method: 'get'
  })
}

/**
 * 删除评论 (DELETE /blog/comments/{cid})
 */
export function deleteComment(cid: string | number) {
  return request<ResponseResult<void>>({
    url: `/blog/comments/${cid}`,
    method: 'delete'
  })
}

// ==================== 图片相关接口 ====================

/**
 * 上传博客图片 (POST /blog/images)
 */
export function uploadBlogImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request<ResponseResult<BlogPictureVO>>({
    url: '/blog/images',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 删除博客图片 (DELETE /blog/images/{id})
 */
export function deleteBlogImage(id: string | number) {
  return request<ResponseResult<null>>({
    url: `/blog/images/${id}`,
    method: 'delete'
  })
}

// ==================== 标签相关接口 ====================

/**
 * 获取所有博客标签 (GET /blog/tags)
 */
export function getBlogTags() {
  return request<ResponseResult<BlogTagVO[]>>({
    url: '/blog/tags',
    method: 'get'
  })
}

/**
 * 获取博客标签详情 (GET /blog/tags/{tagId})
 */
export function getBlogTagById(tagId: string) {
  return request<ResponseResult<BlogTagVO>>({
    url: `/blog/tags/${tagId}`,
    method: 'get'
  })
}

/**
 * 新增博客标签 (POST /blog/tags)
 */
export function addBlogTag(data: BlogTagSaveDTO) {
  return request<ResponseResult<BlogTagVO>>({
    url: '/blog/tags',
    method: 'post',
    data
  })
}

/**
 * 修改博客标签 (PUT /blog/tags/{tagId})
 */
export function updateBlogTag(tagId: string, data: BlogTagSaveDTO) {
  return request<ResponseResult<BlogTagVO>>({
    url: `/blog/tags/${tagId}`,
    method: 'put',
    data
  })
}

/**
 * 删除博客标签 (DELETE /blog/tags/{tagId})
 */
export function deleteBlogTag(tagId: string) {
  return request<ResponseResult<void>>({
    url: `/blog/tags/${tagId}`,
    method: 'delete'
  })
}

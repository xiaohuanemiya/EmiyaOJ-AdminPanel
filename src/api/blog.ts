import request from '@/utils/request'
import type { 
  ResponseResult, 
  PageVO, 
  PageDTO,
  BlogQueryDTO,
  BlogVO, 
  BlogAddDTO,
  BlogUpdateDTO,
  BlogTagVO,
  BlogTagSaveDTO,
  CommentVO,
  CommentQueryDTO,
  CommentSaveDTO,
  UserBlogVO
} from '@/types/api'

// ==================== 博客相关接口 ====================

/**
 * 查询所有博客 (GET /blog)
 */
export function getAllBlogs() {
  return request<ResponseResult<BlogVO[]>>({
    url: '/blog',
    method: 'get'
  })
}

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
export function addBlog(data: BlogAddDTO) {
  return request<ResponseResult<void>>({
    url: '/blog',
    method: 'post',
    data
  })
}

/**
 * 修改博客 (PUT /blog/{bid}) - 注意：修改博客不支持更新标签
 */
export function updateBlog(id: string | number, data: BlogUpdateDTO) {
  return request<ResponseResult<void>>({
    url: `/blog/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除博客 (DELETE /blog/{bid})
 */
export function deleteBlog(id: string | number) {
  return request<ResponseResult<void>>({
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

// ==================== 收藏相关接口 ====================

/**
 * 收藏博客 (POST /blog/{bid}/star)
 */
export function starBlog(blogId: string | number) {
  return request<ResponseResult<void>>({
    url: `/blog/${blogId}/star`,
    method: 'post'
  })
}

/**
 * 取消收藏博客 (DELETE /blog/{bid}/star)
 */
export function unstarBlog(blogId: string | number) {
  return request<ResponseResult<void>>({
    url: `/blog/${blogId}/star`,
    method: 'delete'
  })
}

// ==================== 用户博客相关接口 ====================

/**
 * 查询用户博客信息 (GET /blog/user/{uid})
 */
export function getUserBlogInfo(uid: string | number) {
  return request<ResponseResult<UserBlogVO>>({
    url: `/blog/user/${uid}`,
    method: 'get'
  })
}

/**
 * 分页查询用户发表的博客 (POST /blog/user/{uid}/blogs/query)
 */
export function getUserBlogs(uid: string | number, data: PageDTO) {
  return request<ResponseResult<PageVO<BlogVO>>>({
    url: `/blog/user/${uid}/blogs/query`,
    method: 'post',
    data
  })
}

/**
 * 分页查询用户收藏的博客 (POST /blog/user/{uid}/stars/query)
 */
export function getUserStarredBlogs(uid: string | number, data: PageDTO) {
  return request<ResponseResult<PageVO<BlogVO>>>({
    url: `/blog/user/${uid}/stars/query`,
    method: 'post',
    data
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

import request from '@/utils/request'
import type { 
  ResponseResult, 
  PageVO, 
  BlogQueryDTO,
  BlogVO, 
  BlogSaveDTO 
} from '@/types/api'

/**
 * 分页查询博客列表
 */
export function getBlogPage(params: BlogQueryDTO) {
  return request<ResponseResult<PageVO<BlogVO>>>({
    url: '/blog/page',
    method: 'get',
    params
  })
}

/**
 * 根据ID查询博客
 */
export function getBlogById(id: number) {
  return request<ResponseResult<BlogVO>>({
    url: `/blog/${id}`,
    method: 'get'
  })
}

/**
 * 新增博客
 */
export function addBlog(data: BlogSaveDTO) {
  return request<ResponseResult<void>>({
    url: '/blog',
    method: 'post',
    data
  })
}

/**
 * 修改博客
 */
export function updateBlog(data: BlogSaveDTO) {
  return request<ResponseResult<void>>({
    url: '/blog',
    method: 'put',
    data
  })
}

/**
 * 删除博客
 */
export function deleteBlog(id: number) {
  return request<ResponseResult<void>>({
    url: `/blog/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除博客
 */
export function batchDeleteBlogs(ids: number[]) {
  return request<ResponseResult<void>>({
    url: '/blog/batch',
    method: 'delete',
    data: ids
  })
}

/**
 * 修改博客状态
 */
export function updateBlogStatus(id: number, status: number) {
  return request<ResponseResult<void>>({
    url: `/blog/${id}/status`,
    method: 'put',
    params: { status }
  })
}

/**
 * 修改博客置顶状态
 */
export function updateBlogTop(id: number, isTop: number) {
  return request<ResponseResult<void>>({
    url: `/blog/${id}/top`,
    method: 'put',
    params: { isTop }
  })
}

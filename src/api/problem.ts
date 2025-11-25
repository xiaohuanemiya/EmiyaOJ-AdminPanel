import request from '@/utils/request'
import type { 
  ResponseResult, 
  PageVO, 
  ProblemQueryDTO,
  ProblemVO, 
  ProblemSaveDTO 
} from '@/types/api'

/**
 * 分页查询题目列表
 */
export function getProblemPage(params: ProblemQueryDTO) {
  return request<ResponseResult<PageVO<ProblemVO>>>({
    url: '/problem/page',
    method: 'get',
    params
  })
}

/**
 * 根据ID查询题目
 */
export function getProblemById(id: number) {
  return request<ResponseResult<ProblemVO>>({
    url: `/problem/${id}`,
    method: 'get'
  })
}

/**
 * 新增题目
 */
export function addProblem(data: ProblemSaveDTO) {
  return request<ResponseResult<void>>({
    url: '/problem',
    method: 'post',
    data
  })
}

/**
 * 修改题目
 */
export function updateProblem(data: ProblemSaveDTO) {
  return request<ResponseResult<void>>({
    url: '/problem',
    method: 'put',
    data
  })
}

/**
 * 删除题目
 */
export function deleteProblem(id: number) {
  return request<ResponseResult<void>>({
    url: `/problem/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除题目
 */
export function batchDeleteProblems(ids: number[]) {
  return request<ResponseResult<void>>({
    url: '/problem/batch',
    method: 'delete',
    data: ids
  })
}

/**
 * 修改题目状态
 */
export function updateProblemStatus(id: number, status: number) {
  return request<ResponseResult<void>>({
    url: `/problem/${id}/status`,
    method: 'put',
    params: { status }
  })
}

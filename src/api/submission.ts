import request from '@/utils/request'
import type {
  ResponseResult,
  PageVO,
  SubmissionQueryDTO,
  SubmissionVO,
  SubmissionDetailVO
} from '@/types/api'

/**
 * 分页查询提交记录 (GET /submission/page)
 */
export function getSubmissionPage(params: SubmissionQueryDTO) {
  return request<ResponseResult<PageVO<SubmissionVO>>>({
    url: '/submission/page',
    method: 'get',
    params
  })
}

/**
 * 查询提交详情 (GET /submission/{id})
 */
export function getSubmissionById(id: number) {
  return request<ResponseResult<SubmissionDetailVO>>({
    url: `/submission/${id}`,
    method: 'get'
  })
}

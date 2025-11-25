import request from '@/utils/request'
import type { 
  ResponseResult, 
  TestCaseVO, 
  TestCaseSaveDTO 
} from '@/types/api'

/**
 * 根据题目ID获取测试用例列表
 */
export function getTestCasesByProblemId(problemId: number) {
  return request<ResponseResult<TestCaseVO[]>>({
    url: `/testcase/problem/${problemId}`,
    method: 'get'
  })
}

/**
 * 根据ID获取测试用例详情
 */
export function getTestCaseById(id: number) {
  return request<ResponseResult<TestCaseVO>>({
    url: `/testcase/${id}`,
    method: 'get'
  })
}

/**
 * 新增测试用例
 */
export function addTestCase(data: TestCaseSaveDTO) {
  return request<ResponseResult<void>>({
    url: '/testcase',
    method: 'post',
    data
  })
}

/**
 * 修改测试用例
 */
export function updateTestCase(data: TestCaseSaveDTO) {
  return request<ResponseResult<void>>({
    url: '/testcase',
    method: 'put',
    data
  })
}

/**
 * 删除测试用例
 */
export function deleteTestCase(id: number) {
  return request<ResponseResult<void>>({
    url: `/testcase/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除测试用例
 */
export function batchDeleteTestCases(ids: number[]) {
  return request<ResponseResult<void>>({
    url: '/testcase/batch',
    method: 'delete',
    data: ids
  })
}

/**
 * 根据题目ID删除所有测试用例
 */
export function deleteTestCasesByProblemId(problemId: number) {
  return request<ResponseResult<void>>({
    url: `/testcase/problem/${problemId}`,
    method: 'delete'
  })
}

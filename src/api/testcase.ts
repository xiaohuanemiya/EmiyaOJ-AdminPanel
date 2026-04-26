import request from '@/utils/request'
import type { 
  ResponseResult, 
  TestCaseVO, 
  TestCaseSaveDTO 
} from '@/types/api'

/**
 * 根据题目ID获取测试用例列表 (GET /test-case/problem/{problemId})
 */
export function getTestCasesByProblemId(problemId: number) {
  return request<ResponseResult<TestCaseVO[]>>({
    url: `/test-case/problem/${problemId}`,
    method: 'get'
  })
}

/**
 * 根据ID获取测试用例详情 (GET /test-case/{id})
 */
export function getTestCaseById(id: number) {
  return request<ResponseResult<TestCaseVO>>({
    url: `/test-case/${id}`,
    method: 'get'
  })
}

/**
 * 新增测试用例 (POST /test-case)
 */
export function addTestCase(data: TestCaseSaveDTO) {
  return request<ResponseResult<TestCaseVO>>({
    url: '/test-case',
    method: 'post',
    data
  })
}

/**
 * 批量新增测试用例 (POST /test-case/batch/{problemId})
 */
export function batchAddTestCases(problemId: number, data: Omit<TestCaseSaveDTO, 'problemId'>[]) {
  return request<ResponseResult<TestCaseVO[]>>({
    url: `/test-case/batch/${problemId}`,
    method: 'post',
    data
  })
}

/**
 * 修改测试用例 (PUT /test-case)
 */
export function updateTestCase(data: TestCaseSaveDTO) {
  return request<ResponseResult<void>>({
    url: '/test-case',
    method: 'put',
    data
  })
}

/**
 * 删除测试用例 (DELETE /test-case/{id})
 */
export function deleteTestCase(id: number) {
  return request<ResponseResult<void>>({
    url: `/test-case/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除测试用例 (DELETE /test-case/batch)
 */
export function batchDeleteTestCases(ids: number[]) {
  return request<ResponseResult<void>>({
    url: '/test-case/batch',
    method: 'delete',
    data: ids
  })
}

/**
 * 根据题目ID删除所有测试用例 (DELETE /test-case/problem/{problemId})
 */
export function deleteTestCasesByProblemId(problemId: number) {
  return request<ResponseResult<void>>({
    url: `/test-case/problem/${problemId}`,
    method: 'delete'
  })
}

import request from '@/utils/request'
import type {
  ResponseResult,
  TestCaseGeneratorSpecSaveDTO,
  TestCaseGeneratorUpdateDTO,
  RunTestCaseGeneratorDTO,
  TestCaseGeneratorSpecVO,
  TestCaseGeneratorVO,
  RunTestCaseGeneratorVO
} from '@/types/api'

/**
 * 创建测试数据生成器描述 (POST /test-case-generator/{problemId}/spec)
 */
export function createTestCaseGeneratorSpec(problemId: number, data: TestCaseGeneratorSpecSaveDTO) {
  return request<ResponseResult<TestCaseGeneratorSpecVO>>({
    url: `/test-case-generator/${problemId}/spec`,
    method: 'post',
    data
  })
}

/**
 * 更新测试数据生成器描述 (PUT /test-case-generator/{problemId}/spec)
 */
export function updateTestCaseGeneratorSpec(problemId: number, data: TestCaseGeneratorSpecSaveDTO) {
  return request<ResponseResult<TestCaseGeneratorSpecVO>>({
    url: `/test-case-generator/${problemId}/spec`,
    method: 'put',
    data
  })
}

/**
 * 查询测试数据生成器描述 (GET /test-case-generator/{problemId}/spec)
 */
export function getTestCaseGeneratorSpec(problemId: number) {
  return request<ResponseResult<TestCaseGeneratorSpecVO>>({
    url: `/test-case-generator/${problemId}/spec`,
    method: 'get'
  })
}

/**
 * 查询完整测试数据生成器 (GET /test-case-generator/{problemId})
 */
export function getTestCaseGenerator(problemId: number) {
  return request<ResponseResult<TestCaseGeneratorVO>>({
    url: `/test-case-generator/${problemId}`,
    method: 'get'
  })
}

/**
 * 更新 Python 测试数据生成器脚本 (PUT /test-case-generator/{problemId})
 */
export function updateTestCaseGenerator(problemId: number, data: TestCaseGeneratorUpdateDTO) {
  return request<ResponseResult<TestCaseGeneratorVO>>({
    url: `/test-case-generator/${problemId}`,
    method: 'put',
    data
  })
}

/**
 * 运行 Python 生成器并保存测试用例 (POST /test-case-generator/{problemId}/run)
 */
export function runTestCaseGenerator(problemId: number, data: RunTestCaseGeneratorDTO) {
  return request<ResponseResult<RunTestCaseGeneratorVO>>({
    url: `/test-case-generator/${problemId}/run`,
    method: 'post',
    data
  })
}

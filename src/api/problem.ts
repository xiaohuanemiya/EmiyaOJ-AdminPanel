import request from '@/utils/request'
import type { 
  ResponseResult, 
  PageVO, 
  ProblemQueryDTO,
  ProblemPictureVO,
  ProblemVO, 
  ProblemSaveDTO 
} from '@/types/api'

/**
 * 分页查询题目列表 (GET /problem/list)
 */
export function getProblemPage(params: ProblemQueryDTO) {
  return request<ResponseResult<PageVO<ProblemVO>>>({
    url: '/problem/list',
    method: 'get',
    params
  })
}

/**
 * 根据ID查询题目详情 (GET /problem/{id})
 */
export function getProblemById(id: number) {
  return request<ResponseResult<ProblemVO>>({
    url: `/problem/${id}`,
    method: 'get'
  })
}

/**
 * 新增题目 (POST /problem)
 */
export function addProblem(data: ProblemSaveDTO) {
  return request<ResponseResult<boolean>>({
    url: '/problem',
    method: 'post',
    data
  })
}

/**
 * 修改题目 (PUT /problem)
 */
export function updateProblem(data: ProblemSaveDTO) {
  return request<ResponseResult<boolean>>({
    url: '/problem',
    method: 'put',
    data
  })
}

/**
 * 删除题目 (DELETE /problem/{id})
 */
export function deleteProblem(id: number) {
  return request<ResponseResult<boolean>>({
    url: `/problem/${id}`,
    method: 'delete'
  })
}

/**
 * 上传题目图片 (POST /problem/images)
 */
export function uploadProblemImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request<ResponseResult<ProblemPictureVO>>({
    url: '/problem/images',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 下载题目图片 (GET /problem/images/{id}/download)
 */
export function downloadProblemImage(id: string) {
  return request<Blob>({
    url: `/problem/images/${id}/download`,
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 删除题目图片 (DELETE /problem/images/{id})
 */
export function deleteProblemImage(id: string) {
  return request<ResponseResult<null>>({
    url: `/problem/images/${id}`,
    method: 'delete'
  })
}

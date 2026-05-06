import request from '@/utils/request'
import type {
  PageVO,
  ProblemSetProblemDTO,
  ProblemSetQueryDTO,
  ProblemSetSaveDTO,
  ProblemSetVO,
  ResponseResult
} from '@/types/api'

export function getProblemSetPage(params: ProblemSetQueryDTO): Promise<ResponseResult<PageVO<ProblemSetVO>>> {
  return request({
    url: '/problem-set/list',
    method: 'get',
    params
  }) as unknown as Promise<ResponseResult<PageVO<ProblemSetVO>>>
}

export function getProblemSetById(id: number): Promise<ResponseResult<ProblemSetVO>> {
  return request({
    url: `/problem-set/${id}`,
    method: 'get'
  }) as unknown as Promise<ResponseResult<ProblemSetVO>>
}

export function addProblemSet(data: ProblemSetSaveDTO): Promise<ResponseResult<ProblemSetVO>> {
  return request({
    url: '/problem-set',
    method: 'post',
    data
  }) as unknown as Promise<ResponseResult<ProblemSetVO>>
}

export function updateProblemSet(data: ProblemSetSaveDTO): Promise<ResponseResult<boolean>> {
  return request({
    url: '/problem-set',
    method: 'put',
    data
  }) as unknown as Promise<ResponseResult<boolean>>
}

export function deleteProblemSet(id: number): Promise<ResponseResult<boolean>> {
  return request({
    url: `/problem-set/${id}`,
    method: 'delete'
  }) as unknown as Promise<ResponseResult<boolean>>
}

export function replaceProblemSetProblems(id: number, data: ProblemSetProblemDTO[]): Promise<ResponseResult<boolean>> {
  return request({
    url: `/problem-set/${id}/problems`,
    method: 'put',
    data
  }) as unknown as Promise<ResponseResult<boolean>>
}

export function saveProblemSetProblems(id: number, data: ProblemSetProblemDTO[]): Promise<ResponseResult<boolean>> {
  return request({
    url: `/problem-set/${id}/problems`,
    method: 'post',
    data
  }) as unknown as Promise<ResponseResult<boolean>>
}

export function deleteProblemSetProblem(id: number, problemId: number): Promise<ResponseResult<boolean>> {
  return request({
    url: `/problem-set/${id}/problems/${problemId}`,
    method: 'delete'
  }) as unknown as Promise<ResponseResult<boolean>>
}

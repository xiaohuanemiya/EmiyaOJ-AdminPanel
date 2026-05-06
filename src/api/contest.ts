import request from '@/utils/request'
import type {
  ContestProblemDTO,
  ContestQueryDTO,
  ContestRegistrationVO,
  ContestSaveDTO,
  ContestVO,
  PageVO,
  ResponseResult,
  UserVO
} from '@/types/api'

export function getContestPage(params: ContestQueryDTO): Promise<ResponseResult<PageVO<ContestVO>>> {
  return request({
    url: '/contest/list',
    method: 'get',
    params
  }) as unknown as Promise<ResponseResult<PageVO<ContestVO>>>
}

export function getContestById(id: number): Promise<ResponseResult<ContestVO>> {
  return request({
    url: `/contest/${id}`,
    method: 'get'
  }) as unknown as Promise<ResponseResult<ContestVO>>
}

export function addContest(data: ContestSaveDTO): Promise<ResponseResult<ContestVO>> {
  return request({
    url: '/contest',
    method: 'post',
    data
  }) as unknown as Promise<ResponseResult<ContestVO>>
}

export function updateContest(data: ContestSaveDTO): Promise<ResponseResult<boolean>> {
  return request({
    url: '/contest',
    method: 'put',
    data
  }) as unknown as Promise<ResponseResult<boolean>>
}

export function deleteContest(id: number): Promise<ResponseResult<boolean>> {
  return request({
    url: `/contest/${id}`,
    method: 'delete'
  }) as unknown as Promise<ResponseResult<boolean>>
}

export function replaceContestProblems(id: number, data: ContestProblemDTO[]): Promise<ResponseResult<boolean>> {
  return request({
    url: `/contest/${id}/problems`,
    method: 'put',
    data
  }) as unknown as Promise<ResponseResult<boolean>>
}

export function getContestAdminCandidates(): Promise<ResponseResult<UserVO[]>> {
  return request({
    url: '/contest/admin-candidates',
    method: 'get'
  }) as unknown as Promise<ResponseResult<UserVO[]>>
}

export function replaceContestAdmins(id: number, userIds: number[]): Promise<ResponseResult<boolean>> {
  return request({
    url: `/contest/${id}/admins`,
    method: 'put',
    data: { userIds }
  }) as unknown as Promise<ResponseResult<boolean>>
}

export function getContestRegistrations(id: number): Promise<ResponseResult<ContestRegistrationVO[]>> {
  return request({
    url: `/contest/${id}/registrations`,
    method: 'get'
  }) as unknown as Promise<ResponseResult<ContestRegistrationVO[]>>
}

export function deleteContestRegistration(id: number, userId: number): Promise<ResponseResult<boolean>> {
  return request({
    url: `/contest/${id}/registrations/${userId}`,
    method: 'delete'
  }) as unknown as Promise<ResponseResult<boolean>>
}

// ========== 通用类型 ==========

export interface ResponseResult<T = any> {
  code: number;
  msg: string;
  data: T;
}

export interface PageDTO {
  pageNo: number;
  pageSize: number;
  sortBy?: string;
  isAsc?: boolean;
}

export interface PageVO<T> {
  total: number;
  pages: number;
  list: T[];
}

export interface Page<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

// ========== 用户相关 ==========

export interface UserLoginDTO {
  username: string;
  password: string;
}

export interface UserLoginVO {
  id: string;
  username: string;
  name: string;
  token: string;
}

export interface UserPageDTO extends PageDTO {
  // 可扩展查询条件
}

export interface UserSaveDTO {
  id?: string;
  username: string;
  password?: string;
  nickname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: number;
}

export interface UserVO {
  id: string;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  avatar: string;
  status: number;
  statusDesc: string;
  createTime: string;
  updateTime: string;
}

// ========== 角色相关 ==========

export interface RoleQueryDTO {
  roleCode?: string;
  roleName?: string;
  status?: number;
  createTimeStart?: string;
  createTimeEnd?: string;
  pageNum?: number;
  pageSize?: number;
}

export interface RoleSaveDTO {
  id?: string;
  roleCode: string;
  roleName: string;
  description?: string;
  status?: number;
  permissionIds?: string[];
}

export interface RoleVO {
  id: string;
  roleCode: string;
  roleName: string;
  description: string;
  status: number;
  statusDesc: string;
  createTime: string;
  updateTime: string;
}

// ========== 权限相关 ==========

export interface PermissionQueryDTO {
  permissionCode?: string;
  permissionName?: string;
  permissionType?: number;
  status?: number;
  parentId?: string;
}

export interface PermissionSaveDTO {
  id?: string;
  parentId?: string;
  permissionCode: string;
  permissionName: string;
  permissionType: number;
  path?: string;
  component?: string;
  icon?: string;
  sortOrder?: number;
  status?: number;
}

export interface PermissionVO {
  id: string;
  parentId: string;
  permissionCode: string;
  permissionName: string;
  permissionType: number;
  permissionTypeDesc: string;
  path: string;
  component: string;
  icon: string;
  sortOrder: number;
  status: number;
  statusDesc: string;
  createTime: string;
  updateTime: string;
  children?: PermissionVO[];
}

// ========== 语言相关 ==========

export interface LanguageVO {
  id: number;
  name: string;
  version: string;
  compileCommand: string;
  executeCommand: string;
  sourceFileExt: string;
  executableExt: string;
  isCompiled: number;
  timeLimitMultiplier: number;
  memoryLimitMultiplier: number;
  status: number;
  createTime: string;
  updateTime: string;
}

// ========== 题目相关 ==========

export interface ProblemQueryDTO extends PageDTO {
  difficulty?: number;
  status?: number;
  keyword?: string;
}

export interface ProblemSaveDTO {
  id?: number;
  title: string;
  description: string;
  inputDescription?: string;
  outputDescription?: string;
  sampleInput?: string;
  sampleOutput?: string;
  hint?: string;
  difficulty?: number;
  timeLimit: number;
  memoryLimit: number;
  stackLimit?: number;
  source?: string;
  status?: number;
}

export interface ProblemVO {
  id: number;
  title: string;
  description: string;
  inputDescription: string;
  outputDescription: string;
  sampleInput: string;
  sampleOutput: string;
  hint: string;
  difficulty: number;
  timeLimit: number;
  memoryLimit: number;
  stackLimit: number;
  source: string;
  status: number;
  acceptCount: number;
  submitCount: number;
  createTime: string;
  updateTime: string;
}

// ========== 测试用例相关 ==========

export interface TestCaseSaveDTO {
  id?: number;
  problemId: number;
  input: string;
  output: string;
  isSample?: number;
  score?: number;
  sortOrder?: number;
}

export interface TestCaseVO {
  id: number;
  problemId: number;
  input: string;
  output: string;
  isSample: number;
  score: number;
  sortOrder: number;
  createTime: string;
}

// ========== 枚举类型 ==========

export enum UserStatus {
  DISABLED = 0,
  ENABLED = 1
}

export enum RoleStatus {
  DISABLED = 0,
  ENABLED = 1
}

export enum PermissionType {
  MENU = 1,
  BUTTON = 2,
  API = 3
}

export enum PermissionStatus {
  DISABLED = 0,
  ENABLED = 1
}

export enum ProblemDifficulty {
  EASY = 1,
  MEDIUM = 2,
  HARD = 3
}

export enum ProblemStatus {
  HIDDEN = 0,
  PUBLIC = 1
}

export enum LanguageStatus {
  DISABLED = 0,
  ENABLED = 1
}

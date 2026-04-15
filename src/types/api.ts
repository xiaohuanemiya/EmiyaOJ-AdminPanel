// ========== 通用类型 ==========

export interface ResponseResult<T = any> {
  code: number;
  message: string;
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
  list: T[];
  pageNum?: number;
  pageSize?: number;
}

// ========== 用户相关 ==========

export interface UserLoginDTO {
  username: string;
  password: string;
}

export interface UserLoginVO {
  id: string;
  username: string;
  nickname: string;
  token: string;
}

export interface UserPageDTO {
  pageNum?: number;
  pageSize?: number;
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
  roleIds?: number[];
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
  roles?: RoleVO[];
  permissions?: PermissionVO[];
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
  permissions?: PermissionVO[];
}

// ========== 权限相关 ==========

export interface PermissionQueryDTO {
  permissionCode?: string;
  permissionName?: string;
  permissionType?: number;
  status?: number;
  parentId?: number;
}

export interface PermissionSaveDTO {
  id?: string;
  parentId?: number;
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
}

// ========== 题目相关 ==========

export interface ProblemQueryDTO {
  pageNum?: number;
  pageSize?: number;
  title?: string;
  difficulty?: number;
  tagId?: number;
  status?: number;
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
  tagIds?: number[];
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
  difficultyDesc: string;
  timeLimit: number;
  memoryLimit: number;
  stackLimit: number;
  source: string;
  authorId: number;
  acceptCount: number;
  submitCount: number;
  status: number;
  createTime: string;
  updateTime: string;
  tags: string[];
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

// ========== 博客相关 ==========

export interface BlogQueryDTO {
  title?: string;
  createTime?: string;
  pageNo: number;
  pageSize: number;
}

export interface BlogAddDTO {
  title: string;
  content: string;
  tagIds: number[];
}

export interface BlogUpdateDTO {
  title: string;
  content: string;
}

export interface BlogVO {
  id: string;
  userId: string;
  title: string;
  content: string;
  createTime: string;
  updateTime: string;
  tags?: BlogTagVO[];
}

export interface BlogTagVO {
  id: string;
  name: string;
  desc: string;
}

export interface UserBlogVO {
  userId: string;
  username: string;
  nickname: string;
  blogCount: number;
  starCount: number;
}

// ========== 评论相关 ==========

export interface CommentQueryDTO {
  blogId?: number;
  fromDay?: string;
  toDay?: string;
}

export interface CommentSaveDTO {
  content: string;
}

export interface CommentVO {
  id: string;
  userId: string;
  username: string;
  nickname: string;
  content: string;
  createTime: string;
  updateTime: string;
}

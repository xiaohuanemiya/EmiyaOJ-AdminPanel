// ========== 通用类型 ==========

export interface ResponseResult<T = any> {
  code: number;
  message: string;
  msg?: string;
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
  records?: T[];
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

export interface LanguageSaveDTO {
  id?: number;
  name: string;
  version: string;
  languageVersion: string;
  compileFileName?: string;
  sourceFileExt: string;
  executableFileName?: string;
  compiledFileNames?: string | null;
  compileCommand?: string | null;
  runCommand: string;
  envVars?: string | null;
  isCompiled?: number;
  timeLimitMultiplier?: number;
  memoryLimitMultiplier?: number;
  compileTimeLimit?: number;
  compileMemoryLimit?: number;
  compileProcLimit?: number;
  runProcLimit?: number;
  status?: number;
}

export interface LanguageVO {
  id: number;
  name: string;
  version: string;
  languageVersion: string;
  compileFileName: string;
  sourceFileExt: string;
  executableFileName: string;
  compiledFileNames: string | null;
  compileCommand: string | null;
  runCommand: string;
  envVars: string | null;
  isCompiled: number;
  timeLimitMultiplier: number;
  memoryLimitMultiplier: number;
  compileTimeLimit: number;
  compileMemoryLimit: number;
  compileProcLimit: number;
  runProcLimit: number;
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

// ========== 判题提交相关 ==========

/** 判题状态枚举 */
export enum SubmissionStatus {
  PENDING = 0,
  JUDGING = 1,
  AC = 2,
  CE = 3,
  SE = 4,
  WA = 5,
  TLE = 6,
  MLE = 7,
  RE = 8,
  OLE = 9,
  PA = 10
}

export interface SubmissionQueryDTO {
  pageNum?: number
  pageSize?: number
  problemId?: number
  userId?: number
}

export interface SubmissionVO {
  id: number
  problemId: number
  userId: number
  languageId: number
  status: SubmissionStatus
  passedCaseCount: number
  totalCaseCount: number
  score: number
  maxTimeUsed: number
  maxMemoryUsed: number
  errorMessage: string
  compileMessage: string
  createTime: string
  finishTime: string
}

export interface SubmissionCaseResultVO {
  id: number
  submissionId: number
  testCaseId: number
  caseOrder: number
  status: SubmissionStatus
  score: number
  timeUsed: number
  memoryUsed: number
  errorMessage: string
  createTime: string
}

export interface SubmissionDetailVO extends SubmissionVO {
  caseResults: SubmissionCaseResultVO[]
}

// ========== 博客相关 ==========

export interface BlogQueryDTO {
  title?: string;
  blogType?: number;
  problemId?: number;
  tagId?: number;
  sortBy?: string;
  createTime?: string;
  pageNo: number;
  pageSize: number;
}

export interface BlogSaveDTO {
  title: string;
  content: string;
  blogType?: number;
  problemId?: number;
  tagIds?: number[];
  pictureIds?: number[];
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
  blogType: number;
  problemId?: string;
  problemTitle?: string;
  viewCount: number;
  likeCount: number;
  liked?: boolean;
  createTime: string;
  updateTime: string;
  tags?: BlogTagVO[];
  pictures?: BlogPictureVO[];
}

export interface BlogPictureVO {
  id: string;
  blogId?: string;
  url: string;
  contentType: string;
  size: number;
  originalFilename: string;
  createTime: string;
}

export interface BlogTagVO {
  id: string;
  name: string;
  desc: string;
}

export interface BlogTagSaveDTO {
  name: string;
  desc: string;
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

// ========== 竞赛相关 ==========

export enum ContestRuleType {
  ACM = 1,
  IOI = 2,
  CODEFORCES = 3
}

export enum ContestStatus {
  DRAFT = 0,
  PUBLISHED = 1,
  CANCELLED = 2
}

export interface ContestQueryDTO {
  pageNum?: number;
  pageSize?: number;
  title?: string;
  ruleType?: number;
  status?: number;
  startFrom?: string;
  startTo?: string;
}

export interface ContestProblemDTO {
  problemId: number;
  label: string;
  sortOrder: number;
  score: number;
}

export interface ContestSaveDTO {
  id?: number;
  title: string;
  description?: string;
  ruleType: number;
  startTime: string;
  endTime: string;
  freezeBeforeMinutes?: number;
  inviteCode?: string;
  status: number;
  problems?: ContestProblemDTO[];
}

export interface ContestProblemVO extends ContestProblemDTO {
  id?: number;
  contestId?: number;
  title?: string;
  problemTitle?: string;
}

export interface ContestVO {
  id: number;
  title: string;
  description?: string;
  ruleType: number;
  startTime: string;
  endTime: string;
  freezeBeforeMinutes?: number;
  inviteCode?: string;
  status: number;
  creatorId?: number;
  problemCount?: number;
  problems?: ContestProblemVO[];
  createTime?: string;
  updateTime?: string;
}

export interface ContestRegistrationVO {
  id?: number;
  contestId?: number;
  userId: number;
  username?: string;
  nickname?: string;
  registerTime?: string;
  createTime?: string;
}

// ========== 题单相关 ==========

export enum ProblemSetStatus {
  HIDDEN = 0,
  PUBLIC = 1
}

export interface ProblemSetQueryDTO {
  pageNum?: number;
  pageSize?: number;
  title?: string;
  status?: number;
  creatorId?: number;
}

export interface ProblemSetProblemDTO {
  problemId: number;
  sortOrder: number;
  note?: string;
}

export interface ProblemSetSaveDTO {
  id?: number;
  title: string;
  description?: string;
  status: number;
  problems?: ProblemSetProblemDTO[];
}

export interface ProblemSetProblemVO extends ProblemSetProblemDTO {
  id?: number;
  problemSetId?: number;
  title?: string;
  problemTitle?: string;
}

export interface ProblemSetVO {
  id: number;
  title: string;
  description?: string;
  creatorId: number;
  status: number;
  problemCount?: number;
  problems?: ProblemSetProblemVO[];
  createTime?: string;
  updateTime?: string;
}

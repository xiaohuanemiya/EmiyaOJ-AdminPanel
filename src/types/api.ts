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

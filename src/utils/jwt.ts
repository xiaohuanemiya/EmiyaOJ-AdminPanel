import { jwtDecode } from 'jwt-decode'

/**
 * JWT载荷接口
 */
interface JwtPayload {
  userLogin: string // JSON字符串
  exp: number
}

/**
 * 用户登录信息接口
 */
interface UserLoginInfo {
  accountNonExpired: boolean
  accountNonLocked: boolean
  credentialsNonExpired: boolean
  enabled: boolean
  password: string
  permissions: string[]
  user: {
    createTime: string
    deleted: number
    id: number
    nickname: string
    password: string
    status: number
    updateTime: string
    username: string
  }
  username: string
}

/**
 * 解析JWT token
 * @param token JWT token
 * @returns 解析后的用户信息
 */
export function parseJwtToken(token: string): UserLoginInfo | null {
  try {
    // 解码JWT
    const decoded = jwtDecode<JwtPayload>(token)
    
    // 解析userLogin字段（它是一个JSON字符串）
    const userLoginStr = decoded.userLogin
    const userLogin: UserLoginInfo = JSON.parse(userLoginStr)
    
    return userLogin
  } catch (error) {
    console.error('JWT解析失败:', error)
    return null
  }
}

/**
 * 从JWT获取权限列表
 * @param token JWT token
 * @returns 权限列表
 */
export function getPermissionsFromToken(token: string): string[] {
  const userLogin = parseJwtToken(token)
  return userLogin?.permissions || []
}

/**
 * 从JWT获取用户信息
 * @param token JWT token
 * @returns 用户信息
 */
export function getUserInfoFromToken(token: string) {
  const userLogin = parseJwtToken(token)
  return userLogin?.user || null
}

/**
 * 检查token是否过期
 * @param token JWT token
 * @returns 是否过期
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    const currentTime = Date.now() / 1000
    return decoded.exp < currentTime
  } catch {
    return true
  }
}

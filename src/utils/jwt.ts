import { jwtDecode } from 'jwt-decode'

/**
 * JWT载荷接口 —— 直接从token中解析
 */
interface JwtPayload {
  permissions: string[]
  userId: number
  username: string
  iat: number
  exp: number
  enabled?: boolean
  accountNonExpired?: boolean
  accountNonLocked?: boolean
  user?: any
}

/**
 * 解析JWT token
 * @param token JWT token
 * @returns 解析后的JWT载荷
 */
export function parseJwtToken(token: string): JwtPayload | null {
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    return decoded
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
  const payload = parseJwtToken(token)
  return payload?.permissions || []
}

/**
 * 从JWT获取用户信息
 * @param token JWT token
 * @returns 用户基本信息 { userId, username }
 */
export function getUserInfoFromToken(token: string) {
  const payload = parseJwtToken(token)
  if (!payload) return null
  return {
    userId: payload.userId,
    username: payload.username
  }
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

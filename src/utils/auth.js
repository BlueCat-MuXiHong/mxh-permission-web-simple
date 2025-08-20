const TokenKey = 'token'

//定义token过期的key
const timeKey = 'expireTime'


/**
 * 清空sessionStorage
 */
export function clearStorage() {
  return sessionStorage.clear();
}

/**
 * 获取token
 * @returns {*}
 */
export function getToken() {
  return localStorage.getItem(TokenKey)
}

/**
 * 设置token
 * @param token
 * @returns {*}
 */
export function setToken(token) {
  return localStorage.setItem(TokenKey, token)
}

/**
 * 移除token
 * @returns {*}
 */
export function removeToken() {
  return localStorage.removeItem(TokenKey)
}

/**
 * 设置token过期时间
 */
export function setTokenTime(time) {
  return sessionStorage.setItem(timeKey, time)
}

/**
 * 获取token过期时间
 */
export function getTokenTime() {
  return sessionStorage.getItem(timeKey)
}


/**
 * 清空token过期时间
 */
export function removeTokenTime() {
  return sessionStorage.setItem(timeKey, 0)
}
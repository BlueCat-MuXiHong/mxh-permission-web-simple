const TokenKey = 'token'

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

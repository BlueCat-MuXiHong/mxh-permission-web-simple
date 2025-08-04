/**
 * 验证外部链接
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
    return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * 验证用户名
 * @param str 用户名
 * @returns {boolean}
 */
export function validUsername(str) {
    const valid_map = ['admin', 'editor']
    return valid_map.indexOf(str.trim()) >= 0
}

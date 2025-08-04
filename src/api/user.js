import httpClient from '@/utils/request'

/**
 * 登录
 * @param data 用户名和密码
 */
export function login(data) {
    return httpClient.post('/auth/login', data)
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
    return httpClient.get('/auth/getUserInfo')
}

/**
 * 登出
 * @returns
 */
export function logout() {
    return httpClient.post('/auth/logout')
}

/**
 * 刷新token
 * @returns
 */
export async function refreshToken() {
    return httpClient.get('/auth/refreshToken')
}

/**
 * 获取菜单列表
 */
export function getMenuList() {
    return httpClient.get('/auth/getMenuList')
}

/**
 * 获取用户列表
 * @param data
 * @returns
 */
export function getUserList(data) {
    return httpClient.post('/sysUser/list', data)
}

/**
 * 获取用户列表
 * @param data
 * @returns
 */
export function addUser(data) {
    return httpClient.post('/sysUser', data)
}

/**
 * 获取用户列表
 * @param data
 * @returns
 */
export function updateUser(data) {
    return httpClient.put('/sysUser', data)
}

/**
 * 获取用户详情
 */
export function getUserId(params) {
    return httpClient.get('/sysUser/getUserId', params)
}

/**
 * 删除用户
 * @param data
 * @returns
 */
export function deleteUser(data) {
    return httpClient.delete('/sysUser', data)
}

/**
 * 保存用户角色列表
 */
export function saveUserRole(params) {
    return httpClient.post('/sysUser/saveUserRole', params)
}

/**
 * 更新用户启用状态
 */
export function updateUserEnable(params) {
    return httpClient.get('/sysUser/updateUserEnable', params)
}

/**
 * 修改密码
 */
export function resetPassword(params) {
    return httpClient.post('/sysUser/resetPassword', params)
}



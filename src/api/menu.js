import httpClient from '@/utils/request'

/**
 * 查询权限列表
 * @returns
 */
export async function getPermissionList() {
    return httpClient.get('/permission')
}

/**
 * 添加权限列表
 * @returns
 */
export async function addPermission(params) {
    return httpClient.post('/permission', params)
}

/**
 * 修改权限列表
 * @returns
 */
export async function updatePermission(params) {
    return httpClient.put('/permission', params)
}

/**
 * 删除权限列表
 * @returns
 */
export async function deletePermission(params) {
    return httpClient.delete('/permission', params)
}

/**
 * 获取初始化的菜单
 * @returns
 */
export async function getInitList() {
    return httpClient.get('/permission/init')
}

/**
 * 获取角色的菜单
 * @param params
 * @returns
 */
export async function getPermissionListByRoleId(params) {
    return httpClient.get('/permission/getPermissionListByRoleId', params)
}

/**
 * 分配权限
 * @param params
 * @returns
 */
export async function assignPermission(params) {
    return httpClient.post('/permission/assignPermission', params)
}

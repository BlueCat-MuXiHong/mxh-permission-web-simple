import httpClient from '@/utils/request'

/**
 * 查询角色列表
 * @param params
 * @returns
 */
export async function getRoleList(params) {
    return httpClient.post('/role/list', params)
}

/**
 * 查询所有角色列表
 * @param params
 * @returns
 */
export async function getAllRoleList(params) {
    return httpClient.post('/role/all', params)
}

/**
 * 添加角色
 * @param params
 * @returns
 */
export async function addRole(params) {
    return httpClient.post('/role', params)
}

/**
 * 修改角色
 * @param params
 * @returns
 */
export async function updateRole(params) {
    return httpClient.put('/role', params)
}

/**
 * 删除角色
 * @param params
 * @returns
 */
export async function deleteRole(params) {
    return httpClient.delete('/role', params)
}

/**
 * 启用或禁用角色
 * @param params
 */
export async function updateRoleEnable(params) {
    return httpClient.get('/role/updateRoleEnable', params)
}

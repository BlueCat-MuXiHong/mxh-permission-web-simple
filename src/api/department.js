import httpClient from '@/utils/request'

/**
 * 查询部门列表
 * @param params
 * @returns
 */
export async function getDepartmentList(params) {
    return httpClient.post('/department/list', params)
}

/**
 * 添加部门
 * @param data
 * @returns
 */
export async function addDepartment(data) {
    return httpClient.post('/department', data)
}

/**
 * 修改部门
 * @param data
 * @returns
 */
export async function updateDepartment(data) {
    return httpClient.put('/department', data)
}

/**
 * 删除部门
 * @param data
 * @returns
 */
export async function deleteDepartment(data) {
    return httpClient.delete('/department', data)
}

/**
 * 获取部门树列表
 * @returns
 */
export async function getParentDepartmentList() {
    return httpClient.get('/department/getParentDepartmentList')
}

import httpClient from '@/utils/request'

/**
 * 查询部门列表
 * @param params
 * @returns
 */
export async function getCompanyList(params) {
    return httpClient.post('/company/list', params)
}

/**
 * 添加单位
 * @param data
 * @returns
 */
export async function addCompany(data) {
    return httpClient.post('/company', data)
}

/**
 * 修改单位
 * @param data
 * @returns
 */
export async function updateCompany(data) {
    return httpClient.put('/company', data)
}


/**
 * 删除单位
 * @param data
 * @returns
 */
export async function deleteCompany(data) {
    return httpClient.delete('/company', data)
}

import axios from 'axios'
import store from '@/store'
import qs from 'qs'

import {Message, MessageBox} from 'element-ui'
import {getToken} from '@/utils/auth'
import config from '@/config'

// 创建 axios 实例
const service = axios.create({
    baseURL: config.VUE_APP_BASE_API,
    //请求超时时间
    timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(config => {
    if (store.getters.token) {
        config.headers['token'] = getToken()
    }
    return config;
}, error => {
    console.log(error)
    return Promise.reject(error)
})

// 响应拦截器
service.interceptors.response.use(response => {
    const res = response.data
    if (res.code !== 200) {
        Message({
            message: res.message || 'Error',
            type: 'error',
            duration: 5 * 1000
        })
    }
    if (res.code === 401) {
        MessageBox.confirm('登录过期或没有权限，请重新登录', '状态异常', {
            confirmButtonText: 'Re-Login',
            cancelButtonText: 'Cancel',
            type: 'warning'
        }).then(() => {
            store.dispatch('user/resetToken').then(() => {
                location.reload()
            })
        })
        return Promise.reject(new Error(res.message || 'Error'))
    } else {
        return res
    }
}, error => {
    console.log('err' + error) // for debug
    Message({
        message: error.message,
        type: 'error',
        duration: 5 * 1000
    })
    return Promise.reject(error)
})

// 导出封装的请求方法
const httpClient = {
    /**
     * post请求
     * @param url 请求地址
     * @param params 参数
     */
    post: function (url, params) {
        return service.post(url, params, {
            headers: {
                'Content-Type': 'application/json'
            },
            transformRequest: [function (params) {
                return JSON.stringify(params)
            }]
        })
    },
    /**
     * get请求
     * @param url 请求地址
     * @param params 参数
     */
    get: function (url, params) {
        return service.get(url, {
            params: params, paramsSerializer: (params) => {
                return qs.stringify(params)
            }
        })
    },
    /**
     * put请求
     * @param url 请求地址
     * @param params 参数
     */
    put: function (url, params) {
        return service.put(url, params, {
            headers: {
                'Content-Type': 'application/json'
            },
            transformRequest: [function (params) {
                return JSON.stringify(params)
            }]
        })
    },
    /**
     * delete请求
     * @param url 请求地址
     * @param params 参数
     */
    delete: function (url, params) {
        return service.delete(url, {
            params: params, paramsSerializer: (params) => {
                return qs.stringify(params)
            }
        })
    }
}

export default httpClient


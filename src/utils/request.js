import axios from 'axios'
import store from '@/store'
import qs from 'qs'

import { Message, MessageBox } from 'element-ui'
import { clearStorage, getToken, getTokenTime, removeTokenTime, setToken, setTokenTime } from './auth'
import config from '@/config'
import { refreshToken } from '@/api/user'

// 创建 axios 实例
const service = axios.create({
  // url = base url + request url
  baseURL: config.VUE_APP_BASE_API,
  // request timeout 毫秒
  timeout: 10000
})

/**
 * 刷新token
 */
function refreshTokenInfo() {
  //设置请求参数
  let param = {
    token: getToken()
  }
  return refreshToken(param).then(res => res)
}

//定义变量，标识是否刷新token
let isRefresh = false

// 请求拦截器
service.interceptors.request.use(config => {
    //获取当前系统时间
    let currentTime = new Date().getTime()
    //获取token过期时间
    let expireTime = getTokenTime()
    //判断token是否过期
    if (expireTime > 0) {
      //计算时间
      let min = (expireTime - currentTime) / 1000 / 60
      //如果token离过期时间相差10分钟，则刷新token
      if (min < 10) {
        //判断是否刷新
        if (!isRefresh) {
          //标识刷新
          isRefresh = true
          //调用刷新token的方法
          return refreshTokenInfo().then(res => {
            //判断是否成功
            if (res.code === 200) {
              //设置新的token和过期时间
              setToken(res.data.token)
              setTokenTime(res.data.expireTime)
              //将新的token添加到header头部
              config.headers.token = getToken()
            }
            return config
          }).catch(error => {
            //清空sessionStorage
            clearStorage()
            removeTokenTime()
          }).finally(() => {
            //修改是否刷新token的状态
            isRefresh = false
          })
        }
      }
    }

    if (store.getters.token) {
      config.headers['token'] = getToken()
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data

    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 200) {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      if (res.code === 401 || res.code === 403) {
        // to re-login
        MessageBox.confirm('登录过期或没有权限，请重新登录', 'Confirm logout', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

// 导出封装的请求方法
const httpClient = {
  /**
   * post请求
   * 使用service.post发起POST请求；
   * 设置请求头为application/json；
   * 通过transformRequest将参数从对象转换为JSON字符串。
   * @param url
   * @param params
   */
  post: function(url, params) {
    return service.post(url, params, {
      headers: {
        'Content-Type': 'application/json'
      },
      transformRequest: [function(params) {
        return JSON.stringify(params)
      }]
    })
  },
  /**
   * get请求
   * 将输入的URL和参数传递给service.get方法。
   * 使用qs.stringify将参数对象序列化为查询字符串，以便正确传输。
   * @param url
   * @param params
   */
  get: function(url, params) {
    return service.get(url, {
      params: params, paramsSerializer: (params) => {
        return qs.stringify(params)
      }
    })
  },
  /**
   * put请求
   * 使用service.put发起put请求；
   * 设置请求头为application/json；
   * 通过transformRequest将参数从对象转换为JSON字符串。
   * @param url
   * @param params
   */
  put: function(url, params) {
    return service.put(url, params, {
      headers: {
        'Content-Type': 'application/json'
      },
      transformRequest: [function(params) {
        return JSON.stringify(params)
      }]
    })
  },
  /**
   * delete请求
   * 将输入的URL和参数传递给service.delete方法。
   * 使用qs.stringify将参数对象序列化为查询字符串，以便正确传输。
   * @param url 请求地址
   * @param params 参数
   */
  delete: function(url, params) {
    return service.delete(url, {
      params: params, paramsSerializer: (params) => {
        return qs.stringify(params)
      }
    })
  },
  /**
   * 登录请求
   * @param url 地址
   * @param params 参数
   */
  login(url, params) {
    return service.post(url, params, {
      transformRequest: [(params) => {
        return qs.stringify(params)
      }],
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  }
}

export default httpClient


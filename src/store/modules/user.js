import { getToken, removeToken, setToken } from "@/utils/auth";
import { getUserInfo, login, logout } from "@/api/user";
import { resetRouter } from "@/router";

/**
 * 默认状态
 * @returns {{token: *, name: string, avatar: string, roles: *[], userId: string}} 默认状态
 */
const defaultState = () => {
    return {
        token: getToken(), name: '', avatar: '', roles: [], userId: ''
    }
}

// 初始化状态
const state = defaultState()

/**
 * 状态变更函数（mutations）
 * 用于同步修改state中的数据
 */
const mutations = {
    /**
     * 重置状态
     * @param state - 状态对象
     * @constructor 构造函数
     */
    RESET_STATE: (state) => {
        Object.assign(state, defaultState())
    }, /**
     * 设置token
     * @param state - 状态对象
     * @param token - 要设置的token
     * @constructor 构造函数
     */
    SET_TOKEN: (state, token) => {
        state.token = token
    }, /**
     * 设置用户信息
     * @param state - 状态对象
     * @param name - 用户名
     * @constructor 构造函数
     */
    SET_NAME: (state, name) => {
        state.name = name
    }, /**
     * 设置用户头像
     * @param state - 状态对象
     * @param avatar - 用户头像
     * @constructor 构造函数
     */
    SET_AVATAR: (state, avatar) => {
        state.avatar = avatar
    }, /**
     * 设置用户角色
     * @param state - 状态对象
     * @param roles - 用户角色
     * @constructor 构造函数
     */
    SET_ROLES: (state, roles) => {
        state.roles = roles
    }, /**
     * 设置用户ID
     * @param state - 状态对象
     * @param userId - 用户ID
     * @constructor 构造函数
     */
    SET_USER_ID: (state, userId) => {
        state.userId = userId
    }
}

/**
 * 异步操作函数（actions）
 * 用于处理异步逻辑，如API调用
 */
const actions = {
    /**
     * 用户登录操作
     * @param {Object} context - 包含commit、state等的上下文对象
     * @param {Object} userInfo - 登录表单数据
     * @returns {Promise} 登录结果的Promise
     */
    login({ commit }, userInfo) {
        return new Promise((resolve, reject) => {
            // 发送登录请求
            login(userInfo).then(res => {
                const { token } = res.data
                commit('SET_TOKEN', token)
                setToken(token)
                resolve()
            }).catch(error => {
                reject(error)
            })
        })
    }, 
    /**
     * 用户登出操作
     * @param {Object} context - 包含commit、state等的上下文对象
     * @returns {Promise} 登出的Promise
     */
    logout({ commit, state }) {
        return new Promise((resolve, reject) => {
            logout(state.token).then(() => {
                commit('RESET_STATE')
                removeToken()
                resetRouter()
                resolve()
            }).catch(error => {
                reject(error)
            })
        })
    }, 
    /**
     * 获取用户信息
     * @param commit - 提交mutations
     * @param state - 状态对象
     */
    getUserInfo({ commit, state }) {
        return new Promise((resolve, reject) => {
            getUserInfo(state.token).then(res => {
                const { id, name, avatar, roles } = res.data
                commit('SET_NAME', name)
                commit('SET_AVATAR', avatar)
                commit('SET_ROLES', roles)
                commit('SET_USER_ID', id)
                resolve(res.data)
            }).catch(error => {
                reject(error)
            })
        })
    },
    /**
     * 重置token
     * @param {*} param0  上下文对象
     * @returns  重置token的Promise
     */
    resetToken({ commit }) {
        return new Promise(resolve => {
            removeToken() // must remove  token  first
            commit('RESET_STATE')
            resolve()
        })
    }

}

// 导出用户模块
export default {
    // 启用命名空间，避免命名冲突
    namespaced: true, state, mutations, actions
}
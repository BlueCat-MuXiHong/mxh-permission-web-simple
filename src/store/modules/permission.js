import {defaultRoutes} from '@/router'
import {getMenuList} from "@/api/user";
import Layout from '@/layout/index.vue'


const state = {
    routes: [], addRoutes: []
}

const mutations = {
    SET_ROUTES: (state, routes) => {
        state.addRoutes = routes
        state.routes = defaultRoutes.concat(routes)
    }
}

const actions = {

    /**
     * 生成路由
     * @param commit commit
     * @param roles 角色
     * @returns {Promise<unknown>}  promise
     */
    generateRoutes({commit}, roles) {
        return new Promise((resolve, reject) => {
            getMenuList().then(res => {
                let accessRoutes = filterAsyncRouter(res.data, roles)
                commit('SET_ROUTES', accessRoutes)
                resolve(accessRoutes)
            }).catch(err => {
                reject(err)
            })
        })
    }
}

/**
 * 筛选路由
 * @param routes 路由
 * @param roles 角色
 * @returns {*[]} 筛选后的路由
 */
function filterAsyncRouter(routes, roles) {
    const result = []
    routes.forEach(route => {
        //这段代码使用展开运算符(...)创建了route对象的一个浅拷贝副本，这样可以在不修改原始route对象的情况下，对temp进行操作。
        const temp = {...route}
        if (hasPermission(roles, temp)) {
            //获取该路由对应的组件
            let component = temp.component
            //判断该路由是否有组件
            if (route.component) {
                temp.component = component === 'Layout' ? Layout : (resolve) => require([`@/views${component}`], resolve)
            }
        }
        if (temp.children) {
            temp.children = filterAsyncRouter(temp.children, roles)
        }
        result.push(temp)
    })
    return result
}

/**
 * 判断权限
 * @param roles 权限列表
 * @param route 路由
 * @returns {*|boolean}
 */
function hasPermission(roles, route) {
    if (route.meta && route.meta.roles) {
        return roles.some(role => route.meta.roles.includes(role))
    } else {
        return true
    }
}

/**
 * 导出权限模块
 */
export default {
    namespaced: true,
    state,
    mutations,
    actions
}




import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

/**
 * 路由配置数组
 * @type {Array}
 */
export const defaultRoutes = [
    {
        path: '/login', //路由路径
        name: 'login', //路由名称
        hidden: true, //该路由在菜单中隐藏显示
        component: () => import('../views/login/login.vue') //使用了路由懒加载，当访问该路由时才会加载对应的组件
    },
    {
        path: '/',
        component: () => import('@/views/login/login.vue'),
        hidden: true
    },
    {
        path: '/404',
        component: () => import('@/views/404/404.vue'),
        hidden: true
    }
]

/**
 * 创建 Vue Router实例
 * @returns {VueRouter}
 */
const createRouter = () => new VueRouter({
    // 使用HTML5历史模式，URL不带#号
    mode: 'history',
    // 路由切换时滚动到页面顶部,表示将页面滚动到坐标(0,0)位置，即页面的左上角。
    scrollBehavior: () => ({x: 0, y: 0}),
    // 注入路由配置数组
    routes: defaultRoutes
})

// 创建路由
const router = createRouter()

/**
 * 重置路由
 */
export function resetRouter() {
    const newRouter = createRouter()
    router.matcher = newRouter.matcher // reset router
}

/**
 * 路由配置
 * @type {VueRouter}
 */
export default router
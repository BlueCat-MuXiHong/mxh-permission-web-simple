import router from './router'
import store from './store'
import NProgress from 'nprogress'
import getPageTitle from "@/utils/get-page-title";
import {Message} from 'element-ui'
import {getToken} from "@/utils/auth";

NProgress.configure({showSpinner: false})

const whiteList = ['/login']

/**
 * 路由拦截
 */
router.beforeEach(async (to, from, next) => {
    //开启进度条
    NProgress.start()
    // 设置页面标题
    document.title = getPageTitle(to.meta.title)
    const hasToken = getToken()

    if (hasToken) {
        if (to.path === '/login') {
            await store.dispatch('user/logout')
            next(`/login?redirect=${to.path}`)
            NProgress.done()
        } else {
            const hasUsername = store.getters.name
            if (hasUsername) {
                next()
            } else {
                try {
                    const {roles} = await store.dispatch('user/getUserInfo')
                    //根据路由动态添加路由
                    const accessRoutes = await store.dispatch('permission/generateRoutes', roles)
                    //添加动态路由
                    router.addRoutes(accessRoutes)
                    let menu = store.state.permission.routes
                    if (menu.length <= 3) {
                        Message({
                            message: '您没有访问此系统的权限，请联系管理员。',
                            type: 'error',
                            duration: 5 * 1000
                        })
                        await store.dispatch('user/resetToken')
                        next(`/login?redirect=${to.path}`)
                        NProgress.done()
                    } else {
                        let newPath = menu[menu.length - 1].children[0].path
                        next(newPath)
                    }
                } catch (error) {
                    console.log(error)
                }
            }
        }
    } else {
        if (whiteList.indexOf(to.path) !== -1) {
            // in the free login whitelist, go directly
            next()
        } else {
            // other pages that do not have permission to access are redirected to the login page.
            next(`/login?redirect=${to.path}`)
            NProgress.done()
        }
    }
})

router.afterEach(() => {
    // finish progress bar
    NProgress.done()
})

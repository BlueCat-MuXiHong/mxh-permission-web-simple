import config from '@/config'

/**
 * 系统设置配置文件，用于管理系统的基本配置参数
 * @type {{title: string, fixedHeader: boolean, sidebarLogo: boolean}} 系统设置
 */
export default {
    // 页面标题
    title: config.VUE_APP_TITLE || 'Vue Admin Template',

    /**
     * 是否固定头部
     * @type {boolean} true-固定头部 false-不固定头部
     * @description 用于控制页面头部是否固定在顶部
     */
    fixedHeader: false,

    /**
     * 是否在侧边栏显示Logo
     * @type {boolean} true-显示Logo false-不显示Logo
     * @description 控制侧边栏顶部是否显示系统Logo图标
     */
    sidebarLogo: false
}
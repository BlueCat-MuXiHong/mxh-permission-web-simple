/**
 * 系统配置文件
 * 该文件用于定义系统运行时需要的配置参数，如后端地址、系统名称等。
 * 这些参数可以在打包后通过修改生成的 config.js 文件进行配置。
 */

// 默认配置
const defaultConfig = {
  // 后端API地址
  VUE_APP_BASE_API: 'http://localhost:10081/api',
  // 系统名称
  VUE_APP_SYSTEM_NAME: '权限管理系统',
  // 系统标题
  VUE_APP_TITLE: '权限管理系统',
  // 是否启用日志
  VUE_APP_ENABLE_LOG: false
}

// 尝试从全局变量中读取配置，如果不存在则使用默认配置
const config = window.SYSTEM_CONFIG ? window.SYSTEM_CONFIG : defaultConfig

export default config
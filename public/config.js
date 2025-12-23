/**
 * 系统运行时配置文件（唯一配置入口）
 * 
 * 说明：
 * - 这是系统的唯一配置文件，打包后可直接修改此文件
 * - 修改后刷新页面即可生效，无需重新打包
 * - 部署到不同环境时，只需修改此文件中的 VUE_APP_BASE_API
 */
window.SYSTEM_CONFIG = {
  // 后端API地址（根据部署环境修改）
  VUE_APP_BASE_API: 'http://localhost:11086/api',
  
  // 系统名称（显示在侧边栏等位置）
  VUE_APP_SYSTEM_NAME: '权限管理系统',
  
  // 页面标题（显示在浏览器标签页）
  VUE_APP_TITLE: '权限管理系统',
  
  // 是否启用日志
  VUE_APP_ENABLE_LOG: false
}

/*
 * 常用环境配置参考：
 * 
 * 本地开发：
 * VUE_APP_BASE_API: 'http://localhost:10081/api'
 * 
 * 公司内网：
 * VUE_APP_BASE_API: 'http://88.88.88.237:10081/api'
 * 
 * 内网穿透：
 * VUE_APP_BASE_API: 'https://frp-dry.com:46984/api'
 */
const path = require("path")

module.exports = {
    css: {
        loaderOptions: {
            sass: {
                // 使用新的API语法
                sassOptions: {
                    outputStyle: 'expanded'
                }
            }
        }
    },
    // 禁用生产环境的source map
    productionSourceMap: false,
    // 开发服务器配置
    devServer: {
        open: true,
        host: 'localhost',
        port: 8080,
        https: false,
        hotOnly: false
    },
    chainWebpack: config => {
        // 处理svg图标
        config.module
            .rule('svg')
            .exclude.add(path.resolve('src/icons/svg'))  // 排除icons目录
            .end()
        config.module
            .rule('icons')
            .test(/\.svg$/)
            .include.add(path.resolve('src/icons/svg'))  // 只处理icons目录
            .end()
            .use('svg-sprite-loader')
            .loader('svg-sprite-loader')
            .options({
                symbolId: 'icon-[name]'  // 定义symbolId格式
            })
    },
    // 已移除 configureWebpack 中的 DefinePlugin 配置
    // 所有配置统一由 public/config.js 管理，打包后可直接修改该文件
}

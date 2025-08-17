import Vue from 'vue'
import App from './App.vue'

import router from './router'
import store from './store'
import ElementUI from 'element-ui'
// 导入样式
import 'element-ui/lib/theme-chalk/index.css'
import './assets/styles/index.scss'
// 导入SVG图标
import './icons'
//路由首位
import '@/permission'
import resetForm from '@/utils/resetForm'
import objCopy from '@/utils/objCopy'
// 引入拖拽指令
import '@/components/Dialog/js/dialogDrag.js'

Vue.prototype.$resetForm = resetForm
Vue.prototype.$objCopy = objCopy

Vue.use(ElementUI)
// 关闭Vue.js在生产环境下的启动提示信息
Vue.config.productionTip = false

// 1.挂载路由和状态管理：将router和store注入到Vue实例中
// 2.渲染根组件：通过render函数将App组件渲染为虚拟DOM
// 3.挂载到DOM：将Vue实例挂载到id为app的HTML元素上
new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')
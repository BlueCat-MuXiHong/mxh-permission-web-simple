import Vue from 'vue'
import Vuex from 'vuex'
import getters from "@/store/getters";
import user from "@/store/modules/user";
import permission from "@/store/modules/permission";
import app from "@/store/modules/app";
import settings from "@/store/modules/settings";

Vue.use(Vuex)

/**
 * 创建vuex实例
 */
export default new Vuex.Store({
    modules: {
        user: user,
        permission: permission,
        app: app,
        settings: settings
    },
    getters
})

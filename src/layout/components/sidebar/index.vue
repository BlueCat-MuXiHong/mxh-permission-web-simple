<template>
    <div :class="{'has-logo':showLogo}">
        <logo v-if="showLogo" :collapse="isCollapse"/>
        <el-scrollbar wrap-class="scrollbar-wrapper">
            <el-menu
                :active-text-color="variables.menuActiveText"
                :background-color="variables.menuBg"
                :collapse="isCollapse"
                :collapse-transition="false"
                :default-active="activeMenu"
                :text-color="variables.menuText"
                :unique-opened="false"
                mode="vertical"
            >
                <sidebar-item v-for="route in permission_routes" :key="route.path" :base-path="route.path"
                              :item="route"/>
            </el-menu>
        </el-scrollbar>
    </div>
</template>

<script>
import logo from "@/layout/components/sidebar/logo.vue";
import SidebarItem from '@/layout/components/sidebar/sidebarItem.vue'
import {mapGetters} from 'vuex'
import variables from '@/assets/styles/variables.scss'

export default {
    name: 'sidebar',
    components: {
        logo,
        SidebarItem
    },
    computed: {
        ...mapGetters([
            'sidebar',
            'permission_routes'
        ]),
        activeMenu() {
            const route = this.$route
            const {meta, path} = route
            if (meta.activeMenu) {
                return meta.activeMenu
            }
            return path
        },
        showLogo() {
            return true
        },
        variables() {
            return variables
        },
        isCollapse() {
            return !this.sidebar.opened
        }
    }
    
}
</script>
<template>
    <!--主页面-->
    <div :class="classObj" class="app-wrapper">
        <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside"/>
        <!--侧边栏-->
        <sidebar class="sidebar-container"/>
        <div class="main-container">
            <div :class="{'fixed-header':fixedHeader}">
                <navbar/>
            </div>
            <app-main/>
        </div>
    </div>
</template>

<script>
import sidebar from './components/sidebar/index.vue'
import Navbar from "@/layout/components/navbar/Navbar.vue";
import AppMain from "@/layout/components/appMain/AppMain.vue";
import ResizeHandler from "@/layout/components/mixin/ResizeHandler";

export default {
    name: 'Layout',
    components: {sidebar, Navbar, AppMain},
    mixins: [ResizeHandler],
    computed: {
        /**
         * 侧边栏状态
         * @returns {any} 侧边栏状态
         */
        sidebar() {
            return this.$store.state.app.sidebar
        },
        /**
         * 设备状态
         * @returns {any} 设备状态
         */
        device() {
            return this.$store.state.app.device
        },
        /**
         * 固定头部状态
         * @returns {any}
         */
        fixedHeader() {
            return this.$store.state.settings.fixedHeader
        },
        /**
         * 侧边栏状态对象
         * @returns {{hideSidebar: *, openSidebar: *, withoutAnimation: *, mobile: *}}
         */
        classObj() {
            return {
                hideSidebar: !this.sidebar.opened,
                openSidebar: this.sidebar.opened,
                withoutAnimation: this.sidebar.withoutAnimation,
                mobile: this.device === 'mobile'
            }
        }
    },
    methods: {
        handleClickOutside() {
            this.$store.dispatch('app/closeSideBar', {withoutAnimation: false})
        }
    }
}
</script>

<style lang="scss" scoped>
@import "~@/assets/styles/mixin.scss";
@import "~@/assets/styles/variables.scss";

.app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;
    
    &.mobile.openSidebar {
        position: fixed;
        top: 0;
    }
}

.drawer-bg {
    background: #000;
    opacity: 0.3;
    width: 100%;
    top: 0;
    height: 100%;
    position: absolute;
    z-index: 999;
}

.fixed-header {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 9;
    width: calc(100% - #{$sideBarWidth});
    transition: width 0.28s;
}

.hideSidebar .fixed-header {
    width: calc(100% - 54px)
}

.mobile .fixed-header {
    width: 100%;
}
</style>
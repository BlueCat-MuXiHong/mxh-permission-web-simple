<template>
    <!--主页面-->
    <div class="app-wrapper">
        <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside"/>
        <sidebar class="sidebar-container"/>
    </div>
</template>

<script>
import sidebar from './components/sidebar/index.vue'

export default {
    name: 'Layout',
    components: {sidebar},
    mixins: [],
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
        
        }
    }
}
</script>

<style lang="scss" scoped>

</style>
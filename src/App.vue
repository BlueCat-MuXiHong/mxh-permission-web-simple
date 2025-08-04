<template>
    <div id="app">
        <router-view/>
    </div>
</template>

<script>

export default {
    name: 'App'
}
</script>

<style lang="scss">
/* App.vue特定的样式 */
#app {
    /* 确保应用占满整个视口 */
    min-width: 1600px;
    min-height: 800px;
    
    /* 响应式调整 */
    @media (max-width: 1600px) {
        min-width: 1200px;
    }
}
</style>

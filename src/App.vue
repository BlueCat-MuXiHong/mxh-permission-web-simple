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
    min-height: 800px;
    width: 100%;
    overflow-x: hidden;
}
</style>

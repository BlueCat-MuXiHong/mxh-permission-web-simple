<template>
    <!--  当isExternal为true时，渲染一个外部SVG图标。通过:style绑定styleExternalIcon样式，设置CSS类名为svg-external-icon svg-icon，并使用v-on="$listeners"将所有事件监听器传递给该元素。  -->
    <div v-if="isExternal" :style="styleExternalIcon" class="svg-external-icon svg-icon" v-on="$listeners"/>
    <!--  当isExternal为false时，渲染一个内部SVG图标。通过:class绑定svgClass样式，并使用v-on="$listeners"将所有事件监听器传递给该元素。   -->
    <svg v-else :class="svgClass" aria-hidden="true" v-on="$listeners">
        <use :href="iconName"/>
    </svg>
</template>

<script>
import {isExternal} from "@/utils/validate";

export default {
    name: 'SvgIcon',
    /**
     * 接收的参数iconClass和className
     */
    props: {
        iconClass: {
            type: String,
            required: true
        },
        className: {
            type: String,
            default: ''
        }
    },
    computed: {
        /**
         * 判断是否是外部图标
         * @returns {boolean}
         */
        isExternal() {
            return isExternal(this.iconClass)
        },
        /**
         * 获取图标名称
         * @returns {string}
         */
        iconName() {
            return `#icon-${this.iconClass}`;
        },
        /**
         * 获取图标样式
         * @returns {string}
         */
        svgClass() {
            if (this.className) {
                return 'svg-icon ' + this.className;
            } else {
                return 'svg-icon';
            }
        },
        /**
         * 外部图标样式
         * @returns {{mask: string, "-webkit-mask": string}}
         */
        styleExternalIcon() {
            return {
                mask: `url(${this.iconClass}) no-repeat 50% 50%`,
                '-webkit-mask': `url(${this.iconClass}) no-repeat 50% 50%`
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.svg-icon {
    width: 0.5em;
    height: 0.5em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
}

.svg-external-icon {
    background-color: currentColor;
    mask-size: cover !important;
    display: inline-block;
}
</style>
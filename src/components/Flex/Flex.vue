<template>
    <div
        :class="[
      inline ? `${prefixCls}-inline` :`${prefixCls}`,
      direction ? `${prefixCls}-dir-${direction}`: '',
      wrap ? `${prefixCls}-${wrap}`: '',
      justify ? `${prefixCls}-justify-${justify}`: '',
      align ? `${prefixCls}-align-${align}`: ''
    ]"
        v-on="$listeners"
    >
        <slot/>
    </div>
</template>

<script>
export default {
    props: {
        inline: {
            type: Boolean,
            default: false
        },
        direction: {
            type: String,
            default: '',
            validator: value => {
                return ['', 'row', 'row-reverse', 'column', 'column-reverse'].indexOf(value) !== -1
            }
        },
        wrap: {
            type: String,
            default: '',
            validator: value => {
                return ['', 'nowrap', 'wrap', 'wrap-reverse'].indexOf(value) !== -1
            }
        },
        justify: {
            type: String,
            default: '',
            validator: value => {
                return ['', 'start', 'end', 'center', 'between', 'around'].indexOf(value) !== -1
            }
        },
        align: {
            type: String,
            default: '',
            validator: value => {
                return ['', 'start', 'end', 'center', 'baseline', 'stretch'].indexOf(value) !== -1
            }
        },
        prefixCls: {
            type: String,
            default: 'flex'
        }
    }
}
</script>

<style lang="scss" scoped>
@import '~@/components/Flex/css/flex.scss';
</style>
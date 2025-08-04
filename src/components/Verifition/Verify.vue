<template>
    <div class="verify-container">
        <!-- 点选验证 -->
        <VerifyPoints
            v-if="captchaType === 'clickWord'"
            ref="verify"
            :captcha-type="captchaType"
            :img-size="imgSize"
            :mode="mode"
            @error="handleError"
            @success="handleSuccess"
        />
        
        <!-- 拼图验证 -->
        <VerifySlide
            v-else-if="captchaType === 'blockPuzzle'"
            ref="verify"
            :captcha-type="captchaType"
            :img-size="imgSize"
            :mode="mode"
            @error="handleError"
            @success="handleSuccess"
        />
        
        <!-- 默认提示 -->
        <div v-else class="verify-tip">
            请选择有效的验证类型
        </div>
    </div>
</template>

<script>
import VerifyPoints from './Verify/VerifyPoints.vue'
import VerifySlide from './Verify/VerifySlide.vue'

export default {
    name: 'Verify',
    
    components: {
        VerifyPoints,
        VerifySlide
    },
    
    props: {
        // 验证码类型
        captchaType: {
            type: String,
            required: true,
            // validator: value => ['clickWord', 'blockPuzzle'].includes(value)
        },
        
        // 图片尺寸
        imgSize: {
            type: Object,
            default: () => ({
                width: '330px',
                height: '155px'
            })
        },
        
        // 显示模式：pop-弹出式，fixed-固定式
        mode: {
            type: String,
            default: 'fixed',
            // validator: value => ['pop', 'fixed'].includes(value)
        }
    },
    
    data() {
        return {
            clickShow: false // 控制弹出显示
        }
    },
    
    methods: {
        /**
         * 显示验证框(仅pop模式有效)
         */
        show() {
            if (this.mode === 'pop') {
                this.clickShow = true
            }
        },
        
        /**
         * 隐藏验证框(仅pop模式有效)
         */
        closeBox() {
            this.clickShow = false
        },
        
        /**
         * 处理验证成功
         * @param {Object} params - 验证参数
         */
        handleSuccess(params) {
            this.$emit('success', params)
        },
        
        /**
         * 处理验证失败
         */
        handleError() {
            this.$emit('error')
        },
        
        /**
         * 刷新验证码
         */
        // refresh() {
        //     if (this.$refs.verify && this.$refs.verify.refresh) {
        //         this.$refs.verify.refresh()
        //     }
        // }
    }
}
</script>

<style scoped>
.verify-container {
    position: relative;
}

.verify-tip {
    padding: 20px;
    text-align: center;
    color: #666;
}
</style>
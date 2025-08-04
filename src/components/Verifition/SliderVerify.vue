<template>
    <div :style="style" class="drag">
        <!-- 背景条 -->
        <div class="background"/>
        <!-- 提示文字 -->
        <div :style="{ color: textColor }" class="text shadow">
            <slot name="content">
                {{ content }}
            </slot>
        </div>
        <!-- 可拖动滑块 -->
        <div
            :style="{height, width: sliderWidth}"
            class="slider"
            @mousedown="onMouseDown"
            @touchstart="onTouchStart"
        >
            <slot v-if="icon" name="icon">
                <i :class="icon"></i>
            </slot>
            <slot v-else name="icon">
                >>
            </slot>
        </div>
    </div>
</template>

<script>
/**
 * SliderVerify 滑块验证组件
 *
 * @description
 * 这是一个滑块验证组件，用户需要将滑块拖动到最右侧完成验证。
 * 支持PC端鼠标操作和移动端触摸操作，提供视觉反馈和验证状态管理。
 *
 * @features
 * 1. 支持v-model双向绑定验证状态
 * 2. 响应式设计，适应不同屏幕尺寸
 * 3. 提供成功/失败的视觉反馈
 * 4. 可自定义滑块样式和提示文字
 *
 * @usage
 * <SliderVerify
 *   v-model="isVerified"
 *   @change="onVerifyChange"
 * />
 */

// 防抖函数，用于窗口resize事件
function debounce(func, wait) {
    let timeout
    return function (...args) {
        const context = this
        clearTimeout(timeout)
        timeout = setTimeout(() => func.apply(context, args), wait)
    }
}

export default {
    name: 'SliderVerify',
    
    // v-model配置
    model: {
        event: 'change',
        prop: 'isLock'
    },
    
    props: {
        /**
         * 验证状态，使用v-model绑定
         * true表示验证通过，false表示未验证
         */
        isLock: {
            type: [String, Boolean, Number, Object],
            required: true,
            default: false
        },
        
        /**
         * 滑块图标，可使用Element UI图标或自定义图标
         */
        icon: {
            type: [String],
            default: 'el-icon-d-arrow-right'
        },
        
        /**
         * 验证通过时的值
         */
        activeValue: {
            type: [String, Boolean, Number, Object],
            default: true
        },
        
        /**
         * 验证未通过/重置时的值
         */
        inactiveValue: {
            type: [String, Boolean, Number, Object],
            default: false
        },
        
        /**
         * 提示文字内容
         */
        content: {
            type: [String],
            default: '请向右拖动滑块'
        },
        
        /**
         * 组件高度
         */
        height: {
            type: [String],
            default: '40px'
        },
        
        /**
         * 滑块宽度
         */
        sliderWidth: {
            type: [String],
            default: '40px'
        },
        
        /**
         * 背景颜色
         */
        background: {
            type: [String],
            default: '#e8e8e8'
        },
        
        /**
         * 文字颜色
         */
        textColor: {
            type: [String],
            default: '#777'
        }
    },
    
    data() {
        return {
            // 当前验证状态
            isVerified: false,
            // 滑块移动距离
            offsetX: 0,
            // 最大可移动距离
            maxDistance: 0,
            // DOM元素引用
            elements: {
                box: null,
                background: null,
                text: null,
                slider: null
            }
        }
    },
    
    computed: {
        /**
         * 计算组件样式
         */
        style() {
            const {height, background} = this
            return {
                height,
                'line-height': height,
                background
            }
        }
    },
    
    watch: {
        /**
         * 监听isLock变化，重置验证状态
         */
        isLock(val) {
            if (!val) {
                this.resetSlider()
            }
        }
    },
    
    mounted() {
        this.initElements()
        this.calculateMaxDistance()
        
        // 窗口resize时重新计算
        window.addEventListener('resize', this.handleResize)
    },
    
    beforeDestroy() {
        // 清除事件监听
        window.removeEventListener('resize', this.handleResize)
        this.removeEventListeners()
    },
    
    methods: {
        /**
         * 初始化DOM元素引用
         */
        initElements() {
            this.elements = {
                box: this.$el,
                background: this.$el.querySelector('.background'),
                text: this.$el.querySelector('.text'),
                slider: this.$el.querySelector('.slider')
            }
        },
        
        /**
         * 计算滑块最大可移动距离
         */
        calculateMaxDistance() {
            const {box, slider} = this.elements
            this.maxDistance = box.offsetWidth - slider.offsetWidth
        },
        
        /**
         * 窗口resize处理函数
         */
        handleResize: debounce(function () {
            this.calculateMaxDistance()
            this.resetSlider()
        }, 120),
        
        /**
         * 鼠标按下事件处理
         */
        onMouseDown(event) {
            event.preventDefault()
            this.startDrag(event.clientX, 'mouse')
        },
        
        /**
         * 触摸开始事件处理
         */
        onTouchStart(event) {
            const touch = event.changedTouches[0]
            this.startDrag(touch.pageX, 'touch')
        },
        
        /**
         * 开始拖动处理
         * @param {Number} startX - 起始X坐标
         * @param {String} inputType - 输入类型(mouse/touch)
         */
        startDrag(startX, inputType) {
            // 清除过渡效果
            this.resetTransition()
            
            // 设置初始状态
            this.isVerified = false
            this.startX = startX
            this.inputType = inputType
            
            // 添加事件监听
            if (inputType === 'mouse') {
                document.addEventListener('mousemove', this.onDrag)
                document.addEventListener('mouseup', this.endDrag)
            } else {
                document.addEventListener('touchmove', this.onDrag)
                document.addEventListener('touchend', this.endDrag)
            }
        },
        
        /**
         * 拖动处理
         */
        onDrag(event) {
            const clientX = this.inputType === 'mouse'
                ? event.clientX
                : event.changedTouches[0].pageX
            
            // 计算偏移量
            this.offsetX = clientX - this.startX
            
            // 限制在有效范围内
            this.offsetX = Math.max(0, Math.min(this.offsetX, this.maxDistance))
            
            // 更新UI
            this.updateSliderPosition()
            
            // 检查是否验证成功
            if (this.offsetX === this.maxDistance) {
                this.onVerifySuccess()
            }
        },
        
        /**
         * 拖动结束处理
         */
        endDrag() {
            this.removeEventListeners()
            
            if (!this.isVerified) {
                this.resetSlider()
            }
        },
        
        /**
         * 验证成功处理
         */
        onVerifySuccess() {
            const {text, slider} = this.elements
            
            // 更新UI状态
            text.innerHTML = '验证成功'
            text.style.color = '#53C300'
            slider.innerHTML = '<i class="el-icon-success"></i>'
            slider.style.color = '#53C300'
            
            // 更新验证状态
            this.isVerified = true
            this.$emit('change', this.activeValue)
            
            // 移除事件监听
            this.removeEventListeners()
        },
        
        /**
         * 更新滑块位置
         */
        updateSliderPosition() {
            const {background, slider} = this.elements
            slider.style.left = `${this.offsetX}px`
            background.style.width = `${this.offsetX}px`
        },
        
        /**
         * 重置滑块状态
         */
        resetSlider() {
            const {text, slider, background} = this.elements
            
            // 重置位置和样式
            this.offsetX = 0
            slider.style.left = '0'
            background.style.width = '0'
            
            // 添加过渡效果
            slider.style.transition = 'left 1s ease'
            background.style.transition = 'width 1s ease'
            
            // 重置文本和图标
            text.innerHTML = this.content
            slider.innerHTML = '<i class="el-icon-d-arrow-right"></i>'
            slider.style.color = '#3fcd26'
        },
        
        /**
         * 清除过渡效果
         */
        resetTransition() {
            const {slider, background} = this.elements
            slider.style.transition = 'none'
            background.style.transition = 'none'
        },
        
        /**
         * 移除事件监听
         */
        removeEventListeners() {
            document.removeEventListener('mousemove', this.onDrag)
            document.removeEventListener('mouseup', this.endDrag)
            document.removeEventListener('touchmove', this.onDrag)
            document.removeEventListener('touchend', this.endDrag)
        }
    }
}
</script>

<style lang="scss" scoped>
/* 基础重置 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: "微软雅黑", serif;
}

/* 滑块容器样式 */
.drag {
    height: 2.5rem;
    line-height: 2.5rem;
    background-color: #e8e8e8;
    position: relative;
    margin: 0 auto;
    border-radius: 3px;
}

/* 背景条样式 */
.background {
    width: 2.5rem;
    height: 100%;
    position: absolute;
    background-color: #53C300;
    border-radius: 3px 0 0 3px;
}

/* 提示文字样式 */
.text {
    position: absolute;
    width: 100%;
    height: 100%;
    text-align: center;
    user-select: none;
}

/* 滑块样式 */
.slider {
    width: 2.5rem;
    height: 2.375rem;
    position: absolute;
    border: 1px solid #ccc;
    cursor: move;
    font-family: "宋体", serif;
    text-align: center;
    background-color: #fff;
    user-select: none;
    color: #666;
}

/* 文字阴影效果 */
.shadow {
    text-align: center;
    background: linear-gradient(
            to right,
            #4d4d4d 0%,
            #5d5d5d 20%,
            #6d6d6d 40%,
            white 50%,
            #6d6d6d 60%,
            #5d5d5d 80%,
            #4d4d4d 100%
    );
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: animate 3s infinite;
}

/* 文字动画 */
@keyframes animate {
    from {
        background-position: -80px;
    }
    to {
        background-position: 80px;
    }
}
</style>
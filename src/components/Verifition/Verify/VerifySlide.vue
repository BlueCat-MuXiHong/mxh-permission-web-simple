<template>
    <div style="position: relative">
        <div
            :style="{ height: parseInt(setSize.imgHeight) + vSpace + 'px' }" class="verify-img-out">
            <div v-if="loading" class="verify-loading">
                <div class="verify-loading-spinner"></div>
            </div>
            <div :style="{ width: setSize.imgWidth, height: setSize.imgHeight }" class="verify-img-panel">
                <img :src="backImgBase ? 'data:image/png;base64,' + backImgBase : defaultImg" alt=""
                     style="width: 100%; height: 100%; display: block"/>
                <div v-show="showRefresh" class="verify-refresh" @click="refresh">
                    <SvgIcon icon-class="refresh"/>
                </div>
                <transition name="tips">
                    <span v-if="tipWords" :class="passFlag ? 'suc-bg' : 'err-bg'" class="verify-tips">{{
                            tipWords
                        }}</span>
                </transition>
            </div>
        </div>
        <!-- 公共部分 -->
        <div
            :style="{width: setSize.imgWidth,height: barSize.height,'line-height': barSize.height}"
            class="verify-bar-area">
            <div v-if="checkLoading" class="verify-check-loading">
                <div class="verify-loading-spinner"></div>
            </div>
            <span class="verify-msg" v-text="text"></span>
            <div :style="{
                  width: leftBarWidth !== undefined ? leftBarWidth : barSize.height,
                  height: barSize.height,
                  'border-color': leftBarBorderColor,
                  transaction: transitionWidth}" class="verify-left-bar">
                <span class="verify-msg" v-text="finishText"></span>
                <div
                    :style="{width: barSize.height,height: barSize.height,'background-color': moveBlockBackgroundColor,
                    left: moveBlockLeft,transition: transitionLeft}" class="verify-move-block" @mousedown="start"
                    @touchstart="start">
                    <i :class="['verify-icon iconfont', iconClass]" :style="{ color: iconColor }"></i>
                    <div
                        :style="{
                          width: Math.floor((parseInt(setSize.imgWidth) * 47) / 310) + 'px',
                          height: setSize.imgHeight,
                          top: '-' + parseInt(setSize.imgHeight) + 'px',
                          'background-size': setSize.imgWidth + ' ' + setSize.imgHeight}"
                        class="verify-sub-block">
                        <img :src="'data:image/png;base64,' + blockBackImgBase" alt=""
                             style="width: 100%; height: 100%; display: block"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script type="text/babel">
import SvgIcon from "@/components/icon/svgIcon.vue";
import {aesEncrypt} from './../utils/ase'
import {resetSize} from './../utils/util'
import {checkCaptcha, getCaptcha} from '@/api/captcha'

export default {
    components: {
        SvgIcon: SvgIcon
    },
    name: 'VerifySlide',
    props: {
        captchaType: {
            type: String
        },
        type: {
            type: String,
            default: '1'
        },
        //弹出式pop，固定fixed
        mode: {
            type: String,
            default: 'fixed'
        },
        vSpace: {
            type: Number,
            default: 0
        },
        explain: {
            type: String,
            default: '向右滑动完成验证'
        },
        imgSize: {
            type: Object,
            default() {
                return {
                    width: '350px',
                    height: '165px'
                }
            }
        },
        blockSize: {
            type: Object,
            default() {
                return {
                    width: '50px',
                    height: '50px'
                }
            }
        },
        barSize: {
            type: Object,
            default() {
                return {
                    width: '310px',
                    height: '40px'
                }
            }
        },
        defaultImg: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            secretKey: '', //后端返回的加密秘钥 字段
            passFlag: '', //是否通过的标识
            backImgBase: '', //验证码背景图片
            blockBackImgBase: '', //验证滑块的背景图片
            backToken: '', //后端返回的唯一token值
            loading: false, // 图片加载状态
            checkLoading: false, // 验证请求加载状态
            startMoveTime: '', //移动开始的时间
            endMovetime: '', //移动结束的时间
            tipsBackColor: '', //提示词的背景颜色
            tipWords: '',
            text: '',
            finishText: '',
            setSize: {
                imgHeight: 0,
                imgWidth: 0,
                barHeight: 0,
                barWidth: 0
            },
            top: 0,
            left: 0,
            moveBlockLeft: undefined,
            leftBarWidth: undefined,
            // 移动中样式
            moveBlockBackgroundColor: undefined,
            leftBarBorderColor: '#ddd',
            iconColor: undefined,
            iconClass: 'el-icon-d-arrow-right',
            status: false, //鼠标状态
            isEnd: false, //是够验证完成
            showRefresh: true,
            transitionLeft: '',
            transitionWidth: ''
        }
    },
    computed: {
        barArea() {
            return this.$el.querySelector('.verify-bar-area')
        },
        resetSize() {
            return resetSize
        }
    },
    methods: {
        init() {
            this.text = this.explain
            this.getPicture()
            this.$nextTick(() => {
                let setSize = this.resetSize(this) //重新设置宽度高度
                for (let key in setSize) {
                    this.$set(this.setSize, key, setSize[key])
                }
                this.$parent.$emit('ready', this)
            })
            
            var _this = this
            
            window.removeEventListener('touchmove', function (e) {
                _this.move(e)
            })
            window.removeEventListener('mousemove', function (e) {
                _this.move(e)
            })
            
            //鼠标松开
            window.removeEventListener('touchend', function () {
                _this.end()
            })
            window.removeEventListener('mouseup', function () {
                _this.end()
            })
            
            window.addEventListener('touchmove', function (e) {
                _this.move(e)
            })
            window.addEventListener('mousemove', function (e) {
                _this.move(e)
            })
            
            //鼠标松开
            window.addEventListener('touchend', function () {
                _this.end()
            })
            window.addEventListener('mouseup', function () {
                _this.end()
            })
        },
        
        //鼠标按下
        start: function (e) {
            if (this.loading) return
            e = e || window.event
            let x = 0;
            if (!e.touches) {
                //兼容PC端
                x = e.clientX
            } else {
                //兼容移动端
                x = e.touches[0].pageX
            }
            this.startLeft = Math.floor(
                x - this.barArea.getBoundingClientRect().left
            )
            this.startMoveTime = +new Date() //开始滑动的时间
            if (this.isEnd === false) {
                this.text = ''
                this.moveBlockBackgroundColor = '#337ab7'
                this.leftBarBorderColor = '#1890ff'
                this.iconColor = '#fff'
                e.stopPropagation()
                this.status = true
            }
        },
        //鼠标移动
        move: function (e) {
            e = e || window.event
            if (this.status && this.isEnd === false) {
                let x = 0;
                if (!e.touches) {
                    //兼容PC端
                    x = e.clientX
                } else {
                    //兼容移动端
                    x = e.touches[0].pageX
                }
                var bar_area_left = this.barArea.getBoundingClientRect().left
                var move_block_left = x - bar_area_left //小方块相对于父元素的left值
                if (
                    move_block_left >=
                    this.barArea.offsetWidth -
                    parseInt(parseInt(this.blockSize.width) / 2) -
                    2
                ) {
                    move_block_left =
                        this.barArea.offsetWidth -
                        parseInt(parseInt(this.blockSize.width) / 2) -
                        2
                }
                if (move_block_left <= 0) {
                    move_block_left = parseInt(parseInt(this.blockSize.width) / 2)
                }
                //拖动后小方块的left值
                this.moveBlockLeft = move_block_left - this.startLeft + 'px'
                this.leftBarWidth = move_block_left - this.startLeft + 'px'
            }
        },
        
        //鼠标松开
        end: function () {
            this.endMovetime = +new Date()
            var _this = this
            //判断是否重合
            if (this.status && this.isEnd === false) {
                var moveLeftDistance = parseInt(
                    (this.moveBlockLeft || '').replace('px', '')
                )
                moveLeftDistance =
                    (moveLeftDistance * 310) / parseInt(this.setSize.imgWidth)
                let data = {
                    captchaType: this.captchaType,
                    pointJson: this.secretKey
                        ? aesEncrypt(
                            JSON.stringify({x: moveLeftDistance, y: 5.0}),
                            this.secretKey
                        )
                        : JSON.stringify({x: moveLeftDistance, y: 5.0}),
                    token: this.backToken
                }
                this.checkLoading = true
                checkCaptcha(data).then((res) => {
                    this.checkLoading = false
                    if (res.data.repCode === '0000') {
                        this.moveBlockBackgroundColor = '#5cb85c'
                        this.leftBarBorderColor = '#1890ff'
                        this.iconColor = '#fff'
                        this.iconClass = 'el-icon-check'
                        this.showRefresh = false
                        this.isEnd = true
                        this.passFlag = true
                        this.tipWords = `${(
                            (this.endMovetime - this.startMoveTime) /
                            1000
                        ).toFixed(2)}s验证成功`
                        // 添加成功样式class
                        const leftBar = this.$el.querySelector('.verify-left-bar')
                        leftBar.classList.add('success')
                        var captchaVerification = this.secretKey
                            ? aesEncrypt(
                                this.backToken +
                                '---' +
                                JSON.stringify({x: moveLeftDistance, y: 5.0}),
                                this.secretKey
                            )
                            : this.backToken +
                            '---' +
                            JSON.stringify({x: moveLeftDistance, y: 5.0})
                        // 立即触发success事件，不再延迟
                        this.$parent.$emit('success', {captchaVerification})
                        setTimeout(() => {
                            this.tipWords = ''
                            this.$parent.closeBox()
                        }, 1000)
                    } else {
                        this.moveBlockBackgroundColor = '#d9534f'
                        this.leftBarBorderColor = '#ff4d4f'
                        this.iconColor = '#fff'
                        this.iconClass = 'el-icon-close'
                        this.passFlag = false
                        setTimeout(function () {
                            _this.refresh()
                        }, 1000)
                        this.$parent.$emit('error', this)
                        this.tipWords = '验证失败'
                        // 添加失败样式class
                        const leftBar = this.$el.querySelector('.verify-left-bar')
                        leftBar.classList.add('error')
                        setTimeout(() => {
                            this.tipWords = ''
                        }, 1000)
                    }
                }).catch(() => {
                    this.checkLoading = false
                    this.tipWords = '验证请求失败'
                    setTimeout(() => {
                        this.tipWords = ''
                    }, 1000)
                })
                this.status = false
            }
        },
        
        refresh: function () {
            this.showRefresh = true
            this.finishText = ''
            
            this.transitionLeft = 'left .3s'
            this.moveBlockLeft = 0
            
            this.leftBarWidth = undefined
            this.transitionWidth = 'width .3s'
            
            this.leftBarBorderColor = '#ddd'
            this.moveBlockBackgroundColor = '#fff'
            this.iconColor = '#000'
            this.iconClass = 'el-icon-d-arrow-right'
            this.isEnd = false
            
            // 重置滑轨样式
            const leftBar = this.$el.querySelector('.verify-left-bar')
            leftBar.classList.remove('success', 'error')
            
            this.getPicture()
            setTimeout(() => {
                this.transitionWidth = ''
                this.transitionLeft = ''
                this.text = this.explain
            }, 300)
        },
        // 请求背景图片和验证图片
        getPicture() {
            this.loading = true
            let data = {captchaType: this.captchaType, clientUid: localStorage.getItem('slider'), ts: Date.now()}// 现在的时间戳
            getCaptcha(data).then((res) => {
                this.loading = false
                if (res.data.repCode === '0000') {
                    this.backImgBase = res.data.repData.originalImageBase64
                    this.blockBackImgBase = res.data.repData.jigsawImageBase64
                    this.backToken = res.data.repData.token
                    this.secretKey = res.data.repData.secretKey
                } else {
                    this.tipWords = res.data.repMsg
                }
                
                // 判断接口请求次数是否失效
                if (res.data.repCode === '6201') {
                    this.backImgBase = null
                    this.blockBackImgBase = null
                }
            }).catch(() => {
                this.loading = false
                this.tipWords = '加载失败，请重试'
            })
        }
    },
    watch: {
        // type变化则全面刷新
        type: {
            immediate: true,
            handler() {
                this.init()
            }
        }
    },
    mounted() {
        // 禁止拖拽
        this.$el.onselectstart = function () {
            return false
        }
    }
}
</script>


<style scoped>
.verify-img-out {
    position: relative;
    width: 100%;
    height: auto;
    background: #f7f9fa;
    border-radius: 8px 8px 0 0;
    overflow: hidden;
    margin: 0;
    padding: 0;
}

.verify-img-panel img {
    display: block !important;
    width: 100% !important;
    height: 100% !important;
    z-index: 99999 !important;
    object-fit: fill !important;
    visibility: visible !important;
    opacity: 1 !important;
    margin: 0 !important;
    padding: 0 !important;
}

/* 底部滑动条区域 */
.verify-bar-area {
    position: relative;
    background: #f0f2f5;
    text-align: center;
    box-sizing: content-box;
    border-radius: 0 0 8px 8px;
    border: 1px solid #e8e8e8;
    border-top: none;
}

/* 滑块按钮 */
.verify-bar-area .verify-move-block {
    position: absolute;
    top: 0;
    left: 0;
    background: linear-gradient(180deg, #fff 0%, #f8f8f8 100%);
    cursor: grab;
    box-sizing: content-box;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    border: 1px solid #e0e0e0;
    transition: box-shadow 0.2s ease, background 0.2s ease;
}

.verify-bar-area .verify-move-block:hover {
    background: linear-gradient(180deg, #1890ff 0%, #096dd9 100%);
    border-color: #1890ff;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.35);
}

.verify-bar-area .verify-move-block:hover .verify-icon {
    color: #fff !important;
}

.verify-bar-area .verify-move-block:active {
    cursor: grabbing;
}

/* 滑过的轨道 */
.verify-bar-area .verify-left-bar {
    position: absolute;
    top: 0;
    left: 0;
    background: linear-gradient(to right, rgba(24, 144, 255, 0.2), rgba(24, 144, 255, 0.3));
    cursor: pointer;
    box-sizing: content-box;
    border-radius: 0 0 0 8px;
    transition: all 0.2s ease;
}

/* 验证成功时的滑轨样式 */
.verify-bar-area .verify-left-bar.success {
    background: linear-gradient(to right, rgba(82, 196, 26, 0.3), rgba(82, 196, 26, 0.4));
}

/* 验证失败时的滑轨样式 */
.verify-bar-area .verify-left-bar.error {
    background: linear-gradient(to right, rgba(255, 77, 79, 0.3), rgba(255, 77, 79, 0.4));
}

.verify-img-panel {
    margin: 0;
    box-sizing: border-box;
    border-radius: 8px 8px 0 0;
    position: relative;
    overflow: hidden;
    border: 1px solid #e8e8e8;
    border-bottom: none;
}

/* 刷新按钮 */
.verify-img-panel .verify-refresh {
    width: 32px;
    height: 32px;
    text-align: center;
    padding: 0;
    cursor: pointer;
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 2;
    background-color: rgba(255, 255, 255, 0.85);
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.verify-img-panel .verify-refresh:hover {
    background-color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transform: rotate(180deg);
}

.verify-img-panel .verify-refresh i,
.verify-img-panel .verify-refresh svg {
    font-size: 16px;
    color: #1890ff;
}

.verify-img-panel {
    background-color: #fff;
    position: relative;
    z-index: 2;
}

/* 拼图滑块 */
.verify-bar-area .verify-move-block .verify-sub-block {
    position: absolute;
    text-align: center;
    z-index: 3;
}

/* 滑块图标 */
.verify-bar-area .verify-move-block .verify-icon {
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: #1890ff;
    transition: color 0.2s ease;
}

.verify-bar-area .verify-msg {
    z-index: 3;
    font-size: 14px;
    letter-spacing: 1px;
}

/* 验证提示 */
.verify-tips {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 32px;
    line-height: 32px;
    color: #fff;
    text-align: center;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.suc-bg {
    background-color: rgba(82, 196, 26, 0.9);
    animation: fadeIn 0.3s ease;
}

.err-bg {
    background-color: rgba(255, 77, 79, 0.9);
    animation: shake 0.4s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-4px); }
    40%, 80% { transform: translateX(4px); }
}

/* 提示文字动画 */
.verify-msg {
    background: linear-gradient(
        to right,
        #999 0%,
        #bbb 30%,
        #999 50%,
        #bbb 70%,
        #999 100%
    );
    background-size: 200% 100%;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
    0% { background-position: 100% center; }
    100% { background-position: -100% center; }
}

/* Loading动画样式 */
.verify-loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 999;
    pointer-events: none;
    border-radius: 8px 8px 0 0;
}

.verify-loading ~ .verify-bar-area {
    pointer-events: none;
    opacity: 0.6;
}

.verify-check-loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 999;
    pointer-events: none;
    border-radius: 0 0 8px 8px;
}

.verify-loading-spinner {
    width: 36px;
    height: 36px;
    border: 3px solid #f0f0f0;
    border-top: 3px solid #1890ff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
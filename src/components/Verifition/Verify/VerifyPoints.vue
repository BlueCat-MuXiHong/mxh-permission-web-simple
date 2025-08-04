<template>
    <div style="position: relative">
        <!-- 验证图片区域 -->
        <div class="verify-img-out">
            <div
                :style="{
                    width: setSize.imgWidth,
                    height: setSize.imgHeight,
                    'background-size': setSize.imgWidth + ' ' + setSize.imgHeight,
                    'margin-bottom': vSpace + 'px'
                }"
                class="verify-img-panel"
            >
                <!-- 刷新按钮 -->
                <div
                    v-show="showRefresh"
                    class="verify-refresh"
                    style="z-index: 3"
                    @click="refresh"
                >
                    <i class="iconfont icon-refresh"></i>
                </div>
                
                <!-- 背景图片 -->
                <img
                    ref="canvas"
                    :src="pointBackImgBase ? 'data:image/png;base64,' + pointBackImgBase : defaultImg"
                    alt=""
                    style="width: 100%; height: 100%; display: block"
                    @click="bindingClick ? canvasClick($event) : undefined"
                />
                
                <!-- 点击标记 -->
                <div
                    v-for="(tempPoint, index) in tempPoints"
                    :key="index"
                    :style="{
                        'background-color': '#1abd6c',
                        color: '#fff',
                        'z-index': 9999,
                        width: '20px',
                        height: '20px',
                        'text-align': 'center',
                        'line-height': '20px',
                        'border-radius': '50%',
                        position: 'absolute',
                        top: parseInt(tempPoint.y - 10) + 'px',
                        left: parseInt(tempPoint.x - 10) + 'px'
                    }"
                    class="point-area"
                >
                    {{ index + 1 }}
                </div>
            </div>
        </div>
        
        <!-- 验证条区域 -->
        <div
            :style="{
                width: setSize.imgWidth,
                color: barAreaColor,
                'background-color': barAreaBackgroundColor,
                'line-height': barSize.height
            }"
            class="verify-bar-area"
        >
            <span class="verify-msg">{{ text }}</span>
        </div>
    </div>
</template>

<script type="text/babel">
/**
 * VerifyPoints 点选验证组件
 * @description 点选验证，用户需要按照指定顺序点击图片中的文字
 */
import {resetSize} from './../utils/util'
import {aesEncrypt} from './../utils/ase'
import {checkCaptcha, getCaptcha} from '@/api/captcha'

export default {
    name: 'VerifyPoints',
    
    props: {
        // 显示模式：pop-弹出式，fixed-固定式
        mode: {
            type: String,
            default: 'fixed'
        },
        
        // 验证类型
        captchaType: {
            type: String
        },
        
        // 间隔距离
        vSpace: {
            type: Number,
            default: 0
        },
        
        // 图片尺寸
        imgSize: {
            type: Object,
            default() {
                return {
                    width: '310px',
                    height: '155px'
                }
            }
        },
        
        // 验证条尺寸
        barSize: {
            type: Object,
            default() {
                return {
                    width: '310px',
                    height: '40px'
                }
            }
        },
        
        // 默认图片
        defaultImg: {
            type: String,
            default: ''
        }
    },
    
    data() {
        return {
            secretKey: '',                 // 后端返回的AES加密秘钥
            checkNum: 3,                   // 默认需要点击的字数
            fontPos: [],                   // 选中的坐标信息
            checkPosArr: [],               // 用户点击的坐标
            num: 1,                        // 点击的记数
            pointBackImgBase: '',          // 后端获取到的背景图片
            poinTextList: [],              // 后端返回的点击字体顺序
            backToken: '',                 // 后端返回的token值
            setSize: {
                imgHeight: 0,
                imgWidth: 0,
                barHeight: 0,
                barWidth: 0
            },
            tempPoints: [],                // 临时点击点
            text: '',                      // 提示文字
            barAreaColor: undefined,       // 验证条文字颜色
            barAreaBorderColor: undefined, // 验证条边框颜色
            barAreaBackgroundColor: undefined, // 验证条背景颜色
            showRefresh: true,             // 是否显示刷新按钮
            bindingClick: true             // 是否绑定点击事件
        }
    },
    
    computed: {
        resetSize() {
            return resetSize
        }
    },
    
    methods: {
        /**
         * 初始化组件
         */
        init() {
            // 清空数据
            this.fontPos.splice(0, this.fontPos.length)
            this.checkPosArr.splice(0, this.checkPosArr.length)
            this.num = 1
            
            // 获取图片
            this.getPicture()
            
            this.$nextTick(() => {
                this.setSize = this.resetSize(this) // 重新设置宽度高度
                this.$parent.$emit('ready', this)
            })
        },
        
        /**
         * 图片点击事件处理
         */
        canvasClick(e) {
            // 记录点击坐标
            this.checkPosArr.push(this.getMousePos(this.$refs.canvas, e))
            
            // 如果已点击足够的点数
            if (this.num === this.checkNum) {
                this.num = this.createPoint(this.getMousePos(this.$refs.canvas, e))
                
                // 按比例转换坐标值
                this.checkPosArr = this.pointTransfrom(this.checkPosArr, this.setSize)
                
                // 等创建坐标执行完
                setTimeout(() => {
                    // 构造验证参数
                    let captchaVerification = this.secretKey
                        ? aesEncrypt(
                            this.backToken + '---' + JSON.stringify(this.checkPosArr),
                            this.secretKey
                        )
                        : this.backToken + '---' + JSON.stringify(this.checkPosArr)
                    
                    let data = {
                        captchaType: this.captchaType,
                        pointJson: this.secretKey
                            ? aesEncrypt(JSON.stringify(this.checkPosArr), this.secretKey)
                            : JSON.stringify(this.checkPosArr),
                        token: this.backToken
                    }
                    
                    // 发送验证请求
                    checkCaptcha(data).then((res) => {
                        if (res.data.repCode === '0000') {
                            // 验证成功
                            this.barAreaColor = '#fff'
                            this.barAreaBackgroundColor = '#4cae4c'
                            this.text = '验证成功'
                            this.bindingClick = false
                            
                            if (this.mode === 'pop') {
                                setTimeout(() => {
                                    this.$parent.clickShow = false
                                }, 1500)
                            }
                            
                            this.$parent.$emit('success', {captchaVerification})
                        } else {
                            // 验证失败
                            this.$parent.$emit('error', this)
                            this.barAreaColor = '#d9534f'
                            this.barAreaBorderColor = '#d9534f'
                            this.text = '验证失败'
                            
                            setTimeout(() => {
                                this.refresh()
                            }, 700)
                        }
                    })
                }, 400)
            }
            
            // 如果点击数未达到要求
            if (this.num < this.checkNum) {
                this.num = this.createPoint(this.getMousePos(this.$refs.canvas, e))
            }
        },
        
        /**
         * 获取鼠标点击坐标
         * @param {Object} obj - DOM元素
         * @param {Event} e - 点击事件
         * @returns {Object} 坐标对象
         */
        getMousePos(obj, e) {
            let x = e.offsetX
            let y = e.offsetY
            return {x, y}
        },
        
        /**
         * 创建坐标点标记
         * @param {Object} pos - 坐标位置
         * @returns {Number} 更新后的点击数
         */
        createPoint(pos) {
            this.tempPoints.push(Object.assign({}, pos))
            return ++this.num
        },
        
        /**
         * 刷新验证
         */
        refresh() {
            // 清空数据
            this.tempPoints.splice(0, this.tempPoints.length)
            this.barAreaColor = '#000'
            this.barAreaBorderColor = '#ddd'
            this.bindingClick = true
            this.fontPos.splice(0, this.fontPos.length)
            this.checkPosArr.splice(0, this.checkPosArr.length)
            this.num = 1
            
            // 重新获取图片
            this.getPicture()
            this.text = '验证失败'
            this.showRefresh = true
        },
        
        /**
         * 请求背景图片和验证图片
         */
        getPicture() {
            let data = {
                captchaType: this.captchaType,
                clientUid: localStorage.getItem('point'),
                ts: Date.now() // 现在的时间戳
            }
            
            getCaptcha(data).then((res) => {
                if (res.data.repCode === '0000') {
                    this.pointBackImgBase = res.data.repData.originalImageBase64
                    this.backToken = res.data.repData.token
                    this.secretKey = res.data.repData.secretKey
                    this.poinTextList = res.data.repData.wordList
                    this.text = '请依次点击【' + this.poinTextList.join(',') + '】'
                } else {
                    this.text = res.data.repMsg
                }
                
                // 判断接口请求次数是否失效
                if (res.data.repCode === '6201') {
                    this.pointBackImgBase = null
                }
            })
        },
        
        /**
         * 坐标转换函数
         * @param {Array} pointArr - 原始坐标数组
         * @param {Object} imgSize - 图片尺寸
         * @returns {Array} 转换后的坐标数组
         */
        pointTransfrom(pointArr, imgSize) {
            return pointArr.map((p) => {
                let x = Math.round((310 * p.x) / parseInt(imgSize.imgWidth))
                let y = Math.round((155 * p.y) / parseInt(imgSize.imgHeight))
                return {x, y}
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
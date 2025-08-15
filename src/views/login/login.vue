<template>
    <div ref="loginRef" class="login-container">
        <el-form ref="loginForm"
                 :model="loginForm"
                 :rules="loginRules"
                 auto-complete="on"
                 class="login-form"
                 label-position="left"
        >
            <!--标题-->
            <div class="title-container">
                <h3 class="title" style="white-space:pre">AI UNION SYSTEM</h3>
            </div>
            <!--用户名-->
            <el-form-item class="el-form-item" prop="username">
                <span class="svg-container">
                  <svg-icon icon-class="user"/>
                </span>
                <el-input
                    ref="username"
                    v-model="loginForm.username"
                    auto-complete="on"
                    name="username"
                    placeholder="用户名"
                    tabindex="1"
                    type="text"
                />
            </el-form-item>
            <!--密码-->
            <el-form-item class="el-form-item" prop="password">
                <span class="svg-container">
                    <svg-icon icon-class="password"/>
                </span>
                <el-input
                    :key="passwordType"
                    ref="password"
                    v-model="loginForm.password"
                    :type="passwordType"
                    auto-complete="on"
                    class="no-suffix"
                    placeholder="密码"
                    @keyup.enter.native="handleLogin"
                >
                </el-input>
                <span class="show-pwd" @click="showPwd">
                    <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"/>
                </span>
            </el-form-item>
            
            <!--滑块验证-->
            <el-form-item v-if="captchaOnOff" prop="code">
                <SliderVerify ref="sliderVerify" v-model="loginForm.isLock" @change="handlerLock"></SliderVerify>
            </el-form-item>
            
            <!--滑块与点击验证-->
            <el-form-item v-if="captchaOnOff && showVerify">
                <Verify ref="verify"
                        :captchaType="loginForm.captchaType"
                        :imgSize="{ width: '100%', height: '170px' }"
                        :mode="'pop'"
                        @success="captchaCheckSuccess"></Verify>
            </el-form-item>
            
            <!--登录按钮-->
            <el-button :loading="loading" style="width:100%;margin-bottom:30px;" type="primary"
                       @click.native.prevent="handleLogin">登 &nbsp;录
            </el-button>
        </el-form>
    </div>
</template>

<script>
import Verify from '@/components/Verifition/Verify.vue'
import SliderVerify from '@/components/Verifition/SliderVerify.vue'

export default {
    name: 'Login',
    components: {SliderVerify, Verify},
    data() {
        return {
            loginForm: {
                username: 'admin',
                password: 'admin',
                captchaType: '',
                code: '',
                isLock: false,
                rememberMe: false
            },//表单数据
            showVerify: false, // 控制Verify验证显示
            loginRules: {
                username: [{required: true, message: '请输入用户名', trigger: 'blur'}],
                password: [{required: true, message: '请输入密码', trigger: 'blur'}],
            },//表单验证规则
            passwordType: 'password',//密码显示状态
            loading: false,//登录按钮的loading状态
            captchaOnOff: true,//验证码开关
        }
    },
    methods: {
        handleLogin() {
            this.$refs.loginForm.validate(valid => {
                // 表单验证
                if (!valid) {
                    this.$message.error('请填写正确的用户名和密码')
                    return
                }
                // 验证滑块是否已通过
                if (!this.loginForm.isLock || !this.loginForm.code || this.loginForm.code.trim() === '') {
                    this.$message.error('请先完成验证')
                    return
                }
                // 如果Verify验证未完成，则显示验证框
                if (!this.loginForm.code) {
                    this.$refs.verify.show()
                    return
                }
                this.loading = true
                // 执行登录逻辑
                this.$store.dispatch('user/login', this.loginForm).then(() => {
                    this.$message.success('登录成功')
                    this.$router.push({path: this.redirect || '/'})
                    this.loading = false
                }).catch(() => {
                    this.loading = false
                })
            })
        },
        /**
         * 切换密码显示状态：通过三元运算符切换passwordType的值，在password和空字符串之间切换
         * 聚焦密码输入框：使用$nextTick确保DOM更新完成后，将焦点设置到password输入框上
         * 主要用于实现密码输入框的显示/隐藏切换功能。
         */
        showPwd() {
            this.passwordType = this.passwordType === 'password' ? '' : 'password'
            this.$nextTick(() => {
                this.$refs.password.focus()
            })
        },
        /**
         * 随机获取验证码类型
         */
        randomCaptchaType() {
            let captchaType = ['clickWord', 'blockPuzzle']
            // 获取验证码类型
            this.loginForm.captchaType = captchaType[Math.floor(Math.random() * captchaType.length)]
        },
        /**
         * 验证码成功回调
         * @param params
         */
        captchaCheckSuccess(params) {
            this.loginForm.code = params.captchaVerification
        },
        /**
         * 滑块验证成功回调
         */
        handlerLock(data) {
            // 滑块验证成功后仅更新状态
            this.showVerify = data
        }
    }, created() {
        this.randomCaptchaType()
    }
}
</script>

<style lang="scss">
/* 全局样式覆盖，确保el-input的背景色与主题配色匹配 */
.login-container {
    .el-input__inner {
        background-color: transparent !important;
        border: none !important;
        color: white !important;
        caret-color: white !important;
        outline: none !important; /* 移除输入框的outline */
        box-shadow: none !important; /* 移除可能的box-shadow */
    }
    
    /* 移除输入框focus时的蓝框 */
    .el-input__inner:focus {
        outline: none !important;
        box-shadow: none !important;
        border-color: transparent !important;
    }
    
    /* 确保在所有状态下都没有蓝框 */
    .el-input.is-active .el-input__inner {
        outline: none !important;
        box-shadow: none !important;
        border-color: transparent !important;
    }
    
    /* 错误提示信息样式 */
    .el-form-item__error {
        color: #ff6b6b;
        font-size: 14px;
        padding-top: 5px;
    }
    
    /* 验证组件移动端优化 */
    .slider-verify-container {
        touch-action: none; /* 防止触摸设备上的滚动干扰滑块操作 */
        
        /* 响应式调整 */
        @media (max-width: 576px) {
            .slider-verify-track {
                height: 40px; /* 增加滑块高度，提高触摸友好性 */
            }
            
            .slider-verify-button {
                width: 45px; /* 增加滑块按钮宽度 */
                height: 40px; /* 增加滑块按钮高度 */
            }
        }
    }
    
    /* 点击验证组件移动端优化 */
    .verify-container {
        @media (max-width: 576px) {
            .verify-img-panel {
                touch-action: manipulation; /* 优化触摸操作 */
            }
            
            .verify-tips {
                font-size: 14px; /* 调整提示文字大小 */
                padding: 8px 0; /* 增加内边距，提高可点击区域 */
            }
        }
    }
    
    /* 触摸设备上的表单元素优化 */
    @media (hover: none) and (pointer: coarse) {
        .el-form-item__content {
            min-height: 44px; /* 确保足够的触摸区域 */
        }
        
        .el-button {
            min-height: 44px; /* 确保按钮有足够的触摸区域 */
        }
    }
}
</style>

<style lang="scss" scoped>
$bg: #283443;
$cursor: #fff;
$dark_gray: #889aa4;
$light_gray: #eee;
$primary-color: #409EFF;
$gradient-start: #36D1DC;
$gradient-end: #5B86E5;

/* 修复input 背景不协调 和光标变色 */
@supports (-webkit-mask: none) and (not (caret-color: $cursor)) {
    .login-container .el-input input {
        color: $cursor;
    }
}

/* 现代化登录界面样式 */
.login-container {
    height: 100vh;
    width: 100vw;
    background-image: linear-gradient(0deg, #30cfd0 0%, #330867 100%);
    overflow: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    touch-action: manipulation;
    user-select: none;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    
    /* 确保表单始终在视口内 */
    .login-form {
        margin: auto;
        position: relative;
    }
    
    /* 添加网格线条效果 */
    &::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
        background-size: 50px 50px;
        z-index: 0;
        pointer-events: none;
    }
    
    /* 添加斜线装饰 */
    &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: repeating-linear-gradient(
                45deg,
                rgba(255, 255, 255, 0.03) 0px,
                rgba(255, 255, 255, 0.03) 1px,
                transparent 1px,
                transparent 15px
        );
        z-index: 0;
        pointer-events: none;
    }
    
    /* 响应式背景优化 */
    @media (max-width: 768px) {
        &::after {
            background-size: 60px 60px; /* 减少网格密度，提高性能 */
            opacity: 0.8;
        }
        
        &::before {
            background-image: repeating-linear-gradient(
                    45deg,
                    rgba(255, 255, 255, 0.02) 0px,
                    rgba(255, 255, 255, 0.02) 1px,
                    transparent 1px,
                    transparent 20px
            );
        }
    }
    
    @media (max-width: 576px) {
        &::after {
            background-size: 70px 70px;
            opacity: 0.6;
        }
        
        &::before {
            background-image: repeating-linear-gradient(
                    45deg,
                    rgba(255, 255, 255, 0.01) 0px,
                    rgba(255, 255, 255, 0.01) 1px,
                    transparent 1px,
                    transparent 25px
            );
        }
    }
    
    /* 波浪容器 */
    .wave-container {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100px;
        overflow: hidden;
        z-index: 0;
    }
    
    /* 第一个波浪 */
    .wave1 {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 200%;
        height: 100%;
        background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="rgba(255,255,255,0.05)" fill-opacity="1" d="M0,192L48,176C96,160,192,128,288,122.7C384,117,480,139,576,165.3C672,192,768,224,864,213.3C960,203,1056,149,1152,138.7C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>') repeat-x;
        background-size: 50% 100%;
        animation: wave-animation 20s linear infinite;
    }
    
    /* 第二个波浪（稍微不同的形状和透明度） */
    .wave2 {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 200%;
        height: 100%;
        background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="rgba(255,255,255,0.03)" fill-opacity="1" d="M0,160L48,181.3C96,203,192,245,288,229.3C384,213,480,139,576,128C672,117,768,171,864,197.3C960,224,1056,224,1152,208C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>') repeat-x;
        background-size: 50% 100%;
        animation: wave-animation 15s linear infinite reverse;
    }
    
    /* 波浪动画 */
    @keyframes wave-animation {
        0% {
            transform: translateX(0);
        }
        100% {
            transform: translateX(-50%);
        }
    }
    
    /* 响应式波浪动画优化 */
    @media (max-width: 768px) {
        .wave1 {
            animation-duration: 25s; /* 减慢动画速度，减少资源消耗 */
        }
        
        .wave2 {
            animation-duration: 20s;
        }
    }
    
    @media (max-width: 576px) {
        .wave1 {
            animation-duration: 30s;
            height: 80px; /* 减小波浪高度 */
        }
        
        .wave2 {
            animation-duration: 25s;
            height: 80px;
        }
    }
    
    @media (max-width: 375px) {
        .wave1, .wave2 {
            display: none; /* 在最小屏幕上完全隐藏波浪动画 */
        }
    }
    
    .login-form {
        position: relative;
        width: 400px;
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
        text-align: center;
        padding: 40px 35px;
        z-index: 1;
        transition: all 0.3s ease;
        border: 1px solid rgba(255, 255, 255, 0.2);
        overflow: hidden; /* 防止内容溢出 */
        
        /* 只在移动端应用最大宽度 */
        @media (max-width: 992px) {
            max-width: 90vw;
        }
        
        &:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        /* 触摸设备优化 */
        @media (hover: none) and (pointer: coarse) {
            /* 触摸设备上不使用悬停效果，改为触摸时的反馈 */
            &:hover {
                transform: none;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
            }
            
            &:active {
                transform: translateY(-2px);
            }
        }
        
        /* 响应式表单容器优化 */
        @media (max-width: 768px) {
            padding: 40px 30px;
        }
        
        @media (max-width: 576px) {
            padding: 35px 25px;
            max-width: 92%;
        }
        
        @media (max-width: 375px) {
            padding: 30px 20px;
            max-width: 95%;
            border-radius: 12px;
        }
    }
    
    .svg-container {
        color: rgba(255, 255, 255, 0.8);
        vertical-align: middle;
        width: 30px;
        display: inline-block;
        transition: all 0.3s ease;
        padding: 5px 5px 8px 5px;
        position: relative;
        z-index: 1;
        
        &:hover {
            color: white;
        }
        
        svg {
            height: 15px;
            width: 15px;
        }
        
        /* 触摸设备优化 */
        @media (hover: none) and (pointer: coarse) {
            /* 增加图标大小，提高可见性 */
            svg {
                height: 16px;
                width: 16px;
            }
            
            /* 触摸设备上不使用悬停效果 */
            &:hover {
                color: rgba(255, 255, 255, 0.8);
            }
            
            /* 增强触摸反馈 */
            &:active {
                color: white;
            }
        }
        
        /* 响应式调整 */
        @media (max-width: 375px) {
            width: 25px;
            padding: 5px 3px 8px 3px;
            
            svg {
                height: 14px;
                width: 14px;
            }
        }
    }
    
    .title-container {
        position: relative;
        margin-bottom: 40px;
        
        .title {
            font-size: 28px;
            color: white;
            margin: 0 auto 20px;
            text-align: center;
            font-weight: 600;
            letter-spacing: 1px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            position: relative;
            
            &::after {
                content: '';
                position: absolute;
                bottom: -10px;
                left: 50%;
                transform: translateX(-50%);
                width: 50px;
                height: 3px;
                //background: linear-gradient(90deg, $gradient-start, $gradient-end);
                border-radius: 3px;
            }
        }
    }
    
    .show-pwd {
        position: absolute;
        right: 15px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 16px;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        user-select: none;
        transition: all 0.3s ease;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        
        &:hover {
            color: white;
            background-color: rgba(255, 255, 255, 0.1);
            transform: translateY(-50%) scale(1.1);
        }
        
        &:active {
            transform: translateY(-50%) scale(0.95);
        }
        
        svg {
            height: 16px;
            width: 16px;
        }
        
        /* 触摸设备优化 */
        @media (hover: none) and (pointer: coarse) {
            /* 增加触摸区域 */
            width: 32px;
            height: 32px;
            right: 10px;
            
            /* 触摸设备上不使用悬停效果 */
            &:hover {
                color: rgba(255, 255, 255, 0.7);
                background-color: transparent;
                transform: translateY(-50%);
            }
            
            /* 增强触摸反馈 */
            &:active {
                color: white;
                background-color: rgba(255, 255, 255, 0.2);
                transform: translateY(-50%) scale(0.95);
            }
            
            svg {
                height: 18px;
                width: 18px;
            }
        }
    }
    
    .el-form-item {
        margin-top: 30px;
        border: none;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.3s ease;
        position: relative;
        
        &::before {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 0;
            height: 2px;
            background: linear-gradient(90deg, $gradient-start, $gradient-end);
            transition: all 0.3s ease;
        }
        
        &:focus-within {
            background: rgba(255, 255, 255, 0.15);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            
            &::before {
                width: 100%;
            }
            
            .svg-container {
                color: white;
                transform: scale(1.1);
            }
        }
    }
    
    .el-input {
        display: inline-block;
        width: 85%;
        
        :-webkit-autofill {
            -webkit-text-fill-color: #69af7e !important; /*浏览器记住密码的字的颜色*/
            transition: background-color 5000s ease-in-out 0s; /*通过延时渲染背景色变相去除背景颜色*/
            // caret-color: #acfff2;/*光标颜色*/
        }
        
        /* 隐藏 Edge 浏览器中的密码查看图标 */
        input[type="password"]::-ms-reveal {
            display: none;
        }
        
        /* 额外隐藏清除按钮（可选） */
        input[type="password"]::-ms-clear {
            display: none;
        }
        
        input {
            background: transparent;
            border: 0;
            -webkit-appearance: none;
            appearance: none;
            border-radius: 0;
            padding: 12px 25px;
            color: white;
            caret-color: $cursor;
            font-size: 16px;
            transition: all 0.3s ease;
            
            &::placeholder {
                color: rgba(255, 255, 255, 0.6);
                transition: all 0.3s ease;
            }
            
            &:focus {
                &::placeholder {
                    opacity: 0.8;
                    transform: translateX(5px);
                }
            }
            
            /* 处理所有浏览器的自动填充背景色 */
            &:-webkit-autofill,
            &:-webkit-autofill:hover,
            &:-webkit-autofill:focus,
            &:-webkit-autofill:active {
                /* 使用透明的box-shadow来覆盖浏览器默认的背景色 */
                transition: background-color 5000s ease-in-out 0s !important;
                box-shadow: 0 0 0 1000px rgba(40, 52, 67, 0.8) inset !important;
                -webkit-text-fill-color: white !important;
                background-clip: content-box !important;
                caret-color: white !important;
            }
            
            /* 触摸设备优化 */
            @media (hover: none) and (pointer: coarse) {
                /* 增加输入框高度，提高触摸友好性 */
                padding: 14px 25px;
                font-size: 16px;
                
                /* 增加触摸区域 */
                min-height: 24px;
            }
        }
        
        /* 触摸设备上的响应式宽度调整 */
        @media (max-width: 576px) {
            width: 82%;
        }
        
        @media (max-width: 375px) {
            width: 80%;
        }
    }
    
    .el-button {
        margin-top: 15px !important;
        background: linear-gradient(90deg, $gradient-start, $gradient-end);
        border: none;
        border-radius: 8px;
        padding: 12px;
        font-size: 16px;
        font-weight: 600;
        letter-spacing: 1px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        
        &:hover, &:focus {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            opacity: 0.95;
        }
        
        &:active {
            transform: translateY(1px);
        }
        
        /* 触摸设备优化 */
        @media (hover: none) and (pointer: coarse) {
            /* 增加按钮高度，提高触摸友好性 */
            padding: 14px 12px;
            
            /* 触摸设备上不使用悬停效果 */
            &:hover {
                transform: none;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                opacity: 1;
            }
            
            /* 增强触摸反馈 */
            &:active {
                transform: translateY(2px);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                opacity: 0.9;
            }
        }
    }
}

/* 响应式调整 */
@media (max-width: 992px) {
    .login-container .login-form {
        width: 400px;
        padding: 45px 35px;
    }
    
    .login-container .title-container .title {
        font-size: 26px;
    }
}

@media (max-width: 768px) {
    .login-container .login-form {
        width: 380px;
        padding: 40px 30px;
    }
    
    .login-container .title-container .title {
        font-size: 24px;
    }
    
    .login-container .el-form-item {
        margin-top: 25px;
    }
    
    .login-container .el-button {
        padding: 11px;
    }
}

@media (max-width: 576px) {
    .login-container .login-form {
        width: 90%;
        max-width: 350px;
        padding: 35px 20px;
    }
    
    .login-container .title-container {
        margin-bottom: 30px;
    }
    
    .login-container .title-container .title {
        font-size: 22px;
    }
    
    .login-container .el-form-item {
        margin-top: 20px;
    }
    
    .login-container .el-input input {
        padding: 12px 20px;
        font-size: 15px;
    }
    
    .login-container .el-button {
        padding: 10px;
        font-size: 15px;
        margin-top: 10px !important;
    }
    
    /* 简化波浪动画效果，提高性能 */
    .login-container .wave1,
    .login-container .wave2 {
        animation-duration: 30s; /* 减慢动画速度，减少资源消耗 */
    }
    
    /* 增加触摸区域 */
    .login-container .show-pwd {
        width: 30px;
        height: 30px;
        right: 10px;
    }
}

@media (max-width: 375px) {
    .login-container .login-form {
        width: 95%;
        padding: 30px 15px;
    }
    
    .login-container .title-container {
        margin-bottom: 25px;
    }
    
    .login-container .title-container .title {
        font-size: 20px;
    }
    
    .login-container .el-form-item {
        margin-top: 18px;
    }
    
    .login-container .svg-container {
        width: 25px;
        padding: 5px 3px 8px 3px;
    }
    
    .login-container .el-input {
        width: 87%;
    }
    
    .login-container .el-input input {
        padding: 12px 15px;
        font-size: 14px;
    }
    
    .login-container .el-button {
        padding: 10px;
        font-size: 14px;
    }
    
    /* 进一步简化视觉效果 */
    .login-container::after,
    .login-container::before {
        background-size: 40px 40px; /* 减小网格线条密度 */
    }
}
</style>
<template>
    <div align="center" class="navbar">
        <!--折叠菜单-->
        <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar"/>
        <!--面包屑-->
        <Breadcrumb class="breadcrumb-container"></Breadcrumb>
        
        <div class="right-menu">
            <el-dropdown class="avatar-container" trigger="click">
                <div class="avatar-wrapper">
                    <img :src="avatar+'?imageView2/1/w/80/h/80'" alt="avatar" class="user-avatar">
                </div>
                <el-dropdown-menu slot="dropdown" class="user-dropdown">
                    <router-link :to="toPath">
                        <el-dropdown-item style="display: flex; justify-content: space-around">首页</el-dropdown-item>
                    </router-link>
                    <el-dropdown-item @click.native="personalCenter">个人中心</el-dropdown-item>
                    <el-dropdown-item @click.native="rePassword">修改密码</el-dropdown-item>
                    <el-dropdown-item @click.native="logout"><span style="display:block;">退出登录</span>
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
        <!--  修改个人信息  -->
        <system-dialog
            v-dialog-drag
            :height="userDialog.height"
            :title="userDialog.title"
            :visible="userDialog.visible"
            :width="userDialog.width"
            @onClose="onClose"
            @onConfirm="onConfirm"
        >
            <div slot="content">
                <el-form
                    ref="userForm"
                    :model="user"
                    :rules="rules"
                    label-width="80px"
                    size="small"
                    class="user-form"
                >
                    <div :class="{ 'mobile-form': isMobile }" class="form-content">
                        <div :class="{ 'mobile-form-item': isMobile }" class="form-left">
                            <el-form-item label="所属部门">
                                <el-input v-model="user.departmentName" disabled></el-input>
                            </el-form-item>
                            <el-form-item label="所属单位">
                                <el-input v-model="user.companyName" disabled></el-input>
                            </el-form-item>
                            <el-form-item label="用户名">
                                <el-input v-model="user.username" disabled></el-input>
                            </el-form-item>
                            <el-form-item label="姓名" prop="realName">
                                <el-input v-model="user.realName"></el-input>
                            </el-form-item>
                            <el-form-item label="电话" prop="phone">
                                <el-input v-model="user.phone"></el-input>
                            </el-form-item>
                        </div>
                        <div :class="{ 'mobile-form-item': isMobile }" class="form-right">
                            <el-form-item label="昵称">
                                <el-input v-model="user.nickName"></el-input>
                            </el-form-item>
                            <el-form-item label="邮箱">
                                <el-input v-model="user.email"></el-input>
                            </el-form-item>
                            <el-form-item label="微信号">
                                <el-input v-model="user.wechatNumber"></el-input>
                            </el-form-item>
                            <el-form-item label="性别" prop="gender">
                                <el-radio-group v-model="user.gender" v-remove-aria-hidden>
                                    <el-radio :label="0">男</el-radio>
                                    <el-radio :label="1">女</el-radio>
                                </el-radio-group>
                            </el-form-item>
                            <el-form-item label="用户头像">
                                <div class="avatar-container">
                                    <el-upload
                                        :action="uploadUrl"
                                        :before-upload="beforeAvatarUpload"
                                        :data="uploadHeader"
                                        :on-success="handleAvatarSuccess"
                                        :show-file-list="false"
                                        class="avatar-uploader"
                                    >
                                        <img v-if="user.avatar" :src="user.avatar" alt="用户头像" class="avatar-image">
                                        <i v-else class="el-icon-plus avatar-uploader-icon"/>
                                    </el-upload>
                                </div>
                            </el-form-item>
                        </div>
                    </div>
                </el-form>
            </div>
        </system-dialog>
        <!--  修改密码  -->
        <system-dialog
            v-dialog-drag
            :height="rePasswordDialog.height"
            :title="rePasswordDialog.title"
            :visible="rePasswordDialog.visible"
            :width="rePasswordDialog.width"
            @onClose="rePasswordOnClose"
            @onConfirm="rePasswordOnConfirm"
        >
            <!--   作用域插槽   -->
            <div slot="content">
                <el-form ref="rulesPasswordRef"
                         :model="password"
                         :rules="rulesPasswordRules"
                         class="password-form"
                         label-width="90px"
                >
                    <div :class="{ 'mobile-password-form': isMobile }" class="password-form-content">
                        <el-form-item label="初始密码" prop="oldPassword">
                            <el-input v-model="password.oldPassword" placeholder="请输入初始密码"
                                      type="password"></el-input>
                        </el-form-item>
                        <el-form-item label="新密码" prop="newPassword">
                            <el-input v-model="password.newPassword" placeholder="请输入新密码"
                                      type="password"></el-input>
                        </el-form-item>
                        <el-form-item label="确认密码" prop="checkPassword">
                            <el-input v-model="password.checkPassword" placeholder="请再次输入新密码"
                                      type="password"></el-input>
                        </el-form-item>
                    </div>
                </el-form>
            </div>
        </system-dialog>
    </div>
</template>

<script>
import {mapGetters} from 'vuex'
import Hamburger from "@/layout/components/navbar/Hamburger.vue";
import Breadcrumb from "@/layout/components/navbar/Breadcrumb.vue"
import Flex from "@/components/Flex/Flex.vue";
import SystemDialog from "@/components/Dialog/SystemDialog.vue";
import {getToken} from "@/utils/auth";
import {getUserId, resetPassword, updateUser} from "@/api/user";
import config from '@/config/index.js';

export default {
    components: {
        Hamburger, Breadcrumb, Flex, SystemDialog
    },
    computed: {
        ...mapGetters([
            'sidebar',
            'avatar'
        ]),
        toPath() {
            let menu = this.$store.getters.permission_routes
            return menu[menu.length - 1].children[0].path
        }
    },
    data() {
        /**
         * 校验密码
         * @param rule
         * @param value
         * @param callback
         */
        let validatePass = (rule, value, callback) => {
            if (this.password.newPassword === '') {
                callback(new Error('请输入密码'))
            } else {
                callback()
            }
        }
        /**
         * 校验确认密码
         * @param rule 规则
         * @param value 值
         * @param callback 回调
         */
        let validatePass2 = (rule, value, callback) => {
            if (this.password.checkPassword === '') {
                callback(new Error('请再次输入密码'))
            } else if (this.password.newPassword !== this.password.checkPassword) {
                callback(new Error('两次输入密码不一致!'))
            } else if (this.password.oldPassword === this.password.newPassword) {
                callback(new Error('新旧密码不能相同!'))
            } else {
                callback()
            }
        }
        
        /**
         * 检验手机号的规则
         * @param rule
         * @param value
         * @param callback
         */
        let validatePhone = (rule, value, callback) => {
            if (!value) {
                callback(new Error('请输入手机号码'))
                //使用正则表达式进行验证手机号码
            } else if (!/^1[3456789]\d{9}$/.test(value)) {
                callback(new Error('手机号格式不正确'))
            } else {
                callback()
            }
        }
        return {
            isMobile: false, // 添加移动端检测
            rePasswordDialog: {
                title: '修改密码',
                width: 500,
                height: 280,
                visible: false
            },
            password: {
                oldPassword: '',
                newPassword: '',
                checkPassword: ''
            },
            userDialog: {
                title: '个人中心',
                width: 600,
                height: 400,
                visible: false
            },
            user: {
                id: '',
                departmentId: '',
                departmentName: '',
                companyName: '',//单位名称
                companyId: '',
                email: '',
                wechatNumber: '',//微信
                realName: '',
                phone: '',
                nickName: '',
                username: '',
                gender: '',
                avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif'
            },
            rulesPasswordRules: {
                oldPassword: [{required: true, message: '请输入旧密码', trigger: 'blur'}],
                newPassword: [{validator: validatePass, trigger: 'blur'}],
                checkPassword: [{validator: validatePass2, trigger: 'blur'}]
            },
            rules: {
                phone: [{required: true, trigger: 'blur', validator: validatePhone}],
                realName: [{required: true, trigger: 'blur', message: '请填写姓名'}],
                gender: [{required: true, trigger: 'change', message: '请选择性别'}]
            },
            uploadUrl: config.VUE_APP_BASE_API + '/file/upload',
            uploadHeader: {'token': getToken()}
        }
    },
    methods: {
        toggleSideBar() {
            this.$store.dispatch('app/toggleSideBar')
        },
        // 检测设备类型
        checkDevice() {
            this.isMobile = window.innerWidth <= 768
        },
        /**
         * 点击退出登录
         * @returns {Promise<void>}
         */
        async logout() {
            await this.$store.dispatch('user/logout')
            this.$router.push(`/login?redirect=${this.$route.fullPath}`)
        },
        /**
         * 点击个人中心
         */
        personalCenter() {
            this.userDialog.title = '个人中心'
            let userId = this.$store.getters.userId
            getUserId({id: userId}).then(res => {
                this.user = res.data
                this.userDialog.visible = true
            })
            
        },
        /**
         * 点击修改密码
         */
        rePassword() {
            this.$resetForm('rulesPasswordRef', this.password)
            this.rePasswordDialog.visible = true
        },
        /**
         * 关闭修改密码弹窗
         */
        rePasswordOnClose() {
            this.rePasswordDialog.visible = false
        },
        /**
         * 确认修改密码
         */
        rePasswordOnConfirm() {
            this.$refs.rulesPasswordRef.validate(valid => {
                if (valid) {
                    resetPassword(this.password).then(res => {
                        if (res.code === 200) {
                            this.$message({
                                message: '密码修改成功',
                                type: 'success'
                            })
                            this.rePasswordDialog.visible = false
                            this.logout()
                        } else {
                            this.$message({
                                message: res.msg,
                                type: 'error'
                            })
                        }
                    })
                }
            })
        },
        /**
         * 关闭个人中心弹窗
         */
        onClose() {
            this.userDialog.visible = false
        },
        /**
         * 确认个人中心
         */
        onConfirm() {
            this.$refs.userForm.validate(valid => {
                if (valid) {
                    updateUser(this.user).then(res => {
                        if (res.code === 200) {
                            this.$message.success('修改成功')
                            this.userDialog.visible = false
                            this.$store.state.user.avatar = this.user.avatar
                            this.search()
                        } else {
                            this.$message.error(res.message)
                        }
                    })
                }
            })
        },
        /**
         * 上传前校验
         * @param file
         * @returns {boolean}
         */
        beforeAvatarUpload(file) {
            if (file.size > 2097152) {//2M 1024*1024*2
                this.$message.error('图片大小不能超过2M')
                return false
            }
            let img = new Image()
            let url = window.URL || window.webkitURL
            img.src = url.createObjectURL(file)
            img.onload = () => {
                if (img.height < 100 || img.width < 100) {
                    this.$message.error('图片尺寸不能小于100*100')
                    return false
                }
            }
        },
        handleAvatarSuccess(res) {
            this.user.avatar = res.data.filePath
            // 强制重新渲染
            this.$forceUpdate()
        }
    },
    mounted() {
        this.checkDevice()
        window.addEventListener('resize', this.checkDevice)
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.checkDevice)
    },
}
</script>

<style lang="scss" scoped>
.navbar {
    height: 50px;
    overflow: hidden;
    position: relative;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 21, 41, .08);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    
    .hamburger-container {
        line-height: 46px;
        height: 100%;
        cursor: pointer;
        transition: background .3s;
        -webkit-tap-highlight-color: transparent;
        padding: 0 15px;
        margin-right: 10px;
        
        &:hover {
            background: rgba(0, 0, 0, .025)
        }
    }
    
    .breadcrumb-container {
        flex: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    
    .right-menu {
        position: absolute;
        right: 10px;
        display: flex;
        align-items: center;
        height: 100%;
        
        .right-menu-item {
            display: inline-block;
            padding: 0 8px;
            height: 100%;
            font-size: 18px;
            color: #5a5e66;
            vertical-align: text-bottom;
            
            &.hover-effect {
                cursor: pointer;
                transition: background .3s;
                
                &:hover {
                    background: rgba(0, 0, 0, .025)
                }
            }
        }
        
        .avatar-container {
            margin-right: 15px;
            
            .avatar-wrapper {
                position: relative;
                display: flex;
                align-items: center;
                
                .user-avatar {
                    cursor: pointer;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    object-fit: cover;
                }
            }
        }
    }
    
    @media (max-width: 768px) {
        padding: 0 5px;
        
        .hamburger-container {
            padding: 0 10px;
        }
        
        .breadcrumb-container {
            display: none;
        }
        
        .right-menu {
            .avatar-container {
                margin-right: 10px;
                
                .avatar-wrapper .user-avatar {
                    width: 32px;
                    height: 32px;
                }
            }
        }
    }
}

/* 个人中心表单样式 */
.user-form {
    padding: 20px 15px;
}

.form-content {
    display: flex;
    justify-content: space-between;
}

.form-left, .form-right {
    width: 48%;
}

.form-left .el-form-item, .form-right .el-form-item {
    width: 100%;
    margin-bottom: 22px;
}

.avatar-container {
    display: flex;
    align-items: center;
    margin-top: 5px;
}

.avatar-uploader {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: border-color 0.3s;
    width: 100px;
    height: 100px;
    
    &:hover {
        border-color: #409EFF;
    }
}

.avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100%;
    height: 100%;
    line-height: 100px;
    text-align: center;
}

.avatar-tip {
    margin-left: 20px;
    font-size: 12px;
    color: #909399;
    line-height: 1.8;
}

::v-deep .el-form-item__label {
    line-height: 36px;
    padding-right: 15px;
    font-weight: 500;
}

::v-deep .el-input__inner {
    height: 36px;
    line-height: 36px;
    padding: 0 12px;
}

::v-deep .el-radio {
    margin-right: 20px;
    line-height: 36px;
    padding: 0 5px;
}

::v-deep .el-form-item.is-required .el-form-item__label:before {
    margin-right: 6px;
}

/* 移动端适配样式 */
@media screen and (max-width: 768px) {
    .mobile-form {
        flex-direction: column;
    }
    
    .mobile-form-item {
        width: 100%;
    }
    
    .form-content {
        display: block;
    }
    
    .avatar-container {
        display: block;
        text-align: center;
    }
    
    .avatar-tip {
        margin-left: 0;
        margin-top: 10px;
    }
}

/* 修改密码表单样式 */
.password-form {
    padding: 25px 15px 10px;
}

.password-form .el-form-item {
    margin-bottom: 25px;
}

.password-form ::v-deep .el-input__inner {
    padding-left: 15px;
}

.password-form-content {
    width: 320px;
    margin: 0 auto;
}

.password-form-content .el-form-item__label {
    font-weight: 500;
}

/* 修改密码移动端适配样式 */
@media screen and (max-width: 768px) {
    .mobile-password-form {
        width: 100%;
    }
    
    .password-form {
        padding: 15px 15px 5px;
    }
    
    .password-form-content {
        width: 100%;
        margin: 0;
    }
    
    .password-form .el-form-item {
        margin-bottom: 20px;
    }
    
    .password-form ::v-deep .el-form-item__label {
        line-height: 36px;
        padding-right: 15px;
        font-weight: 500;
    }
}
</style>

<template>
    <div>
        <!--
            title：标题
            visible.sync：是否显示
            width：宽度
            before-close：关闭前处理
            close-on-click-modal：可否点击遮罩层关闭
         -->
        <el-dialog
            :before-close="onClose"
            :close-on-click-modal="true"
            :title="title"
            :visible.sync="visible"
            :width="responsiveWidth"
            top="5vh"
        >
            <div :style="{height: responsiveHeight}" class="container">
                <slot name="content"></slot>
            </div>
            <span slot="footer" class="dialog-footer">
          <el-button @click="onClose">取 消</el-button>
          <el-button type="primary" @click="onConfirm">确 定</el-button>
        </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    props: {
        title: {
            type: String,
            default: '标题'
        },
        visible: {
            type: Boolean,
            default: false
        },
        width: {
            type: Number,
            default: 600
        },
        height: {
            type: Number,
            default: 250
        }
    },
    data() {
        return {
            isMobile: false
        }
    },
    computed: {
        responsiveWidth() {
            return this.isMobile ? '95%' : this.width + 'px'
        },
        responsiveHeight() {
            // 在移动设备上可以适当减小高度或使用vh单位
            return this.isMobile ? Math.min(this.height, window.innerHeight * 0.7) + 'px' : this.height + 'px'
        }
    },
    mounted() {
        this.checkDevice()
        window.addEventListener('resize', this.checkDevice)
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.checkDevice)
    },
    methods: {
        checkDevice() {
            this.isMobile = window.innerWidth <= 768
        },
        onClose() {
            this.$emit('onClose')
        },
        onConfirm() {
            this.$emit('onConfirm')
        }
    }
}
</script>

<style lang="scss" scoped>
.container {
    overflow-x: initial;
    overflow-y: auto;
}

.el-dialog__wrapper {
    ::v-deep .el-dialog {
        .el-dialog__header {
            border-bottom: #1f2d3d;
            //background-color: #1890ff;
            
            .el-dialog__title {
                color: #000000;
                font-size: 15px;
                font-weight: 700;
            }
            
            .el-dialog__close {
                color: #bdbec2;
            }
            
            border-bottom: 1px solid #e8eaec;
        }
        
        .el-dialog__body {
            padding: 10px 10px !important;
        }
        
        .el-dialog__footer {
            border-top: 1px solid #e8eaec !important;
            padding: 10px !important;
        }
    }
}

/* 移动端样式优化 */
@media screen and (max-width: 768px) {
    ::v-deep .el-dialog {
        margin-top: 10vh !important;
        
        .el-dialog__header {
            padding: 15px 15px 10px !important;
        }
        
        .el-dialog__body {
            padding: 10px 15px !important;
        }
        
        .el-dialog__footer {
            padding: 10px 15px !important;
        }
        .el-dialog__headerbtn {
            top: 15px !important;
        }
    }
}
</style>

<template>
    <el-container :style="{height: containerHeight + 'px'}">
        <el-main>
            <!--  条件检索区域  -->
            <div :class="{'is-mobile': isMobile}" class="search-container">
                <!-- 移动端折叠面板 -->
                <el-collapse v-if="isMobile" v-model="searchCollapse" class="mobile-search-collapse">
                    <el-collapse-item name="1">
                        <template slot="title">
                            <div class="collapse-title-container">
                                <i class="el-icon-search search-icon"></i>
                                <span>搜索条件</span>
                                <el-tag v-if="searchModel.companyName || searchModel.phone" 
                                       size="mini" type="warning" class="search-status-tag">
                                    <i class="el-icon-info"></i> 已设置条件
                                </el-tag>
                            </div>
                            <div v-if="searchModel.companyName || searchModel.phone" class="collapse-summary">
                                <template v-if="searchModel.companyName">单位名称: {{ searchModel.companyName }}</template>
                                <template v-if="searchModel.phone">
                                    {{ searchModel.companyName ? ' / ' : '' }}电话: {{ searchModel.phone }}
                                </template>
                            </div>
                        </template>
                        <el-form ref="searchForm" :inline="false" class="mobile-search-form" label-width="80px"
                                 size="small">
                            <el-form-item label="单位名称">
                                <el-input v-model="searchModel.companyName" clearable
                                          placeholder="请输入单位名称"></el-input>
                            </el-form-item>
                            <el-form-item label="单位电话">
                                <el-input v-model="searchModel.phone" clearable placeholder="请输入单位电话"></el-input>
                            </el-form-item>
                            <el-form-item class="mobile-button-group">
                                <div class="button-grid">
                                    <el-button v-if="hasPermission('sys:company:check')" icon="el-icon-search" size="small"
                                               type="primary" @click="search">查询
                                    </el-button>
                                    <el-button v-if="hasPermission('sys:company:check')" icon="el-icon-refresh-right"
                                               size="small" @click="resetValue">
                                        重置
                                    </el-button>
                                    <el-button v-if="hasPermission('sys:company:add')"
                                               icon="el-icon-plus"
                                               size="small"
                                               type="success"
                                               @click="openAddWindow">新增
                                    </el-button>
                                </div>
                            </el-form-item>
                        </el-form>
                    </el-collapse-item>
                </el-collapse>
            
            <!-- 桌面端常规表单 -->
            <el-form v-else ref="searchForm" :inline="true" class="search-form" label-width="80px" size="small">
                <el-form-item label="单位名称">
                    <el-input v-model="searchModel.companyName" clearable placeholder="请输入单位名称"></el-input>
                </el-form-item>
                <el-form-item label="单位电话">
                    <el-input v-model="searchModel.phone" clearable placeholder="请输入单位电话"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button v-if="hasPermission('sys:company:check')" icon="el-icon-search" size="small"
                               type="primary" @click="search">查询
                    </el-button>
                    <el-button v-if="hasPermission('sys:company:check')" icon="el-icon-refresh-right" size="small"
                               @click="resetValue">
                        重置
                    </el-button>
                    <el-button v-if="hasPermission('sys:company:add')"
                               icon="el-icon-plus"
                               size="small"
                               type="success"
                               @click="openAddWindow">新增
                    </el-button>
                </el-form-item>
            </el-form>
        </div>

        <!--  数据表格  -->
        <el-table
                ref="table"
                v-loading="loading"
                :data="tableData"
                :height="tableHeight"
                :size="isMobile ? 'mini' : 'medium'"
                border
                stripe>
            <el-table-column
                    align="center"
                    label="序号"
                    type="index"
                    width="60">
            </el-table-column>
            <el-table-column
                    align="center"
                    label="单位名称"
                    prop="companyName"
                    show-overflow-tooltip>
            </el-table-column>
            <el-table-column
                    align="center"
                    label="单位地址"
                    prop="address"
                    show-overflow-tooltip>
            </el-table-column>
            <el-table-column
                    align="center"
                    label="单位电话"
                    prop="phone"
                    show-overflow-tooltip>
            </el-table-column>
            <el-table-column
                    align="center"
                    label="联系人"
                    prop="contactName"
                    show-overflow-tooltip>
            </el-table-column>
            <el-table-column
                    align="center"
                    label="联系电话"
                    prop="contactPhone"
                    show-overflow-tooltip>
            </el-table-column>
            <el-table-column
                    align="center"
                    label="操作"
                    :width="isMobile ? 60 : 200">
                <template slot-scope="scope">
                    <!-- 移动端操作下拉菜单 -->
                    <el-dropdown v-if="isMobile" size="small" @command="handleMobileCommand">
                        <el-button type="primary" size="mini">
                            操作<i class="el-icon-arrow-down el-icon--right"></i>
                        </el-button>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item v-if="hasPermission('sys:company:edit')" 
                                            :command="{action: 'edit', row: scope.row}">
                                <i class="el-icon-edit"></i> 编辑
                            </el-dropdown-item>
                            <el-dropdown-item v-if="hasPermission('sys:company:delete')" 
                                            :command="{action: 'delete', row: scope.row}">
                                <i class="el-icon-delete"></i> 删除
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                    
                    <!-- 桌面端操作按钮 -->
                    <template v-else>
                        <el-button v-if="hasPermission('sys:company:edit')"
                                   icon="el-icon-edit"
                                   size="mini"
                                   type="primary"
                                   @click="handleEdit(scope.row)">编辑
                        </el-button>
                        <el-button v-if="hasPermission('sys:company:delete')"
                                   icon="el-icon-delete"
                                   size="mini"
                                   type="danger"
                                   @click="handleDelete(scope.row)">删除
                        </el-button>
                    </template>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
                :current-page.sync="searchModel.pageNo"
                :page-size.sync="searchModel.pageSize"
                :page-sizes="isMobile ? [10, 20, 30] : [10, 20, 30, 40, 50]"
                :total="total"
                :small="isMobile"
                background
                :layout="isMobile ? 'total, prev, pager, next' : 'total, sizes, prev, pager, next, jumper'"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange">
        </el-pagination>
        
        <!--  新增窗口  -->
        <system-dialog
            v-dialog-drag
            :height="companyDialog.height"
            :title="companyDialog.title"
            :visible="companyDialog.visible"
            :width="dialogWidth"
            @onClose="onClose"
            @onConfirm="onConfirm"
        >
            <div slot="content">
                <el-form
                    ref="companyForm"
                    :inline="false"
                    :model="company"
                    :rules="rules"
                    :class="{'mobile-company-form': isMobile}"
                    :label-position="isMobile ? 'top' : 'right'"
                    size="small"
                    :label-width="isMobile ? '70px' : '80px'"
                    class="company-form"
                >
                    <el-form-item label="单位名称" prop="companyName">
                        <el-input v-model="company.companyName" clearable size="small"></el-input>
                    </el-form-item>
                    <el-form-item label="单位电话" prop="phone">
                        <el-input v-model="company.phone"></el-input>
                    </el-form-item>
                    <el-form-item label="单位地址">
                        <el-input v-model="company.address" size="small"></el-input>
                    </el-form-item>
                    <el-form-item label="公司图标" prop="companyLogo">
                        <div :class="{'mobile-upload-container': isMobile}" class="upload-container">
                            <el-upload
                                :action="uploadUrl"
                                :before-upload="beforeAvatarUpload"
                                :data="uploadHeader"
                                :on-success="handleAvatarSuccess"
                                :show-file-list="false"
                                class="avatar-uploader"
                            >
                                <img
                                    v-if="company.logo" :src="company.logo" alt=""
                                    class="el-upload-list__item-thumbnail" style="width: 100px;height: 100px"
                                >
                                <i v-else class="el-icon-plus avatar-uploader-icon"/>
                            </el-upload>
                        </div>
                    </el-form-item>
                </el-form>
            </div>
        </system-dialog>
    </el-main>
</el-container>
</template>

<script>
import {addCompany, deleteCompany, getCompanyList, updateCompany} from '@/api/company'
import SystemDialog from '@/components/Dialog/SystemDialog.vue'
import Flex from '@/components/Flex/Flex.vue'
import {getToken} from '@/utils/auth'
import hasPermission from '@/router/permission'

export default {
    components: {Flex, SystemDialog},
    data() {
        return {
            isMobile: false,
            loading: true,
            searchCollapse: ['1'], // 控制移动端搜索折叠面板的状态，默认展开
            searchModel: { //查询条件
                pageNo: 1,
                pageSize: 20,
                companyName: '',
                phone: ''
            },
            companyDialog: {
                title: '',
                width: 500,
                height: 350,
                visible: false
            },
            company: {
                id: '',
                companyName: '',
                phone: '',
                address: '',
                logo: ''
            },
            rules: {
                companyName: [{required: true, trigger: 'blur', message: '请输入单位名称'}],
                phone: [{required: true, trigger: 'blur', message: '请输入单位电话'}]
            },
            tableData: [],//表格数据
            tableHeight: 0,//表格高度
            containerHeight: 0,//容器高度
            total: 0,//总条数,
            //上传需要携带的数据
            uploadHeader: {'token': getToken()},
            uploadUrl: process.env.VUE_APP_BASE_API + '/file/upload',
            resizeFlag: null // 用于防抖resize事件
        }
    },
    computed: {
        /**
         * 动态计算对话框宽度
         */
        dialogWidth() {
            return this.isMobile ? window.innerWidth * 0.95 : this.companyDialog.width
        }
    },
    watch: {
        'isMobile'() {
            this.getTableHeight()
        },
        'searchCollapse'() {
            // 当搜索折叠面板状态变化时，重新计算表格高度
            this.$nextTick(() => {
                this.getTableHeight()
            })
        }
    },
    methods: {
        /**
         * 检测设备类型
         */
        checkDevice() {
            this.isMobile = window.innerWidth <= 768
        },
        hasPermission,
        /**
         * 查询单位数据列表
         */
        search() {
            getCompanyList(this.searchModel).then(res => {
                if (res.code === 200) {
                    this.tableData = res.data.records
                    this.total = res.data.total
                    this.loading = false
                    
                    // 移动端下执行搜索后折叠搜索面板
                    if (this.isMobile) {
                        this.searchCollapse = []
                        this.$nextTick(() => {
                            this.getTableHeight()
                        })
                    }
                }
            })
        },
        /**
         * 重置查询条件
         */
        resetValue() {
            this.searchModel.companyName = ''
            this.searchModel.phone = ''
            this.search()
        },
        /**
         * 新增单位
         */
        openAddWindow() {
            this.companyDialog.visible = true
            this.companyDialog.title = '新增'
        },
        /**
         * 编辑单位
         */
        handleEdit(row) {
            //数据回显
            this.$objCopy(row, this.company)
            //设置标题
            this.companyDialog.title = '修改单位'
            //显示
            this.companyDialog.visible = true
        },
        /**
         * 删除单位
         */
        async handleDelete(row) {
            let confirm = await this.$myConfirm(`确定要删除单位：${row.companyName}吗?`)
            if (confirm) {
                deleteCompany({id: row.id}).then(res => {
                    if (res.code === 200) {
                        this.$message.success('删除成功')
                        this.search()
                    } else {
                        this.$message.error(res.message)
                    }
                })
            }
        },
        /**
         * 分页大小改变
         */
        handleSizeChange(size) {
            this.searchModel.pageSize = size
            this.search(this.searchModel)
        },
        /**
         * 分页改变
         */
        handleCurrentChange(pageNo) {
            this.searchModel.pageNo = pageNo
            this.search(this.searchModel)
        },
        /**
         * 关闭窗口
         */
        onClose() {
            this.companyDialog.visible = false
        },
        /**
         * 确认新增或编辑
         */
        onConfirm() {
            //表单验证
            this.$refs.companyForm.validate(valid => {
                if (valid) {
                    if (this.company.id === '') {
                        addCompany(this.company).then(res => {
                            if (res.code === 200) {
                                this.$message.success('新增成功')
                                this.companyDialog.visible = false
                                this.search()
                            }
                        })
                    } else {
                        updateCompany(this.company).then(res => {
                            if (res.code === 200) {
                                this.$message.success('修改成功')
                                this.companyDialog.visible = false
                                this.search()
                            }
                        })
                    }
                }
            })
        },
        /**
         * 上传前校验
         * @param file 文件信息
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
        /**
         * 上传成功回调
         * @param res
         */
        handleAvatarSuccess(res) {
            this.company.logo = res.data.filePath
            // 强制重新渲染
            this.$forceUpdate()
        },
        /**
         * 移除图片
         */
        handleRemove() {
            this.company.logo = ''
        },
        /**
         * 获取表格高度
         */
        getTableHeight() {
            this.$nextTick(() => {
                let searchContainerHeight = 0;
                if (this.isMobile) {
                    // 移动端：考虑搜索折叠面板的高度
                    searchContainerHeight = this.$refs.searchContainer ? this.$refs.searchContainer.offsetHeight : 0;
                } else {
                    // 桌面端：考虑固定搜索表单的高度
                    searchContainerHeight = 60; // 固定搜索表单高度
                }
                
                // 计算容器高度
                this.containerHeight = window.innerHeight - 50; // 减去导航栏高度
                
                // 计算表格高度
                this.tableHeight = this.containerHeight - searchContainerHeight - 180;
            });
        },
        
        // 移动端操作命令处理
        handleMobileCommand(command) {
            switch (command.action) {
                case 'edit':
                    this.handleEdit(command.row);
                    break;
                case 'delete':
                    this.handleDelete(command.row);
                    break;
            }
        }
        
    },
    mounted() {
        /**
         * 初始检测设备类型
         */
        this.checkDevice()
        
        /**
         * 挂载window.onresize事件(动态设置table高度和检测设备类型)
         */
        let _this = this
        window.onresize = () => {
            if (_this.resizeFlag) {
                clearTimeout(_this.resizeFlag)
            }
            _this.resizeFlag = setTimeout(() => {
                _this.getTableHeight()
                _this.checkDevice()
                _this.resizeFlag = null
            }, 100)
        }
        
        // 监听窗口大小变化
        window.addEventListener('resize', this.getTableHeight);
    },
    
    beforeDestroy() {
        // 移除事件监听
        window.removeEventListener('resize', this.getTableHeight);
    },
    created() {
        this.search()
        this.getTableHeight()
    }
}
</script>

<style lang="scss" scoped>
/* 表格样式优化 */
::v-deep .el-table {
    font-size: 14px;
    
    .cell {
        padding: 8px 5px;
    }
    
    &.el-table--mobile {
        .el-table__body td {
            padding: 5px 0;
        }
        
        .el-button.is-circle {
            padding: 7px;
        }
    }
}

/* 操作按钮样式优化 */
.operation-buttons {
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
    
    .el-button {
        margin: 0 2px;
        padding: 5px 8px;
        
        &:first-child {
            margin-left: 0;
        }
        
        &:last-child {
            margin-right: 0;
        }
    }
}

/* 分页组件样式 */
::v-deep .el-pagination {
    white-space: normal;
    padding: 5px 0;
    
    &.is-background .btn-next,
    &.is-background .btn-prev,
    &.is-background .el-pager li {
        margin: 0 3px;
    }
    
    .el-pagination__total {
        display: inline-block;
        margin-bottom: 5px;
    }
}

/* 响应式优化 - 针对中等屏幕 */
@media screen and (max-width: 1200px) {
    .operation-buttons {
        flex-direction: column;
        
        .el-button {
            margin: 2px 0;
            width: 100%;
        }
    }
}

/* 搜索容器样式 */
.search-container {
    position: relative;
    margin-bottom: 20px;
    
    &.is-mobile {
        margin-bottom: 10px;
    }
}

/* 移动端搜索折叠面板样式 */
.mobile-search-collapse {
    margin-bottom: 15px;
    border-radius: 4px;
    overflow: hidden;
    
    ::v-deep .el-collapse-item__header {
        background-color: #f5f7fa;
        padding: 0 15px;
        border-radius: 4px;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        font-size: 14px;
        
        .collapse-title-container {
            display: flex;
            align-items: center;
            font-weight: 500;
        }
        
        .search-icon {
            margin-right: 5px;
            color: #409EFF;
        }
        
        .search-status-tag {
            margin-left: 8px;
            height: 20px;
            line-height: 20px;
        }
        
        .collapse-summary {
            font-size: 12px;
            color: #909399;
            margin-left: 10px;
            width: 100%;
            margin-top: 5px;
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
    
    ::v-deep .el-collapse-item__content {
        padding: 10px;
    }
}

/* 移动端搜索表单样式 */
.mobile-search-form {
    .el-form-item {
        width: 100%;
        margin-right: 0;
        margin-bottom: 10px;
        
        .el-input {
            width: 100%;
        }
    }
    
    .mobile-button-group {
        text-align: center;
        margin-top: 15px;
        
        .button-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
            width: 100%;
        }
        
        .button-grid .el-button {
            width: 100%;
        }
    }
}

/* 移动端新增按钮样式 */
.mobile-add-button {
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 100;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 公司表单样式 */
.company-form {
    padding: 0 10px;
}

/* 移动端公司表单样式 */
.mobile-company-form {
    ::v-deep .el-form-item {
        margin-bottom: 15px;
        
        .el-form-item__label {
            padding-bottom: 5px;
            line-height: 1.2;
        }
        
        .el-form-item__content {
            line-height: 1.2;
        }
        
        .el-input {
            width: 100%;
        }
    }
}

/* 上传容器样式 */
.upload-container {
    display: flex;
    align-items: center;
    
    &.mobile-upload-container {
        flex-direction: column;
        align-items: flex-start;
        
        .upload-tip {
            margin-top: 10px;
            color: #909399;
            font-size: 12px;
            line-height: 1.4;
        }
    }
}

.avatar-uploader {
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    overflow: hidden;
    
    &:hover {
        border-color: #409EFF;
    }
}

.el-upload {
    width: 100px;
    height: 100px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
}

.avatar {
    width: 100px;
    height: 100px;
    display: block;
}
</style>
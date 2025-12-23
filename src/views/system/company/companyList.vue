<template>
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
                        <div class="mobile-button-group">
                            <el-button v-if="hasPermission('sys:company:check')" icon="el-icon-search" size="small"
                                       type="primary" @click="search">查询
                            </el-button>
                            <el-button v-if="hasPermission('sys:company:check')" icon="el-icon-refresh-right"
                                       size="small" @click="resetValue">重置
                            </el-button>
                            <el-button v-if="hasPermission('sys:company:add')"
                                       icon="el-icon-plus"
                                       size="small"
                                       type="success"
                                       @click="openAddWindow">新增
                            </el-button>
                        </div>
                    </el-form>
                </el-collapse-item>
            </el-collapse>
            
            <!-- 桌面端常规表单 -->
            <el-form v-else ref="searchForm" :inline="true" label-width="80px" size="small">
                <el-form-item>
                    <el-input v-model="searchModel.companyName" placeholder="请输入单位名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="searchModel.phone" placeholder="请输入单位电话"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button v-if="hasPermission('sys:company:check')" icon="el-icon-search" type="primary"
                               @click="search">查询
                    </el-button>
                    <el-button v-if="hasPermission('sys:company:check')" icon="el-icon-refresh-right"
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
        <!--  表单区域  -->
        <el-table
            v-loading="loading"
            :data="tableData"
            :height="tableHeight"
            border
            stripe
            :class="{'el-table--mobile': isMobile}"
            :header-cell-style="isMobile ? {padding: '5px 0'} : {}"
            :size="isMobile ? 'mini' : 'medium'"
            style="width: 100%; margin-bottom: 10px"
        >
            <el-table-column align="center" label="序号" prop="id" width="80">
                <template v-slot="scope">{{ scope.$index + 1 }}</template>
            </el-table-column>
            <el-table-column align="center" label="单位名称" prop="companyName"></el-table-column>
            <el-table-column align="center" label="单位电话" prop="phone"></el-table-column>
            <el-table-column :min-width="isMobile ? 150 : 'auto'" :show-overflow-tooltip="true" align="center"
                             label="单位地址"
                             prop="address"></el-table-column>
            <el-table-column :width="isMobile ? 80 : 'auto'" align="center" label="单位图标" prop="address">
                <template v-slot="scope">
                    <el-tooltip content="Top Center 提示文字" effect="dark" placement="top">
                        <div slot="content" style="text-align: center;min-width:180px;">
                            <img :src="scope.row.logo" alt="" style="width:100px;height: 100px"/>
                        </div>
                        <el-button
                            size="mini"
                        >查看
                        </el-button>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column v-if="!isMobile" align="center" label="创建人" prop="createUserName"></el-table-column>
            <el-table-column v-if="!isMobile" align="center" label="创建时间" prop="createTime"></el-table-column>
            <el-table-column :width="isMobile ? 80 : 'auto'" align="center" label="操作">
                <template v-slot="scope">
                    <!-- 桌面端显示按钮 -->
                    <template v-if="!isMobile">
                        <div class="operation-buttons">
                            <el-button
                                v-if="hasPermission('sys:company:edit')"
                                icon="el-icon-edit-outline"
                                size="mini"
                                type="primary"
                                @click="handleEdit(scope.row)"
                            >编辑
                            </el-button>
                            <el-button
                                v-if="hasPermission('sys:company:delete')"
                                icon="el-icon-delete-solid"
                                size="mini"
                                type="danger"
                                @click="handleDelete(scope.row)"
                            >删除
                            </el-button>
                        </div>
                    </template>
                    
                    <!-- 移动端显示下拉菜单 -->
                    <el-dropdown v-else trigger="click">
                        <el-button size="mini" type="primary">
                            操作<i class="el-icon-arrow-down el-icon--right"></i>
                        </el-button>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item
                                v-if="hasPermission('sys:company:edit')"
                                @click.native="handleEdit(scope.row)"
                            >
                                <i class="el-icon-edit-outline"></i> 编辑
                            </el-dropdown-item>
                            <el-dropdown-item
                                v-if="hasPermission('sys:company:delete')"
                                @click.native="handleDelete(scope.row)"
                            >
                                <i class="el-icon-delete-solid"></i> 删除
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </template>
            </el-table-column>
        </el-table>
        <flex justify="end">
            <!-- 分页工具栏 -->
            <el-pagination
                :current-page="searchModel.pageNo"
                :page-size="20"
                :page-sizes="[10, 20, 30, 40, 50]"
                :total="total"
                background
                :layout="isMobile ? 'total, prev, pager, next' : 'total, sizes, prev, pager, next, jumper'"
                :small="isMobile"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            >
            </el-pagination>
        </flex>
        
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
                                class="avatar-uploader">
                                <img
                                    v-if="company.logo" :src="company.logo" alt=""
                                    class="el-upload-list__item-thumbnail" style="width: 100px;height: 100px">
                                <i v-else class="el-icon-plus avatar-uploader-icon"/>
                            </el-upload>
                        </div>
                    </el-form-item>
                </el-form>
            </div>
        </system-dialog>
    </el-main>
</template>

<script>
import {addCompany, deleteCompany, getCompanyList, updateCompany} from '@/api/company'
import SystemDialog from '@/components/Dialog/SystemDialog.vue'
import Flex from '@/components/Flex/Flex.vue'
import {getToken} from '@/utils/auth'
import hasPermission from '@/router/permission'

// 获取API基础地址
const getBaseAPI = () => window.SYSTEM_CONFIG?.VUE_APP_BASE_API || ''

export default {
    components: {Flex, SystemDialog},
    data() {
        return {
            isMobile: false,
            loading: true,
            searchCollapse: [], // 控制移动端搜索折叠面板的状态，默认收起
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
            total: 0,//总条数,
            //上传需要携带的数据
            uploadHeader: {'token': getToken()},
            uploadUrl: getBaseAPI() + '/file/upload',
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
            // this.$nextTick(() => {
            //     this.getTableHeight()
            // })
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
            this.$resetForm('companyForm', this.company)
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
            console.log('删除单位', row)
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
            // 计算表格高度
            let offset = 0;
            
            // 移动端下，考虑搜索折叠面板的状态
            if (this.isMobile) {
                // 搜索面板折叠时的偏移量较小
                offset = this.searchCollapse.length > 0 ? 370 : 180;
                
                // 考虑底部固定按钮的空间
                offset += 80; // 增加固定分页组件的高度
            } else {
                // 桌面端的偏移量
                offset = 210;
            }
            
            // 计算表格高度
            let tableHeight = window.innerHeight - offset;
            
            // 设置最小高度，同时设置最大高度以避免滚动条
            this.tableHeight = Math.min(Math.max(tableHeight, 250), window.innerHeight - 250);
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
    },
    created() {
        this.search()
        this.getTableHeight()
    }
}
</script>

<style lang="scss" scoped>
/* 公司表单样式 */
.company-form {
    padding: 0 10px;
}

.el-upload {
    width: 100px;
    height: 100px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.avatar {
    width: 100px;
    height: 100px;
    display: block;
}
</style>
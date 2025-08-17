<template>
    <el-main>
        <!--  条件检索区域  -->
        <!--  :inline 是否为行内 ref: 表单的ref label-width: 表单的label宽度 size: 表单的尺寸  -->
        <el-form ref="searchForm" :inline="true" label-width="80px" size="small">
            <el-form-item>
                <el-input v-model="searchModel.companyName" placeholder="请输入单位名称"></el-input>
            </el-form-item>
            <el-form-item>
                <el-input v-model="searchModel.phone" placeholder="请输入单位电话"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button v-if="hasPermission('sys:company:select')" icon="el-icon-search" type="primary"
                           @click="search">查询
                </el-button>
                <el-button v-if="hasPermission('sys:company:select')" icon="el-icon-refresh-right" @click="resetValue">
                    重置
                </el-button>
                <el-button v-if="hasPermission('sys:company:add')" icon="el-icon-plus" type="success"
                           @click="openAddWindow">新增
                </el-button>
            </el-form-item>
        </el-form>
        <!--  表单区域  -->
        <el-table
            v-loading="loading"
            :data="tableData"
            :height="tableHeight"
            border
            stripe
            style="width: 100%; margin-bottom: 10px"
        >
            <el-table-column align="center" label="序号" prop="id" width="80">
                <template v-slot="scope">{{ scope.$index + 1 }}</template>
            </el-table-column>
            <el-table-column align="center" label="单位名称" prop="companyName"></el-table-column>
            <el-table-column align="center" label="单位电话" prop="phone"></el-table-column>
            <el-table-column align="center" label="单位地址" prop="address"></el-table-column>
            <el-table-column align="center" label="单位图标" prop="address">
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
            <el-table-column align="center" label="创建人" prop="createUserName"></el-table-column>
            <el-table-column align="center" label="创建时间" prop="createTime"></el-table-column>
            <el-table-column align="center" label="操作">
                <template v-slot="scope">
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
                layout="total, sizes, prev, pager, next, jumper"
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
            :width="companyDialog.width"
            @onClose="onClose"
            @onConfirm="onConfirm"
        >
            <div slot="content">
                <el-form
                    ref="companyForm"
                    :inline="false"
                    :model="company"
                    :rules="rules"
                    label-width="80px"
                    size="small"
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
                        <!-- 用户头像：待补充 -->
                        <el-upload
                            :action="uploadUrl"
                            :before-upload="beforeAvatarUpload"
                            :data="uploadHeader"
                            :on-success="handleAvatarSuccess"
                            :show-file-list="false"
                            border
                            class="avatar-uploader"
                        >
                            <img
                                v-if="company.logo" :src="company.logo" alt=""
                                class="el-upload-list__item-thumbnail" style="width: 100px;height: 100px"
                            >
                            <i v-else class="el-icon-plus avatar-uploader-icon"/>
                            <span class="el-upload-list__item-actions">
                  <span
                      v-if="company.logo===''"
                      class="el-upload-list__item-delete"
                      @click="handleRemove(company.logo)"
                  >
                    <i class="el-icon-delete"></i>
                  </span>
                 </span>
                        </el-upload>
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

export default {
    components: {Flex, SystemDialog},
    data() {
        return {
            loading: true,
            searchModel: { //查询条件
                pageNo: 1,//
                pageSize: 20,
                companyName: '',
                phone: ''
            },
            companyDialog: {
                title: '',
                width: 500,
                height: 300,
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
            uploadUrl: process.env.VUE_APP_BASE_API + '/file/upload'
        }
    },
    methods: {
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
         * @param file
         */
        handleRemove(file) {
        },
        /**
         * 获取表格高度
         */
        getTableHeight() {
            let tableH = 210 //距离页面下方的高度
            let tableHeight = window.innerHeight - tableH
            if (tableHeight <= 300) {
                this.tableHeight = 300
            } else {
                this.tableHeight = window.innerHeight - tableH
            }
        }
        
    },
    mounted() {
        /**
         * 挂载window.onresize事件(动态设置table高度)
         */
        let _this = this
        window.onresize = () => {
            if (_this.resizeFlag) {
                clearTimeout(_this.resizeFlag)
            }
            _this.resizeFlag = setTimeout(() => {
                _this.getTableHeight()
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
.avatar-uploader {
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
}

.el-upload {
    width: 100px;
    height: 100px;
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

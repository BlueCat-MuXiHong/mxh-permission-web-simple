<template>
    <el-main>
        <!-- 查询条件 -->
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
                    <el-form
                        ref="searchForm"
                        :inline="false"
                        class="mobile-search-form"
                        label-width="80px"
                        size="small"
                    >
                        <el-form-item label="角色名称">
                            <el-input v-model="searchModel.roleName" clearable placeholder="请输入角色名称"/>
                        </el-form-item>
                        <el-form-item class="mobile-button-group">
                            <el-button v-if="hasPermission('sys:role:add')" icon="el-icon-plus" size="small"
                                       type="success" @click="openAddWindow">新增
                            </el-button>
                            <el-button v-if="hasPermission('sys:role:search')" icon="el-icon-refresh-right"
                                       size="small" @click="resetValue">
                                重置
                            </el-button>
                            <el-button v-if="hasPermission('sys:role:search')" icon="el-icon-search" size="small"
                                       type="primary" @click="search">查询
                            </el-button>
                        </el-form-item>
                    </el-form>
                </el-collapse-item>
            </el-collapse>
            
            <!-- 桌面端常规表单 -->
            <el-form
                v-else
                ref="searchForm"
                :inline="true"
                :model="searchModel"
                label-width="80px"
                size="small"
            >
                <el-form-item>
                    <el-input v-model="searchModel.roleName" placeholder="请输入角色名称"/>
                </el-form-item>
                <el-form-item>
                    <el-button v-if="hasPermission('sys:role:add')" icon="el-icon-plus" type="success"
                               @click="openAddWindow">新增
                    </el-button>
                    <el-button v-if="hasPermission('sys:role:search')" icon="el-icon-refresh-right" @click="resetValue">
                        重置
                    </el-button>
                    <el-button v-if="hasPermission('sys:role:search')" icon="el-icon-search" type="primary"
                               @click="search()">查询
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
        
        <!--  表格  -->
        <el-table
            v-loading="loading"
            :data="roleList"
            :height="tableHeight"
            :class="{'el-table--mobile': isMobile}"
            :header-cell-style="isMobile ? {padding: '5px 0'} : {}"
            :size="isMobile ? 'mini' : 'medium'"
            border
            stripe
            style="width: 100%; margin-bottom: 10px"
        >
            <el-table-column
                align="center"
                label="序号"
                prop="id"
                :width="isMobile ? 60 : 100"
            >
                <template v-slot="scope">{{ scope.$index + 1 }}</template>
            </el-table-column>
            <el-table-column align="center" label="角色名称" prop="roleName"></el-table-column>
            <el-table-column align="center" label="角色编码" prop="roleCode"></el-table-column>
            <el-table-column
                :min-width="isMobile ? 150 : 'auto'"
                :show-overflow-tooltip="true"
                align="center"
                label="角色备注"
                prop="remark">
            </el-table-column>
            <el-table-column align="center" label="角色启用">
                <template v-slot="scope">
                    <el-switch
                        v-model="scope.row.isEnable"
                        :active-value="false"
                        :disabled="scope.row.roleCode==='ADMIN_ROOT' || !hasPermission('sys:role:enable')"
                        :inactive-value="true"
                        active-color="#13ce66"
                        inactive-color="#ff4949"
                        @change="updateRoleEnable(scope.row.id)"
                    ></el-switch>
                </template>
            </el-table-column>
            <el-table-column
                :width="isMobile ? 120 : 'auto'"
                align="center"
                label="权限信息"
                prop="createTime">
                <template v-slot="scope">
                    <el-button
                        :disabled="scope.row.roleCode==='ADMIN_ROOT' || !hasPermission('sys:role:assign')"
                        icon="el-icon-setting"
                        round
                        size="small"
                        type="success"
                        :style="isMobile ? 'padding: 6px 8px;' : ''"
                        @click="assignRole(scope.row)"
                    >分配权限
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column :width="isMobile ? 80 : 'auto'" align="center" label="操作">
                <template slot-scope="scope">
                    <!-- 桌面端显示按钮 -->
                    <template v-if="!isMobile">
                        <div class="operation-buttons">
                            <el-button
                                v-if="hasPermission('sys:role:edit')"
                                :disabled="scope.row.roleCode==='ADMIN_ROOT'"
                                icon="el-icon-edit"
                                size="mini"
                                type="primary"
                                @click="handleEdit(scope.row)"
                            >编辑
                            </el-button>
                            <el-button
                                v-if="hasPermission('sys:role:delete')"
                                :disabled="scope.row.roleCode==='ADMIN_ROOT'"
                                icon="el-icon-delete"
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
                                v-if="hasPermission('sys:role:edit')"
                                :disabled="scope.row.roleCode==='ADMIN_ROOT'"
                                @click.native="handleEdit(scope.row)"
                            >
                                <i class="el-icon-edit"></i> 编辑
                            </el-dropdown-item>
                            <el-dropdown-item
                                v-if="hasPermission('sys:role:delete')"
                                :disabled="scope.row.roleCode==='ADMIN_ROOT'"
                                @click.native="handleDelete(scope.row)"
                            >
                                <i class="el-icon-delete"></i> 删除
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页工具栏 -->
        <flex justify="end">
            <el-pagination
                :current-page="searchModel.pageNo"
                :page-size="searchModel.pageSize"
                :layout="isMobile ? 'total, prev, pager, next' : 'total, sizes, prev, pager, next, jumper'"
                :total="total"
                background
                :page-sizes="isMobile ? [10, 20, 30] : [10, 20, 30, 40, 50]"
                :small="isMobile"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            >
            </el-pagination>
        </flex>
        <!--  新增/修改角色  -->
        <system-dialog
            v-dialog-drag
            :height="dialogHeight"
            :title="roleDialog.title"
            :visible="roleDialog.visible"
            :width="dialogWidth"
            @onClose="onClose"
            @onConfirm="onConfirm"
        >
            <div slot="content">
                <el-form
                    ref="roleForm"
                    :inline="false"
                    :model="role"
                    :rules="rules"
                    :class="{'mobile-role-form': isMobile}"
                    :label-position="isMobile ? 'top' : 'right'"
                    :label-width="isMobile ? '70px' : '80px'"
                    size="small"
                >
                    <el-form-item label="角色编码" prop="roleCode">
                        <el-input v-model="role.roleCode"></el-input>
                    </el-form-item>
                    <el-form-item label="角色名称" prop="roleName">
                        <el-input v-model="role.roleName"></el-input>
                    </el-form-item>
                    <el-form-item label="角色描述">
                        <el-input v-model="role.remark" :rows="5" type="textarea"></el-input>
                    </el-form-item>
                </el-form>
            </div>
        </system-dialog>
        
        <el-dialog
            v-if="assignRoleDialog.visible"
            v-dialog-drag
            :title="assignRoleDialog.title"
            :visible.sync="assignRoleDialog.visible"
            :fullscreen="isMobile"
            :width="dialogWidth"
        >
            <RoleManage
                v-if="!isMobile"
                :data="permissionList"
                :loading="false"
                :role-id="assignRoleDialog.roleId"
                :role-name="assignRoleDialog.roleName"
                @save-role="onConfirmRole"
            ></RoleManage>
            
            <MobileRoleManage
                v-else
                :data="permissionList"
                :loading="false"
                :role-id="assignRoleDialog.roleId"
                :role-name="assignRoleDialog.roleName"
                @save-role="onConfirmRole"
            ></MobileRoleManage>
        </el-dialog>
    </el-main>
</template>

<script>
import {addRole, deleteRole, getRoleList, updateRole, updateRoleEnable} from '@/api/role'
import Flex from '@/components/Flex/Flex.vue'
import systemDialog from '@/components/Dialog/SystemDialog.vue'
import {assignPermission, getPermissionListByRoleId} from '@/api/menu'
import RoleManage from '@/views/system/role/RoleManage.vue'
import MobileRoleManage from '@/views/system/role/MobileRoleManage.vue'
import hasPermission from '@/router/permission'

export default {
    components: {RoleManage, MobileRoleManage, Flex, systemDialog},
    data() {
        return {
            isMobile: false, // 添加移动端检测标识
            loading: false,
            tableHeight: 0,
            searchModel: {
                roleName: '',
                pageNo: 1,
                pageSize: 20
            },
            searchCollapse: [], // 控制移动端搜索折叠面板的状态，默认收起
            total: 0,
            roleList: [],
            role: {
                id: '',
                roleCode: '',
                roleName: '',
                remark: ''
            },
            roleDialog: {
                title: '',
                visible: false,
                width: 650,
                height: 250
            },
            assignRoleDialog: {
                title: '分配权限',
                visible: false,
                roleName: '',
                roleId: null
            },
            permissionList: [],
            rules: {
                roleCode: [{required: true, message: '请输入角色编码', trigger: 'blur'}],
                roleName: [{required: true, message: '请输入角色名称', trigger: 'blur'}]
            },
            resizeFlag: null // 用于防抖resize事件
        }
    },
    computed: {
        /**
         * 动态计算对话框宽度
         */
        dialogWidth() {
            return this.isMobile ? window.innerWidth * 0.95 : this.roleDialog.width
        },
        /**
         * 动态计算对话框高度
         */
        dialogHeight() {
            return this.isMobile ? 550 : this.roleDialog.height
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
        hasPermission,
        /**
         * 检测设备类型
         */
        checkDevice() {
            this.isMobile = window.innerWidth <= 768
        },
        /**
         * 查询角色列表
         */
        search() {
            this.loading = true
            getRoleList(this.searchModel).then(res => {
                if (res.code === 200) {
                    this.roleList = res.data.records
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
         * 修改角色状态
         * @param id
         */
        updateRoleEnable(id) {
            updateRoleEnable({roleId: id}).then(res => {
                if (res.code === 200) {
                    this.$message.success('修改成功')
                } else {
                    this.$message.error(res.message)
                }
            })
        },
        /**
         * 重置
         */
        resetValue() {
            this.searchModel.roleName = ''
            this.search()
        },
        /**
         * 新增
         */
        openAddWindow() {
            this.$resetForm('searchForm', this.role)
            this.roleDialog.visible = true
            this.roleDialog.title = '新增'
        },
        /**
         * 编辑
         */
        handleEdit(row) {
            this.roleDialog.visible = true
            this.roleDialog.title = '修改'
            this.$objCopy(row, this.role)
        },
        /**
         * 删除
         */
        handleDelete(row) {
            this.$confirm('确定要删除角色' + row.roleName + '吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                deleteRole({id: row.id}).then(res => {
                    if (res.code === 200) {
                        this.$message.success('删除成功')
                        this.search()
                    } else {
                        this.$message.error(res.message)
                    }
                })
            })
        },
        onConfirmRole(data) {
            let params = {
                roleId: data.roleId,
                permissions: data.permissions.map(item => item.id)
            }
            
            assignPermission(params).then(res => {
                if (res.code === 200) {
                    this.$message.success('分配成功')
                    this.assignRoleDialog.visible = false
                    this.search()
                } else {
                    this.$message.error(res.message)
                }
            })
        },
        /**
         * 关闭窗口
         */
        onClose() {
            this.roleDialog.visible = false
        },
        /**
         * 确认
         */
        onConfirm() {
            this.$refs.roleForm.validate(valid => {
                if (valid) {
                    if (this.role.id === '') {
                        addRole(this.role).then(res => {
                            if (res.code === 200) {
                                this.$message.success('新增成功')
                                this.roleDialog.visible = false
                                this.search()
                            } else {
                                this.$message.error(res.message)
                            }
                        })
                    } else {
                        updateRole(this.role).then(res => {
                            if (res.code === 200) {
                                this.$message.success('修改成功')
                                this.roleDialog.visible = false
                                this.search()
                            } else {
                                this.$message.error(res.message)
                            }
                        })
                    }
                }
            })
        },
        
        /**
         * 分配权限
         */
        assignRole(row) {
            this.assignRoleDialog.roleName = row.roleName
            this.assignRoleDialog.roleId = row.id
            this.getPermissionListByRoleId(row.id)
        },
        /**
         * 分页大小改变
         */
        handleSizeChange(size) {
            this.searchModel.pageSize = size
            this.search()
        },
        /**
         * 分页改变
         * @param pageNo
         */
        handleCurrentChange(pageNo) {
            this.searchModel.pageNo = pageNo
            this.search()
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
        },
        getPermissionListByRoleId(roleId) {
            getPermissionListByRoleId({roleId: roleId}).then(res => {
                if (res.code === 200) {
                    this.permissionList = res.data
                    this.assignRoleDialog.visible = true
                }
            })
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
    margin-bottom: 15px;
    
    &.is-mobile {
        margin-bottom: 20px;
    }
}

/* 移动端搜索折叠面板样式 */
.mobile-search-collapse {
    margin-bottom: 10px;
    border-radius: 4px;
    overflow: hidden;
    
    ::v-deep .el-collapse-item__header {
        padding: 0 15px;
        font-size: 14px;
        
        .collapse-title-container {
            display: flex;
            align-items: center;
            
            .search-icon {
                margin-right: 8px;
                font-size: 16px;
                color: #409EFF;
            }
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
        display: flex;
        justify-content: space-between;
        
        .el-button {
            flex: 1;
            margin: 0 5px;
            
            &:first-child {
                margin-left: 0;
            }
            
            &:last-child {
                margin-right: 0;
            }
        }
    }
}

/* 移动端角色表单样式 */
.mobile-role-form {
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

.role-table {
    table {
        margin: 0 0 2px 0;
        padding: 0;
        width: 100%;
        border-collapse: collapse;
    }
    
    tr td {
        margin: 0;
        padding: 0;
    }
    
    .table-head {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        width: 100%;
        height: 40px;
        border: 1px solid #ebebeb;
        font-size: 16px;
        
        > div {
            text-align: center;
            
            &:first-child,
            &:nth-child(2) {
                width: 170px;
            }
            
            &:last-child {
                flex: 1;
            }
        }
    }
    
    .role-table-wrapper {
        height: 55vh;
        border-bottom: solid 1px #ebebeb
    }
    
    .role-table__scrollbar {
        overflow: hidden;
        width: 100%;
        height: 99%;
    }
    
}
</style>
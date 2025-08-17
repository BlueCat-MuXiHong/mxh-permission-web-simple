<template>
    <el-main>
        <!-- 查询条件 -->
        <el-form
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
                <el-button v-if="hasPermission('sys:role:search')" icon="el-icon-search" type="primary"
                           @click="search()">查询
                </el-button>
                <el-button v-if="hasPermission('sys:role:search')" icon="el-icon-refresh-right" @click="resetValue">
                    重置
                </el-button>
                <el-button v-if="hasPermission('sys:role:add')" icon="el-icon-plus" type="success"
                           @click="openAddWindow">新增
                </el-button>
            </el-form-item>
        </el-form>
        <!--  表格  -->
        <el-table
            v-loading="loading"
            :data="roleList"
            :height="tableHeight"
            border
            stripe
            style="width: 100%; margin-bottom: 10px"
        >
            <el-table-column
                align="center"
                label="序号"
                prop="id"
                width="100"
            >
                <template v-slot="scope">{{ scope.$index + 1 }}</template>
            </el-table-column>
            <el-table-column align="center" label="角色名称" prop="roleName"></el-table-column>
            <el-table-column align="center" label="角色编码" prop="roleCode"></el-table-column>
            <el-table-column align="center" label="角色备注" prop="remark"></el-table-column>
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
            <el-table-column align="center" label="权限信息" prop="createTime">
                <template v-slot="scope">
                    <el-button
                        :disabled="scope.row.roleCode==='ADMIN_ROOT' || !hasPermission('sys:role:assign')"
                        icon="el-icon-setting"
                        round
                        size="small"
                        type="success"
                        @click="assignRole(scope.row)"
                    >分配权限
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column align="center" label="操作" width="290">
                <template slot-scope="scope">
                    <el-button
                        v-if="hasPermission('sys:role:edit')"
                        :disabled="scope.row.roleCode==='ADMIN_ROOT'"
                        icon="el-icon-edit"
                        size="small"
                        type="primary"
                        @click="handleEdit(scope.row)"
                    >编辑
                    </el-button>
                    <el-button
                        v-if="hasPermission('sys:role:delete')"
                        :disabled="scope.row.roleCode==='ADMIN_ROOT'"
                        icon="el-icon-delete"
                        size="small"
                        type="danger"
                        @click="handleDelete(scope.row)"
                    >删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页工具栏 -->
        <flex justify="end">
            <el-pagination
                :current-page="searchModel.pageNo"
                :page-size="searchModel.pageSize"
                :page-sizes="[10, 20, 30, 40, 50]"
                :total="total"
                background
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            >
            </el-pagination>
        </flex>
        <!--  新增/修改角色  -->
        <system-dialog
            v-dialog-drag
            :height="roleDialog.height"
            :title="roleDialog.title"
            :visible="roleDialog.visible"
            :width="roleDialog.width"
            @onClose="onClose"
            @onConfirm="onConfirm"
        >
            <div slot="content">
                <el-form
                    ref="roleForm"
                    :inline="false"
                    :model="role"
                    :rules="rules"
                    label-width="80px"
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
        >
            <RoleManage
                :data="permissionList"
                :loading="false"
                :role-id="assignRoleDialog.roleId"
                :role-name="assignRoleDialog.roleName"
                @save-role="onConfirmRole"
            ></RoleManage>
        </el-dialog>
    </el-main>
</template>

<script>
import {addRole, deleteRole, getRoleList, updateRole, updateRoleEnable} from '@/api/role'
import Flex from '@/components/Flex/Flex.vue'
import systemDialog from '@/components/Dialog/SystemDialog.vue'
import {assignPermission, getPermissionListByRoleId} from '@/api/menu'
import RoleManage from '@/views/system/role/RoleManage.vue'
import hasPermission from '@/router/permission'

export default {
    components: {RoleManage, Flex, systemDialog},
    data() {
        return {
            loading: false,
            tableHeight: 0,
            searchModel: {
                roleName: '',
                pageNo: 1,
                pageSize: 20
            },
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
            }
        }
    },
    methods: {
        hasPermission,
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
            let tableH = 210 //距离页面下方的高度
            let tableHeight = window.innerHeight - tableH
            if (tableHeight <= 300) {
                this.tableHeight = 300
            } else {
                this.tableHeight = window.innerHeight - tableH
            }
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

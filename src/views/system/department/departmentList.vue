<template>
    <el-main>
        <!--  条件查询区域  -->
        <div :class="{'is-mobile': isMobile}" class="search-container">
            <!-- 移动端折叠面板 -->
            <el-collapse v-if="isMobile" v-model="searchCollapse" class="mobile-search-collapse">
                <el-collapse-item name="1">
                    <template slot="title">
                        搜索条件
                        <span v-if="searchModel.companyName || searchModel.departmentName" class="collapse-summary">
                            <template v-if="searchModel.companyName">单位名称: {{ searchModel.companyName }}</template>
                            <template v-if="searchModel.departmentName">
                                {{ searchModel.companyName ? ' / ' : '' }}部门名称: {{ searchModel.departmentName }}
                            </template>
                        </span>
                    </template>
                    <el-form ref="searchForm" :inline="false" class="mobile-search-form" label-width="80px"
                             size="small">
                        <el-form-item label="单位名称">
                            <el-input v-model="searchModel.companyName" clearable
                                      placeholder="请输入单位名称"></el-input>
                        </el-form-item>
                        <el-form-item label="部门名称">
                            <el-input v-model="searchModel.departmentName" clearable
                                      placeholder="请输入部门名称"></el-input>
                        </el-form-item>
                        <el-form-item class="mobile-button-group">
                            <el-button v-if="hasPermission('sys:department:search')" icon="el-icon-search" size="small"
                                       type="primary" @click="search">查询
                            </el-button>
                            <el-button v-if="hasPermission('sys:department:search')" icon="el-icon-refresh-right"
                                       size="small" @click="resetValue">
                                重置
                            </el-button>
                            <el-button v-if="hasPermission('sys:department:add')"
                                       icon="el-icon-plus"
                                       size="small"
                                       type="success"
                                       @click="openAddWindow">新增
                            </el-button>
                        </el-form-item>
                    </el-form>
                </el-collapse-item>
            </el-collapse>
            
            <!-- 桌面端常规表单 -->
            <el-form v-else ref="searchForm" :inline="true" label-width="80px" size="small">
                <el-form-item>
                    <el-input v-model="searchModel.companyName" placeholder="请输入单位名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="searchModel.departmentName" placeholder="请输入部门名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button v-if="hasPermission('sys:department:search')" icon="el-icon-search" type="primary"
                               @click="search">查询
                    </el-button>
                    <el-button v-if="hasPermission('sys:department:search')" icon="el-icon-refresh-right"
                               @click="resetValue">重置
                    </el-button>
                    <el-button v-if="hasPermission('sys:department:add')" icon="el-icon-plus" type="success"
                               @click="openAddWindow">新增
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
        <!--  表格区域  -->
        <!--
          :data 表格数据,:height 表格高度,stripe 斑马纹表格,style 表格样式,border 表格边框,
          row-key 表格主键,
          :default-expand-all 默认展开所有行
          :tree-props 树形结构配置项
          -->
        <el-table
            v-loading="loading"
            :data="tableData"
            :height="tableHeight"
            :tree-props="{children: 'children',hasChildren:'hasChildren'}"
            border
            default-expand-all
            row-key="id"
            stripe
            :class="{'el-table--mobile': isMobile}"
            :header-cell-style="isMobile ? {padding: '5px 0'} : {}"
            :size="isMobile ? 'mini' : 'medium'"
            style="width: 100%; margin-bottom: 10px"
        >
            >
            <!--   prop 填写数据的属性名称   -->
            <el-table-column :min-width="isMobile ? 120 : 'auto'" label="部门名称"
                             prop="departmentName"></el-table-column>
            <el-table-column :min-width="isMobile ? 100 : 'auto'" align="center" label="所属部门"
                             prop="parentName"></el-table-column>
            <el-table-column :min-width="isMobile ? 100 : 'auto'" align="center" label="所属单位"
                             prop="companyName"></el-table-column>
            <el-table-column v-if="!isMobile" align="center" label="部门电话" prop="phone"></el-table-column>
            <el-table-column v-if="!isMobile" align="center" label="部门邮箱" prop="email"></el-table-column>
            <el-table-column v-if="!isMobile" align="center" label="部门地址" prop="address"></el-table-column>
            <el-table-column :width="isMobile ? 80 : 'auto'" align="center" label="操作">
                <!-- 桌面端显示按钮 -->
                <template v-if="!isMobile" v-slot="scope">
                    <div class="operation-buttons">
                        <el-button
                            v-if="hasPermission('sys:department:edit')"
                            :disabled="scope.row.pid===0"
                            icon="el-icon-edit-outline"
                            size="mini"
                            type="primary" @click="handleEdit(scope.row)"
                        >编辑
                        </el-button>
                        <el-button
                            v-if="hasPermission('sys:department:delete')"
                            :disabled="scope.row.pid===0"
                            icon="el-icon-delete-solid"
                            size="mini"
                            type="danger" @click="handleDelete(scope.row)"
                        >删除
                        </el-button>
                    </div>
                </template>
                
                <!-- 移动端显示下拉菜单 -->
                <template v-else v-slot="scope">
                    <el-dropdown trigger="click">
                        <el-button size="mini" type="primary">
                            操作<i class="el-icon-arrow-down el-icon--right"></i>
                        </el-button>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item
                                v-if="hasPermission('sys:department:edit')"
                                :disabled="scope.row.pid===0"
                                @click.native="handleEdit(scope.row)"
                            >
                                <i class="el-icon-edit-outline"></i> 编辑
                            </el-dropdown-item>
                            <el-dropdown-item
                                v-if="hasPermission('sys:department:delete')"
                                :disabled="scope.row.pid===0"
                                @click.native="handleDelete(scope.row)"
                            >
                                <i class="el-icon-delete-solid"></i> 删除
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </template>
            </el-table-column>
        </el-table>
        <!--  底部 分页区域  -->
        <!--  :current-page 当前页码,:page-size 每页显示的条数,
        :page-sizes 每页可选择显示的条数，background 分页按钮背景颜色,:layout 分页布局-->
        <flex justify="end">
            <el-pagination
                :current-page="searchModel.pageNo"
                :layout="isMobile ? 'total, prev, pager, next' : 'total, sizes, prev, pager, next, jumper'"
                :page-size="searchModel.pageSize"
                :page-sizes="[10, 20, 30, 40, 50]"
                :small="isMobile"
                :total="total"
                background
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            >
            </el-pagination>
        </flex>
        <system-dialog
            v-dialog-drag
            :height="departmentDialog.height"
            :title="departmentDialog.title"
            :visible="departmentDialog.visible"
            :width="dialogWidth"
            @onClose="onClose"
            @onConfirm="onConfirm"
        >
            <div slot="content">
                <el-form ref="departmentForm"
                         v-remove-aria-hidden
                         :class="{'mobile-department-form': isMobile}"
                         :model="department"
                         :rules="rules"
                         :inline="false"
                         :label-position="isMobile ? 'top' : 'right'"
                         :label-width="isMobile ? '70px' : '80px'"
                         size="small"
                >
                    <flex class="departDialogClass" justify="between" wrap="wrap">
                        <el-form-item label="所属部门" prop="parentName">
                            <el-cascader
                                ref="cascader"
                                v-model="cascaderData"
                                :filterable="true"
                                :options="departTree"
                                :props="{ checkStrictly: true, label: 'departmentName', value:'id',children:'children'}"
                                :show-all-levels="false"
                                clearable
                                style="width: 100%"
                                @change="handleDepartCascadeChange"
                            />
                        </el-form-item>
                        <el-form-item label="所属单位">
                            <el-input v-model="department.companyName" disabled></el-input>
                        </el-form-item>
                        <el-form-item label="部门名称" prop="departmentName">
                            <el-input v-model="department.departmentName"></el-input>
                        </el-form-item>
                        <el-form-item label="部门电话">
                            <el-input v-model="department.phone"></el-input>
                        </el-form-item>
                        <el-form-item label="部门地址">
                            <el-input v-model="department.address"></el-input>
                        </el-form-item>
                        <el-form-item label="部门邮箱">
                            <el-input v-model="department.email"></el-input>
                        </el-form-item>
                    </flex>
                </el-form>
            </div>
        </system-dialog>
    </el-main>
</template>

<script>
import {
    addDepartment,
    deleteDepartment,
    getDepartmentList,
    getParentDepartmentList,
    updateDepartment
} from '@/api/department'
import SystemDialog from '@/components/Dialog/SystemDialog.vue'
import Flex from '@/components/Flex/Flex.vue'
import hasPermission from '@/router/permission'

export default {
    components: {Flex, SystemDialog},
    data() {
        return {
            isMobile: false,
            searchCollapse: ['1'], // 控制移动端搜索折叠面板的状态，默认展开
            loading: true,
            tableHeight: 0,
            searchModel: {
                companyName: '',
                departmentName: '',
                pageNo: 1,
                pageSize: 20
            },
            total: 0,
            tableData: [],
            departmentDialog: {
                title: '',//窗口标题
                visible: false,//是否显示
                width: 600,//窗口宽度
                height: 350//窗口高度
            },
            departTree: [],//部门树
            cascaderData: [],
            department: {
                id: '',
                pid: '',
                companyName: '',
                departmentName: '',
                phone: '',
                address: '',
                email: '',
                parentName: ''
            },
            rules: {
                parentName: [{required: true, message: '请选择所属部门', trigger: 'blur'}],
                departmentName: [{required: true, message: '请输入部门名称', trigger: 'blur'}]
            },
            resizeFlag: null // 用于防抖resize事件
        }
    },
    computed: {
        /**
         * 动态计算对话框宽度
         */
        dialogWidth() {
            return this.isMobile ? window.innerWidth * 0.95 : this.departmentDialog.width
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
         * 部门级联选择器选择事件
         */
        handleDepartCascadeChange() {
            if (this.$refs.cascader.getCheckedNodes().length > 0) {
                let departmentInfo = this.$refs.cascader.getCheckedNodes()[0].data
                this.department.pid = departmentInfo.id
                this.department.parentName = departmentInfo.departmentName
                this.department.companyName = departmentInfo.companyName
                this.department.companyId = departmentInfo.companyId
            }
        },
        /**
         * 查询部门信息
         */
        search() {
            // 调用查询方法
            getDepartmentList(this.searchModel).then(res => {
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
            // 重置查询条件
            this.searchModel.departmentName = ''
            this.searchModel.companyName = ''
            // 调用查询方法
            this.search()
        },
        /**
         * 新增部门
         */
        openAddWindow() {
            //清除表单数据
            this.$resetForm('departmentForm', this.department)
            //设置窗口的属性
            this.departmentDialog.title = '新增部门'
            //是否打开弹框
            this.departmentDialog.visible = true
            //获取部门树
            this.getDepartTreeData()
        },
        /**
         * 编辑部门
         */
        handleEdit(row) {
            this.departmentDialog.title = '编辑'
            this.departmentDialog.visible = true
            this.$objCopy(row, this.department)
            this.addDisabledToNode(row.id, this.departTree)
            this.getParentListId(row.pid, this.departTree)
        },
        /**
         * 获取当前部门id的所有父级部门id
         * @param pid
         * @param treeList
         */
        getParentListId(pid, treeList) {
            this.cascaderData = []; // 清空之前的数据
            this._getParentListId(pid, treeList);
            //倒序
            this.cascaderData.sort()
        },
        
        /**
         * 递归获取父级部门ID的内部方法
         * @param pid
         * @param treeList
         * @private
         */
        _getParentListId(pid, treeList) {
            Array.isArray(treeList) && treeList.forEach(item => {
                if (pid === item.id) {
                    this.cascaderData.push(item.id)
                    this._getParentListId(item.pid, this.departTree)
                } else {
                    this._getParentListId(pid, item.children)
                }
            })
        },
        /**
         * 删除部门
         */
        async handleDelete(row) {
            let confirm = await this.$myConfirm(`确定要删除部门：${row.departmentName}吗?`)
            if (confirm) {
                deleteDepartment({id: row.id}).then(res => {
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
            this.search()
        },
        /**
         * 分页改变
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
        /**
         * 关闭窗口
         */
        onClose() {
            this.departmentDialog.visible = false
        },
        /**
         * 确认新增或编辑
         */
        onConfirm() {
            this.$refs.departmentForm.validate(valid => {
                if (valid) {
                    if (this.department.id === '') {
                        addDepartment(this.department).then(res => {
                            if (res.code === 200) {
                                this.$message.success('新增成功')
                                this.departmentDialog.visible = false
                                this.search()
                            } else {
                                this.$message.error(res.message)
                            }
                        })
                    } else {
                        updateDepartment(this.department).then(res => {
                            if (res.code === 200) {
                                this.$message.success('修改成功')
                                this.departmentDialog.visible = false
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
         * 获取部门树
         */
        getDepartTreeData() {
            getParentDepartmentList().then(res => {
                if (res.code === 200) {
                    //清除部门树
                    this.cascaderData = []
                    this.departTree = res.data
                }
            })
        },
        /**
         * 递归添加disabled属性
         * @param targetId
         * @param departments
         */
        addDisabledToNode(targetId, departments) {
            // 遍历每个部门
            departments.forEach(department => {
                // 检查当前部门的ID是否与目标ID相等
                if (department.id === targetId) {
                    // 添加disabled属性
                    department.disabled = true
                }
                
                // 如果当前部门有子部门，则递归调用此函数
                if (department.children && department.children.length > 0) {
                    this.addDisabledToNode(targetId, department.children)
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
        this.getDepartTreeData()
    },
    beforeDestroy() {
        // 清理 resize 事件监听器
        window.onresize = null;
        if (this.resizeFlag) {
            clearTimeout(this.resizeFlag);
        }
    }
}
</script>

<style lang="scss" scoped>
.departDialogClass {
    //居中
    display: flex;
    justify-content: center;
    
    .el-form-item {
        margin-top: 15px;
    }
    
}

.cls-attr-cascader .el-cascader-panel .el-cascader-menu {
    width: 0;
}

input[aria-hidden="true"] {
    display: none !important;
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
        
        .collapse-summary {
            margin-left: 10px;
            font-size: 12px;
            color: #909399;
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

/* 部门表单样式 */
.departDialogClass {
    //居中
    display: flex;
    justify-content: center;
    
    .el-form-item {
        margin-top: 15px;
    }
}

/* 移动端部门表单样式 */
.mobile-department-form {
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
</style>
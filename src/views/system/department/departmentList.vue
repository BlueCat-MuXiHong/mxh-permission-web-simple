<template>
    <el-main>
        <!--  条件查询区域  -->
        <!--  :input 行内表单 ，label-width 表单标签的宽度 ，size 表单大小  -->
        <el-form :inline="true" label-width="80px" size="small">
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
            style="width: 100%;"
        >
            >
            <!--   prop 填写数据的属性名称   -->
            <el-table-column label="部门名称" prop="departmentName"></el-table-column>
            <el-table-column align="center" label="所属部门" prop="parentName"></el-table-column>
            <el-table-column align="center" label="所属单位" prop="companyName"></el-table-column>
            <el-table-column align="center" label="部门电话" prop="phone"></el-table-column>
            <el-table-column align="center" label="部门邮箱" prop="email"></el-table-column>
            <el-table-column align="center" label="部门地址" prop="address"></el-table-column>
            <el-table-column align="center" label="操作">
                <template v-slot="scope">
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
                </template>
            </el-table-column>
        </el-table>
        <!--  底部 分页区域  -->
        <!--  :current-page 当前页码,:page-size 每页显示的条数,
        :page-sizes 每页可选择显示的条数，background 分页按钮背景颜色,:layout 分页布局-->
        <el-pagination
            :current-page="searchModel.pageNo"
            :page-size="searchModel.pageSize"
            :page-sizes="[10, 20, 30, 40, 50]"
            :total="total"
            background
            layout="total, sizes, prev, pager, next, jumper"
            style="display: flex; justify-content: flex-end;"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        >
        </el-pagination>
        <system-dialog
            v-dialog-drag
            :height="departmentDialog.height"
            :title="departmentDialog.title"
            :visible="departmentDialog.visible"
            :width="departmentDialog.width"
            @onClose="onClose"
            @onConfirm="onConfirm"
        >
            <div slot="content">
                <el-form ref="departmentForm"
                         v-remove-aria-hidden
                         :inline="true"
                         :model="department"
                         :rules="rules"
                         label-width="80px"
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
                                size="mini"
                                style="width: 100%"
                                @change="handleDepartCascadeChange()"
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
import flex from '@/components/Flex/Flex.vue'
import hasPermission from '@/router/permission'

export default {
    components: {flex, SystemDialog},
    data() {
        return {
            loading: true,
            parentDialogLoading: false,
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
                height: 200//矿口高度
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
            }
        }
    },
    methods: {
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
            Array.isArray(treeList) && treeList.forEach(item => {
                if (pid === item.id) {
                    this.cascaderData.push(item.id)
                    this.getParentListId(item.pid, this.departTree)
                } else {
                    this.getParentListId(pid, item.children)
                }
            })
            //倒序
            this.cascaderData.sort()
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
        this.getDepartTreeData()
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
</style>

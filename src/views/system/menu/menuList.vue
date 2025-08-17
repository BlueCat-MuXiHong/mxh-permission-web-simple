<template>
    <el-main>
        <!--  新增按钮  -->
        <el-button v-if="hasPermission('sys:user:add')" icon="el-icon-plus" size="small" type="success"
                   @click="openAddWindow()">新增
        </el-button>
        <!--  表格数据  -->
        <el-table
            v-loading="loading"
            :data="tableData"
            :height="tableHeight"
            :tree-props="{children: 'children'}"
            border
            default-expand-all
            row-key="id"
            style="width: 100%;margin-top: 10px;"
        >
            <el-table-column label="菜单名称" prop="label"></el-table-column>
            <el-table-column align="center" label="菜单类型" prop="type">
                <template slot-scope="scope">
                    <el-tag v-if="scope.row.type===0" size="normal">目录</el-tag>
                    <el-tag v-else-if="scope.row.type===1" size="normal" type="success">菜单</el-tag>
                    <el-tag v-else-if="scope.row.type===2" size="normal" type="warning">按钮</el-tag>
                </template>
            </el-table-column>
            <el-table-column align="center" label="菜单图标" prop="icon">
                <template slot-scope="scope">
                    <!--     如果包含el-开头的用i标签，否则用svg-icon     -->
                    <i v-if="scope.row.icon.includes('el-icon')" :class="scope.row.icon"/>
                    <svg-icon v-else :icon-class="scope.row.icon"/>
                </template>
            </el-table-column>
            <el-table-column align="center" label="路由编码" prop="code"></el-table-column>
            <el-table-column align="center" label="路由地址" prop="path"></el-table-column>
            <el-table-column align="center" label="组件路径" prop="url"></el-table-column>
            <el-table-column align="center" label="操作">
                <template slot-scope="scope">
                    <el-button
                        v-if="hasPermission('sys:menu:edit')"
                        icon="el-icon-edit-outline"
                        size="mini"
                        type="primary"
                        @click="handleEdit(scope.row)"
                    >编辑
                    </el-button>
                    <el-button
                        v-if="hasPermission('sys:menu:delete')"
                        icon="el-icon-delete-solid"
                        size="mini"
                        type="danger"
                        @click="handleDelete(scope.row)"
                    >删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        
        <!--  新增或修改窗口  -->
        <system-dialog
            v-dialog-drag
            :height="menuDialog.height"
            :title="menuDialog.title"
            :visible="menuDialog.visible"
            :width="menuDialog.width"
            @onClose="onClose"
            @onConfirm="onConfirm"
        >
            <div slot="content">
                <el-form ref="menuForm" :inline="true"
                         :model="menu"
                         :rules="rules"
                         label-width="80px" size="small"
                >
                    <el-col :span="24">
                        <el-form-item label="菜单类型" prop="type">
                            <el-radio-group v-model="menu.type">
                                <el-radio :label="0">目录</el-radio>
                                <el-radio :label="1">菜单</el-radio>
                                <el-radio :label="2">按钮</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                    
                    <el-form-item label="所属菜单" prop="parentName" size="small">
                        <el-input v-model="menu.parentName" :readonly="true" @click.native="selectParentMenu"/>
                    </el-form-item>
                    <el-form-item label="菜单名称" prop="label" size="small">
                        <el-input v-model="menu.label"></el-input>
                    </el-form-item>
                    <el-form-item v-if="menu.type===1" label="路由地址" prop="path" size="small">
                        <el-input v-model="menu.path"></el-input>
                    </el-form-item>
                    <el-form-item v-if="menu.type===1" label="组件路径" prop="url" size="small">
                        <el-input v-model="menu.url"></el-input>
                    </el-form-item>
                    <el-form-item v-if="menu.type!==0" label="权限编码" prop="code" size="small">
                        <el-input v-model="menu.code"></el-input>
                    </el-form-item>
                    <el-form-item label="菜单图标" size="small">
                        <my-icon ref="child" @selectIcon="setIcon"/>
                    </el-form-item>
                    <el-form-item label="菜单序号" size="small">
                        <el-input v-model="menu.orderNum"></el-input>
                    </el-form-item>
                </el-form>
            </div>
        </system-dialog>
        
        <!-- 选择所属菜单弹框 -->
        <system-dialog
            :height="parentDialog.height"
            :title="parentDialog.title"
            :visible="parentDialog.visible"
            :width="parentDialog.width"
            @onClose="onParentClose"
            @onConfirm="onParentConfirm"
        >
            <div slot="content">
                <el-tree
                    ref="parentTree"
                    v-loading="selectMenuLoading"
                    :data="parentMenuList"
                    :expand-on-click-node="false"
                    :highlight-current="true"
                    :props="defaultProps"
                    :show-checkbox="false"
                    default-expand-all
                    empty-text="暂无数据"
                    node-key="id"
                    style="font-size: 14px"
                    @node-click="handleNodeClick"
                >
                    <div slot-scope="{ node, data }" class="customer-tree-node">
                        <span style="margin-left: 3px">{{ node.label }}</span>
                    </div>
                </el-tree>
            </div>
        </system-dialog>
    </el-main>
</template>

<script>
import SystemDialog from '@/components/Dialog/SystemDialog.vue'
import {addPermission, deletePermission, getInitList, getPermissionList, updatePermission} from '@/api/menu'
import MyIcon from '@/components/icon/MyIcon.vue'
import hasPermission from '@/router/permission'

export default {
    components: {MyIcon, SystemDialog},
    data() {
        return {
            tableHeight: 0,
            tableData: [],
            loading: false,
            selectMenuLoading: false,
            menu: {
                id: '',//菜单id
                type: '',//菜单类型
                parentId: '',//父节点菜单id
                parentName: '',//父节点菜单名
                label: '', //权限名称
                icon: '',// 图标
                path: '',//路由地址
                url: '',//组件路径
                code: '',//授权标识符
                orderNum: '' //排序
            },
            //菜单弹框的控制属性
            menuDialog: {
                title: '新增菜单', //标题
                width: 630,//宽度
                height: 270,//高度
                visible: false//默认是否打开
            },
            parentMenuList: [],
            parentDialog: {
                title: '',
                visible: false,
                width: 500,
                height: 400
            },
            //树组件属性定义
            defaultProps: {
                children: 'children',
                label: 'label'
            },
            rules: {
                type: [{required: true, trigger: 'change', message: '请选择菜单类型'}],
                parentName: [{required: true, trigger: 'change', message: '请选择所属菜单'}],
                label: [{required: true, trigger: 'blur', message: '请输入菜单名称'}],
                name: [{required: true, trigger: 'blur', message: '请输入路由名称'}],
                path: [{required: true, trigger: 'blur', message: '请输入路由路径'}],
                url: [{required: true, trigger: 'blur', message: '请输入组件路径'}],
                code: [{required: true, trigger: 'blur', message: '请输入权限编码'}]
            }
        }
    },
    methods: {
        hasPermission,
        search() {
            this.loading = true
            getPermissionList().then(res => {
                if (res.code === 200) {
                    this.tableData = res.data
                    this.loading = false
                }
            })
        },
        openAddWindow() {
            //加入快速清空表单
            this.$resetForm('menuForm', this.menu)
            //添加默认值,让选择时显示第一个按钮
            this.menu.type = 0
            //清空菜单图标
            this.$nextTick(() => {
                this.$refs['child'].userChooseIcon = ''
            })
            //设置窗口标题
            this.menuDialog.title = '新增菜单'
            //显示窗口
            this.menuDialog.visible = true
        },
        /**
         * 编辑菜单
         * @param row
         */
        handleEdit(row) {
            //将行数据复制到menu对象中
            this.$objCopy(row, this.menu)
            //回显菜单图标
            this.$nextTick(() => {
                this.$refs['child'].userChooseIcon = row.icon
            })
            //设置窗口标题
            this.menuDialog.title = '编辑菜单'
            //显示窗口
            this.menuDialog.visible = true
        },
        /**
         * 删除菜单
         * @param row
         */
        async handleDelete(row) {
            let confirm = await this.$myConfirm(`确定删除菜单【${row.label}】吗？`)
            if (confirm) {
                //发送删除请求
                let res = await deletePermission({id: row.id})
                //判断是否成功
                if (res.code === 200) {
                    this.$message.success(res.message)
                    this.search()
                } else {
                    this.$message.error(res.message)
                }
            }
        },
        /**
         * 关闭选择所属菜单弹框
         */
        onParentClose() {
            this.parentDialog.visible = false
        },
        /**
         * 所属菜单弹框点击树节点事件
         * @param data
         */
        handleNodeClick(data) {
            //所属父级菜单ID
            this.menu.parentId = data.id
            //所属父级菜单名称
            this.menu.parentName = data.label
            this.parentDialog.visible = false
        },
        /**
         * 确认选择所属菜单
         */
        onParentConfirm() {
            this.parentDialog.visible = false
        },
        //给icon绑定的点击事件
        setIcon(icon) {
            //将i的样式设为选中的样式el-icon-xxx
            //将选中的图标传递给父组件
            this.menu.icon = icon
        },
        onClose() {
            this.menuDialog.visible = false
        },
        /**
         * 确认
         */
        onConfirm() {
            //判断输入框校验是否通过
            this.$refs.menuForm.validate((valid) => {
                if (valid) {
                    //如果菜单按钮的id为空，那就是新增
                    if (this.menu.id === '') {
                        //发送添加权限请求
                        addPermission(this.menu).then(res => {
                            if (res.code === 200) {
                                //成功提示
                                this.$message.success(res.message)
                                this.menuDialog.visible = false
                                //刷新
                                this.search()
                            } else {
                                this.$message.error(res.message)
                            }
                        })
                    } else {
                        //发送修改权限请求
                        updatePermission(this.menu).then(res => {
                            // noinspection JSUnresolvedReference webStorm禁用检查（与业务无关）
                            if (res.code === 200) {
                                //成功提示
                                this.$message.success(res.message)
                                this.menuDialog.visible = false
                                //刷新
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
         * 选择所属菜单
         */
        selectParentMenu() {
            this.parentDialog.title = '选择所属菜单'
            this.parentDialog.visible = true
            this.selectMenuLoading = true
            getInitList().then(res => {
                if (res.code === 200) {
                    this.parentMenuList = res.data
                    this.selectMenuLoading = false
                }
            })
        },
        /**
         * 获取表格高度
         */
        getTableHeight() {
            let tableH = 150 //距离页面下方的高度
            this.tableHeight = window.innerHeight - tableH
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

</style>

<template>
    <el-container :style="{height:containerHeight+'px'}">
        
        
        <!--  左侧部门树形菜单列表  -->
        <el-aside
            v-show="!isMobile || showDeptTree"
            :class="{'mobile-dept-tree': isMobile}"
            style="
          padding: 0 0 0 0;
          background: #fff;
          border-right: 1px solid #dfe6ec;
          "
            :width="isMobile ? '100%' : '250px'"
        >
            <flex justify="around" style="margin-top: 10px">
                <el-input
                    v-model="filterText"
                    placeholder="搜索部门"
                    size="mini"
                    style="width: 80%;vertical-align: top"
                >
                </el-input>
                <el-button icon="el-icon-refresh-right"
                           size="mini"
                           type="primary"
                           @click="resetButton"
                ></el-button>
            </flex>
            
            <el-tree
                ref="leftTree"
                v-loading="leftTreeLoading"
                :data="departmentList"
                :default-checked-keys="[1]"
                :expand-on-click-node="false"
                :filter-node-method="filterNode"
                :highlight-current="true"
                :props="{children: 'children',label:'departmentName'}"
                :show-checkbox="false"
                default-expand-all
                empty-text="暂无数据"
                node-key="id"
                style="font-size: 14px;margin-top: 10px"
                @node-click="handleNodeClick"
            >
                <div slot-scope="{ node, data }" class="custom-tree-node">
                    <div>
            <span v-if="data.children===null || data.children.length === 0">
              <i class="el-icon-document"></i>
            </span>
                        <span style="margin-left: 3px">{{ node.label }}</span>
                    </div>
                </div>
            </el-tree>
        </el-aside>
        <el-main>
            <!-- 移动端部门列表折叠面板 - 放在搜索条件上方 -->
        <el-collapse v-if="isMobile" v-model="deptCollapse" class="mobile-search-collapse">
            <el-collapse-item name="1">
                <template slot="title">
                    <div class="collapse-title-container">
                        <i class="el-icon-office-building search-icon"></i>
                        <span>部门列表</span>
                        <el-tag v-if="searchModel.departmentId" size="mini" type="primary" class="search-status-tag">
                            <i class="el-icon-info"></i> 已选择部门
                        </el-tag>
                    </div>
                    <div v-if="searchModel.departmentId" class="collapse-summary">
                        当前选择: {{ departmentList.find(d => d.id === searchModel.departmentId)?.departmentName || '未知部门' }}
                    </div>
                </template>
                <div class="mobile-dept-search">
                    <el-input
                        v-model="filterText"
                        placeholder="搜索部门"
                        size="mini"
                    ></el-input>
                    <el-button icon="el-icon-refresh-right"
                               size="mini"
                               type="primary"
                               @click="resetButton"
                    ></el-button>
                </div>
                <el-tree
                    ref="leftTree"
                    v-loading="leftTreeLoading"
                    :data="departmentList"
                    :default-checked-keys="[1]"
                    :expand-on-click-node="false"
                    :filter-node-method="filterNode"
                    :highlight-current="true"
                    :props="{children: 'children',label:'departmentName'}"
                    :show-checkbox="false"
                    default-expand-all
                    empty-text="暂无数据"
                    node-key="id"
                    style="font-size: 14px"
                    @node-click="handleNodeClick"
                >
                    <div slot-scope="{ node, data }" class="custom-tree-node">
                        <div>
            <span v-if="data.children===null || data.children.length === 0">
              <i class="el-icon-document"></i>
            </span>
                            <span style="margin-left: 3px">{{ node.label }}</span>
                        </div>
                    </div>
                </el-tree>
            </el-collapse-item>
        </el-collapse>
            <!--  条件检索区域  -->
            <div :class="{'is-mobile': isMobile}" class="search-container">
                <!-- 移动端折叠面板 -->
                <el-collapse v-if="isMobile" v-model="searchCollapse" class="mobile-search-collapse">
                    <el-collapse-item name="1">
                        <template slot="title">
                            <div class="collapse-title-container">
                                <i class="el-icon-search search-icon"></i>
                                <span>搜索条件</span>
                                <el-tag v-if="searchModel.username || searchModel.realName || searchModel.phone" 
                                       size="mini" type="warning" class="search-status-tag">
                                    <i class="el-icon-info"></i> 已设置条件
                                </el-tag>
                            </div>
                            <div v-if="searchModel.username || searchModel.realName || searchModel.phone" class="collapse-summary">
                                <template v-if="searchModel.username">用户名: {{ searchModel.username }}</template>
                                <template v-if="searchModel.realName">
                                    {{ searchModel.username ? ' / ' : '' }}姓名: {{ searchModel.realName }}
                                </template>
                                <template v-if="searchModel.phone">
                                    {{ searchModel.username || searchModel.realName ? ' / ' : '' }}电话: {{ searchModel.phone }}
                                </template>
                            </div>
                        </template>
                        <el-form ref="searchForm" :inline="false" class="mobile-search-form" label-width="80px"
                                 size="small">
                            <el-form-item label="用户名">
                                <el-input v-model="searchModel.username" clearable placeholder="请输入用户名"></el-input>
                            </el-form-item>
                            <el-form-item label="真实姓名">
                                <el-input v-model="searchModel.realName" clearable placeholder="请输入真实姓名"></el-input>
                            </el-form-item>
                            <el-form-item label="电话">
                                <el-input v-model="searchModel.phone" clearable placeholder="请输入电话"></el-input>
                            </el-form-item>
                            <el-form-item class="mobile-button-group">
                                <div class="button-grid">
                                    <el-button v-if="hasPermission('sys:user:search')" icon="el-icon-search" size="small"
                                               type="primary" @click="search">查询
                                    </el-button>
                                    <el-button v-if="hasPermission('sys:user:search')" icon="el-icon-refresh-right"
                                               size="small" @click="resetValue">
                                        重置
                                    </el-button>
                                    <el-button v-if="hasPermission('sys:user:add')"
                                               icon="el-icon-plus"
                                               size="small"
                                               type="success"
                                               @click="openAddWindow">新增
                                    </el-button>
                                    <el-popover
                                        placement="bottom"
                                        trigger="hover"
                                        width="300"
                                    >
                                        <flex justify="around" wrap="wrap">
                                            <flex direction="column" justify="between">
                                                <el-upload
                                                    ref="uploadUserListRef"
                                                    :action="uploadUserListUrl"
                                                    :limit="1"
                                                    :on-success="handleSuccess"
                                                    :show-file-list="false"
                                                >
                                                    <el-button icon="el-icon-upload" type="success" @click="importUser()">导入用户
                                                    </el-button>
                                                </el-upload>
                                                <br/>
                                                <el-button icon="el-icon-tickets" type="success" @click="downUserTemplate()">
                                                    下载模板
                                                </el-button>
                                            </flex>
                                            <div>
                                                <el-button icon="el-icon-download" type="primary" @click="exportUser()">导出用户
                                                </el-button>
                                            </div>
                                        </flex>
                                        <el-button v-if="hasPermission('sys:user:imAndUp')"
                                                   slot="reference"
                                                   size="small"
                                                   type="warning"
                                                   icon="el-icon-upload2"
                                                   class="import-export-btn"
                                        >导入/导出
                                        </el-button>
                                    </el-popover>
                                </div>
                            </el-form-item>
                        </el-form>
                    </el-collapse-item>
                </el-collapse>
                
                <!-- 桌面端常规表单 -->
                <el-form v-else ref="searchForm" :inline="true" label-width="80px" size="small">
                    <el-form-item>
                        <el-input v-model="searchModel.username" placeholder="请输入用户名"/>
                    </el-form-item>
                    <el-form-item>
                        <el-input v-model="searchModel.realName" placeholder="请输入真实姓名"/>
                    </el-form-item>
                    <el-form-item>
                        <el-input v-model="searchModel.phone" placeholder="请输入电话"/>
                    </el-form-item>
                    <el-form-item>
                        <flex justify="around" wrap="wrap">
                            <el-button v-if="hasPermission('sys:user:search')" icon="el-icon-search" type="primary"
                                       @click="search()">
                                查询
                            </el-button>
                            <el-button v-if="hasPermission('sys:user:search')" icon="el-icon-delete" @click="resetValue()">
                                重置
                            </el-button>
                            <el-button v-if="hasPermission('sys:user:add')" icon="el-icon-plus" size="small" type="success"
                                       @click="openAddWindow()"
                            >新增
                            </el-button>
                            <el-popover
                                placement="bottom"
                                style="margin-left: 10px"
                                trigger="hover"
                                width="300"
                            >
                                <flex justify="around" wrap="wrap">
                                    <flex direction="column" justify="between">
                                        <el-upload
                                            ref="uploadUserListRef"
                                            :action="uploadUserListUrl"
                                            :limit="1"
                                            :on-success="handleSuccess"
                                            :show-file-list="false"
                                        >
                                            <el-button icon="el-icon-upload" type="success" @click="importUser()">导入用户
                                            </el-button>
                                        </el-upload>
                                        <br/>
                                        <el-button icon="el-icon-tickets" type="success" @click="downUserTemplate()">
                                            下载模板
                                        </el-button>
                                    </flex>
                                    <div>
                                        <el-button icon="el-icon-download" type="primary" @click="exportUser()">导出用户
                                        </el-button>
                                    </div>
                                </flex>
                                <el-button v-if="hasPermission('sys:user:imAndUp')"
                                           slot="reference"
                                           size="small"
                                           type="warning"
                                >导入/导出
                                </el-button>
                            </el-popover>
                        </flex>
                    </el-form-item>
                </el-form>
            </div>
            <!--   表格部分   -->
            <el-table
                v-loading="mainLoading"
                :data="userList"
                :height="tableHeight"
                border
                stripe
                :class="{'el-table--mobile': isMobile}"
                :header-cell-style="isMobile ? {padding: '5px 0'} : {}"
                :size="isMobile ? 'mini' : 'medium'"
                style="width: 100%; margin-bottom: 10px"
            >
                <el-table-column align="center" label="用户名" prop="username"></el-table-column>
                <el-table-column align="center" label="姓名" prop="realName"></el-table-column>
                <el-table-column align="center" label="所属部门" prop="departmentName"></el-table-column>
                <el-table-column v-if="!isMobile" align="center" label="所属单位" prop="companyName"></el-table-column>
                <el-table-column align="center" label="电话" prop="phone"></el-table-column>
                <el-table-column v-if="!isMobile" align="center" label="微信号" prop="wechatNumber"></el-table-column>
                <el-table-column align="center" label="是否启用" prop="wechatNumber">
                    <template slot-scope="scope">
                        <el-switch
                            v-model="scope.row.enabled"
                            :disabled="scope.row.username==='admin' || !hasPermission('sys:user:enable')"
                            active-color="#13ce66"
                            inactive-color="#ff4949"
                            @change="switchChange(scope.row.id)"
                        >
                        </el-switch>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="角色" prop="wechatNumber">
                    <template slot-scope="scope">
                        <el-select v-model="scope.row.roleId"
                                   :disabled="scope.row.username==='admin' || !hasPermission('sys:user:assign')"
                                   clearable
                                   filterable
                                   placeholder="请选择角色"
                                   @change="selectChange($event, scope.row.id)"
                        >
                            <el-option
                                v-for="item in roleOptions"
                                :key="item.value"
                                :label="item.roleName"
                                :value="item.id"
                            >
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column :width="isMobile ? 80 : 200" align="center" label="操作">
                    <template slot-scope="scope">
                        <!-- 桌面端显示按钮 -->
                        <template v-if="!isMobile">
                            <el-button v-if="hasPermission('sys:user:edit')"
                                       :disabled="scope.row.username==='admin'"
                                       icon="el-icon-edit"
                                       size="mini"
                                       type="primary"
                                       @click="handleEdit(scope.row)"
                            >编辑
                            </el-button>
                            <el-button v-if="hasPermission('sys:user:delete')"
                                       :disabled="scope.row.username==='admin'"
                                       icon="el-icon-delete"
                                       size="mini"
                                       type="danger"
                                       @click="handleDelete(scope.row)"
                            >删除
                            </el-button>
                        </template>
                        
                        <!-- 移动端显示下拉菜单 -->
                        <el-dropdown v-else trigger="click">
                            <el-button size="mini" type="primary">
                                操作<i class="el-icon-arrow-down el-icon--right"></i>
                            </el-button>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item
                                    v-if="hasPermission('sys:user:edit')"
                                    :disabled="scope.row.username==='admin'"
                                    @click.native="handleEdit(scope.row)"
                                >
                                    <i class="el-icon-edit"></i> 编辑
                                </el-dropdown-item>
                                <el-dropdown-item
                                    v-if="hasPermission('sys:user:delete')"
                                    :disabled="scope.row.username==='admin'"
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
        </el-main>
        <!--  新增/更新用户  -->
        <!-- 添加和编辑用户窗口 -->
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
                    :inline="true"
                    :model="user"
                    :rules="rules"
                    label-width="80px"
                    size="small"
                >
                    <flex justify="between" wrap="wrap">
                        <el-form-item label="所属部门" prop="departmentName">
                            <el-cascader
                                ref="cascader"
                                v-model="cascaderData"
                                :filterable="true"
                                :options="departmentList"
                                :props="{ checkStrictly: true, label: 'departmentName', value:'id',children:'children'}"
                                :show-all-levels="false"
                                clearable
                                node-key="id"
                                size="mini"
                                @change="handleDepartCascadeChange()"
                            />
                        </el-form-item>
                        <el-form-item label="所属单位">
                            <el-input v-model="user.companyName" disabled></el-input>
                        </el-form-item>
                        <el-form-item label="用户名" prop="username">
                            <el-input v-model="user.username"></el-input>
                        </el-form-item>
                        <el-form-item label="姓名" prop="realName">
                            <el-input v-model="user.realName"></el-input>
                        </el-form-item>
                        <el-form-item label="电话" prop="phone">
                            <el-input v-model="user.phone"></el-input>
                        </el-form-item>
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
                    </flex>
                    <!-- 用户头像：待补充 -->
                    <el-form-item label="用户头像">
                        <el-upload
                            :action="uploadUrl"
                            :before-upload="beforeAvatarUpload"
                            :data="uploadHeader"
                            :on-success="handleAvatarSuccess"
                            :show-file-list="false"
                            border
                            class="avatar-uploader"
                        >
                            <img v-if="user.avatar" :src="user.avatar" alt="" style="width: 100px;height: 100px">
                            <i v-else class="el-icon-plus avatar-uploader-icon"/>
                        </el-upload>
                    </el-form-item>
                </el-form>
            </div>
        </system-dialog>
        <el-dialog :visible.sync="importErrorVisible" title="错误信息">
            <el-card v-for="(message,index) in errorMessages" :key="index" style="margin-top: 10px">
                <h4 style="color: red;font-size: 14px">{{ message }}</h4>
            </el-card>
        </el-dialog>
    </el-container>
</template>

<script>
import {getParentDepartmentList} from '@/api/department'
import {addUser, deleteUser, getUserList, saveUserRole, updateUser, updateUserEnable} from '@/api/user'
import SystemDialog from '@/components/Dialog/SystemDialog.vue'
import {getToken} from '@/utils/auth'
import Flex from '@/components/Flex/Flex.vue'
import {getAllRoleList} from '@/api/role'
import hasPermission from '@/router/permission'

export default {
    components: {Flex, SystemDialog},
    data() {
        //检验手机号的规则
        const validatePhone = (rule, value, callback) => {
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
        filterText: '',
        leftTreeLoading: true,
        mainLoading: false,
        containerHeight: 0,//组件高度
        tableHeight: 0, //用户列表高度
        isMobile: false,
        showDeptTree: false,
        searchCollapse: ['1'],
        deptCollapse: ['1'],
            searchDepartmentModel: { //左侧部门搜索条件
                departmentName: ''
            },
            cascaderData: [],
            departmentList: [],//左侧部门树
            searchModel: { //用户条件搜索
                departmentId: '',
                username: '',
                realName: '',
                phone: '',
                pageNo: 1,
                pageSize: 20
            },
            total: 0,
            userList: [],//用户列表数据
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
            rules: {
                departmentName: [{required: true, trigger: 'change', message: '请选择所属部门'}],
                realName: [{required: true, trigger: 'blur', message: '请填写姓名'}],
                phone: [{required: true, trigger: 'blur', validator: validatePhone}],
                username: [{required: true, trigger: 'blur', message: '请填写登录名'}],
                gender: [{required: true, trigger: 'change', message: '请选择性别'}]
            },
            userDialog: {
                title: '',
                height: 400,
                width: 600,
                visible: false
            },
            roleOptions: [],
            uploadHeader: {'token': getToken()},
            uploadUrl: process.env.VUE_APP_BASE_API + '/file/upload',
            uploadUserListUrl: process.env.VUE_APP_BASE_API + `/sysUser/importUser?token=${getToken()}`,
            downUserTemplateUrl: process.env.VUE_APP_BASE_API + `/sysUser/downloadUserTemplate?token=${getToken()}`,
            exportUserUrl: process.env.VUE_APP_BASE_API + `/sysUser/exportUser?token=${getToken()}`,
            
            importErrorVisible: false,
            errorMessages: []
        }
    },
    methods: {
        hasPermission,
        /**
         * 检测设备类型
         */
        checkDevice() {
            this.isMobile = window.innerWidth < 768
            if (this.isMobile) {
                this.showDeptTree = false
            }
        },
        /**
         * 导入成功后信息
         * @param res
         */
        handleSuccess(res) {
            if (res.code === 200) {
                this.$message.success('导入成功')
                this.search()
            } else {
                this.importErrorVisible = true
                this.errorMessages = []
                //将message中的\n
                let message = res.message.replace(/\n/g, '<br/>').replace(',', '')
                //{value: message}
                message.split('<br/>').forEach(item => {
                    if (item) {
                        this.errorMessages.push(item)
                    }
                })
            }
            this.$refs.uploadUserListRef.clearFiles()
        },
        /**
         * 下载模板
         */
        downUserTemplate() {
            window.open(this.downUserTemplateUrl)
        },
        /**
         * 导出用户列表
         */
        exportUser() {
            window.open(this.exportUserUrl)
        },
        /**
         * 展开所有部门
         */
        expandAll() {
            const nodes = this.$refs.leftTree.store._getAllNodes();
            nodes.forEach(node => {
                node.expanded = true;
            });
        },
        /**
         * 收起所有部门
         */
        collapseAll() {
            const nodes = this.$refs.leftTree.store._getAllNodes();
            nodes.forEach(node => {
                if (node.level > 1) {
                    node.expanded = false;
                }
            });
        },
        /**
         * 查询部门列表
         */
        getDeptList() {
            getParentDepartmentList(this.searchDepartmentModel).then(res => {
                this.departmentList = res.data
                this.leftTreeLoading = false
            })
        },
        /**
         * 点击左侧树节点
         * @param data 部门对象
         */
        handleNodeClick(data) {
            this.searchModel.departmentId = data.id
            this.search()
        },
        /**
         * 查询用户列表
         */
        search() {
            this.mainLoading = true
            getUserList(this.searchModel).then(res => {
                if (res.code === 200) {
                    this.userList = res.data.records
                    this.total = res.data.total
                    this.mainLoading = false
                }
            })
        },
        /**
         * 重置查询条件
         */
        resetValue() {
            this.searchModel.username = ''
            this.searchModel.realName = ''
            this.searchModel.phone = ''
            this.searchModel.departmentId = ''
            this.searchModel.pageNo = 1
            this.searchModel.pageSize = 20
            this.search()
        },
        /**
         * 重置部门树
         */
        resetButton() {
            this.filterText = ''
            this.$refs.leftTree.filter('')
            this.$refs.leftTree.setCurrentKey(null)
            this.searchModel.departmentId = ''
            this.search()
        },
        
        /**
         * 新增用户
         */
        openAddWindow() {
            this.cascaderData = []
            this.$resetForm('userForm', this.user)
            this.user.avatar = 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif'
            this.userDialog.title = '新增'
            this.userDialog.visible = true
        },
        /**
         * 编辑用户
         */
        handleEdit(row) {
            this.getDeptList()
            //设置弹框属性
            this.userDialog.title = '编辑用户'
            this.userDialog.visible = true
            //把当前编辑的数据复制到表单数据域，供回显使用
            this.$objCopy(row, this.user)
            this.cascaderData = []
            this.getWholeId(row.departmentId, this.departmentList)
        },
        /**
         * 获取当前部门id的所有父级部门id
         * @param id
         * @param treeList
         */
        getWholeId(id, treeList) {
            Array.isArray(treeList) && treeList.forEach(item => {
                if (id === item.id) {
                    this.cascaderData.push(item.id)
                    this.getWholeId(item.pid, this.departmentList)
                } else {
                    this.getWholeId(id, item.children)
                }
            })
            //倒序
            this.cascaderData.sort()
        },
        /**
         * 获取所有角色列表
         */
        getAllRoleList() {
            getAllRoleList().then(res => {
                this.roleOptions = res.data
            })
        },
        /**
         * 修改用户的启用状态
         */
        switchChange(id) {
            updateUserEnable({userId: id}).then(res => {
                if (res.code === 200) {
                    this.$message.success('修改成功')
                } else {
                    this.$message.error(res.message)
                }
            })
        },
        /**
         * 删除用户
         */
        async handleDelete(row) {
            let myConfirm = await this.$myConfirm(`确定要删除用户：${row.realName}吗?`)
            if (myConfirm) {
                deleteUser({id: row.id}).then(res => {
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
         * 导入或导出
         */
        importOrExport() {
        
        },
        /**
         * 分配角色
         */
        selectChange(value, userId) {
            //roleIds是数组
            let params = {
                userId: userId,
                roleIds: value ? [value] : []
            }
            
            saveUserRole(params).then(res => {
                if (res.code === 200) {
                    this.$message.success('分配成功')
                } else {
                    this.$message.error(res.message)
                }
            })
        },
        /**
         * 树节点过滤
         * @param value
         * @param data
         * @returns {boolean}
         */
        filterNode(value, data) {
            if (!value) return true
            return data.departmentName.indexOf(value) !== -1
        },
        /**
         * 分页大小改变
         * @param size
         */
        handleSizeChange(size) {
            this.searchModel.pageSize = size
            this.search(this.searchModel)
        },
        /**
         * 分页改变
         * @param pageNo
         */
        handleCurrentChange(pageNo) {
            this.searchModel.pageNo = pageNo
            this.search(this.searchModel)
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
        },
        /**
         * 关闭窗口
         */
        onClose() {
            this.userDialog.visible = false
        },
        /**
         * 确认新增或编辑
         */
        onConfirm() {
            this.$refs.userForm.validate(valid => {
                if (valid) {
                    if (this.user.id === '') {
                        addUser(this.user).then(res => {
                            if (res.code === 200) {
                                this.$message.success('新增成功')
                                this.userDialog.visible = false
                                this.search()
                            } else {
                                this.$message.error(res.message)
                            }
                        })
                    } else {
                        updateUser(this.user).then(res => {
                            if (res.code === 200) {
                                this.$message.success('修改成功')
                                this.userDialog.visible = false
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
         * 部门级联选择器选择事件
         */
        handleDepartCascadeChange() {
            if (this.$refs.cascader.getCheckedNodes().length > 0) {
                let departmentInfo = this.$refs.cascader.getCheckedNodes()[0].data
                this.user.departmentId = departmentInfo.id
                this.user.departmentName = departmentInfo.departmentName
                this.user.companyName = departmentInfo.companyName
                this.user.companyId = departmentInfo.companyId
            }
        },
        /**
         * 获取表格高度
         */
        getHeight() {
            let tableH = 50 //距离页面下方的高度
            this.containerHeight = window.innerHeight - tableH
            this.tableHeight = window.innerHeight - tableH - 150
        }
    },
    mounted() {
        /**
         * 挂载window.onresize事件(动态设置table高度)
         */
        let _this = this
        this.checkDevice()
        window.onresize = () => {
            if (_this.resizeFlag) {
                clearTimeout(_this.resizeFlag)
            }
            _this.resizeFlag = setTimeout(() => {
                _this.getHeight()
                _this.checkDevice()
                _this.resizeFlag = null
            }, 100)
        }
    },
    watch: {
        filterText(val) {
            this.$refs.leftTree.filter(val)
        }
    },
    created() {
        /**
         * 处理组件高度
         */
        this.getHeight()
        /**
         * 查询部门列表
         */
        this.getDeptList()
        /**
         * 查询用户列表
         */
        this.search()
        /**
         * 获取全部的角色列表
         */
        this.getAllRoleList()
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

/* 移动端样式 */
.collapse-title-container {
    display: flex;
    align-items: center;
}

.search-icon {
    font-size: 18px;
    color: #E6A23C;
    margin-right: 8px;
}

.search-status-tag {
    margin-left: 10px;
    font-size: 12px;
}

.mobile-search-collapse {
    margin-bottom: 15px;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.mobile-search-form .el-form-item {
    margin-bottom: 15px;
}

.mobile-button-group {
    display: flex;
    flex-direction: column;
    margin-top: 15px;
}

.mobile-button-group .button-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    width: 100%;
}

.mobile-button-group .el-button {
    margin-left: 0 !important;
    border-radius: 4px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.mobile-button-group .import-export-btn {
    grid-column: span 2;
    margin-top: 5px;
}

.mobile-button-group .el-button {
    margin: 5px;
}

.mobile-dept-search {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
}

.mobile-dept-search .el-input {
    flex: 1;
    margin-right: 10px;
}

.mobile-dept-search .el-button {
    height: 36px;
}

.collapse-summary {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
    margin-left: 26px;
    padding: 5px 10px;
    background-color: #f5f7fa;
    border-radius: 4px;
    max-width: 90%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
}

/* 移动端表格样式 */
.el-table--mobile {
    font-size: 12px;
}

.el-table--mobile th {
    padding: 5px 0;
}

.el-table--mobile .el-button--mini {
    padding: 5px 8px;
    font-size: 11px;
}
</style>

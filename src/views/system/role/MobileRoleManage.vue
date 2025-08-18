<template>
    <div class="mobile-role-container">
        <div class="mobile-role-header">
            <h3>分配权限</h3>
        </div>
        
        <div class="mobile-role-content">
            <div class="mobile-role-info">
                <el-input
                    v-model="name"
                    disabled
                    placeholder="角色名称"
                    size="small"
                />
            </div>
            
            <div class="mobile-permission-tree">
                <el-collapse v-model="activeNames" accordion>
                    <el-collapse-item
                        v-for="(level1, index1) in data"
                        :key="index1"
                        :name="index1"
                    >
                        <template slot="title">
                            <i class="el-icon-folder-opened permission-icon"></i>
                            <span class="level1-title">{{ level1.label }}</span>
                        </template>
                        
                        <div class="level2-container">
                            <div
                                v-for="(level2, index2) in level1.children"
                                :key="index2"
                                class="level2-item"
                            >
                                <div class="level2-header">
                                    <i class="el-icon-document permission-icon"></i>
                                    <span class="level2-title">{{ level2.label }}</span>
                                </div>
                                
                                <div class="level2-permissions">
                                    <div v-if="level2.children.length" class="permission-select-all">
                                        <el-checkbox
                                            v-model="selectAll[level2.label]"
                                            @change="selectColumn(level2.children, $event, {}, 'all', level2.label)"
                                        >
                                            全选
                                        </el-checkbox>
                                    </div>
                                    
                                    <div
                                        v-for="(model, indexc) in level2.children"
                                        v-if="model.name !== '标识页面权限'"
                                        :key="indexc"
                                        class="permission-item"
                                    >
                                        <el-checkbox
                                            v-model="model.checked"
                                            @change="selectColumn(model, $event, level2, 'single', level2.label)"
                                        >
                                            {{ model.label }}
                                        </el-checkbox>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </el-collapse-item>
                </el-collapse>
            </div>
        </div>
        
        <div class="mobile-role-footer">
            <el-button
                :loading="loading"
                size="small"
                style="width: 100%"
                type="primary"
                @click="submit"
            >
                保存
            </el-button>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        data: {
            type: Array,
            default: () => []
        },
        roleName: {
            type: String,
            default: ''
        },
        loading: {
            type: Boolean,
            default: false
        },
        roleId: {
            type: Number,
            default: null
        }
    },
    data() {
        return {
            name: '',
            checkedList: [],
            selectAll: {},
            activeNames: [] // 控制折叠面板展开状态
        }
    },
    watch: {
        roleName(val) {
            this.name = val
        }
    },
    mounted() {
        this.name = this.roleName || ''
        if (this.roleName) {
            this.setCheckedItems(this.data)
        }
    },
    methods: {
        selectColumn(data, checked, childData, key, allName) {
            // 全选 涉及到数据记录的更改、单选的变动
            if (key === 'all') {
                this.selectAll[allName] = checked
                for (let i = 0; i < data.length; i++) {
                    data[i].checked = checked
                    this.setCheckedData(data[i], checked)
                }
            } else if (key === 'single') { // 单选   涉及到数据记录的更改、全选的变动
                if (data.code.includes('check') && !checked) {
                    childData.children.map(v => {
                        this.$set(v, 'checked', false)
                    })
                    
                    childData.children.map(child => {
                        this.checkedList.map(item => {
                            if (child.id === item.id) {
                                this.$set(item, 'checked', child.checked)
                            }
                        })
                    })
                    let tempList = []
                    let list = JSON.parse(JSON.stringify(this.checkedList))
                    for (let i = 0; i < list.length; i++) {
                        if (list[i].checked) {
                            tempList.push(list[i])
                        }
                    }
                    this.$set(this, 'checkedList', tempList)
                    
                    this.selectAll[allName] = false
                }
                
                const checkObj = childData.children.find(v => v.code.includes('check')) || {}
                if (!data.code.includes('check') && !checkObj.checked && checked) {
                    this.$set(checkObj, 'checked', true)
                    this.checkedList.push(checkObj)
                }
                this.setCheckedData(data, checked)
                this.selectAll[allName] = this.hasAllChecked(childData.children) // 子集一变动，全选重置
            }
        },
        // 数据增删当前已选
        setCheckedData(role, value) {
            if (!role) {
                return
            }
            // 选中就添加，取消就去掉()
            const hadLen = this.hasExist(role)
            
            if (hadLen < 0 && value) {
                this.checkedList.push(role)
            }
            if (hadLen >= 0 && !value) {
                this.checkedList.splice(this.hasExist(role), 1)
            }
        },
        // 该选项是否已经存在
        hasExist(role) {
            const list = this.checkedList
            let exist = -1
            for (let i = 0; i < list.length; i++) {
                if (list[i] && list[i].hasOwnProperty('id')) {
                    if (list[i].id === role.id) {
                        exist = i
                    }
                }
            }
            return exist
        },
        /**
         * 是否全部选中
         * 检查传入的 list 数组中的所有对象是否都具有 checked 属性且值为 true
         * @param list
         * @returns {*}
         */
        hasAllChecked(list) {
            return list.every(item => {
                return item.checked
            })
        },
        // 对于编辑而言，一进来应该把标记的选项保存
        setCheckedItems(list) {
            if (list && list.length) {
                list.forEach(item => {
                    if (item.children) {
                        item.children.forEach(menu => {
                            if (menu.children) {
                                const permissions = menu.children
                                this.selectAll = {
                                    ...this.selectAll,
                                    [menu.label]: this.hasAllChecked(permissions)
                                }
                                this.checkedList = [
                                    ...this.checkedList,
                                    ...permissions.filter(permission => permission.checked)
                                ]
                            }
                        })
                    }
                })
            }
        },
        submit() {
            if (!this.name) {
                this.doAlert(false, '请填写角色名称！')
                return
            }
            
            const roleOption = {
                roleId: this.roleId,
                permissions: this.checkedList
            }
            this.$emit('save-role', roleOption)
        },
        // 提示框封装
        doAlert(type, message) {
            if (type) {
                this.$message({
                    title: '成功',
                    message: message,
                    type: 'success'
                })
            } else {
                this.$message({
                    title: '警告',
                    message: message,
                    type: 'warning'
                })
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.mobile-role-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f5f5f5;
}

.mobile-role-header {
    background-color: #fff;
    padding: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 10;
    
    h3 {
        margin: 0;
        text-align: center;
        font-size: 18px;
        font-weight: 500;
    }
}

.mobile-role-content {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
}

.mobile-role-info {
    margin-bottom: 20px;
    
    ::v-deep .el-input__inner {
        background-color: #f0f0f0;
        border: none;
        border-radius: 20px;
        padding-left: 15px;
        font-size: 14px;
    }
}

.mobile-permission-tree {
    ::v-deep .el-collapse {
        border: none;
    }
    
    ::v-deep .el-collapse-item__header {
        background-color: #fff;
        border: 1px solid #ebeef5;
        border-radius: 8px;
        margin-bottom: 10px;
        padding: 12px 15px;
        font-size: 15px;
        font-weight: 500;
    }
    
    ::v-deep .el-collapse-item__wrap {
        background-color: #fff;
        border: 1px solid #ebeef5;
        border-top: none;
        border-radius: 0 0 8px 8px;
        margin-bottom: 15px;
    }
    
    ::v-deep .el-collapse-item__content {
        padding: 15px;
    }
}

.permission-icon {
    margin-right: 8px;
    color: #409eff;
}

.level1-title {
    font-weight: 500;
}

.level2-container {
    padding: 5px 0;
}

.level2-item {
    margin-bottom: 15px;
    
    &:last-child {
        margin-bottom: 0;
    }
}

.level2-header {
    display: flex;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 10px;
}

.level2-title {
    font-weight: 500;
    font-size: 14px;
}

.level2-permissions {
    padding: 0 10px;
}

.permission-select-all {
    padding: 8px 0;
    border-bottom: 1px solid #f5f5f5;
    margin-bottom: 8px;
    
    ::v-deep .el-checkbox__label {
        font-weight: 500;
        color: #606266;
    }
}

.permission-item {
    padding: 8px 0;
    border-bottom: 1px solid #f9f9f9;
    
    &:last-child {
        border-bottom: none;
    }
    
    ::v-deep .el-checkbox__label {
        font-size: 13px;
    }
}

.mobile-role-footer {
    background-color: #fff;
    padding: 15px;
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
    z-index: 10;
    
    ::v-deep .el-button {
        border-radius: 20px;
        padding: 10px;
        font-size: 16px;
    }
}

// 响应式优化
@media screen and (max-width: 768px) {
    .mobile-role-container {
        height: 100vh;
        max-height: 100vh;
    }
    
    .mobile-role-content {
        padding: 10px;
    }
    
    ::v-deep .el-collapse-item__header {
        padding: 10px 12px;
        font-size: 14px;
    }
    
    ::v-deep .el-collapse-item__content {
        padding: 12px;
    }
}
</style>
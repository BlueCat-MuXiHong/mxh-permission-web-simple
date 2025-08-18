<template>
    <div class="roles-box">
        <div class="roles-box__content">
            <div class="role-name">
                <span>角色名称</span>
                <el-input
                    v-model="name"
                    disabled
                    maxlength="30"
                    placeholder="请输入角色名称"
                    size="small"
                    style="width: calc(100% - 80px)"
                />
            </div>
            <div class="role-table">
                <div class="role-all_show">权限配置</div>
                <div class="table-head">
                    <div>模块权限</div>
                    <div>菜单权限</div>
                    <div>按钮权限</div>
                </div>
                <div class="role-table-wrapper">
                    <el-scrollbar
                        ref="scrollbar"
                        class="role-table__scrollbar"
                        tag="div"
                        wrap-style="overflow-x: hidden;"
                    >
                        <table>
                            <tr
                                v-for="(level1, index1) in data"
                                :key="index1"
                            >
                                <td style="flex: none;text-align: center;width: 170px;">
                                    <div class="level1">{{ level1.label }}</div>
                                </td>
                                <td style="flex: none;text-align: center;">
                                    <div class="content-wrapper">
                                        <div
                                            v-for="(level2, index2) in level1.children"
                                            :key="index2"
                                            class="level2"
                                            style="display: flex;"
                                        >
                                            <div
                                                class="level2-name"
                                                style="flex: none;width: 170px;"
                                            >{{ level2.label }}
                                            </div>
                                            <div class="content-children">
                                                <div
                                                    class="level4"
                                                    style="display: flex;flex-wrap: wrap;"
                                                >
                                                    <div class="roles_check">
                            <span v-if="level2.children.length">
                              <el-checkbox
                                  v-model="selectAll[level2.label]"
                                  @change="selectColumn(level2.children,$event,{},'all',level2.label)"
                              >全选</el-checkbox>
                            </span>
                                                        <span v-else>无</span>
                                                    </div>
                                                    <div
                                                        v-for="(model,indexc) in level2.children"
                                                        :key="indexc"
                                                        class
                                                    >
                                                        <div
                                                            v-if="model.name !=='标识页面权限' "
                                                            class="roles_check"
                                                        >
                                                            <el-checkbox
                                                                v-model="model.checked"
                                                                @change="selectColumn(model, $event, level2, 'single', level2.label)"
                                                            >{{ model.label }}
                                                            </el-checkbox>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </el-scrollbar>
                </div>
            </div>
            <div
                class="btn-bottom"
                style="text-align: center;margin-top: 20px;"
            >
                <el-button
                    :loading="loading"
                    size="small"
                    type="primary"
                    @click="submit"
                >保存
                </el-button>
            </div>
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
        //类型为数字
        roleId: {
            type: Number,
            default: null
        }
    },
    data() {
        return {
            name: '',
            checkedList: [],
            selectAll: {}
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
            // if (!this.checkedList.length) {
            //   this.doAlert(false, '权限为空！')
            //   return
            // }
            
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

<style scoped>
.role-name {
    margin-top: 20px;
}

.role-name span {
    font-size: 14px;
    color: #606266;
    width: 70px;
    line-height: 38px;
    padding-right: 15px;
}

.role-name input {
    width: calc(100% - 95px);
    outline: none;
    border: 1px solid #ebebeb;
    height: 38px;
    border-radius: 19px;
    background: rgba(245, 248, 253, 1);
    box-sizing: border-box;
    padding: 0 15px;
    font-size: 15px;
}

.role-all_show {
    font-size: 16px;
    color: #303133;
    margin-bottom: 15px;
}

.role-table {
    margin-top: 20px;
}

.table-head {
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    font-size: 16px;
    border: 1px solid #ebebeb;
    box-sizing: border-box;
}

.table-head > div:first-child,
.table-head > div:nth-child(2),
.table-head > div:nth-child(3) {
    width: 170px;
    text-align: center;
}

.table-head > div:last-child {
    flex: 1;
    text-align: center;
}

.role-table table {
    width: 100%;
    margin: 0;
    padding: 0;
    border-collapse: collapse;
}

tr td {
    padding: 0;
    margin: 0;
}

.title-about__model {
    width: 170px;
    text-align: center;
}

.title-about__name {
    border-top: solid 1px #ebebeb;
    border-left: solid 1px #ebebeb;
}

.roles_list {
    width: 100%;
    display: flex;
}

.roles_pege {
    width: 170px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px 10px;
    border-top: solid 1px #ebebeb;
    border-left: solid 1px #ebebeb;
}

td {
    border-left: solid 1px #ebebeb;
    border-right: solid 1px #ebebeb;
    border-bottom: solid 1px #ebebeb;
}

.level1 {
    padding: 10px 0;
}

.level2-name {
    padding: 10px 0;
}

.level4 {
    border-left: solid 1px #ebebeb;
}

.level2:not(:last-child) {
    border-bottom: solid 1px #ebebeb;
}

.level3:not(:last-child) {
    border-bottom: solid 1px #ebebeb;
}

.level2,
.level3,
.level4 {
    align-items: center;
}

.roles_roles {
    display: flex;
    align-items: center;
    width: calc(100% - 170px);
    flex-wrap: wrap;
    border-top: solid 1px #ebebeb;
    border-left: solid 1px #ebebeb;
    border-right: solid 1px #ebebeb;
}

.roles_check {
    padding: 10px;
}

.role-modal-footer {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 15px;
}

.role-table-wrapper {
    height: 38vh;
    /* border-bottom: solid 1px #ebebeb; */
}

.role-table__scrollbar {
    width: 100%;
    height: 100%;
    overflow: hidden;
}
</style>
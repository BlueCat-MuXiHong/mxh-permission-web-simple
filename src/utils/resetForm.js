//重置表单和表单数据
/**
 * 重置表单和表单数据
 * @param {string} formName - 表单引用名称
 * @param {Object} obj - 表单数据对象
 */
export default function resetForm(formName, obj) {
//清空表单
    if (this.$refs[formName]) {
        this.$refs[formName].resetFields();
    }
//清空数据域
    if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
            obj[key] = '';
        })
    }
}
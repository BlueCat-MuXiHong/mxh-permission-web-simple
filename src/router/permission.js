/**
 * 权限判断
 * @param code
 */
export default function hasPermission(code) {
    let codeList = this.$store.getters.roles
    return codeList.includes(code)
}

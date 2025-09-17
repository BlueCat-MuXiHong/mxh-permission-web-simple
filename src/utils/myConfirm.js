import { MessageBox } from 'element-ui'

/**
 * 删除弹框
 * @param text
 * @returns {Promise<unknown>}
 * @constructor
 */
export default function MyConfirm(text) {
  return new Promise((resolve, reject) => {
    MessageBox.confirm(text, '系统提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      resolve(true)
    }).catch(() => {
      reject(false)
    })
  }).catch(() => {})
}

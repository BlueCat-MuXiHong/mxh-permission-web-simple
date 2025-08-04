/**
 * 验证码API模块
 * 提供验证码获取和验证的接口
 */

import httpClient from '@/utils/request'

/**
 * 获取验证码图片
 * @param {Object} data - 请求参数
 * @param {String} data.captchaType - 验证码类型
 * @param {String} data.clientUid - 客户端唯一标识
 * @param {Number} data.ts - 时间戳
 * @returns {Promise} 包含验证码数据的Promise
 */
export function getCaptcha(data) {
    return httpClient.post('/auth/getCaptcha', data)
}

/**
 * 验证验证码
 * @param {Object} data - 验证参数
 * @param {String} data.captchaType - 验证码类型
 * @param {String} data.pointJson - 验证点坐标(加密)
 * @param {String} data.token - 验证token
 * @returns {Promise} 包含验证结果的Promise
 */
export function checkCaptcha(data) {
    return httpClient.post('/auth/checkCaptcha', data)
}
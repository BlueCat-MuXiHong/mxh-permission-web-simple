import defaultSettings from '@/settings'

/**
 * 获取页面标题
 * @type {string|string}
 */
const title = defaultSettings.title || 'Vue Admin Template'

/**
 * 获取页面标题
 * @param pageTitle
 * @returns {string}
 */
export default function getPageTitle(pageTitle) {
    return pageTitle ? `${pageTitle} - ${title}` : title
}

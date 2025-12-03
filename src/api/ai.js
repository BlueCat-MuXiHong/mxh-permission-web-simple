import httpClient from '@/utils/request'

/**
 * 聊天接口
 * @param params
 * @returns
 */
export async function ask(params) {
    return httpClient.post('/chat/ask', params)
}

/**
 * 获取流式消息接口  /chat/stream/{taskId}
 * @param params
 * @returns
 */
export async function getStreamMessage(params) {
    return httpClient.get(`/chat/stream/${params.taskId}`, params)
}



import request from '@/utils/request'

// AI聊天接口
export function chatWithAI(message) {
  return request({
    url: '/ai/chat',
    method: 'post',
    data: message
  })
} 
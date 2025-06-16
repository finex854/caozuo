import request from '@/utils/request'

// 分页查询操作日志
export function getOperationLogs(params) {
  return request({
    url: '/operation-logs/page',
    method: 'get',
    params
  })
}

// 获取操作日志详情
export function getOperationLogDetail(id) {
  return request({
    url: `/operation-logs/${id}`,
    method: 'get'
  })
} 
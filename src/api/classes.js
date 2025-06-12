import request from '@/utils/request'

export function findAll() {
  return request({
    url: '/classes',
    method: 'get'
  })
}

export function add(classes) {
  return request({
    url: '/classes',
    method: 'post',
    data: classes
  })
}

export function update(classes) {
  return request({
    url: '/classes',
    method: 'put',
    data: classes
  })
}

export function deleteById(id) {
  return request({
    url: '/classes/' + id,
    method: 'delete'
  })
}

export function selectById(id) {
  return request({
    url: '/classes/' + id,
    method: 'get'
  })
}

export function page(collegeName, majorName, className, page, pageSize) {
  return request({
    url: '/classes?collegeName=' + collegeName + '&majorName=' + majorName + '&className=' + className + '&page=' + page + '&pageSize=' + pageSize,
    method: 'get'
  })
}

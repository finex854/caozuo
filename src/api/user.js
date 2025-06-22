import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/users/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/users/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/users/logout',
    method: 'post'
  })
}

export function updateProfile(data) {
  return request({
    url: '/users/profile',
    method: 'put',
    data
  })
}

export function updatePassword(data) {
  return request({
    url: '/users/password',
    method: 'put',
    data
  })
}

// 用户管理相关API
export function getUserList(params) {
  return request({
    url: '/users/list',
    method: 'get',
    params
  })
}

export function addUser(data) {
  return request({
    url: '/users',
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: '/users',
    method: 'put',
    data
  })
}

export function deleteUser(id) {
  return request({
    url: `/users/${id}`,
    method: 'delete'
  })
}
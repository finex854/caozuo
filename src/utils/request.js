import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import Router from '@/router'
import { removeToken, getToken } from '@/utils/auth'
// import { Message, MessageBox } from 'element-ui'

const service = axios.create({
  baseURL: '/api', // url = base url + request url
  timeout: 5000 // request timeout
})

// 白名单路径，不需要token的接口
const whiteList = [
  '/users/login',
  '/users/emp/register',
  '/users/student/register',
  '/depts',
  '/classes',
  '/report/emp/job',
  '/report/student/class',
  '/emps/export' // 添加导出接口到白名单
]

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    const token = getToken()
    if (token) {
      // let each request carry token
      config.headers['token'] = token
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data

    // 如果是白名单接口，直接返回数据
    if (whiteList.some(path => response.config.url.includes(path))) {
      return response
    }

    // 如果返回的状态码不是1，说明接口有问题，把错误信息显示出来
    if (res.code !== 1) {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        MessageBox.confirm('您已登出，请重新登录', '确认登出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return response
    }
  },
  error => {
    console.log('err' + error) // for debug
    // 如果响应中包含错误信息，直接显示后端返回的错误信息
    if (error.response && error.response.data && error.response.data.msg) {
      Message({
        message: error.response.data.msg,
        type: 'error',
        duration: 5 * 1000
      })
    } else {
      // 如果没有具体的错误信息，才显示默认的错误提示
      Message({
        message: '请求失败，请稍后重试',
        type: 'error',
        duration: 5 * 1000
      })
    }
    return Promise.reject(error)
  }
)

export default service

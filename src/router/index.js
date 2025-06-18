import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Layout from '@/layout'

export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/register/emp',
    component: () => import('@/views/register/emp'),
    hidden: true
  },
  {
    path: '/register/student',
    component: () => import('@/views/register/student'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '首页', icon: 'dashboard' }
    }]
  },

  {
    path: '/example',
    component: Layout,
    redirect: '/example',
    name: 'Example',
    meta: { title: '班级学员管理', icon: 'el-icon-s-help' },
    children: [
      {
        path: 'classes',
        name: 'Classes',
        component: () => import('@/views/classes'),
        meta: { title: '班级管理', icon: 'el-icon-menu' }
      },
      {
        path: 'student',
        name: 'Student',
        component: () => import('@/views/student'),
        meta: { title: '学员管理', icon: 'el-icon-user-solid' }
      }
    ]
  }, {
    path: '/system',
    component: Layout,
    redirect: '/system/user',
    name: 'System',
    meta: { title: '系统管理', icon: 'el-icon-setting', roles: ['ROLE_ADMIN', 'ROLE_EMP'] },
    children: [
      {
        path: 'dept',
        name: 'Dept',
        component: () => import('@/views/dept'),
        meta: { title: '部门管理', icon: 'el-icon-menu', roles: ['ROLE_ADMIN', 'ROLE_EMP'] }
      },
      {
        path: 'emp',
        name: 'Emp',
        component: () => import('@/views/emp'),
        meta: { title: '员工管理', icon: 'el-icon-user-solid', roles: ['ROLE_ADMIN', 'ROLE_EMP'] }
      }
    ]
  },
  {
    path: '/report',
    component: Layout,
    redirect: '/report',
    name: 'Report',
    meta: { title: '数据统计管理', icon: 'el-icon-s-tools', roles: ['ROLE_ADMIN', 'ROLE_EMP'] },
    children: [
      {
        path: 'emp-report',
        name: 'emp-report',
        component: () => import('@/views/emp-report'),
        meta: { title: '员工信息统计', icon: 'el-icon-s-data', roles: ['ROLE_ADMIN', 'ROLE_EMP'] }
      },
      {
        path: 'student-report',
        name: 'student-report',
        component: () => import('@/views/student-report'),
        meta: { title: '学员信息统计', icon: 'el-icon-s-data', roles: ['ROLE_ADMIN', 'ROLE_EMP'] }
      }
    ]
  },
  {
    path: '/message',
    component: Layout,
    redirect: '/message',
    meta: { title: '通知', icon: 'el-icon-s-comment' },
    children: [{
      path: 'message',
      name: 'message',
      component: () => import('@/views/message'),
      meta: { title: '通知', icon: 'el-icon-s-comment' }
    },
    {
      path: 'operation-log',
      name: 'OperationLog',
      component: () => import('@/views/operationLog/index'),
      meta: { title: '操作日志', icon: 'el-icon-s-order', roles: ['ROLE_ADMIN'] }
    }]
  },
  {
    path: '/ai',
    component: Layout,
    redirect: '/ai/chat',
    name: 'AI',
    meta: { title: 'AI智能助手', icon: 'el-icon-service' },
    children: [
      {
        path: 'chat',
        name: 'AIChat',
        component: () => import('@/views/ai/chat'),
        meta: { title: 'AI聊天', icon: 'el-icon-chat-dot-round' }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('zcn_token')
  // 定义不需要登录就可以访问的路由
  const whiteList = ['/login', '/register/emp', '/register/student']

  if (whiteList.includes(to.path)) {
    // 如果是访问白名单中的页面，直接放行
    next()
  } else {
    // 如果不是访问白名单中的页面，需要验证token
    if (token) {
      next()
    } else {
      next('/login')
    }
  }
})

// 全局后置守卫
router.afterEach((to, from) => {
  const token = localStorage.getItem('zcn_token')
  const whiteList = ['/login', '/register/emp', '/register/student']
  if (!token && !whiteList.includes(to.path)) {
    router.replace('/login')
  }
})

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router

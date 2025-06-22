import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'
import SockJS from '../utils/sockjs'
import '../utils/stomp'
import { Notification } from 'element-ui'
Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user
  },
  getters,
  state: {
    stomp: null,
    isConnected: false
  },
  actions: {
    connect(context) {
      // 连接Stomp站点
      // eslint-disable-next-line no-undef
      context.state.stomp = Stomp.over(new SockJS('/api/ws'))
      context.state.stomp.connect({}, () => {
        /**
         * 订阅系统广播通知消息
         */
        context.state.stomp.subscribe('/topic/stream',msg =>{

          // 处理接收到的消息
          // 弹框点击跳转
          Notification({
            title: '公告列表',
            message: msg.body,
            type: 'info',
            duration: 10000,
            onClick: () => {
              // 跳转到指定页面
              router.push('/notice/notice-list')
            }
          })
          console.log('==================',msg)
        })
      },error => {
        console.log('连接失败~',error)
      })
    },
    disconnect(context){
      if (context.state.stomp!=null) {
        context.state.stomp.disconnect()
        console.log('关闭连接~')
      }
    }
  }
})

export default store
<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img :src="userAvatar" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <router-link to="/">
            <el-dropdown-item>
              首页
            </el-dropdown-item>
          </router-link>
          
          <router-link to="/profile">
            <el-dropdown-item>
              个人信息
            </el-dropdown-item>
          </router-link>

          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">退出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import { removeToken } from '@/utils/auth'
import { getInfo } from '@/api/user'

export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  data() {
    return {
      currentUserInfo: null
    }
  },
  computed: {
    ...mapGetters([
      'sidebar'
    ]),
    userAvatar() {
      if (this.currentUserInfo && this.currentUserInfo.avatar) {
        return this.currentUserInfo.avatar
      }
      return require('@/assets/logo/zfxlogo.png')
    }
  },
  mounted() {
    this.loadUserInfo()
    // 监听用户信息更新事件
    this.$root.$on('updateUserInfo', this.updateUserInfo)
  },
  beforeDestroy() {
    // 移除事件监听
    this.$root.$off('updateUserInfo', this.updateUserInfo)
  },
  methods: {
    // 加载用户信息
    async loadUserInfo() {
      try {
        const token = localStorage.getItem('zcn_token')
        console.log('当前token:', token)
        if (token) {
          const response = await getInfo(token)
          console.log('获取用户信息响应:', response)
          if (response.data.code === 1) {
            this.currentUserInfo = response.data.data
            console.log('设置用户信息:', this.currentUserInfo)
            // 更新localStorage中的用户信息
            localStorage.setItem('userInfo', JSON.stringify(this.currentUserInfo))
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        // 如果获取失败，使用localStorage中的缓存信息
        const cachedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        this.currentUserInfo = cachedUserInfo
      }
    },
    
    // 更新用户信息（供其他组件调用）
    updateUserInfo() {
      this.loadUserInfo()
    },
    
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      try {
        await this.$confirm('确认退出登录吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        removeToken()
        this.$router.push('/login')
      } catch (error) {
        console.log('取消退出')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>

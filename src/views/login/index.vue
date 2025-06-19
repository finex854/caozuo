<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on" label-position="left">

      <div class="title-container">
        <h3 class="title">陈哥の管理系统</h3>
      </div>

      <el-form-item prop="username">
        <el-input
          ref="username"
          v-model="loginForm.username"
          placeholder="用户名"
          name="username"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          :key="passwordType"
          ref="password"
          v-model="loginForm.password"
          :type="passwordType"
          placeholder="密码"
          name="password"
          tabindex="2"
          auto-complete="on"
          @keyup.enter.native="handleLogin"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>

      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleLogin">登录</el-button>

      <div class="tips">
        <span>还没有账号？</span>
        <router-link to="/register/emp">员工注册</router-link>
        <span>或</span>
        <router-link to="/register/student">学生注册</router-link>
      </div>

    </el-form>
  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'
import { login } from '@/api/user'
import { setToken } from '@/utils/auth'
export default {
  name: 'Login',
  data() {
    // 用户名校验规则
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('请输入正确的用户名'))
      } else {
        callback()
      }
    }

    // 用户名校验规则
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('密码长度至少为6位'))
      } else {
        callback()
      }
    }

    // 数据模型
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined
    }
  },

  methods: {
    // 展示密码
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },

    // 登录方法
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          console.log('Login Form:', this.loginForm)
          login(this.loginForm).then(response => {
            console.log('Login Response:', response)
            const res = response.data
            if (res.code === 1) {
              console.log('登录返回数据:', res.data)
              setToken(res.data.token)
              // 存储role和token到localStorage
              localStorage.setItem('userInfo', JSON.stringify({
                role: res.data.role,
                token: res.data.token
              }))
              this.$message.success('登录成功')
              this.$router.push({ path: this.redirect || '/' })
            } else {
              this.$message.error(res.message || '登录失败')
            }
            this.loading = false
          }).catch(error => {
            console.log('Login Error:', error)
            this.$message.error('登录失败，请重试')
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$bg: #1a1a1a;
$primary: #409EFF;
$success: #67C23A;
$warning: #E6A23C;
$danger: #F56C6C;
$info: #909399;
$text-primary: #303133;
$text-regular: #606266;
$text-secondary: #909399;
$border-color: #DCDFE6;
$light-gray: #f5f7fa;

.login-container {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d3a4b 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;

  .login-form {
    width: 480px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }
  }

  .title-container {
    text-align: center;
    margin-bottom: 40px;

    .title {
      font-size: 28px;
      color: $text-primary;
      font-weight: 600;
      margin: 0;
      position: relative;
      display: inline-block;
      padding-bottom: 10px;

      &:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 3px;
        background: $primary;
        border-radius: 2px;
      }
    }
  }

  .el-form-item {
    margin-bottom: 25px;
    position: relative;

    .el-form-item__label {
      color: $text-regular;
      font-weight: 500;
    }

    .el-input {
      position: relative;

      .el-input__inner {
        height: 45px;
        line-height: 45px;
        border-radius: 8px;
        border: 1px solid $border-color;
        background: $light-gray;
        color: $text-primary;
        transition: all 0.3s ease;
        padding-left: 45px; // 为图标留出空间

        &:hover, &:focus {
          border-color: $primary;
          background: #fff;
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
        }
      }
    }
  }

  .el-button {
    width: 100%;
    height: 45px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 1px;
    background: $primary;
    border: none;
    color: #fff;
    transition: all 0.3s ease;
    margin-top: 10px;

    &:hover {
      background: lighten($primary, 10%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
    }

    &:active {
      transform: translateY(0);
    }
  }

  .tips {
    text-align: center;
    margin-top: 20px;
    color: $text-secondary;
    font-size: 14px;

    a {
      color: $primary;
      text-decoration: none;
      font-weight: 500;
      margin: 0 5px;
      transition: all 0.3s ease;

      &:hover {
        color: lighten($primary, 10%);
        text-decoration: underline;
      }
    }
  }

  .svg-container {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: $text-secondary;
    font-size: 18px;
    z-index: 1;
    pointer-events: none; // 防止图标影响输入框交互
  }

  .show-pwd {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: $text-secondary;
    cursor: pointer;
    font-size: 18px;
    z-index: 1;
    transition: all 0.3s ease;

    &:hover {
      color: $primary;
    }
  }

  // 错误提示样式
  .el-form-item__error {
    color: $danger;
    font-size: 12px;
    padding-top: 4px;
  }
}
</style>

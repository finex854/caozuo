<template>
  <div class="register-container">
    <el-form ref="registerForm" :model="registerForm" :rules="registerRules" class="register-form" label-width="100px">
      <div class="title-container">
        <h3 class="title">学生注册</h3>
      </div>

      <el-form-item label="用户名" prop="username">
        <el-input v-model="registerForm.username" placeholder="请输入用户名" />
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input
          v-model="registerForm.password"
          :type="passwordType"
          placeholder="请输入密码"
          @keyup.enter.native="handleRegister"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>

      <el-form-item label="姓名" prop="name">
        <el-input v-model="registerForm.name" placeholder="请输入姓名" />
      </el-form-item>

      <el-form-item label="性别" prop="gender">
        <el-select v-model="registerForm.gender" placeholder="请选择性别">
          <el-option label="男" :value="1" />
          <el-option label="女" :value="2" />
        </el-select>
      </el-form-item>

      <el-form-item label="年龄" prop="age">
        <el-input-number v-model="registerForm.age" :min="1" :max="100" />
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <el-input v-model="registerForm.phone" placeholder="请输入手机号" />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input v-model="registerForm.email" placeholder="请输入邮箱" />
      </el-form-item>

      <el-form-item label="地址" prop="address">
        <el-input v-model="registerForm.address" placeholder="请输入地址" />
      </el-form-item>

      <el-form-item label="班级" prop="classId">
        <el-select v-model="registerForm.classId" placeholder="请选择班级">
          <el-option
            v-for="item in classOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleRegister">注册</el-button>

      <div class="tips">
        <span>已有账号？</span>
        <router-link to="/login">立即登录</router-link>
      </div>
    </el-form>
  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'
import { findAll } from '@/api/classes'
import request from '@/utils/request'

export default {
  name: 'StudentRegister',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('请输入正确的用户名'))
      } else {
        callback()
      }
    }
    const validatePhone = (rule, value, callback) => {
      if (value && !/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error('请输入正确的手机号'))
      } else {
        callback()
      }
    }
    const validateEmail = (rule, value, callback) => {
      if (value && !/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(value)) {
        callback(new Error('请输入正确的邮箱地址'))
      } else {
        callback()
      }
    }
    const validateAge = (rule, value, callback) => {
      if (value && (value < 1 || value > 100)) {
        callback(new Error('请输入正确的年龄'))
      } else {
        callback()
      }
    }

    return {
      registerForm: {
        username: '',
        password: '',
        name: '',
        gender: null,
        age: '',
        phone: '',
        email: '',
        address: '',
        classId: ''
      },
      registerRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
        age: [{ required: true, trigger: 'blur', validator: validateAge }],
        phone: [{ trigger: 'blur', validator: validatePhone }],
        email: [{ trigger: 'blur', validator: validateEmail }],
        classId: [{ required: true, message: '请选择班级', trigger: 'change' }]
      },
      loading: false,
      genderList: [
        { id: 1, name: '男' },
        { id: 2, name: '女' }
      ],
      classOptions: [],
      genderOptions: [
        { value: 1, label: '男' },
        { value: 2, label: '女' }
      ],
      passwordType: 'password'
    }
  },
  created() {
    this.getClassList()
  },
  methods: {
    async getClassList() {
      try {
        const res = await findAll()
        if (res.data.code === 1) {
          this.classOptions = res.data.data.map(item => ({
            id: item.id,
            name: item.clazzName
          }))
        }
      } catch (error) {
        console.error('获取班级列表失败:', error)
        this.$message.error('获取班级列表失败')
      }
    },
    handleRegister() {
      this.$refs.registerForm.validate(valid => {
        if (valid) {
          this.loading = true
          request({
            url: '/users/student/register',
            method: 'post',
            data: this.registerForm
          }).then(response => {
            if (response.data.code === 1) {
              this.$message.success('注册成功')
              this.$router.push('/login')
            } else {
              this.$message.error(response.data.message || '注册失败')
            }
            this.loading = false
          }).catch(error => {
            console.log('Register Error:', error)
            this.$message.error('注册失败，请重试')
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    showPwd() {
      this.passwordType = this.passwordType === 'password' ? 'text' : 'password'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/register.scss';
</style> 
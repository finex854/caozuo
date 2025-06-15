<template>
  <div class="register-container">
    <el-form ref="registerForm" :model="registerForm" :rules="registerRules" class="register-form" label-width="100px">
      <div class="title-container">
        <h3 class="title">员工注册</h3>
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

      <el-form-item label="手机号" prop="phone">
        <el-input v-model="registerForm.phone" placeholder="请输入手机号" />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input v-model="registerForm.email" placeholder="请输入邮箱" />
      </el-form-item>

      <el-form-item label="性别" prop="gender">
        <el-select v-model="registerForm.gender" placeholder="请选择性别">
          <el-option label="男" :value="1" />
          <el-option label="女" :value="2" />
        </el-select>
      </el-form-item>

      <el-form-item label="职位" prop="job">
        <el-select v-model="registerForm.job" placeholder="请选择职位">
          <el-option label="班主任" :value="1" />
          <el-option label="讲师" value="2" />
          <el-option label="学工主管" value="3" />
          <el-option label="教研主管" value="4" />
        </el-select>
      </el-form-item>

      <el-form-item label="入职日期" prop="entryDate">
        <el-date-picker
          v-model="registerForm.entryDate"
          type="date"
          placeholder="选择入职日期"
          value-format="yyyy-MM-dd"
        />
      </el-form-item>

      <el-form-item label="部门" prop="deptId">
        <el-select v-model="registerForm.deptId" placeholder="请选择部门">
          <el-option
            v-for="item in deptOptions"
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
import { findAll } from '@/api/dept'
import request from '@/utils/request'

export default {
  name: 'EmpRegister',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('请输入正确的用户名'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('密码长度至少为6位'))
      } else {
        callback()
      }
    }
    const validatePhone = (rule, value, callback) => {
      if (!/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error('请输入正确的手机号'))
      } else {
        callback()
      }
    }
    const validateEmail = (rule, value, callback) => {
      if (!/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(value)) {
        callback(new Error('请输入正确的邮箱地址'))
      } else {
        callback()
      }
    }

    return {
      registerForm: {
        username: '',
        password: '',
        name: '',
        phone: '',
        email: '',
        gender: '',
        job: '',
        entryDate: '',
        deptId: ''
      },
      registerRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        phone: [{ required: true, trigger: 'blur', validator: validatePhone }],
        email: [{ required: true, trigger: 'blur', validator: validateEmail }],
        gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
        job: [{ required: true, message: '请选择职位', trigger: 'change' }],
        entryDate: [{ required: true, message: '请选择入职日期', trigger: 'change' }],
        deptId: [{ required: true, message: '请选择部门', trigger: 'change' }]
      },
      loading: false,
      passwordType: 'password',
      genderList: [
        { id: 1, name: '男' },
        { id: 2, name: '女' }
      ],
      jobList: [
        { id: 1, name: '班主任' },
        { id: 2, name: '讲师' },
        { id: 3, name: '学工主管' },
        { id: 4, name: '教研主管' }
      ],
      deptOptions: [],
      genderOptions: [
        { value: '男', label: '男' },
        { value: '女', label: '女' }
      ],
      jobOptions: [
        { value: '讲师', label: '讲师' },
        { value: '助教', label: '助教' },
        { value: '班主任', label: '班主任' }
      ]
    }
  },
  created() {
    this.getDeptList()
  },
  methods: {
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
    async getDeptList() {
      try {
        const res = await findAll()
        if (res.data.code === 1) {
          this.deptOptions = res.data.data.map(item => ({
            id: item.id,
            name: item.name
          }))
        }
      } catch (error) {
        console.error('获取部门列表失败:', error)
        this.$message.error('获取部门列表失败')
      }
    },
    handleRegister() {
      this.$refs.registerForm.validate(valid => {
        if (valid) {
          this.loading = true
          request({
            url: '/users/emp/register',
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
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/register.scss';
</style> 
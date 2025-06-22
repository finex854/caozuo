<template>
  <div class="app-container">
    <el-card>
      <div slot="header">
        <span>个人信息</span>
      </div>
      
      <el-form :model="profileForm" :rules="rules" ref="profileForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名">
              <el-input v-model="profileForm.username" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色">
              <el-input v-model="profileForm.role" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="头像">
              <el-upload
                class="avatar-uploader"
                :action="uploadUrl"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
                :headers="uploadHeaders"
                name="image"
              >
                <img v-if="profileForm.avatar" :src="profileForm.avatar" class="avatar">
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-divider content-position="left">修改密码</el-divider>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="原密码" prop="oldPassword">
              <el-input 
                v-model="profileForm.oldPassword" 
                type="password" 
                placeholder="请输入原密码"
                show-password
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="新密码" prop="newPassword">
              <el-input 
                v-model="profileForm.newPassword" 
                type="password" 
                placeholder="请输入新密码"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input 
                v-model="profileForm.confirmPassword" 
                type="password" 
                placeholder="请再次输入新密码"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item>
          <el-button type="primary" @click="saveProfile">保存信息</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { updateProfile, updatePassword } from '@/api/user'
import { getToken } from '@/utils/auth'

export default {
  name: 'Profile',
  data() {
    // 密码确认验证
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.profileForm.newPassword) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }
    
    return {
      profileForm: {
        username: '',
        role: '',
        email: '',
        avatar: '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      rules: {
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        oldPassword: [
          { required: false, message: '请输入原密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: false, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: false, message: '请再次输入新密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ]
      },
      uploadUrl: '/api/upload',
      uploadHeaders: {
        'token': getToken()
      }
    }
  },
  
  mounted() {
    this.loadUserInfo()
    console.log('个人信息页面已加载')
  },
  
  methods: {
    // 加载用户信息
    loadUserInfo() {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      console.log('加载的用户信息:', userInfo)
      this.profileForm = {
        username: userInfo.username || '',
        role: userInfo.role || '',
        email: userInfo.email || '',
        avatar: userInfo.avatar || '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    },
    
    // 头像上传成功
    handleAvatarSuccess(res, file) {
      if (res.code === 1) {
        this.profileForm.avatar = res.data
        this.$message.success('头像上传成功')
        
        // 立即更新localStorage中的用户信息
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        userInfo.avatar = res.data
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
        
        // 通知navbar更新用户信息
        this.$root.$emit('updateUserInfo')
      } else {
        this.$message.error(res.msg || '头像上传失败')
      }
    },
    
    // 头像上传前验证
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
    
    // 保存个人信息
    saveProfile() {
      this.$refs.profileForm.validate((valid) => {
        if (valid) {
          // 检查是否需要修改密码
          const hasPasswordChange = this.profileForm.oldPassword && 
                                  this.profileForm.newPassword && 
                                  this.profileForm.confirmPassword
          
          if (hasPasswordChange) {
            // 修改密码
            updatePassword({
              oldPassword: this.profileForm.oldPassword,
              newPassword: this.profileForm.newPassword
            }).then(res => {
              if (res.data.code === 1) {
                this.$message.success('密码修改成功')
                this.profileForm.oldPassword = ''
                this.profileForm.newPassword = ''
                this.profileForm.confirmPassword = ''
              } else {
                this.$message.error(res.data.msg || '密码修改失败')
              }
            })
          }
          
          // 更新个人信息
          updateProfile({
            email: this.profileForm.email,
            avatar: this.profileForm.avatar
          }).then(res => {
            if (res.data.code === 1) {
              this.$message.success('个人信息更新成功')
              // 更新localStorage中的用户信息
              const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
              userInfo.email = this.profileForm.email
              userInfo.avatar = this.profileForm.avatar
              localStorage.setItem('userInfo', JSON.stringify(userInfo))
              
              // 通知navbar更新用户信息
              this.$root.$emit('updateUserInfo')
            } else {
              this.$message.error(res.data.msg || '个人信息更新失败')
            }
          })
        }
      })
    },
    
    // 重置表单
    resetForm() {
      this.$refs.profileForm.resetFields()
      this.loadUserInfo()
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
}
</style> 
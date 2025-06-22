<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="searchForm" class="demo-form-inline">
      <el-form-item label="用户名">
        <el-input v-model="searchForm.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="角色">
        <el-select v-model="searchForm.role" placeholder="请选择角色" clearable>
          <el-option label="管理员" value="ROLE_ADMIN" />
          <el-option label="员工" value="ROLE_EMP" />
          <el-option label="学员" value="ROLE_STUDENT" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
        <el-button type="info" @click="clear">清空</el-button>
        <el-button type="success" @click="addUser">新增用户</el-button>
      </el-form-item>
    </el-form>

    <!-- 用户表格 -->
    <el-table
      :data="tableData"
      style="width: 100%"
      border
      v-loading="loading"
    >
      <el-table-column type="index" width="50" label="序号" align="center" />
      <el-table-column prop="username" label="用户名" align="center" />
      <el-table-column prop="email" label="邮箱" align="center" />
      <el-table-column label="头像" align="center" width="80">
        <template slot-scope="scope">
          <el-avatar 
            :src="scope.row.avatar || require('@/assets/logo/zfxlogo.png')" 
            :size="40"
          />
        </template>
      </el-table-column>
      <el-table-column prop="role" label="角色" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.roleCode === 'ROLE_ADMIN'" type="danger">管理员</el-tag>
          <el-tag v-else-if="scope.row.roleCode === 'ROLE_EMP'" type="warning">员工</el-tag>
          <el-tag v-else-if="scope.row.roleCode === 'ROLE_STUDENT'" type="success">学员</el-tag>
          <el-tag v-else type="info">未知</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status" type="success">启用</el-tag>
          <el-tag v-else type="danger">禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" align="center" />
      <el-table-column label="操作" width="200" align="center">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="editUser(scope.row)"
          >编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="deleteUser(scope.row.id)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      :current-page="currentPage"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      style="margin-top: 20px; text-align: right;"
    />

    <!-- 用户编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px">
      <el-form :model="userForm" :rules="rules" ref="userForm" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="userForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色">
            <el-option label="管理员" value="ROLE_ADMIN" />
            <el-option label="员工" value="ROLE_EMP" />
            <el-option label="学员" value="ROLE_STUDENT" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="userForm.status"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
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
            <img v-if="userForm.avatar" :src="userForm.avatar" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUser">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getUserList, addUser, updateUser, deleteUser } from '@/api/user'
import { getToken } from '@/utils/auth'

export default {
  name: 'UserManagement',
  data() {
    return {
      loading: false,
      searchForm: {
        username: '',
        role: ''
      },
      tableData: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      dialogVisible: false,
      isEdit: false,
      dialogTitle: '新增用户',
      userForm: {
        id: '',
        username: '',
        email: '',
        password: '',
        role: '',
        status: true,
        avatar: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ]
      },
      uploadUrl: '/api/upload',
      uploadHeaders: {
        'token': getToken()
      }
    }
  },
  
  mounted() {
    this.loadUserList()
  },
  
  methods: {
    // 加载用户列表
    async loadUserList() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize,
          username: this.searchForm.username,
          role: this.searchForm.role
        }
        const response = await getUserList(params)
        if (response.data.code === 1) {
          this.tableData = response.data.data.rows
          this.total = response.data.data.total
        }
      } catch (error) {
        console.error('加载用户列表失败:', error)
        this.$message.error('加载用户列表失败')
      } finally {
        this.loading = false
      }
    },
    
    // 查询
    onSubmit() {
      this.currentPage = 1
      this.loadUserList()
    },
    
    // 清空
    clear() {
      this.searchForm = {
        username: '',
        role: ''
      }
      this.onSubmit()
    },
    
    // 新增用户
    addUser() {
      this.isEdit = false
      this.dialogTitle = '新增用户'
      this.userForm = {
        id: '',
        username: '',
        email: '',
        password: '',
        role: '',
        status: true,
        avatar: ''
      }
      this.dialogVisible = true
    },
    
    // 编辑用户
    editUser(user) {
      this.isEdit = true
      this.dialogTitle = '编辑用户'
      this.userForm = {
        id: user.id,
        username: user.username,
        email: user.email,
        password: '',
        role: user.role,
        status: user.status,
        avatar: user.avatar
      }
      this.dialogVisible = true
    },
    
    // 保存用户
    saveUser() {
      this.$refs.userForm.validate(async (valid) => {
        if (valid) {
          try {
            const userData = { ...this.userForm }
            if (this.isEdit) {
              // 编辑时不需要密码
              delete userData.password
              const response = await updateUser(userData)
              if (response.data.code === 1) {
                this.$message.success('用户更新成功')
              } else {
                this.$message.error(response.data.msg || '用户更新失败')
              }
            } else {
              // 新增时需要密码
              const response = await addUser(userData)
              if (response.data.code === 1) {
                this.$message.success('用户创建成功')
              } else {
                this.$message.error(response.data.msg || '用户创建失败')
              }
            }
            this.dialogVisible = false
            this.loadUserList()
          } catch (error) {
            console.error('保存用户失败:', error)
            this.$message.error('保存用户失败')
          }
        }
      })
    },
    
    // 删除用户
    deleteUser(userId) {
      this.$confirm('确认删除该用户吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await deleteUser(userId)
          if (response.data.code === 1) {
            this.$message.success('删除成功')
            this.loadUserList()
          } else {
            this.$message.error(response.data.msg || '删除失败')
          }
        } catch (error) {
          console.error('删除用户失败:', error)
          this.$message.error('删除用户失败')
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    
    // 头像上传成功
    handleAvatarSuccess(res, file) {
      if (res.code === 1) {
        this.userForm.avatar = res.data
        this.$message.success('头像上传成功')
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
    
    // 分页大小改变
    handleSizeChange(val) {
      this.pageSize = val
      this.loadUserList()
    },
    
    // 当前页改变
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadUserList()
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
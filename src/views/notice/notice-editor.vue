<template>
  <div class="app-container">
    <el-card>
      <div slot="header">
        <span>{{ isEdit ? '编辑公告' : '发布公告' }}</span>
      </div>
      
      <el-form :model="articleForm" :rules="rules" ref="articleForm" label-width="100px">
        <el-form-item label="公告标题" prop="title">
          <el-input v-model="articleForm.title" placeholder="请输入公告标题" />
        </el-form-item>
        
        <el-form-item label="公告内容" prop="content">
          <editor
            
            api-key="06mvz3fk068v9pqcf2huqlryhpriwznx5zxe9e2q9s57mu9e"
            v-model="articleForm.content"
            :init="{
              height: 500,
              language: 'zh_CN',
              plugins: 'advlist autolink lists link image charmap print preview hr anchor pagebreak',
              toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
              menubar: 'file edit view insert format tools table help',
              content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; }'
            }"
          />
        </el-form-item>
        
        <el-form-item label="发布状态" prop="publishStatus">
          <el-select v-model="articleForm.publishStatus" placeholder="请选择发布状态">
            <el-option label="草稿" :value="2"></el-option>
            <el-option label="发布" :value="1"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="saveArticle">保存</el-button>
          <el-button @click="goBack">返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { add, update, selectById } from '@/api/notice.js'
import Editor from '@tinymce/tinymce-vue'

export default {
  name: 'NoticeEditor',
  components: {
    Editor
  },
  data() {
    return {
      isEdit: false,
      articleForm: {
        id: '',
        title: '',
        content: '',
        publishStatus: 2, // 默认为草稿
        author: ''
      },
      rules: {
        title: [
          { required: true, message: '请输入公告标题', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入公告内容', trigger: 'blur' }
        ],
        publishStatus: [
          { required: true, message: '请选择发布状态', trigger: 'change' }
        ]
      }
    }
  },
  
  mounted() {
    // 获取用户信息
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    if (userInfo && userInfo.username) {
      this.articleForm.author = userInfo.username
    }
    
    // 检查是否是编辑模式
    const articleId = this.$route.params.id
    if (articleId) {
      this.isEdit = true
      this.loadArticle(articleId)
    }
  },
  
  methods: {
    // 加载公告数据
    loadArticle(id) {
      selectById(id).then((result) => {
        if (result.data.code === 1) {
          const article = result.data.data
          this.articleForm = {
            id: article.id,
            title: article.title,
            content: article.content,
            publishStatus: article.publishStatus,
            author: article.author
          }
        }
      })
    },
    
    // 保存公告
    saveArticle() {
      this.$refs.articleForm.validate((valid) => {
        if (valid) {
          const method = this.isEdit ? update : add
          // 新增时去除id字段
          let data = { ...this.articleForm }
          if (!this.isEdit) delete data.id
          method(data).then((result) => {
            if (result.data.code === 1) {
              this.$message.success(this.isEdit ? '更新成功' : '发布成功')
              this.goBack()
            } else {
              this.$message.error(result.data.msg)
            }
          })
        }
      })
    },
    
    // 返回列表页
    goBack() {
      this.$router.push('/notice/notice-list')
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}
</style>
  
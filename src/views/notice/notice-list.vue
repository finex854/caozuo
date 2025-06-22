<template>

  <div style="margin-top: 20px; margin: 50px; margin-right: 100px">
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="searchForm" class="demo-form-inline">
      <el-form-item label="发布者名称">
        <el-input v-model="searchForm.author" placeholder="请输入发布者" />
      </el-form-item>
      <el-form-item label="文章标题">
        <el-input v-model="searchForm.title" placeholder="请输入公告标题" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
        <el-button type="info" @click="clear">清空</el-button>
        <el-button type="success" @click="createArticle">新建公告</el-button>
      </el-form-item>
    </el-form>

    <br>
    <!-- 数据表格 -->
    <template>
      <el-table
        ref="multipleTable"
        highlight-current-row
        :data="tableData"
        tooltip-effect="dark"
        style="width: 100%"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" width="100" label="序号" header-align="center" align="center" />
        <el-table-column prop="publishTime" label="发布时间" header-align="center" align="center" />
        <el-table-column prop="author" label="作者" header-align="center" align="center" />
        <el-table-column label="发布状态" header-align="center" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.publishStatus == 1" style="margin-right: 10px">已发布</span>
            <span v-if="scope.row.publishStatus == 2" style="margin-right: 10px">草稿</span>
            <span v-if="scope.row.publishStatus == 3" style="margin-right: 10px">已下架</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" header-align="center" align="center" />

        <el-table-column label="操作" width="420" header-align="center" align="center">
          <template slot-scope="scope">
            <!-- 置顶按钮 - 只有管理员且非置顶状态才显示 -->
            <el-button 
              v-if="scope.row.isTop === 0 && role === 'ROLE_ADMIN'" 
              size="mini"
              type="warning"
              plain
              @click="setTopById(scope.row.id)"
            >置顶</el-button>

            <!-- 查看按钮 - 所有人都可以查看 -->
            <el-button
              size="mini"
              type="primary"
              plain
              @click="viewArticle(scope.row.id)"
            >查看</el-button>

            <!-- 编辑按钮 - 根据状态和权限显示 -->
            <el-button 
              v-if="canEdit(scope.row)"
              size="mini"
              type="success"
              plain
              @click="editArticle(scope.row.id)"
            >编辑</el-button>

            <!-- 删除按钮 - 根据权限显示 -->
            <el-button 
              v-if="canDelete(scope.row)"
              size="mini"
              type="danger"
              plain
              @click="deleteById(scope.row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>

    <!-- 分页工具条 -->
    <el-pagination
      :background="background"
      :current-page="currentPage"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalCount"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 公告详情对话框 -->
    <el-dialog title="公告详情" :visible.sync="viewDialogVisible" width="60%">
      <el-form :model="currentArticle" label-width="100px">
        <el-form-item label="发布时间">
          <el-input v-model="currentArticle.publishTime" readonly />
        </el-form-item>
        <el-form-item label="发布者">
          <el-input v-model="currentArticle.author" readonly />
        </el-form-item>
        <el-form-item label="发布状态">
          <el-input v-model="statusText" readonly />
        </el-form-item>
        <el-form-item label="公告标题">
          <el-input v-model="currentArticle.title" readonly />
        </el-form-item>
        <el-form-item label="公告内容">
          <div v-html="currentArticle.content" style="border: 1px solid #dcdfe6; padding: 10px; min-height: 200px; border-radius: 4px;"></div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { page, add, update, deleteById, selectById, setTop } from '@/api/notice.js'

export default {
  data() {
    return {
      viewDialogVisible: false,
      currentArticle: {
        publishTime: '',
        author: '',
        publishStatus: '',
        title: '',
        content: '',
        isTop: ''
      },
      // 被选中的id数组
      selectedIds: [],
      // 复选框选中数据集合
      multipleSelection: [],
      tableData: [],
      // 分页相关数据
      background: true,
      pageSize: 5,
      totalCount: 0,
      currentPage: 1,
      // 搜索表单数据
      searchForm: {
        author: '',
        title: ''
      },
      role: '', // 用户角色
      username: '' // 当前用户名
    }
  },

  computed: {
    statusText() {
      const status = this.currentArticle.publishStatus
      if (status == 1) return '已发布'
      if (status == 2) return '草稿'
      if (status == 3) return '已下架'
      return '未知状态'
    }
  },

  mounted() {
    // 当页面加载完成后自动执行。
    this.page()
    // 读取本地角色
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.role) {
      this.role = userInfo.role;
      this.username = userInfo.username;
    }
    console.log('当前角色:', this.role, '用户名:', this.username); // 调试用
  },

  methods: {
    // 判断是否可以编辑
    canEdit(article) {
      // 管理员可以编辑所有公告
      if (this.role === 'ROLE_ADMIN') {
        return article.publishStatus === 2 || article.publishStatus === 3;
      }
      // 普通用户只能编辑自己的草稿或已下架公告
      return (article.publishStatus === 2 || article.publishStatus === 3) && 
             article.author === this.username;
    },

    // 判断是否可以删除
    canDelete(article) {
      // 管理员可以删除所有公告
      if (this.role === 'ROLE_ADMIN') {
        return true;
      }
      // 普通用户只能删除自己的公告
      return article.author === this.username;
    },

    // 查询方法
    onSubmit() {
      this.currentPage = 1
      this.page()
    },

    // 清空搜索条件
    clear() {
      this.searchForm = {
        author: '',
        title: ''
      }
      this.page()
    },

    // 分页方法
    handleSizeChange(val) {
      this.pageSize = val
      this.page()
    },

    handleCurrentChange(val) {
      this.currentPage = val
      this.page()
    },

    // 置顶功能
    setTopById(id) {
      this.$confirm('确认置顶该公告?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        setTop(id).then((result) => {
          if (result.data.code == 1) {
            this.$message({
              message: '置顶成功',
              type: 'success'
            })
            this.page()
          } else {
            this.$message.error(result.data.msg)
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消置顶'
        })
      })
    },

    // 查看公告
    viewArticle(id) {
      this.viewDialogVisible = true
      selectById(id).then((result) => {
        this.currentArticle = result.data.data
      })
    },

    // 编辑公告
    editArticle(id) {
      this.$router.push(`/notice/notice-editor/${id}`)
    },

    // 删除班级
    deleteById(id) {
      this.$confirm('确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteById(id).then((result) => {
          	if (result.data.code == 1) {
	          	this.$message({
	              message: '恭喜你，删除成功',
	              type: 'success'
	            })
	        } else {
	        	this.$message.error(result.data.msg)
	        }
          // 重新查询数据
          this.page()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },

    // 批量删除公告信息
    deleteByIds() {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请选择要删除的数据')
        return
      }
      // 弹出确认提示框
      this.$confirm('此操作将删除选中的数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 获取选中数据的id数组，并转换为字符串
        const ids = this.multipleSelection.map(item => String(item.id))
        // 发送AJAX请求
        deleteById(ids).then((resp) => {
          if (resp.data.code == '1') {
            this.$message.success('删除成功')
            this.page()
          } else {
            this.$message.error(resp.data.msg)
          }
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 分页查询
    page() {
      page(
        this.searchForm.author,
        this.searchForm.title,
        this.currentPage,
        this.pageSize
      ).then((result) => {
        if (result.data.code == 1) {
          this.totalCount = result.data.data.total
          this.tableData = result.data.data.rows
        }
      })
    },

    // 复选框选中后执行的方法
    handleSelectionChange(val) {
      this.multipleSelection = val
    },

    // 新建公告
    createArticle() {
      this.$router.push('/notice/notice-editor')
    }
  }
}
</script>
<style>

</style>

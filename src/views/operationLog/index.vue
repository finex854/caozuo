<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="queryParams" class="demo-form-inline">
      <el-form-item label="用户名">
        <el-input v-model="queryParams.username" placeholder="请输入用户名" clearable />
      </el-form-item>
      <el-form-item label="资源路径">
        <el-input v-model="queryParams.resourcePath" placeholder="请输入资源路径" clearable />
      </el-form-item>
      <el-form-item label="请求方法">
        <el-select v-model="queryParams.method" placeholder="请选择请求方法" clearable>
          <el-option label="GET" value="GET" />
          <el-option label="POST" value="POST" />
          <el-option label="PUT" value="PUT" />
          <el-option label="DELETE" value="DELETE" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作状态">
        <el-select v-model="queryParams.status" placeholder="请选择操作状态" clearable>
          <el-option label="成功" :value="1" />
          <el-option label="失败" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作时间">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="logList">
      <el-table-column type="index" label="序号" width="50" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="resourcePath" label="资源路径" min-width="200" show-overflow-tooltip />
      <el-table-column prop="method" label="请求方法" width="100" />
      <el-table-column prop="requestUrl" label="请求URL" min-width="200" show-overflow-tooltip />
      <el-table-column prop="ip" label="操作IP" width="120" />
      <el-table-column prop="status" label="操作状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="operationTime" label="操作时间" width="180" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="scope">
          <el-button type="text" @click="handleDetail(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-show="total > 0"
      :current-page="queryParams.pageNum"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="queryParams.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 详情对话框 -->
    <el-dialog v-model="dialogVisible" title="操作日志详情" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户名">{{ detail.username }}</el-descriptions-item>
        <el-descriptions-item label="资源路径">{{ detail.resourcePath }}</el-descriptions-item>
        <el-descriptions-item label="请求方法">{{ detail.method }}</el-descriptions-item>
        <el-descriptions-item label="请求URL">{{ detail.requestUrl }}</el-descriptions-item>
        <el-descriptions-item label="操作IP">{{ detail.ip }}</el-descriptions-item>
        <el-descriptions-item label="操作状态">
          <el-tag :type="detail.status === 1 ? 'success' : 'danger'">
            {{ detail.status === 1 ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ detail.operationTime }}</el-descriptions-item>
        <el-descriptions-item label="请求参数" :span="2">
          <pre>{{ detail.requestParams }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="响应结果" :span="2">
          <pre>{{ detail.responseResult }}</pre>
        </el-descriptions-item>
        <el-descriptions-item v-if="detail.errorMessage" label="错误信息" :span="2">
          <pre class="error-message">{{ detail.errorMessage }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script>
import { getOperationLogs, getOperationLogDetail } from '@/api/operationLog'

export default {
  name: 'OperationLog',
  data() {
    return {
      // 遮罩层
      loading: false,
      // 总条数
      total: 0,
      // 日志列表
      logList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        username: undefined,
        resourcePath: undefined,
        method: undefined,
        status: undefined
      },
      // 日期范围
      dateRange: [],
      // 详情对话框
      dialogVisible: false,
      // 详情数据
      detail: {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 查询列表
    getList() {
      this.loading = true
      const params = {
        ...this.queryParams,
        startTime: this.dateRange[0],
        endTime: this.dateRange[1]
      }
      console.log('查询参数:', params); // 调试用
      getOperationLogs(params).then(response => {
        console.log('API响应:', response); // 调试用
        if (response.data && response.data.code === 1) {
          this.logList = response.data.data.records || []
          this.total = response.data.data.total || 0
        } else {
          this.logList = []
          this.total = 0
          this.$message.error(response.data.msg || '获取数据失败')
        }
        this.loading = false
      }).catch(error => {
        console.error('查询失败:', error);
        this.logList = []
        this.total = 0
        this.loading = false
        this.$message.error('查询失败，请重试')
      })
    },
    // 查询按钮操作
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    // 重置按钮操作
    resetQuery() {
      this.dateRange = []
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        username: undefined,
        resourcePath: undefined,
        method: undefined,
        status: undefined
      }
      this.getList()
    },
    // 每页数量改变
    handleSizeChange(val) {
      this.queryParams.pageSize = val
      this.getList()
    },
    // 当前页改变
    handleCurrentChange(val) {
      this.queryParams.pageNum = val
      this.getList()
    },
    // 查看详情
    handleDetail(row) {
      getOperationLogDetail(row.id).then(response => {
        this.detail = response.data
        this.dialogVisible = true
      })
    }
  }
}
</script>

<style scoped>
.error-message {
  color: #f56c6c;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>

<template>
  <div class="upload-excel">
    <div class="btn-group">
      <el-button type="primary" icon="el-icon-upload" :loading="loading" @click="triggerUpload">导入Excel</el-button>
      <el-button type="success" icon="el-icon-download" @click="handleExport">导出Excel</el-button>
    </div>
    <!-- 隐藏的文件上传input -->
    <input ref="fileInput" type="file" accept=".xlsx,.xls" style="display: none" @change="handleFileChange">
    <!-- 导入结果弹窗 -->
    <el-dialog
      :title="importResult.title"
      :visible.sync="dialogVisible"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="import-result">
        <el-alert
          :title="importResult.message"
          :type="importResult.type"
          :closable="false"
          show-icon
        />

        <!-- 错误详情表格 -->
        <div v-if="importResult.errorCount > 0" class="error-details">
          <h4>错误详情：</h4>
          <el-table :data="importResult.errorDetails" border style="width: 100%">
            <el-table-column prop="row" label="行号" width="80" />
            <el-table-column prop="field" label="字段" width="120" />
            <el-table-column prop="message" label="错误信息" />
          </el-table>

          <!-- 错误文件下载 -->
          <div v-if="importResult.errorFile" class="error-file">
            <p>您可以下载错误数据文件查看详细信息：</p>
            <el-button type="primary" size="small" @click="downloadErrorFile">
              下载错误数据
            </el-button>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleDialogClose">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { exportExcel, importExcel } from '@/api/emp'

export default {
  name: 'UploadExcel',
  props: {
    onSubmit: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      importResult: {
        title: '',
        type: 'info',
        message: '',
        errorCount: 0,
        errorFile: null,
        errorFileName: '',
        errorDetails: []
      }
    }
  },
  methods: {
    triggerUpload() {
      this.$refs.fileInput.value = '' // 清除之前的选择
      this.$refs.fileInput.click() // 打开文件选择对话框
    },
    handleFileChange(event) {
      // 文件选择变化处理
      const file = event.target.files[0]
      if (!file) return

      // 校验文件类型
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
      if (!isExcel) {
        this.$message.error('只能上传Excel文件!')
        return false
      }

      // 校验文件大小 (10MB限制)
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        this.$message.error('文件大小不能超过10MB!')
        return false
      }

      // 确认上传
      this.$confirm(`确认上传文件 "${file.name}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.doUpload(file)
      }).catch(() => {
        this.$message.info('已取消上传')
      })
    },
    doUpload(file) {
      // 执行上传
      this.loading = true

      const formData = new FormData()
      formData.append('file', file)

      importExcel(formData).then(response => {
        this.importResult = {
          title: response.data.errorCount > 0 ? '部分数据导入失败' : '导入成功',
          type: response.data.errorCount > 0 ? 'warning' : 'success',
          message: response.data.errorCount > 0
            ? `成功导入数据，但有 ${response.data.errorCount} 条数据存在问题`
            : '所有数据已成功导入系统',
          errorCount: response.data.errorCount || 0,
          errorFile: response.data.errorFile,
          errorFileName: response.data.errorFileName,
          errorDetails: response.data.errorDetails || []
        }
        this.dialogVisible = true
      }).catch(error => {
        this.importResult = {
          title: '导入失败',
          type: 'error',
          message: error.message || '导入过程中发生错误',
          errorCount: 0,
          errorDetails: []
        }
        this.dialogVisible = true
      }).finally(() => {
        this.loading = false
      })
    },
    handleDialogClose() {
      this.dialogVisible = false
      if (this.importResult.type !== 'error') {
        this.onSubmit()
      }
    },
    downloadErrorFile() {
      if (this.importResult.errorFile) {
        const link = document.createElement('a')
        link.href = this.importResult.errorFile
        link.download = this.importResult.errorFileName || 'error_data.xlsx'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    },
    async handleExport() {
      try {
        const response = await exportExcel()
        // 检查响应是否为blob类型
        if (response.data instanceof Blob) {
          const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          const link = document.createElement('a')
          link.href = window.URL.createObjectURL(blob)
          link.download = '员工数据.xlsx'
          link.click()
          window.URL.revokeObjectURL(link.href)
          this.$message.success('导出成功')
        } else {
          console.error('导出响应数据:', response)
          this.$message.error('导出失败：返回数据格式不正确')
        }
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error('导出失败：' + (error.message || '未知错误'))
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.upload-excel {
  display: inline-block;

  .btn-group {
    display: flex;
    gap: 10px;
  }

  .import-result {
    .error-details {
      margin-top: 20px;

      h4 {
        margin-bottom: 10px;
        color: #606266;
      }

      .error-file {
        margin-top: 15px;
        padding: 10px;
        background-color: #f5f7fa;
        border-radius: 4px;

        p {
          margin-bottom: 10px;
          color: #606266;
        }
      }
    }
  }
}
</style>

<template>
  <div class="upload-excel">
    <div class="btn-upload">
      <el-upload
        :action="uploadUrl"
        :headers="headers"
        :on-success="handleSuccess"
        :on-error="handleError"
        :before-upload="beforeUpload"
        :show-file-list="false"
        accept=".xlsx, .xls"
      >
        <el-button type="primary" :loading="loading">
          <i class="el-icon-upload2" /> 点击上传
        </el-button>
      </el-upload>
    </div>
    <div class="btn-export">
      <el-button type="success" @click="handleExport">
        <i class="el-icon-download" /> 导出Excel
      </el-button>
    </div>
  </div>
</template>

<script>
import { exportExcel } from '@/api/emp'

export default {
  name: 'UploadExcel',
  props: {
    uploadUrl: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      headers: {
        Authorization: 'Bearer ' + this.$store.getters.token
      }
    }
  },
  methods: {
    beforeUpload(file) {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel'
      if (!isExcel) {
        this.$message.error('只能上传Excel文件!')
        return false
      }
      this.loading = true
      return true
    },
    handleSuccess(response) {
      this.loading = false
      if (response.code === 200) {
        this.$message.success('导入成功')
        this.$emit('success')
      } else {
        this.$message.error(response.msg || '导入失败')
      }
    },
    handleError() {
      this.loading = false
      this.$message.error('导入失败')
    },
    async handleExport() {
      try {
        const response = await exportExcel()
        const blob = new Blob([response], { type: 'application/vnd.ms-excel' })
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = '员工数据.xlsx'
        link.click()
        window.URL.revokeObjectURL(link.href)
        this.$message.success('导出成功')
      } catch (error) {
        this.$message.error('导出失败')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.upload-excel {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  
  .btn-upload, .btn-export {
    .el-button {
      padding: 12px 20px;
      
      i {
        margin-right: 5px;
      }
    }
  }
}
</style>

<template>

  <div style="margin-top: 20px; margin: 50px; margin-right: 100px">
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="searchForm" class="demo-form-inline">
      <el-form-item label="学院名称">
        <el-input v-model="searchForm.collegeName" placeholder="请输入学院名称" />
      </el-form-item>
      <el-form-item label="专业名称">
        <el-input v-model="searchForm.majorName" placeholder="请输入专业名称" />
      </el-form-item>
      <el-form-item label="班级名称">
        <el-input v-model="searchForm.clazzName" placeholder="请输入班级名称" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
        <el-button type="info" @click="clear">清空</el-button>
      </el-form-item>
    </el-form>

    <!-- 按钮 -->
    <el-row>
      <el-button
        v-if="role === 'ROLE_ADMIN'"
        style="float: left"
        type="primary"
        @click="dialogFormVisible = true; classes={}"
      >+ 新增班级</el-button>
      <el-button v-if="role === 'ROLE_ADMIN'" style="float:left ;" type="danger" @click="deleteByIds">- 批量删除</el-button>
    </el-row>
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
        <el-table-column prop="collegeName" label="学院名称" header-align="center" align="center" />
        <el-table-column prop="majorName" label="专业名称" header-align="center" align="center" />
        <el-table-column prop="clazzName" label="班级名称" header-align="center" align="center" />
        <el-table-column label="最后操作时间" header-align="center" align="center">
          <template slot-scope="scope">
            {{ scope.row.updateTime ? scope.row.updateTime.replace('T',' '):'' }}
          </template>
        </el-table-column>

        <el-table-column v-if="role === 'ROLE_ADMIN'" label="操作" width="420" header-align="center" align="center">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              plain
              @click="selectById(scope.row.id)"
            >编辑</el-button>

            <el-button
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

    <!-- 新建对话框 -->

    <el-dialog title="保存班级" :visible.sync="dialogFormVisible">
      <el-form :model="classes">
        <el-form-item label="学院名称" :label-width="formLabelWidth">
          <el-input v-model="classes.collegeName" placeholder="请输入学院名称" autocomplete="off" />
        </el-form-item>
        <el-form-item label="专业名称" :label-width="formLabelWidth">
          <el-input v-model="classes.majorName" placeholder="请输入专业名称" autocomplete="off" />
        </el-form-item>
        <el-form-item label="班级名称" :label-width="formLabelWidth">
          <el-input v-model="classes.clazzName" placeholder="请输入班级名称" autocomplete="off" />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="add()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { page, add, update, deleteById, selectById } from '@/api/classes.js'

export default {
  data() {
    return {
      formLabelWidth: '120px',
      dialogFormVisible: false, // 控制对话框是否可见
      classes: {
        clazzName: '',
        collegeName: '',
        majorName: ''
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
        collegeName: '',
        majorName: '',
        clazzName: ''
      },
      role: '' // 新增role属性
    }
  },

  mounted() {
    // 当页面加载完成后自动执行。
    this.page()
    // 读取本地角色
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.role) {
      this.role = userInfo.role;
    }
    console.log('当前角色:', this.role); // 调试用
  },

  methods: {
    // 查询方法
    onSubmit() {
      this.currentPage = 1
      this.page()
    },

    // 清空搜索条件
    clear() {
      this.searchForm = {
        collegeName: '',
        majorName: '',
        clazzName: ''
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

    // 批量删除班级信息
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

    // 根据ID查询班级 -- 回显
    selectById(id) {
      this.dialogFormVisible = true
      selectById(id).then((result) => {
        this.classes = result.data.data
      })
    },

    // 保存方法
    add() {
      let method // 添加
      if (this.classes.id) {
        method = update(this.classes) // 修改
      } else {
        method = add(this.classes) // 添加
      }
      method.then((result) => {
        if (result.data.code == 1) {
          // 修改成功
          this.$message.success('恭喜你，保存成功')
          // 重新查询数据
          this.page()
        } else {
          this.$message.error(result.data.msg)
        }
      })
      // 关闭新建窗口
      this.dialogFormVisible = false

      // 清空模型数据
      this.classes = {
        clazzName: '',
        collegeName: '',
        majorName: ''
      }
    },

    // 分页查询
    page() {
      page(
        this.searchForm.collegeName,
        this.searchForm.majorName,
        this.searchForm.clazzName,
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
    }
  }
}
</script>
<style>

</style>

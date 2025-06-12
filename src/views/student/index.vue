<template>
  <div style="margin-top: 20px; margin: 50px; margin-right: 100px">
    <!-- 搜索区域 -->
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="6">
        <el-select v-model="queryParams.classId" placeholder="请选择班级" clearable style="width: 100%">
          <el-option
            v-for="item in classesList"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="6">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入学生姓名"
          clearable
          style="width: 100%"
        />
      </el-col>
      <el-col :span="6">
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-col>
      <el-col :span="6">
        <el-button
          style="float: right"
          type="primary"
          @click="handleAdd"
          >+ 新增学生</el-button>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table
      highlight-current-row
      ref="multipleTable"
      :data="tableData"
      tooltip-effect="dark"
      style="width: 100%"
      border
      v-loading="loading"
    >
      <el-table-column type="index" width="60" label="序号" header-align="center" align="center"></el-table-column>
      <el-table-column prop="name" label="姓名" header-align="center" align="center"></el-table-column>
      <el-table-column label="性别" header-align="center" align="center">
        <template slot-scope="scope">
          {{ scope.row.gender === 1 ? '男' : '女' }}
        </template>
      </el-table-column>
      <el-table-column prop="age" label="年龄" header-align="center" align="center"></el-table-column>
      <el-table-column prop="phone" label="电话" header-align="center" align="center"></el-table-column>
      <el-table-column prop="email" label="邮箱" header-align="center" align="center"></el-table-column>
      <el-table-column prop="className" label="所属班级" header-align="center" align="center"></el-table-column>
      <el-table-column label="最后操作时间" header-align="center" align="center">
        <template slot-scope="scope">
          {{ scope.row.updateTime ? scope.row.updateTime.replace('T', ' ') : '' }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200" header-align="center" align="center">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            plain
            @click="handleEdit(scope.row)"
            >编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            plain
            @click="handleDelete(scope.row)"
            >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagination.currentPage"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pagination.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total"
      style="margin-top: 20px; text-align: right"
    ></el-pagination>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入学生姓名"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input-number v-model="form.age" :min="1" :max="100"></el-input-number>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入电话号码"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入地址"></el-input>
        </el-form-item>
        <el-form-item label="所属班级" prop="classId">
          <el-select v-model="form.classId" placeholder="请选择班级" style="width: 100%">
            <el-option
              v-for="item in classesList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { findAll, add, update, deleteById, selectById, getPage, getByClassId, getPageByClassId } from "@/api/student.js";
import { findAll as getClasses } from "@/api/classes.js";

export default {
  data() {
    return {
      // 查询参数
      queryParams: {
        classId: undefined,
        name: ''
      },
      // 表格数据
      tableData: [],
      // 班级列表
      classesList: [],
      // 加载状态
      loading: false,
      // 分页信息
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      // 对话框标题
      dialogTitle: '',
      // 对话框可见性
      dialogVisible: false,
      // 表单数据
      form: {
        id: undefined,
        name: '',
        gender: 1,
        age: 18,
        phone: '',
        email: '',
        address: '',
        classId: undefined
      },
      // 表单验证规则
      rules: {
        name: [
          { required: true, message: '请输入学生姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        gender: [
          { required: true, message: '请选择性别', trigger: 'change' }
        ],
        classId: [
          { required: true, message: '请选择班级', trigger: 'change' }
        ],
        phone: [
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ]
      }
    };
  },

  created() {
    this.getClassesList();
    this.getList();
  },

  methods: {
    // 获取班级列表
    getClassesList() {
      getClasses().then(response => {
        if (response.data.code === 1) {
          this.classesList = response.data.data;
        }
      });
    },

    // 获取学生列表
    getList() {
      this.loading = true;
      if (this.queryParams.classId) {
        // 按班级ID查询
        getPageByClassId(
          this.queryParams.classId,
          this.pagination.currentPage,
          this.pagination.pageSize
        ).then(response => {
          if (response.data.code === 1) {
            const data = response.data.data;
            this.tableData = data.records;
            this.pagination.total = data.total;
          }
          this.loading = false;
        });
      } else {
        // 查询所有
        getPage(this.pagination.currentPage, this.pagination.pageSize).then(response => {
          if (response.data.code === 1) {
            const data = response.data.data;
            this.tableData = data.records;
            this.pagination.total = data.total;
          }
          this.loading = false;
        });
      }
    },

    // 搜索
    handleQuery() {
      this.pagination.currentPage = 1;
      this.getList();
    },

    // 重置搜索
    resetQuery() {
      this.queryParams = {
        classId: undefined,
        name: ''
      };
      this.pagination.currentPage = 1;
      this.getList();
    },

    // 每页条数变化
    handleSizeChange(val) {
      this.pagination.pageSize = val;
      this.getList();
    },

    // 当前页变化
    handleCurrentChange(val) {
      this.pagination.currentPage = val;
      this.getList();
    },

    // 新增按钮
    handleAdd() {
      this.dialogTitle = '新增学生';
      this.form = {
        id: undefined,
        name: '',
        gender: 1,
        age: 18,
        phone: '',
        email: '',
        address: '',
        classId: undefined
      };
      this.dialogVisible = true;
    },

    // 编辑按钮
    handleEdit(row) {
      this.dialogTitle = '编辑学生';
      this.dialogVisible = true;
      selectById(row.id).then(response => {
        if (response.data.code === 1) {
          this.form = response.data.data;
        }
      });
    },

    // 删除按钮
    handleDelete(row) {
      this.$confirm('确认删除该学生?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteById(row.id).then(response => {
          if (response.data.code === 1) {
            this.$message.success('删除成功');
            this.getList();
          } else {
            this.$message.error(response.data.msg || '删除失败');
          }
        });
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    },

    // 提交表单
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const method = this.form.id ? update(this.form) : add(this.form);
          method.then(response => {
            if (response.data.code === 1) {
              this.$message.success('保存成功');
              this.dialogVisible = false;
              this.getList();
            } else {
              this.$message.error(response.data.msg || '保存失败');
            }
          });
        }
      });
    }
  }
};
</script>

<style scoped>
.el-pagination {
  margin-top: 20px;
}
</style>


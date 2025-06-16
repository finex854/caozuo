<template>
  <div class="app-container">
    <upload-excel
      :upload-url="uploadUrl"
      @success="handleSuccess"
    />

    <!--搜索表单-->
    <el-form :inline="true" :model="searchEmp" class="demo-form-inline">
      <el-form-item label="姓名">
        <el-input
          v-model="searchEmp.name"
          placeholder="请输入员工姓名"
        ></el-input>
      </el-form-item>
      <el-form-item label="性别">
        <el-select v-model="searchEmp.gender" placeholder="请选择">
          <el-option label="男" value="1"></el-option>
          <el-option label="女" value="2"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="入职时间">
        <el-date-picker
          v-model="entrydate"
          clearable
          value-format="yyyy-MM-dd"
          type="daterange"
          placeholder="选择日期"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 400px; margin-left: 20px"
        ></el-date-picker>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
         <el-button type="info" @click="clear">清空</el-button>
      </el-form-item>
    </el-form>

    <!--按钮-->
    <el-row>
      <el-button type="primary" size="medium" @click="dialogVisible = true; emp = { image: ''};" >+ 新增员工</el-button>
      <el-button type="danger" size="medium" @click="deleteByIds">- 批量删除</el-button>
    </el-row>

    <!--添加数据对话框表单-->
    <el-dialog ref="form" title="编辑员工" :visible.sync="dialogVisible" width="30%">
      <el-form ref="form" :model="emp" :rules="rules" label-width="80px" size="mini">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="emp.username"></el-input>
        </el-form-item>
        <el-form-item label="员工姓名" prop="name">
          <el-input v-model="emp.name"></el-input>
        </el-form-item>

        <el-form-item label="电话" prop="phone">
          <el-input v-model="emp.phone" placeholder="请输入电话号码"></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="emp.email" placeholder="请输入邮箱地址"></el-input>
        </el-form-item>

        <el-form-item label="性别" prop="gender">
          <el-select v-model="emp.gender" placeholder="请选择" style="width:100%" >
             <el-option
              v-for="item in genderList"
              :key="item.value"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="头像" prop="image">
          <el-upload
            class="avatar-uploader"
            action="/api/upload"
            :headers="token"
            name="image"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="emp.image" :src="emp.image" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>

        <el-form-item label="职位" prop="job">
          <el-select v-model="emp.job" placeholder="请选择" value-key="emp.job" style="width:100%">
            <el-option
              v-for="item in jobList"
              :key="item.value"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="入职日期" prop="entrydate">
          <el-date-picker
            v-model="emp.entrydate"
            clearable
            type="date"
            placeholder="选择日期"
            size="small"
            style="width:100%"
          ></el-date-picker>
        </el-form-item>

        <el-form-item label="归属部门" prop="deptId">
          <el-select v-model="emp.deptId" placeholder="请选择" style="width:100%">
            <el-option
              v-for="item in deptList"
              :key="item.value"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="add">提交</el-button>
          <el-button @click="dialogVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <br>
    <!--表格-->
    <template>
      <el-table :data="tableData" style="width: 100%" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"  align="center"></el-table-column>
        <el-table-column  prop="name"  label="姓名"  align="center"></el-table-column>
        <el-table-column prop="phone" label="电话" align="center"></el-table-column>
        <el-table-column prop="email" label="邮箱" align="center"></el-table-column>
        <el-table-column prop="image" label="头像" align="center">
          <template slot-scope="{ row }">
            <el-image style="width: auto; height: 40px; border: none; cursor: pointer" :src="row.image"></el-image>
          </template>
        </el-table-column>

        <el-table-column align="center" label="性别">
          <template slot-scope="scope">
            <span style="margin-right: 10px">
            {{scope.row.gender == "1" ? "男" : "女"}}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="职位">
          <template slot-scope="scope">
            <span style="margin-right: 10px" v-if="scope.row.job == 1">班主任</span>
            <span style="margin-right: 10px" v-if="scope.row.job == 2">讲师</span>
            <span style="margin-right: 10px" v-if="scope.row.job == 3">学工主管</span>
            <span style="margin-right: 10px" v-if="scope.row.job == 4">教研主管</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="入职日期">
          <template slot-scope="scope">
            {{ scope.row.entrydate }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="最后操作时间">
          <template slot-scope="scope">
            {{scope.row.updateTime ? scope.row.updateTime.replace('T',' '):''}}
          </template>
        </el-table-column>

        <el-table-column align="center" label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="update(scope.row.id)">编辑</el-button>
            <el-button type="danger" size="small" @click="deleteById(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>

    <!--分页工具条-->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :background="background"
      :current-page="currentPage"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="5"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalCount">
    </el-pagination>
  </div>
</template>

<script>
import { page, add, update, deleteById, selectById } from "@/api/emp.js";
import { findAll } from "@/api/dept.js";
import { getToken } from "@/utils/auth";
import UploadExcel from '@/components/UploadExcel'
import { importExcel } from '@/api/emp'

export default {
  name: 'Emp',
  components: {
    UploadExcel
  },
  data() {
    return {
      background: true,
      // 每页显示的条数
      pageSize: 5,
      // 总记录数
      totalCount: 100,
      // 当前页码
      currentPage: 1,
      // 添加数据对话框是否展示的标记
      dialogVisible: false,
      // 品牌模型数据
      searchEmp: {
        name: "",
        gender: "",
      },
      emp: {
        image: "",
        username: "",
        name: "",
        phone: "",
        email: "",
        gender: "",
        job: "",
        entrydate: "",
        deptId: ""
      },
      deptList: [],
      genderList: [{id: 1,name: "男"},{id: 2,name: "女"}],
      jobList: [
        {
          id: 1,
          name: "班主任",
        },
        {
          id: 2,
          name: "讲师",
        },
        {
          id: 3,
          name: "学工主管",
        },
        {
          id: 4,
          name: "教研主管",
        }
      ],
      // 表单验证规则
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入员工姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入电话号码', trigger: 'blur' },
          { pattern: /^1[2-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        gender: [
          { required: true, message: '请选择性别', trigger: 'change' }
        ],
        job: [
          { required: true, message: '请选择职位', trigger: 'change' }
        ],
        entrydate: [
          { required: true, message: '请选择入职日期', trigger: 'change' }
        ],
        deptId: [
          { required: true, message: '请选择归属部门', trigger: 'change' }
        ]
      },

      beginTime: "",
      endTime: "",
      entrydate: "",

      // 被选中的id数组
      selectedIds: [],
      // 复选框选中数据集合
      multipleSelection: [],
      // 表格数据
      tableData: [],
      token: {token: getToken()},
      uploadUrl: process.env.VUE_APP_BASE_API + '/emps/import',
      // 上传参数
      upload: {
        open: false,
        title: '导入员工数据',
        url: process.env.VUE_APP_BASE_API + "/emps/import",
        headers: { Authorization: "Bearer " + getToken() },
        isUploading: false
      },
    };
  },

  mounted() {
    this.page(); //当页面加载完成后，发送异步请求，获取数据
    findAll().then((result) => {
      this.deptList = result.data.data;
    });
  },

  methods: {
    // 查询分页数据
    page() {
      page(
        this.searchEmp.name,
        this.searchEmp.gender,
        this.beginTime,
        this.endTime,
        this.currentPage,
        this.pageSize
      ).then((res) => {
        this.totalCount = res.data.data.total;
        this.tableData = res.data.data.records;
      });
    },

    // 复选框选中后执行的方法
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },

    // 查询方法
    onSubmit() {
      this.currentPage = 1;
      this.page();
    },

    clear(){
      this.searchEmp = {name: "", gender: ""};
      this.beginTime = "",
      this.endTime = "";
      this.entrydate = "";
      this.page();
    },
    // 添加数据
    add() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          let operator;
          if (this.emp.id) {
            //修改
            operator = update(this.emp);
          } else {
            operator = add(this.emp);
          }

          operator.then((resp) => {
            if (resp.data.code == "1") {
              this.dialogVisible = false;
              this.page();
              this.$message({ message: "恭喜你，保存成功", type: "success" });
              this.emp = { image: "" };
            } else {
              this.$message.error(resp.data.msg);
            }
          });
        } else {
          this.$message.error('请填写完整的表单信息');
          return false;
        }
      });
    },
    update(id) {
      //1. 打开窗口
      this.dialogVisible = true;
      //2. 发送请求

      selectById(id).then((result) => {
        if (result.data.code == 1) {
          this.emp = result.data.data;
          this.emp;
        }
      });
    },


    //分页
    handleSizeChange(val) {
      // 重新设置每页显示的条数
      this.pageSize = val;
      this.page();
    },

    handleCurrentChange(val) {
      // 重新设置当前页码
      this.currentPage = val;
      this.page();
    },


    //删除员工信息
    deleteById(id){
      this.$confirm("此操作将删除该数据, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
          //2. 发送AJAX请求
          deleteById(id).then((resp) => {
            if (resp.data.code == 1) {
              //删除成功
              this.$message.success("恭喜你，删除成功");
              this.page();
            } else {
              this.$message.error(resp.data.msg);
            }
          });
      }).catch(() => {
          //用户点击取消按钮
          this.$message.info("已取消删除");
        });
    },


    // 批量删除员工信息
    deleteByIds() {
      // 弹出确认提示框
      this.$confirm("此操作将删除该数据, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
          //用户点击确认按钮
          //1. 创建id数组, 从 this.multipleSelection 获取即可
          for (let i = 0; i < this.multipleSelection.length; i++) {
            this.selectedIds[i] = this.multipleSelection[i].id;
          }

          //2. 发送AJAX请求
          deleteById(this.selectedIds).then((resp) => {
            if (resp.data.code == "1") {
              //删除成功
              this.$message.success("恭喜你，删除成功");
              this.page();
            } else {
              this.$message.error(resp.data.msg);
            }
          });
      }).catch(() => {
          //用户点击取消按钮
          this.$message.info("已取消删除");
        });
    },


    //文件上传相关
    handleAvatarSuccess(res, file) {
      this.emp.image = res.data;
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg";
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },
    handleSuccess() {
      this.getList()
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "导入员工数据";
      this.upload.open = true;
    },
    /** 导出按钮操作 */
    handleExport() {
      this.$confirm('是否确认导出所有员工数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.exportLoading = true;
        return exportExcel();
      }).then(response => {
        // 检查响应是否为blob类型
        if (response instanceof Blob) {
          console.log(res);
          const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = '员工数据.xlsx';
          link.click();
          window.URL.revokeObjectURL(link.href);
          this.$message.success('导出成功');
        } else {
          this.$message.error('导出失败：返回数据格式不正确');
        }
        this.exportLoading = false;
      }).catch(error => {
        console.error('导出失败:', error);
        this.exportLoading = false;
        this.$message.error('导出失败：' + (error.message || '未知错误'));
      });
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      this.$alert(response.msg, "导入结果", { dangerouslyUseHTMLString: true });
      this.getList();
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
    }
  },


  watch: {
    entrydate(val) {
      if (val && val.length >= 2) {
        this.beginTime = val[0];
        this.endTime = val[1];
      } else {
        this.beginTime = "";
        this.endTime = "";
      }
    },
  },
};
</script>
<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
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

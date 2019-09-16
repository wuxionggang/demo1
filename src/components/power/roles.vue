<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图  -->
    <el-card>
      <el-row>
        <el-col>
          <!-- 添加角色头部按钮 -->
          <el-button type="primary" @click="addDialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="roleslist" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom',i1 === 0 ? 'bdtop': '','vcenter']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 获取一级权限的内容 -->
              <el-col :span="5">
                <el-tag closable>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>

              <!-- 二级以及三级权限内容 -->
              <el-col :span="19">
                <!-- 通过循环来循环二级权限 -->
                <el-row
                  :class="['bdbottom',i2 === 0 ? '' : 'bdtop','vcenter']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 二级权限的使用 -->
                  <el-col :span="6">
                    <el-tag type="success" closable>{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>

                  <!-- 三级权限的使用 -->
                  <el-col :span="18">
                    <el-row>
                      <el-col>
                        <el-tag
                          type="warning"
                          v-for="(item3,i3) in item2.children"
                          :key="item3.id"
                          closable
                          @close="removeRights(scope.row,item3.id)"
                        >{{item3.authName}}</el-tag>
                      </el-col>
                    </el-row>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="editRoles(scope.row.id)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="deleteRoles(scope.row.id)"
            >删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="rolesForm" ref="rolesFormRef" label-width="70px" class="demo-ruleForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="rolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="rolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改按钮对话框 -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%" @click="editDialogClosed">
      <el-form :model="editsForm" ref="editFormRef" label-width="70px" class="demo-ruleForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editsForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editsForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRolesInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 权限分配的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="SetRightDialogVisible"
      width="50%"
      @close="SetRightDialogClose"
    >
      <!-- 树形结构控件 -->
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="SetRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>


<script>
export default {
  data() {
    return {
      // 所有角色的数据列表
      roleslist: [],
      //   添加角色表单数据
      rolesForm: {
        roleName: '',
        roleDesc: ''
      },
      //   添加角色对话框的显示隐藏
      addDialogVisible: false,
      //   修改角色对话框的显示隐藏
      editDialogVisible: false,

      // 权限分配的对话框的显示隐藏
      SetRightDialogVisible: false,
      //  所有权限的数据
      rightslist: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选择的节点id数组
      defKeys: [],
      // 当前即将分配权限的id
      roleId: '',

      //   查询到的角色信息对象
      editsForm: {}
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色的列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')

      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }

      this.roleslist = res.data
      // console.log(this.roleslist)
    },

    // 监听用户信息的对话框关闭事件
    addDialogClosed() {
      this.$refs.rolesFormRef.resetFields()
    },

    // 实现添加角色功能
    addRoles() {
      this.$refs.rolesFormRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await this.$http.post('roles', this.rolesForm)

        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        // 添加成功后隐藏对话框
        this.addDialogVisible = false
        // 重新渲染用列表
        this.getRolesList()
      })
    },

    // 点击修改用户
    async editRoles(id) {
      // console.log(id);
      const { data: res } = await this.$http.get('roles/' + id)
      // console.log(res);

      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.editsForm = res.data
      this.editDialogVisible = true
      // console.log(this.editsForm)

      //   console.log(id);
    },

    // 监听用户信息的对话框关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },

    // 修改完用户的最后一步
    editRolesInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 发送修改用户信息的数据请求
        const { data: res } = await this.$http.put(
          'roles/' + this.editsForm.roleId,
          {
            roleName: this.editsForm.roleName,
            roleDesc: this.editsForm.roleDesc
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改用户信息失败')
        }

        // 更新成功时，关闭对话框，更新数据，提示修改成功
        this.editDialogVisible = false
        this.getRolesList()
        this.$message.success('修改用户成功')
      })
    },

    // 实现删除角色
    async deleteRoles(id) {
      // 弹框询问是否删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      // 如果点击了确认删除返回的就是字符串confirm
      // 如果点击取消返回的则是字符串cancel
      // console.log(confirmResult);
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      // 发送请求删除数据
      const { data: res } = await this.$http.delete('roles/' + id)

      if (res.meta.status !== 200) {
        this.$message.error('删除用户失败')
      }

      this.$message.success('删除用户成功')
      // 刷新列表
      this.getRolesList()
    },

    // 实现删除权限
    async removeRights(roles, id) {
      // 点击删除时弹出提示框
      const confirmresult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      // 点击取消按钮时
      if (confirmresult !== 'confirm') {
        return this.$message.info('取消了删除')
      }

      // 发送删除请求
      const { data: res } = await this.$http.delete(
        `roles/${roles.id}/rights/${id}`
      )

      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }

      roles.children = res.data
    },

    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      // 获取所有的权限数据
      const { data: res } = await this.$http.get('rights/tree')

      if (res.meta.status !== 200) {
        return this.$message.error('获取权限失败')
      }

      // 把获取的权限数据保存到数组中
      this.rightslist = res.data
      // console.log(this.rightslist);

      // 递归获取三级权限id
      this.getLeafKeys(role, this.defKeys)

      this.SetRightDialogVisible = true
    },

    // 通过递归的形式获取所有三级权限的id，然后 保存到上面数组中
    getLeafKeys(node, arr) {
      // 如果当前的node不包含children节点的话，就是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach(item => this.getLeafKeys(item, arr))
    },

    // 监听分配权限的对话框的关闭事件
    SetRightDialogClose() {
      this.defKeys = []
    },

    // 点击确定为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      console.log(keys)

      const idStr = keys.join(',')

      // 发送请求
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限失败')

      this.getRolesList()

      this.SetRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>

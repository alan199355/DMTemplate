<template>
  <el-dialog class="choose-org-container"
             :title="title"
             :modal='false'
             @close="dialogClose"
             :width="orgType==='user'?'60%':'20%'"
             :visible.sync="visible">
    <div class="choose-org">
      <OrganizationTree :rightMenu="false"
                        :filterNodeParam="filterNode"
                        :curMenu.sync="curNode"></OrganizationTree>
      <JobUserList v-if="orgType==='user'"
                   ref="jobUserList"
                   :checkbox="true"
                   :showEditRow="false"
                   :nodeData="curNode"
                   :requestParam="getJobUserListParam"></JobUserList>
    </div>
    <div id="bottomBox">
      <el-button @click="dialogClose"
                 size="medium">取 消</el-button>
      <el-button @click="confirmChooseOrg"
                 size="medium"
                 type="primary">保 存</el-button>

    </div>
  </el-dialog>
</template>
<script>
import OrganizationTree from '@/components/OrganizationTree/OrganizationTree'
import JobUserList from '@/components/JobUserList/JobUserList'
// import { userPermissionApi } from '@/services/UserPermission'
import { organizationApi } from '@/services/CompanySetting'
export default {
  data () {
    return {
      visible: false,
      requestParam: {
        node_no: '',
        node_type: ''
      },
      curNode: {},

      // 选择组织树时的类型，如归属公司，部门，存放地点
      chooseOrgType: 'company',
      // 获取人员列表请求参数
      getJobUserListParam: {
        org_no: '',
        dept_no: '',
        job_id: '',
        node_type: '',
        user_name: '',
        is_page: 1,
        page: 1,
        page_size: 10
      },
      filterNode: {}
    }
  },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    orgType: {
      type: String,
      default: 'company'
    },
    title: {
      type: String,
      default: ''
    },
    callback: {
      type: Function
    },
    nodeNo: {
      type: Object,
      default: () => {
        return {
          nodeNo: '',
          type: true
        }
      }
    }
  },
  components: {
    OrganizationTree,
    JobUserList
  },
  watch: {
    dialogVisible (newval) {
      this.visible = newval
    },
    curNode: {
      handler (newval) {
        let tempData = {}
        console.log(newval, 'watch')
        tempData.node_type = newval.node_type
        tempData.user_name = ''
        if (newval.node_type === '1') {
          tempData.org_no = newval.org_no
        } else if (newval.node_type === '2') {
          tempData.dept_no = newval.no
        } else if (newval.node_type === '3') {
          tempData.job_id = newval.id
        }
        this.getJobUserListParam = Object.assign(this.getJobUserListParam, tempData)
      },
      deep: true
    },
    nodeNo: {
      handler (newval) {
        console.log(newval, 'allot list')
        this.filterNode = newval
        if (newval.nodeNo && this.$refs.jobUserList) {
          // 如果需要进行筛选组织树，清空用户列表，避免出现显示其他部门用户的情况
          // this.$refs.jobUserList.jobUserList.list = []
        }
      },
      deep: true
    }
  },
  methods: {
    dialogClose () {
      this.$emit('update:dialogVisible', false)
    },
    // 获取组织树
    getOrganizationTree () {
      this.requestParam.node_no = this.nodeNo
      organizationApi.getOrgTree({

      }).then(res => {
        console.log(res, 'get org tree')
        let data = res.data
        console.log(data, 'handle data')
        this.$store.dispatch('setOrgainzationTree', data)
        window.localStorage.setItem('platformOrganizationTree', JSON.stringify(data))
      }, err => {
        console.log(err)
      });
      // userPermissionApi.getOrganizationTree({
      //   data: this.requestParam
      // }).then(res => {
      //   if (res.code === 0) {
      //     this.$store.dispatch('setOrgainzationTree', res.data)
      //     window.localStorage.setItem('platformOrganizationTree', JSON.stringify(res.data))
      //   }
      // })
    },
    confirmChooseOrg () {
      // 根据选择类型的不同判断选择的节点是否合理
      let node = this.curNode
      console.log(node, 'node')
      if (this.orgType === 'company') {
        if (node.node_type === '1') {
          this.$emit('callback', node)
          this.dialogClose()
        } else {
          this.$message.warning('请选择所属公司')
        }
      } else if (this.orgType === 'dept' || this.orgType === 'deposit') {
        if (node.node_type === '2') {
          this.$emit('callback', node)
          this.dialogClose()
        } else {
          this.$message.warning('请选择所属部门')
        }
      } else if (this.orgType === 'job') {
        if (node.node_type === '3') {
          this.$emit('callback', node)
          this.dialogClose()
        } else {
          this.$message.warning('请选择所属岗位')
        }
      } else if (this.orgType === 'user') {
        let selection = this.$refs.jobUserList.$refs.obsTable.selection;
        console.log('用户selection=', selection)
        if (selection.length != 0) {
          // 将所选节点的公司信息，分公司信息，单位信息代入
          let nodeData = {}
          nodeData = {
            company_id: node.company_id,
            company_name: node.company_name,
            org_no: node.p_org_no,
            org_name: node.p_org_name,
            dept_no: node.node_type === '2' ? node.no : node.dept_no,
            dept_name: node.node_type === '2' ? node.name : node.dept_name
          }
          selection.map((item) => {
            item = Object.assign(item, nodeData)
          })
          this.$emit('callback', selection)
          console.log('用户selectionData=', selection)
          this.dialogClose()
        } else {
          this.$message.warning('请至少选择一位接收人')
        }
      }
    }
  },

  created () {
  },
  mounted () {
    let store = this.$store.state.orgainzationTree
    let storage = JSON.parse(window.localStorage.getItem('platformOrganizationTree')) || []
    this.filterNode = this.nodeNo
    this.getOrganizationTree()
    if (!store.length && !storage.length) {

    }
  }
}
</script>
<style scoped lang='scss'>
.choose-org-container {
  #bottomBox {
    margin-top: 40px;
    text-align: center;
  }
  #bottomBox /deep/ .el-button:nth-child(1) {
    margin-right: 12px;
  }
  .choose-org {
    display: flex;
    justify-content: flex-start;
    .staff-list-container {
      flex: 1;
      margin-left: 20px;
    }
  }
}
</style>

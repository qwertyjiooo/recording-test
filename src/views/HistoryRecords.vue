<template>
  <div class="HistoryRecordBox">
    <el-card class="HistoryRecordTitle">
      <div class="CardHeader">
        <div class="Blue"></div>
        <div class="Text">历史笔录</div>
      </div>
      <div class="CardContent">
        <div class="ContentItem">
          <div class="ItemText">选择时间:</div>
          <!-- <el-input v-model="input" placeholder="请输入标题" clearable /> -->
          <el-date-picker v-model="value" type="date" value-format="YYYY-MM-DD" placeholder="请选择日期" />
        </div>
        <div class="ContentItem">
          <div class="ItemText">笔录名称:</div>
          <el-input v-model="input" placeholder="请输入笔录名称" clearable />
        </div>
        <div class="ContentItem">
          <el-button size="large" type="primary" @click="suosou">搜索</el-button>
        </div>
      </div>
    </el-card>
    <el-card class="HistoryRecordContent">
      <div class="CardHeader">
        <div class="Blue"></div>
        <div class="Text">查询列表</div>
      </div>
      <div class="CardContent">
        <el-table :data="tableData" stripe style="width: 100%;height: calc(100vh - 400px);">
          <el-table-column prop="title" label="笔录名称" />
          <el-table-column prop="remark" label="备注" />
          <el-table-column prop="createTime" label="创建时间" />
          <el-table-column prop="updateTime" label="更新时间" />
          <el-table-column label="操作内容" width="160">
            <template #default="scope">
              <el-button size="small" type="primary" @click="handleChakan(scope.$index, scope.row)">查看</el-button>
              <el-button size="small" type="warning" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
              <el-button size="small" type="success" @click="handleDaoChu(scope.$index, scope.row)">打印</el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <template style="display: flex;justify-content: flex-end;margin-top: 10px;">
          <el-pagination v-model:currentPage="currentPage4" v-model:page-size="pageSize4" :page-sizes="[10, 20, 30, 40]"
            :small="small" :disabled="disabled" :background="background"
            layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
            @current-change="handleCurrentChange" />
        </template>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import {
  ref, onMounted, inject, Ref,
} from 'vue';
import axiosInstance from '@/api/axios';
import { AxiosResponse } from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';

export default ({
  setup() {
    const router = useRouter();
    const itemList: Ref<{ name: string; path: string; }[]> = inject('itemList', ref([]));
    const zhanshigaoduRef: Ref<boolean> = inject<Ref<boolean>>('zhanshigaodu', ref(false));
    const value = ref('');
    const input = ref('');
    const total = ref<number>(0);
    const pageSize4 = ref<number>(10);
    const disabled = ref(false);
    const currentPage4 = ref(1);
    const small = ref(false);
    const background = ref(true);
    interface User {
      id: string
      title: string
      remark: string
      createTime: string
      updateTime: string
    }
    const tableData = ref<User[]>([]);
    function getListRecord() {
      const requestBody = {
        title: input.value,
        startTime: value.value,
        endTime: value.value,
        page: currentPage4.value - 1,
        pageSize: pageSize4.value,
      };
      console.log('请求参数:', requestBody);
      axiosInstance.post('/api/listRecord', requestBody).then((response: AxiosResponse<any, any>) => {
        if (response.data.status === 'SUCCESS') {
          tableData.value = response.data.data.list;
          total.value = response.data.data.totalRecords;
        }
      }).catch((error: any) => {
        console.error('获取笔录列表失败:', error);
      });
    }
    function processDictToArray(response: any) {
      const tempitems = [];
      response.data.data.titleVoList.forEach((element: any) => {
        let pathStr = '';
        let nameStr = '';
        const nameList: any[] = [];
        if (element.type === 1) {
          pathStr = `/Parties-page?id=${element.bookVo.id}`;
          nameStr = `${element.title}`;
        } else if (element.type === 2) {
          pathStr = `/FollowUpRecords-page?id=${element.bookVo.id}`;
          nameStr = `${element.title}`;
        } else if (element.type === 3) {
          pathStr = '/AcceptanceRegistrationForm-page';
          nameStr = element.title;
        } else if (element.type === 4) {
          pathStr = '/MediationAgreement-page';
          nameStr = element.title;
        }
        const temp1 = {
          name: nameStr,
          path: pathStr,
          select: false,
          recordInfo: element,
        };
        tempitems.push(temp1);
      });
      tempitems.push({ name: '打印预览', path: '/Print-preview', select: false });
      return tempitems;
    }
    // 根据记录ID获取所有文书
    function getAllBookListByRecordId(recordId: string, select: boolean) {
      localStorage.setItem('recordId', recordId);
      axiosInstance.get('/api/getAllBookListByRecordId', {
        params: {
          recordId,
        },
      }).then((response: AxiosResponse<any, any>) => {
        if (response.data.status === 'SUCCESS') {
          localStorage.setItem('record', JSON.stringify(response.data.data));
          const tempitems = processDictToArray(response);
          if (itemList) {
            itemList.value = [];
          }
          if (select) {
            tempitems[tempitems.length - 1].select = true;
          }
          tempitems.forEach((element: any) => {
            if (itemList) {
              itemList.value.push(element);
            }
          });
        }
      }).catch((error: any) => {
        console.error('根据记录ID获取所有文书失败:', error);
      });
    }
    onMounted(() => {
      getListRecord();
      if (zhanshigaoduRef) {
        zhanshigaoduRef.value = false;
      }
    });
    // 查看
    const handleChakan = (index: number, row: User) => {
      getAllBookListByRecordId(row.id, true);
    };
    // 编辑
    const handleEdit = (index: number, row: User) => {
      getAllBookListByRecordId(row.id, false);
      router.push({ name: '修改笔录', query: { recordId: row.id } });
    };
    // 导出
    const handleDaoChu = (index: number, row: User) => {
      getAllBookListByRecordId(row.id, true);
      router.push({ name: '打印预览', query: { recordId: row.id } });
    };
    // 删除笔录
    const handleDelete = (index: number, row: User) => {
      ElMessageBox.confirm(
        '确定要删除笔录吗?',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info',
          center: true,
        },
      ).then(() => {
        axiosInstance.get('/api/removeByRecordId', {
          params: {
            recordId: row.id,
          },
        }).then((response: AxiosResponse<any, any>) => {
          if (response.data.status === 'SUCCESS') {
            ElMessage({
              type: 'success',
              message: '成功删除笔录',
            });
            getListRecord();
          }
        }).catch((error: any) => {
          console.error('删除笔录失败:', error);
        });
      }).catch(() => {
        console.log('取消删除');
      });
    };
    const handleSizeChange = (val: number) => {
      pageSize4.value = val;
      getListRecord();
    };
    function suosou() {
      if (value.value == null || value.value === '') {
        value.value = '';
      }
      getListRecord();
    }
    const handleCurrentChange = (val: number) => {
      currentPage4.value = val;
      getListRecord();
    };
    return {
      value,
      input,
      small,
      background,
      tableData,
      pageSize4,
      currentPage4,
      total,
      disabled,
      handleEdit,
      handleDaoChu,
      handleChakan,
      handleDelete,
      handleSizeChange,
      handleCurrentChange,
      suosou,
    };
  },
});

</script>

<style lang="scss" scoped>
::v-deep .el-table .cell {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;

  .el-button--small {
    margin-left: 0;
    margin-right: 12px;
    margin-bottom: 6px;
  }
}

.HistoryRecordBox {
  width: calc(100% - 20px);
  display: flex;
  flex-direction: column;
  margin: 10px;
  height: calc(100vh - 130px);
  ;

  .HistoryRecordTitle {
    display: flex;
    flex-direction: column;
    height: 120px;

    .CardHeader {
      border-bottom: 1px solid #d3dce6;
      display: flex;
      font-size: 15px;
      font-weight: 600;
      line-height: 20px;
      padding-bottom: 8px;
      color: #000;
      align-items: center;

      .Blue {
        width: 10px;
        height: 10px;
        background-color: blue;
        margin-right: 8px
      }
    }

    .CardContent {
      // width: calc(100% - 30px);
      display: flex;
      justify-content: flex-start;
      padding: 15px 0 0;

      .ContentItem {
        width: 48%;
        display: flex;
        align-items: center;
        font-size: 14px;
        margin-right: 10px;

        .ItemText {
          width: 80px;
          margin-right: 5px;
        }

        .el-input {
          width: 50% !important;
        }
      }
    }
  }

  .HistoryRecordContent {
    display: flex;
    flex-direction: column;
    margin-top: 20px;

    .CardHeader {
      border-bottom: 1px solid #d3dce6;
      display: flex;
      font-size: 15px;
      font-weight: 600;
      line-height: 20px;
      padding-bottom: 8px;
      color: #000;
      align-items: center;

      .Blue {
        width: 10px;
        height: 10px;
        background-color: blue;
        margin-right: 8px
      }
    }

    .CardContent {
      width: calc(100% - 30px);
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      padding: 15px 15px 0;

      .ContentItem {
        width: 18%;
        display: flex;
        align-items: center;
        font-size: 14px;

        .ItemText {
          width: 40%;
        }
      }
    }
  }
}
</style>

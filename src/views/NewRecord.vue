<template>
  <div class="NewRecordBox">
    <el-card class="NewRecordTitle">
      <div class="CardHeader">
        <div class="Blue"></div>
        <div class="Text">新建笔录</div>
      </div>
      <div class="CardContent">
        <div class="ContentItem">
          <div class="ItemText">笔录标题:</div>
          <el-input v-model="input" placeholder="请输入标题" clearable />
        </div>
        <div class="ContentItem">
          <div class="ItemText">笔录地点:</div>
          <el-select v-model="selectedLocation" placeholder="请选择笔录地点">
            <el-option v-for="person in locationList" :key="person.id" :label="person.name" :value="person.id">
            </el-option>
          </el-select>
        </div>
        <div class="ContentItem">
          <div class="ItemText">笔录人员:</div>
          <el-select v-model="selectedPerson" placeholder="请选择笔录人员">
            <el-option v-for="person in personList" :key="person.id" :label="person.name" :value="person.id">
            </el-option>
          </el-select>
        </div>
        <div class="ContentItem">
          <div class="ItemText">笔录时间:</div>
          <el-date-picker v-model="valuedate" type="date" value-format="YYYY-MM-DD" placeholder="请选择日期" />
        </div>
      </div>
    </el-card>
    <el-card class="FirstParty" v-for="(item, index) in Form" :key="index">
      <div class="CardHeader">
        <div class="Blue"></div>
        <div class="Text">{{ item.title }}</div>
        <div style="flex: 1;display: flex;justify-content: flex-end;"><el-button size="small" type="danger"
            @click="handleDelete(index)">删除</el-button></div>
      </div>
      <div class="CardContent">
        <div class="ContentLeft">
          <div class="LeftItem" v-for="(it, indexs) in item.items" :key="indexs">
            <div class="lightskyblue"></div>
            <div class="ItemName">
              <div class="NameTxt">当事人{{ indexs + 1 }}姓名：</div>
              <el-input v-model="it.name" placeholder="请输入姓名" clearable />
            </div>
            <div class="ItemType">
              <div class="NameTxt">身份证号:</div>
              <el-input v-model="it.Type" placeholder="请输入身份证号" clearable />
            </div>
            <el-button class="CloseButton" @click="DeleteItem1(index, indexs)">X 删除</el-button>
          </div>
        </div>
        <el-button class="ContentRight" @click="AddItem1(index)">+ 增加当事人</el-button>
      </div>
    </el-card>
    <el-card class="remarkBox">
      <div class="CardHeader">
        <div class="Blue"></div>
        <div class="Text">备注</div>
      </div>
      <div class="CardContent">
        <el-input v-model="textarea" :rows="4" type="textarea" placeholder="请输入" />
      </div>
    </el-card>
    <div class="ButtonBox">
      <el-button class="AddButton" @click="AddNewIparty()">+ 增加当事方</el-button>
      <el-button class="SaveButton" @click="savedata()">保存</el-button>
      <el-button class="CancelButton" @click="quxiao()">取消</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import {
  ref, onMounted, reactive, inject, Ref,
} from 'vue';
import axiosInstance from '@/api/axios';
import { AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus';

export default ({

  setup() {
    interface PartyPerson {
      name: string;
      type: string;
    }
    interface PartyPersonList {
      partyName: string;
      partyPersonObjectList: PartyPerson[];
    }
    interface Person {
      id: string
      name: string
    }
    const personList = ref<Person[]>([]);
    const selectedPerson = ref<Person>();
    interface Location {
      id: string
      name: string
    }
    const locationList = ref<Location[]>([]);
    const selectedLocation = ref<Location>();
    const itemList: Ref<{ name: string; path: string; }[]> = inject('itemList', ref([]));
    const Form = reactive([
      {
        id: 0,
        title: '当事方1',
        items: [
          { name: '', Type: '' },
        ],
      },
      {
        id: 2,
        title: '当事方2',
        items: [
          { name: '', Type: '' },
        ],
      },
    ]);
    const valuedate = ref();
    const input = ref('');
    const textarea = ref('');
    // 获取笔录人员列表
    function getPersonList() {
      axiosInstance.get('/api/getPersonList').then((response: AxiosResponse<any, any>) => {
        if (response.data.status === 'SUCCESS') {
          personList.value = response.data.data;
        }
      }).catch((error: any) => {
        console.error('获取笔录人员列表失败:', error);
      });
    }
    // 获取笔录地点列表
    function getLocationList() {
      axiosInstance.get('/api/getLocationList').then((response: AxiosResponse<any, any>) => {
        if (response.data.status === 'SUCCESS') {
          locationList.value = response.data.data;
        }
      }).catch((error: any) => {
        console.error('获取笔录地点列表失败:', error);
      });
    }
    function setvaluedate() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      valuedate.value = `${year}-${month}-${day}`;
    }

    onMounted(() => {
      setvaluedate();
      getLocationList();
      getPersonList();
    });
    // 删除当事方
    const handleDelete = (index: number) => {
      if (Form.length <= 1) {
        ElMessage('必须有一个当事方');
      } else {
        Form.splice(index, 1);
      }
    };
    // 删除当事人1
    function DeleteItem1(index: number, indexs: number) {
      Form[index].items.splice(indexs, 1);
      if (Form[index].items.length === 0) {
        handleDelete(index);
      }
    }
    // 新增当事人1
    function AddItem1(index: number) {
      Form[index].items.push({ name: '', Type: '' });
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
    function getAllBookListByRecordId(recordId: string) {
      axiosInstance.get('/api/getAllBookListByRecordId', {
        params: {
          recordId,
        },
      }).then((response: any) => {
        if (response.data.status === 'SUCCESS') {
          localStorage.setItem('record', JSON.stringify(response.data.data));
          const tempitems = processDictToArray(response);
          tempitems[0].select = true;

          if (itemList) {
            itemList.value = [];
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
    // 新增笔录
    function addRecord(requestBody: any) {
      axiosInstance.post('/api/addRecord', requestBody).then((response: AxiosResponse<any, any>) => {
        if (response.data.status === 'SUCCESS') {
          localStorage.setItem('recordId', response.data.data.id);
          getAllBookListByRecordId(response.data.data.id);
        }
      }).catch((error: any) => {
        console.error('新增笔录失败:', error);
      });
    }
    // 保存
    function savedata() {
      const temppartyObjectList: PartyPersonList[] = [];
      Form.forEach((element) => {
        const temppartyPersonObjectList: PartyPerson[] = [];
        element.items.forEach((elementt) => {
          const temppartyPersonObjectListneirong = {
            name: elementt.name,
            type: elementt.Type,
          };
          temppartyPersonObjectList.push(temppartyPersonObjectListneirong);
        });
        const tempnei = {
          partyName: element.title,
          partyPersonObjectList: temppartyPersonObjectList,
        };
        temppartyObjectList.push(tempnei);
      });
      const data = {
        title: input.value,
        locationId: selectedLocation.value,
        personId: selectedPerson.value,
        inputTime: valuedate.value,
        remark: textarea.value,
        partyObjectList: temppartyObjectList,
      };
      addRecord(data);
    }
    // 添加当事方
    async function AddNewIparty() {
      const num = Form.length + 1;
      const newItems = {
        id: num,
        title: `当事方${num}`,
        items: [
          { name: '', Type: '' },
        ],
      };
      Form.push(newItems);
    }

    // 取消初始化
    function quxiao() {
      Form.splice(0);
      const num = Form.length + 1;
      const newItems = {
        id: num,
        title: `当事方${num}`,
        items: [
          { name: '', Type: '' },
        ],
      };
      Form.push(newItems);
      selectedPerson.value = undefined;
      selectedLocation.value = undefined;
      setvaluedate();
      input.value = '';
      textarea.value = '';
    }
    return {
      valuedate,
      input,
      Form,
      textarea,
      DeleteItem1,
      AddItem1,
      savedata,
      AddNewIparty,
      handleDelete,
      personList,
      selectedPerson,
      locationList,
      selectedLocation,
      quxiao,
    };
  },
});

</script>

<style lang="scss" scoped>
::v-deep .el-card__body {
  padding: 15px;
}

.NewRecordBox {
  width: calc(100% - 20px);
  overflow-y: auto;
  // height: calc(100% - 20px);
  flex-direction: column;
  margin: 10px;
  height: calc(100vh - 130px);

  .NewRecordTitle {
    display: flex;
    flex-direction: column;

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
      justify-content: flex-start;
      flex-wrap: wrap;
      padding: 15px 0 0;

      .ContentItem {
        width: 48%;
        display: flex;
        align-items: center;
        font-size: 14px;
        margin-bottom: 10px;

        .ItemText {
          width: 120px;
        }
      }
    }
  }

  .FirstParty {
    display: flex;
    flex-direction: column;
    margin-top: 15px;

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
      // display: flex;
      // align-items: end;
      padding: 15px 15px 0;

      .ContentLeft {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        flex-direction: column;

        .LeftItem {
          display: flex;
          align-items: center;
          font-size: 13px;
          margin-bottom: 15px;

          .lightskyblue {
            width: 8px;
            height: 8px;
            background-color: rgb(75, 58, 230);
            margin-right: 6px;
          }

          .ItemName {
            width: 36%;
            display: flex;
            align-items: center;
            margin-right: 6px;

            .NameTxt {
              width: 150px;
            }
          }

          .ItemType {
            width: 36%;
            display: flex;
            align-items: center;
            margin-right: 10px;

            .NameTxt {
              width: 40%;
            }
          }

          .CloseButton {
            width: 15%;
            border: 1px solid #1e73d4;
            color: #1e73d4;
            font-size: 15px;
            font-weight: 600;
            line-height: 28px;
          }
        }
      }

      .ContentRight {
        width: 130px;
        background-color: #0b52a3;
        color: #fff;
        font-size: 15px;
        font-weight: 600;
        line-height: 30px;
        // margin-bottom: 15px;
      }
    }
  }

  .remarkBox {
    display: flex;
    flex-direction: column;
    margin-top: 15px;

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
      padding: 15px 0;
    }
  }

  .ButtonBox {
    margin-top: 50px;
    display: flex;
    justify-content: center;

    .AddButton {
      width: 140px;
      background-color: #0b52a3;
      color: #fff;
      font-size: 15px;
      font-weight: 600;
      line-height: 30px;
      margin-left: 15px;
    }

    .SaveButton {
      width: 80px;
      background-color: #0b52a3;
      color: #fff;
      font-size: 15px;
      font-weight: 600;
      line-height: 30px;
      margin-left: 15px;
    }

    .CancelButton {
      width: 80px;
      background-color: #0b52a3;
      color: #fff;
      font-size: 15px;
      font-weight: 600;
      line-height: 30px;
      margin-left: 15px;
    }
  }
}
</style>

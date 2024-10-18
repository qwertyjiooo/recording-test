<template>
    <div class="NewRecordBox">
        <el-card class="NewRecordTitle">
            <div class="CardHeader">
                <div class="Blue"></div>
                <div class="Text">笔录</div>
            </div>
            <div class="CardContent">
                <div class="ContentItem">
                    <div class="ItemText">笔录标题:</div>
                    <el-input v-model="input" placeholder="请输入标题" />
                </div>
                <div class="ContentItem">
                    <div class="ItemText">笔录地点:</div>
                    <el-input v-model="selectedLocation" placeholder="请输入标题" disabled />
                </div>
                <div class="ContentItem">
                    <div class="ItemText">笔录人员:</div>
                    <el-input v-model="selectedPerson" placeholder="请输入标题" disabled />
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
                <div class="Text">{{ item.partyName }}</div>
            </div>
            <div class="CardContent">
                <div class="ContentLeft">
                    <div class="LeftItem" v-for="(it, indexs) in item.partyPersonVoList" :key="indexs">
                        <div class="lightskyblue"></div>
                        <div class="ItemName">
                            <div class="NameTxt">当事人{{ indexs + 1 }}姓名：</div>
                            <el-input v-model="it.name" placeholder="请输入姓名" disabled />
                        </div>
                        <div class="ItemType">
                            <div class="NameTxt">身份证号:</div>
                            <el-input v-model="it.type" placeholder="请输入身份证号" disabled />
                        </div>
                    </div>
                </div>
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
        <el-card class="ModificationRecordBox">
            <div class="CardHeader">
                <div class="Blue"></div>
                <div class="Text">修改记录</div>
            </div>
            <el-table :data="tableData" stripe style="width: 100%">
                <el-table-column prop="createTime" label="操作时间" />
                <el-table-column prop="operName" label="操作人" />
                <el-table-column prop="content" label="操作内容" />
            </el-table>
            <template style="display: flex;justify-content: flex-end;margin-top: 10px;">
                <el-pagination v-model:currentPage="currentPage" v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 30, 40]" :small="false" :disabled="false" :background="true"
                    layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
                    @current-change="handleCurrentChange" />
            </template>
        </el-card>
        <div class="ButtonBox">
            <el-button class="SaveButton" @click="savedata()">保存</el-button>
        </div>
    </div>
</template>

<script lang="ts">
import {
    ref, onMounted, inject, Ref,
} from 'vue';
import axiosInstance from '@/api/axios';
import { AxiosResponse } from 'axios';

export default ({

    setup() {
        const zhanshigaoduRef: Ref<boolean> = inject<Ref<boolean>>('zhanshigaodu', ref(false));
        const Form = ref([{
            partyName: String,
            partyPersonVoList: [
                {
                    name: String,
                    type: String,
                },
            ],
        }]);
        interface OperRecord {
            id: string
            operName: string
            content: string
            createTime: string
        }
        const currentPage = ref(1);
        const pageSize = ref<number>(10);
        const total = ref<number>(0);
        const tableData = ref<OperRecord[]>([]);
        const recordId = ref('');
        const selectedPerson = ref('');
        const selectedLocation = ref('');
        const valuedate = ref();
        const input = ref('');
        const textarea = ref('');
        function getListOperRecord() {
            const requestBody = {
                recordId: recordId.value,
                page: currentPage.value - 1,
                pageSize: pageSize.value,
            };
            axiosInstance.post('/api/listOperRecord', requestBody).then((response: AxiosResponse<any, any>) => {
                if (response.data.status === 'SUCCESS') {
                    tableData.value = response.data.data.list;
                    total.value = response.data.data.totalRecords;
                }
            }).catch((error: any) => {
                console.error('获取笔录列表失败:', error);
            });
        }
        const handleSizeChange = (val: number) => {
            pageSize.value = val;
            getListOperRecord();
        };
        const handleCurrentChange = (val: number) => {
            currentPage.value = val;
            getListOperRecord();
        };
        onMounted(() => {
            if (zhanshigaoduRef) {
                zhanshigaoduRef.value = false;
            }
            const recordItem = localStorage.getItem('record');
            if (recordItem) {
                const record = JSON.parse(recordItem);
                recordId.value = record.id;
                input.value = record.title;
                selectedLocation.value = record.locationName;
                selectedPerson.value = record.personName;
                valuedate.value = record.inputTime;
                textarea.value = record.remark;
                Form.value = record.partyVoList;
                getListOperRecord();
            }
        });
        // 添加操作记录
        function addOperRecord(requestBody: any) {
            axiosInstance.post('/api/addOperRecord', requestBody).then((response: AxiosResponse<any, any>) => {
                if (response.data.status === 'SUCCESS') {
                    getListOperRecord();
                }
            }).catch((error: any) => {
                console.error('添加操作记录失败:', error);
            });
        }
        // 修改笔录
        function upmodifyRecord(requestBody: any) {
            axiosInstance.post('/api/modifyRecord', requestBody).then((response: AxiosResponse<any, any>) => {
                if (response.data.status === 'SUCCESS') {
                    const data = {
                        recordId: recordId.value,
                        operName: selectedPerson.value,
                        content: '更新笔录基本信息',
                    };
                    addOperRecord(data);
                }
            }).catch((error: any) => {
                console.error('修改笔录失败:', error);
            });
        }
        // 保存
        function savedata() {
            const data = {
                id: recordId.value,
                title: input.value,
                inputTime: valuedate.value,
                remark: textarea.value,
            };
            upmodifyRecord(data);
        }
        return {
            valuedate,
            input,
            Form,
            selectedPerson,
            selectedLocation,
            textarea,
            savedata,
            recordId,
            tableData,
            currentPage,
            pageSize,
            total,
            handleCurrentChange,
            handleSizeChange,
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

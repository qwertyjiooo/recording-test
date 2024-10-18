<template>
    <div v-if="isdangshifang" class="overlay">
        <div class="NewRecordBox">
            <el-card class="NewRecordTitle">
                <div class="CardHeader">
                    <div class="Blue"></div>
                    <div class="Text">新建笔录</div>
                </div>
                <div class="CardContent">
                    <div class="ContentItem">
                        <div class="ItemText">笔录标题:</div>
                        <el-input ref="inputRef" v-model="input" placeholder="请输入标题" clearable />
                    </div>
                    <div class="ContentItem">
                        <div class="ItemText">笔录地点:</div>
                        <el-select v-model="selectedLocation" popper-class="custom-popper" placeholder="请选择笔录地点">
                            <el-option v-for="person in locationList" :key="person.id" :label="person.name"
                                :value="person.id">
                            </el-option>
                        </el-select>
                    </div>
                    <div class="ContentItem">
                        <div class="ItemText">笔录人员:</div>
                        <el-select v-model="selectedPerson" popper-class="custom-popper" placeholder="请选择笔录人员">
                            <el-option v-for="person in personList" :key="person.id" :label="person.name"
                                :value="person.id">
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
                                <el-input v-model="it.IDcard" placeholder="请输入身份证号" clearable />
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
            <div class="ButtonBox">
                <el-button class="CancelButton" @click="quxiao()">取消</el-button>
                <el-button class="SaveButton" @click="savedata()">保存</el-button>
            </div>
        </div>
    </div>

</template>
<script>
import axiosInstance from '@/api/axios';
import { ElLoading, ElMessage } from 'element-plus';

export default {
    data() {
        return {
            isdangshifang: false,
            input: '',
            valuedate: '',
            selectedLocation: {},
            locationList: [],
            personList: [],
            selectedPerson: {},
            Form: {},
            textarea: '',
        };
    },
    methods: {
        show(selectedLocation, selectedPerson, Form) {
            this.isdangshifang = true;
            this.selectedLocation = selectedLocation;
            this.selectedPerson = selectedPerson;
            this.Form = Form;
            this.setvaluedate();
            this.getPersonList();
            this.getLocationList();
        },
        quxiao() {
            this.isdangshifang = false;
        },
        savedata() {
            if (this.input.length <= 0) {
                ElMessage.error('请输入笔录标题');
            } else {
                const temppartyObjectList = [];
                this.Form.forEach((element) => {
                    const temppartyPersonObjectList = [];
                    element.items.forEach((elementt) => {
                        const temppartyPersonObjectListneirong = {
                            name: elementt.name,
                            type: elementt.IDcard,
                        };
                        temppartyPersonObjectList.push(temppartyPersonObjectListneirong);
                    });
                    const tempnei = {
                        partyName: element.title,
                        partyPersonObjectList: temppartyPersonObjectList,
                    };
                    temppartyObjectList.push(tempnei);
                });
                const loadingInstance = ElLoading.service(
                    {
                        customClass: 'my-custom-loading',
                        text: '正在保存中，请稍等...',
                        background: 'rgba(0, 0, 0, 0.7)',
                    },
                );
                const data = {
                    title: this.input,
                    locationId: this.selectedLocation,
                    personId: this.selectedPerson,
                    inputTime: this.valuedate,
                    remark: this.textarea,
                    partyObjectList: temppartyObjectList,
                };
                axiosInstance.post('/api/addRecord', data).then((response) => {
                    if (response.data.status === 'SUCCESS') {
                        console.log('新增笔录userInfo', response.data.data);
                        console.log('recordId', response.data.data.id);
                        this.$emit('upNewRecordInfo', response.data.data);
                        this.quxiao();
                    } else {
                        ElMessage.error('笔录标题重复，请修改重新提交!');
                    }
                    loadingInstance.close();
                }).catch((error) => {
                    loadingInstance.close();
                    ElMessage.error('新增笔录失败:', error);
                });
            }
        },
        setvaluedate() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            this.valuedate = `${year}-${month}-${day}`;

            this.input = `调字 [${year}] ${month}${day}-`;
            this.$nextTick(() => {
                this.$refs.inputRef.$refs.input.focus();
            });
        },
        // 获取笔录人员列表
        getPersonList() {
            axiosInstance.get('/api/getPersonList').then((response) => {
                if (response.data.status === 'SUCCESS') {
                    this.personList = response.data.data;
                    if (this.personList.length > 0) {
                        this.selectedPerson = this.personList[0].id;
                    }
                }
            }).catch((error) => {
                console.error('获取笔录人员列表失败:', error);
            });
        },
        // 获取笔录地点列表
        getLocationList() {
            axiosInstance.get('/api/getLocationList').then((response) => {
                if (response.data.status === 'SUCCESS') {
                    this.locationList = response.data.data;
                    if (this.locationList.length > 0) {
                        this.selectedLocation = this.locationList[0].id;
                    }
                }
            }).catch((error) => {
                console.error('获取笔录地点列表失败:', error);
            });
        },
    },
};
</script>
<style lang="scss" scoped>
.my-custom-loading {
    background-image: url('../assets/loading.gif');
    background-repeat: no-repeat;
    background-size: 300px 300px;
    background-position: center;
    /* 设置为你想要的大小 */
}

.my-custom-loading .el-loading-text {
    font-size: 40px;
    position: absolute;
    margin-top: 100px;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    /* 或者任何你需要的颜色 */
}

.my-custom-loading .circular {
    /*隐藏 默认的 loading 动画*/
    display: none;
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    /* 透明阴影 */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000 !important
}

.custom-popper {
    z-index: 2000 !important;
    /* 根据需要调整z-index */
}

::v-deep .el-card__body {
    padding: 15px;
}

.NewRecordBox {
    width: 80%;
    height: 80%;
    background: white;
    border-radius: 5px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    overflow-y: auto;

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

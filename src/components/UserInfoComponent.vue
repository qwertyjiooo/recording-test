<template>
    <div v-if="isdangshifang" class="overlay">
        <el-card class="FirstParty">
            <div class="CardHeader">
                <div class="Blue"></div>
                <div class="Text">{{ title }}</div>
                <div style="flex: 1;"></div>
                <el-button type="primary" class="ContentRight" @click="guanbi()">关闭</el-button>
            </div>
            <div class="CardContent">
                <div class="ContentLeft">
                    <div class="LeftItem" v-for="(it, indexs) in userInfo.items" :key="indexs">
                        <div class="lightskyblue"></div>
                        <div class="ItemName">
                            <div class="NameTxt">当事人{{ indexs + 1 }}姓名：</div>
                            <el-input v-model="it.name" placeholder="请输入姓名" clearable />
                        </div>
                        <div class="ItemType">
                            <div class="NameTxt">身份证号:</div>
                            <el-input v-model="it.IDcard" placeholder="请输入身份证号" clearable />
                        </div>
                        <el-button class="CloseButton" @click="DeleteItem1(indexs)">删除</el-button>
                    </div>
                </div>
                <el-button class="ContentRight" @click="AddItem()">+ 增加当事人</el-button>
                <el-button type="primary" class="ContentRight" @click="saveUserInfo()">保存</el-button>
            </div>
        </el-card>
    </div>

</template>

<script>
import { ElMessage } from 'element-plus';

export default {
    data() {
        return {
            isdangshifang: false,
            title: '',
            userInfo: {},
        };
    },
    methods: {
        show(userInfo) {
            this.isdangshifang = true;
            this.userInfo = userInfo;
            this.title = userInfo.title;
        },
        guanbi() {
            this.isdangshifang = false;
        },
        saveUserInfo() {
            let isjiacha = true;
            let errorStr = '';
            this.userInfo.items.forEach((element) => {
                if (element.name.length <= 0) {
                    isjiacha = false;
                    errorStr = '请输入当时人姓名';
                }
                if (element.IDcard.length <= 0) {
                    isjiacha = false;
                    errorStr = '请输入当时人身份证号码';
                }
                // 检查长度
                if (element.IDcard.length !== 18) {
                    isjiacha = false;
                    errorStr = '身份证号长度应为18位';
                }
                // 检查前17位是否为数字
                let isjiachanum = false;
                for (let i = 0; i < 17; i++) {
                    if (!/^\d$/.test(element.IDcard.charAt(i))) {
                        isjiachanum = true;
                    }
                    if (isjiachanum) {
                        isjiacha = false;
                        errorStr = '身份证号前17位应为数字';
                    }
                }
                // 校验码验证
                const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
                const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
                let sum = 0;
                for (let i = 0; i < 17; i++) {
                    sum += parseInt(element.IDcard.charAt(i), 10) * weights[i];
                }
                const mod = sum % 11;
                const expectedCheckCode = checkCodes[mod];
                if (element.IDcard.charAt(17).toUpperCase() !== expectedCheckCode) {
                    isjiacha = false;
                    errorStr = '身份证号校验码错误';
                }
            });
            if (isjiacha) {
                this.$emit('updateUserlist', this.userInfo);
                this.guanbi();
            } else {
                ElMessage.error(errorStr);
            }
        },
        DeleteItem1(indexs) {
            if (this.userInfo.items.length <= 1) {
                ElMessage.error('必须有一个当事人');
            } else {
                this.userInfo.items.splice(indexs, 1);
            }
        },
        AddItem() {
            this.userInfo.items.push({ name: '', IDcard: '' });
        },
    },
};
</script>

<style lang="scss" scoped>
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
    z-index: 9990 !important
}

.FirstParty {
    margin-top: 130px;
    width: 80%;
    height: 65%;
    background: white;
    border-radius: 5px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

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
            overflow-y: auto;
            max-height: 400px;

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
</style>

<template>
    <div style="width: 50%;">
        <el-card
            style="display: flex;flex-direction: column;height: calc(100vh - 130px);margin: 10px;border-bottom: 1px solid #d3dce6;background-color: white;">
            <div ref="duihuaneirongDiv" class="content"
                style="height: calc(100vh - 130px - 90px);overflow-y: auto;padding-bottom: 20px;">
                <div v-for="(item, index) in duihualist" :key="index">
                    <div style="text-align: left;margin-top: 20px;">
                        <div style="display: flex;">
                            <div>{{ item.name }}</div>
                            <div style="margin-left: 50px;">{{ item.time }}</div>
                        </div>
                        <div
                            style="display: inline-block;text-align: left; margin-right: 70px; margin-top: 5px; background-color: #f0f0f0; border-radius: 0px 20px 20px 20px; padding: 20px;">
                            {{ item.content }}</div>
                    </div>
                </div>
            </div>
            <div style="height: 90px;">
                <el-button size="large" type="success" @click="shengchengwendang">再次生成</el-button>
            </div>
        </el-card>
    </div>
    <div style="width: 50%;overflow-y: auto;margin-top: -100px;">
        <el-card ref="editorContainer"
            style="display: flex;flex-direction: column;min-height: calc(100vh - 20px);overflow-y: auto;margin: 10px;border-bottom: 1px solid #d3dce6;background-color: white;">
            <div style="display: flex;text-align: right;justify-content: flex-end;">
                <el-button type="primary" @click="baocun">保存</el-button>
            </div>
            <div>
                <el-check-tag style="margin-left: 5px;" checked v-for="(item, index) in tiquneironglist" :key="index"
                    @click="dianjibiaoqian(item)">{{ item }}</el-check-tag>
            </div>
            <el-tabs v-model="selectedActivenum" class="demo-tabs">
                <div v-for="(item, index) in documentList" :key="index">
                    <el-tab-pane :label=item.name :name=index>
                        <quill-editor :id=item.name :ref=item.name :options="editorOption">
                        </quill-editor>
                    </el-tab-pane>
                </div>
            </el-tabs>
        </el-card>
    </div>
    <el-dialog v-model="dialogTableVisibleIndex" show-close="false" title="请选择文档" width="30%">
        <div class="dialog-content">
            <div class="dialog-content-item" v-for="(item, index) in dialogListIndex" :key="index">
                <div class="dialog-content-item-title">{{ item.name }}</div>
                <el-button @click="handleDialogClickIndex(index)">确定</el-button>
            </div>
        </div>
    </el-dialog>
</template>
<script>
import { quillEditor } from 'vue-quill-editor/src';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import Quill from 'quill'; // 导入 Quill
import axios, { all } from 'axios';
import axiosInstance from '@/api/axios';
import { ElLoading, ElMessage } from 'element-plus';
import { inject, onMounted } from 'vue';
import { processDictToArray } from '@/utils/utils';
import { useStore } from 'vuex';

export default {
    components: {
        quillEditor,
    },
    setup() {
        const chatDialog = inject('chatDialog');
        const zhanshigaoduRef = inject('zhanshigaodu');
        const itemList = inject('itemList');
        const store = useStore();
        function updateItemList(newValue) {
            itemList.value = newValue;
        }
        onMounted(() => {
            if (zhanshigaoduRef) {
                zhanshigaoduRef.value = true;
            }
        });
        return {
            chatDialog,
            updateItemList,
            store,
        };
    },
    data() {
        return {
            isshuoshengcehng: false,
            response: {},
            bookVo: {},
            duihualist: [],
            selectedActivenum: 0,
            partyVoList: [],
            documentList: [],
            tiquneironglist: [],
            editorOption: {
                modules: {
                    toolbar: [
                        ['bold', 'italic', 'underline', 'strike'], // 加粗 斜体 下划线 删除线
                        ['blockquote', 'code-block'], // 引用，代码块
                        [{ header: 1 }, { header: 2 }], // 标题，键值对的形式；1、2表示字体大小
                        [{ list: 'ordered' }, { list: 'bullet' }], // 列表
                        [{ indent: '-1' }, { indent: '+1' }], // 缩进
                        [{ direction: 'rtl' }], // 文本方向
                        [{ size: ['small', false, 'large', 'huge'] }], // 字体大小
                        [{ header: [1, 2, 3, 4, 5, 6, false] }], // 几级标题
                        [{ color: [] }, { background: [] }], // 字体颜色，字体背景颜色
                        [{ font: [] }], // 字体
                        [{ align: [] }], // 对齐方式
                        ['clean'], // 清除字体样式
                    ],
                },
            }, // 编辑器配置项
            dialogTableVisibleIndex: false,
            dialogListIndex: [
                { name: '治安调解协议书' },
                { name: '人民调解受理登记表' },
            ], // 弹出窗列表
            dialogTableVisibleIndexRouter: '',
        };
    },
    mounted() {
        // this.dialogTableVisibleIndex = this.store.state.CurrentDialogTableVisibleIndex;
        this.initData();
    },
    methods: {
        // 选择调解协议文档类型
        handleDialogClickIndex(index) {
            // 此处只是试用 store
            this.store.commit('setDialogTableVisibleIndex', index);
            // this.store.commit('setCurrentDialogTableVisibleIndex');
            // this.dialogTableVisibleIndex = this.store.state.CurrentDialogTableVisibleIndex;
            // this.initData();
            this.dialogTableVisibleIndex = false;
            this.shengchengwendang();
        },
        dianjibiaoqian(item) {
            console.log(item);
            if (this.chatDialog) {
                this.chatDialog.showsendMessage(item);
            }
        },
        // 点击生成文档
        async shengchengwendang() {
            const templist = [];
            this.duihualist.forEach((item) => {
                const temp = `${item.name}说: ${item.content}`;
                templist.push(temp);
            });
            const loadingInstance = ElLoading.service(
                {
                    customClass: 'my-custom-loading',
                    text: '正在生成文档，请稍等...',
                    background: 'rgba(0, 0, 0, 0.7)',
                },
            );
            const contentStr = templist.join('\n');
            console.log('contentStr', contentStr);
            const url = 'http://58.246.144.58:8888/process';
            const headers = {
                Accept: 'application/json',
                Authorization: 'Bearer MxwaXdn3jBBigtJniaasCRTrJpe73TWF',
                'Content-Type': 'application/json',
            };
            const data = {
                input: contentStr,
                scenario: 'xieyi',
            };
            try {
                const response = await axios.post(url, data, { headers });
                console.log('请求成功:', response.data);
                const result = response.data;
                this.tiquneironglist = [];
                const keys = Object.keys(result.result);
                if (this.documentList.length <= 0) {
                    const mainFacts = ` ${this.gettiquneironglistString(result.result['主要事实'])}\n `;
                    const mediationAgreement = ` ${this.gettiquneironglistString(result.result['调解协议'])}\n `;
                    console.log('mediationAgreement', mediationAgreement);
                    let xieyitemp = '';
                    keys.forEach((key) => {
                        xieyitemp += `${key}：${this.gettiquneironglistString(result.result[key])}\n`;
                    });
                    const tempneirong = this.setmobanneirong(mainFacts, mediationAgreement, xieyitemp);
                    const tempobj = {
                        name: '版本1',
                        num: 1,
                        content: tempneirong,
                    };
                    this.documentList.push(tempobj);
                    const tempquillref = `${tempobj.name}`;
                    this.$nextTick(() => {
                        const tempquill = this.$refs[tempquillref][0];
                        console.log('quill', tempquill);
                        tempquill.quill.setContents(tempobj.content, 'user');
                        this.baocun();
                    });
                    this.selectedActivenum = 0;
                } else {
                    const mainFacts = ` ${this.gettiquneironglistString(result.result['主要事实'])}\n `;
                    const mediationAgreement = ` ${this.gettiquneironglistString(result.result['调解协议'])}\n `;
                    console.log('mediationAgreement', mediationAgreement);
                    let xieyitemp = '';
                    keys.forEach((key) => {
                        xieyitemp += `${key}：${this.gettiquneironglistString(result.result[key])}\n`;
                    });
                    const tempneirong = this.setmobanneirong(mainFacts, mediationAgreement, xieyitemp);
                    const document = this.documentList[this.documentList.length - 1];
                    const numStr = document.num + 1;
                    // console.log('xieyitemp', xieyitemp);
                    this.documentList.push({
                        name: `版本${numStr}`,
                        num: numStr,
                        content: tempneirong,
                    });
                    const tempquillref = `版本${numStr}`;
                    console.log('tempquillref1', tempquillref);
                    this.$nextTick(() => {
                        const tempquill = this.$refs[tempquillref][0];
                        console.log('quill', tempquill);
                        tempquill.quill.setContents(tempneirong, 'user');
                    });
                    this.selectedActivenum = this.documentList.length - 1;
                }
                console.log('documentList:', this.documentList);
                loadingInstance.close();
            } catch (error) {
                loadingInstance.close();
                console.error('请求失败:', error);
            }
        },
        // 提取**内容
        gettiquneironglistString(originalString) {
            const regex = /\*{2}(.*?)\*{2}/g;
            let match;
            match = regex.exec(originalString);
            while (match !== null) {
                this.tiquneironglist.push(match[1]);
                match = regex.exec(originalString);
            }
            this.tiquneironglist = Array.from(new Set(this.tiquneironglist));
            console.log('tiquneironglist:', this.tiquneironglist);
            return originalString.replace(/\*{2}/g, '').replace(/(\r\n|\n|\r)/g, '');
        },
        // 初始化数据
        initData() {
            this.selectedActivenum = 0;
            const recordId = localStorage.getItem('recordId');
            this.getAllBookListByRecordId(recordId);
        },
        baocun() {
            const elementcontent = this.documentList[this.selectedActivenum];
            const tempquillref = elementcontent.name;
            const tempquill = this.$refs[tempquillref][0];
            const shengcontentList1 = tempquill.quill.getContents().ops;
            elementcontent.document = shengcontentList1;
            elementcontent.name = '调解协议书';
            const requestBody = {
                id: this.bookVo.id,
                recordId: this.bookVo.recordId,
                partyId: this.bookVo.partyId,
                voiceContent: JSON.stringify(this.duihualist),
                content: JSON.stringify([elementcontent]),
                type: this.bookVo.type,
            };
            axiosInstance.post('/api/addOrModifyBookRecords', requestBody).then((response) => {
                if (response.data.status === 'SUCCESS') {
                    ElMessage({
                        message: '保存成功！',
                        type: 'success',
                    });
                    if (this.isshuoshengcehng) {
                        this.isshuoshengcehng = false;
                        const record = JSON.parse(localStorage.getItem('record'));
                        console.log('record', record);
                        const tempitems = processDictToArray(record.titleVoList);
                        console.log('tempitems', tempitems);
                        let pathStr = '';
                        const newItems = tempitems.map((item) => {
                            if (item.recordInfo) {
                                if (item.recordInfo.title === '调查记录') {
                                    pathStr = item.path;
                                    return { ...item, select: true };
                                }
                            }
                            return item;
                        });
                        this.updateItemList(newItems);
                        this.router.push(pathStr);
                    } else {
                        this.initData();
                    }
                }
            }).catch((error) => {
                console.error('新增更新文书记录失败:', error);
            });
        },
        // 新增更新文书记录
        addOrModifyBookRecords(requestBody) {
            axiosInstance.post('/api/addOrModifyBookRecords', requestBody).then((response) => {
                if (response.data.status === 'SUCCESS') {
                    const recordId = localStorage.getItem('recordId');
                    this.getAllBookListByRecordId(recordId);
                }
            }).catch((error) => {
                console.error('新增更新文书记录失败:', error);
            });
        },
        // 根据记录ID获取所有文书
        getAllBookListByRecordId(recordId) {
            axiosInstance.get('/api/getAllBookListByRecordId', {
                params: {
                    recordId,
                },
            }).then((response) => {
                if (response.data.status === 'SUCCESS') {
                    this.response = response.data.data;
                    localStorage.setItem('record', JSON.stringify(response.data.data));
                    response.data.data.titleVoList.forEach((element) => {
                        if (element.type === 1) {
                            this.duihualist = JSON.parse(element.bookVo.voiceContent);
                            this.partyVoList = element.bookVo.partyVoList;
                        }
                        if (element.type === 4) {
                            this.bookVo = element.bookVo;
                            const tempcontent = element.bookVo.content;
                            if (tempcontent && tempcontent.length > 0) {
                                this.isshuoshengcehng = false;
                                const dangshifang = JSON.parse(element.bookVo.content);
                                this.documentList = [];
                                dangshifang.forEach((elementcontent) => {
                                    this.documentList.push(elementcontent);
                                    const tempquillref = elementcontent.name;
                                    this.$nextTick(() => {
                                        const tempquill = this.$refs[tempquillref][0];
                                        console.log('quill', tempquill);
                                        tempquill.quill.setContents(elementcontent.document, 'user');
                                    });
                                });
                            } else {
                                this.documentList = [];
                                this.isshuoshengcehng = true;
                                this.dialogTableVisibleIndex = true;
                                // this.shengchengwendang();
                            }
                        }
                    });
                }
            }).catch((error) => {
                console.error('根据记录ID获取所有文书失败:', error);
            });
        },
        setmobanneirong(mainFacts, iationAgreement, responseValue) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const valuedate = `${year} 年 ${month}月 ${day}日`;
            const partyList = [];
            let partyListName = '';
            let partyListGender = '';
            let partyListType = '';
            this.partyVoList.forEach((item) => {
                item.partyPersonVoList.forEach((item2) => {
                    const genderChar = item2.type.charAt(16);
                    let gender = '';
                    // 判断性别
                    if (Number.isNaN(parseInt(genderChar, 10))) {
                        gender = '';
                    } else if (parseInt(genderChar, 10) % 2 === 0) {
                        gender = '女';
                    } else {
                        gender = '男';
                    }
                    partyList.push(`${item2.name}  ${gender}  ${item2.type}`);
                    partyListName = item2.name;
                    partyListGender = gender;
                    partyListType = item2.type;
                });
            });
            const locationname = this.response.locationName;
            const personname = this.response.personName;
            console.log('this.store.dialogTableVisibleIndex', this.store.state.dialogTableVisibleIndex);
            if (this.store.state.dialogTableVisibleIndex === 1) {
                return [
                    { attributes: { bold: true, size: 'huge' }, insert: '人民调解协议书' },
                    { attributes: { align: 'center' }, insert: '\n' },
                    { attributes: { size: 'large' }, insert: '编号_______字 [    ] _______号 ' },
                    { attributes: { align: 'right' }, insert: '\n' },
                    // 当事人信息
                    { attributes: { size: 'large' }, insert: '当事人姓名' },
                    { attributes: { underline: true, size: 'large' }, insert: ` ${partyListName} ` },
                    { attributes: { size: 'large' }, insert: '性别' },
                    { attributes: { underline: true, size: 'large' }, insert: ` ${partyListGender} ` },
                    { attributes: { size: 'large' }, insert: '民族' },
                    { attributes: { underline: true, size: 'large' }, insert: '_______' },
                    { attributes: { size: 'large' }, insert: '年龄' },
                    { attributes: { underline: true, size: 'large' }, insert: '_______' },
                    { insert: '\n' },
                    { attributes: { size: 'large' }, insert: '身份证号码' },
                    { attributes: { underline: true, size: 'large' }, insert: '______________' },
                    { attributes: { size: 'large' }, insert: '联系方式' },
                    { attributes: { underline: true, size: 'large' }, insert: '_______' },
                    { insert: '\n' },
                    { attributes: { size: 'large' }, insert: '单位或住址' },
                    { attributes: { underline: true, size: 'large' }, insert: '______________' },
                    { insert: '\n' },
                    // 当事人信息
                    { attributes: { size: 'large' }, insert: '当事人姓名' },
                    { attributes: { underline: true, size: 'large' }, insert: ` ${partyListName} ` },
                    { attributes: { size: 'large' }, insert: '性别' },
                    { attributes: { underline: true, size: 'large' }, insert: ` ${partyListGender} ` },
                    { attributes: { size: 'large' }, insert: '民族' },
                    { attributes: { underline: true, size: 'large' }, insert: '_______' },
                    { attributes: { size: 'large' }, insert: '年龄' },
                    { attributes: { underline: true, size: 'large' }, insert: '_______' },
                    { insert: '\n' },
                    { attributes: { size: 'large' }, insert: '身份证号码' },
                    { attributes: { underline: true, size: 'large' }, insert: '______________' },
                    { attributes: { size: 'large' }, insert: '联系方式' },
                    { attributes: { underline: true, size: 'large' }, insert: '_______' },
                    { insert: '\n' },
                    { attributes: { size: 'large' }, insert: '单位或住址' },
                    { attributes: { underline: true, size: 'large' }, insert: '______________' },
                    { insert: '\n' },
                    // 纠纷简要情况
                    { attributes: { size: 'large' }, insert: '主要事实：' },
                    { attributes: { underline: true, size: 'large' }, insert: ` ${mainFacts} ` },
                    { insert: '\n' },
                    { attributes: { size: 'large' }, insert: '经调解，双方自愿达成如下协议：' },
                    { attributes: { underline: true, size: 'large' }, insert: ` ${iationAgreement} ` },
                    { insert: '\n' },
                    // { attributes: { underline: true, size: 'large' }, insert: `${responseValue}` },
                    // { insert: '\n' },
                    { attributes: { size: 'large' }, insert: '履行方式、时限' },
                    { attributes: { underline: true, size: 'large' }, insert: '_______' },
                    { attributes: { size: 'large' }, insert: '本协议一式' },
                    { attributes: { underline: true, size: 'large' }, insert: '_______' },
                    { attributes: { size: 'large' }, insert: '份，当事人、人民调解委员会各持一份。' },
                    { insert: '\n' },
                    { attributes: { size: 'large' }, insert: '当事人（签名盖章或按指印）:_______________' },
                    { insert: '\n' },
                    { attributes: { size: 'large' }, insert: '当事人（签名盖章或按指印）:_______________ ' },
                    { insert: '\n' },
                    { attributes: { size: 'large' }, insert: '人民调解员（签名）_______________ ' },
                    { attributes: { size: 'large' }, insert: '记录人（签名） _______________ ' },
                    { insert: '\n' },
                    { attributes: { size: 'large' }, insert: ' (人员调节委员会印章) ' },
                    { attributes: { align: 'right' }, insert: '\n' },
                    { attributes: { underline: true, size: 'large' }, insert: ` ${valuedate} ` },
                    { attributes: { align: 'right' }, insert: '\n' },
                ];
            }
            if (this.store.state.dialogTableVisibleIndex === 0) {
                return [
                    { attributes: { bold: true, size: 'huge' }, insert: '治安调解协议书' },
                    { attributes: { align: 'center' }, insert: '\n' },
                    { insert: '\n' },
                    { attributes: { size: 'large' }, insert: '（       ）调解字（    ）_______号' },
                    { attributes: { align: 'right' }, insert: '\n' },
                    { insert: '\n' },
                    { attributes: { size: 'large' }, insert: '主持人姓名:' },
                    { attributes: { underline: true, size: 'large' }, insert: ` ${personname} ` },
                    { attributes: { size: 'large' }, insert: '工作单位:' },
                    { attributes: { underline: true, size: 'large' }, insert: ` ${locationname} ` },
                    { insert: '\n' },
                    { attributes: { size: 'large' }, insert: '调解地点：' },
                    { attributes: { underline: true, size: 'large' }, insert: ` ${locationname} ` },
                    { insert: '\n' },
                    { attributes: { size: 'large' }, insert: '当事人基本情况：' },
                    { insert: '\n' },
                    { attributes: { size: 'large' }, insert: `${partyList.join('\n')}` },
                    { insert: '\n' },
                    { attributes: { underline: true, size: 'large' }, insert: `${responseValue}` },
                    { insert: '\n' },
                    { attributes: { size: 'large' }, insert: '本协议自双方签字之时起生效。' },
                    { insert: '\n' },
                    { attributes: { size: 'large' }, insert: '本协议书一式三份，双方当事人各执一份，调解机关留存一份。' },
                    { insert: '\n' },
                    { insert: '\n' },
                    { attributes: { size: 'large' }, insert: '主持人:_______________' },
                    { insert: '\n' },
                    { attributes: { size: 'large' }, insert: `${valuedate}` },
                    { attributes: { align: 'right' }, insert: '\n' },
                    { attributes: { size: 'large' }, insert: '见证人:_______________ ' },
                    { insert: '\n' },
                    { attributes: { align: 'right', size: 'large' }, insert: `${valuedate}` },
                    { attributes: { align: 'right' }, insert: '\n' },
                    { attributes: { size: 'large' }, insert: '当事人:_______________ ' },
                    { insert: '\n' },
                    { attributes: { size: 'large' }, insert: `${valuedate}` },
                    { attributes: { align: 'right' }, insert: '\n' },
                    { insert: '\n' },
                    { insert: '\n' },
                    { attributes: { underline: true, size: 'large' }, insert: `  ${locationname}  ` },
                    { attributes: { align: 'right' }, insert: '\n' },
                    { attributes: { underline: true, size: 'large' }, insert: `  ${valuedate}  ` },
                    { attributes: { align: 'right' }, insert: '\n' },
                    { insert: '\n' },
                ];
            }
            return [];
        },
    },
};
</script>
<style>
/* 在这里添加CSS样式 */

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
</style>

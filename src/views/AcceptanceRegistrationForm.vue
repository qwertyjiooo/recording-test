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

const Font = Quill.import('attributors/style/font');
Font.whitelist = ['SimSun', 'SimHei'];
Quill.register(Font, true);

export default {
    components: {
        quillEditor,
    },
    setup() {
        const zhanshigaoduRef = inject('zhanshigaodu');
        const chatDialog = inject('chatDialog');
        const itemList = inject('itemList');
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
                        [{ font: Font.whitelist }], // 字体
                        [{ align: [] }], // 对齐方式
                        ['clean'], // 清除字体样式
                    ],
                },
            }, // 编辑器配置项
        };
    },
    mounted() {
        this.initData();
    },
    methods: {
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
                scenario: 'dengji',
            };
            try {
                const response = await axios.post(url, data, { headers });
                console.log('请求成功:', response.data);
                const result = response.data;
                this.tiquneironglist = [];
                const keys = Object.keys(result.result);
                if (this.documentList.length <= 0) {
                    keys.forEach((key) => {
                        const temp = this.gettiquneironglistString(result.result[key]);
                        const tempneirong = this.setmobanneirong(temp, key);
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
                    });
                    this.selectedActivenum = 0;
                } else {
                    keys.forEach((key) => {
                        const temp = this.gettiquneironglistString(result.result[key]);
                        const tempneirong = this.setmobanneirong(temp, key);
                        console.log('tempneirong', tempneirong);
                        const document = this.documentList[this.documentList.length - 1];
                        const numStr = document.num + 1;
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
            return originalString.replace(/\*{2}/g, '');
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
            console.log('shengcontentList1:', shengcontentList1);
            elementcontent.document = shengcontentList1;
            elementcontent.name = '登记表';
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
                                if (item.recordInfo.title === '调解协议书') {
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
                        if (element.type === 3) {
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
                                this.shengchengwendang();
                            }
                        }
                    });
                }
            }).catch((error) => {
                console.error('根据记录ID获取所有文书失败:', error);
            });
        },
        setmobanneirong(responseValue, nameList) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const valuedate = `${year} 年 ${month}月 ${day}日`;
            const partyList = [];
            this.partyVoList.forEach((item) => {
                item.partyPersonVoList.forEach((item2) => {
                    partyList.push(item2.name);
                });
            });
            return [
                { attributes: { bold: true, size: 'huge' }, insert: '人民调解受理登记表' },
                { attributes: { align: 'center' }, insert: '\n' },
                { insert: '\n' },
                { attributes: { underline: true, size: 'large' }, insert: `  ${valuedate}  ` },
                { attributes: { size: 'large' }, insert: '，人民调解委员会依当事人申请(人民调解委员会主动调解)，经当事人同意，调解' },
                { attributes: { underline: true, size: 'large' }, insert: `  ${partyList.join(', ')}  ` },
                { attributes: { size: 'large' }, insert: '之间的纠纷。' },
                { insert: '\n' },
                { attributes: { size: 'large' }, insert: '纠纷类型：' },
                { attributes: { underline: true, size: 'large' }, insert: '  治安纠纷  ' },
                { insert: '\n' },
                { attributes: { size: 'large' }, insert: '案件来源：' },
                { attributes: { underline: true, size: 'large' }, insert: ' 1.事人申请 2.人民调解委员会主动调解     ' },
                { insert: '\n' },
                { attributes: { size: 'large' }, insert: '纠纷简要情况：' },
                { attributes: { underline: true, size: 'large' }, insert: `  ${responseValue}       ` },
                { insert: '\n' },
                { insert: '\n' },
                { attributes: { size: 'large' }, insert: '当事人（签名）：_______________ ' },
                { insert: '\n' },
                { insert: '\n' },
                { attributes: { size: 'large' }, insert: '登记人（签名）：_______________ ' },
                { insert: '\n' },
                { insert: '\n' },
                { attributes: { underline: true, size: 'large' }, insert: '  ******人民调解委员会  ' },
                { attributes: { align: 'right' }, insert: '\n' },
                { attributes: { underline: true, size: 'large' }, insert: `  ${valuedate}  ` },
                { attributes: { align: 'right' }, insert: '\n' },
                { insert: '\n' },
                { attributes: { size: 'large' }, insert: '备注：此表由人民调解委员会填写' },
                { insert: '\n' },
            ];
        },
    },
};
</script>
<style>
/* 在这里添加CSS样式 */
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="SimSun"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="SimSun"]::before {
    content: "宋体" !important;
}

.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="SimHei"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="SimHei"]::before {
    content: "黑体" !important;
}

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

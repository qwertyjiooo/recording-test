<template>
    <div style="width: 50%;">
        <el-card
            style="display: flex;flex-direction: column;height: calc(100vh - 130px);margin: 10px;border-bottom: 1px solid #d3dce6;background-color: white;">
            <div ref="duihuaneirongDiv" class="content"
                style="height: calc(100vh - 130px - 90px);overflow-y: auto;padding-bottom: 20px;">
                <el-tabs v-model="selectedActivenumjuifang" class="demo-tabs">
                    <div v-for="(item, index) in huifangdocumentList" :key="index">
                        <el-tab-pane :label=item.title :name=index>
                            <quill-editor :id=item.id :ref=item.id :options="editorOption">
                            </quill-editor>
                        </el-tab-pane>
                    </div>
                </el-tabs>
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
                        <el-tabs v-model="selectedActivenumneieing" class="demo-tabs" @tab-click="handleactiveClick">
                            <div v-for="(tempitem, tempindex) in item.dangshifanglist" :key="tempindex">
                                <el-tab-pane :label=tempitem.name :name=tempindex>
                                    <quill-editor :id="`s${item.name}${tempitem.name}`"
                                        :ref="`s${item.name}${tempitem.name}`" :options="editorOption">
                                    </quill-editor>
                                </el-tab-pane>
                            </div>
                        </el-tabs>
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

export default {
    components: {
        quillEditor,
    },
    setup() {
        const chatDialog = inject('chatDialog');
        const zhanshigaoduRef = inject('zhanshigaodu');
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
            huifangdocumentList: [],
            bookVo: {},
            duihualist: [],
            selectedActivenumjuifang: 0,
            selectedActivenum: 0,
            selectedActivenumneieing: 0,
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
            const templist = {};
            this.huifangdocumentList.forEach((item) => {
                let neriongtemp = '';
                item.document.forEach((element) => {
                    if (element.attributes) {
                        if (element.attributes.script) {
                            if (element.attributes.script === 'sub') {
                                neriongtemp = `${neriongtemp}${element.insert}`;
                            }
                        }
                    }
                });
                templist[item.title] = neriongtemp;
            });
            console.log('点击生成文档', templist);
            const contentStr = JSON.stringify(templist);
            // const loadingInstance = ElLoading.service(
            //     {
            //         customClass: 'my-custom-loading',
            //         text: '正在生成文档，请稍等...',
            //         background: 'rgba(0, 0, 0, 0.7)',
            //     },
            // );
            const url = 'http://58.246.144.58:8888/hui';
            const headers = {
                Accept: 'application/json',
                Authorization: 'Bearer MxwaXdn3jBBigtJniaasCRTrJpe73TWF',
                'Content-Type': 'application/json',
            };
            const data = {
                input: templist,
            };
            // try {
                // const response = await axios.post(url, data, { headers });
                // console.log('请求成功:', response.data);
                // const result = response.data;
                this.tiquneironglist = [];
                // const keys = Object.keys(result.result);
                const keys = Object.keys(templist);
                if (this.documentList.length <= 0) {
                    const tempneironglist = [];
                    keys.forEach((key) => {
                        // const temp = this.gettiquneironglistString(result.result[key]);
                        this.huifangdocumentList.forEach((item) => {
                            if (item.title === key) {
                                const tempneirong = this.setmobanneirong('temp', item.items);
                                const neirong = {
                                    name: item.title,
                                    content: tempneirong,
                                };
                                tempneironglist.push(neirong);
                            }
                        });
                    });
                    console.log('keys', keys);
                    const tempobj = {
                        name: '版本1',
                        num: 1,
                        isselected: false,
                        dangshifanglist: tempneironglist,
                    };
                    this.documentList.push(tempobj);
                    this.selectedActivenum = 0;
                    this.$nextTick(() => {
                        this.documentList.forEach((item) => {
                            item.dangshifanglist.forEach((elementcontent) => {
                                const tempquillref = `s${item.name}${elementcontent.name}`;
                                const tempquill = this.$refs[tempquillref][0];
                                console.log('quill', tempquill);
                                tempquill.quill.setContents(elementcontent.content, 'user');
                            });
                        });
                        this.baocun();
                    });
                } else {
                    const document = this.documentList[this.documentList.length - 1];
                    const numStr = document.num + 1;
                    const tempneironglist = [];
                    keys.forEach((key) => {
                        // const temp = this.gettiquneironglistString(result.result[key]);
                        this.huifangdocumentList.forEach((item) => {
                            if (item.title === key) {
                                const tempneirong = this.setmobanneirong('temp', item.items);
                                const neirong = {
                                    name: item.title,
                                    content: tempneirong,
                                };
                                tempneironglist.push(neirong);
                            }
                        });
                    });
                    console.log('keys', keys);
                    const tempobj = {
                        name: `版本${numStr}`,
                        num: numStr,
                        isselected: false,
                        dangshifanglist: tempneironglist,
                    };
                    this.documentList.push(tempobj);
                    this.selectedActivenum = this.documentList.length - 1;
                    this.$nextTick(() => {
                        this.documentList.forEach((item) => {
                            item.dangshifanglist.forEach((elementcontent) => {
                                const tempquillref = `s${item.name}${elementcontent.name}`;
                                const tempquill = this.$refs[tempquillref][0];
                                console.log('quill', tempquill);
                                tempquill.quill.setContents(elementcontent.content, 'user');
                            });
                        });
                    });
                }
                console.log('documentList:', this.documentList);
                // loadingInstance.close();
            // } catch (error) {
            //     loadingInstance.close();
            //     console.error('请求失败:', error);
            // }
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
            this.selectedActivenumneieing = 0;
            this.selectedActivenumjuifang = 0;
            const recordId = localStorage.getItem('recordId');
            this.getAllBookListByRecordId(recordId);
        },
        baocun() {
            const tempelementcontent = this.documentList[this.selectedActivenum];

            console.log('tempelementcontent', tempelementcontent);
            tempelementcontent.dangshifanglist.forEach((elementcontent) => {
                const tempquillref = `s${tempelementcontent.name}${elementcontent.name}`;
                const tempquill = this.$refs[tempquillref][0];
                const shengcontentList1 = tempquill.quill.getContents().ops;
                elementcontent.content = shengcontentList1;
                console.log('shengcontentList1', shengcontentList1);
            });
            tempelementcontent.name = '回访记录';
            tempelementcontent.isselected = true;
            const requestBody = {
                id: this.bookVo.id,
                recordId: this.bookVo.recordId,
                partyId: this.bookVo.partyId,
                voiceContent: JSON.stringify(this.duihualist),
                content: JSON.stringify([tempelementcontent]),
                type: this.bookVo.type,
            };
            console.log('requestBody', requestBody);
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
                                if (item.recordInfo.title === '受理登记表') {
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
                            const dangshifang = JSON.parse(element.bookVo.content);
                            this.huifangdocumentList = [];
                            dangshifang.forEach((elementcontent) => {
                                this.huifangdocumentList.push(elementcontent);
                                const tempquillref = elementcontent.id;
                                this.$nextTick(() => {
                                    const tempquill = this.$refs[tempquillref][0];
                                    console.log('quill', tempquill);
                                    tempquill.quill.setContents(elementcontent.document, 'user');
                                });
                            });
                        }
                        if (element.type === 2) {
                            this.bookVo = element.bookVo;
                            const tempcontent = element.bookVo.content;
                            if (tempcontent && tempcontent.length > 0) {
                                this.isshuoshengcehng = false;
                                const dangshifang = JSON.parse(element.bookVo.content);
                                this.documentList = [];
                                dangshifang.forEach((elementcontent) => {
                                    this.documentList.push(elementcontent);
                                });
                                this.$nextTick(() => {
                                    this.documentList.forEach((item) => {
                                        item.dangshifanglist.forEach((elementcontent) => {
                                            const tempquillref = `s${item.name}${elementcontent.name}`;
                                            const tempquill = this.$refs[tempquillref][0];
                                            console.log('quill', tempquill);
                                            tempquill.quill.setContents(elementcontent.content, 'user');
                                        });
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
            nameList.forEach((item) => {
                partyList.push(item.name);
            });
            return [
                { attributes: { bold: true, size: 'huge' }, insert: '人民调解回访记录' },
                { attributes: { align: 'center' }, insert: '\n' },
                { insert: '\n' },
                { attributes: { size: 'large' }, insert: '当事人：' },
                { attributes: { underline: true, size: 'large' }, insert: `  ${partyList.join(', ')}    ` },
                { insert: '\n' },
                { attributes: { size: 'large' }, insert: '调解协议编号__________________________ ' },
                { insert: '\n' },
                { attributes: { size: 'large' }, insert: '回访事由：____________________________' },
                { insert: '\n' },
                { attributes: { size: 'large' }, insert: '回访时间：______________' },
                { insert: '\n' },
                { attributes: { size: 'large' }, insert: '回访情况：' },
                { attributes: { underline: true, size: 'large' }, insert: `调解结束后，即对当事人${partyList.join(', ')}进行了回访，并征求意见。当事人${partyList.join(', ')}认为此次调解程序合法，公平公正，并能积极配合。当场旅行了协议，表示满意 ` },
                { insert: '\n' },
                { insert: '\n' },
                { attributes: { size: 'large' }, insert: '回访人（签名）：_______________ ' },
                { insert: '\n' },
                { insert: '\n' },
                { attributes: { underline: true, size: 'large' }, insert: '   ***人民调解委员会   ' },
                { attributes: { align: 'right' }, insert: '\n' },
                { insert: '\n' },
                { attributes: { size: 'large' }, insert: `${valuedate}` },
                { attributes: { align: 'right' }, insert: '\n' },
                { insert: '\n' },
            ];
            // return [
            //     { attributes: { bold: true, size: 'huge' }, insert: '人民调解回访记录' },
            //     { attributes: { align: 'center' }, insert: '\n' },
            //     { insert: '\n' },
            //     { attributes: { size: 'large' }, insert: '当事人：' },
            //     { attributes: { underline: true, size: 'large' }, insert: `  ${partyList.join(', ')}    ` },
            //     { insert: '\n' },
            //     { attributes: { size: 'large' }, insert: '调解协议编号_______字 [    ] _______号 ' },
            //     { insert: '\n' },
            //     { attributes: { size: 'large' }, insert: '回访事由：' },
            //     { attributes: { underline: true, size: 'large' }, insert: '  纠纷回访     ' },
            //     { insert: '\n' },
            //     { attributes: { size: 'large' }, insert: '回访时间：' },
            //     { attributes: { underline: true, size: 'large' }, insert: `  ${valuedate}     ` },
            //     { insert: '\n' },
            //     { attributes: { size: 'large' }, insert: '回访情况：' },
            //     { attributes: { underline: true, size: 'large' }, insert: `${responseValue}   ` },
            //     { insert: '\n' },
            //     { insert: '\n' },
            //     { attributes: { underline: true, size: 'large' }, insert: `    事后调解员询问${partyList.join(', ')}对调解结果的意见，${partyList.join(', ')}表示没有意见，并表示感谢。       ` },
            //     { insert: '\n' },
            //     { insert: '\n' },
            //     { attributes: { size: 'large' }, insert: '回访人（签名）：_______________ ' },
            //     { insert: '\n' },
            //     { insert: '\n' },
            //     { attributes: { underline: true, size: 'large' }, insert: '   ***人民调解委员会   ' },
            //     { attributes: { align: 'right' }, insert: '\n' },
            //     { insert: '\n' },
            // ];
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

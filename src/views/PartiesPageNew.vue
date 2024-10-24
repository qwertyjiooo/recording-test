<template>
    <div style="width: 50%;">
        <el-card
            style="position: relative;display: flex;flex-direction: column;height: calc(100vh - 130px);margin: 10px;border-bottom: 1px solid #d3dce6;background-color: white;">
            <div ref="duihuaneirongDiv" class="content"
                style="height: calc(100vh - 130px - 90px);overflow-y: auto;padding-bottom: 20px;">
                <div v-for="(item, index) in duihualist" :key="index">
                    <div style="text-align: left;margin-top: 20px;">
                        <div style="display: flex;">
                            <el-button @click="upUserInfo(item)" link>{{ item.name }}</el-button>
                            <div style="margin-left: 50px;">{{ item.time }}</div>
                        </div>
                        <el-input v-if="item.isEditing" autosize type="textarea" v-model="item.content"
                            placeholder="Please input" class="input-with-select">
                        </el-input>
                        <el-button @click="editContent(item)" v-if="item.isEditing">确定修改</el-button>
                        <div v-if="!item.isEditing" @click="editContent(item)"
                            style="display: flex; flex-direction: column; white-space: normal; word-break: break-word;text-align: left; margin-right: 70px; margin-top: 5px; background-color: #f0f0f0; border-radius: 0px 20px 20px 20px; padding: 20px;">
                            {{ item.content }}</div>
                    </div>
                </div>
                <div
                    style="width: 90%;padding: 10px; display: flex; flex-direction: column; white-space: normal; word-break: break-word;">
                    {{ shibiemessage }}</div>
            </div>
            <div v-if="!allstoped"
                :style="{ position: shengchengwendangstoped ? 'static' : 'absolute', top: '20%', width: '85%', display: 'flex', justifyContent: 'center' }">
                <div v-if="!shengchengwendangstoped"
                    style="display: flex;flex-direction: column;align-items: center;justify-content:center;">
                    <el-button
                        style="border: none;height: 200px;display: flex;align-items: center;justify-content:center;"
                        plain='true' @click="kaishi"><img style="width: 200px;height: 200px;"
                            src="../assets/yuyinicon.png" alt="Button Image" class="button-image"></el-button>
                    <el-upload :multiple="false" :show-file-list="false" :accept="'.mp3,.wav'"
                        :http-request="(rawFile) => uploadFileToOss(rawFile, index)">
                        <el-button size="large" type="warning">音频上传</el-button>
                    </el-upload>
                </div>
                <div v-if="shengchengwendangstoped" style="display: flex;align-items: center;justify-content:center;">
                    <el-button style="margin-right: 20px;" size="large" type="primary" @click="kaishi">开始录制</el-button>
                    <el-upload style="margin-right: 20px;" :multiple="false" :show-file-list="false"
                        :accept="'.mp3,.wav'" :http-request="(rawFile) => uploadFileToOss(rawFile, index)">
                        <el-button size="large" type="warning">音频上传</el-button>
                    </el-upload>
                    <el-button size="large" type="success" @click="shengchengwendang">点击生成文档</el-button>
                </div>
            </div>
            <div v-if="stoped" style=" height: 90px;">
                <el-button size="large" type="primary" @click="tingzhiluyin(true)">结束录制{{ currentTime }}</el-button>
                <el-button size="large" type="success" @click="shengchengwendang">点击生成文档</el-button>
            </div>
            <div v-if="shibiestoped" style=" height: 90px;">
                <el-button size="large" type="warning">文件识别中,请稍等{{ currentTime }}</el-button>
            </div>
        </el-card>
    </div>
    <div style="width: 50%;overflow-y: auto;margin-top: -100px;">
        <el-card ref="editorContainer"
            style="display: flex;flex-direction: column;min-height: calc(100vh - 20px);overflow-y: auto;margin: 10px;border-bottom: 1px solid #d3dce6;background-color: white;">
            <div style="display: flex;text-align: right;justify-content: flex-end;margin-bottom: 5px;">
                <el-button type="primary" @click="baocun">下一步</el-button>
            </div>
            <div style="display: flex;text-align:center;justify-content:center;">
                <div style="width: 49%;display: flex;align-items: center;font-size: 14px;margin-bottom: 10px;">
                    <div style="width: 120px;">笔录地点:</div>
                    <el-select v-model="selectedLocation" placeholder="请选择笔录地点">
                        <el-option v-for="person in locationList" :key="person.id" :label="person.name"
                            :value="person.id">
                        </el-option>
                    </el-select>
                </div>
                <div style="width: 49%;display: flex;align-items: center;font-size: 14px;margin-bottom: 10px;">
                    <div style="width: 120px;">笔录人员:</div>
                    <el-select v-model="selectedPerson" placeholder="请选择笔录人员">
                        <el-option v-for="person in personList" :key="person.id" :label="person.name"
                            :value="person.id">
                        </el-option>
                    </el-select>
                </div>
            </div>
            <div>
                <el-check-tag style="margin-left: 5px;" checked v-for="(item, index) in tiquneironglist" :key="index"
                    @click="dianjibiaoqian(item)">{{ item }}</el-check-tag>
            </div>
            <el-tabs v-model="selectedUsetnum" class="demo-tabs" @tab-click="handleUserClick">
                <div v-for="(userItem, userindex) in userlist" :key="userindex">
                    <el-tab-pane :label=userItem.name :name=userindex>
                        <div style="display: flex;text-align: right;justify-content: flex-end;">
                            <el-button type="primary" @click="selsectbaocun">选择当前版本</el-button>
                            <el-button type="danger" @click="delectselsectbaocun">删除</el-button>
                        </div>
                        <el-tabs v-model="selectedActivenum" class="demo-tabs" @tab-click="handleactiveClick">
                            <div v-for="(item, index) in userItem.documentList" :key="index">
                                <el-tab-pane :label="item.isselected ? item.name + ' (选中)' : item.name" :name=index>
                                    <quill-editor :id="`s${userItem.speaknum}${item.num}`"
                                        :ref="`s${userItem.speaknum}${item.num}`" :options="editorOption">
                                    </quill-editor>
                                </el-tab-pane>
                            </div>
                        </el-tabs>
                    </el-tab-pane>
                </div>
            </el-tabs>
        </el-card>
    </div>
    <el-dialog v-model="dialogFormVisible" title="请输入说话人姓名">
        <el-form :model="form">
            <el-form-item label="姓名" :label-width="formLabelWidth">
                <el-input v-model="form.name" autocomplete="off" />
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="upUserInfoquxiao">取消</el-button>
                <el-button type="primary" @click="upUserInfoqueding">确定</el-button>
            </span>
        </template>
    </el-dialog>
    <UserInfoComponent ref="userInfoComponent" @updateUserlist="updateUserInfolist" />
    <UpNewRecord ref="upNewRecordComponent" @upNewRecordInfo="upNewRecordInfo" />
    <el-dialog close-on-click-modal="false" v-model="dialogTableVisible" show-close="false" title="请选择对应文档" width="30%">
        <div class="dialog-content">
            <el-checkbox @click="hClick(item, index)" v-for="(item, index) in dialogList" :key="index" :label="item.name" size="large" border />
            <el-button type="primary" @click="handleDialogClick">确定</el-button>
        </div>
    </el-dialog>
    <el-dialog v-model="dialogTableVisibleIndex" show-close="false" title="请选择文档类型" width="30%">
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
import axiosInstance from '@/api/axios';
import axios, { all } from 'axios';
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus';
import CryptoJS from 'crypto-js';
import Recorder from 'js-audio-recorder';
import { useRouter } from 'vue-router';
import { inject, onMounted } from 'vue';
import { saveAs } from 'file-saver';
import { useStore } from 'vuex'; // 导入 useStore
import { resPeople, resPlace } from './components/peoplePlace';

import UserInfoComponent from '../components/UserInfoComponent.vue';
import UpNewRecord from '../components/UpNewRecord.vue';

export default {
    components: {
        quillEditor,
        UserInfoComponent,
        UpNewRecord,
    },
    setup() {
        const router = useRouter();
        const zhanshigaoduRef = inject('zhanshigaodu');
        const itemList = inject('itemList');
        const chatDialog = inject('chatDialog');
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
            router,
            chatDialog,
            updateItemList,
            store,
        };
    },

    data() {
        return {
            dialogFormVisible: false,
            form: {
                speaknum: 0,
                name: '',
                IDcard: '',
            },
            duihualist: [],
            shibiemessage: '',
            stoped: false,
            allstoped: false,
            shibiestoped: false,
            shengchengwendangstoped: false,
            seconds: 0,
            minutes: 0,
            hours: 0,
            currentTime: '',
            locationList: [],
            selectedLocation: null,
            personList: [],
            selectedPerson: null,
            userlist: [],
            selectedUsetnum: 0,
            selectedActivenum: 0,
            selectUser: {},
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
                        [{ font: ['宋体', '黑体'] }], // 字体
                        [{ align: [] }], // 对齐方式
                        ['clean'], // 清除字体样式
                    ],
                },
            }, // 编辑器配置项
            // 当事方列表
            dangshifang: [],
            ws: null,
            shuohuaren: '1',
            tiquneironglist: [],
            // 说话人列表
            speakerTagList: [],
            recorder: null,
            dialogTableVisible: false,
            dialogList: [],
            // 笔录地点和笔录人员
            getResPeople: resPeople,
            getResPlace: resPlace,
            // 选择的多选框
            newOriginalItem: [],
            // 一次性请求所有的文档的参数
            getInput: {},
            // 说话人
            getContentStr: '',
            dialogListIndex: [
                { name: '治安调解协议书' },
                { name: '人民调解受理登记表' },
            ], // 弹出窗列表
            dialogTableVisibleIndex: false,
            // 弹出窗
        };
    },
    mounted() {
        this.recorder = new Recorder(
            {
                sampleBits: 16,
                sampleRate: 16000,
                numChannels: 1,
                compiling: true,
            },
        );
        this.getPersonList();
        this.getLocationList();
        this.initData();
        // this.generate_records();
    },
    watch: {
        duihualist: {
            handler(newVal, oldVal) {
                if (this.duihualist.length > 0) {
                    this.shengchengwendangstoped = true;
                }
            },
            deep: true, // 启用深度监听
        },
    },
    methods: {
        // 一次性请求所有的文档
        async generate_records() {
            const loadingInstance = ElLoading.service(
                {
                    customClass: 'my-custom-loading',
                    text: '正在生成文档，请稍等...',
                    background: 'rgba(0, 0, 0, 0.7)',
                },
            );
            const url = 'http://58.246.144.58:8888/generate_records';
            const headers = {
                Accept: 'application/json',
                Authorization: 'Bearer MxwaXdn3jBBigtJniaasCRTrJpe73TWF',
                'Content-Type': 'application/json',
            };
            const data = {
                input: this.getInput,
            };
            try {
                const response = await axios.post(url, data, { headers });
                const { 达成协议: xieYiResponse, 登记表: dengJiResponse } = response.data.result;
                localStorage.setItem('xieYiResponse', JSON.stringify(xieYiResponse));
                localStorage.setItem('dengJiResponse', JSON.stringify(dengJiResponse));
                loadingInstance.close();
            } catch (error) {
                console.error('请求失败:', error);
                loadingInstance.close();
            }
        },
        // 'xieyi' and 'dengji'
        async processXieYi(item) {
            const loadingInstance = ElLoading.service(
                {
                    customClass: 'my-custom-loading',
                    text: '正在生成文档，请稍等...',
                    background: 'rgba(0, 0, 0, 0.7)',
                },
            );
            const url = 'http://58.246.144.58:8888/process';
            const headers = {
                Accept: 'application/json',
                Authorization: 'Bearer MxwaXdn3jBBigtJniaasCRTrJpe73TWF',
                'Content-Type': 'application/json',
            };
            const data = {
                input: this.getContentStr,
                scenario: item,
            };
            try {
                const response = await axios.post(url, data, { headers });
                if (item === 'xieyi') {
                    localStorage.setItem('xieYiResponse', JSON.stringify(response.data.result));
                }
                if (item === 'dengji') {
                    localStorage.setItem('dengJiResponse', JSON.stringify(response.data.result));
                }
                loadingInstance.close();
            } catch (error) {
                console.error('请求失败:', error);
                loadingInstance.close();
            }
        },
        // 点击选项
        hClick(item, itemIndex) {
            const originalItem = {
                index: itemIndex,
                name: item.name,
                path: item.path,
                type: item.recordInfo.type,
            };
            const index = this.newOriginalItem.findIndex((res) => res.name === item.name);
            if (index !== -1) {
                this.newOriginalItem.splice(index, 1); // 如果存在，则删除
            } else {
                this.newOriginalItem.push(originalItem);
            }
            console.log('this.newOriginalItem', this.newOriginalItem);
        },
        dianjibiaoqian(item) {
            console.log(item);
            if (this.chatDialog) {
                this.chatDialog.showsendMessage(item);
            }
        },
        // 删除当事方信息
        delectselsectbaocun() {
            console.log('userlist', this.userlist);
            console.log('dangshifang', this.dangshifang);
            const userinfo = this.userlist[this.selectedUsetnum];
            console.log('userinfo', userinfo);
            ElMessageBox.confirm(
                `确定要删除${userinfo.name}吗?`,
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'info',
                    center: true,
                },
            ).then(() => {
                console.log('确定删除');
                const existingIndex = this.userlist.findIndex((item) => item.speaknum === userinfo.speaknum);
                this.userlist.splice(existingIndex, 1);
                const tempdangshifang = this.dangshifang.concat();
                for (let i = 0; i < tempdangshifang.length; i += 1) {
                    if (tempdangshifang[i].id === userinfo.speaknum) {
                        this.dangshifang.splice(i, 1);
                    }
                }
                this.selectedUsetnum = 0;
            }).catch(() => {
                console.log('取消删除');
            });
        },
        // 保存当前文档，填写当事方信息
        selsectbaocun() {
            console.log('tiquneironglist', this.tiquneironglist);
            const userinfo = this.userlist[this.selectedUsetnum];
            const document = userinfo.documentList[this.selectedActivenum];
            const tempquillref = `s${userinfo.speaknum}${document.num}`;
            const { quill } = this.$refs[tempquillref][0];
            const shengcontentList1 = quill.getContents().ops;
            let tempdangshifang = {};
            let iscunzaifangshifang = false;
            this.dangshifang.forEach((element) => {
                if (element.id === userinfo.speaknum) {
                    iscunzaifangshifang = true;
                    tempdangshifang = element;
                }
            });
            if (!iscunzaifangshifang) {
                tempdangshifang = {
                    id: userinfo.speaknum,
                    title: `当事方${this.dangshifang.length + 1}`,
                    document: shengcontentList1,
                    items: [{ name: userinfo.name, IDcard: '' }],
                };
            }
            this.$refs.userInfoComponent.show(tempdangshifang);
        },
        // 添加更新当事方信息
        updateUserInfolist(userInfo) {
            const partyList = [];
            userInfo.items.forEach((item) => {
                partyList.push(item.name);
            });
            console.log('userInfo', userInfo);
            userInfo.document.forEach((element) => {
                if (element.attributes) {
                    if (element.attributes.script) {
                        if (element.attributes.script === 'super') {
                            element.insert = partyList.join(', ');
                        }
                    }
                }
            });
            let iscunzaifangshifang = false;
            this.dangshifang.forEach((element) => {
                if (element.id === userInfo.id) {
                    iscunzaifangshifang = true;
                    element.items = userInfo.items;
                }
            });
            if (!iscunzaifangshifang) {
                this.dangshifang.push(userInfo);
            }
            const userinfotemp = this.userlist[this.selectedUsetnum];
            const tempdocument = userinfotemp.documentList[this.selectedActivenum];
            userinfotemp.documentList.forEach((element) => {
                element.isselected = false;
                if (element.num === tempdocument.num) {
                    element.isselected = true;
                }
            });
            const tempquillref = `s${userinfotemp.speaknum}${tempdocument.num}`;
            this.$nextTick(() => {
                const tempquill = this.$refs[tempquillref][0];
                console.log('quill', tempquill);
                tempquill.quill.setContents(userInfo.document, 'user');
            });
            console.log('dangshifang', this.dangshifang);
        },
        // 更改对话内容
        editContent(item) {
            item.isEditing = !item.isEditing;
        },
        // 保存
        baocun() {
            if (this.dangshifang.length <= 0) {
                ElMessage.error('请首先保存当前版本');
            } else {
                this.$refs.upNewRecordComponent.show(this.selectedLocation, this.selectedPerson, this.dangshifang);
                console.log('dangshifang', this.dangshifang);
            }
        },
        // 新增文书记录
        upNewRecordInfo(requestInfo) {
            let bookVo = {};
            requestInfo.titleVoList.forEach((element) => {
                if (element.type === 1) {
                    bookVo = element.bookVo;
                }
            });
            const requestBody = {
                id: bookVo.id,
                recordId: bookVo.recordId,
                partyId: bookVo.partyId,
                voiceContent: JSON.stringify(this.duihualist),
                content: JSON.stringify(this.dangshifang),
                type: bookVo.type,
            };
            const templist = [];
            this.duihualist.forEach((item) => {
                const temp = `${item.name}说: ${item.content}`;
                templist.push(temp);
            });
            const contentStr = templist.join('\n');
            const strData = new Blob([contentStr], { type: 'text/plain;charset=utf-8' });
            saveAs(strData, `${requestInfo.title.replace(/\s+/g, '')}.txt`);

            const loadingInstance = ElLoading.service(
                {
                    customClass: 'my-custom-loading',
                    text: '正在保存中，请稍等...',
                    background: 'rgba(0, 0, 0, 0.7)',
                },
            );
            axiosInstance.post('/api/addOrModifyBookRecords', requestBody).then((response) => {
                if (response.data.status === 'SUCCESS') {
                    console.log('addOrModifyBookRecords', response.data);
                    localStorage.setItem('recordId', requestInfo.id);
                    this.getAllBookListByRecordId(requestInfo.id);
                    loadingInstance.close();
                }
            }).catch((error) => {
                loadingInstance.close();
                console.error('新增更新文书记录失败:', error);
            });
        },
        // 开启更新说话人信息弹框
        upUserInfo(item) {
            console.log('upUserInfo', item.speaknum);
            this.form = {
                speaknum: item.speaknum,
                name: '',
                IDcard: '',
            };
            this.dialogFormVisible = true;
        },
        //  关闭更新说话人信息弹框
        upUserInfoquxiao() {
            this.dialogFormVisible = false;
        },
        // 更新说话人信息
        upUserInfoqueding() {
            console.log('form', this.form);
            if (this.form.name.length <= 0) {
                ElMessage.error('请输入姓名');
                return;
            }
            const existingIndex = this.speakerTagList.findIndex((existingForm) => existingForm.speaknum === this.form.speaknum);
            if (existingIndex !== -1) {
                // 如果找到了相同 speaknum 的元素，替换它
                this.speakerTagList.splice(existingIndex, 1, this.form);
            } else {
                // 如果没有找到，添加新的元素
                this.speakerTagList.push(this.form);
            }
            console.log('form', this.speakerTagList);
            this.dialogFormVisible = false;
            if (this.duihualist.length > 0) {
                this.duihualist.forEach((item) => {
                    if (item.speaknum === this.form.speaknum) {
                        item.name = this.form.name;
                    }
                });
            }
        },
        // 选择人
        handleUserClick(tab) {
            this.selectedUsetnum = tab.index;
            this.selectedActivenum = 0;
            const userinfo = this.userlist[this.selectedUsetnum];
            userinfo.documentList.forEach((element) => {
                if (element.isselected) {
                    this.selectedActivenum = element.num - 1;
                }
            });
        },
        // 选择文档
        handleactiveClick(tab) {
            this.selectedActivenum = tab.index;
        },
        // 初始化数据
        initData() {
            console.log('initData');
            this.speakerTagList = [];
            // 初始化文档格式
        },
        // 开始录制
        async kaishi() {
            Recorder.getPermission().then(() => {
                console.log('开始录制', this.recorder, this.recorder.duration);
                this.initData();
                this.speakerTagList = [];
                this.shuohuaren = '1';
                this.stoped = true;
                this.allstoped = true;
                this.dingshiqikaishi();
                this.connectWebSocket();
            }, (error) => {
                console.log(`${error.name} : ${error.message}`);
            });
        },
        // 停止录音
        tingzhiluyin(baocun) {
            this.shuohuaren = '1';
            this.stoped = false;
            this.allstoped = false;
            this.dingshiqijieshu();
            if (this.recorder) {
                this.recorder.stop();
                if (baocun) {
                    this.saveFileAsync();
                }
            }
            this.ws.send(JSON.stringify({
                end: 'true',
            }));
        },
        async saveFileAsync() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const tempnameStr = `调字[${year}]${month}${day}-`;

            ElMessageBox.prompt('请输入保存音频文件的名字', '提示', {
                confirmButtonText: '保存',
                cancelButtonText: '取消',
                inputValue: tempnameStr,
            }).then(({ value }) => {
                const nameStr = `${value}.wav`;
                const wavBlob = this.recorder.getWAVBlob();
                console.log(wavBlob);
                saveAs(wavBlob, nameStr);
                ElMessage({
                    type: 'success',
                    message: `${nameStr} 保存成功！`,
                });
            }).catch(() => {
                console.log('取消保存');
            });
        },
        // 上传文件
        async uploadFileToOss(rawFile, index) {
            console.log('上传文件', rawFile, index);
            this.shibiestoped = true;
            this.allstoped = true;
            this.dingshiqikaishi();
            const formData = new FormData();
            formData.append('audioFile', rawFile.file);
            axiosInstance.post('/api/audioUpload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }).then((response) => {
                // console.log('formData', formData);
                console.log('response', response);
                if (response.data.status === 'SUCCESS') {
                    console.log('SUCCESS', response.data.data);
                    this.gettranstext(response.data.data);
                } else {
                    this.shibiestoped = false;
                    this.allstoped = false;
                    this.dingshiqijieshu();
                }
            }).catch((error) => {
                this.shibiestoped = false;
                this.allstoped = false;
                this.dingshiqijieshu();
                console.error('上传失败:', error);
            });
        },
        // 获取识别结果
        gettranstext(orderId) {
            axiosInstance.get('/api/audioUploadResult', {
                params: {
                    orderId,
                },
            }).then((response) => {
                if (response.data.status === 'SUCCESS') {
                    const tempresponse = JSON.parse(response.data.data);
                    console.log('tempresponse', tempresponse);
                    if (tempresponse.code === '000000') {
                        if (tempresponse.content.orderInfo.status === -1) {
                            this.initData();
                            this.shibiestoped = false;
                            this.allstoped = false;
                            this.dingshiqijieshu();
                            const orderResult = JSON.parse(tempresponse.content.orderResult);
                            console.log('orderResult', orderResult);
                            orderResult.lattice2.forEach((item) => {
                                const diffInSeconds = (parseInt(item.end, 10) - parseInt(item.begin, 10)) / 1000;
                                const minutes = Math.floor(diffInSeconds / 60);
                                const seconds = Math.round(diffInSeconds % 60);
                                const shijian = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                                // console.log('shijian', shijian);
                                let tempneirong = '';
                                item.json_1best.st.rt.forEach((tempres) => {
                                    tempres.ws.forEach((tempws) => {
                                        tempws.cw.forEach((tempcw) => {
                                            tempneirong += tempcw.w;
                                        });
                                    });
                                });
                                // console.log('num', item.json_1best.st.rl);
                                // console.log('tempneirong', tempneirong);
                                this.shuohuaren = item.json_1best.st.rl;
                                this.duihualist.push({
                                    name: `说话人${this.shuohuaren}`,
                                    speaknum: this.shuohuaren,
                                    content: tempneirong,
                                    type: 0,
                                    time: shijian,
                                });
                                // 自动滚动到最新消息
                                this.$nextTick(() => {
                                    this.$refs.duihuaneirongDiv.scrollTop = this.$refs.duihuaneirongDiv.scrollHeight;
                                });
                            });
                        } else {
                            setTimeout(() => {
                                this.gettranstext(orderId);
                            }, 3000);
                        }
                    } else {
                        this.shibiestoped = false;
                        this.allstoped = false;
                        this.dingshiqijieshu();
                        console.error('获取音频翻译失败:', tempresponse);
                    }
                }
            }).catch((error) => {
                this.shibiestoped = false;
                this.allstoped = false;
                this.dingshiqijieshu();
                console.error('获取音频翻译失败:', error);
            });
        },
        // 识别定时器
        dingshiqikaishi() {
            this.timer = setInterval(() => {
                this.seconds++;
                if (this.seconds >= 60) {
                    this.seconds = 0;
                    this.minutes++;
                    if (this.minutes >= 60) {
                        this.minutes = 0;
                        this.hours++;
                    }
                }
                this.currentTime = `${this.hours}:${this.minutes.toString().padStart(2, '0')}:${this.seconds.toString().padStart(2, '0')}`;
            }, 1000);
        },
        // 停止识别定时器
        dingshiqijieshu() {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
                this.seconds = 0;
                this.minutes = 0;
                this.hours = 0;
                this.currentTime = '0:00:00';
            }
        },
        // 获取笔录人员列表
        getPersonList() {
            // axiosInstance.get('/api/getPersonList').then((response) => {
            //     if (response.data.status === 'SUCCESS') {
            //         this.personList = response.data.data;
            //         if (this.personList.length > 0) {
            //             this.selectedPerson = this.personList[0].id;
            //         }
            //     }
            //     console.log('11111111111111111', this.personList, this.selectedPerson);
            // }).catch((error) => {
            //     console.error('获取笔录人员列表失败:', error);
            // });
            this.personList = this.getResPeople;
            if (this.personList.length > 0) {
                this.selectedPerson = this.personList[0].id;
            }
        },
        // 获取笔录地点列表
        getLocationList() {
            // axiosInstance.get('/api/getLocationList').then((response) => {
            //     if (response.data.status === 'SUCCESS') {
            //         this.locationList = response.data.data;
            //         if (this.locationList.length > 0) {
            //             this.selectedLocation = this.locationList[0].id;
            //         }
            //     }
            // }).catch((error) => {
            //     console.error('获取笔录地点列表失败:', error);
            // });
            this.locationList = this.getResPlace;
            if (this.locationList.length > 0) {
                this.selectedLocation = this.locationList[0].id;
            }
        },
        // 点击生成文档
        async shengchengwendang() {
            if (this.selectedLocation === null) {
                ElMessage.error('请选择笔录地点');
                return;
            }
            if (this.selectedPerson === null) {
                ElMessage.error('请选择笔录人员');
                return;
            }
            console.log('duihualist', this.selectedLocation);
            console.log('duihualist', this.selectedPerson);
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
            console.log('templist******', templist);
            const contentStr = templist.join('\n');
            this.getContentStr = contentStr;
            console.log('contentStr', contentStr);
            const url = 'http://58.246.144.58:8888/process';
            const headers = {
                Accept: 'application/json',
                Authorization: 'Bearer MxwaXdn3jBBigtJniaasCRTrJpe73TWF',
                'Content-Type': 'application/json',
            };
            const data = {
                input: contentStr,
                scenario: 'jilu',
            };
            try {
                const response = await axios.post(url, data, { headers });
                console.log('请求成功:', response.data);
                const result = response.data;
                this.getInput = result;
                // 获取所有的记录
                // this.generate_records(result);
                // 获取当事人标题
                const keys = Object.keys(result.result);
                console.log('keys', keys);
                this.tiquneironglist = [];
                if (this.userlist.length <= 0) {
                    // 此处的key是当事人
                    keys.forEach((key) => {
                        // result.result[key]是当事人对应的对话内容
                        const temp = this.gettiquneironglistString(result.result[key]);
                        // 此处返回的是
                        const tempneirong = this.setmobanneirong(temp, key);
                        console.log('tempneirong', tempneirong);
                        const tempobj = {
                            name: key,
                            speaknum: key,
                            documentList: [
                                {
                                    name: '版本1',
                                    num: 1,
                                    isselected: false,
                                    content: tempneirong,
                                },
                            ],
                            selectDocumentInfo: '',
                        };
                        this.userlist.push(tempobj);
                        const document = tempobj.documentList[0];
                        const tempquillref = `s${tempobj.speaknum}${document.num}`;
                        this.$nextTick(() => {
                            const tempquill = this.$refs[tempquillref][0];
                            console.log('quill', tempquill);
                            tempquill.quill.setContents(document.content, 'user');
                        });
                    });
                    const userinfo = this.userlist[0];
                    this.selectedUsetnum = userinfo.speaknum;
                    this.selectedUsetnum = 0;
                    this.selectedActivenum = 0;
                } else {
                    keys.forEach((key) => {
                        let iscunzai = false;
                        this.userlist.forEach((item) => {
                            if (item.speaknum === key) {
                                iscunzai = true;
                                const temp = this.gettiquneironglistString(result.result[key]);
                                const tempneirong = this.setmobanneirong(temp, key);
                                const document = item.documentList[item.documentList.length - 1];
                                const numStr = document.num + 1;
                                item.documentList.push({
                                    name: `版本${numStr}`,
                                    num: numStr,
                                    isselected: false,
                                    content: tempneirong,
                                });
                                const tempquillref = `s${item.speaknum}${numStr}`;
                                console.log('tempquillref1', tempquillref);
                                this.$nextTick(() => {
                                    const tempquill = this.$refs[tempquillref][0];
                                    console.log('quill', tempquill);
                                    tempquill.quill.setContents(tempneirong, 'user');
                                });
                            }
                        });
                        if (!iscunzai) {
                            const temp = this.gettiquneironglistString(result.result[key]);
                            const tempneirong = this.setmobanneirong(temp, key);
                            const tempobj = {
                                name: key,
                                speaknum: key,
                                documentList: [
                                    {
                                        name: '版本1',
                                        num: 1,
                                        content: tempneirong,
                                    },
                                ],
                                selectDocumentInfo: '',
                            };
                            this.userlist.push(tempobj);
                            const document = tempobj.documentList[0];
                            const tempquillref = `s${tempobj.speaknum}${document.num}`;
                            this.$nextTick(() => {
                                const tempquill = this.$refs[tempquillref][0];
                                console.log('quill', tempquill);
                                tempquill.quill.setContents(document.content, 'user');
                            });
                        }
                    });
                    const userinfo = this.userlist[this.selectedUsetnum];
                    this.selectedActivenum = userinfo.documentList.length - 1;
                }
                console.log('userlist', this.userlist);
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
        setmobanneirong(responseValue, nameList) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const valuedate = `${year} 年 ${month}月 ${day}日`;
            let locationname = '';
            this.locationList.forEach((item) => {
                if (item.id === this.selectedLocation) {
                    locationname = item.name;
                }
            });
            let personname = '';
            this.personList.forEach((item) => {
                if (item.id === this.selectedPerson) {
                    personname = item.name;
                }
            });

            return [
                { attributes: { bold: true, size: 'huge' }, insert: '人民调解调查记录' },
                { attributes: { align: 'center' }, insert: '\n' },
                { insert: '\n' },
                { attributes: { size: 'large' }, insert: '时  间：' },
                { attributes: { underline: true, size: 'large' }, insert: ` ${valuedate}   ` },
                { insert: '\n' },
                { attributes: { size: 'large' }, insert: '地  点：' },
                { attributes: { underline: true, size: 'large' }, insert: ` ${locationname}  ` },
                { insert: '\n' },
                { attributes: { size: 'large' }, insert: '当事人：' },
                { attributes: { underline: true, size: 'large', script: 'super' }, insert: ` ${nameList}   ` },
                { insert: '\n' },
                { attributes: { size: 'large' }, insert: '参加人：' },
                { attributes: { underline: true, size: 'large' }, insert: `  ${personname}   ` },
                { insert: '\n' },
                { attributes: { size: 'large' }, insert: '记  录：' },
                { attributes: { underline: true, size: 'large', script: 'sub' }, insert: ` ${responseValue}   ` },
                { insert: '\n' },
                { insert: '\n' },
                { attributes: { size: 'large' }, insert: '调查人（签名）：_______________ ' },
                { insert: '\n' },
                { insert: '\n' },
                { attributes: { size: 'large' }, insert: '被调查人（签名）：_____________ ' },
                { insert: '\n' },
                { insert: '\n' },
                { attributes: { size: 'large' }, insert: '记录人（签名）：_______________ ' },
                { insert: '\n' },
                { insert: '\n' },
                { insert: '\n' },
                { attributes: { underline: true, size: 'large' }, insert: ` ${valuedate} ` },
                { attributes: { align: 'right' }, insert: '\n' },
                { insert: '\n' },
            ];
        },
        renderResult(resultData) {
            const jsonData = JSON.parse(resultData);
            if (jsonData.action === 'started') {
                // 握手成功
                console.log('握手成功');
            } else if (jsonData.action === 'result') {
                const data = JSON.parse(jsonData.data);
                console.log(data);
                // 转写结果
                this.shibiemessage = '';
                data.cn.st.rt.forEach((j) => {
                    j.ws.forEach((k) => {
                        k.cw.forEach((l) => {
                            if (l.rl !== '0' && l.rl !== this.shuohuaren) {
                                this.shuohuaren = l.rl;
                            }
                            this.shibiemessage += l.w;
                        });
                    });
                });
                if (data.cn.st.type === '0') {
                    console.log('最终识别结果:', data.cn.st);
                    const diffInSeconds = (parseInt(data.cn.st.ed, 10) - parseInt(data.cn.st.bg, 10)) / 1000;
                    const minutes = Math.floor(diffInSeconds / 60);
                    const seconds = Math.round(diffInSeconds % 60);
                    const shijian = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                    let speakName = `说话人${this.shuohuaren}`;
                    this.speakerTagList.forEach((item) => {
                        if (item.speaknum === this.shuohuaren) {
                            speakName = item.name;
                        }
                    });
                    this.duihualist.push({
                        name: speakName,
                        speaknum: this.shuohuaren,
                        content: this.shibiemessage,
                        type: 0,
                        time: shijian,
                    });
                    this.$nextTick(() => {
                        this.$refs.duihuaneirongDiv.scrollTop = this.$refs.duihuaneirongDiv.scrollHeight;
                    });
                    this.shibiemessage = '';
                }
            } else if (jsonData.action === 'error') {
                // 连接发生错误
                console.log('出错了:', jsonData);
                if (jsonData.code === '10800') {
                    const loadingInstance = ElLoading.service(
                        {
                            customClass: 'my-custom-loading',
                            text: '前序文档处理中，请稍后...',
                            background: 'rgba(0, 0, 0, 0.7)',
                        },
                    );
                    setTimeout(() => {
                        loadingInstance.close();
                    }, 10000);
                    this.tingzhiluyin(false);
                }
            }
        },
        // 语音识别 讯飞语音识别
        connectWebSocket() {
            const appID = 'ebe3e2be';
            const APIKey = '44ed5faab8c8747c062e4d028e87d003';
            const url = 'wss://rtasr.xfyun.cn/v1/ws';
            const ts = Math.floor(new Date().getTime() / 1000);
            const signa = CryptoJS.MD5(appID + ts).toString();
            const signatureSha = CryptoJS.HmacSHA1(signa, APIKey);
            let signature = CryptoJS.enc.Base64.stringify(signatureSha);
            signature = encodeURIComponent(signature);
            this.ws = new WebSocket(`${url}?appid=${appID}&ts=${ts}&signa=${signature}&roleType=2&punc=0`);
            this.ws.onopen = (e) => {
                console.log('开始录音', e);
            };
            this.ws.onmessage = (e) => {
                this.renderResult(e.data);
            };
            this.ws.onerror = (e) => {
                console.log('onerror', e);
            };
            this.ws.onclose = (e) => {
                console.log('onclose');
            };
            this.recorder.onprogress = (params) => {
                if (this.ws && this.ws.readyState === 1) {
                    this.ws.send(params.data[params.data.length - 1]);
                }
            };
            this.recorder.start();
        },
        // 根据记录ID获取所有文书
        getAllBookListByRecordId(recordId) {
            // const itemList = inject('itemList');
            localStorage.setItem('recordId', recordId);
            axiosInstance.get('/api/getAllBookListByRecordId', {
                params: {
                    recordId,
                },
            }).then((response) => {
                if (response.data.status === 'SUCCESS') {
                    localStorage.setItem('record', JSON.stringify(response.data.data));
                    const tempitems = this.processDictToArray(response);
                    const itemList = [];
                    tempitems[0].select = true;
                    tempitems.forEach((element) => {
                        itemList.push(element);
                        if (element.name !== '打印预览') {
                            this.dialogList.push(element);
                        }
                    });
                    // 删除dialogList中的打印预览

                    console.log('tempitems11111111111', tempitems);
                    this.updateItemList(itemList);
                    this.dialogTableVisible = true;
                    // this.router.push(tempitems[0].path);
                }
            }).catch((error) => {
                console.error('根据记录ID获取所有文书失败:', error);
            });
        },
        // 选择跳转的文档
        // handleDialogClick(index, path) {
        //     this.store.commit('setCurrentIndex', index);
        //     this.dialogTableVisible = false;
        //     // 此时的index === 3 是用于判断 是否是调解协议文档类型
        //     if (index === 3) {
        //         this.CurrentDialogTableVisibleIndex = true;
        //         this.store.commit('setCurrentDialogTableVisibleIndex');
        //         // this.dialogTableVisibleIndexRouter = path;
        //         this.router.push(path);
        //     } else {
        //         this.router.push(path);
        //     }
        // },
        handleDialogClick() {
            // 选择跳转的文档
            // 判断数组中是否存在 type === 4 的元素(调解协议)
            const exists = this.newOriginalItem.some((item) => item.type === 4);
            if (exists) {
                this.store.commit('setCurrentDialogTableVisibleIndex');
            }
            // 判断是否是单选
            if (this.newOriginalItem.length === 1) {
                const { index, path } = this.newOriginalItem[0];
                this.gethandleDialogClick(index, path);
            } else {
                // 登记表
                const foundDengJi = this.newOriginalItem.find((item) => item.type === 3);
                // 调解协议
                const foundXieYi = this.newOriginalItem.find((item) => item.type === 4);
                // 登记表和调解协议是否都存在
                // 检查登记表和调解协议是否都存在
                if (foundDengJi && foundXieYi) {
                    this.dialogTableVisibleIndex = true;
                } else if (foundDengJi) {
                    this.processXieYi('dengji');
                } else if (foundXieYi) {
                    this.dialogTableVisibleIndex = true;
                } else {
                    this.witchNewOriginalItem();
                }
            }
        },
        gethandleDialogClick(index, path) {
            this.store.commit('setCurrentIndex', index);
            this.dialogTableVisible = false;
            this.router.push(path);
        },
        // 选择调解协议文档类型
        handleDialogClickIndex(index) {
            // 将setDialogTableVisibleIndex 存入本地
            localStorage.setItem('dialogTableVisibleIndex', index);
            // 登记表
            const foundDengJi = this.newOriginalItem.find((item) => item.type === 3);
            // 调解协议
            const foundXieYi = this.newOriginalItem.find((item) => item.type === 4);
            if (foundDengJi && foundXieYi) {
                this.generate_records();
            } else {
                this.processXieYi('xieyi');
            }
            this.dialogTableVisibleIndex = false;
        },
        // 用于监听 newOriginalItem
        witchNewOriginalItem() {
            // 遍历newOriginalItem 数组，并且根据数组中的path挨个跳转
        },
        processDictToArray(response) {
            const tempitems = [];
            response.data.data.titleVoList.forEach((element) => {
                let pathStr = '';
                let nameStr = '';
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
        },
    },
    beforeUnmount() { // 关闭网页
        console.log('beforeUnmount');
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
.el-dialog__header{
    border-bottom: 1px solid #3333;
    margin-bottom: 10px;
}
.dialog-content{
    display: flex;
    flex-direction: column;
    /* align-items: center; */
    justify-content: center;
}
.el-checkbox.is-bordered.el-checkbox--large{
    margin-bottom: 10px;
    margin-left: 0;
    margin-right: 0;
}
.dialog-content-item{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 0;
}

.dialog-content-item-title{
    font-size: 16px;
    font-weight: bold;
}
</style>

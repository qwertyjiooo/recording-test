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
    </el-card>
  </div>
  <div style="width: 50%;overflow-y: auto;margin-top: -100px;">
    <el-card ref="editorContainer"
      style="display: flex;flex-direction: column;min-height: calc(100vh - 20px);overflow-y: auto;margin: 10px;border-bottom: 1px solid #d3dce6;background-color: white;">
      <div style="display: flex;text-align: right;justify-content: flex-end;">
        <el-button type="primary" @click="baocun">保存</el-button>
      </div>
      <el-tabs v-model="selectedActivenum" class="demo-tabs">
        <div v-for="(item, index) in documentList" :key="index">
          <el-tab-pane :label=item.title :name=index>
            <quill-editor :id=item.id :ref=item.id :options="editorOption">
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
import axiosInstance from '@/api/axios';
import { ElMessage } from 'element-plus';
import { inject, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { processDictToArray } from '@/utils/utils';

export default {
  components: {
    quillEditor,
  },
  setup() {
    const router = useRouter();
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
      router,
      updateItemList,
    };
  },
  data() {
    return {
      isshuoshengcehng: false,
      bookVo: {},
      duihualist: [],
      selectedActivenum: 0,
      documentList: [],
      dangshifang: [],
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
    // 初始化数据
    initData() {
      const recordId = localStorage.getItem('recordId');
      this.getAllBookListByRecordId(recordId);
    },
    baocun() {
      this.dangshifang.forEach((elementcontent) => {
        const tempquillref = elementcontent.id;
        const tempquill = this.$refs[tempquillref][0];
        const shengcontentList1 = tempquill.quill.getContents().ops;
        elementcontent.document = shengcontentList1;
      });
      console.log('dangshifang', this.dangshifang);
      console.log('bookVo', this.bookVo);
      const requestBody = {
        id: this.bookVo.id,
        recordId: this.bookVo.recordId,
        partyId: this.bookVo.partyId,
        voiceContent: JSON.stringify(this.duihualist),
        content: JSON.stringify(this.dangshifang),
        type: this.bookVo.type,
      };
      axiosInstance.post('/api/addOrModifyBookRecords', requestBody).then((response) => {
        if (response.data.status === 'SUCCESS') {
          ElMessage({
            message: '保存成功！',
            type: 'success',
          });
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
          localStorage.setItem('record', JSON.stringify(response.data.data));
          response.data.data.titleVoList.forEach((element) => {
            if (element.type === 1) {
              this.duihualist = JSON.parse(element.bookVo.voiceContent);
              this.bookVo = element.bookVo;
              this.dangshifang = JSON.parse(element.bookVo.content);
              this.documentList = [];
              this.dangshifang.forEach((elementcontent) => {
                this.documentList.push(elementcontent);
                const tempquillref = elementcontent.id;
                this.$nextTick(() => {
                  const tempquill = this.$refs[tempquillref][0];
                  console.log('quill', tempquill);
                  tempquill.quill.setContents(elementcontent.document, 'user');
                });
              });
            }
            if (element.type === 2) {
              const tempcontent = element.bookVo.content;
              if (tempcontent && tempcontent.length > 0) {
                this.isshuoshengcehng = false;
              } else {
                this.isshuoshengcehng = true;
                const record = JSON.parse(localStorage.getItem('record'));
                console.log('record', record);
                const tempitems = processDictToArray(record.titleVoList);
                console.log('tempitems', tempitems);
                let pathStr = '';
                const newItems = tempitems.map((item) => {
                  if (item.recordInfo) {
                    if (item.recordInfo.title === '回访记录') {
                      pathStr = item.path;
                      return { ...item, select: true };
                    }
                  }
                  return item;
                });
                this.updateItemList(newItems);
                this.router.push(pathStr);
              }
            }
          });
        }
      }).catch((error) => {
        console.error('根据记录ID获取所有文书失败:', error);
      });
    },
  },
};
</script>
<style>
/* 在这里添加CSS样式 */
</style>

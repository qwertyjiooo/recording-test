<template>
  <div style="width: 50%;">
    <el-card
      style="overflow-y: auto;display: flex;flex-direction: column;height: calc(100vh - 130px);margin: 10px;border-bottom: 1px solid #d3dce6;background-color: white;">
      <!-- <div ref="quillEditorRef" class="quill-editor"></div> -->
      <el-tabs v-model="selectedActivenum">
        <div v-for="(item, index) in documentList" :key="index">
          <el-tab-pane :label=item.title :name=index>
            <quill-editor style="display: none;" :id=item.id :ref=item.id :options="editorOption">
            </quill-editor>
            <div style="margin-top: -150px;" v-html="item.editorContent" class="ql-editor"></div>
            <iframe id="print-iframe" title="打印内容" style="display:none;"></iframe>
          </el-tab-pane>
        </div>
      </el-tabs>
    </el-card>
  </div>
  <div style="width: 50%;margin-top: -100px;">
    <div class="PrintPreviewBox">
      <el-card class="PrintPreviewContent">
        <div class="CardHeader">
          <div class="left">
            <div class="Blue"></div>
            <div class="Text">查询列表</div>
          </div>
          <!-- <el-button class="AllPrint">打印全部</el-button> -->
        </div>
        <div class="CardContent">
          <el-table v-loading="loading" :data="Form" stripe style="width: 100%;height: calc(100vh - 110px);">
            <el-table-column prop="title" label="笔录名称" />
            <el-table-column label="操作人">
              {{ personName }}
            </el-table-column>
            <el-table-column fixed="right" label="操作内容">
              <template #default="scope">
                <el-button size="small" type="warning" @click="bianji(scope.$index, scope.row)">编辑</el-button>
                <el-button size="small" type="success" @click="dayin(scope.$index, scope.row)">打印</el-button>
                <el-button size="small" type="primary" @click="yulan(scope.$index, scope.row)">预览</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
    </div>
  </div>

</template>

<script>
import { quillEditor } from 'vue-quill-editor/src';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import Quill from 'quill'; // 导入 Quill
import axiosInstance from '@/api/axios';
import { ElMessage } from 'element-plus';
import { processDictToArray } from '@/utils/utils';
import { useRouter } from 'vue-router';
import { inject, onMounted, ref } from 'vue';

export default ({
  components: {
    quillEditor,
  },
  setup() {
    const zhanshigaoduRef = inject('zhanshigaodu');
    const router = useRouter();
    const itemList = inject('itemList');
    const loading = ref(true);
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
      loading,
      updateItemList,
    };
  },
  data() {
    return {
      selectedActivenum: 0,
      documentList: [],
      personName: '',
      Form: [],
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
      },
    };
  },
  mounted() {
    // const record = JSON.parse(localStorage.getItem('record'));
    const recordId = localStorage.getItem('recordId');
    this.getAllBookListByRecordId(recordId);
  },
  methods: {
    bianji(index, row) {
      const temp = this.Form[index];
      console.log('temp', temp);
      const tempitems = processDictToArray(this.Form);
      console.log('tempitems', tempitems);
      const newItems = tempitems.map((item) => {
        if (item.recordInfo) {
          if (item.recordInfo.title === temp.title) {
            return { ...item, select: true };
          }
        }
        return item;
      });
      this.updateItemList(newItems);
      const itemList = newItems;
      // 更换标题位置
      // const itemToMove = newItems.splice(3, 1)[0]; // 从数组中移除并获取第四个元素
      // const itemList = newItems.splice(1, 0, itemToMove); // 在第二个位置插入该元素
      console.log('itemList', itemList);
      itemList.forEach((element) => {
        if (element.recordInfo) {
          if (temp.title === element.recordInfo.title) {
            console.log('element', element);
            this.router.push(element.path);
          }
        }
      });
    },
    dayin(index, row) {
      this.selectedActivenum = 0;
      const temp = this.Form[index];
      if (temp.type === 1 || temp.type === 2 || temp.type === 3 || temp.type === 4) {
        const tempitems = JSON.parse(row.bookVo.content);
        console.log('tempitems', tempitems);
        this.documentList = [];
        if (tempitems && tempitems.length > 0) {
          if (temp.type === 2) {
            tempitems.forEach((element) => {
              console.log('element', element);
              if (element.dangshifanglist && element.dangshifanglist.length > 0) {
                element.dangshifanglist.forEach((element1) => {
                  element1.id = element1.name;
                  element1.title = element1.name;
                  this.documentList.push(element1);
                  const tempquillref = element1.id;
                  this.$nextTick(() => {
                    const tempquill = this.$refs[tempquillref][0];
                    console.log('quill', tempquill);
                    tempquill.quill.setContents(element1.content, 'user');
                    this.$nextTick(() => {
                      const printContents = tempquill.quill.root.innerHTML;
                      element1.editorContent = `
                <html>
                      <head>
                        <style>
                        @media print {
                        body {margin: 60px;}
                      .ql-align-center { text-align: center; }
                      .ql-size-huge {font-family: "Heiti";font-size: 22px; }
                      .ql-align-right { text-align: right; }
                       .ql-size-large  {  
                            font-family: "SimSun";  
                            font-size: 18px;
                            line-height: 2; 
                          } 
                    }
                          .ql-align-center { text-align: center; }
                      .ql-size-huge { font-family: "Heiti";font-size: 22px; }
                      .ql-align-right { text-align: right; }
                      .ql-size-large  {  
                            font-family: "SimSun";  
                            font-size: 18px;
                            line-height: 2; }
                        </style> 
                      </head>  
                      <body>
                          ${printContents}  
                      </body>
                    </html>
                 `;
                      this.documentList.splice(this.documentList.length - 1, 1);
                      this.documentList.push(element1);
                      console.log('editorContent', element1.editorContent);
                      const iframe = document.getElementById('print-iframe');
                      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                      iframeDoc.open();
                      iframeDoc.write(element1.editorContent);
                      iframeDoc.close();
                      iframe.focus();
                      iframe.contentWindow.print();
                    });
                  });
                });
              } else {
                ElMessage.error('还没有文档内容，请先编辑保存！');
              }
            });
          } else {
            tempitems.forEach((element) => {
              if (temp.type === 3 || temp.type === 4) {
                element.id = element.name;
                element.title = element.name;
              }
              this.documentList.push(element);
              const tempquillref = element.id;
              this.$nextTick(() => {
                const tempquill = this.$refs[tempquillref][0];
                console.log('quill', tempquill);
                tempquill.quill.setContents(element.document, 'user');
                this.$nextTick(() => {
                  const printContents = tempquill.quill.root.innerHTML;
                  element.editorContent = `
                <html>
                      <head>
                        <style>
                         @media print {
                         body {margin: 60px;}
                      .ql-align-center { text-align: center; }
                      .ql-size-huge { font-family: "Heiti";font-size: 22px; }
                      .ql-align-right { text-align: right; }
                      .ql-size-large  {  
                            font-family: "SimSun";  
                            font-size: 18px;
                            line-height: 1.5; 
                          } } 
                      .ql-align-center { text-align: center; }
                      .ql-size-huge { font-family: "Heiti";font-size: 22px; }
                      .ql-align-right { text-align: right; }
                      .ql-size-large  {  
                            font-family: "SimSun";  
                            font-size: 18px;
                            line-height: 1.5;
                    }
                        </style> 
                      </head>  
                      <body>
                          ${printContents}  
                      </body>
                    </html>
                 `;
                  this.documentList.splice(this.documentList.length - 1, 1);
                  this.documentList.push(element);
                  console.log('editorContent', element.editorContent);
                  const iframe = document.getElementById('print-iframe');
                  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                  iframeDoc.open();
                  iframeDoc.write(element.editorContent);
                  iframeDoc.close();
                  iframe.focus();
                  iframe.contentWindow.print();
                });
              });
            });
          }
        } else {
          ElMessage.error('还没有文档内容，请先编辑保存！');
        }
      }
    },
    yulan(index, row) {
      this.selectedActivenum = 0;
      const temp = this.Form[index];
      if (temp.type === 1 || temp.type === 2 || temp.type === 3 || temp.type === 4) {
        const tempitems = JSON.parse(row.bookVo.content);
        console.log('tempitems', tempitems);
        this.documentList = [];
        if (tempitems && tempitems.length > 0) {
          if (temp.type === 2) {
            tempitems.forEach((element) => {
              console.log('element', element);
              if (element.dangshifanglist && element.dangshifanglist.length > 0) {
                element.dangshifanglist.forEach((element1) => {
                  element1.id = element1.name;
                  element1.title = element1.name;
                  element1.editorContent = '';
                  this.documentList.push(element1);
                  const tempquillref = element1.id;
                  this.$nextTick(() => {
                    const tempquill = this.$refs[tempquillref][0];
                    console.log('quill', tempquill);
                    tempquill.quill.setContents(element1.content, 'user');
                    const printContents = tempquill.quill.root.innerHTML;
                    element1.editorContent = `
                    <html>
                      <head>
                        <style>
                          .ql-align-center { text-align: center; }
                      .ql-size-huge { font-family: "Heiti";font-size: 22px; }
                      .ql-align-right { text-align: right; }
                      .ql-size-large  {  
                            font-family: "SimSun";  
                            font-size: 18px;
                            line-height: 1.5; 
                        </style> 
                      </head>  
                      <body>
                          ${printContents}  
                      </body>
                    </html>
                 `;
                    this.documentList.splice(this.documentList.length - 1, 1);
                    this.documentList.push(element1);
                    console.log('documentList', this.documentList);
                  });
                });
              } else {
                ElMessage.error('还没有文档内容，请先编辑保存！');
              }
            });
          } else {
            tempitems.forEach((element) => {
              if (temp.type === 2) {
                element.id = element.name;
                element.title = element.name;
              }
              if (temp.type === 3 || temp.type === 4) {
                element.id = element.name;
                element.title = element.name;
              }
              element.editorContent = '';
              this.documentList.push(element);
              const tempquillref = element.id;
              this.$nextTick(() => {
                const tempquill = this.$refs[tempquillref][0];
                tempquill.quill.setContents(element.document, 'user');
                const printContents = tempquill.quill.root.innerHTML;
                element.editorContent = `
                <html>
                  <head>
                    <style>
                      .ql-align-center { text-align: center; }
                      .ql-size-huge { font-family: "Heiti";font-size: 22px; }
                      .ql-align-right { text-align: right; }
                      .ql-size-large  {  
                            font-family: "SimSun";  
                            font-size: 18px;
                            line-height: 2; 
                    </style> 
                  </head>  
                  <body>
                      ${printContents}  
                  </body>
                </html>
                 `;
                this.documentList.splice(this.documentList.length - 1, 1);
                this.documentList.push(element);
                console.log('documentList', this.documentList);
              });
            });
          }
        } else {
          ElMessage.error('还没有文档内容，请先编辑保存！');
        }
      }
    },
    // 根据记录ID获取所有文书
    getAllBookListByRecordId(recordIds) {
      axiosInstance.get('/api/getAllBookListByRecordId', {
        params: {
          recordId: recordIds,
        },
      }).then((response) => {
        if (response.data.status === 'SUCCESS') {
          // 人民调解案卷案件卷内目录
          this.loading = false;
          const record = response.data.data;
          this.personName = record.personName;
          this.Form = record.titleVoList;
          console.log('Form', this.Form);
          console.log('response.data.data', response.data.data);
        }
      }).catch((error) => {
        console.error('根据记录ID获取所有文书失败:', error);
      });
    },
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

.PrintPreviewBox {
  width: calc(100% - 20px);
  display: flex;
  flex-direction: column;
  margin: 10px;

  .PrintPreviewContent {
    display: flex;
    flex-direction: column;

    .CardHeader {
      border-bottom: 1px solid #d3dce6;
      display: flex;
      justify-content: space-between;
      font-size: 15px;
      font-weight: 600;
      line-height: 20px;
      padding-bottom: 8px;
      color: #000;
      align-items: center;

      .left {
        display: flex;
        align-items: center;

        .Blue {
          width: 10px;
          height: 10px;
          background-color: blue;
          margin-right: 8px
        }
      }

      .AllPrint {
        width: 100px;
        background-color: #0b52a3;
        color: #fff;
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

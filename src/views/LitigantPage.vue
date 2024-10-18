<template>
  <el-upload :multiple="false" :show-file-list="false" :accept="'.mp3,.wav'"
    :http-request="(rawFile) => getFiles(rawFile, index)">
    <el-button size="small" type="primary">点击上传</el-button>
  </el-upload>
  <el-button size="large" type="primary" @click="connectWebSocket">开始录音</el-button>

  <el-button size="large" type="primary" @click="tingzhiluyin">结束录音</el-button>
  <div><el-check-tag style="margin-left: 5px;" checked v-for="(item, index) in extractedStrings" :key="index" @click="dianjibiaoqian(item)">{{ item }}</el-check-tag>
  </div>

</template>

<script>
import axios from 'axios';
import CryptoJS from 'crypto-js';
import Recorder from '@/utils/Recorder';

const secretKey = '5697ace1e8beb1f3d355aded963ec909';
const appID = 'ebe3e2be';
const apiUrl = 'https://raasr.xfyun.cn/v2/api/';

export default {
  data() {
    return {
      ws: null,
      resultText: '',
      resultTextTemp: '',
      originalString: '经调解，双方因口角引发**打架**事件，达成协议：一方赔偿另一方医疗等费用共计1万元，双方互不再追究**责任**。调解协议已履行，当事人对调解结果表示满意，认为调解员态度认真、业务能力强。目前双方关系和谐，无新**纠纷**',
      extractedStrings: [],
      processedString: '',
    };
  },
  methods: {
    dianjibiaoqian(item) {
      console.log(item);
    },
    extractAndProcessString() {
      const regex = /\*{2}(.*?)\*{2}/g;
      let match;
      match = regex.exec(this.originalString);
      while (match !== null) {
        this.extractedStrings.push(match[1]);
        match = regex.exec(this.originalString);
      }
      console.log('extractedStrings:', this.extractedStrings);
      this.processedString = this.originalString.replace(/\*{2}/g, '');
    },
    tingzhiluyin() {
      this.extractAndProcessString();
      // if (this.recorder) {
      //   this.recorder.stop();
      // }
      // this.ws.send(JSON.stringify({
      //   end: 'true',
      // }));
    },
    onaudioprocess(buffer) {
      if (this.ws && this.ws.readyState === 1) {
        this.ws.send(buffer);
      }
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
        this.resultTextTemp = '';
        data.cn.st.rt.forEach((j) => {
          j.ws.forEach((k) => {
            k.cw.forEach((l) => {
              this.resultTextTemp += l.w;
            });
          });
        });
        if (data.cn.st.type === 0) {
          // 【最终】识别结果
          this.resultText += this.resultTextTemp;
          this.resultTextTemp = '';
        }
        console.log('result:', this.resultText + this.resultTextTemp);
      } else if (jsonData.action === 'error') {
        // 连接发生错误
        console.log('出错了:', jsonData);
      }
    },
    connectWebSocket() {
      const APIKey = '44ed5faab8c8747c062e4d028e87d003';
      const url = 'wss://rtasr.xfyun.cn/v1/ws';
      const ts = Math.floor(new Date().getTime() / 1000);
      const signa = CryptoJS.MD5(appID + ts).toString();
      const signatureSha = CryptoJS.HmacSHA1(signa, APIKey);
      let signature = CryptoJS.enc.Base64.stringify(signatureSha);
      signature = encodeURIComponent(signature);
      this.ws = new WebSocket(`${url}?appid=${appID}&ts=${ts}&signa=${signature}&roleType=2`);
      this.ws.onopen = (e) => {
        console.log('开始录音', e);
      };
      this.ws.onmessage = (e) => {
        console.log('renderResult', e.data);
        this.renderResult(e.data);
      };
      this.ws.onerror = (e) => {
        console.log('onerror', e);
      };
      this.ws.onclose = (e) => {
        console.log('onclose');
      };
      this.recorder = new Recorder(this.onaudioprocess);
      this.recorder.ready().then(
        () => {
          this.recorder.start();
        },
        () => {
          console.log('录音启动失败！');
        },
      );
    },
    async getFiles(rawFile, index) {
      const fileLen = rawFile.file.size;
      const fileNameStr = rawFile.file.name;
      console.log('fileLen', fileLen);
      console.log('fileName', fileNameStr);
      const tsStr = Math.round(new Date().getTime() / 1000);
      console.log('tsStr', tsStr);

      const paramDict = {
        appId: appID,
        signa: this.getSigna(tsStr),
        ts: tsStr,
        fileSize: fileLen,
        fileName: fileNameStr,
        duration: '200',
      };
      const queryString = new URLSearchParams(paramDict).toString();
      const url = `${apiUrl}upload?${queryString}`;
      const formData = new FormData();
      formData.append('file', rawFile.file);
      try {
        const response = await axios.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data', // 注意这里的内容类型与Python中的不同
          },
        });
        console.log('"upload_url:', response.request.responseURL);
        const result = response.data;
        console.log('upload resp:', result);
      } catch (error) {
        console.error('上传失败：', error);
      }
    },
    getSigna(ts) {
      const md5Hash = CryptoJS.MD5(appID + ts).toString();
      const md5Bytes = CryptoJS.enc.Hex.parse(md5Hash);
      const hmacSha1Hash = CryptoJS.HmacSHA1(md5Bytes, CryptoJS.enc.Utf8.parse(secretKey));
      const signa = hmacSha1Hash.toString(CryptoJS.enc.Base64);
      return signa;
    },
    uploadFile() {
      console.log('uploadFile');
      // const lang = 'cn';
      // const timestamp = Math.round(new Date().getTime());
      // const sssss = `${secret}${appkey}${audiotype}other${lang}${md5}${this.task_id}${timestamp}${userid}${secret}`;
      // const signature = CryptoJS.SHA1(sssss).toString().toUpperCase();
      // const actiontranscribe = `${path}/utservice/v2/trans/transcribe?userid=${userid}&task_id=${this.task_id}&audiotype=${audiotype}&domain=other&lang=${lang}&md5=${md5}&appkey=${appkey}&timestamp=${timestamp}&signature=${signature}`;
      // axios.get(actiontranscribe).then((res) => {
      //   if (res.data.error_code === 0) {
      //     console.log('transcribe', res.data);
      //     this.transtext();
      //   } else {
      //     console.log('transcribe 1', res.data.message);
      //   }
      // }).catch((error) => {
      //   console.log('transcribe 2', error);
      // });
    },
    transtext() {
      console.log('transtext');
      // const timestamp = Math.round(new Date().getTime());
      // const sssss = `${secret}${appkey}${this.task_id}${timestamp}${secret}`;
      // const signature = CryptoJS.SHA1(sssss).toString().toUpperCase();
      // const actiontranscribe = `${path}/utservice/v2/trans/text?task_id=${this.task_id}&appkey=${appkey}&timestamp=${timestamp}&signature=${signature}`;
      // axios.get(actiontranscribe).then((res) => {
      //   if (res.data.error_code === 0) {
      //     if (res.data.status === 'done') {
      //       if (res.data.error_code === 0) {
      //         console.log('识别结果：', res.data.results);
      //       }
      //     } else {
      //       setTimeout(() => {
      //         this.transtext();
      //       }, 1000);
      //     }
      //   } else {
      //     console.log('transtext 1', res.data.message);
      //   }
      // }).catch((error) => {
      //   console.log('transtext 2', error);
      // });
    },
  },
};
</script>
<style scoped>
/* 样式保持不变 */
</style>

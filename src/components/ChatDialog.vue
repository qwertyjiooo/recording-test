<template>
    <div>
      <el-button class="chat-button" @click="toggleChat"></el-button>
      <div id="showLoadingByL" v-show="isChatOpen" class="chat-dialog">
        <div class="guanbi">
            <div
                style="margin-left: 10px;flex: 1;display: flex;align-items:center;font-size: 20px;font-weight: 600;">
                法言法语</div>
          <el-button @click="guanbi" type="primary">关闭</el-button>
        </div>
        <div class="chat-messages" ref="chatMessages">
          <div v-for="(message, index) in messages" :key="index">
            <div @click="toggleDisplay(message)" class="user-message">
                <el-tag>{{ message.titleStr }}</el-tag>
                <span class="expand-button" v-if="!message.isExpanded && message.contentText.length > 5">(展开)</span>
            </div>
            <div style="text-align: left;" v-html="compiledMarkdown(message)"></div>
            <span @click="toggleDisplay(message)" class="expand-button" v-if="message.isExpanded" >(收起)</span>
        </div>
        </div>
        <div class="chat-input">
            <el-input v-model="userInput" @keyup.enter="sendMessage" placeholder="请输入您要查询的内容" />
            <el-button type="primary" @click="sendMessage">发送</el-button>
        </div>
      </div>
    </div>
</template>

<script>
import { ElLoading } from 'element-plus';
import MarkdownIt from 'markdown-it';

export default {
  data() {
    return {
      isChatOpen: false,
      userInput: '',
      messages: [],
    };
  },
  methods: {
    guanbi() {
      this.isChatOpen = false;
    },
    showsendMessage(userInput) {
        this.isChatOpen = true;
        this.messages.push({
            titleStr: userInput,
            contentText: '',
            contentOmissionText: '',
            isExpanded: true,
        });
        // 滚动到最底部
        this.scrollToBottom();
        // 模拟调用接口并添加返回的消息到消息列表
        this.$nextTick(() => {
            this.mockApiResponse(userInput);
        });
    },
    compiledMarkdown(message) {
        const md = new MarkdownIt();
        let text = '';
        if (message.isExpanded) {
            text = message.contentText;
        } else {
            text = message.contentOmissionText;
        }
        return md.render(text);
    },
    sendMessage() {
        if (this.userInput.trim() === '') return;
        // 添加用户消息到消息列表
        this.messages.push({
            titleStr: this.userInput,
            contentText: '',
            contentOmissionText: '',
            isExpanded: false,
        });
        // 滚动到最底部
        this.scrollToBottom();
        // 模拟调用接口并添加返回的消息到消息列表
        this.mockApiResponse(this.userInput);
    },
    toggleChat() {
      this.isChatOpen = !this.isChatOpen;
      this.$nextTick(() => {
        if (this.isChatOpen) {
          this.scrollToBottom();
        }
      });
    },
    async mockApiResponse(contentStr) {
      const loadingInstance = ElLoading.service({
        customClass: 'custom-loading',
        target: '#showLoadingByL',
        text: '正在查找，请稍等...',
        background: 'rgba(0, 0, 0, 0.7)',
      });

      const url = 'http://58.246.144.58:8888/chat_stream';
      const headers = {
        Accept: 'text/plain',
        Authorization: 'Bearer MxwaXdn3jBBigtJniaasCRTrJpe73TWF',
        'Content-Type': 'application/json',
      };
      const data = { input: contentStr };
      this.userInput = '';

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
        });

        if (!response.body) {
          throw new Error('ReadableStream not supported in this browser.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        let resultText = '';
        let done;
        let firstChunkReceived = false; // 标记是否接收到第一个数据块

        const readStream = async () => {
          const { done: isDone, value } = await reader.read();
          done = isDone;
          if (value) {
            if (!firstChunkReceived) {
              loadingInstance.close(); // 关闭加载动画
              firstChunkReceived = true;
            }
            resultText += decoder.decode(value, { stream: true });
            this.messages[this.messages.length - 1].contentText = resultText;
            this.scrollToBottom();
          }
          if (!done) {
            await readStream(); // 继续读取
          }
        };

        await readStream(); // 启动流读取

        const lastMessage = this.messages[this.messages.length - 1];
        lastMessage.contentOmissionText = resultText.length <= 20 ? resultText : `${resultText.substring(0, 20)}......`;
        // 此处注释是为了不让请求之后立即关闭展开
        // lastMessage.isExpanded = false;
      } catch (error) {
        loadingInstance.close();
        console.error('请求失败:', error);
      }
    },
    toggleDisplay(message) {
      message.isExpanded = !message.isExpanded;
    },
    scrollToBottom() {
      this.$nextTick(() => {
        this.$refs.chatMessages.scrollTop = this.$refs.chatMessages.scrollHeight;
      });
    },
  },
};
</script>

<style>
.guanbi {
    display: flex;
    margin-top: 5px;
    margin-right: 5px;
}

.chat-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-image: url('../assets/jiqirendongtu.gif');
    background-size: cover;
    border: none;
    width: 100px;
    height: 100px;
    z-index: 9999 !important;
    border-radius: 50px;
}

.chat-dialog {
    position: fixed;
    bottom: 20px;
    right: 80px;
    width: 40%;
    height: 70%;
    /* border: 1px solid #ccc; */
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 9999 !important;
    border-radius: 10px;
}

.chat-messages {
    flex: 1;
    padding: 10px;
    overflow-y: auto;
}

.chat-messages .user-message {
    /* font-weight: bold; */
    /* color: blue; */
    text-align: left;
    /* padding: 5px 10px;
    border-radius: 5px;
    margin: 5px; */
}
.expand-button{
    color: #999999;
    text-decoration:none;
    cursor: pointer;
    margin-left: 5px;
    font-size: 14px;
}
.chat-messages .bot-message {
    text-align: left;
    padding: 5px 10px;
    border-radius: 5px;
    margin: 5px;
}

.chat-input {
    display: flex;
    padding: 10px;
    background-color: #f9f9f9;
    /* border-top: 1px solid #ddd; */
}

/* .chat-input input {
    flex: 1;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 5px;
} */

.chat-input button {
    margin-left: 10px;
    padding: 5px 10px;
    border: none;
    background-color: #007bff;
    color: #fff;
    border-radius: 5px;
    cursor: pointer;
}

.chat-input button:hover {
    background-color: #0056b3;
}

.custom-loading {
    background-image: url('../assets/loading.gif');
    background-repeat: no-repeat;
    background-size: 200px 200px;
    background-position: center;
    /* 设置为你想要的大小 */
}

.custom-loading .el-loading-text {
    font-size: 20px;
    position: absolute;
    margin-top: 120px;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    /* 或者任何你需要的颜色 */
}

.custom-loading .circular {
    /*隐藏 默认的 loading 动画*/
    display: none;
}
</style>

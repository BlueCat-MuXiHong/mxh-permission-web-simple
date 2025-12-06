<template>
  <div class="ai-chat-wrapper">
    <el-container class="ai-chat-container">
      <!-- 顶部标题栏 -->
      <el-header class="chat-header" height="60px">
        <div class="header-left">
          <el-avatar :size="40" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
            class="header-avatar"></el-avatar>
          <div class="header-info">
            <h2 class="title">AI 智能助手</h2>
            <span class="status">
              <span class="status-dot"></span> 在线
            </span>
          </div>
        </div>
        <div class="header-right">
          <el-tooltip content="清空对话" placement="bottom">
            <el-button icon="el-icon-delete" circle size="small" @click="clearMessages"></el-button>
          </el-tooltip>
        </div>
      </el-header>

      <!-- 中间消息区域 -->
      <el-main class="chat-main" ref="mainContainer">
        <div class="messages-list">
          <!-- 欢迎消息 -->
          <div class="message-time-divider">
            <span>{{ formatTime(new Date()) }}</span>
          </div>

          <div class="message-item ai">
            <el-avatar class="message-avatar" :size="36" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
            <div class="message-content">
              <div class="message-bubble">
                <p>您好！我是您的 AI 智能助手。有什么我可以帮您的吗？您可以问我任何问题。</p>
              </div>
            </div>
          </div>

          <!-- 消息循环 -->
          <div v-for="(msg, index) in messages" :key="index" :class="['message-item', msg.sender]">
            <template v-if="msg.sender === 'ai'">
              <el-avatar class="message-avatar" :size="36" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
              <div class="message-content">
                <div class="message-bubble">
                  <div v-if="msg.loading" class="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                  <div v-else class="markdown-body" v-html="formatContent(msg.content)"></div>
                </div>
              </div>
            </template>

            <template v-else>
              <el-avatar class="message-avatar" :size="36" icon="el-icon-user-solid" :src="avatar+'?imageView2/1/w/80/h/80'"></el-avatar>
              <div class="message-content">
                <div class="message-bubble">
                  <div class="text">{{ msg.content }}</div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </el-main>

      <!-- 底部输入区域 -->
      <el-footer class="chat-footer" height="auto">
        <div class="input-container">
          <el-input type="textarea" :rows="1" :autosize="{ minRows: 1, maxRows: 4 }"
            placeholder="请输入您的问题... (Shift + Enter 换行)" v-model="questionModel.question" resize="none"
            class="chat-input" @keydown.enter.native="handleEnter"></el-input>
          <el-button type="primary" class="send-btn" :loading="isSending" :disabled="!questionModel.question.trim()"
            @click="sendMessage" icon="el-icon-s-promotion" circle></el-button>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import { ask } from '../../../api/ai';
import { getToken } from '@/utils/auth';
import config from '@/config';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // 引入代码高亮样式
import {mapGetters} from 'vuex'
// 配置 marked
marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true // 支持 GitHub 风格的换行符
});

export default {
  name: 'AiChat',
  computed: {
        ...mapGetters([
            'avatar'
        ])
    },
  data() {
    return {
      questionModel: {
        sessionId: '',
        modelCode: 'qwen3-max',
        shortName: 'qwen',
        question: '',
        stream: true 
      },
      taskId: '',
      isSending: false,
      messages: []
    }
  },
  methods: {
    // 格式化时间
    formatTime(date) {
      return new Date(date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    },
    // 格式化内容（使用 marked 解析 markdown）
    formatContent(content) {
      if (!content) return '';
      try {
        return marked.parse(content);
      } catch (error) {
        console.error('Markdown parse error:', error);
        return content;
      }
    },
    // 处理回车键
    handleEnter(e) {
      if (e.keyCode === 13 && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    },
    // 发送消息
    async sendMessage() {
      const content = this.questionModel.question.trim();
      if (!content || this.isSending) return;

      // 构造请求参数，避免引用问题
      const requestParams = {
        ...this.questionModel,
        question: content
      };

      // 添加用户消息
      this.messages.push({
        sender: 'user',
        content: content,
        time: new Date()
      });

      // 清空输入框
      this.questionModel.question = '';
      this.isSending = true;
      this.scrollToBottom();

      try {
        // 调用聊天接口
        const res = await ask(requestParams);
        if (res.code === 200) {
          this.questionModel.sessionId = res.data.sessionId;
          this.taskId = res.data.askId;

          // 添加 AI 消息占位
          this.messages.push({
            sender: 'ai',
            loading: true,
            content: '',
            time: new Date()
          });
          this.scrollToBottom();

          // 开始 SSE 连接
          await this.connectSSE(this.taskId);
        } else {
          this.$message.error(res.message || '请求失败');
          this.isSending = false;
        }
      } catch (error) {
        console.error(error);
        this.$message.error('发送失败，请重试');
        this.isSending = false;
      }
    },
    // 连接 SSE
    async connectSSE(taskId) {
      console.log('connectSSE', taskId);
      try {
        const url = `${config.VUE_APP_BASE_API}/chat/stream/${taskId}`;
        const response = await fetch(url, {
          headers: {
            'token': getToken()
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        const aiMsg = this.messages[this.messages.length - 1];
        aiMsg.loading = false;

        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          
          buffer += chunk;

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data:')) {
              const data = line.slice(5).trim();
              if (!data || data === '[DONE]') continue;

              try {
                // 尝试解析 JSON
                const json = JSON.parse(data);
                // 优先处理 aiAnswer
                if (json.aiAnswer) {
                  aiMsg.content += json.aiAnswer;
                } else if (json.content) {
                  // 兼容可能的 content 字段
                  aiMsg.content += json.content;
                } else {
                  // 如果是其他结构，可能需要根据实际情况调整
                  console.log('Unrecognized SSE data structure:', json);
                }
              } catch (e) {
                // 非 JSON 直接追加，或者解析失败
                console.warn('Parse SSE data error:', e);
                // 只有在确实不是 JSON 时才直接追加 data，避免追加 undefined
                // aiMsg.content += data; 
              }
            }
          }
          this.scrollToBottom();
        }
      } catch (error) {
        console.error('SSE connection error:', error);
        const aiMsg = this.messages[this.messages.length - 1];
        aiMsg.content += '\n[连接中断]';
      } finally {
        this.isSending = false;
      }
    },
    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.mainContainer?.$el;
        if (container) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        }
      });
    },
    // 清空消息
    clearMessages() {
      this.$confirm('确定要清空所有对话记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.messages = [];
        this.questionModel.sessionId = '';
        this.$message({
          type: 'success',
          message: '对话已清空'
        });
      }).catch(() => { });
    }
  }
}
</script>

<style lang="scss" scoped>
// 导入项目变量
@import "@/assets/styles/variables.scss";

.ai-chat-wrapper {
  height: calc(100vh - 50px); // 减去导航栏高度，确保铺满一屏
  width: 100%;
  background-color: #fff;
  overflow: hidden; // 防止外层滚动
}

.ai-chat-container {
  width: 100%;
  height: 100%;
  background-color: #fff;
  position: relative;
}

.chat-header {
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 10;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin: 0;
      line-height: 1.2;
    }

    .status {
      font-size: 12px;
      color: #67C23A;
      display: flex;
      align-items: center;
      gap: 4px;

      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #67C23A;
      }
    }
  }
}

.chat-main {
  padding: 0;
  overflow-y: auto;
  background-color: #f5f7fa;
  scroll-behavior: smooth;

  .messages-list {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-height: 100%;
  }
}

.message-time-divider {
  text-align: center;
  margin: 10px 0;

  span {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    color: #909399;
  }
}

.message-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 85%;
  animation: slideIn 0.3s ease-out;

  &.ai {
    align-self: flex-start;

    .message-bubble {
      background-color: #fff;
      color: #303133;
      border-top-left-radius: 2px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
  }

  &.user {
    align-self: flex-end;
    flex-direction: row-reverse;

    .message-bubble {
      background-color: $primary-color; // 使用项目主题色
      color: #fff;
      border-top-right-radius: 2px;
      box-shadow: 0 2px 4px rgba(64, 158, 255, 0.2);

      .text {
        white-space: pre-wrap;
      }
    }
  }

  .message-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .message-bubble {
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 14px;
    line-height: 1.6;
    word-break: break-word;
    position: relative;
  }
}

.chat-footer {
  background: #fff;
  border-top: 1px solid #ebeef5;
  padding: 16px 20px;

  .input-container {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    background-color: #f5f7fa;
    border-radius: 24px;
    padding: 8px 8px 8px 20px;
    transition: all 0.3s;
    border: 1px solid transparent;

    &:focus-within {
      background-color: #fff;
      border-color: $primary-color;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
    }

    .chat-input {
      flex: 1;

      ::v-deep .el-textarea__inner {
        background: transparent;
        border: none;
        padding: 8px 0;
        box-shadow: none;
        resize: none;
        min-height: 24px !important;
        font-size: 14px;

        &:focus {
          outline: none;
        }
      }
    }

    .send-btn {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      transition: transform 0.2s;

      &:hover {
        transform: scale(1.05);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }
}

// Loading 动画
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;

  span {
    width: 6px;
    height: 6px;
    background-color: #909399;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

@keyframes bounce {

  0%,
  80%,
  100% {
    transform: scale(0);
  }

  40% {
    transform: scale(1);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Markdown 样式
::v-deep .markdown-body {
  font-size: 14px;
  line-height: 1.6;
  color: #24292e;

  p {
    margin-top: 0;
    margin-bottom: 10px;
  }

  pre {
    background-color: #f6f8fa;
    padding: 16px;
    border-radius: 6px;
    overflow: auto;
    margin-bottom: 10px;
    line-height: 1.45;
  }

  code {
    font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace;
    background-color: rgba(27, 31, 35, 0.05);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-size: 85%;
  }

  pre code {
    background-color: transparent;
    padding: 0;
    font-size: 100%;
    word-break: normal;
    white-space: pre;
  }

  ul,
  ol {
    padding-left: 20px;
    margin-top: 0;
    margin-bottom: 10px;
  }

  blockquote {
    margin: 0 0 10px;
    padding: 0 1em;
    color: #6a737d;
    border-left: 0.25em solid #dfe2e5;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
  }

  h1,
  h2 {
    padding-bottom: 0.3em;
    border-bottom: 1px solid #eaecef;
  }

  a {
    color: #0366d6;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  table {
    border-spacing: 0;
    border-collapse: collapse;
    margin-bottom: 16px;
    width: 100%;
    overflow: auto;
    display: block;

    th,
    td {
      padding: 6px 13px;
      border: 1px solid #dfe2e5;
    }

    tr {
      background-color: #fff;
      border-top: 1px solid #c6cbd1;
    }

    tr:nth-child(2n) {
      background-color: #f6f8fa;
    }
  }

  img {
    max-width: 100%;
    box-sizing: content-box;
    background-color: #fff;
  }
}

// 移动端特定样式优化
@media (max-width: 768px) {
  .chat-header {
    padding: 0 12px;

    .header-left .title {
      font-size: 16px;
    }
  }

  .chat-main .messages-list {
    padding: 12px;
    gap: 16px;
  }

  .message-item {
    max-width: 90%;

    .message-bubble {
      padding: 10px 14px;
      font-size: 14px;
    }

    .message-avatar {
      width: 32px;
      height: 32px;
    }
  }

  .chat-footer {
    padding: 10px 12px;

    .input-container {
      padding-left: 16px;
    }
  }
}
</style>
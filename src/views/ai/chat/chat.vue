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
            <el-avatar class="message-avatar" :size="36"
              src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
            <div class="message-content">
              <div class="message-bubble">
                <p>您好！我是您的 AI 智能助手。有什么我可以帮您的吗？您可以问我任何问题。</p>
              </div>
            </div>
          </div>

          <!-- 消息循环 -->
          <div v-for="(msg, index) in messages" :key="index" :class="['message-item', msg.sender]">
            <template v-if="msg.sender === 'ai'">
              <el-avatar class="message-avatar" :size="36"
                src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
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
              <el-avatar class="message-avatar" :size="36" icon="el-icon-user-solid"></el-avatar>
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
            placeholder="请输入您的问题... (Shift + Enter 换行)" v-model="userInput" resize="none" class="chat-input"
            @keydown.enter.native="handleEnter"></el-input>
          <el-button type="primary" class="send-btn" :loading="isSending" :disabled="!userInput.trim()"
            @click="sendMessage" icon="el-icon-s-promotion" circle></el-button>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'AiChat',
  data() {
    return {
      userInput: '',
      isSending: false,
      messages: []
    }
  },
  methods: {
    // 格式化时间
    formatTime(date) {
      return new Date(date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    },
    // 简单的文本格式化（实际项目中可替换为 markdown 解析器）
    formatContent(content) {
      if (!content) return '';
      return content.replace(/\n/g, '<br>');
    },
    // 处理回车键
    handleEnter(e) {
      if (e.keyCode === 13 && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    },
    // 发送消息
    sendMessage() {
      const content = this.userInput.trim();
      if (!content || this.isSending) return;

      // 添加用户消息
      this.messages.push({
        sender: 'user',
        content: content,
        time: new Date()
      });

      this.userInput = '';
      this.isSending = true;
      this.scrollToBottom();

      // 模拟 AI 回复
      this.simulateAiResponse();
    },
    // 模拟 AI 回复
    simulateAiResponse() {
      // 先添加一个 loading 状态的消息
      const loadingMsg = {
        sender: 'ai',
        loading: true,
        content: '',
        time: new Date()
      };
      this.messages.push(loadingMsg);
      this.scrollToBottom();

      // 模拟网络延迟
      setTimeout(() => {
        // 移除 loading 消息
        this.messages.pop();

        const responses = [
          "这是一个很好的问题！根据我的分析，通常情况下我们需要考虑多个因素...",
          "我明白了您的意思。在技术实现上，这可以通过以下几种方式来解决...",
          "确实如此。除此之外，我们还需要注意性能优化的问题。",
          "您提到的这一点非常关键！",
          "抱歉，我需要更多上下文信息才能准确回答您的问题。"
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        this.messages.push({
          sender: 'ai',
          content: randomResponse,
          time: new Date()
        });

        this.isSending = false;
        this.scrollToBottom();
      }, 1500);
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
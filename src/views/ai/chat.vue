<template>
  <div class="chat-container">
    <!-- 聊天头部 -->
    <div class="chat-header">
      <h2>AI智能助手</h2>
      <p>企业智能组织管理系统客服</p>
    </div>

    <!-- 聊天消息区域 -->
    <div ref="messagesContainer" class="chat-messages">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="['message', message.type === 'user' ? 'user-message' : 'ai-message']"
      >
        <div class="message-avatar">
          <i :class="message.type === 'user' ? 'el-icon-user' : 'el-icon-service'" />
        </div>
        <div class="message-content">
          <div class="message-text" v-html="formatMessage(message.content)" />
          <div class="message-time">{{ formatTime(message.time) }}</div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="message ai-message">
        <div class="message-avatar">
          <i class="el-icon-service" />
        </div>
        <div class="message-content">
          <div class="loading-dots">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </div>

    <!-- 聊天输入区域 -->
    <div class="chat-input">
      <div class="input-container">
        <el-input
          v-model="inputMessage"
          type="textarea"
          :rows="3"
          placeholder="请输入您的问题..."
          :disabled="loading"
          @keydown.ctrl.enter="sendMessage"
        />
        <div class="input-actions">
          <el-button
            type="primary"
            :loading="loading"
            :disabled="!inputMessage.trim()"
            @click="sendMessage"
          >
            发送
          </el-button>
          <el-button @click="clearChat">清空聊天</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { chatWithAI } from '@/api/ai'

export default {
  name: 'AIChat',
  data() {
    return {
      messages: [],
      inputMessage: '',
      loading: false
    }
  },
  mounted() {
    // 添加欢迎消息
    this.addMessage('ai', '您好！我是企业智能组织管理系统的AI助手，可以帮助您了解系统的各个功能模块。请问有什么可以帮助您的吗？')
  },
  methods: {
    // 发送消息
    async sendMessage() {
      if (!this.inputMessage.trim() || this.loading) {
        return
      }

      const userMessage = this.inputMessage.trim()
      this.addMessage('user', userMessage)
      this.inputMessage = ''
      this.loading = true

      try {
        const response = await chatWithAI(userMessage)
        if (response.data.code === 1) {
          this.addMessage('ai', response.data.data)
        } else {
          this.addMessage('ai', '抱歉，我遇到了一些问题，请稍后再试。')
        }
      } catch (error) {
        console.error('聊天请求失败:', error)
        this.addMessage('ai', '抱歉，网络连接出现问题，请检查网络后重试。')
      } finally {
        this.loading = false
        this.scrollToBottom()
      }
    },

    // 添加消息到列表
    addMessage(type, content) {
      this.messages.push({
        type,
        content,
        time: new Date()
      })
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },

    // 滚动到底部
    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },

    // 清空聊天记录
    clearChat() {
      this.$confirm('确定要清空所有聊天记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.messages = []
        this.addMessage('ai', '您好！我是企业智能组织管理系统的AI助手，可以帮助您了解系统的各个功能模块。请问有什么可以帮助您的吗？')
      })
    },

    // 格式化消息内容（支持换行）
    formatMessage(content) {
      return content.replace(/\n/g, '<br>')
    },

    // 格式化时间
    formatTime(time) {
      const date = new Date(time)
      const now = new Date()
      const diff = now - date

      if (diff < 60000) { // 1分钟内
        return '刚刚'
      } else if (diff < 3600000) { // 1小时内
        return `${Math.floor(diff / 60000)}分钟前`
      } else if (diff < 86400000) { // 24小时内
        return `${Math.floor(diff / 3600000)}小时前`
      } else {
        return date.toLocaleString()
      }
    }
  }
}
</script>

<style scoped>
.chat-container {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  text-align: center;
}

.chat-header h2 {
  margin: 0 0 5px 0;
  font-size: 24px;
  font-weight: 600;
}

.chat-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #fff;
}

.message {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;
}

.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 12px;
  flex-shrink: 0;
}

.user-message .message-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.ai-message .message-avatar {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.message-content {
  max-width: 70%;
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
}

.user-message .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.ai-message .message-content {
  background: #f8f9fa;
  color: #333;
}

.message-text {
  line-height: 1.5;
  word-wrap: break-word;
}

.message-time {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 5px;
  text-align: right;
}

.loading-dots {
  display: flex;
  align-items: center;
  gap: 4px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #999;
  animation: loading 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes loading {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.chat-input {
  background: #fff;
  padding: 20px;
  border-top: 1px solid #e4e7ed;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-container {
    height: calc(100vh - 80px);
  }

  .message-content {
    max-width: 85%;
  }

  .chat-header {
    padding: 15px;
  }

  .chat-header h2 {
    font-size: 20px;
  }
}
</style>

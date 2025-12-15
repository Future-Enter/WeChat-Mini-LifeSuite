// pages/chat/chat.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    messages: [],
    inputValue: '',
    isLoading: false,
    scrollTop: 0,
    autoFocus: false,
    canSend: false,
    // 配置信息 - 请根据你的实际情况修改
    apiConfig: {
      apiUrl: 'https://api.deepseek.com/chat/completions',
      apiKey: 'sk-a0d74b30f7044d0aad2ba893f3a7b946', // 请替换为你的API Key
      model: 'deepseek-chat',
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.checkApiConfig();
    
    this.setData({
      messages: [
        { 
          role: 'assistant', 
          content: '你好！我是AI助手，有什么可以帮你的？',
          time: this.formatTime(new Date())
        }
      ]
    });
  },

  /**
   * 检查API配置
   */
  checkApiConfig() {
    const config = this.data.apiConfig;
    if (!config.apiKey || config.apiKey === 'your-deepseek-api-key' || config.apiKey === 'your-openai-api-key') {
      wx.showModal({
        title: 'API配置提示',
        content: '请先在chat.js中配置您的API Key',
        showCancel: false,
        confirmText: '知道了',
        success: () => {
          console.warn('请配置API信息');
        }
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    setTimeout(() => {
      this.scrollToBottom();
    }, 300);
  },

  /**
   * 格式化时间显示
   */
  formatTime(date) {
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${hour}:${minute}`;
  },

  /**
   * 处理输入框输入
   */
  onInput(e) {
    const value = e.detail.value;
    this.setData({
      inputValue: value,
      canSend: value.trim().length > 0 && !this.data.isLoading
    });
  },

  /**
   * 处理发送消息
   */
  handleSend() {
    const userInput = this.data.inputValue.trim();
    
    if (!userInput) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    
    if (this.data.isLoading) {
      wx.showToast({
        title: '请等待AI回复',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    
    this.sendMessageToAPI(userInput);
  },

  /**
   * 发送消息到API
   */
  async sendMessageToAPI(userInput) {
    this.setData({
      isLoading: true,
      canSend: false,
      inputValue: ''
    });
    
    const userMsg = { 
      role: 'user', 
      content: userInput,
      time: this.formatTime(new Date())
    };
    
    this.setData({
      messages: [...this.data.messages, userMsg]
    }, () => {
      this.scrollToBottom();
      setTimeout(() => {
        this._makeAPIRequest(userInput);
      }, 100);
    });
  },

  /**
   * 实际发起API请求
   */
  async _makeAPIRequest(userInput) {
    try {
      const response = await this.callAIAPI(userInput);
      
      const assistantMsg = { 
        role: 'assistant', 
        content: response,
        time: this.formatTime(new Date())
      };
      
      this.setData({
        messages: [...this.data.messages, assistantMsg]
      }, () => {
        this.scrollToBottom();
      });

    } catch (error) {
      console.error('API调用失败：', error);
      
      let errorMessage = '抱歉，我暂时无法回应。请稍后再试。';
      if (error.message.includes('401')) {
        errorMessage = 'API Key无效，请检查配置';
      } else if (error.message.includes('429')) {
        errorMessage = '请求频率超限，请稍后再试';
      } else if (error.message.includes('network')) {
        errorMessage = '网络连接失败，请检查网络设置';
      }
      
      const errorMsg = { 
        role: 'assistant', 
        content: errorMessage,
        time: this.formatTime(new Date())
      };
      
      this.setData({
        messages: [...this.data.messages, errorMsg]
      }, () => {
        this.scrollToBottom();
      });
      
      wx.showToast({
        title: '请求失败',
        icon: 'none',
        duration: 2000
      });
    } finally {
      this.setData({ 
        isLoading: false,
        autoFocus: true,
        canSend: this.data.inputValue.trim().length > 0
      });
    }
  },

  /**
   * 调用AI API
   */
  callAIAPI(userInput) {
    return new Promise((resolve, reject) => {
      const config = this.data.apiConfig;
      const messages = this.buildMessageHistory(userInput);
      
      wx.showLoading({
        title: '思考中...',
        mask: true
      });
      
      wx.request({
        url: config.apiUrl,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        data: {
          model: config.model,
          messages: messages,
          max_tokens: 2000,
          temperature: 0.7,
          stream: false
        },
        success: (res) => {
          wx.hideLoading();
          
          if (res.statusCode === 200) {
            let aiResponse = '';
            if (res.data.choices && res.data.choices[0]) {
              aiResponse = res.data.choices[0].message.content;
            } else if (res.data.content) {
              aiResponse = res.data.content;
            } else {
              reject(new Error('API响应格式异常'));
              return;
            }
            resolve(aiResponse);
          } else {
            reject(new Error(`API请求失败: ${res.statusCode}`));
          }
        },
        fail: (error) => {
          wx.hideLoading();
          console.error('请求失败:', error);
          reject(new Error('网络请求失败'));
        }
      });
    });
  },

  /**
   * 构建消息历史
   */
  buildMessageHistory(userInput) {
    const messages = [];
    
    messages.push({
      role: 'system',
      content: '你是一个有用的AI助手，请用中文回答用户的问题。'
    });
    
    const recentMessages = this.data.messages.slice(-10);
    recentMessages.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });
    
    messages.push({
      role: 'user',
      content: userInput
    });
    
    return messages;
  },

  /**
   * 滚动到底部
   */
  scrollToBottom() {
    setTimeout(() => {
      this.setData({
        scrollTop: 999999
      });
    }, 100);
  },

  /**
   * 滚动事件处理
   */
  onScroll(e) {
    // 可在此处理滚动事件
  },

  /**
   * 清空对话
   */
  clearChat() {
    wx.showModal({
      title: '清空对话',
      content: '确定要清空所有对话记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            messages: [
              { 
                role: 'assistant', 
                content: '对话已清空，有什么可以帮你的？',
                time: this.formatTime(new Date())
              }
            ],
            scrollTop: 0,
            inputValue: '',
            isLoading: false,
            canSend: false
          });
          
          wx.showToast({
            title: '已清空',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  },

  /**
   * 复制消息
   */
  copyMessage(e) {
    const content = e.currentTarget.dataset.content;
    wx.setClipboardData({
      data: content,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success',
          duration: 1500
        });
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none',
          duration: 1500
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    if (this.data.messages.length > 1) {
      this.saveConversation();
    }
    
    this.setData({
      autoFocus: false
    });
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    if (this.data.messages.length > 1) {
      this.saveConversation();
    }
  },

  /**
   * 保存对话记录到本地
   */
  saveConversation() {
    try {
      const conversations = wx.getStorageSync('ai_conversations') || [];
      const conversation = {
        id: Date.now(),
        title: this.data.messages[1]?.content?.substring(0, 20) || '新对话',
        messages: this.data.messages,
        time: new Date().toISOString()
      };
      
      conversations.unshift(conversation);
      if (conversations.length > 50) {
        conversations.pop();
      }
      
      wx.setStorageSync('ai_conversations', conversations);
    } catch (error) {
      console.error('保存对话失败:', error);
    }
  },

  /**
   * 用户下拉刷新
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  }
});
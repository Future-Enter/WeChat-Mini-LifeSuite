// pages/index/index.js - 优化版
Page({
  
  // 页面数据
  data: {
      currentBubbleIndex: 0, 
      bubbles: [
          { id: 1, text: "你今天心情如何？🌤️", action: "chat", type: "greeting" },
          { id: 2, text: "需要查天气吗？☁️", action: "chat", type: "weather" },
          { id: 3, text: "有什么想和我聊的吗？💭", action: "chat", type: "invitation" },
          { id: 4, text: "想看什么电影？🎬", action: "chat", type: "film" },
          { id: 5, text: "今日待办都完成了吗？✅", action: "chat", type: "todo" },
      ],
      bubbleTimer: null,
      activeNav: null // 记录当前活跃的导航项
  },

  // 页面加载时执行
  onLoad() {
      // 启动气泡自动切换
      this.startBubbleCycle();
  },

  // 页面显示时执行
  onShow() {
      // 重置导航激活状态
      this.setData({ activeNav: null });
  },

  // 页面销毁时执行
  onUnload() {
      // 清除定时器
      if (this.data.bubbleTimer) {
          clearInterval(this.data.bubbleTimer);
      }
  },

  // 气泡自动轮播逻辑优化
  startBubbleCycle() {
      const timer = setInterval(() => {
          let nextIndex = (this.data.currentBubbleIndex + 1) % this.data.bubbles.length;
          this.setData({
              currentBubbleIndex: nextIndex
          });
      }, 5000); // 缩短为5秒切换，更活跃

      this.setData({
          bubbleTimer: timer
      });
  },

  // 气泡点击事件优化
  handleBubbleTap(e) {
      const bubble = e.currentTarget.dataset.bubble;
      
      // 添加点击动画反馈
      this.setData({
          currentBubbleIndex: (this.data.currentBubbleIndex + 1) % this.data.bubbles.length
      });
      
      setTimeout(() => {
          wx.navigateTo({
              url: `/pages/chat/chat?initialMsg=${encodeURIComponent(bubble.text)}&type=${bubble.type}`
          });
      }, 150);
  },
// 新增触摸反馈方法
handleTouchStart(e) {
  const target = e.currentTarget.dataset.target;
  // 可以在这里添加额外的触摸开始反馈
},

handleTouchEnd(e) {
  const target = e.currentTarget.dataset.target;
  // 可以在这里添加额外的触摸结束反馈
},
  // 底部导航点击事件优化
  navigateToPage(e) {
      const target = e.currentTarget.dataset.target;
      
      // 设置当前活跃的导航项
      this.setData({
          activeNav: target
      });
      
      // 添加导航点击动画延迟
      setTimeout(() => {
          wx.navigateTo({
              url: `/pages/${target}/${target}`
          });
      }, 200);
  }
});
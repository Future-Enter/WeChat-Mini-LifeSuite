// index.js - 明亮主题
Page({
  data: {
    // 眼睛相关数据
    leftEyeStyle: '',
    rightEyeStyle: '',
    eyeStateText: '正常',
    eyeStateColor: '#4CAF50',
    
    // 眼睛行为参数
    eyeBehaviorInterval: null,
    blinkInterval: null,
    currentEyeState: 'normal',
    isBlinking: false,
    
    // 气泡相关数据
    currentBubbleIndex: 0,
    bubbles: [
      { id: 1, text: "嘿！我在这儿呢", type: "greeting" },
      { id: 2, text: "今天天气不错，想出去走走吗？", type: "weather" },
      { id: 3, text: "猜猜我现在在看什么方向？", type: "game" },
      { id: 4, text: "需要我帮你关注些什么吗？", type: "assist" },
      { id: 5, text: "点击气泡和我互动吧！", type: "instruction" }
    ],
    bubbleAnimation: '',
    bubbleTimer: null,
    
    // 快速回复
    showQuickReplies: false,
    quickReplies: [
      { id: 1, text: "你好！" },
      { id: 2, text: "今天天气如何？" },
      { id: 3, text: "有什么推荐？" },
      { id: 4, text: "谢谢你！" }
    ],
    
    // 导航相关
    activeNav: null,
    navNotifications: {
      weather: false,
      film: true,
      todo: true,
      profile: false
    },
    
    // 互动提示
    showInteractionHint: true
  },

  onLoad() {
    // 初始化眼睛
    this.initializeEyes();
    
    // 启动气泡轮播
    this.startBubbleCycle();
    
    // 启动眼睛自驱动逻辑
    this.startEyeAutoBehavior();
    
    // 显示互动提示（5秒后消失）
    setTimeout(() => {
      this.setData({ showInteractionHint: false });
    }, 5000);
  },

  onShow() {
    // 页面显示时重新激活眼睛行为
    if (!this.data.eyeBehaviorInterval) {
      this.startEyeAutoBehavior();
    }
    
    // 重置导航状态
    this.setData({ activeNav: null });
  },

  onHide() {
    // 页面隐藏时暂停眼睛行为
    this.pauseEyeAutoBehavior();
  },

  onUnload() {
    // 清理所有定时器
    this.pauseEyeAutoBehavior();
    if (this.data.bubbleTimer) {
      clearInterval(this.data.bubbleTimer);
    }
  },

  // 初始化眼睛
  initializeEyes() {
    const baseWidth = 40;
    const baseHeight = 80;
    
    const leftStyle = `width: ${baseWidth}rpx; height: ${baseHeight}rpx; left: 30%; transform: translateX(-50%);`;
    const rightStyle = `width: ${baseWidth}rpx; height: ${baseHeight}rpx; right: 30%; transform: translateX(50%);`;
    
    this.setData({
      leftEyeStyle: leftStyle,
      rightEyeStyle: rightStyle
    });
  },

  // 启动眼睛自驱动行为
  startEyeAutoBehavior() {
    // 随机行为间隔：2-6秒
    const behaviorTimer = setInterval(() => {
      if (!this.data.isBlinking) {
        this.performRandomEyeAction();
      }
    }, 2000 + Math.random() * 4000);
    
    // 眨眼间隔：3-8秒
    const blinkTimer = setInterval(() => {
      this.performBlink();
    }, 3000 + Math.random() * 5000);
    
    this.setData({
      eyeBehaviorInterval: behaviorTimer,
      blinkInterval: blinkTimer
    });
  },

  // 暂停眼睛自驱动行为
  pauseEyeAutoBehavior() {
    if (this.data.eyeBehaviorInterval) {
      clearInterval(this.data.eyeBehaviorInterval);
    }
    if (this.data.blinkInterval) {
      clearInterval(this.data.blinkInterval);
    }
    this.setData({
      eyeBehaviorInterval: null,
      blinkInterval: null
    });
  },

  // 执行随机眼睛动作
  performRandomEyeAction() {
    const actions = [
      { type: 'lookLeft', text: '向左看', color: '#2196F3' },
      { type: 'lookRight', text: '向右看', color: '#2196F3' },
      { type: 'lookUp', text: '向上看', color: '#2196F3' },
      { type: 'lookDown', text: '向下看', color: '#2196F3' },
      { type: 'wideEyes', text: '好奇', color: '#FF9800' },
      { type: 'crossEyes', text: '对眼', color: '#E91E63' },
      { type: 'sleepy', text: '困倦', color: '#9C27B0' },
      { type: 'normal', text: '正常', color: '#4CAF50' }
    ];
    
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    this.changeEyeState(randomAction);
  },

  // 改变眼睛状态
  changeEyeState(action) {
    const baseWidth = 40;
    const baseHeight = 80;
    
    let leftStyle = '';
    let rightStyle = '';
    
    switch(action.type) {
      case 'lookLeft':
        leftStyle = `width: ${baseWidth}rpx; height: ${baseHeight}rpx; left: 25%; transform: translateX(-50%);`;
        rightStyle = `width: ${baseWidth}rpx; height: ${baseHeight}rpx; right: 35%; transform: translateX(50%);`;
        break;
        
      case 'lookRight':
        leftStyle = `width: ${baseWidth}rpx; height: ${baseHeight}rpx; left: 35%; transform: translateX(-50%);`;
        rightStyle = `width: ${baseWidth}rpx; height: ${baseHeight}rpx; right: 25%; transform: translateX(50%);`;
        break;
        
      case 'lookUp':
        leftStyle = `width: ${baseWidth}rpx; height: ${baseHeight}rpx; left: 30%; transform: translate(-50%, -20rpx);`;
        rightStyle = `width: ${baseWidth}rpx; height: ${baseHeight}rpx; right: 30%; transform: translate(50%, -20rpx);`;
        break;
        
      case 'lookDown':
        leftStyle = `width: ${baseWidth}rpx; height: ${baseHeight}rpx; left: 30%; transform: translate(-50%, 20rpx);`;
        rightStyle = `width: ${baseWidth}rpx; height: ${baseHeight}rpx; right: 30%; transform: translate(50%, 20rpx);`;
        break;
        
      case 'wideEyes':
        leftStyle = `width: ${35}rpx; height: ${90}rpx; left: 30%; transform: translateX(-50%);`;
        rightStyle = `width: ${35}rpx; height: ${90}rpx; right: 30%; transform: translateX(50%);`;
        break;
        
      case 'crossEyes':
        leftStyle = `width: ${baseWidth}rpx; height: ${baseHeight}rpx; left: 40%; transform: translateX(-50%);`;
        rightStyle = `width: ${baseWidth}rpx; height: ${baseHeight}rpx; right: 40%; transform: translateX(50%);`;
        break;
        
      case 'sleepy':
        leftStyle = `width: ${45}rpx; height: ${60}rpx; left: 30%; transform: translateX(-50%) rotate(15deg);`;
        rightStyle = `width: ${45}rpx; height: ${60}rpx; right: 30%; transform: translateX(50%) rotate(-15deg);`;
        break;
        
      case 'normal':
      default:
        leftStyle = `width: ${baseWidth}rpx; height: ${baseHeight}rpx; left: 30%; transform: translateX(-50%);`;
        rightStyle = `width: ${baseWidth}rpx; height: ${baseHeight}rpx; right: 30%; transform: translateX(50%);`;
        break;
    }
    
    this.setData({
      leftEyeStyle: leftStyle,
      rightEyeStyle: rightStyle,
      eyeStateText: action.text,
      eyeStateColor: action.color,
      currentEyeState: action.type
    });
  },

  // 执行眨眼
  performBlink() {
    if (this.data.isBlinking) return;
    
    this.setData({ isBlinking: true });
    
    // 保存当前样式
    const originalLeftStyle = this.data.leftEyeStyle;
    const originalRightStyle = this.data.rightEyeStyle;
    
    // 眨眼状态：高度变小
    const blinkLeftStyle = originalLeftStyle.replace(
      /height: (\d+)rpx/,
      'height: 8rpx'
    );
    const blinkRightStyle = originalRightStyle.replace(
      /height: (\d+)rpx/,
      'height: 8rpx'
    );
    
    this.setData({
      leftEyeStyle: blinkLeftStyle,
      rightEyeStyle: blinkRightStyle,
      eyeStateText: '眨眼',
      eyeStateColor: '#FFC107'
    });
    
    // 300ms后恢复
    setTimeout(() => {
      this.setData({
        leftEyeStyle: originalLeftStyle,
        rightEyeStyle: originalRightStyle,
        isBlinking: false,
        eyeStateText: this.data.currentEyeState === 'normal' ? '正常' : 
                     this.data.currentEyeState === 'lookLeft' ? '向左看' :
                     this.data.currentEyeState === 'lookRight' ? '向右看' :
                     this.data.currentEyeState === 'lookUp' ? '向上看' :
                     this.data.currentEyeState === 'lookDown' ? '向下看' :
                     this.data.currentEyeState === 'wideEyes' ? '好奇' :
                     this.data.currentEyeState === 'crossEyes' ? '对眼' :
                     this.data.currentEyeState === 'sleepy' ? '困倦' : '正常',
        eyeStateColor: this.data.currentEyeState === 'normal' ? '#4CAF50' :
                      this.data.currentEyeState.includes('look') ? '#2196F3' :
                      this.data.currentEyeState === 'wideEyes' ? '#FF9800' :
                      this.data.currentEyeState === 'crossEyes' ? '#E91E63' :
                      this.data.currentEyeState === 'sleepy' ? '#9C27B0' : '#4CAF50'
      });
    }, 300);
  },

  // 启动气泡轮播
  startBubbleCycle() {
    const bubbleTimer = setInterval(() => {
      const nextIndex = (this.data.currentBubbleIndex + 1) % this.data.bubbles.length;
      this.setData({ 
        currentBubbleIndex: nextIndex,
        bubbleAnimation: 'bubble-pop'
      });
      
      // 重置动画类
      setTimeout(() => {
        this.setData({ bubbleAnimation: '' });
      }, 400);
      
      // 随机显示快速回复
      if (Math.random() > 0.5) {
        this.setData({ showQuickReplies: true });
      }
    }, 6000);
    
    this.setData({ bubbleTimer });
  },

  // 气泡点击事件
  handleBubbleTap(e) {
    const bubble = e.currentTarget.dataset.bubble;
    
    // 气泡点击动画
    this.setData({ 
      bubbleAnimation: 'bubble-pop',
      showQuickReplies: false
    });
    
    // 眼睛对点击做出反应
    this.eyesReactToInteraction();
    
    // 切换气泡内容
    setTimeout(() => {
      const nextIndex = (this.data.currentBubbleIndex + 1) % this.data.bubbles.length;
      this.setData({ 
        currentBubbleIndex: nextIndex,
        bubbleAnimation: ''
      });
    }, 300);
  },

  // 眼睛对互动做出反应
  eyesReactToInteraction() {
    // 快速眨眼两次
    setTimeout(() => this.performBlink(), 0);
    setTimeout(() => this.performBlink(), 400);
    
    // 随机看向一个方向
    setTimeout(() => {
      const reactions = ['lookLeft', 'lookRight', 'wideEyes', 'crossEyes'];
      const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
      
      const actionMap = {
        'lookLeft': { type: 'lookLeft', text: '向左看', color: '#2196F3' },
        'lookRight': { type: 'lookRight', text: '向右看', color: '#2196F3' },
        'wideEyes': { type: 'wideEyes', text: '好奇', color: '#FF9800' },
        'crossEyes': { type: 'crossEyes', text: '对眼', color: '#E91E63' }
      };
      
      this.changeEyeState(actionMap[randomReaction]);
      
      // 3秒后恢复
      setTimeout(() => {
        this.changeEyeState({ type: 'normal', text: '正常', color: '#4CAF50' });
      }, 3000);
    }, 800);
  },

  // 快速回复点击
  handleQuickReply(e) {
    const index = e.currentTarget.dataset.index;
    const reply = this.data.quickReplies[index];
    
    // 眼睛对回复做出反应
    this.eyesReactToReply(reply.text);
    
    // 隐藏快速回复
    this.setData({ showQuickReplies: false });
    
    // 根据回复内容切换气泡
    let newBubbleIndex = 0;
    if (reply.text.includes("天气")) {
      newBubbleIndex = 1;
    } else if (reply.text.includes("推荐")) {
      newBubbleIndex = 3;
    } else if (reply.text.includes("谢谢")) {
      newBubbleIndex = 4;
    }
    
    setTimeout(() => {
      this.setData({ 
        currentBubbleIndex: newBubbleIndex,
        bubbleAnimation: 'bubble-pop'
      });
      
      setTimeout(() => {
        this.setData({ bubbleAnimation: '' });
      }, 400);
    }, 500);
  },

  // 眼睛对回复做出反应
  eyesReactToReply(replyText) {
    let reactionType = 'normal';
    
    if (replyText.includes("你好")) {
      reactionType = 'wideEyes';
    } else if (replyText.includes("天气")) {
      reactionType = 'lookUp';
    } else if (replyText.includes("谢谢")) {
      // 开心眨眼三次
      setTimeout(() => this.performBlink(), 0);
      setTimeout(() => this.performBlink(), 300);
      setTimeout(() => this.performBlink(), 600);
      reactionType = 'wideEyes';
    }
    
    const actionMap = {
      'wideEyes': { type: 'wideEyes', text: '开心', color: '#FF9800' },
      'lookUp': { type: 'lookUp', text: '看天气', color: '#2196F3' }
    };
    
    if (actionMap[reactionType]) {
      setTimeout(() => {
        this.changeEyeState(actionMap[reactionType]);
        
        // 5秒后恢复
        setTimeout(() => {
          this.changeEyeState({ type: 'normal', text: '正常', color: '#4CAF50' });
        }, 5000);
      }, 500);
    }
  },

  // 导航触摸开始
  handleNavTouchStart(e) {
    const target = e.currentTarget.dataset.target;
    this.setData({ activeNav: target });
    
    // 眼睛看向导航方向
    const navPositions = {
      'weather': 'lookUp',
      'film': 'lookRight',
      'todo': 'lookDown',
      'profile': 'lookLeft'
    };
    
    if (navPositions[target]) {
      const actionMap = {
        'lookUp': { type: 'lookUp', text: '向上看', color: '#2196F3' },
        'lookRight': { type: 'lookRight', text: '向右看', color: '#2196F3' },
        'lookDown': { type: 'lookDown', text: '向下看', color: '#2196F3' },
        'lookLeft': { type: 'lookLeft', text: '向左看', color: '#2196F3' }
      };
      
      this.changeEyeState(actionMap[navPositions[target]]);
    }
  },

  // 导航触摸结束
  handleNavTouchEnd(e) {
    // 短暂保持状态后恢复
    setTimeout(() => {
      if (this.data.activeNav) {
        this.changeEyeState({ type: 'normal', text: '正常', color: '#4CAF50' });
      }
    }, 1000);
  },

  // 导航到页面
  navigateToPage(e) {
    const target = e.currentTarget.dataset.target;
    
    // 清除导航通知
    const newNotifications = { ...this.data.navNotifications };
    newNotifications[target] = false;
    
    this.setData({
      navNotifications: newNotifications
    });
    
    // 导航前眼睛反应
    this.performBlink();
    
    setTimeout(() => {
      wx.navigateTo({
        url: `/pages/${target}/${target}`
      });
    }, 500);
  }
});
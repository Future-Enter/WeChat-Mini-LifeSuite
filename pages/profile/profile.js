Page({
  data: {
    isLogin: false,
    userInfo: null,
    stats: {
      favorites: 12,
      comments: 8,
      likes: 24
    }
  },

  onLoad() {
    // 检查本地存储是否有登录状态
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        isLogin: true,
        userInfo: userInfo
      });
    }
  },

  // 获取用户信息
  onGetUserInfo(e) {
    if (e.detail.userInfo) {
      const userInfo = e.detail.userInfo;
      this.setData({
        isLogin: true,
        userInfo: userInfo
      });
      
      // 保存到本地存储
      wx.setStorageSync('userInfo', userInfo);
      
      // 显示登录成功提示
      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1500
      });
    } else {
      wx.showToast({
        title: '授权失败',
        icon: 'none',
        duration: 1500
      });
    }
  },

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储
          wx.removeStorageSync('userInfo');
          
          // 更新页面状态
          this.setData({
            isLogin: false,
            userInfo: null
          });
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  },

});
// filmDetail.js
Page({
  data: {
    filmId: '',
    filmData: {},
    isLoading: true,
    isSummaryExpanded: false,
    summaryMaxLength: 150  // 收起时显示的最大字符数
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ filmId: options.id });
      this.loadFilmDetail(options.id);
    }
  },

  // 加载电影详情
  loadFilmDetail(id) {
    this.setData({ isLoading: true });
    
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    
    wx.request({
      url: 'http://localhost:5000/api/douban/movie', // 替换为你的API地址
      method: 'GET',
      data: { id: id },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200 && res.data.code === 200) {
          const filmData = res.data.data;
          
          // 处理评分显示
          if (filmData.stars) {
            filmData.stars = parseFloat(filmData.stars) || 0;
          }
          
          this.setData({
            filmData: filmData,
            isLoading: false
          });
          
          // 动态设置导航栏标题为电影名字
          wx.setNavigationBarTitle({
            title: filmData.title || '电影详情'
          });
        } else {
          this.showError('加载失败');
          wx.setNavigationBarTitle({
            title: '电影详情'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('请求失败:', err);
        this.showError('网络错误');
        this.setData({ isLoading: false });
        wx.setNavigationBarTitle({
          title: '电影详情'
        });
      }
    });
  },

  // 切换简介展开状态
  toggleSummary() {
    this.setData({
      isSummaryExpanded: !this.data.isSummaryExpanded
    });
  },

  // 预览图片
  previewImage(e) {
    const index = e.currentTarget.dataset.index;
    const urls = this.data.filmData.photos || [];
    
    wx.previewImage({
      current: urls[index],
      urls: urls
    });
  },

  // 显示错误提示
  showError(msg) {
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 2000
    });
  },

  onShareAppMessage() {
    return {
      title: this.data.filmData.title || '电影推荐',
      path: `/pages/filmDetail/filmDetail?id=${this.data.filmId}`
    };
  }
});
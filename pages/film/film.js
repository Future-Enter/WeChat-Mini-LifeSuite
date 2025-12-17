// film.js
Page({
  data: {
    filmList: [],        // 电影列表
    currentPage: 0,      // 当前页数
    pageSize: 30,        // 每页显示数量
    isLoading: false,    // 是否正在加载
    hasMore: true,       // 是否有更多数据
  },

  onLoad() {
    this.loadFilms();
  },

  // 格式化人数显示
  formatCount(count) {
    if (!count) return '0';
    if (count >= 10000) {
      return (count / 10000).toFixed(1) + '万';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + '千';
    }
    return count;
  },

  // 加载电影数据
  loadFilms() {
    if (this.data.isLoading || !this.data.hasMore) return;
    
    this.setData({ isLoading: true });
    
    const { currentPage, pageSize } = this.data;
    const start = currentPage * (pageSize / 25); // 转换为API的start参数
    
    wx.request({
      url: 'http://ip:5000/api/douban/list', // 替换为你的API地址
      method: 'GET',
      data: {
        listname: 'top250',
        start: start
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          const newFilms = res.data.data.list || [];
          const totalFilms = res.data.data.total || 0;
          const currentTotal = this.data.filmList.length + newFilms.length;
          
          // 添加排名序号
          const processedFilms = newFilms.map((film, index) => ({
            ...film,
            no: this.data.filmList.length + index + 1,
            rating_count: film.rating_count || 0
          }));
          
          this.setData({
            filmList: [...this.data.filmList, ...processedFilms],
            currentPage: this.data.currentPage + 1,
            hasMore: currentTotal < 250, // TOP250最多250部
            isLoading: false
          });
        } else {
          this.showError('加载失败，请重试');
          this.setData({ isLoading: false });
        }
      },
      fail: (err) => {
        console.error('请求失败:', err);
        this.showError('网络错误，请检查连接');
        this.setData({ isLoading: false });
      }
    });
  },

  // 上拉加载更多
  loadMore() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.loadFilms();
    }
  },

  // 跳转到详情页
  goToDetail(e) {
    const filmId = e.currentTarget.dataset.id;
    if (filmId) {
      wx.navigateTo({
        url: `/pages/filmDetail/filmDetail?id=${filmId}`
      });
    }
  },

  // 显示错误提示
  showError(msg) {
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 2000
    });
  },

  onPullDownRefresh() {
    // 下拉刷新
    this.setData({
      filmList: [],
      currentPage: 0,
      hasMore: true
    });
    
    this.loadFilms();
    
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});
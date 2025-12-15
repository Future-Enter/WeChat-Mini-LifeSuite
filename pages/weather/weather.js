// pages/weather/weather.js
Page({
  data: {
    LocationName: "道外区",
    LocationId: "101050101",
    API_Host: "https://nj3aapyvm6.re.qweatherapi.com",
    API_key: "f889a2b2c7ab4251aef91dac3a9f6e12",
    formData: {
      province: "",
      city: ""
    },
    weatherInfo: null,
    dailyForecast: [],
  },
  
  onLoad(options) {
    // 页面加载时获取默认城市的天气
    this.getWeatherData(this.data.LocationId);
    this.get7DayForecast(this.data.LocationId);
  },
  
  onInputChange: function(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`formData.${field}`]: e.detail.value
    });
  },
  
  searchCity: function(e) {
    const { province, city } = e.detail.value;
    
    if (!province || !city) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ 
      isLoading: true,
      formData: { province, city }
    });
    
    this.searchCityId(province, city);
  },
  
  searchCityId: function(province, city) {
    const that = this;
    
    wx.request({
      url: `${this.data.API_Host}/geo/v2/city/lookup`,
      method: 'GET',
      data: {
        key: this.data.API_key,
        location: city,
        adm: province,
        number: 1
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.location && res.data.location.length > 0) {
          const location = res.data.location[0];
          that.setData({
            LocationId: location.id,
            LocationName: location.name
          });
          
          // 获取当前天气和7天预报
          that.getWeatherData(location.id);
          that.get7DayForecast(location.id);
          
        } else {
          wx.showToast({
            title: '未找到该城市',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('请求失败:', err);
        wx.showToast({
          title: '查询失败',
          icon: 'none'
        });
      },
      complete: () => {
        that.setData({ isLoading: false });
      }
    });
  },
  
  getWeatherData: function(locationId) {
    const that = this;
    
    wx.request({
      url: `${this.data.API_Host}/v7/weather/now`,
      method: 'GET',
      data: {
        location: locationId,
        key: this.data.API_key,
        lang: 'zh',
        unit: 'm'
      },
      success: (res) => {
        console.log('当前天气API响应:', res.data);
        
        if (res.statusCode === 200 && res.data && res.data.code === '200') {
          const weatherData = res.data;
          const iconCode = weatherData.now.icon;
          
          // 格式化天气数据
          const weatherInfo = {
            temperature: weatherData.now.temp,
            feelsLike: weatherData.now.feelsLike,
            weather: weatherData.now.text,
            icon: iconCode,
            windDirection: weatherData.now.windDir,
            windSpeed: weatherData.now.windSpeed,
            humidity: weatherData.now.humidity,
            pressure: weatherData.now.pressure,
            visibility: weatherData.now.vis,
            updateTime: weatherData.updateTime,
            obsTime: weatherData.now.obsTime,
          };
          
          that.setData({
            weatherInfo: weatherInfo
          });
          
        } else {
          const errorMsg = res.data ? (res.data.message || `错误代码: ${res.data.code}`) : '未知错误';
          wx.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        console.error('天气请求失败:', err);
        wx.showToast({
          title: '网络连接失败',
          icon: 'none'
        });
      }
    });
  },
  
  get7DayForecast: function(locationId) {
    const that = this;
    
    wx.request({
      url: `${this.data.API_Host}/v7/weather/7d`,
      method: 'GET',
      data: {
        location: locationId,
        key: this.data.API_key,
        lang: 'zh',
        unit: 'm'
      },
      success: (res) => {
        console.log('7天预报API响应:', res.data);
        
        if (res.statusCode === 200 && res.data && res.data.code === '200') {
          const forecastData = res.data.daily;
          
          // 格式化7天预报数据
          const dailyForecast = forecastData.map((day, index) => {
            const date = new Date(day.fxDate);
            const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
            const dayOfWeek = weekDays[date.getDay()];
            const monthDay = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            
            // 根据图标代码选择模板
            const template = that.chooseTemplate(day.iconDay);
            
            return {
              date: monthDay,
              week: dayOfWeek,
              weather: day.textDay,
              weatherNight: day.textNight,
              tempMax: day.tempMax,
              tempMin: day.tempMin,
              iconDay: day.iconDay,
              iconNight: day.iconNight,
              windDirDay: day.windDirDay,
              windScaleDay: day.windScaleDay,
              humidity: day.humidity,
              precip: day.precip,
              template: template, // 添加模板类型
              isToday: index === 0,
              isTomorrow: index === 1
            };
          });
          
          that.setData({
            dailyForecast: dailyForecast
          });
          
        } else {
          console.error('7天预报数据错误:', res.data);
        }
      },
      fail: (err) => {
        console.error('7天预报请求失败:', err);
      }
    });
  },
  
  chooseTemplate: function(iconCode) {
    const code = parseInt(iconCode);
    
    if (isNaN(code)) {
      return "default";
    }
    
    // 获取百位数
    const hundred = Math.floor(code / 100);
    
    // 根据百位数选择模板
    switch(hundred) {
      case 1: // 晴、多云、少云、晴间多云
        if (code === 100) return "sunny"; // 晴
        if (code >= 101 && code <= 104) return "cloudy"; // 多云
        return "sunny";
      case 3: // 雨相关
        return "rainy";
      case 4: // 雪相关
        return "snowy";
      case 5: // 雾、霾、沙尘
        return "foggy";
      default:
        return "default";
    }
  },
  
  onPullDownRefresh: function() {
    this.getWeatherData(this.data.LocationId);
    this.get7DayForecast(this.data.LocationId);
    
    setTimeout(() => {
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1500
      });
    }, 1000);
  },
  onScroll: function(e) {
    const scrollLeft = e.detail.scrollLeft;
    const scrollWidth = e.detail.scrollWidth;
    const clientWidth = e.detail.clientWidth;
    
    // 计算当前显示的索引
    const itemWidth = 200; // 每个项目的宽度，根据实际CSS调整
    const currentIndex = Math.round(scrollLeft / itemWidth);
    
    if (currentIndex !== this.data.currentScrollIndex) {
      this.setData({
        currentScrollIndex: currentIndex
      });
      this.updateScrollIndicator(currentIndex);
    }
  },
  
  // 更新滚动指示器
  updateScrollIndicator: function(currentIndex) {
    const indicatorDots = [false, false, false];
    // 简单实现：最多显示3个点，根据当前索引激活对应的点
    indicatorDots[Math.min(currentIndex, 2)] = true;
    
    this.setData({
      indicatorDots: indicatorDots
    });
  },
  
  // 手动滑动到指定位置
  scrollToIndex: function(index) {
    const itemWidth = 200; // 每个项目的宽度
    this.setData({
      scrollLeft: index * itemWidth
    });
  },
});
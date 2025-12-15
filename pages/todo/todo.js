Page({
  data: {
    todos: [
      { id: 1, text: "完成项目报告", completed: false },
      { id: 2, text: "购买生活用品", completed: true },
      { id: 3, text: "预约医生", completed: true },
      { id: 4, text: "阅读书籍30分钟", completed: false },
      { id: 5, text: "运动健身", completed: false }
    ],
    
    // 滑动相关数据
    touchStartX: 0,           // 触摸起始X坐标
    touchStartY: 0,           // 触摸起始Y坐标
    touchStartTime: 0,        // 触摸开始时间
    currentIndex: -1,         // 当前触摸的卡片索引
    slideThreshold: 60,       // 滑动触发阈值（像素）
    actionThreshold: 100,     // 操作触发阈值（像素）
    maxSlideDistance: 200,    // 最大滑动距离
    
    // 统计数据
    completedCount: 0,        // 已完成数量
    progressPercent: 0,       // 进度百分比
    progressAngle: 0          // 进度条角度
  },

  onLoad: function() {
    // 计算统计数据
    this.calculateStats();
    
    // 为每个待办项添加滑动相关属性
    const todos = this.data.todos.map(todo => ({
      ...todo,
      swipeOffset: 0,
      showComplete: false,
      showDelete: false,
      swipeClass: ''
    }));
    
    this.setData({ todos });
  },

  // 计算统计数据
  calculateStats: function() {
    const todos = this.data.todos;
    const completedCount = todos.filter(todo => todo.completed).length;
    const totalCount = todos.length;
    
    // 计算百分比和角度
    let progressPercent = 0;
    let progressAngle = 0;
    
    if (totalCount > 0) {
      progressPercent = Math.round((completedCount / totalCount) * 100);
      progressAngle = (completedCount / totalCount) * 360;
    }
    
    this.setData({
      completedCount: completedCount,
      progressPercent: progressPercent,
      progressAngle: progressAngle
    });
  },

  // 长按事件处理
  onLongPress: function(e) {
    const index = e.currentTarget.dataset.index;
    const todo = this.data.todos[index];
    
    // 震动反馈
    wx.vibrateShort();
    
    // 显示操作菜单
    wx.showActionSheet({
      itemList: ['编辑', todo.completed ? '标记为未完成' : '标记为完成', '删除'],
      success: (res) => {
        switch(res.tapIndex) {
          case 0: // 编辑
            this.editTodo(index);
            break;
          case 1: // 切换状态
            this._toggleTodoStatus(index);
            break;
          case 2: // 删除
            this._confirmDelete(index);
            break;
        }
      },
      fail: (err) => {
        console.log('用户取消操作', err);
      }
    });
  },

  // 编辑待办事项
  editTodo: function(index) {
    const todo = this.data.todos[index];
    
    wx.showModal({
      title: '编辑待办事项',
      content: '修改待办事项内容',
      editable: true,
      placeholderText: '请输入待办事项...',
      defaultValue: todo.text,
      success: (res) => {
        if (res.confirm && res.content && res.content.trim()) {
          const todos = [...this.data.todos];
          todos[index].text = res.content.trim();
          this.setData({ todos });
          
          wx.showToast({
            title: '修改成功',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  },

  // 切换待办事项完成状态
  toggleTodo: function(e) {
    e.stopPropagation();
    const index = e.currentTarget.dataset.index;
    if (index === undefined || index === null) {
      console.error("未获取到索引！");
      return;
    }
    
    const todos = this.data.todos;
    if (!todos[index]) {
      console.error("索引无效！");
      return;
    }
    
    this._toggleTodoStatus(index);
  },

  // 实际切换状态逻辑
  _toggleTodoStatus: function(index) {
    const todos = [...this.data.todos];
    const wasCompleted = todos[index].completed;
    todos[index].completed = !wasCompleted;
    
    this.setData({ 
      todos: todos 
    }, () => {
      // 更新统计数据
      this.calculateStats();
    });
    
    // 显示操作提示
    const action = wasCompleted ? '已恢复' : '已完成';
    wx.showToast({
      title: action,
      icon: 'success',
      duration: 1000
    });
    
    // 震动反馈
    wx.vibrateShort();
  },

  // 点击删除按钮
  deleteTodo: function(e) {
    e.stopPropagation();
    const index = e.currentTarget.dataset.index;
    if (index === undefined) return;
    
    this._confirmDelete(index);
  },

  // 滑动确认删除
  confirmDelete: function(e) {
    e.stopPropagation();
    const index = e.currentTarget.dataset.index;
    if (index === undefined) return;
    
    this._confirmDelete(index);
  },

  // 滑动确认完成
  confirmComplete: function(e) {
    e.stopPropagation();
    const index = e.currentTarget.dataset.index;
    if (index === undefined) return;
    
    this._toggleTodoStatus(index);
    this.resetSlide(index);
  },

  // 确认删除
  _confirmDelete: function(index) {
    const todoText = this.data.todos[index].text;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除"${todoText}"吗？`,
      confirmColor: '#ff3b30',
      cancelColor: '#999',
      success: (res) => {
        if (res.confirm) {
          this._removeTodo(index);
        } else {
          // 取消删除，恢复原位
          this.resetSlide(index);
        }
      }
    });
  },

  // 实际删除逻辑
  _removeTodo: function(index) {
    const todos = [...this.data.todos];
    todos.splice(index, 1);
    
    this.setData({ 
      todos: todos 
    }, () => {
      // 更新统计数据
      this.calculateStats();
    });
    
    wx.showToast({
      title: '删除成功',
      icon: 'success',
      duration: 1500
    });
    
    // 震动反馈
    wx.vibrateShort();
  },

  // 触摸开始事件
  onTouchStart: function(e) {
    const touch = e.touches[0];
    const index = e.currentTarget.dataset.index;
    
    this.setData({
      touchStartX: touch.pageX,
      touchStartY: touch.pageY,
      touchStartTime: Date.now(),
      currentIndex: index
    });
  },

  // 触摸移动事件
  onTouchMove: function(e) {
    const touch = e.touches[0];
    const index = e.currentTarget.dataset.index;
    
    // 只处理当前触摸的卡片
    if (index !== this.data.currentIndex) return;
    
    const deltaX = touch.pageX - this.data.touchStartX;
    const deltaY = touch.pageY - this.data.touchStartY;
    
    // 如果垂直滑动距离大于水平距离，认为是垂直滚动，不处理滑动
    if (Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
      return;
    }
    
    // 计算滑动距离，限制最大滑动距离
    const maxSlide = this.data.maxSlideDistance;
    let swipeOffset = deltaX;
    
    // 根据方向限制滑动距离
    if (swipeOffset > 0) {
      // 向右滑动（正方向）
      swipeOffset = Math.min(swipeOffset, maxSlide);
    } else {
      // 向左滑动（负方向）
      swipeOffset = Math.max(swipeOffset, -maxSlide);
    }
    
    // 更新滑动状态
    this.setData({
      [`todos[${index}].swipeOffset`]: swipeOffset,
      [`todos[${index}].showComplete`]: swipeOffset > this.data.slideThreshold,
      [`todos[${index}].showDelete`]: swipeOffset < -this.data.slideThreshold
    });
    
    // 阻止事件冒泡，避免干扰页面滚动
    e.stopPropagation();
  },

  // 触摸结束事件
  onTouchEnd: function(e) {
    const index = e.currentTarget.dataset.index;
    if (index !== this.data.currentIndex) return;
    
    const todo = this.data.todos[index];
    const slideOffset = todo.swipeOffset || 0;
    const touchDuration = Date.now() - this.data.touchStartTime;
    
    // 判断滑动方向
    if (slideOffset > 0) {
      // 向右滑动
      if (Math.abs(slideOffset) >= this.data.actionThreshold) {
        // 触发滑动完成动画
        this.triggerSlideComplete(index);
      } else if (Math.abs(slideOffset) >= this.data.slideThreshold) {
        // 保持在滑动位置
        this.setData({
          [`todos[${index}].showComplete`]: true
        });
      } else {
        // 恢复原位
        this.resetSlide(index);
      }
    } else if (slideOffset < 0) {
      // 向左滑动
      if (Math.abs(slideOffset) >= this.data.actionThreshold) {
        // 触发滑动删除动画
        this.triggerSlideDelete(index);
      } else if (Math.abs(slideOffset) >= this.data.slideThreshold) {
        // 保持在滑动位置
        this.setData({
          [`todos[${index}].showDelete`]: true
        });
      } else {
        // 恢复原位
        this.resetSlide(index);
      }
    } else {
      // 没有滑动
      // 如果滑动距离很小且时间很短，视为点击
      if (Math.abs(slideOffset) < 10 && touchDuration < 200) {
        // 短时间点击，切换完成状态
        this._toggleTodoStatus(index);
      } else {
        // 恢复原位
        this.resetSlide(index);
      }
    }
    
    // 重置当前触摸索引
    this.setData({
      currentIndex: -1
    });
  },

  // 触摸取消事件
  onTouchCancel: function(e) {
    const index = e.currentTarget.dataset.index;
    this.resetSlide(index);
    this.setData({
      currentIndex: -1
    });
  },

  // 触发滑动删除动画
  triggerSlideDelete: function(index) {
    this.setData({
      [`todos[${index}].swipeClass`]: 'slide-left'
    }, () => {
      // 动画完成后显示确认对话框
      setTimeout(() => {
        this._confirmDelete(index);
      }, 300);
    });
  },

  // 触发滑动完成动画
  triggerSlideComplete: function(index) {
    this.setData({
      [`todos[${index}].swipeClass`]: 'slide-right'
    }, () => {
      // 动画完成后触发完成操作
      setTimeout(() => {
        this._toggleTodoStatus(index);
        this.resetSlide(index);
      }, 300);
    });
  },

  // 恢复滑动位置
  resetSlide: function(index) {
    this.setData({
      [`todos[${index}].swipeOffset`]: 0,
      [`todos[${index}].showComplete`]: false,
      [`todos[${index}].showDelete`]: false,
      [`todos[${index}].swipeClass`]: 'slide-back'
    });
    
    // 300ms后清除动画类
    setTimeout(() => {
      this.setData({
        [`todos[${index}].swipeClass`]: ''
      });
    }, 300);
  },

  // 添加新待办
  addNewTodo: function() {
    wx.showModal({
      title: '添加新待办',
      content: '请输入待办事项内容',
      editable: true,
      placeholderText: '请输入待办事项...',
      success: (res) => {
        if (res.confirm && res.content && res.content.trim()) {
          const newTodo = {
            id: Date.now(),
            text: res.content.trim(),
            completed: false,
            swipeOffset: 0,
            showComplete: false,
            showDelete: false,
            swipeClass: ''
          };
          
          const todos = [newTodo, ...this.data.todos];
          this.setData({ 
            todos: todos 
          }, () => {
            // 更新统计数据
            this.calculateStats();
          });
          
          wx.showToast({
            title: '添加成功',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  }
});Page({
  data: {
    todos: [
      { id: 1, text: "完成项目报告", completed: false },
      { id: 2, text: "购买生活用品", completed: true },
      { id: 3, text: "预约医生", completed: true },
      { id: 4, text: "阅读书籍30分钟", completed: false },
      { id: 5, text: "运动健身", completed: false }
    ],
    
    // 滑动相关数据
    touchStartX: 0,           // 触摸起始X坐标
    touchStartY: 0,           // 触摸起始Y坐标
    touchStartTime: 0,        // 触摸开始时间
    currentIndex: -1,         // 当前触摸的卡片索引
    slideThreshold: 60,       // 滑动触发阈值（像素）
    actionThreshold: 100,     // 操作触发阈值（像素）
    maxSlideDistance: 200,    // 最大滑动距离
    
    // 统计数据
    completedCount: 0,        // 已完成数量
    progressPercent: 0,       // 进度百分比
    progressAngle: 0          // 进度条角度
  },

  onLoad: function() {
    // 计算统计数据
    this.calculateStats();
    
    // 为每个待办项添加滑动相关属性
    const todos = this.data.todos.map(todo => ({
      ...todo,
      swipeOffset: 0,
      showComplete: false,
      showDelete: false,
      swipeClass: ''
    }));
    
    this.setData({ todos });
  },

  // 计算统计数据
  calculateStats: function() {
    const todos = this.data.todos;
    const completedCount = todos.filter(todo => todo.completed).length;
    const totalCount = todos.length;
    
    // 计算百分比和角度
    let progressPercent = 0;
    let progressAngle = 0;
    
    if (totalCount > 0) {
      progressPercent = Math.round((completedCount / totalCount) * 100);
      progressAngle = (completedCount / totalCount) * 360;
    }
    
    this.setData({
      completedCount: completedCount,
      progressPercent: progressPercent,
      progressAngle: progressAngle
    });
  },

  // 长按事件处理
  onLongPress: function(e) {
    const index = e.currentTarget.dataset.index;
    const todo = this.data.todos[index];
    
    // 震动反馈
    wx.vibrateShort();
    
    // 显示操作菜单
    wx.showActionSheet({
      itemList: ['编辑', todo.completed ? '标记为未完成' : '标记为完成', '删除'],
      success: (res) => {
        switch(res.tapIndex) {
          case 0: // 编辑
            this.editTodo(index);
            break;
          case 1: // 切换状态
            this._toggleTodoStatus(index);
            break;
          case 2: // 删除
            this._confirmDelete(index);
            break;
        }
      },
      fail: (err) => {
        console.log('用户取消操作', err);
      }
    });
  },

  // 编辑待办事项
  editTodo: function(index) {
    const todo = this.data.todos[index];
    
    wx.showModal({
      title: '编辑待办事项',
      content: '修改待办事项内容',
      editable: true,
      placeholderText: '请输入待办事项...',
      defaultValue: todo.text,
      success: (res) => {
        if (res.confirm && res.content && res.content.trim()) {
          const todos = [...this.data.todos];
          todos[index].text = res.content.trim();
          this.setData({ todos });
          
          wx.showToast({
            title: '修改成功',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  },

  // 切换待办事项完成状态
  toggleTodo: function(e) {
    e.stopPropagation();
    const index = e.currentTarget.dataset.index;
    if (index === undefined || index === null) {
      console.error("未获取到索引！");
      return;
    }
    
    const todos = this.data.todos;
    if (!todos[index]) {
      console.error("索引无效！");
      return;
    }
    
    this._toggleTodoStatus(index);
  },

  // 实际切换状态逻辑
  _toggleTodoStatus: function(index) {
    const todos = [...this.data.todos];
    const wasCompleted = todos[index].completed;
    todos[index].completed = !wasCompleted;
    
    this.setData({ 
      todos: todos 
    }, () => {
      // 更新统计数据
      this.calculateStats();
    });
    
    // 显示操作提示
    const action = wasCompleted ? '已恢复' : '已完成';
    wx.showToast({
      title: action,
      icon: 'success',
      duration: 1000
    });
    
    // 震动反馈
    wx.vibrateShort();
  },

  // 点击删除按钮
  deleteTodo: function(e) {
    e.stopPropagation();
    const index = e.currentTarget.dataset.index;
    if (index === undefined) return;
    
    this._confirmDelete(index);
  },

  // 滑动确认删除
  confirmDelete: function(e) {
    e.stopPropagation();
    const index = e.currentTarget.dataset.index;
    if (index === undefined) return;
    
    this._confirmDelete(index);
  },

  // 滑动确认完成
  confirmComplete: function(e) {
    e.stopPropagation();
    const index = e.currentTarget.dataset.index;
    if (index === undefined) return;
    
    this._toggleTodoStatus(index);
    this.resetSlide(index);
  },

  // 确认删除
  _confirmDelete: function(index) {
    const todoText = this.data.todos[index].text;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除"${todoText}"吗？`,
      confirmColor: '#ff3b30',
      cancelColor: '#999',
      success: (res) => {
        if (res.confirm) {
          this._removeTodo(index);
        } else {
          // 取消删除，恢复原位
          this.resetSlide(index);
        }
      }
    });
  },

  // 实际删除逻辑
  _removeTodo: function(index) {
    const todos = [...this.data.todos];
    todos.splice(index, 1);
    
    this.setData({ 
      todos: todos 
    }, () => {
      // 更新统计数据
      this.calculateStats();
    });
    
    wx.showToast({
      title: '删除成功',
      icon: 'success',
      duration: 1500
    });
    
    // 震动反馈
    wx.vibrateShort();
  },

  // 触摸开始事件
  onTouchStart: function(e) {
    const touch = e.touches[0];
    const index = e.currentTarget.dataset.index;
    
    this.setData({
      touchStartX: touch.pageX,
      touchStartY: touch.pageY,
      touchStartTime: Date.now(),
      currentIndex: index
    });
  },

  // 触摸移动事件
  onTouchMove: function(e) {
    const touch = e.touches[0];
    const index = e.currentTarget.dataset.index;
    
    // 只处理当前触摸的卡片
    if (index !== this.data.currentIndex) return;
    
    const deltaX = touch.pageX - this.data.touchStartX;
    const deltaY = touch.pageY - this.data.touchStartY;
    
    // 如果垂直滑动距离大于水平距离，认为是垂直滚动，不处理滑动
    if (Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
      return;
    }
    
    // 计算滑动距离，限制最大滑动距离
    const maxSlide = this.data.maxSlideDistance;
    let swipeOffset = deltaX;
    
    // 根据方向限制滑动距离
    if (swipeOffset > 0) {
      // 向右滑动（正方向）
      swipeOffset = Math.min(swipeOffset, maxSlide);
    } else {
      // 向左滑动（负方向）
      swipeOffset = Math.max(swipeOffset, -maxSlide);
    }
    
    // 更新滑动状态
    this.setData({
      [`todos[${index}].swipeOffset`]: swipeOffset,
      [`todos[${index}].showComplete`]: swipeOffset > this.data.slideThreshold,
      [`todos[${index}].showDelete`]: swipeOffset < -this.data.slideThreshold
    });
    
    // 阻止事件冒泡，避免干扰页面滚动
    e.stopPropagation();
  },

  // 触摸结束事件
  onTouchEnd: function(e) {
    const index = e.currentTarget.dataset.index;
    if (index !== this.data.currentIndex) return;
    
    const todo = this.data.todos[index];
    const slideOffset = todo.swipeOffset || 0;
    const touchDuration = Date.now() - this.data.touchStartTime;
    
    // 判断滑动方向
    if (slideOffset > 0) {
      // 向右滑动
      if (Math.abs(slideOffset) >= this.data.actionThreshold) {
        // 触发滑动完成动画
        this.triggerSlideComplete(index);
      } else if (Math.abs(slideOffset) >= this.data.slideThreshold) {
        // 保持在滑动位置
        this.setData({
          [`todos[${index}].showComplete`]: true
        });
      } else {
        // 恢复原位
        this.resetSlide(index);
      }
    } else if (slideOffset < 0) {
      // 向左滑动
      if (Math.abs(slideOffset) >= this.data.actionThreshold) {
        // 触发滑动删除动画
        this.triggerSlideDelete(index);
      } else if (Math.abs(slideOffset) >= this.data.slideThreshold) {
        // 保持在滑动位置
        this.setData({
          [`todos[${index}].showDelete`]: true
        });
      } else {
        // 恢复原位
        this.resetSlide(index);
      }
    } else {
      // 没有滑动
      // 如果滑动距离很小且时间很短，视为点击
      if (Math.abs(slideOffset) < 10 && touchDuration < 200) {
        // 短时间点击，切换完成状态
        this._toggleTodoStatus(index);
      } else {
        // 恢复原位
        this.resetSlide(index);
      }
    }
    
    // 重置当前触摸索引
    this.setData({
      currentIndex: -1
    });
  },

  // 触摸取消事件
  onTouchCancel: function(e) {
    const index = e.currentTarget.dataset.index;
    this.resetSlide(index);
    this.setData({
      currentIndex: -1
    });
  },

  // 触发滑动删除动画
  triggerSlideDelete: function(index) {
    this.setData({
      [`todos[${index}].swipeClass`]: 'slide-left'
    }, () => {
      // 动画完成后显示确认对话框
      setTimeout(() => {
        this._confirmDelete(index);
      }, 300);
    });
  },

  // 触发滑动完成动画
  triggerSlideComplete: function(index) {
    this.setData({
      [`todos[${index}].swipeClass`]: 'slide-right'
    }, () => {
      // 动画完成后触发完成操作
      setTimeout(() => {
        this._toggleTodoStatus(index);
        this.resetSlide(index);
      }, 300);
    });
  },

  // 恢复滑动位置
  resetSlide: function(index) {
    this.setData({
      [`todos[${index}].swipeOffset`]: 0,
      [`todos[${index}].showComplete`]: false,
      [`todos[${index}].showDelete`]: false,
      [`todos[${index}].swipeClass`]: 'slide-back'
    });
    
    // 300ms后清除动画类
    setTimeout(() => {
      this.setData({
        [`todos[${index}].swipeClass`]: ''
      });
    }, 300);
  },

  // 添加新待办
  addNewTodo: function() {
    wx.showModal({
      title: '添加新待办',
      content: '请输入待办事项内容',
      editable: true,
      placeholderText: '请输入待办事项...',
      success: (res) => {
        if (res.confirm && res.content && res.content.trim()) {
          const newTodo = {
            id: Date.now(),
            text: res.content.trim(),
            completed: false,
            swipeOffset: 0,
            showComplete: false,
            showDelete: false,
            swipeClass: ''
          };
          
          const todos = [newTodo, ...this.data.todos];
          this.setData({ 
            todos: todos 
          }, () => {
            // 更新统计数据
            this.calculateStats();
          });
          
          wx.showToast({
            title: '添加成功',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  }
});
Page({
  data: {
    // 待办事项列表
    todos: [],
    // 过滤后的待办事项列表
    filteredTodos: [],
    // 新待办事项文本
    newTodoText: '',
    // 当前筛选条件
    currentFilter: 'all',
    // 当前排序方式
    sortBy: 'time',
    // 新任务优先级
    priority: 2,
    // 自动聚焦输入框
    autoFocus: true,
    // 统计信息
    totalCount: 0,
    completedCount: 0,
    pendingCount: 0,
    // 当前日期时间
    currentDate: '',
    currentTime: '',
    // 编辑模态框
    showEditModal: false,
    editId: null,
    editText: '',
    editPriority: 2,
    // 加载状态
    isLoading: false
  },

  onLoad: function() {
    // 页面加载时从本地存储加载数据
    this.loadTodosFromStorage()
    // 更新当前时间
    this.updateDateTime()
    // 设置定时器每秒更新时间
    this.timeInterval = setInterval(() => {
      this.updateDateTime()
    }, 1000)
  },

  onUnload: function() {
    // 清除定时器
    if (this.timeInterval) {
      clearInterval(this.timeInterval)
    }
  },

  // 更新日期时间
  updateDateTime: function() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const day = now.getDate()
    const weekDays = ['日', '一', '二', '三', '四', '五', '六']
    const weekDay = weekDays[now.getDay()]
    
    const hour = now.getHours().toString().padStart(2, '0')
    const minute = now.getMinutes().toString().padStart(2, '0')
    const second = now.getSeconds().toString().padStart(2, '0')
    
    this.setData({
      currentDate: `${year}年${month}月${day}日 周${weekDay}`,
      currentTime: `${hour}:${minute}:${second}`
    })
  },

  // 从本地存储加载待办事项
  loadTodosFromStorage: function() {
    this.setData({ isLoading: true })
    
    setTimeout(() => {
      const todos = wx.getStorageSync('todos') || []
      this.setData({ 
        todos,
        isLoading: false
      }, () => {
        this.updateFilteredTodos()
        this.updateStats()
      })
    }, 500) // 模拟加载延迟
  },

  // 保存待办事项到本地存储
  saveTodosToStorage: function() {
    wx.setStorageSync('todos', this.data.todos)
  },

  // 输入框内容变化事件
  onInputChange: function(e) {
    this.setData({
      newTodoText: e.detail.value
    })
  },

  // 设置任务优先级
  setPriority: function(e) {
    const priority = parseInt(e.currentTarget.dataset.priority)
    this.setData({ priority })
  },

  // 添加待办事项
  addTodo: function() {
    const text = this.data.newTodoText.trim()
    if (!text) {
      wx.showToast({
        title: '请输入待办事项',
        icon: 'none',
        duration: 1500
      })
      return
    }

    const newTodo = {
      id: Date.now(),
      text: text,
      completed: false,
      priority: this.data.priority,
      time: this.getCurrentTime(),
      createdAt: Date.now()
    }

    const todos = [newTodo, ...this.data.todos]
    
    this.setData({
      todos: todos,
      newTodoText: '',
      autoFocus: true
    }, () => {
      this.updateFilteredTodos()
      this.updateStats()
      this.saveTodosToStorage()
      
      // 显示添加成功提示
      wx.showToast({
        title: '添加成功',
        icon: 'success',
        duration: 1000
      })
      
      // 播放添加动画
      this.playAddAnimation(newTodo.id)
    })
  },

  // 播放添加动画
  playAddAnimation: function(id) {
    const todos = this.data.todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, animationData: this.createAnimationData() }
      }
      return todo
    })
    
    this.setData({ todos })
    
    // 3秒后清除动画数据
    setTimeout(() => {
      const updatedTodos = this.data.todos.map(todo => {
        if (todo.id === id && todo.animationData) {
          const { animationData, ...rest } = todo
          return rest
        }
        return todo
      })
      
      this.setData({ todos: updatedTodos })
    }, 3000)
  },

  // 创建动画数据
  createAnimationData: function() {
    const animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease'
    })
    
    animation.scale(1.05).step({ duration: 200 })
    animation.scale(1).step({ duration: 200 })
    animation.backgroundColor('#f1f8ff').step({ duration: 600 })
    animation.backgroundColor('#ffffff').step({ duration: 2000 })
    
    return animation.export()
  },

  // 获取当前时间字符串
  getCurrentTime: function() {
    const now = new Date()
    const hour = now.getHours()
    const minute = now.getMinutes()
    return `${hour}:${minute < 10 ? '0' + minute : minute}`
  },

  // 切换待办事项状态
  toggleTodoStatus: function(e) {
    const id = e.currentTarget.dataset.id
    const todos = this.data.todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, completed: !todo.completed }
      }
      return todo
    })

    this.setData({ todos }, () => {
      this.updateFilteredTodos()
      this.updateStats()
      this.saveTodosToStorage()
      
      // 显示状态变化提示
      const todo = this.data.todos.find(t => t.id === id)
      if (todo) {
        wx.showToast({
          title: todo.completed ? '任务完成！' : '任务已恢复',
          icon: 'success',
          duration: 1000
        })
      }
    })
  },

  // 编辑待办事项
  editTodo: function(e) {
    e.stopPropagation(); // 阻止事件冒泡
    const id = e.currentTarget.dataset.id
    const todo = this.data.todos.find(t => t.id === id)
    
    if (todo) {
      this.setData({
        showEditModal: true,
        editId: id,
        editText: todo.text,
        editPriority: todo.priority || 2
      })
    }
  },

  // 设置排序方式
  setSort: function(e) {
    const sortBy = e.currentTarget.dataset.sort
    this.setData({ sortBy }, () => {
      this.updateFilteredTodos()
    })
  },

  // 关闭编辑模态框
  closeEditModal: function() {
    this.setData({
      showEditModal: false,
      editId: null,
      editText: '',
      editPriority: 2
    })
  },

  // 编辑输入框变化
  onEditInputChange: function(e) {
    this.setData({
      editText: e.detail.value
    })
  },

  // 设置编辑优先级
  setEditPriority: function(e) {
    const priority = parseInt(e.currentTarget.dataset.priority)
    this.setData({ editPriority: priority })
  },

  // 保存编辑
  saveEdit: function() {
    const { editId, editText, editPriority } = this.data
    
    if (!editText.trim()) {
      wx.showToast({
        title: '内容不能为空',
        icon: 'none',
        duration: 1500
      })
      return
    }
    
    const todos = this.data.todos.map(todo => {
      if (todo.id === editId) {
        return { 
          ...todo, 
          text: editText.trim(),
          priority: editPriority
        }
      }
      return todo
    })
    
    this.setData({ 
      todos,
      showEditModal: false,
      editId: null,
      editText: '',
      editPriority: 2
    }, () => {
      this.updateFilteredTodos()
      this.saveTodosToStorage()
      
      wx.showToast({
        title: '编辑成功',
        icon: 'success',
        duration: 1000
      })
    })
  },

  // 删除待办事项
  deleteTodo: function(e) {
    e.stopPropagation(); // 阻止事件冒泡
    const id = e.currentTarget.dataset.id
    const todoToDelete = this.data.todos.find(todo => todo.id === id)
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除"${todoToDelete.text}"吗？`,
      confirmColor: '#ff3b30',
      cancelColor: '#999',
      success: (res) => {
        if (res.confirm) {
          // 播放删除动画
          this.playDeleteAnimation(id, () => {
            const todos = this.data.todos.filter(todo => todo.id !== id)
            
            this.setData({ todos }, () => {
              this.updateFilteredTodos()
              this.updateStats()
              this.saveTodosToStorage()
              
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 1000
              })
            })
          })
        }
      }
    })
  },

  // 播放删除动画
  playDeleteAnimation: function(id, callback) {
    const index = this.data.todos.findIndex(todo => todo.id === id)
    if (index === -1) return
    
    const animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease'
    })
    
    animation.opacity(0).translateX(100).step()
    
    const animationKey = `todos[${index}].animationData`
    this.setData({
      [animationKey]: animation.export()
    })
    
    setTimeout(() => {
      callback && callback()
    }, 300)
  },

  // 筛选待办事项
  filterTodos: function(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({
      currentFilter: filter
    }, () => {
      this.updateFilteredTodos()
    })
  },

  // 更新筛选后的待办事项
  updateFilteredTodos: function() {
    const { todos, currentFilter, sortBy } = this.data
    let filteredTodos = []
    
    // 筛选
    switch (currentFilter) {
      case 'pending':
        filteredTodos = todos.filter(todo => !todo.completed)
        break
      case 'completed':
        filteredTodos = todos.filter(todo => todo.completed)
        break
      default:
        filteredTodos = [...todos]
    }
    
    // 排序
    filteredTodos.sort((a, b) => {
      if (sortBy === 'priority') {
        // 按优先级降序，高优先级在前
        return (b.priority || 2) - (a.priority || 2)
      } else {
        // 按时间降序，最新的在前
        return b.createdAt - a.createdAt
      }
    })
    
    this.setData({ filteredTodos })
  },

  // 更新统计信息
  updateStats: function() {
    const todos = this.data.todos
    const totalCount = todos.length
    const completedCount = todos.filter(todo => todo.completed).length
    const pendingCount = totalCount - completedCount
    
    this.setData({
      totalCount,
      completedCount,
      pendingCount
    })
  },

  // 完成所有待办事项
  completeAll: function() {
    if (this.data.completedCount === this.data.totalCount) {
      return
    }
    
    wx.showModal({
      title: '确认操作',
      content: '确定要标记所有任务为已完成吗？',
      success: (res) => {
        if (res.confirm) {
          const todos = this.data.todos.map(todo => ({
            ...todo,
            completed: true
          }))
          
          this.setData({ todos }, () => {
            this.updateFilteredTodos()
            this.updateStats()
            this.saveTodosToStorage()
            
            wx.showToast({
              title: '全部完成',
              icon: 'success',
              duration: 1500
            })
          })
        }
      }
    })
  },

  // 清除已完成事项
  clearCompleted: function() {
    if (this.data.completedCount === 0) {
      return
    }
    
    wx.showModal({
      title: '确认操作',
      content: '确定要清除所有已完成的任务吗？',
      confirmColor: '#ff3b30',
      success: (res) => {
        if (res.confirm) {
          const todos = this.data.todos.filter(todo => !todo.completed)
          
          this.setData({ todos }, () => {
            this.updateFilteredTodos()
            this.updateStats()
            this.saveTodosToStorage()
            
            wx.showToast({
              title: '已清除已完成',
              icon: 'success',
              duration: 1500
            })
          })
        }
      }
    })
  }
})
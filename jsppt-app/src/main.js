import { createApp } from 'vue'
import App from './App.vue'

// 创建Vue应用实例
const app = createApp(App)

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('全局错误:', err);
  console.error('错误信息:', info);
  
  // 在生产环境中可以添加错误上报逻辑
  if (process.env.NODE_ENV === 'production') {
    // 错误上报逻辑
  }
};

// 挂载应用
app.mount('#app')

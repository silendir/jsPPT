import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'robots.txt'],
      manifest: {
        name: 'jsPPT - AI演示文稿生成器',
        short_name: 'jsPPT',
        description: '通过简单的提示词输入生成专业的PPT/PDF格式演示文稿',
        theme_color: '#4361ee',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    // 生产环境构建配置
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    // 分块策略
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue'],
          'marp': ['@marp-team/marp-core'],
          'export-tools': ['html2pdf.js', 'pptxgenjs', 'file-saver']
        }
      }
    },
    // 启用源码映射
    sourcemap: true,
    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  server: {
    // 开发服务器配置
    port: 3000,
    open: true,
    cors: true
  },
  optimizeDeps: {
    // 预构建依赖项
    include: [
      'vue',
      '@marp-team/marp-core',
      'file-saver'
    ],
    // 排除大型依赖，使用动态导入
    exclude: [
      'html2pdf.js',
      'pptxgenjs',
      '@mlc-ai/web-llm'
    ]
  }
})

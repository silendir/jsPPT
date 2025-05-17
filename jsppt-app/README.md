# jsPPT - AI演示文稿生成器

jsPPT是一个基于Web技术的单页应用，旨在通过简单的提示词输入生成专业的PPT/PDF格式演示文稿。用户只需输入主题需求，系统自动通过LLM生成内容并转换为标准演示文稿格式。

## 核心特点

- **极简用户界面**：只需输入提示词即可生成完整演示文稿
- **纯客户端实现**：所有处理在浏览器中完成，无需服务器部署
- **多种输出格式**：支持PDF、PPTX等格式导出
- **响应式设计**：适配手机与台式电脑显示的轻应用

## 技术栈

- **前端框架**：Vue.js 3 + Vite
- **演示文稿生成**：Marp框架
- **AI内容生成**：浏览器内运行的Qwen3.0:0.6B模型
- **部署平台**：Cloudflare Pages + R2存储

## 快速开始

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建生产版本

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 部署到Cloudflare

1. Fork本仓库到您的GitHub账户
2. 在Cloudflare Pages中创建新项目
3. 连接您的GitHub仓库
4. 设置构建命令为 `npm run build`
5. 设置构建输出目录为 `dist`
6. 点击部署

## 浏览器兼容性

| 浏览器 | 版本 | WebGPU | WebGL | WASM | 推荐策略 | 预期性能 |
|-------|------|--------|-------|------|---------|---------|
| Chrome | 113+ | ✅ | ✅ | ✅ | WebGPU | 最佳 |
| Chrome | 90-112 | ❌ | ✅ | ✅ | WebGL | 良好 |
| Edge | 113+ | ✅ | ✅ | ✅ | WebGPU | 最佳 |
| Edge | 90-112 | ❌ | ✅ | ✅ | WebGL | 良好 |
| Safari | 17+ | ✅* | ✅ | ✅ | WebGPU | 最佳 |
| Safari | 14-16 | ❌ | ✅ | ✅ | WebGL | 良好 |
| Firefox | 最新版 | ❌** | ✅ | ✅ | WebGL | 良好 |
| iOS Safari | 17+ | ❌ | ✅ | ✅ | WebGL | 中等 |
| iOS Safari | 15-16 | ❌ | ✅ | ✅ | WebGL/WASM | 中等/低 |
| Android Chrome | 最新版 | ❌ | ✅ | ✅ | WebGL | 中等 |

*Safari 17+需要启用实验性功能
**Firefox计划在未来版本支持WebGPU

## 许可证

MIT

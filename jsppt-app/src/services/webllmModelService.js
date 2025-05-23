/**
 * WebLLM模型服务
 * 使用@mlc-ai/web-llm库实现的模型服务
 */
import cacheService from './cacheService';
import progressiveLoadService from './progressiveLoadService';

class WebLLMModelService {
  /**
   * 构造函数
   * @param {Object} options 配置选项
   */
  constructor(options = {}) {
    this.options = {
      modelId: 'Qwen/Qwen3.0-0.6B-Chat-GGUF',
      modelSize: '0.6B',
      quantization: 'q4_0',
      useWebGPU: false, // 默认使用CPU模式
      useProgressiveLoading: true,
      ...options
    };

    this.model = null;
    this.chat = null;
    this.isLoading = false;
    this.progress = 0;
    this.error = null;
    this.loadingStage = '准备中';

    // 模型URL
    this.modelUrl = options.modelUrl || 'https://cdn.jsppt.com/models/qwen3-0.6b-q4.gguf';

    // 配置渐进式加载服务
    if (this.options.useProgressiveLoading) {
      progressiveLoadService.options.modelId = this.options.modelId;
      progressiveLoadService.options.modelUrl = this.modelUrl;
    }

    // 系统提示词
    this.systemPrompt = options.systemPrompt || `你是一个专业的演示文稿生成助手，擅长创建Marp格式的Markdown演示文稿。
请根据用户的主题生成一个完整的演示文稿，包含以下内容：
1. 封面页：包含主题标题
2. 目录页：列出演示文稿的主要内容
3. 内容页：每页一个要点，包含简洁的要点列表
4. 总结页：总结主要观点

遵循以下Marp格式规范:
1. 文档开头必须包含以下前置元数据:
   ---
   marp: true
   theme: default
   paginate: true
   ---

2. 使用"---"分隔不同的幻灯片

3. 幻灯片结构指南:
   - 第一张幻灯片应为标题页，包含主标题和副标题
   - 第二张幻灯片通常为目录或概述
   - 最后一张幻灯片应为总结或联系方式

4. 格式化技巧:
   - 使用 # 表示一级标题，## 表示二级标题，依此类推
   - 每张幻灯片内容简洁，通常5-7个要点为宜
   - 可以使用 ![bg](图片URL) 设置背景图片
   - 可以使用 ![bg left:40%](图片URL) 创建分栏布局

请直接输出Markdown内容，不要有额外的解释。`;
  }

  /**
   * 检查模型是否已加载
   * @returns {Boolean} 模型是否已加载
   */
  isModelLoaded() {
    return this.model !== null && this.chat !== null;
  }

  /**
   * 获取加载进度
   * @returns {Number} 加载进度（0-1）
   */
  getProgress() {
    return this.progress;
  }

  /**
   * 获取加载阶段描述
   * @returns {String} 加载阶段描述
   */
  getLoadingStage() {
    return this.loadingStage;
  }

  /**
   * 加载模型
   * @param {Object} callbacks 回调函数集合
   * @returns {Promise<Boolean>} 加载是否成功
   */
  async loadModel(callbacks = {}) {
    if (this.isLoading) return false;

    try {
      this.isLoading = true;
      this.error = null;

      // 设置初始进度
      this.progress = 0;
      this.loadingStage = '准备中';
      if (callbacks.onProgress) {
        callbacks.onProgress(this.progress);
      }

      // 动态导入WebLLM库
      this.loadingStage = '加载WebLLM库';
      const webllm = await import('@mlc-ai/web-llm');

      // 创建聊天实例
      this.loadingStage = '初始化模型';

      // 使用CreateMLCEngine工厂函数创建引擎
      try {
        // 最新版本使用CreateMLCEngine工厂函数
        if (typeof webllm.CreateMLCEngine === 'function') {
          this.chat = await webllm.CreateMLCEngine(
            this.options.modelId,
            {
              initProgressCallback: (progress) => {
                this.progress = progress.progress || 0;
                this.loadingStage = progress.text || '加载中';
              },
              useWebGPU: this.options.useWebGPU
            }
          );
        }
        // 兼容旧版本
        else if (typeof webllm.ChatModule === 'function' && /^\s*class\s+/.test(webllm.ChatModule.toString())) {
          // 如果是构造函数（类），使用new
          this.chat = new webllm.ChatModule();
        } else if (typeof webllm.createChatModule === 'function') {
          // 如果有工厂函数，使用工厂函数
          this.chat = webllm.createChatModule();
        } else if (typeof webllm.ChatModule === 'function') {
          // 如果是普通函数，直接调用
          this.chat = webllm.ChatModule();
        } else if (webllm.chat) {
          // 如果有预创建的实例
          this.chat = webllm.chat;
        } else {
          // 尝试使用默认导出
          this.chat = new webllm.default();
        }
      } catch (error) {
        console.error("创建WebLLM引擎失败:", error);
        throw new Error(`创建WebLLM引擎失败: ${error.message}`);
      }

      // 如果已经使用CreateMLCEngine创建了引擎，则不需要再初始化
      if (!(this.chat.chat && this.chat.chat.completions)) {
        // 配置WebGPU/WebGL
        const initOptions = {
          // 如果useWebGPU为false，则使用WebGL
          wasmUrl: this.options.useWebGPU ? undefined : 'https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm/lib/',
          // 如果useWebGPU为true，则使用WebGPU
          useWebGPU: this.options.useWebGPU
        };

        // 初始化ChatModule (旧版API)
        if (typeof this.chat.init === 'function') {
          await this.chat.init(initOptions);
        }

        if (this.options.useProgressiveLoading) {
          // 使用渐进式加载
          this.loadingStage = '检查模型缓存';
          const isCached = await progressiveLoadService.isModelFullyCached();

          if (isCached) {
            this.loadingStage = '从缓存加载模型';
          } else {
            this.loadingStage = '下载模型文件';
          }

          // 加载或下载模型
          await progressiveLoadService.loadModel({
            onProgress: (p) => {
              // 下载和缓存占总进度的80%
              this.progress = p * 0.8;

              if (p < 0.1) {
                this.loadingStage = '准备下载';
              } else if (p < 0.8) {
                this.loadingStage = '下载模型文件';
              } else if (p < 0.9) {
                this.loadingStage = '保存到缓存';
              } else {
                this.loadingStage = '准备加载模型';
              }

              if (callbacks.onProgress) {
                callbacks.onProgress(this.progress);
              }
            },
            onError: (error) => {
              this.loadingStage = '下载失败';
              throw error;
            }
          });

          // 使用自定义加载方式
          this.loadingStage = '加载模型到内存';

          // 设置模型配置
          const modelConfig = {
            model_list: [
              {
                model_id: this.options.modelId,
                model_url: this.modelUrl,
                // 可以添加其他配置，如量化参数等
                local_id: this.options.modelId
              }
            ]
          };

          // 加载模型 (旧版API)
          if (typeof this.chat.reload === 'function') {
            await this.chat.reload(this.options.modelId, modelConfig);
          }
        } else {
          // 使用WebLLM内置的加载方式
          this.loadingStage = '下载模型文件';

          // 设置进度回调 (旧版API)
          if (typeof this.chat.setInitProgressCallback === 'function') {
            this.chat.setInitProgressCallback((report) => {
              const stage = report.progress.stage;
              let progress = 0;

              if (stage === 'download') {
                // 下载阶段
                progress = report.progress.progress * 0.8; // 下载占总进度的80%
                this.loadingStage = '下载模型文件';
              } else if (stage === 'load') {
                // 加载阶段
                progress = 0.8 + report.progress.progress * 0.2; // 加载占总进度的20%
                this.loadingStage = '加载模型到内存';
              }

              this.progress = progress;
              if (callbacks.onProgress) {
                callbacks.onProgress(progress);
              }
            });
          }

          // 初始化模型 (旧版API)
          if (typeof this.chat.reload === 'function') {
            await this.chat.reload(this.options.modelId, {
              model_list: [
                {
                  model_id: this.options.modelId,
                  model_url: this.modelUrl
                }
              ]
            });
          }
        }

        // 设置系统提示词 (旧版API)
        this.loadingStage = '配置模型';
        if (typeof this.chat.resetChat === 'function') {
          await this.chat.resetChat(this.systemPrompt);
        }
      } else {
        // 新版API已经在创建引擎时完成了初始化
        this.loadingStage = '模型已加载';
      }

      // 模型加载完成
      this.model = this.chat;
      this.progress = 1;
      this.loadingStage = '加载完成';

      if (callbacks.onProgress) {
        callbacks.onProgress(1);
      }

      if (callbacks.onSuccess) {
        callbacks.onSuccess();
      }

      return true;
    } catch (error) {
      this.error = error;
      console.error("WebLLM模型加载失败:", error);
      this.loadingStage = '加载失败';

      if (callbacks.onError) {
        callbacks.onError(error);
      }

      return false;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * 生成Marp格式的Markdown
   * @param {String} prompt 用户提示词
   * @param {Object} options 生成选项
   * @returns {Promise<String>} 生成的Markdown内容
   */
  async generateMarpMarkdown(prompt, options = {}) {
    if (!this.isModelLoaded()) {
      throw new Error("模型尚未加载");
    }

    try {
      // 默认生成选项
      const defaultOptions = {
        stream: false,
        max_tokens: 2048,
        temperature: 0.7,
        top_p: 0.9
      };

      // 合并选项
      const generateOptions = { ...defaultOptions, ...options };

      // 构建提示词
      const fullPrompt = `请为主题"${prompt}"创建一个Marp格式的演示文稿。`;

      // 构建消息数组
      const messages = [
        { role: "system", content: this.systemPrompt },
        { role: "user", content: fullPrompt }
      ];

      let markdown = '';

      // 检查是否使用新的OpenAI兼容API
      if (this.chat.chat && this.chat.chat.completions && typeof this.chat.chat.completions.create === 'function') {
        // 使用OpenAI兼容API
        const response = await this.chat.chat.completions.create({
          messages,
          ...generateOptions
        });

        markdown = response.choices[0].message.content;
      }
      // 兼容旧版本API
      else if (typeof this.chat.generate === 'function') {
        // 使用旧版API
        const reply = await this.chat.generate(messages, generateOptions);
        markdown = reply.text;
      }
      // 尝试使用MLCEngine的getMessage方法
      else if (typeof this.chat.getMessage === 'function') {
        await this.chat.resetChat();
        for (const message of messages) {
          await this.chat.generate(message.content);
        }
        markdown = await this.chat.getMessage();
      }
      else {
        throw new Error("无法找到有效的生成方法");
      }

      // 确保Markdown包含Marp前置元数据
      if (!markdown.startsWith('---\nmarp: true')) {
        markdown = `---\nmarp: true\ntheme: default\npaginate: true\n---\n\n${markdown}`;
      }

      return markdown;
    } catch (error) {
      console.error("生成失败:", error);
      throw error;
    }
  }

  /**
   * 释放模型资源
   * @returns {Promise<void>}
   */
  async unloadModel() {
    if (this.chat) {
      try {
        // 释放模型资源
        if (typeof this.chat.unload === 'function') {
          await this.chat.unload();
        } else if (typeof this.chat.dispose === 'function') {
          await this.chat.dispose();
        }
        this.model = null;
        this.chat = null;
      } catch (error) {
        console.error("模型卸载失败:", error);
      }
    }
  }

  /**
   * 清除模型缓存
   * @returns {Promise<Boolean>} 是否清除成功
   */
  async clearModelCache() {
    if (this.options.useProgressiveLoading) {
      return await progressiveLoadService.clearModelCache();
    }
    return true;
  }
}

// 创建默认实例
const webllmModelService = new WebLLMModelService();
export default webllmModelService;

// 同时导出类，以便可以创建自定义实例
export { WebLLMModelService };

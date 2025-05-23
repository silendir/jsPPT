/**
 * 渐进式加载服务
 * 负责模型的渐进式加载、分块下载和断点续传
 */
import cacheService from './cacheService';

class ProgressiveLoadService {
  /**
   * 构造函数
   * @param {Object} options 配置选项
   */
  constructor(options = {}) {
    this.options = {
      modelId: 'qwen3-0.6b',
      modelUrl: 'https://cdn.jsppt.com/models/qwen3-0.6b-q4.gguf',
      chunkSize: 10 * 1024 * 1024, // 默认10MB分块
      ...options
    };

    this.totalChunks = 0;
    this.loadedChunks = 0;
    this.totalSize = 0;
    this.abortController = null;
    this.isLoading = false;
    this.progress = 0;
    this.error = null;
    this.metadataKey = `${this.options.modelId}_metadata`;
  }

  /**
   * 检测网络速度并动态调整分块大小
   * @returns {Promise<Number>} 最佳分块大小（字节）
   */
  async determineOptimalChunkSize() {
    try {
      // 测试网络速度
      const testUrl = this.options.modelUrl.split('/').slice(0, -1).join('/') + '/network-test';
      const startTime = Date.now();
      await fetch(testUrl, { 
        method: 'HEAD',
        cache: 'no-store',
        signal: AbortSignal.timeout(3000) // 3秒超时
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // 基于响应时间调整分块大小
      if (responseTime < 100) {
        return 20 * 1024 * 1024; // 20MB (快速网络)
      } else if (responseTime < 500) {
        return 10 * 1024 * 1024; // 10MB (中速网络)
      } else {
        return 5 * 1024 * 1024;  // 5MB (慢速网络)
      }
    } catch (error) {
      console.log('网络速度测试失败，使用默认分块大小:', error);
      return this.options.chunkSize; // 使用默认值
    }
  }

  /**
   * 获取模型元数据
   * @returns {Promise<Object|null>} 模型元数据
   */
  async getModelMetadata() {
    try {
      return await cacheService.getModel(this.metadataKey);
    } catch (error) {
      console.error('获取模型元数据失败:', error);
      return null;
    }
  }

  /**
   * 保存模型元数据
   * @param {Object} metadata 模型元数据
   * @returns {Promise<Boolean>} 是否保存成功
   */
  async saveModelMetadata(metadata) {
    try {
      return await cacheService.saveModel(this.metadataKey, metadata);
    } catch (error) {
      console.error('保存模型元数据失败:', error);
      return false;
    }
  }

  /**
   * 检查模型是否已完全缓存
   * @returns {Promise<Boolean>} 是否已完全缓存
   */
  async isModelFullyCached() {
    try {
      // 检查模型元数据
      const metadata = await this.getModelMetadata();
      if (!metadata || !metadata.totalChunks || metadata.totalChunks === 0) {
        return false;
      }

      // 检查所有分块是否存在
      for (let i = 0; i < metadata.totalChunks; i++) {
        const chunkId = `${this.options.modelId}_chunk_${i}`;
        const hasChunk = await cacheService.hasModel(chunkId);
        if (!hasChunk) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('检查模型缓存状态失败:', error);
      return false;
    }
  }

  /**
   * 获取模型文件大小
   * @returns {Promise<Number>} 文件大小（字节）
   */
  async getModelSize() {
    try {
      // 检查缓存的元数据
      const metadata = await this.getModelMetadata();
      if (metadata && metadata.totalSize) {
        return metadata.totalSize;
      }

      // 发送HEAD请求获取文件大小
      const response = await fetch(this.options.modelUrl, { 
        method: 'HEAD',
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`获取模型大小失败: ${response.status} ${response.statusText}`);
      }
      
      const contentLength = parseInt(response.headers.get('content-length') || '0');
      if (contentLength === 0) {
        throw new Error('无法获取模型大小');
      }
      
      return contentLength;
    } catch (error) {
      console.error('获取模型大小失败:', error);
      throw error;
    }
  }

  /**
   * 分块下载模型
   * @param {Object} callbacks 回调函数集合
   * @returns {Promise<ArrayBuffer>} 完整的模型数据
   */
  async downloadModelInChunks(callbacks = {}) {
    if (this.isLoading) {
      throw new Error('模型正在下载中');
    }

    try {
      this.isLoading = true;
      this.progress = 0;
      this.error = null;
      this.abortController = new AbortController();

      // 获取模型大小
      this.totalSize = await this.getModelSize();
      
      // 动态确定最佳分块大小
      const chunkSize = await this.determineOptimalChunkSize();
      
      // 计算分块数量
      this.totalChunks = Math.ceil(this.totalSize / chunkSize);
      this.loadedChunks = 0;

      // 保存元数据
      await this.saveModelMetadata({
        modelId: this.options.modelId,
        modelUrl: this.options.modelUrl,
        totalSize: this.totalSize,
        totalChunks: this.totalChunks,
        chunkSize: chunkSize,
        timestamp: Date.now()
      });

      // 创建一个ArrayBuffer来存储完整模型
      const modelData = new ArrayBuffer(this.totalSize);
      const modelView = new Uint8Array(modelData);

      // 检查哪些分块已经缓存
      const downloadTasks = [];
      for (let i = 0; i < this.totalChunks; i++) {
        const chunkId = `${this.options.modelId}_chunk_${i}`;
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize - 1, this.totalSize - 1);
        
        // 检查分块是否已缓存
        const hasChunk = await cacheService.hasModel(chunkId);
        
        if (hasChunk) {
          // 从缓存加载分块
          const chunkData = await cacheService.getModel(chunkId);
          modelView.set(new Uint8Array(chunkData), start);
          this.loadedChunks++;
          
          // 更新进度
          this.progress = this.loadedChunks / this.totalChunks;
          if (callbacks.onProgress) {
            callbacks.onProgress(this.progress);
          }
        } else {
          // 创建下载任务
          downloadTasks.push({ chunkId, start, end });
        }
      }

      // 如果所有分块都已缓存，直接返回
      if (downloadTasks.length === 0) {
        if (callbacks.onComplete) {
          callbacks.onComplete(modelData);
        }
        return modelData;
      }

      // 下载未缓存的分块
      for (const task of downloadTasks) {
        // 检查是否已取消
        if (this.abortController.signal.aborted) {
          throw new Error('下载已取消');
        }

        try {
          // 发送带Range头的请求
          const response = await fetch(this.options.modelUrl, {
            headers: { Range: `bytes=${task.start}-${task.end}` },
            signal: this.abortController.signal
          });

          if (!response.ok && response.status !== 206) {
            throw new Error(`分块下载失败: ${response.status} ${response.statusText}`);
          }

          // 获取分块数据
          const chunkBuffer = await response.arrayBuffer();
          
          // 保存到缓存
          await cacheService.saveModel(task.chunkId, chunkBuffer);
          
          // 添加到完整模型
          modelView.set(new Uint8Array(chunkBuffer), task.start);
          
          // 更新进度
          this.loadedChunks++;
          this.progress = this.loadedChunks / this.totalChunks;
          
          if (callbacks.onProgress) {
            callbacks.onProgress(this.progress);
          }
        } catch (error) {
          if (error.name === 'AbortError') {
            throw new Error('下载已取消');
          }
          throw error;
        }
      }

      // 下载完成
      if (callbacks.onComplete) {
        callbacks.onComplete(modelData);
      }

      return modelData;
    } catch (error) {
      this.error = error;
      console.error('模型下载失败:', error);

      if (callbacks.onError) {
        callbacks.onError(error);
      }

      throw error;
    } finally {
      this.isLoading = false;
      this.abortController = null;
    }
  }

  /**
   * 从缓存加载完整模型
   * @returns {Promise<ArrayBuffer>} 完整的模型数据
   */
  async loadModelFromCache() {
    try {
      // 获取元数据
      const metadata = await this.getModelMetadata();
      if (!metadata) {
        throw new Error('模型元数据不存在');
      }

      // 创建一个ArrayBuffer来存储完整模型
      const modelData = new ArrayBuffer(metadata.totalSize);
      const modelView = new Uint8Array(modelData);

      // 加载所有分块
      for (let i = 0; i < metadata.totalChunks; i++) {
        const chunkId = `${this.options.modelId}_chunk_${i}`;
        const chunkData = await cacheService.getModel(chunkId);
        
        if (!chunkData) {
          throw new Error(`分块 ${i} 不存在`);
        }
        
        const start = i * metadata.chunkSize;
        modelView.set(new Uint8Array(chunkData), start);
      }

      return modelData;
    } catch (error) {
      console.error('从缓存加载模型失败:', error);
      throw error;
    }
  }

  /**
   * 加载模型（从缓存或下载）
   * @param {Object} callbacks 回调函数集合
   * @returns {Promise<ArrayBuffer>} 完整的模型数据
   */
  async loadModel(callbacks = {}) {
    try {
      // 检查是否已完全缓存
      const isCached = await this.isModelFullyCached();

      if (isCached) {
        // 从缓存加载
        if (callbacks.onProgress) {
          callbacks.onProgress(0.5); // 设置初始进度
        }
        
        const modelData = await this.loadModelFromCache();
        
        if (callbacks.onProgress) {
          callbacks.onProgress(1); // 设置完成进度
        }
        
        if (callbacks.onComplete) {
          callbacks.onComplete(modelData);
        }
        
        return modelData;
      } else {
        // 下载模型
        return await this.downloadModelInChunks(callbacks);
      }
    } catch (error) {
      console.error('模型加载失败:', error);
      
      if (callbacks.onError) {
        callbacks.onError(error);
      }
      
      throw error;
    }
  }

  /**
   * 取消下载
   */
  cancelDownload() {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  /**
   * 清除模型缓存
   * @returns {Promise<Boolean>} 是否清除成功
   */
  async clearModelCache() {
    try {
      // 获取元数据
      const metadata = await this.getModelMetadata();
      if (!metadata) {
        return true; // 没有元数据，视为清除成功
      }

      // 删除所有分块
      for (let i = 0; i < metadata.totalChunks; i++) {
        const chunkId = `${this.options.modelId}_chunk_${i}`;
        await cacheService.deleteModel(chunkId);
      }

      // 删除元数据
      await cacheService.deleteModel(this.metadataKey);

      return true;
    } catch (error) {
      console.error('清除模型缓存失败:', error);
      return false;
    }
  }
}

// 创建单例实例
const progressiveLoadService = new ProgressiveLoadService();
export default progressiveLoadService;

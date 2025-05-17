/**
 * 模型服务工厂
 * 根据浏览器兼容性创建适合的模型服务实例
 */
import compatibilityService from './compatibilityService';
import webllmModelService, { WebLLMModelService } from './webllmModelService';
import WebGPUModelService from './webgpuModelService';
import WebGLModelService from './webglModelService';
import WasmModelService from './wasmModelService';
import RemoteAPIModelService from './remoteAPIModelService';

class ModelServiceFactory {
  /**
   * 创建适合当前浏览器的模型服务
   * @param {Object} options 配置选项
   * @returns {Promise<Object>} 模型服务实例
   */
  async createModelService(options = {}) {
    // 获取完整的兼容性报告
    const compatibilityReport = await compatibilityService.getFullCompatibilityReport();
    console.log('浏览器兼容性报告:', compatibilityReport);

    // 检查是否强制使用特定模型服务
    if (options.forceService) {
      switch (options.forceService) {
        case 'webllm':
          console.log('强制使用WebLLM模型服务');
          return new WebLLMModelService(options);
        case 'webgpu':
          console.log('强制使用WebGPU模型服务');
          return new WebGPUModelService(options);
        case 'webgl':
          console.log('强制使用WebGL模型服务');
          return new WebGLModelService(options);
        case 'wasm':
          console.log('强制使用WASM模型服务');
          return new WasmModelService(options);
        case 'remote':
          console.log('强制使用远程API模型服务');
          return new RemoteAPIModelService(options);
      }
    }

    // 根据浏览器兼容性选择最佳模型服务

    // 首先尝试使用WebLLM（优先使用WebGPU加速）
    if (compatibilityReport.webgpu.supported) {
      console.log('使用WebLLM（WebGPU加速）');
      return new WebLLMModelService({
        ...options,
        useWebGPU: true
      });
    }

    // 如果WebGPU不可用，尝试使用WebGL加速的WebLLM
    if (compatibilityReport.webgl.supported) {
      console.log('使用WebLLM（WebGL加速）');
      return new WebLLMModelService({
        ...options,
        useWebGPU: false
      });
    }

    // 如果设备性能足够，使用WASM CPU执行
    if (compatibilityReport.performance.performanceTier !== 'low') {
      console.log('使用WASM CPU执行');
      return new WasmModelService(options);
    }

    // 如果是移动设备或低性能设备，使用远程API
    if (compatibilityReport.isMobile || compatibilityReport.performance.performanceTier === 'low') {
      console.log('使用远程API（移动设备或低性能设备）');
      return new RemoteAPIModelService(options);
    }

    // 最后回退到远程API
    console.log('使用远程API（默认回退）');
    return new RemoteAPIModelService(options);
  }

  /**
   * 获取模型服务选项
   * @returns {Array} 可用的模型服务选项
   */
  getModelServiceOptions() {
    return [
      { id: 'auto', name: '自动选择最佳方式' },
      { id: 'webllm', name: 'WebLLM（浏览器本地运行）' },
      { id: 'webgpu', name: 'WebGPU加速（高性能）' },
      { id: 'webgl', name: 'WebGL加速（兼容性好）' },
      { id: 'wasm', name: 'WASM CPU执行（通用）' },
      { id: 'remote', name: '远程API（低性能设备）' }
    ];
  }
}

const modelServiceFactory = new ModelServiceFactory();
export default modelServiceFactory;

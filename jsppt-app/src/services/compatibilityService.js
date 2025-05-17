/**
 * 浏览器兼容性检测服务
 * 用于检测WebGPU、WebGL支持和设备性能
 */
class CompatibilityService {
  /**
   * 检测WebGPU支持
   * @returns {Promise<Object>} 支持状态和详细信息
   */
  async checkWebGPUSupport() {
    if (!navigator.gpu) {
      return {
        supported: false,
        reason: 'WebGPU API不可用'
      };
    }

    try {
      // 尝试获取适配器
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        return {
          supported: false,
          reason: '无法获取WebGPU适配器'
        };
      }

      // 检查是否可以创建设备
      const device = await adapter.requestDevice();
      if (!device) {
        return {
          supported: false,
          reason: '无法创建WebGPU设备'
        };
      }

      return {
        supported: true,
        adapter: adapter,
        device: device
      };
    } catch (error) {
      return {
        supported: false,
        reason: `WebGPU初始化失败: ${error.message}`
      };
    }
  }

  /**
   * 检测WebGL支持（作为备选）
   * @returns {Object} 支持状态和详细信息
   */
  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

      if (!gl) {
        return {
          supported: false,
          reason: 'WebGL不可用'
        };
      }

      return {
        supported: true,
        version: gl instanceof WebGL2RenderingContext ? 2 : 1,
        context: gl
      };
    } catch (error) {
      return {
        supported: false,
        reason: `WebGL检测失败: ${error.message}`
      };
    }
  }

  /**
   * 检测设备性能
   * @returns {Object} 设备性能信息
   */
  checkDevicePerformance() {
    const memory = navigator.deviceMemory || 4; // 默认假设4GB内存
    const cores = navigator.hardwareConcurrency || 4; // 默认假设4核

    // 简单性能评分（仅供参考）
    const performanceScore = (memory * cores) / 4;

    return {
      memory,
      cores,
      performanceScore,
      // 性能分级：高、中、低
      performanceTier: performanceScore >= 8 ? 'high' : (performanceScore >= 4 ? 'medium' : 'low')
    };
  }

  /**
   * 获取浏览器信息
   * @returns {Object} 浏览器名称和版本
   */
  getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browserName = "未知";
    let browserVersion = "";

    // 检测Chrome
    if (userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Edg") === -1) {
      browserName = "Chrome";
      browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)[1];
    }
    // 检测Edge
    else if (userAgent.indexOf("Edg") > -1) {
      browserName = "Edge";
      browserVersion = userAgent.match(/Edg\/([0-9.]+)/)[1];
    }
    // 检测Firefox
    else if (userAgent.indexOf("Firefox") > -1) {
      browserName = "Firefox";
      browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)[1];
    }
    // 检测Safari
    else if (userAgent.indexOf("Safari") > -1) {
      browserName = "Safari";
      browserVersion = userAgent.match(/Safari\/([0-9.]+)/)[1];
    }

    return {
      name: browserName,
      version: browserVersion
    };
  }

  /**
   * 检测是否为移动设备
   * @returns {Boolean} 是否为移动设备
   */
  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * 获取完整的兼容性报告
   * @returns {Promise<Object>} 完整的兼容性报告
   */
  async getFullCompatibilityReport() {
    const webgpuSupport = await this.checkWebGPUSupport();
    const webglSupport = this.checkWebGLSupport();
    const performance = this.checkDevicePerformance();
    const browserInfo = this.getBrowserInfo();
    const isMobile = this.isMobileDevice();

    // 确定最佳执行策略
    let recommendedStrategy = "远程API";
    let expectedPerformance = "低";

    if (webgpuSupport.supported) {
      recommendedStrategy = "WebGPU";
      expectedPerformance = "最佳";
    } else if (webglSupport.supported) {
      recommendedStrategy = "WebGL";
      expectedPerformance = "良好";
    } else if (performance.performanceTier !== "low") {
      recommendedStrategy = "WASM CPU";
      expectedPerformance = "中等";
    }

    return {
      browser: browserInfo,
      isMobile,
      webgpu: webgpuSupport,
      webgl: webglSupport,
      performance,
      recommendedStrategy,
      expectedPerformance
    };
  }
}

// 创建单例实例
const compatibilityService = new CompatibilityService();
export default compatibilityService;

<template>
  <div class="app-container">
    <header class="app-header">
      <div class="container header-content">
        <div class="logo-section">
          <h1 class="app-title">jsPPT</h1>
          <div class="app-subtitle">AI演示文稿生成器</div>
        </div>
        <div class="header-actions" v-if="modelLoaded">
          <button @click="showSettings = true" class="btn btn-sm btn-outline">
            <span class="icon">⚙️</span> 设置
          </button>
          <button @click="showHelp = true" class="btn btn-sm btn-outline">
            <span class="icon">❓</span> 帮助
          </button>
        </div>
      </div>
    </header>

    <main class="app-main">
      <!-- 模型加载界面 -->
      <div v-if="!modelLoaded" class="model-loading container">
        <div class="loading-card">
          <h2>准备AI模型</h2>
          <div class="model-info">
            <div class="model-icon">🤖</div>
            <div class="model-details">
              <p class="model-name">Qwen 3.0-0.6B</p>
              <p class="model-description">轻量级AI模型，适合在浏览器中运行</p>
            </div>
          </div>

          <div class="progress-section">
            <div class="progress-status">
              <span>{{ loadingStage }}</span>
              <span>{{ progressText }}</span>
            </div>
            <div class="progress-bar">
              <div class="progress" :style="{ width: `${progress * 100}%` }"></div>
            </div>
          </div>

          <button
            @click="loadModel"
            :disabled="isLoading"
            class="btn btn-primary load-btn"
          >
            {{ isLoading ? '加载中...' : '开始加载' }}
          </button>

          <div class="compatibility-info">
            <h3>浏览器兼容性</h3>
            <div class="compatibility-status" :class="{'status-ok': compatibilityInfo.supported, 'status-warning': !compatibilityInfo.supported}">
              <span class="status-icon">{{ compatibilityInfo.supported ? '✅' : '⚠️' }}</span>
              <div class="status-details">
                <p v-if="compatibilityInfo.supported">
                  您的浏览器支持 {{ compatibilityInfo.accelerationMethod }}，可以获得最佳体验。
                </p>
                <p v-else>
                  您的浏览器可能不支持最佳的AI加速方式。{{ compatibilityInfo.reason }}
                </p>
              </div>
            </div>

            <div class="advanced-options">
              <details>
                <summary>高级选项</summary>
                <div class="options-content">
                  <div class="option-group">
                    <label for="execution-mode">执行模式:</label>
                    <select id="execution-mode" v-model="executionMode" class="select-input">
                      <option v-for="option in modelServiceOptions" :key="option.id" :value="option.id">
                        {{ option.name }}
                      </option>
                    </select>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>

      <!-- 编辑器界面 -->
      <div v-else class="editor-container container">
        <div class="editor-header">
          <h2>创建演示文稿</h2>
          <div class="theme-selector">
            <label for="theme-select">主题:</label>
            <select id="theme-select" v-model="selectedTheme" class="select-input">
              <option v-for="theme in availableThemes" :key="theme.id" :value="theme.id">
                {{ theme.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="editor-content">
          <div class="input-section">
            <div class="section-header">
              <h3>输入您的演示文稿主题</h3>
              <div class="input-actions">
                <button @click="clearPrompt" class="btn btn-sm btn-text" :disabled="!prompt">
                  <span class="icon">🗑️</span> 清空
                </button>
                <button @click="insertTemplate" class="btn btn-sm btn-text">
                  <span class="icon">📋</span> 模板
                </button>
              </div>
            </div>

            <textarea
              v-model="prompt"
              placeholder="例如：人工智能在医疗领域的应用与未来发展"
              rows="5"
              class="prompt-input"
              :disabled="isGenerating"
            ></textarea>

            <div class="generation-options">
              <div class="option-group">
                <label for="slide-count">幻灯片数量:</label>
                <select id="slide-count" v-model="slideCount" class="select-input">
                  <option value="auto">自动</option>
                  <option value="5">5张</option>
                  <option value="10">10张</option>
                  <option value="15">15张</option>
                  <option value="20">20张</option>
                </select>
              </div>

              <div class="option-group">
                <label for="style">风格:</label>
                <select id="style" v-model="presentationStyle" class="select-input">
                  <option value="professional">专业</option>
                  <option value="academic">学术</option>
                  <option value="creative">创意</option>
                  <option value="minimal">简约</option>
                </select>
              </div>
            </div>

            <button
              @click="generatePresentation"
              :disabled="isGenerating || !prompt"
              class="btn btn-primary generate-btn"
            >
              <span v-if="isGenerating">
                <span class="loading-spinner"></span>
                生成中...
              </span>
              <span v-else>生成演示文稿</span>
            </button>
          </div>

          <div v-if="markdown" class="output-section">
            <div class="section-header">
              <h3>生成的演示文稿</h3>
              <div class="output-info">
                <span class="slide-count-badge">{{ generatedSlideCount }}张幻灯片</span>
              </div>
            </div>

            <div class="markdown-preview">
              <pre>{{ markdown }}</pre>
            </div>

            <div class="actions">
              <button @click="editMarkdown" class="btn btn-secondary">
                <span class="icon">✏️</span> 编辑
              </button>
              <button @click="previewPresentation" class="btn btn-primary">
                <span class="icon">👁️</span> 预览
              </button>
              <button @click="exportPDF" class="btn btn-secondary">
                <span class="icon">📄</span> PDF
              </button>
              <button @click="exportPPTX" class="btn btn-secondary">
                <span class="icon">📊</span> PPTX
              </button>
            </div>
          </div>

          <div v-else-if="modelLoaded && !isGenerating" class="empty-output">
            <div class="empty-state">
              <div class="empty-icon">🎬</div>
              <h3>准备好创建演示文稿了吗？</h3>
              <p>输入您的主题，AI将为您生成一个完整的演示文稿。</p>
              <div class="example-prompts">
                <p>示例主题:</p>
                <button
                  v-for="(example, index) in examplePrompts"
                  :key="index"
                  @click="useExamplePrompt(example)"
                  class="example-btn"
                >
                  {{ example }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 预览组件 -->
    <MarpPreview
      v-if="showPreview"
      :markdown="markdown"
      :initialTheme="selectedTheme"
      @close="showPreview = false"
      @theme-change="updateTheme"
      @export="handleExport"
    />

    <!-- 设置对话框 -->
    <div v-if="showSettings" class="modal-overlay" @click.self="showSettings = false">
      <div class="modal-container">
        <div class="modal-header">
          <h2>设置</h2>
          <button class="close-btn" @click="showSettings = false">×</button>
        </div>
        <div class="modal-content">
          <div class="settings-section">
            <h3>模型设置</h3>
            <div class="setting-group">
              <label for="model-service">执行模式:</label>
              <select id="model-service" v-model="executionMode" class="select-input">
                <option v-for="option in modelServiceOptions" :key="option.id" :value="option.id">
                  {{ option.name }}
                </option>
              </select>
            </div>
            <p class="setting-description">
              选择模型的执行方式。自动模式会根据您的浏览器和设备性能选择最佳方式。
            </p>
          </div>

          <div class="settings-section">
            <h3>外观设置</h3>
            <div class="setting-group">
              <label for="default-theme">默认主题:</label>
              <select id="default-theme" v-model="selectedTheme" class="select-input">
                <option v-for="theme in availableThemes" :key="theme.id" :value="theme.id">
                  {{ theme.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="settings-section">
            <h3>关于</h3>
            <p>jsPPT 版本: 1.0.0</p>
            <p>使用 Vue.js 和 Marp 构建</p>
            <p>模型: Qwen 3.0-0.6B</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showSettings = false" class="btn btn-primary">确定</button>
        </div>
      </div>
    </div>

    <!-- 帮助对话框 -->
    <div v-if="showHelp" class="modal-overlay" @click.self="showHelp = false">
      <div class="modal-container">
        <div class="modal-header">
          <h2>使用帮助</h2>
          <button class="close-btn" @click="showHelp = false">×</button>
        </div>
        <div class="modal-content">
          <div class="help-section">
            <h3>快速开始</h3>
            <ol class="help-steps">
              <li>在输入框中输入您的演示文稿主题</li>
              <li>点击"生成演示文稿"按钮</li>
              <li>等待AI生成内容</li>
              <li>使用"预览"按钮查看效果</li>
              <li>使用"PDF"或"PPTX"按钮导出</li>
            </ol>
          </div>

          <div class="help-section">
            <h3>提示技巧</h3>
            <ul class="help-tips">
              <li>使用具体、明确的主题描述获得更好的结果</li>
              <li>可以指定目标受众，如"面向高中生的太阳系介绍"</li>
              <li>可以指定风格，如"简约风格的项目计划演示"</li>
              <li>生成后可以编辑Markdown内容进行自定义</li>
            </ul>
          </div>

          <div class="help-section">
            <h3>键盘快捷键</h3>
            <div class="shortcut-list">
              <div class="shortcut-item">
                <span class="shortcut-key">Ctrl+Enter</span>
                <span class="shortcut-desc">生成演示文稿</span>
              </div>
              <div class="shortcut-item">
                <span class="shortcut-key">Esc</span>
                <span class="shortcut-desc">关闭预览</span>
              </div>
              <div class="shortcut-item">
                <span class="shortcut-key">←/→</span>
                <span class="shortcut-desc">预览中切换幻灯片</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showHelp = false" class="btn btn-primary">了解了</button>
        </div>
      </div>
    </div>

    <footer class="app-footer">
      <div class="container">
        <p>&copy; {{ new Date().getFullYear() }} jsPPT - 基于Web技术的AI演示文稿生成器</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import MarpPreview from './components/MarpPreview.vue';
import modelServiceFactory from './services/modelServiceFactory';
import { previewPresentation, exportToPDF, exportToPPTX, getAvailableThemes } from './services/exportService';
import compatibilityService from './services/compatibilityService';

export default {
  components: {
    MarpPreview
  },
  setup() {
    // 状态变量
    const modelLoaded = ref(false);
    const isLoading = ref(false);
    const progress = ref(0);
    const loadingStage = ref('准备中');
    const prompt = ref('');
    const markdown = ref('');
    const isGenerating = ref(false);
    const showPreview = ref(false);
    const showSettings = ref(false);
    const showHelp = ref(false);
    const isEditingMarkdown = ref(false);
    const modelService = ref(null);
    const executionMode = ref('wasm'); // 默认使用CPU模式
    const selectedTheme = ref('default');
    const slideCount = ref('auto');
    const presentationStyle = ref('professional');
    const generatedSlideCount = ref(0);
    const availableThemes = ref(getAvailableThemes());
    const modelServiceOptions = ref(modelServiceFactory.getModelServiceOptions());
    const compatibilityInfo = ref({
      supported: false,
      accelerationMethod: '',
      reason: '正在检测兼容性...'
    });

    // 示例提示词
    const examplePrompts = [
      '人工智能在医疗领域的应用与未来发展',
      '可持续发展与环保科技创新',
      '数字化转型对企业的影响',
      '太空探索的历史与未来展望',
      '现代教育技术与学习方式变革'
    ];

    // 计算属性
    const progressText = computed(() => {
      const percentage = Math.round(progress.value * 100);
      return `${percentage}%`;
    });

    // 监听执行模式变化
    watch(executionMode, (newMode) => {
      console.log('执行模式已更改为:', newMode);
      // 如果模型已加载，提示用户需要重新加载
      if (modelLoaded.value) {
        alert('执行模式已更改，需要重新加载模型才能生效。');
      }
    });

    // 监听markdown变化，计算幻灯片数量
    watch(markdown, (newMarkdown) => {
      if (newMarkdown) {
        // 计算幻灯片数量（通过计算 "---" 分隔符的数量 + 1）
        const separatorCount = (newMarkdown.match(/\n---\n/g) || []).length;
        generatedSlideCount.value = separatorCount + 1;
      } else {
        generatedSlideCount.value = 0;
      }
    });

    // 检查浏览器兼容性
    const checkCompatibility = async () => {
      try {
        const compatibilityReport = await compatibilityService.getFullCompatibilityReport();
        console.log('兼容性报告:', compatibilityReport);

        if (compatibilityReport.webgpu.supported) {
          compatibilityInfo.value = {
            supported: true,
            accelerationMethod: 'WebGPU',
            reason: ''
          };
          return;
        }

        if (compatibilityReport.webgl.supported) {
          compatibilityInfo.value = {
            supported: true,
            accelerationMethod: 'WebGL',
            reason: ''
          };
          return;
        }

        // 检查设备性能
        if (compatibilityReport.performance.performanceTier !== 'low') {
          compatibilityInfo.value = {
            supported: true,
            accelerationMethod: 'WASM',
            reason: ''
          };
          return;
        }

        compatibilityInfo.value = {
          supported: false,
          accelerationMethod: '',
          reason: '您的设备性能可能不足以流畅运行AI模型。建议使用最新版Chrome或Edge浏览器，或使用性能更好的设备。'
        };
      } catch (error) {
        console.error('兼容性检测失败:', error);
        compatibilityInfo.value = {
          supported: false,
          accelerationMethod: '',
          reason: '兼容性检测失败，建议使用最新版Chrome或Edge浏览器。'
        };
      }
    };

    // 加载模型
    const loadModel = async () => {
      if (isLoading.value) return;

      isLoading.value = true;
      progress.value = 0;
      loadingStage.value = '准备中';

      try {
        // 创建适合当前浏览器的模型服务
        const options = {
          forceService: executionMode.value === 'auto' ? null : executionMode.value
        };

        loadingStage.value = '初始化模型服务';
        modelService.value = await modelServiceFactory.createModelService(options);

        // 加载模型
        await modelService.value.loadModel({
          onProgress: (p) => {
            progress.value = p;

            // 获取当前加载阶段
            if (modelService.value.getLoadingStage) {
              loadingStage.value = modelService.value.getLoadingStage();
            } else {
              // 兼容旧版模型服务
              if (p < 0.1) {
                loadingStage.value = '准备下载';
              } else if (p < 0.8) {
                loadingStage.value = '下载模型文件';
              } else if (p < 0.9) {
                loadingStage.value = '加载模型到内存';
              } else {
                loadingStage.value = '初始化模型';
              }
            }
          },
          onSuccess: () => {
            modelLoaded.value = true;
            loadingStage.value = '加载完成';
          },
          onError: (error) => {
            alert(`模型加载失败: ${error.message}`);
            loadingStage.value = '加载失败';
          }
        });
      } catch (error) {
        console.error('模型加载失败:', error);
        alert(`模型加载失败: ${error.message}`);
        loadingStage.value = '加载失败';
      } finally {
        isLoading.value = false;
      }
    };

    // 生成演示文稿
    const generatePresentation = async () => {
      if (!prompt.value || isGenerating.value) return;

      isGenerating.value = true;

      try {
        // 构建完整提示词，包含幻灯片数量和风格
        let fullPrompt = prompt.value;

        if (slideCount.value !== 'auto') {
          fullPrompt += `\n请生成${slideCount.value}张幻灯片。`;
        }

        if (presentationStyle.value !== 'professional') {
          const styleMap = {
            academic: '学术',
            creative: '创意',
            minimal: '简约'
          };
          fullPrompt += `\n风格要求：${styleMap[presentationStyle.value]}。`;
        }

        // 生成Markdown
        const result = await modelService.value.generateMarpMarkdown(fullPrompt);

        // 确保Markdown包含主题设置
        if (result.includes('theme:')) {
          markdown.value = result.replace(/theme:.*\n/, `theme: ${selectedTheme.value}\n`);
        } else {
          const metadataEnd = result.indexOf('---\n\n');
          if (metadataEnd > 0) {
            markdown.value = result.slice(0, metadataEnd) + `theme: ${selectedTheme.value}\n` + result.slice(metadataEnd);
          } else {
            markdown.value = result;
          }
        }
      } catch (error) {
        console.error('生成失败:', error);
        alert(`生成失败: ${error.message}`);
      } finally {
        isGenerating.value = false;
      }
    };

    // 清空提示词
    const clearPrompt = () => {
      prompt.value = '';
    };

    // 插入模板
    const insertTemplate = () => {
      prompt.value = '请为我创建一个关于[主题]的演示文稿，目标受众是[受众]，风格要求[风格]。';
    };

    // 使用示例提示词
    const useExamplePrompt = (example) => {
      prompt.value = example;
    };

    // 编辑Markdown
    const editMarkdown = () => {
      isEditingMarkdown.value = true;
      // 这里可以添加Markdown编辑器的逻辑
      alert('Markdown编辑功能即将推出，敬请期待！');
    };

    // 预览演示文稿
    const handlePreviewPresentation = () => {
      showPreview.value = true;
    };

    // 更新主题
    const updateTheme = (theme) => {
      selectedTheme.value = theme;
    };

    // 处理导出事件
    const handleExport = (exportInfo) => {
      console.log('导出信息:', exportInfo);
      // 可以在这里添加导出统计或其他逻辑
    };

    // 导出为PDF
    const handleExportPDF = async () => {
      try {
        await exportToPDF(markdown.value, 'presentation.pdf', selectedTheme.value);
      } catch (error) {
        console.error('PDF导出失败:', error);
        alert(`PDF导出失败: ${error.message}`);
      }
    };

    // 导出为PPTX
    const handleExportPPTX = async () => {
      try {
        await exportToPPTX(markdown.value, 'presentation.pptx', selectedTheme.value);
      } catch (error) {
        console.error('PPTX导出失败:', error);
        alert(`PPTX导出失败: ${error.message}`);
      }
    };

    // 键盘快捷键处理
    const handleKeyDown = (e) => {
      // Ctrl+Enter 生成演示文稿
      if (e.ctrlKey && e.key === 'Enter' && !isGenerating.value && prompt.value) {
        generatePresentation();
      }

      // Esc 关闭预览
      if (e.key === 'Escape') {
        if (showPreview.value) showPreview.value = false;
        if (showSettings.value) showSettings.value = false;
        if (showHelp.value) showHelp.value = false;
      }
    };

    // 组件挂载时自动检查兼容性
    onMounted(() => {
      checkCompatibility();

      // 添加键盘事件监听
      window.addEventListener('keydown', handleKeyDown);

      // 自动加载模型（可选）
      // loadModel();
    });

    // 组件卸载前释放模型资源
    onBeforeUnmount(() => {
      if (modelService.value) {
        modelService.value.unloadModel();
      }

      // 移除键盘事件监听
      window.removeEventListener('keydown', handleKeyDown);
    });

    return {
      // 状态
      modelLoaded,
      isLoading,
      progress,
      loadingStage,
      prompt,
      markdown,
      isGenerating,
      showPreview,
      showSettings,
      showHelp,
      isEditingMarkdown,
      executionMode,
      selectedTheme,
      slideCount,
      presentationStyle,
      generatedSlideCount,
      availableThemes,
      modelServiceOptions,
      compatibilityInfo,
      examplePrompts,

      // 计算属性
      progressText,

      // 方法
      loadModel,
      generatePresentation,
      clearPrompt,
      insertTemplate,
      useExamplePrompt,
      editMarkdown,
      previewPresentation: handlePreviewPresentation,
      updateTheme,
      handleExport,
      exportPDF: handleExportPDF,
      exportPPTX: handleExportPPTX
    };
  }
};
</script>

<style>
:root {
  --color-primary: #4361ee;
  --color-secondary: #3a0ca3;
  --color-accent: #f72585;
  --color-text: #333333;
  --color-text-light: #666666;
  --color-background: #f5f7fa;
  --color-card: #ffffff;
  --color-border: #e1e4e8;

  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;

  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.1);

  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family);
  color: var(--color-text);
  background-color: var(--color-background);
  line-height: 1.6;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-secondary);
}

.btn-secondary {
  background-color: white;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn-secondary:hover {
  background-color: var(--color-primary);
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
  padding: var(--spacing-md) 0;
  text-align: center;
}

.app-title {
  font-size: 2rem;
  margin-bottom: var(--spacing-xs);
}

.app-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

.app-main {
  flex: 1;
  padding: var(--spacing-lg) 0;
}

.app-footer {
  background-color: var(--color-text);
  color: white;
  padding: var(--spacing-md) 0;
  text-align: center;
  margin-top: auto;
}

.model-loading {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.progress-bar {
  height: 20px;
  background-color: var(--color-border);
  border-radius: var(--radius-md);
  margin: var(--spacing-md) 0;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: var(--color-primary);
  transition: width 0.3s ease;
}

.progress-text {
  margin-bottom: var(--spacing-md);
}

.compatibility-info {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--color-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.warning {
  color: #e63946;
}

.editor-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-lg);
}

@media (min-width: 992px) {
  .editor-container {
    grid-template-columns: 1fr 1fr;
  }
}

.input-section, .output-section {
  background-color: var(--color-card);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}

.prompt-input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-size: 1rem;
  margin: var(--spacing-md) 0;
  resize: vertical;
}

.generate-btn {
  width: 100%;
}

.markdown-preview {
  background-color: var(--color-background);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin: var(--spacing-md) 0;
  max-height: 400px;
  overflow-y: auto;
  white-space: pre-wrap;
  font-family: monospace;
}

.actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  margin-top: var(--spacing-md);
}

@media (max-width: 768px) {
  .actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    margin-bottom: var(--spacing-sm);
  }
}
</style>

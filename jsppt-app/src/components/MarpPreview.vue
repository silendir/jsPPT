<template>
  <div class="preview-overlay" @click.self="$emit('close')">
    <div class="preview-container">
      <div class="preview-header">
        <div class="preview-title">
          <h2>演示文稿预览</h2>
          <span class="slide-count" v-if="slideCount > 0">{{ slideCount }}张幻灯片</span>
        </div>
        <div class="preview-controls">
          <div class="theme-selector">
            <label for="theme-select">主题：</label>
            <select id="theme-select" v-model="selectedTheme" @change="changeTheme">
              <option v-for="theme in availableThemes" :key="theme.id" :value="theme.id">
                {{ theme.name }}
              </option>
            </select>
          </div>
          <div class="export-buttons">
            <button class="btn btn-sm" @click="exportPDF">导出PDF</button>
            <button class="btn btn-sm" @click="exportPPTX">导出PPTX</button>
          </div>
          <button class="close-btn" @click="$emit('close')">×</button>
        </div>
      </div>
      <div class="preview-content">
        <div class="loading-indicator" v-if="isLoading">
          <div class="spinner"></div>
          <p>正在渲染...</p>
        </div>
        <div v-else class="marp-preview" ref="previewContainer" v-html="renderedHTML"></div>
      </div>
      <div class="preview-footer">
        <div class="navigation-controls">
          <button class="nav-btn" @click="prevSlide" :disabled="currentSlide <= 0">上一页</button>
          <span class="slide-indicator">{{ currentSlide + 1 }} / {{ slideCount }}</span>
          <button class="nav-btn" @click="nextSlide" :disabled="currentSlide >= slideCount - 1">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
import { getAvailableThemes, exportToPDF, exportToPPTX } from '../services/exportService';

export default {
  props: {
    markdown: {
      type: String,
      required: true
    },
    initialTheme: {
      type: String,
      default: 'default'
    }
  },
  emits: ['close', 'theme-change', 'export'],
  setup(props, { emit }) {
    const renderedHTML = ref('');
    const isLoading = ref(true);
    const slideCount = ref(0);
    const currentSlide = ref(0);
    const selectedTheme = ref(props.initialTheme);
    const availableThemes = ref(getAvailableThemes());
    const previewContainer = ref(null);

    // 获取当前主题名称
    const currentThemeName = computed(() => {
      const theme = availableThemes.value.find(t => t.id === selectedTheme.value);
      return theme ? theme.name : '默认主题';
    });

    // 渲染Markdown为HTML
    const renderMarkdown = async () => {
      try {
        isLoading.value = true;

        // 确保Markdown包含Marp前置元数据
        let markdownContent = props.markdown;

        // 检查是否已有前置元数据
        if (markdownContent.startsWith('---\n')) {
          // 已有元数据，检查是否包含theme设置
          if (!markdownContent.includes('theme:')) {
            // 在元数据中添加theme
            markdownContent = markdownContent.replace('---\n', `---\ntheme: ${selectedTheme.value}\n`);
          } else {
            // 替换现有theme
            markdownContent = markdownContent.replace(/theme:.*\n/, `theme: ${selectedTheme.value}\n`);
          }
        } else if (!markdownContent.startsWith('---\nmarp: true')) {
          // 没有元数据，添加完整元数据
          markdownContent = `---\nmarp: true\ntheme: ${selectedTheme.value}\npaginate: true\n---\n\n${markdownContent}`;
        }

        try {
          // 动态导入Marp库
          const { Marp } = await import('@marp-team/marp-core');

          // 创建Marp实例
          const marp = new Marp({
            inlineSVG: true,
            html: true,
            math: true
          });

          // 渲染Markdown
          const { html, css } = marp.render(markdownContent);

          // 创建完整HTML
          const fullHTML = `
            <style>${css}</style>
            ${html}
          `;

          // 设置HTML内容
          renderedHTML.value = fullHTML;

          // 计算幻灯片数量
          const slideMatches = html.match(/<section/g);
          slideCount.value = slideMatches ? slideMatches.length : 0;

          // 如果没有幻灯片，可能是渲染失败
          if (slideCount.value === 0) {
            console.warn('未检测到幻灯片，可能渲染失败');
            // 使用备用方法计算幻灯片数量
            const slides = markdownContent.split(/\n---\n/);
            slideCount.value = slides.length;
          }
        } catch (error) {
          console.error('Marp渲染错误:', error);

          // 使用备用渲染方法
          const slides = markdownContent.split(/\n---\n/);

          // 创建HTML
          let html = '<div class="marp-slides">';

          // 处理每张幻灯片
          slides.forEach((slide, index) => {
            // 移除前置元数据（如果是第一张幻灯片）
            if (index === 0 && slide.startsWith('---')) {
              const metadataEnd = slide.indexOf('---', 3) + 3;
              if (metadataEnd > 2) {
                slide = slide.substring(metadataEnd).trim();
              }
            }

            // 简单的Markdown到HTML转换
            let slideContent = slide
              // 标题转换
              .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
              .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
              .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
              // 列表转换
              .replace(/^- (.*?)$/gm, '<li>$1</li>')
              .replace(/<\/li>\n<li>/g, '</li><li>')
              .replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>')
              // 段落转换
              .replace(/^([^<].*?)$/gm, '<p>$1</p>')
              .replace(/<p><\/p>/g, '')
              // 图片转换
              .replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" style="max-width: 100%;">')
              // 链接转换
              .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

            // 添加幻灯片
            html += `<section class="slide" id="slide-${index+1}">${slideContent}</section>`;
          });

          html += '</div>';

          // 设置HTML内容
          renderedHTML.value = html;

          // 设置幻灯片数量
          slideCount.value = slides.length;
        }
      } catch (error) {
        console.error('Markdown渲染失败:', error);
        renderedHTML.value = `<div class="error">渲染失败: ${error.message}</div>`;
        slideCount.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    // 切换主题
    const changeTheme = () => {
      emit('theme-change', selectedTheme.value);
      renderMarkdown();
    };

    // 导航到上一张幻灯片
    const prevSlide = () => {
      if (currentSlide.value > 0) {
        currentSlide.value--;
        navigateToSlide(currentSlide.value);
      }
    };

    // 导航到下一张幻灯片
    const nextSlide = () => {
      if (currentSlide.value < slideCount.value - 1) {
        currentSlide.value++;
        navigateToSlide(currentSlide.value);
      }
    };

    // 导航到指定幻灯片
    const navigateToSlide = (index) => {
      const sections = document.querySelectorAll('.marp-preview section');
      if (sections.length > 0 && sections[index]) {
        // 滚动到指定幻灯片
        sections[index].scrollIntoView({ behavior: 'smooth' });
      }
    };

    // 导出为PDF
    const exportPDF = async () => {
      try {
        emit('export', { type: 'pdf', theme: selectedTheme.value });
        await exportToPDF(props.markdown, 'presentation.pdf', selectedTheme.value);
      } catch (error) {
        console.error('PDF导出失败:', error);
        alert(`PDF导出失败: ${error.message}`);
      }
    };

    // 导出为PPTX
    const exportPPTX = async () => {
      try {
        emit('export', { type: 'pptx', theme: selectedTheme.value });
        await exportToPPTX(props.markdown, 'presentation.pptx', selectedTheme.value);
      } catch (error) {
        console.error('PPTX导出失败:', error);
        alert(`PPTX导出失败: ${error.message}`);
      }
    };

    // 键盘导航
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        prevSlide();
      } else if (e.key === 'Home') {
        currentSlide.value = 0;
        navigateToSlide(0);
      } else if (e.key === 'End') {
        currentSlide.value = slideCount.value - 1;
        navigateToSlide(slideCount.value - 1);
      }
    };

    // 监听markdown变化
    watch(() => props.markdown, () => {
      renderMarkdown();
    });

    // 监听initialTheme变化
    watch(() => props.initialTheme, (newTheme) => {
      selectedTheme.value = newTheme;
      renderMarkdown();
    });



    // 组件挂载时渲染
    onMounted(() => {
      renderMarkdown();

      // 添加键盘事件监听
      window.addEventListener('keydown', handleKeyDown);
    });

    // 组件卸载时清理
    onBeforeUnmount(() => {
      window.removeEventListener('keydown', handleKeyDown);
    });

    return {
      renderedHTML,
      isLoading,
      slideCount,
      currentSlide,
      selectedTheme,
      availableThemes,
      currentThemeName,
      changeTheme,
      prevSlide,
      nextSlide,
      exportPDF,
      exportPPTX
    };
  }
}
</script>

<style scoped>
.preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.preview-container {
  background-color: white;
  border-radius: 12px;
  width: 95%;
  max-width: 1400px;
  height: 95vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eaeaea;
  background-color: #f8f9fa;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-title h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.slide-count {
  font-size: 0.9rem;
  color: #666;
  background-color: #e9ecef;
  padding: 4px 8px;
  border-radius: 4px;
}

.preview-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.theme-selector label {
  font-size: 0.9rem;
  color: #555;
}

.theme-selector select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 0.9rem;
}

.export-buttons {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-sm {
  font-size: 0.85rem;
  padding: 5px 10px;
}

.btn:hover {
  opacity: 0.9;
}

.btn:first-child {
  background-color: #4361ee;
  color: white;
}

.btn:last-child {
  background-color: #3a0ca3;
  color: white;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #666;
  line-height: 1;
  padding: 0;
  margin-left: 10px;
}

.close-btn:hover {
  color: #333;
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f0f0f0;
  position: relative;
}

.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #4361ee;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-indicator p {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.marp-preview {
  height: 100%;
  overflow-y: auto;
  display: block;
}

.marp-slides {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.slide {
  background-color: white;
  margin: 0 auto 30px;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 1000px;
  aspect-ratio: 16 / 9;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
}

.error {
  color: #e63946;
  padding: 20px;
  text-align: center;
  font-weight: bold;
  background-color: #f8d7da;
  border-radius: 8px;
  margin: 20px;
}

.preview-footer {
  padding: 12px 20px;
  border-top: 1px solid #eaeaea;
  background-color: #f8f9fa;
}

.navigation-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.nav-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.nav-btn:hover:not(:disabled) {
  background-color: #f0f0f0;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slide-indicator {
  font-size: 0.9rem;
  color: #666;
  min-width: 60px;
  text-align: center;
}

/* 为Marp渲染的内容添加样式 */
:deep(.marp-preview) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

:deep(section) {
  background-color: white;
  margin: 0 auto 30px;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 1000px;
  aspect-ratio: 16 / 9;
  scroll-snap-align: start;
}

:deep(h1) {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

:deep(h2) {
  font-size: 2rem;
  margin-bottom: 0.8rem;
}

:deep(h3) {
  font-size: 1.5rem;
  margin-bottom: 0.6rem;
}

:deep(ul), :deep(ol) {
  margin-left: 2rem;
}

:deep(li) {
  margin-bottom: 0.5rem;
}

:deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

:deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
}

:deep(th), :deep(td) {
  border: 1px solid #ddd;
  padding: 8px;
}

:deep(th) {
  background-color: #f8f9fa;
  font-weight: bold;
}

:deep(blockquote) {
  border-left: 4px solid #4361ee;
  padding-left: 1rem;
  color: #666;
  font-style: italic;
}

:deep(code) {
  background-color: #f8f9fa;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .preview-container {
    width: 100%;
    height: 100vh;
    border-radius: 0;
  }

  .preview-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .preview-controls {
    width: 100%;
    flex-wrap: wrap;
  }

  .theme-selector {
    flex: 1;
    min-width: 150px;
  }

  .export-buttons {
    flex: 1;
    justify-content: flex-end;
  }

  .preview-content {
    padding: 10px;
  }

  :deep(section) {
    padding: 20px;
    margin-bottom: 20px;
  }

  :deep(h1) {
    font-size: 1.8rem;
  }

  :deep(h2) {
    font-size: 1.5rem;
  }

  :deep(h3) {
    font-size: 1.2rem;
  }
}
</style>

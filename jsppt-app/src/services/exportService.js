/**
 * 导出服务
 * 负责Markdown转换与输出为不同格式
 */

// 可用的主题列表
export const AVAILABLE_THEMES = [
  { id: 'default', name: '默认主题' },
  { id: 'gaia', name: 'Gaia' },
  { id: 'uncover', name: 'Uncover' },
  { id: 'bespoke', name: '现代简约' },
  { id: 'elegant', name: '优雅蓝' },
  { id: 'corporate', name: '商务专业' },
  { id: 'creative', name: '创意设计' },
  { id: 'minimal', name: '极简黑白' }
];

// 自定义主题CSS
const CUSTOM_THEMES = {
  bespoke: `
/* @theme bespoke */
section {
  background: #fafafa;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

h1 {
  font-size: 2.5rem;
  color: #2563eb;
  margin-bottom: 1rem;
}

h2 {
  font-size: 2rem;
  color: #3b82f6;
  margin-bottom: 0.8rem;
}

h3 {
  font-size: 1.5rem;
  color: #60a5fa;
  margin-bottom: 0.6rem;
}

ul, ol {
  margin-left: 1.5rem;
  line-height: 1.6;
}

li {
  margin-bottom: 0.5rem;
}

strong {
  color: #1e40af;
}

section::after {
  content: attr(data-marpit-pagination) '/' attr(data-marpit-pagination-total);
  font-size: 0.8rem;
  color: #94a3b8;
  position: absolute;
  bottom: 1rem;
  right: 1rem;
}

img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

blockquote {
  border-left: 4px solid #3b82f6;
  padding-left: 1rem;
  color: #64748b;
  font-style: italic;
}

table {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
}

th, td {
  border: 1px solid #e2e8f0;
  padding: 0.5rem;
  text-align: left;
}

th {
  background-color: #f1f5f9;
  font-weight: bold;
}

code {
  background-color: #f1f5f9;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
}

section.title {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: white;
  text-align: center;
}

section.title h1 {
  color: white;
  font-size: 3rem;
}

section.title h2 {
  color: rgba(255, 255, 255, 0.9);
  font-weight: normal;
}
`,

  elegant: `
/* @theme elegant */
section {
  background: linear-gradient(to bottom right, #f8f9fa, #e9ecef);
  color: #212529;
  font-family: 'Georgia', serif;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-top: 8px solid #4361ee;
}

h1 {
  font-size: 2.5rem;
  color: #1e40af;
  margin-bottom: 1rem;
  font-weight: normal;
  letter-spacing: -0.5px;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 0.5rem;
}

h2 {
  font-size: 2rem;
  color: #3b82f6;
  margin-bottom: 0.8rem;
  font-weight: normal;
}

h3 {
  font-size: 1.5rem;
  color: #4f46e5;
  margin-bottom: 0.6rem;
  font-style: italic;
}

ul, ol {
  margin-left: 1.5rem;
  line-height: 1.7;
}

li {
  margin-bottom: 0.7rem;
  position: relative;
}

li::marker {
  color: #4361ee;
}

strong {
  color: #1e3a8a;
  font-weight: 600;
}

em {
  color: #4f46e5;
  font-style: italic;
}

section::after {
  content: attr(data-marpit-pagination) '/' attr(data-marpit-pagination-total);
  font-size: 0.9rem;
  color: #6c757d;
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  font-family: 'Georgia', serif;
  font-style: italic;
}

img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid #dee2e6;
}

blockquote {
  border-left: 3px solid #4361ee;
  padding: 0.5rem 0 0.5rem 1.5rem;
  margin: 1.5rem 0;
  color: #495057;
  font-style: italic;
  background-color: rgba(67, 97, 238, 0.05);
}

table {
  border-collapse: collapse;
  width: 100%;
  margin: 1.5rem 0;
  border: 1px solid #dee2e6;
}

th, td {
  border: 1px solid #dee2e6;
  padding: 0.75rem;
  text-align: left;
}

th {
  background-color: #e9ecef;
  color: #212529;
  font-weight: bold;
}

tr:nth-child(even) {
  background-color: #f8f9fa;
}

code {
  font-family: 'Consolas', monospace;
  background-color: #f8f9fa;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  color: #e83e8c;
  border: 1px solid #dee2e6;
}

section.title {
  background: linear-gradient(135deg, #1e3a8a, #4361ee);
  color: white;
  text-align: center;
  border-top: none;
}

section.title h1 {
  color: white;
  font-size: 3rem;
  border-bottom: none;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

section.title h2 {
  color: rgba(255, 255, 255, 0.9);
  font-weight: normal;
}
`,

  corporate: `
/* @theme corporate */
section {
  background: white;
  color: #333;
  font-family: 'Arial', sans-serif;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border-left: 10px solid #0a66c2;
}

h1 {
  font-size: 2.4rem;
  color: #0a66c2;
  margin-bottom: 1rem;
  font-weight: bold;
}

h2 {
  font-size: 1.8rem;
  color: #0a66c2;
  margin-bottom: 0.8rem;
  font-weight: bold;
}

h3 {
  font-size: 1.4rem;
  color: #0a66c2;
  margin-bottom: 0.6rem;
  font-weight: bold;
}

ul, ol {
  margin-left: 1.5rem;
  line-height: 1.6;
}

li {
  margin-bottom: 0.5rem;
  position: relative;
}

li::marker {
  color: #0a66c2;
}

strong {
  color: #0a66c2;
  font-weight: bold;
}

section::after {
  content: attr(data-marpit-pagination) '/' attr(data-marpit-pagination-total);
  font-size: 0.8rem;
  color: #666;
  position: absolute;
  bottom: 1rem;
  right: 1rem;
}

img {
  max-width: 100%;
  height: auto;
  border: 1px solid #e0e0e0;
}

blockquote {
  border-left: 4px solid #0a66c2;
  padding-left: 1rem;
  color: #666;
  font-style: italic;
}

table {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
}

th, td {
  border: 1px solid #e0e0e0;
  padding: 0.75rem;
  text-align: left;
}

th {
  background-color: #0a66c2;
  color: white;
  font-weight: bold;
}

tr:nth-child(even) {
  background-color: #f5f5f5;
}

code {
  background-color: #f5f5f5;
  padding: 0.2rem 0.4rem;
  border-radius: 2px;
  font-family: 'Courier New', Courier, monospace;
  color: #0a66c2;
}

section.title {
  background: linear-gradient(to right, #0a66c2, #0077b6);
  color: white;
  text-align: center;
  border-left: none;
}

section.title h1 {
  color: white;
  font-size: 2.8rem;
}

section.title h2 {
  color: rgba(255, 255, 255, 0.9);
  font-weight: normal;
}

section.title::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(to right, #0a66c2, #0077b6);
}
`,

  creative: `
/* @theme creative */
section {
  background: #fefefe;
  color: #333;
  font-family: 'Montserrat', sans-serif;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-image:
    radial-gradient(circle at 10% 20%, rgba(255, 107, 107, 0.05) 0%, transparent 20%),
    radial-gradient(circle at 90% 80%, rgba(107, 107, 255, 0.05) 0%, transparent 20%);
  border-radius: 10px;
  overflow: hidden;
}

h1 {
  font-size: 2.8rem;
  color: #ff6b6b;
  margin-bottom: 1.2rem;
  font-weight: 700;
  letter-spacing: -1px;
  position: relative;
}

h1::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 50px;
  height: 4px;
  background: #ff6b6b;
  border-radius: 2px;
}

h2 {
  font-size: 2.2rem;
  color: #6b6bff;
  margin-bottom: 1rem;
  font-weight: 600;
}

h3 {
  font-size: 1.6rem;
  color: #6b6bff;
  margin-bottom: 0.8rem;
  font-weight: 600;
}

ul, ol {
  margin-left: 1.5rem;
  line-height: 1.7;
}

li {
  margin-bottom: 0.7rem;
  position: relative;
}

li::marker {
  color: #ff6b6b;
}

strong {
  color: #ff6b6b;
  font-weight: 700;
}

em {
  color: #6b6bff;
  font-style: italic;
}

section::after {
  content: attr(data-marpit-pagination) '/' attr(data-marpit-pagination-total);
  font-size: 0.9rem;
  color: #888;
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
}

img {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

blockquote {
  border-left: 4px solid #ff6b6b;
  padding: 0.8rem 0 0.8rem 1.5rem;
  margin: 1.5rem 0;
  color: #666;
  font-style: italic;
  background-color: rgba(255, 107, 107, 0.05);
  border-radius: 0 10px 10px 0;
}

table {
  border-collapse: collapse;
  width: 100%;
  margin: 1.5rem 0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

th, td {
  padding: 1rem;
  text-align: left;
}

th {
  background-color: #ff6b6b;
  color: white;
  font-weight: 600;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #f5f5f5;
}

code {
  font-family: 'Fira Code', monospace;
  background-color: #f5f5f5;
  padding: 0.2rem 0.5rem;
  border-radius: 5px;
  color: #ff6b6b;
  font-size: 0.9em;
}

section.title {
  background: linear-gradient(135deg, #ff6b6b, #6b6bff);
  color: white;
  text-align: center;
}

section.title h1 {
  color: white;
  font-size: 3.5rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

section.title h1::after {
  background: white;
  width: 100px;
  left: 50%;
  transform: translateX(-50%);
}

section.title h2 {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
}
`,

  minimal: `
/* @theme minimal */
section {
  background: white;
  color: #222;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

h1 {
  font-size: 2.5rem;
  color: black;
  margin-bottom: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 1.2rem;
  font-weight: 600;
}

h3 {
  font-size: 1.5rem;
  color: #444;
  margin-bottom: 1rem;
  font-weight: 600;
}

ul, ol {
  margin-left: 1.5rem;
  line-height: 1.6;
}

li {
  margin-bottom: 0.8rem;
}

strong {
  font-weight: 700;
}

section::after {
  content: attr(data-marpit-pagination);
  font-size: 0.8rem;
  color: #999;
  position: absolute;
  bottom: 1rem;
  right: 1rem;
}

img {
  max-width: 100%;
  height: auto;
  border: none;
}

blockquote {
  border-left: 2px solid #ddd;
  padding-left: 1rem;
  color: #666;
  font-style: italic;
}

table {
  border-collapse: collapse;
  width: 100%;
  margin: 1.5rem 0;
}

th, td {
  border-bottom: 1px solid #eee;
  padding: 0.75rem;
  text-align: left;
}

th {
  border-bottom: 2px solid #ddd;
  font-weight: 700;
}

code {
  font-family: 'SF Mono', Menlo, Monaco, Consolas, monospace;
  background-color: #f5f5f5;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.9em;
}

section.title {
  background: black;
  color: white;
  text-align: center;
}

section.title h1 {
  color: white;
  font-size: 3rem;
}

section.title h2 {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
}
`
};

/**
 * 确保Markdown包含Marp前置元数据
 * @param {String} markdown Markdown内容
 * @param {String} theme 主题名称
 * @returns {String} 添加了Marp元数据的Markdown
 */
function ensureMarpMetadata(markdown, theme = 'default') {
  // 检查是否已有前置元数据
  if (markdown.startsWith('---\n')) {
    // 已有元数据，检查是否包含marp: true
    if (!markdown.includes('marp: true')) {
      // 在元数据中添加marp: true
      markdown = markdown.replace('---\n', '---\nmarp: true\n');
    }

    // 检查是否已有theme设置
    if (!markdown.includes('theme:')) {
      // 在元数据中添加theme
      markdown = markdown.replace('---\n', `---\ntheme: ${theme}\n`);
    } else {
      // 替换现有theme
      markdown = markdown.replace(/theme:.*\n/, `theme: ${theme}\n`);
    }

    // 检查是否已有paginate设置
    if (!markdown.includes('paginate:')) {
      // 在元数据中添加paginate
      markdown = markdown.replace('---\n', '---\npaginate: true\n');
    }

    return markdown;
  } else {
    // 没有元数据，添加完整元数据
    return `---
marp: true
theme: ${theme}
paginate: true
---

${markdown}`;
  }
}

/**
 * 将Markdown渲染为HTML
 * @param {String} markdown Markdown内容
 * @param {String} theme 主题名称
 * @returns {Promise<Object>} 渲染结果，包含HTML和CSS
 */
async function renderMarkdownToHTML(markdown, theme = 'default') {
  try {
    // 动态导入Marp库以减小初始加载体积
    const { Marp } = await import('@marp-team/marp-core');

    // 创建Marp实例
    const marp = new Marp({
      inlineSVG: true,
      html: true, // 允许HTML标签
      math: true, // 支持数学公式
      minifyCSS: false // 不压缩CSS以便于调试
    });

    // 添加自定义主题
    Object.entries(CUSTOM_THEMES).forEach(([themeId, css]) => {
      marp.themeSet.add(css);
    });

    // 确保Markdown包含正确的元数据
    const processedMarkdown = ensureMarpMetadata(markdown, theme);

    // 渲染Markdown
    const { html, css, comments } = marp.render(processedMarkdown);

    // 将CSS嵌入到HTML中
    const fullHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>jsPPT演示文稿</title>
  <style>
    /* 基础样式 */
    body {
      margin: 0;
      padding: 0;
      background-color: #f0f0f0;
    }
    .marp-container {
      width: 100%;
      height: 100%;
      overflow: auto;
    }
    /* Marp主题样式 */
    ${css}
    /* 打印优化 */
    @media print {
      body {
        background-color: white;
      }
      .marp-container {
        width: 100%;
        height: auto;
      }
    }
  </style>
  <script>
    // 简单的幻灯片导航功能
    document.addEventListener('DOMContentLoaded', () => {
      const sections = document.querySelectorAll('section');
      let currentSlide = 0;

      function goToSlide(index) {
        if (index >= 0 && index < sections.length) {
          sections[currentSlide].style.display = 'none';
          currentSlide = index;
          sections[currentSlide].style.display = 'flex';
        }
      }

      // 初始化显示第一张幻灯片
      sections.forEach((section, index) => {
        section.style.display = index === 0 ? 'flex' : 'none';
      });

      // 键盘导航
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
          goToSlide(currentSlide + 1);
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          goToSlide(currentSlide - 1);
        } else if (e.key === 'Home') {
          goToSlide(0);
        } else if (e.key === 'End') {
          goToSlide(sections.length - 1);
        }
      });

      // 添加触摸滑动支持
      let touchStartX = 0;
      document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
      });
      document.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > 50) { // 最小滑动距离
          if (diff > 0) {
            // 向左滑动，下一张
            goToSlide(currentSlide + 1);
          } else {
            // 向右滑动，上一张
            goToSlide(currentSlide - 1);
          }
        }
      });
    });
  </script>
</head>
<body>
  <div class="marp-container">
    ${html}
  </div>
</body>
</html>
    `;

    return {
      html: fullHTML,
      rawHtml: html,
      css,
      comments,
      slideCount: (html.match(/<section/g) || []).length
    };
  } catch (error) {
    console.error('Markdown渲染失败:', error);
    throw error;
  }
}

/**
 * 导出为PDF
 * @param {String} markdown Markdown内容
 * @param {String} filename 文件名
 * @param {String} theme 主题名称
 * @param {Object} options 导出选项
 * @returns {Promise<Boolean>} 是否导出成功
 */
/**
 * 导出为PDF（使用浏览器打印功能）
 *
 * 注意：此函数不再使用jsPDF库，而是直接使用浏览器的打印功能
 * 这样可以避免"Cannot access uninitialized variable"等错误
 *
 * @param {String} markdown Markdown内容
 * @param {String} filename 文件名（仅用于显示，实际文件名由浏览器打印功能决定）
 * @param {String} theme 主题名称
 * @param {Object} options 导出选项（仅用于兼容旧代码，不再使用）
 * @returns {Promise<Boolean>} 是否成功打开打印预览
 */
export async function exportToPDF(markdown, filename = 'presentation.pdf', theme = 'default', options = {}) {
  try {
    // 渲染Markdown为HTML
    const renderResult = await renderMarkdownToHTML(markdown, theme);
    const { html: fullHTML, slideCount } = renderResult;

    // 创建一个打印窗口
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('无法打开打印窗口，请检查浏览器是否阻止了弹出窗口');
    }

    // 提取样式
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = fullHTML;
    const styleContent = tempDiv.querySelector('style')?.innerHTML || '';

    // 使用字符串变量拼接HTML，避免Vue编译器解析HTML标签
    const doctype = '<!DOCTYPE html>';
    const htmlOpen = '<html>';
    const htmlClose = '</html>';
    const headOpen = '<head>';
    const headClose = '</head>';
    const bodyOpen = '<body>';
    const bodyClose = '</body>';
    const title = '<title>jsPPT演示文稿</title>';
    const styleOpen = '<style>';
    const styleClose = '</style>';
    const divOpen = '<div class="print-container">';
    const divClose = '</div>';

    // 创建样式内容
    const cssContent = `
      body { margin: 0; padding: 0; }
      .print-container { width: 100%; }
      section {
        page-break-after: always;
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 40px;
        box-sizing: border-box;
      }
      section:last-child { page-break-after: auto; }
      @media print {
        body { background: white; }
        section {
          height: 100%;
          page-break-inside: avoid;
        }
      }
      ${styleContent}
    `;

    // 创建脚本内容
    const scriptOpen = '<scr' + 'ipt>';
    const scriptClose = '</scr' + 'ipt>';
    const scriptBody = `
      // 自动打印
      window.onload = function() {
        setTimeout(function() {
          window.print();
        }, 500);
      };
    `;
    const scriptContent = scriptOpen + scriptBody + scriptClose;

    // 组合HTML内容
    const htmlContent =
      doctype +
      htmlOpen +
      headOpen +
      title +
      styleOpen +
      cssContent +
      styleClose +
      headClose +
      bodyOpen +
      divOpen +
      tempDiv.innerHTML +
      divClose +
      scriptContent +
      bodyClose +
      htmlClose;

    // 写入HTML内容
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    console.log(`成功打开PDF打印预览，共${slideCount}张幻灯片`);
    return true;
  } catch (error) {
    console.error('PDF导出失败:', error);
    throw error;
  }
}

/**
 * 导出为PPTX
 * @param {String} markdown Markdown内容
 * @param {String} filename 文件名
 * @param {String} theme 主题名称
 * @returns {Promise<Boolean>} 是否导出成功
 */
export async function exportToPPTX(markdown, filename = 'presentation.pptx', theme = 'default') {
  try {
    // 动态导入pptxgenjs库
    const pptxgenModule = await import('pptxgenjs');
    const pptxgen = pptxgenModule.default || pptxgenModule;

    // 确保Markdown包含正确的元数据
    const processedMarkdown = ensureMarpMetadata(markdown, theme);

    // 解析Markdown内容，提取幻灯片
    const slides = processedMarkdown.split('---').filter(slide => slide.trim());

    // 创建新的PPTX文档
    const pptx = new pptxgen();

    // 设置幻灯片大小为16:9
    pptx.defineLayout({ name: 'LAYOUT_16x9', width: 10, height: 5.625 });
    pptx.layout = 'LAYOUT_16x9';

    // 设置主题颜色
    const themeColors = {
      default: {
        background: 'FFFFFF',
        title: '333333',
        text: '666666',
        accent: '4361ee'
      },
      gaia: {
        background: '101010',
        title: 'FFFFFF',
        text: 'CCCCCC',
        accent: '3B82F6'
      },
      uncover: {
        background: 'FFFFFF',
        title: '137CBD',
        text: '333333',
        accent: '137CBD'
      },
      bespoke: {
        background: 'FAFAFA',
        title: '2563EB',
        text: '333333',
        accent: '3B82F6'
      },
      elegant: {
        background: 'F8F9FA',
        title: '1E40AF',
        text: '212529',
        accent: '4361EE'
      },
      corporate: {
        background: 'FFFFFF',
        title: '0A66C2',
        text: '333333',
        accent: '0A66C2'
      },
      creative: {
        background: 'FEFEFE',
        title: 'FF6B6B',
        text: '333333',
        accent: '6B6BFF'
      },
      minimal: {
        background: 'FFFFFF',
        title: '000000',
        text: '222222',
        accent: '999999'
      }
    };

    // 获取当前主题的颜色
    const colors = themeColors[theme] || themeColors.default;

    // 处理每张幻灯片
    for (let i = 0; i < slides.length; i++) {
      const slideContent = slides[i];

      // 创建新幻灯片
      const slide = pptx.addSlide();

      // 设置背景颜色
      slide.background = { color: colors.background };

      // 提取标题（如果有）
      const titleMatch = slideContent.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : '';

      // 提取二级标题（如果有）
      const subtitleMatch = slideContent.match(/^##\s+(.+)$/m);
      const subtitle = subtitleMatch ? subtitleMatch[1] : '';

      // 提取内容（排除标题和二级标题）
      let content = slideContent;
      if (titleMatch) {
        content = content.replace(titleMatch[0], '').trim();
      }
      if (subtitleMatch) {
        content = content.replace(subtitleMatch[0], '').trim();
      }

      // 检查是否为封面幻灯片
      const isCoverSlide = i === 0 && title && !content.trim();

      // 添加标题
      if (title) {
        slide.addText(title, {
          x: 0.5,
          y: isCoverSlide ? 2.5 : 0.5,
          w: '90%',
          fontSize: isCoverSlide ? 36 : 24,
          bold: true,
          color: colors.title,
          align: isCoverSlide ? 'center' : 'left'
        });
      }

      // 添加二级标题
      if (subtitle) {
        slide.addText(subtitle, {
          x: 0.5,
          y: title ? 1.2 : 0.5,
          w: '90%',
          fontSize: 20,
          bold: false,
          color: colors.title,
          align: isCoverSlide ? 'center' : 'left'
        });
      }

      // 解析Markdown列表
      const lists = content.match(/(?:^\s*[-*+]\s+.+$(?:\n|$))+/gm) || [];
      const orderedLists = content.match(/(?:^\s*\d+\.\s+.+$(?:\n|$))+/gm) || [];

      // 从内容中移除已处理的列表
      lists.forEach(list => {
        content = content.replace(list, '');
      });
      orderedLists.forEach(list => {
        content = content.replace(list, '');
      });

      // 解析表格
      const tables = content.match(/\|.+\|[\s\S]*?\|.+\|/g) || [];
      tables.forEach(table => {
        content = content.replace(table, '');
      });

      // 解析图片
      const images = content.match(/!\[.*?\]\((.+?)\)/g) || [];
      images.forEach(img => {
        content = content.replace(img, '');
      });

      // 处理剩余的文本内容
      const remainingText = content.trim();
      if (remainingText) {
        // 将Markdown格式转换为纯文本
        const formattedText = remainingText
          .replace(/\*\*(.+?)\*\*/g, '$1') // 移除粗体
          .replace(/\*(.+?)\*/g, '$1')     // 移除斜体
          .replace(/`(.+?)`/g, '$1')       // 移除代码
          .replace(/\[(.+?)\]\(.+?\)/g, '$1'); // 保留链接文本

        slide.addText(formattedText, {
          x: 0.5,
          y: title ? (subtitle ? 2.0 : 1.5) : 0.5,
          w: '90%',
          h: 3,
          fontSize: 14,
          color: colors.text,
          bullet: false
        });
      }

      // 添加无序列表
      lists.forEach((list, index) => {
        const listItems = list.split('\n')
          .filter(item => item.trim())
          .map(item => item.replace(/^\s*[-*+]\s+/, '').trim());

        if (listItems.length > 0) {
          slide.addText(listItems, {
            x: 0.5,
            y: title ? (subtitle ? 2.0 : 1.5) : 0.5,
            w: '90%',
            h: 3,
            fontSize: 14,
            color: colors.text,
            bullet: true
          });
        }
      });

      // 添加有序列表
      orderedLists.forEach((list, index) => {
        const listItems = list.split('\n')
          .filter(item => item.trim())
          .map(item => item.replace(/^\s*\d+\.\s+/, '').trim());

        if (listItems.length > 0) {
          slide.addText(listItems, {
            x: 0.5,
            y: title ? (subtitle ? 2.0 : 1.5) : 0.5,
            w: '90%',
            h: 3,
            fontSize: 14,
            color: colors.text,
            bullet: { type: 'number' }
          });
        }
      });

      // 添加表格
      tables.forEach((tableText, index) => {
        const tableRows = tableText.split('\n')
          .filter(row => row.trim() && row.includes('|'))
          .map(row => row.split('|').filter(cell => cell !== '').map(cell => cell.trim()));

        if (tableRows.length > 1) { // 至少有标题行和分隔行
          // 移除分隔行（通常是第二行，包含 ----- 的行）
          const headerRow = tableRows[0];
          const dataRows = tableRows.slice(2);

          // 创建表格
          const tableData = [];
          const tableColWidth = [];

          // 设置列宽
          for (let i = 0; i < headerRow.length; i++) {
            tableColWidth.push(8 / headerRow.length);
          }

          // 添加表头
          tableData.push(headerRow);

          // 添加数据行
          dataRows.forEach(row => {
            tableData.push(row);
          });

          // 添加表格到幻灯片
          slide.addTable(tableData, {
            x: 0.5,
            y: title ? (subtitle ? 2.5 : 2.0) : 1.0,
            w: 9,
            color: colors.text,
            fontSize: 12,
            border: { pt: 0.5, color: colors.accent }
          });
        }
      });

      // 添加图片
      images.forEach((imgText, index) => {
        const imgUrlMatch = imgText.match(/!\[.*?\]\((.+?)\)/);
        if (imgUrlMatch && imgUrlMatch[1]) {
          const imgUrl = imgUrlMatch[1];

          // 添加图片到幻灯片
          slide.addImage({
            path: imgUrl,
            x: 0.5,
            y: title ? (subtitle ? 2.5 : 2.0) : 1.0,
            w: 9,
            h: 5
          });
        }
      });

      // 添加页码（除了封面）
      if (!isCoverSlide) {
        slide.addText(`${i + 1} / ${slides.length}`, {
          x: 9,
          y: 5.4,
          w: 0.5,
          fontSize: 10,
          color: colors.text,
          align: 'right'
        });
      }
    }

    // 生成并下载PPTX
    pptx.writeFile({ fileName: filename });

    console.log(`成功导出PPTX，共${slides.length}张幻灯片`);
    return true;
  } catch (error) {
    console.error('PPTX导出失败:', error);
    throw error;
  }
}

/**
 * 预览演示文稿
 * @param {String} markdown Markdown内容
 * @param {String} theme 主题名称
 * @param {Boolean} inNewWindow 是否在新窗口中预览
 * @returns {Promise<Object>} 预览结果，包含HTML和幻灯片数量
 */
export async function previewPresentation(markdown, theme = 'default', inNewWindow = true) {
  try {
    // 渲染Markdown为HTML
    const renderResult = await renderMarkdownToHTML(markdown, theme);
    const { html: fullHTML, slideCount } = renderResult;

    if (inNewWindow) {
      // 创建一个新窗口来显示预览
      const previewWindow = window.open('', '_blank');
      if (!previewWindow) {
        throw new Error('无法打开预览窗口，请检查浏览器是否阻止了弹出窗口');
      }
      previewWindow.document.write(fullHTML);
      previewWindow.document.close();
    }

    return {
      html: fullHTML,
      slideCount,
      success: true
    };
  } catch (error) {
    console.error('预览失败:', error);
    throw error;
  }
}

/**
 * 获取可用的主题列表
 * @returns {Array} 主题列表
 */
export function getAvailableThemes() {
  return AVAILABLE_THEMES;
}

/**
 * 获取主题预览数据
 * @returns {Object} 主题预览数据
 */
export function getThemePreviews() {
  const sampleMarkdown = `---
marp: true
theme: $THEME$
paginate: true
---

# 这是一个示例演示文稿

---

## 主要内容

- 第一点
- 第二点
- 第三点

---

## 表格示例

| 项目 | 描述 |
|------|------|
| 项目1 | 描述1 |
| 项目2 | 描述2 |

---

# 谢谢观看！`;

  const previews = {};

  AVAILABLE_THEMES.forEach(theme => {
    previews[theme.id] = sampleMarkdown.replace('$THEME$', theme.id);
  });

  return previews;
}

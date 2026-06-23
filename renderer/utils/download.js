/**
 * 文件下载工具函数
 * 统一 Blob 下载逻辑，避免重复实现
 */

/**
 * 触发浏览器文件下载
 * @param {string} content - 文件内容
 * @param {string} filename - 文件名
 * @param {string} mime - MIME 类型
 */
export function downloadFile(content, filename, mime) {
  const blob = new Blob(['\uFEFF' + content], { type: mime + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
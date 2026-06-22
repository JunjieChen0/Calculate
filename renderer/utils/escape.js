/**
 * Shared HTML/attribute escaping utilities.
 * Consolidates duplicate escapeHtml/escapeAttr implementations
 * from history.js and constants-panel.js.
 */

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function escapeAttr(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

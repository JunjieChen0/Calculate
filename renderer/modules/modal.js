/**
 * 轻量级确认模态对话框
 * 替代原生 confirm()，支持自定义样式
 */

let modalOverlay = null;
let modalResolve = null;

function ensureModal() {
  if (modalOverlay) return;
  modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.innerHTML =
    '<div class="modal-box"><p class="modal-message"></p><div class="modal-actions"><button class="modal-btn modal-cancel">\u53d6\u6d88</button><button class="modal-btn modal-confirm">\u786e\u5b9a</button></div></div>';
  document.body.appendChild(modalOverlay);

  modalOverlay.querySelector('.modal-cancel').addEventListener('click', () => closeModal(false));
  modalOverlay.querySelector('.modal-confirm').addEventListener('click', () => closeModal(true));
  modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal(false);
  });
  document.addEventListener('keydown', e => {
    if (!modalOverlay.classList.contains('show')) return;
    if (e.key === 'Escape') closeModal(false);
    if (e.key === 'Enter') closeModal(true);
  });
}

function closeModal(result) {
  if (!modalOverlay) return;
  modalOverlay.classList.remove('show');
  if (modalResolve) {
    modalResolve(result);
    modalResolve = null;
  }
}

/**
 * 显示确认对话框
 * @param {string} message - 提示消息
 * @returns {Promise<boolean>} 用户是否确认
 */
export function confirmAsync(message) {
  ensureModal();
  modalOverlay.querySelector('.modal-message').textContent = message;
  modalOverlay.classList.add('show');
  modalOverlay.querySelector('.modal-confirm').focus();
  return new Promise(resolve => {
    modalResolve = resolve;
  });
}

export class PanelManager {
  constructor() {
    this.activePanel = null;
    this.lastTrigger = null;
    this._focusTrapHandler = null;
    this.historySidebar = document.getElementById('history-sidebar');
    this.constantsSidebar = document.getElementById('constants-sidebar');
    this.settingsPanel = document.getElementById('settings-panel');
    this.tablePanel = document.getElementById('table-panel');
    this.helpPanel = document.getElementById('help-sidebar');
    this.variablesPanel = document.getElementById('variables-sidebar');
    this.spreadsheetPanel = document.getElementById('spreadsheet-panel');
    this.overlay = document.getElementById('overlay');

    this.overlay?.addEventListener('click', () => this.closeAll());
  }

  toggle(panel, triggerElement) {
    if (this.activePanel === panel) {
      this.closeAll();
      return;
    }

    this.closeAll();
    this.activePanel = panel;
    this.lastTrigger = triggerElement || document.activeElement;

    const panelEl = this.getPanelElement(panel);
    if (panelEl) {
      panelEl.classList.add('open');
      const focusTarget = panelEl.querySelector('input, button, [tabindex]');
      if (focusTarget) {
        setTimeout(() => focusTarget.focus(), 50);
      }

      // Install focus trap
      this._focusTrapHandler = e => this._trapFocus(e, panelEl);
      panelEl.addEventListener('keydown', this._focusTrapHandler);
    }

    this.overlay?.classList.add('show');
  }

  closeAll() {
    // Remove focus trap from active panel
    if (this.activePanel) {
      const panelEl = this.getPanelElement(this.activePanel);
      if (panelEl && this._focusTrapHandler) {
        panelEl.removeEventListener('keydown', this._focusTrapHandler);
      }
    }
    this._focusTrapHandler = null;
    this.activePanel = null;
    this.historySidebar?.classList.remove('open');
    this.constantsSidebar?.classList.remove('open');
    this.settingsPanel?.classList.remove('open');
    this.tablePanel?.classList.remove('open');
    this.helpPanel?.classList.remove('open');
    this.variablesPanel?.classList.remove('open');
    this.spreadsheetPanel?.classList.remove('open');
    this.overlay?.classList.remove('show');

    if (this.lastTrigger && typeof this.lastTrigger.focus === 'function') {
      this.lastTrigger.focus();
      this.lastTrigger = null;
    }
  }

  _trapFocus(e, panelEl) {
    if (e.key !== 'Tab') return;

    const focusable = panelEl.querySelectorAll(
      'input:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  getPanelElement(panel) {
    switch (panel) {
      case 'history':
        return this.historySidebar;
      case 'constants':
        return this.constantsSidebar;
      case 'settings':
        return this.settingsPanel;
      case 'table':
        return this.tablePanel;
      case 'help':
        return this.helpPanel;
      case 'variables':
        return this.variablesPanel;
      case 'spreadsheet':
        return this.spreadsheetPanel;
      default:
        return null;
    }
  }
}

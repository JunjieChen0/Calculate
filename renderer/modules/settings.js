import {
  setPrecision,
  getPrecision,
  setDisplayFormat,
  getDisplayFormat,
  setCurrentBase,
  getCurrentBase,
  setEngineeringNotation,
  getEngineeringNotation,
  setFractionMode,
  getFractionMode,
  setAngleUnit,
  getAngleUnit
} from '../calculator.js';

const ANGLE_UNITS = ['rad', 'deg', 'grad'];

export class SettingsManager {
  constructor(store) {
    this.store = store;
    this.autoBracketEnabled = true;
    this.precisionSetting = document.getElementById('precision-setting');
    this.precisionValue = document.getElementById('precision-value');
    this.autoBracketToggle = document.getElementById('auto-bracket-toggle');
    this.engineeringToggle = document.getElementById('engineering-toggle');
    this.settingsAngleToggle = document.getElementById('settings-angle-toggle');
    this.fractionToggle = document.getElementById('fraction-toggle');
  }

  async load() {
    try {
      const saved = await this.store.get('calculator_settings', {
        precision: 12,
        autoBracket: true,
        displayFormat: 'norm',
        fixDecimals: 4,
        currentBase: 10,
        engineeringNotation: false,
        fractionMode: false,
        angleUnit: 'rad'
      });
      setPrecision(saved.precision);
      setDisplayFormat(saved.displayFormat, saved.fixDecimals);
      setCurrentBase(saved.currentBase);
      setEngineeringNotation(saved.engineeringNotation);
      setFractionMode(saved.fractionMode);
      if (saved.angleUnit) {
        setAngleUnit(saved.angleUnit);
      }
      this.autoBracketEnabled = saved.autoBracket !== false;
      this.updateUI();
    } catch (error) {
      console.warn('Failed to load settings:', error);
    }
  }

  async save() {
    try {
      const { format, decimals } = getDisplayFormat();
      await this.store.set('calculator_settings', {
        precision: getPrecision(),
        autoBracket: this.autoBracketEnabled,
        displayFormat: format,
        fixDecimals: decimals,
        currentBase: getCurrentBase(),
        engineeringNotation: getEngineeringNotation(),
        fractionMode: getFractionMode(),
        angleUnit: getAngleUnit()
      });
    } catch (error) {
      console.warn('Failed to save settings:', error);
    }
  }

  updateUI() {
    const { format } = getDisplayFormat();

    if (this.precisionSetting) {
      this.precisionSetting.value = getPrecision();
    }
    if (this.precisionValue) {
      this.precisionValue.textContent = getPrecision();
    }
    if (this.autoBracketToggle) {
      this.autoBracketToggle.textContent = this.autoBracketEnabled ? '开启' : '关闭';
      this.autoBracketToggle.classList.toggle('active', this.autoBracketEnabled);
    }
    if (this.engineeringToggle) {
      this.engineeringToggle.textContent = getEngineeringNotation() ? '开启' : '关闭';
      this.engineeringToggle.classList.toggle('active', getEngineeringNotation());
    }
    if (this.fractionToggle) {
      this.fractionToggle.classList.toggle('active', getFractionMode());
    }
    if (this.settingsAngleToggle) {
      this.settingsAngleToggle.textContent = getAngleUnit().toUpperCase();
      this.settingsAngleToggle.classList.toggle('active', getAngleUnit() !== 'rad');
    }

    document.querySelectorAll('.format-buttons .helper-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const formatBtn = document.getElementById(`format-${format}`);
    if (formatBtn) {
      formatBtn.classList.add('active');
    }

    const baseNames = { 10: 'dec', 2: 'bin', 8: 'oct', 16: 'hex' };
    document.querySelectorAll('.format-buttons .helper-btn').forEach(btn => {
      if (btn.id.startsWith('base-')) {
        btn.classList.remove('active');
      }
    });
    const baseBtn = document.getElementById(`base-${baseNames[getCurrentBase()]}`);
    if (baseBtn) {
      baseBtn.classList.add('active');
    }
  }

  cycleAngleUnit() {
    const currentIndex = ANGLE_UNITS.indexOf(getAngleUnit());
    const nextIndex = (currentIndex + 1) % ANGLE_UNITS.length;
    setAngleUnit(ANGLE_UNITS[nextIndex]);
  }

  toggleAutoBracket() {
    this.autoBracketEnabled = !this.autoBracketEnabled;
  }

  getAutoBracketEnabled() {
    return this.autoBracketEnabled;
  }
}

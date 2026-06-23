import { logger } from "../core/logger.js";
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
  setExactMode,
  getExactMode,
  setFractionType,
  getFractionType,
  setThousandSeparator,
  getThousandSeparator,
  setDecimalSeparator,
  getDecimalSeparator,
  setLanguage,
  getLanguage,
  setAngleUnit,
  getAngleUnit,
  setComplexDisplayFormat,
  getComplexDisplayFormat
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
    this.exactToggle = document.getElementById('exact-toggle');
    this.exactToggleSetting = document.getElementById('exact-toggle-setting');
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
        exactMode: false,
        fractionType: 'improper',
        thousandSeparator: false,
        decimalSeparator: '.',
        language: 'zh',
        angleUnit: 'rad'
      });
      setPrecision(saved.precision);
      setDisplayFormat(saved.displayFormat, saved.fixDecimals);
      setCurrentBase(saved.currentBase);
      setEngineeringNotation(saved.engineeringNotation);
      setFractionMode(saved.fractionMode);
      setExactMode(saved.exactMode);
      if (saved.fractionType) setFractionType(saved.fractionType);
      if (saved.thousandSeparator !== undefined) setThousandSeparator(saved.thousandSeparator);
      if (saved.decimalSeparator) setDecimalSeparator(saved.decimalSeparator);
      if (saved.language) setLanguage(saved.language);
      if (saved.angleUnit) {
        setAngleUnit(saved.angleUnit);
        if (saved.complexDisplayFormat) {
          setComplexDisplayFormat(saved.complexDisplayFormat);
        }
      }
      this.autoBracketEnabled = saved.autoBracket !== false;
      this.updateUI();
    } catch (error) {
      logger.warn('Failed to load settings:', error);
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
        exactMode: getExactMode(),
        fractionType: getFractionType(),
        thousandSeparator: getThousandSeparator(),
        decimalSeparator: getDecimalSeparator(),
        language: getLanguage(),
        angleUnit: getAngleUnit(),
        complexDisplayFormat: getComplexDisplayFormat()
      });
    } catch (error) {
      logger.warn('Failed to save settings:', error);
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
    if (this.exactToggle) {
      this.exactToggle.classList.toggle('active', getExactMode());
    }
    if (this.exactToggleSetting) {
      this.exactToggleSetting.textContent = getExactMode() ? '开启' : '关闭';
      this.exactToggleSetting.classList.toggle('active', getExactMode());
    }
    // 分数类型按钮
    const improperBtn = document.getElementById('fraction-type-improper');
    const mixedBtn = document.getElementById('fraction-type-mixed');
    if (improperBtn && mixedBtn) {
      improperBtn.classList.toggle('active', getFractionType() === 'improper');
      mixedBtn.classList.toggle('active', getFractionType() === 'mixed');
    }
    // 小数点符号按钮
    const dotBtn = document.getElementById('decimal-dot');
    const commaBtn = document.getElementById('decimal-comma');
    if (dotBtn && commaBtn) {
      dotBtn.classList.toggle('active', getDecimalSeparator() === '.');
      commaBtn.classList.toggle('active', getDecimalSeparator() === ',');
    }
    // 千分位分隔符按钮
    const thousandSepToggle = document.getElementById('thousand-sep-toggle');
    if (thousandSepToggle) {
      thousandSepToggle.textContent = getThousandSeparator() ? '开启' : '关闭';
      thousandSepToggle.classList.toggle('active', getThousandSeparator());
    }
    // 语言按钮
    const langZhBtn = document.getElementById('lang-zh');
    const langEnBtn = document.getElementById('lang-en');
    if (langZhBtn && langEnBtn) {
      langZhBtn.classList.toggle('active', getLanguage() === 'zh');
      langEnBtn.classList.toggle('active', getLanguage() === 'en');
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

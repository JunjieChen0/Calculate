/**
 * 平台检测工具
 * 用于检测当前运行环境并提供平台相关的配置
 */

// 检测是否在Electron环境中
export function isElectron() {
  return window.electronAPI && window.electronAPI.store;
}

// 检测是否在移动端
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// 检测是否在安卓平台
export function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

// 检测是否在iOS平台
export function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// 获取平台类型
export function getPlatform() {
  if (isElectron()) return 'electron';
  if (isAndroid()) return 'android';
  if (isIOS()) return 'ios';
  if (isMobile()) return 'mobile';
  return 'web';
}

// 检测是否支持触摸
export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// 获取设备像素比
export function getDevicePixelRatio() {
  return window.devicePixelRatio || 1;
}

// 检测是否支持PWA
export function isPWASupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

// 获取平台信息
export function getPlatformInfo() {
  return {
    platform: getPlatform(),
    isElectron: isElectron(),
    isMobile: isMobile(),
    isAndroid: isAndroid(),
    isIOS: isIOS(),
    isTouchDevice: isTouchDevice(),
    devicePixelRatio: getDevicePixelRatio(),
    userAgent: navigator.userAgent
  };
}

/**
 * 防抖：延迟执行，连续调用只执行最后一次
 */
export function debounce(fn, delay) {
  let timer = null;
  const debounced = (...args) => {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, delay);
  };
  debounced.cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };
  return debounced;
}

/**
 * 节流：固定间隔内只执行一次
 */
export function throttle(fn, interval) {
  let lastTime = 0;
  let timer = null;
  const throttled = (...args) => {
    const now = Date.now();
    const remaining = interval - (now - lastTime);
    if (remaining <= 0) {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      lastTime = now;
      fn(...args);
    } else if (timer === null) {
      timer = setTimeout(() => {
        lastTime = Date.now();
        timer = null;
        fn(...args);
      }, remaining);
    }
  };
  throttled.cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };
  return throttled;
}

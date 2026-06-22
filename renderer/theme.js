const THEME_KEY = 'calculator_theme';

let currentTheme = 'dark';
let store = null;

export async function initTheme(externalStore) {
  store = externalStore;

  if (store && store.get) {
    try {
      const saved = await store.get(THEME_KEY, 'dark');
      currentTheme = saved === 'light' ? 'light' : 'dark';
    } catch (error) {
      console.warn('Failed to load theme:', error);
      currentTheme = 'dark';
    }
  }

  applyTheme(currentTheme);
}

export function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(currentTheme);
  saveTheme();
  return currentTheme;
}

export function getCurrentTheme() {
  return currentTheme;
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);

  const icon = document.getElementById('theme-icon');
  if (icon) {
    if (theme === 'dark') {
      // Sun icon
      icon.innerHTML = `
        <circle cx="12" cy="12" r="5"></circle>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
      `;
    } else {
      // Moon icon
      icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
    }
  }
}

function saveTheme() {
  if (store && store.set) {
    store.set(THEME_KEY, currentTheme).catch(error => {
      console.warn('Failed to save theme:', error);
    });
  }
}

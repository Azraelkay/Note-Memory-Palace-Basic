import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// 主题配置
const themes = {
  memoryPalace: {
    name: 'memoryPalace',
    displayName: '记忆宫殿',
    icon: '🏰',
    colors: {
      '--bg-color': '#0B1426',
      '--card-bg': 'linear-gradient(135deg, rgba(30, 58, 138, 0.2) 0%, rgba(124, 58, 237, 0.15) 100%)',
      '--card-color': 'rgba(30, 58, 138, 0.15)',
      '--text-color': '#E5E7EB',
      '--text-light': '#9CA3AF',
      '--border-color': 'rgba(124, 58, 237, 0.3)',
      '--hover-color': 'rgba(30, 58, 138, 0.25)',
      '--primary-color': '#FCD34D',
      '--primary-dark': '#F59E0B',
      '--accent-color': '#1E3A8A',
      '--success-color': '#10B981',
      '--warning-color': '#F59E0B',
      '--shadow': '0 4px 16px rgba(252, 211, 77, 0.15)',
      '--shadow-lg': '0 16px 48px rgba(252, 211, 77, 0.25)',
      '--shadow-xl': '0 25px 50px rgba(252, 211, 77, 0.3)',
      '--gradient-primary': 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
      '--gradient-bg': 'radial-gradient(ellipse at center, rgba(30, 58, 138, 0.3) 0%, rgba(11, 20, 38, 0.8) 70%)',
      '--glow-gold': '0 0 20px rgba(252, 211, 77, 0.4)',
      '--cosmic-bg': '#0B1426',
    }
  },
  starfield: {
    name: 'starfield',
    displayName: '星空模式',
    icon: '✨',
    colors: {
      '--bg-color': '#000814',
      '--card-bg': 'linear-gradient(135deg, rgba(0, 32, 63, 0.3) 0%, rgba(25, 25, 112, 0.2) 100%)',
      '--card-color': 'rgba(0, 32, 63, 0.25)',
      '--text-color': '#F8F9FA',
      '--text-light': '#ADB5BD',
      '--border-color': 'rgba(52, 152, 219, 0.4)',
      '--hover-color': 'rgba(0, 32, 63, 0.4)',
      '--primary-color': '#00D4FF',
      '--primary-dark': '#0099CC',
      '--accent-color': '#9B59B6',
      '--success-color': '#2ECC71',
      '--warning-color': '#F39C12',
      '--shadow': '0 4px 16px rgba(0, 212, 255, 0.2)',
      '--shadow-lg': '0 16px 48px rgba(0, 212, 255, 0.3)',
      '--shadow-xl': '0 25px 50px rgba(0, 212, 255, 0.4)',
      '--gradient-primary': 'linear-gradient(135deg, #00D4FF 0%, #0099CC 100%)',
      '--gradient-bg': 'radial-gradient(ellipse at center, rgba(0, 32, 63, 0.4) 0%, rgba(0, 8, 20, 0.9) 70%)',
      '--glow-gold': '0 0 20px rgba(0, 212, 255, 0.5)',
      '--cosmic-bg': '#000814',
    }
  },
  abyss: {
    name: 'abyss',
    displayName: '深渊模式',
    icon: '🌑',
    colors: {
      '--bg-color': '#0D1117',
      '--card-bg': 'linear-gradient(135deg, rgba(33, 38, 45, 0.9) 0%, rgba(48, 54, 61, 0.7) 100%)',
      '--card-color': 'rgba(33, 38, 45, 0.85)',
      '--text-color': '#F0F6FC',
      '--text-light': '#8B949E',
      '--border-color': 'rgba(139, 148, 158, 0.3)',
      '--hover-color': 'rgba(48, 54, 61, 0.7)',
      '--primary-color': '#FF6B6B',
      '--primary-dark': '#E55555',
      '--accent-color': '#F85149',
      '--success-color': '#3FB950',
      '--warning-color': '#D29922',
      '--shadow': '0 4px 16px rgba(0, 0, 0, 0.5)',
      '--shadow-lg': '0 16px 48px rgba(0, 0, 0, 0.7)',
      '--shadow-xl': '0 25px 50px rgba(0, 0, 0, 0.8)',
      '--gradient-primary': 'linear-gradient(135deg, #FF6B6B 0%, #E55555 100%)',
      '--gradient-bg': 'radial-gradient(ellipse at center, rgba(33, 38, 45, 0.6) 0%, rgba(13, 17, 23, 0.95) 70%)',
      '--glow-gold': '0 0 20px rgba(255, 107, 107, 0.4)',
      '--cosmic-bg': '#0D1117',
    }
  },
  auto: {
    name: 'auto',
    displayName: '跟随系统',
    icon: '🔄',
    colors: null // 将根据系统偏好动态设置
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('memoryPalace');
  const [systemTheme, setSystemTheme] = useState('memoryPalace');

  // 检测系统主题偏好
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'abyss' : 'memoryPalace');
    };

    // 初始检测
    setSystemTheme(mediaQuery.matches ? 'abyss' : 'memoryPalace');

    // 监听变化
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // 从localStorage加载主题偏好
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // 应用主题到DOM
  useEffect(() => {
    const applyTheme = (themeName) => {
      const theme = themes[themeName];
      if (!theme || !theme.colors) return;

      const root = document.documentElement;
      Object.entries(theme.colors).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });

      // 更新body类名
      document.body.className = document.body.className
        .replace(/theme-\w+/g, '')
        .trim();
      document.body.classList.add(`theme-${themeName}`);
    };

    let effectiveTheme = currentTheme;
    
    // 如果是自动模式，使用系统主题
    if (currentTheme === 'auto') {
      effectiveTheme = systemTheme;
    }

    applyTheme(effectiveTheme);
  }, [currentTheme, systemTheme]);

  // 切换主题
  const setTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      localStorage.setItem('theme', themeName);
    }
  };

  // 获取当前有效主题
  const getEffectiveTheme = () => {
    return currentTheme === 'auto' ? systemTheme : currentTheme;
  };

  // 切换到下一个主题
  const toggleTheme = () => {
    const themeNames = Object.keys(themes);
    const currentIndex = themeNames.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeNames.length;
    setTheme(themeNames[nextIndex]);
  };

  const value = {
    currentTheme,
    effectiveTheme: getEffectiveTheme(),
    systemTheme,
    themes,
    setTheme,
    toggleTheme,
    isDark: getEffectiveTheme() === 'dark',
    isLight: getEffectiveTheme() === 'light',
    isAuto: currentTheme === 'auto',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;

import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ 
  showLabel = true, 
  size = 'medium',
  variant = 'button' // 'button', 'dropdown', 'switch'
}) => {
  const { currentTheme, themes, setTheme, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);

  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'theme-toggle-small';
      case 'large':
        return 'theme-toggle-large';
      default:
        return 'theme-toggle-medium';
    }
  };

  // 简单按钮切换
  if (variant === 'button') {
    const currentThemeConfig = themes[currentTheme];
    
    return (
      <button
        className={`theme-toggle-btn ${getSizeClass()}`}
        onClick={toggleTheme}
        title={`当前: ${currentThemeConfig.displayName}`}
        aria-label="切换主题"
      >
        <span className="theme-icon">{currentThemeConfig.icon}</span>
        {showLabel && (
          <span className="theme-label">{currentThemeConfig.displayName}</span>
        )}

        <style jsx>{`
          .theme-toggle-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 12px;
            background: var(--card-color);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            color: var(--text-color);
            cursor: pointer;
            transition: var(--transition);
            font-size: 14px;
            font-weight: 500;
          }

          .theme-toggle-btn:hover {
            background: var(--hover-color);
            transform: translateY(-1px);
            box-shadow: var(--shadow);
          }

          .theme-toggle-small {
            padding: 4px 8px;
            font-size: 12px;
          }

          .theme-toggle-large {
            padding: 12px 16px;
            font-size: 16px;
          }

          .theme-icon {
            font-size: 1.2em;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .theme-label {
            white-space: nowrap;
          }

          @media (max-width: 768px) {
            .theme-label {
              display: none;
            }
          }
        `}</style>
      </button>
    );
  }

  // 下拉菜单切换
  if (variant === 'dropdown') {
    return (
      <div className="theme-dropdown">
        <button
          className={`theme-dropdown-btn ${getSizeClass()}`}
          onClick={() => setShowDropdown(!showDropdown)}
          aria-label="选择主题"
        >
          <span className="theme-icon">{themes[currentTheme].icon}</span>
          {showLabel && (
            <span className="theme-label">{themes[currentTheme].displayName}</span>
          )}
          <span className="dropdown-arrow">▼</span>
        </button>

        {showDropdown && (
          <div className="theme-dropdown-menu">
            {Object.entries(themes).map(([key, theme]) => (
              <button
                key={key}
                className={`theme-option ${currentTheme === key ? 'active' : ''}`}
                onClick={() => {
                  setTheme(key);
                  setShowDropdown(false);
                }}
              >
                <span className="theme-icon">{theme.icon}</span>
                <span className="theme-name">{theme.displayName}</span>
                {currentTheme === key && <span className="check-mark">✓</span>}
              </button>
            ))}
          </div>
        )}

        {/* 点击外部关闭下拉菜单 */}
        {showDropdown && (
          <div 
            className="dropdown-overlay"
            onClick={() => setShowDropdown(false)}
          />
        )}

        <style jsx>{`
          .theme-dropdown {
            position: relative;
            display: inline-block;
          }

          .theme-dropdown-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            background: var(--card-bg);
            backdrop-filter: blur(10px);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            color: var(--text-color);
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 14px;
            font-weight: 500;
            position: relative;
            box-shadow: var(--shadow-sm);
          }

          .theme-dropdown-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at center, rgba(252, 211, 77, 0.1) 0%, transparent 70%);
            border-radius: 20px;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
          }

          .theme-dropdown-btn:hover {
            background: var(--hover-color);
            border-color: var(--primary-color);
            transform: translateY(-1px);
            box-shadow: var(--glow-gold);
          }

          .theme-dropdown-btn:hover::before {
            opacity: 1;
          }

          .dropdown-arrow {
            font-size: 10px;
            transition: transform 0.2s;
            transform: ${showDropdown ? 'rotate(180deg)' : 'rotate(0deg)'};
          }

          .theme-dropdown-menu {
            position: absolute;
            top: 100%;
            right: 0;
            margin-top: 8px;
            background: var(--card-bg);
            backdrop-filter: blur(15px);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            box-shadow: var(--shadow-xl);
            z-index: 1000;
            min-width: 180px;
            overflow: hidden;
          }

          .theme-dropdown-menu::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(ellipse at center, rgba(252, 211, 77, 0.05) 0%, transparent 70%);
            pointer-events: none;
          }

          .theme-option {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
            padding: 12px 16px;
            background: none;
            border: none;
            color: var(--text-color);
            cursor: pointer;
            transition: all 0.15s ease;
            font-size: 14px;
            text-align: left;
            position: relative;
            z-index: 1;
          }

          .theme-option::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, transparent 0%, rgba(252, 211, 77, 0.1) 50%, transparent 100%);
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: -1;
          }

          .theme-option:hover {
            background: var(--hover-color);
            color: var(--primary-color);
            transform: translateX(3px);
            box-shadow: inset 3px 0 0 var(--primary-color);
          }

          .theme-option:hover::before {
            opacity: 1;
          }

          .theme-option.active {
            background: var(--gradient-primary);
            color: var(--cosmic-bg);
            box-shadow: var(--glow-gold);
          }

          .theme-option.active::before {
            opacity: 0;
          }

          .theme-option:first-child {
            border-radius: 16px 16px 0 0;
          }

          .theme-option:last-child {
            border-radius: 0 0 16px 16px;
          }

          .theme-name {
            flex: 1;
          }

          .check-mark {
            font-size: 12px;
            font-weight: bold;
          }

          .dropdown-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 999;
          }

          .theme-toggle-small .theme-dropdown-btn {
            padding: 4px 8px;
            font-size: 12px;
          }

          .theme-toggle-large .theme-dropdown-btn {
            padding: 12px 16px;
            font-size: 16px;
          }
        `}</style>
      </div>
    );
  }

  // 开关切换（仅在浅色/深色间切换）
  if (variant === 'switch') {
    const isDark = currentTheme === 'dark';
    
    return (
      <label className={`theme-switch ${getSizeClass()}`}>
        <input
          type="checkbox"
          checked={isDark}
          onChange={() => setTheme(isDark ? 'light' : 'dark')}
          aria-label="切换深色模式"
        />
        <span className="switch-slider">
          <span className="switch-icon">
            {isDark ? '🌙' : '☀️'}
          </span>
        </span>
        {showLabel && (
          <span className="switch-label">
            {isDark ? '深色模式' : '浅色模式'}
          </span>
        )}

        <style jsx>{`
          .theme-switch {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            user-select: none;
          }

          .theme-switch input {
            display: none;
          }

          .switch-slider {
            position: relative;
            width: 50px;
            height: 26px;
            background: var(--border-color);
            border-radius: 13px;
            transition: var(--transition);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .theme-switch input:checked + .switch-slider {
            background: var(--primary-color);
          }

          .switch-icon {
            position: absolute;
            left: 3px;
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            transition: var(--transition);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }

          .theme-switch input:checked + .switch-slider .switch-icon {
            transform: translateX(24px);
          }

          .switch-label {
            font-size: 14px;
            font-weight: 500;
            color: var(--text-color);
          }

          .theme-toggle-small .switch-slider {
            width: 40px;
            height: 20px;
          }

          .theme-toggle-small .switch-icon {
            width: 16px;
            height: 16px;
            font-size: 10px;
          }

          .theme-toggle-small input:checked + .switch-slider .switch-icon {
            transform: translateX(20px);
          }

          .theme-toggle-large .switch-slider {
            width: 60px;
            height: 32px;
          }

          .theme-toggle-large .switch-icon {
            width: 26px;
            height: 26px;
            font-size: 14px;
          }

          .theme-toggle-large input:checked + .switch-slider .switch-icon {
            transform: translateX(28px);
          }
        `}</style>
      </label>
    );
  }

  return null;
};

export default ThemeToggle;

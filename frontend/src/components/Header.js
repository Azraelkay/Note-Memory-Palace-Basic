import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuActive, setUserMenuActive] = useState(false);



  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };





  // 用户菜单数据
  const userItems = [
    {
      key: 'profile',
      path: '/profile',
      icon: '👤',
      name: '个人资料',
      type: 'link'
    },
    {
      key: 'logout',
      icon: '🚪',
      name: '退出登录',
      type: 'action',
      action: handleLogout
    }
  ];

  // 通用下拉菜单渲染函数
  const renderDropdownItems = (items, closeMenu) => {
    return items.map((item) => {
      // 检查是否需要认证
      if (item.requireAuth && !isAuthenticated) {
        return null;
      }

      const isActive = item.path && location.pathname === item.path;

      const menuItemStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: 'calc(100% - 16px)',
        padding: '16px 20px',
        background: 'transparent',
        border: 'none',
        color: 'var(--text-color)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontSize: '14px',
        textAlign: 'left',
        textDecoration: 'none',
        borderRadius: '12px',
        margin: '4px 8px',
        fontWeight: '500',
        boxSizing: 'border-box'
      };

      if (item.type === 'action') {
        return (
          <button
            key={item.key}
            className="theme-option"
            style={menuItemStyle}
            onClick={() => {
              item.action();
              closeMenu();
            }}
          >
            <span className="theme-icon">{item.icon}</span>
            <span className="theme-name">{item.name}</span>
          </button>
        );
      }

      return (
        <Link
          key={item.key}
          to={item.path}
          className={`theme-option ${isActive ? 'active' : ''}`}
          style={menuItemStyle}
          onClick={closeMenu}
        >
          <span className="theme-icon">{item.icon}</span>
          <span className="theme-name">{item.name}</span>
          {isActive && <span className="check-mark">✓</span>}
        </Link>
      );
    }).filter(Boolean);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (userMenuActive) {
      setUserMenuActive(false);
    }
  };

  const toggleUserMenu = (e) => {
    e.stopPropagation();
    setUserMenuActive(!userMenuActive);
  };

  // 点击外部关闭所有下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setUserMenuActive(false);

      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="header" ref={headerRef}>
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <span className="logo-text">Note</span>
          </div>
          
          <button 
            className="mobile-menu-button" 
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>

          <nav className={`nav ${mobileMenuOpen ? 'show' : ''}`}>
            <ul className="nav-links">
              {/* 首页链接 */}
              <li className="nav-item home-link-item">
                <Link
                  to="/"
                  className={`home-link ${location.pathname === '/' ? 'active' : ''}`}
                  title="首页"
                >
                  <span className="home-icon">🏠</span>
                </Link>
              </li>

              {/* 我的笔记链接 - 仅在已登录时显示 */}
              {isAuthenticated && (
                <li className="nav-item notes-link-item">
                  <Link
                    to="/notes"
                    className={`notes-link ${location.pathname === '/notes' ? 'active' : ''}`}
                    title="我的笔记"
                  >
                    <span className="notes-icon">📝</span>
                  </Link>
                </li>
              )}



              {/* 回收站链接 - 仅在已登录时显示 */}
              {isAuthenticated && (
                <li className="nav-item trash-link-item">
                  <Link
                    to="/trash"
                    className={`trash-link ${location.pathname === '/trash' ? 'active' : ''}`}
                    title="回收站"
                  >
                    <span className="trash-icon">🗑️</span>
                  </Link>
                </li>
              )}

              {/* 扩展功能直接链接 - 仅在已登录时显示 */}
              {isAuthenticated && (
                <li className="nav-item extensions-link-item">
                  <Link
                    to="/extensions"
                    className={`extensions-link ${location.pathname === '/extensions' ? 'active' : ''}`}
                    title="扩展功能"
                  >
                    <span className="extensions-icon">🧩</span>
                  </Link>
                </li>
              )}

              <li className="nav-item theme-toggle-item">
                <ThemeToggle
                  variant="dropdown"
                  size="small"
                  showLabel={false}
                />
              </li>

              {isAuthenticated ? (
                <li className={`nav-item user-menu ${userMenuActive ? 'active' : ''}`}>
                  <button className="user-button" onClick={toggleUserMenu}>
                    <div className="user-avatar">
                      {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="username">{user?.username}</span>
                    <span className="dropdown-arrow">▼</span>
                  </button>
                  <div
                    className="user-dropdown"
                    style={{
                      padding: '8px 0'
                    }}
                  >
                    {renderDropdownItems(userItems, () => {
                      setMobileMenuOpen(false);
                      setUserMenuActive(false);
                    })}
                  </div>
                </li>
              ) : (
                <>
                  <li className="nav-item auth-button-item">
                    <Link to="/login" className="auth-link login-link" title="登录">
                      <span className="auth-icon">🔑</span>
                    </Link>
                  </li>
                  <li className="nav-item auth-button-item">
                    <Link to="/register" className="auth-link register-link" title="注册">
                      <span className="auth-icon">✨</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
      <style jsx>{`
        /* 全局链接样式重置 - 确保Header内所有链接无下划线 */
        .header a,
        .header a:link,
        .header a:visited,
        .header a:hover,
        .header a:active,
        .header a:focus {
          text-decoration: none !important;
          text-decoration-line: none !important;
          text-decoration-style: none !important;
          text-decoration-color: transparent !important;
          border-bottom: none !important;
        }

        .header {
          background: linear-gradient(135deg,
            rgba(147, 51, 234, 0.6) 0%,
            rgba(59, 130, 246, 0.4) 50%,
            rgba(30, 58, 138, 0.6) 100%);
          backdrop-filter: blur(15px);
          border-bottom: 1px solid rgba(252, 211, 77, 0.3);
          position: sticky;
          top: 0;
          z-index: 100;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(252, 211, 77, 0.2);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          position: relative;
        }

        .logo {
          position: relative;
        }

        .logo-text {
          font-size: 28px;
          font-weight: 800;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -1px;
          cursor: default;
          user-select: none;
          text-shadow: var(--glow-gold);
          position: relative;
        }

        .logo-text::before {
          content: '🏰';
          position: absolute;
          left: -35px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 24px;
          filter: drop-shadow(0 0 8px rgba(252, 211, 77, 0.6));
        }

        .nav-links {
          display: flex;
          list-style: none;
          align-items: center;
          gap: 8px;
          margin: 0;
          padding: 0;
        }

        .nav-item {
          position: relative;
        }

        /* 通用下拉菜单样式 - 圆角矩形按钮，匹配主题切换 */
        .dropdown-menu {
          position: relative;
        }

        .dropdown-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: var(--card-color);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          cursor: pointer;
          transition: var(--transition);
          color: var(--text-color);
          font-weight: 500;
          font-size: 14px;
          box-shadow: var(--shadow-sm);
        }

        .dropdown-button:hover {
          background: var(--hover-color);
          border-color: var(--primary-color);
          box-shadow: var(--glow-gold);
          transform: translateY(-1px);
        }

        .dropdown-menu.active .dropdown-button {
          background: var(--hover-color);
          border-color: var(--primary-color);
          color: var(--primary-color);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .dropdown-icon {
          font-size: 16px;
          width: 20px;
          text-align: center;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
        }

        .dropdown-text {
          font-size: 14px;
          font-weight: 600;
        }

        .dropdown-arrow {
          font-size: 10px;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin-left: 4px;
          opacity: 0.7;
        }

        .dropdown-menu.active .dropdown-arrow {
          transform: rotate(180deg);
          opacity: 1;
        }

        .dropdown-content {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 4px;
          background: var(--card-bg);
          backdrop-filter: blur(15px);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          box-shadow: var(--shadow-lg);
          min-width: 160px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.2s ease;
          z-index: 1000;
          overflow: hidden;
        }

        /* 确保下拉菜单内所有链接无下划线 */
        .dropdown-content a,
        .dropdown-content button {
          text-decoration: none !important;
        }

        .dropdown-content a:hover,
        .dropdown-content a:focus,
        .dropdown-content a:active,
        .dropdown-content a:visited {
          text-decoration: none !important;
        }

        .dropdown-menu.active .dropdown-content {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        /* 移除特殊下拉菜单样式，使用统一样式 */

        /* 统一下拉菜单项样式 - 完全匹配ThemeToggle，确保无下划线 */
        .theme-option {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 12px;
          background: none;
          border: none;
          color: var(--text-color);
          cursor: pointer;
          transition: var(--transition);
          font-size: 14px;
          text-align: left;
          text-decoration: none !important;
          border-radius: 0;
          position: relative;
        }

        /* 确保链接状态下也无下划线 */
        .theme-option:link,
        .theme-option:visited,
        .theme-option:hover,
        .theme-option:active {
          text-decoration: none !important;
          color: inherit;
        }

        .theme-option:hover {
          background: var(--hover-color);
          color: var(--text-color);
          transform: none;
        }

        .theme-option.active {
          background: var(--primary-color);
          color: white;
        }

        .theme-option.active:hover {
          background: var(--primary-dark);
          color: white;
        }

        .theme-name {
          flex: 1;
          font-weight: 500;
        }

        .theme-icon {
          font-size: 14px;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: var(--transition);
        }

        .theme-option:hover .theme-icon {
          background: rgba(59, 130, 246, 0.1);
        }

        .theme-option.active .theme-icon {
          background: rgba(255, 255, 255, 0.2);
        }

        .check-mark {
          font-size: 12px;
          font-weight: bold;
          color: var(--primary-color);
          opacity: 0.8;
        }

        .theme-option.active .check-mark {
          color: white;
          opacity: 1;
        }

        .dropdown-icon {
          font-size: 14px;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dropdown-text {
          font-weight: 500;
        }

        .dropdown-arrow {
          font-size: 12px;
          transition: transform 0.2s ease;
        }

        .dropdown-menu.active .dropdown-arrow {
          transform: rotate(180deg);
        }

        /* 认证按钮样式 - 与导航按钮保持一致的小长方形样式 */
        .auth-button-item {
          margin: 0 4px;
        }

        .auth-link {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          background: var(--card-color);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: #FFFFFF;
          font-weight: 600;
          font-size: 20px;
          text-decoration: none !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          width: 44px;
          height: 44px;
        }

        /* 强制移除所有下划线 - 更强制性的样式 */
        .auth-link,
        .auth-link:link,
        .auth-link:visited,
        .auth-link:hover,
        .auth-link:active,
        .auth-link:focus {
          text-decoration: none !important;
          text-decoration-line: none !important;
          text-decoration-style: none !important;
          text-decoration-color: transparent !important;
          border-bottom: none !important;
          box-shadow: none;
          color: #FFFFFF !important;
        }

        /* 增强的悬停效果 */
        .auth-link:hover {
          background: var(--hover-color);
          border-color: var(--primary-color);
          box-shadow: var(--glow-gold);
          color: var(--primary-color);
          transform: translateY(-2px);
        }

        /* 登录按钮 - 保持默认样式 */
        .login-link {
          /* 使用基础样式 */
        }

        /* 注册按钮 - 稍微突出一点 */
        .register-link {
          background: var(--card-color);
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        .register-link:hover {
          background: var(--primary-color);
          border-color: var(--primary-color);
          color: white;
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.4);
          transform: translateY(-3px);
        }

        .auth-icon {
          font-size: 16px;
          width: 20px;
          text-align: center;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
        }

        .auth-text {
          font-size: 14px;
          font-weight: 600;
        }

        /* 首页、笔记、日历、扩展和回收站链接样式 - 与认证按钮保持一致 */
        .home-link-item,
        .notes-link-item,
        .calendar-link-item,
        .extensions-link-item,
        .trash-link-item {
          margin: 0 4px;
        }

        .home-link,
        .notes-link,
        .extensions-link,
        .trash-link {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          background: var(--card-color);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: #FFFFFF;
          font-weight: 600;
          font-size: 20px;
          text-decoration: none !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          width: 44px;
          height: 44px;
          position: relative;
        }

        /* VIP功能样式 */
        .vip-feature {
          opacity: 0.7;
          border-color: rgba(245, 158, 11, 0.5) !important;
        }

        .vip-feature:hover {
          opacity: 1;
          border-color: var(--primary-color) !important;
          box-shadow: var(--glow-gold) !important;
        }

        .vip-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: linear-gradient(135deg, #F59E0B, #D97706);
          color: white;
          font-size: 8px;
          font-weight: 700;
          padding: 2px 4px;
          border-radius: 6px;
          line-height: 1;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        /* 强制移除所有下划线 - 更强制性的样式 */
        .home-link,
        .notes-link,
        .extensions-link,
        .trash-link,
        .home-link:link,
        .home-link:visited,
        .home-link:hover,
        .home-link:active,
        .home-link:focus,
        .notes-link:link,
        .notes-link:visited,
        .notes-link:hover,
        .notes-link:active,
        .notes-link:focus,
        .extensions-link:link,
        .extensions-link:visited,
        .extensions-link:hover,
        .extensions-link:active,
        .extensions-link:focus,
        .trash-link:link,
        .trash-link:visited,
        .trash-link:hover,
        .trash-link:active,
        .trash-link:focus {
          text-decoration: none !important;
          text-decoration-line: none !important;
          text-decoration-style: none !important;
          text-decoration-color: transparent !important;
          border-bottom: none !important;
          box-shadow: none !important;
          color: #FFFFFF !important;
        }

        /* 增强的悬停效果 */
        .home-link:hover,
        .notes-link:hover,
        .extensions-link:hover,
        .trash-link:hover {
          background: var(--hover-color);
          border-color: var(--primary-color);
          box-shadow: var(--glow-gold);
          color: var(--primary-color);
          transform: translateY(-2px);
        }

        /* 激活状态 - 当前页面高亮 */
        .home-link.active,
        .notes-link.active,
        .extensions-link.active,
        .trash-link.active {
          background: var(--primary-color);
          border-color: var(--primary-color);
          color: white;
        }

        .home-icon,
        .notes-icon,
        .calendar-icon,
        .extensions-icon,
        .trash-icon {
          font-size: 16px;
          width: 20px;
          text-align: center;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
        }

        .home-text,
        .notes-text,
        .calendar-text,
        .extensions-text,
        .trash-text {
          font-size: 14px;
          font-weight: 600;
        }

        .theme-toggle-item {
          display: flex;
          align-items: center;
        }



        /* 现代化用户菜单样式 */
        .user-button {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 14px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--text-color);
          font-weight: 500;
          font-size: 14px;
          position: relative;
        }

        .user-button:hover {
          background: var(--hover-color);
          border-color: var(--border-color);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .user-menu.active .user-button {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .user-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .user-menu.active .user-avatar {
          background: white;
          color: var(--primary-color);
          transform: scale(1.05);
        }

        .username {
          font-size: 13px;
          font-weight: 500;
          max-width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dropdown-arrow {
          font-size: 8px;
          transition: transform 0.2s ease;
          opacity: 0.6;
          margin-left: 2px;
        }

        .user-menu.active .dropdown-arrow {
          transform: rotate(180deg);
          opacity: 1;
        }

        .user-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: var(--card-color);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 25px rgba(0, 0, 0, 0.1);
          min-width: 180px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-8px) scale(0.95);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }

        /* 确保用户下拉菜单内所有链接无下划线 */
        .user-dropdown a,
        .user-dropdown button {
          text-decoration: none !important;
          border: none !important;
          outline: none !important;
        }

        .user-dropdown a:hover,
        .user-dropdown a:focus,
        .user-dropdown a:active,
        .user-dropdown a:visited {
          text-decoration: none !important;
          border: none !important;
        }

        .user-menu.active .user-dropdown {
          opacity: 1;
          visibility: visible;
          transform: translateY(0) scale(1);
        }

        /* 扩展功能下拉菜单样式 */
        .extensions-dropdown {
          position: relative;
        }

        .extensions-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-color);
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          backdrop-filter: blur(10px);
        }

        .extensions-button:hover {
          background: var(--hover-color);
          border-color: var(--primary-color);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .extensions-icon {
          font-size: 16px;
          filter: drop-shadow(0 0 4px rgba(252, 211, 77, 0.4));
        }

        .extensions-menu {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 8px;
          background: var(--card-bg);
          backdrop-filter: blur(15px);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          box-shadow: var(--shadow-lg);
          min-width: 200px;
          z-index: 1000;
          overflow: hidden;
        }

        .extensions-menu .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: var(--text-color);
          text-decoration: none !important;
          transition: all 0.2s ease;
          border-bottom: 1px solid var(--border-color);
          position: relative;
        }

        .extensions-menu .dropdown-item:last-child {
          border-bottom: none;
        }

        .extensions-menu .dropdown-item:hover {
          background: var(--hover-color);
          transform: translateX(4px);
        }

        .extensions-menu .item-icon {
          font-size: 16px;
          width: 20px;
          text-align: center;
        }

        .extensions-menu .item-text {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
        }

        .vip-badge {
          background: linear-gradient(135deg, #FCD34D, #F59E0B);
          color: #1F2937;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);
        }



        /* 现代化用户下拉菜单项样式 - 高优先级 */
        .user-dropdown .theme-option,
        .user-dropdown .theme-option:link,
        .user-dropdown .theme-option:visited {
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
          width: 100% !important;
          padding: 16px 20px !important;
          background: transparent !important;
          border: none !important;
          color: var(--text-color) !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          font-size: 14px !important;
          text-align: left !important;
          text-decoration: none !important;
          border-radius: 12px !important;
          margin: 4px 8px !important;
          position: relative !important;
          font-weight: 500 !important;
          box-sizing: border-box !important;
        }

        .user-dropdown .theme-option:hover,
        .user-dropdown .theme-option:hover:link,
        .user-dropdown .theme-option:hover:visited {
          background: linear-gradient(135deg, var(--primary-color) 0%, #F59E0B 100%) !important;
          color: white !important;
          transform: translateX(3px) translateY(-1px) !important;
          box-shadow: var(--glow-gold) !important;
          border-radius: 12px !important;
          text-decoration: none !important;
        }

        .user-dropdown .theme-option:focus {
          outline: none !important;
          background: var(--hover-color) !important;
          border-radius: 12px !important;
        }

        .user-dropdown .theme-option:first-child {
          margin-top: 8px !important;
        }

        .user-dropdown .theme-option:last-child {
          margin-bottom: 8px !important;
        }

        .user-dropdown .theme-option:only-child {
          margin: 8px !important;
        }

        /* 现代化用户菜单图标样式 */
        .user-dropdown .theme-icon {
          width: 24px !important;
          height: 24px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 18px !important;
          transition: all 0.2s ease !important;
          flex-shrink: 0 !important;
          border-radius: 6px !important;
          background: rgba(59, 130, 246, 0.1) !important;
        }

        .user-dropdown .theme-option:hover .theme-icon {
          transform: scale(1.1) rotate(5deg) !important;
          background: rgba(255, 255, 255, 0.2) !important;
        }

        .user-dropdown .theme-name {
          flex: 1 !important;
          font-weight: 500 !important;
          font-size: 14px !important;
          letter-spacing: 0.3px !important;
        }

        /* 菜单项分隔线 */
        .user-dropdown .theme-option:not(:last-child)::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 20px;
          right: 20px;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, var(--border-color) 20%, var(--border-color) 80%, transparent 100%);
          opacity: 0.4;
        }

        .user-dropdown .theme-option:hover::after {
          opacity: 0;
        }

        /* 为菜单项添加更好的间距 */
        .user-dropdown {
          padding: 8px 0 !important;
        }

        /* 移动端菜单按钮 - 现代化设计 */
        .mobile-menu-button {
          display: none;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          cursor: pointer;
          padding: 10px;
          backdrop-filter: blur(8px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .mobile-menu-button:hover {
          background: rgba(255, 255, 255, 0.95);
          border-color: var(--primary-color);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }

        .bar {
          display: block;
          width: 20px;
          height: 2px;
          margin: 4px auto;
          background: linear-gradient(135deg, var(--primary-color) 0%, #F59E0B 100%);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 2px;
        }
        
        @media (max-width: 768px) {
          .mobile-menu-button {
            display: block;
            z-index: 101;
          }
          
          .nav {
            position: fixed;
            top: 0;
            right: -100%;
            width: 80%;
            max-width: 300px;
            height: 100vh;
            background-color: var(--card-color);
            padding: 80px 20px 20px;
            transition: 0.3s ease-in-out;
            box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
          }
          
          .nav.show {
            right: 0;
          }
          
          .nav-links {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .nav-item {
            width: 100%;
          }

          .dropdown-button {
            width: 100%;
            justify-content: flex-start;
            padding: 1rem;
          }

          .dropdown-content {
            position: static;
            opacity: 1;
            visibility: visible;
            transform: none;
            box-shadow: none;
            border: none;
            border-radius: 8px;
            margin-top: 0.5rem;
            min-width: auto;
          }

          .dropdown-item {
            padding: 1rem;
          }

          .user-button {
            width: 100%;
            justify-content: flex-start;
            padding: 1rem;
          }

          .user-dropdown {
            position: static;
            opacity: 1;
            visibility: visible;
            transform: none;
            box-shadow: none;
            border: none;
            border-radius: 8px;
            margin-top: 0.5rem;
            min-width: auto;
          }



          .dropdown-item {
            padding: 1rem;
          }

          /* 移动端导航和认证按钮样式 */
          .home-link-item,
          .notes-link-item,
          .extensions-link-item,
          .trash-link-item,
          .auth-button-item {
            width: 100%;
            margin: 0.25rem 0;
          }

          .home-link,
          .notes-link,
          .extensions-link,
          .trash-link,
          .auth-link {
            width: 100%;
            justify-content: flex-start;
            padding: 1rem;
            border-radius: 8px;
          }
        }
      `}</style>
    </header>
  );
};

export default Header; 
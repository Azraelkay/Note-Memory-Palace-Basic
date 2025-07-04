import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumb = ({ customItems = null }) => {
  const location = useLocation();
  
  // 如果提供了自定义项目，使用它们
  if (customItems) {
    return (
      <nav className="breadcrumb">
        <ol className="breadcrumb-list">
          {customItems.map((item, index) => (
            <li key={index} className="breadcrumb-item">
              {index < customItems.length - 1 ? (
                <>
                  <Link to={item.path} className="breadcrumb-link">
                    {item.icon && <span className="breadcrumb-icon">{item.icon}</span>}
                    <span className="breadcrumb-text">{item.label}</span>
                  </Link>
                  <span className="breadcrumb-separator">›</span>
                </>
              ) : (
                <span className="breadcrumb-current">
                  {item.icon && <span className="breadcrumb-icon">{item.icon}</span>}
                  <span className="breadcrumb-text">{item.label}</span>
                </span>
              )}
            </li>
          ))}
        </ol>
        <style jsx>{`
          .breadcrumb {
            margin-bottom: 1.5rem;
            padding: 0.75rem 0;
          }
          
          .breadcrumb-list {
            display: flex;
            align-items: center;
            list-style: none;
            margin: 0;
            padding: 0;
            gap: 0.5rem;
          }
          
          .breadcrumb-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .breadcrumb-link {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-light);
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            padding: 0.25rem 0.5rem;
            border-radius: 6px;
            transition: all 0.2s ease;
          }
          
          .breadcrumb-link:hover {
            color: var(--primary-color);
            background: rgba(59, 130, 246, 0.08);
            text-decoration: none;
          }
          
          .breadcrumb-current {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-color);
            font-size: 14px;
            font-weight: 600;
            padding: 0.25rem 0.5rem;
          }
          
          .breadcrumb-separator {
            color: var(--text-light);
            font-size: 14px;
            opacity: 0.6;
          }
          
          .breadcrumb-icon {
            font-size: 14px;
          }
          
          .breadcrumb-text {
            font-size: 14px;
          }
        `}</style>
      </nav>
    );
  }

  // 自动生成面包屑
  const pathnames = location.pathname.split('/').filter(x => x);
  
  const breadcrumbItems = [
    { path: '/', label: '首页', icon: '🏠' }
  ];
  
  let currentPath = '';
  pathnames.forEach((name, index) => {
    currentPath += `/${name}`;
    
    let label = name;
    let icon = '';
    
    // 根据路径设置标签和图标
    switch (name) {
      case 'notes':
        label = '我的笔记';
        icon = '📝';
        break;
      case 'profile':
        label = '个人资料';
        icon = '👤';
        break;
      case 'login':
        label = '登录';
        icon = '🔑';
        break;
      case 'register':
        label = '注册';
        icon = '✨';
        break;
      default:
        label = name.charAt(0).toUpperCase() + name.slice(1);
    }
    
    breadcrumbItems.push({
      path: currentPath,
      label,
      icon
    });
  });

  return (
    <nav className="breadcrumb">
      <ol className="breadcrumb-list">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            {index < breadcrumbItems.length - 1 ? (
              <>
                <Link to={item.path} className="breadcrumb-link">
                  {item.icon && <span className="breadcrumb-icon">{item.icon}</span>}
                  <span className="breadcrumb-text">{item.label}</span>
                </Link>
                <span className="breadcrumb-separator">›</span>
              </>
            ) : (
              <span className="breadcrumb-current">
                {item.icon && <span className="breadcrumb-icon">{item.icon}</span>}
                <span className="breadcrumb-text">{item.label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
      <style jsx>{`
        .breadcrumb {
          margin-bottom: 1.5rem;
          padding: 0.75rem 0;
        }
        
        .breadcrumb-list {
          display: flex;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 0.5rem;
        }
        
        .breadcrumb-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .breadcrumb-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-light);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        
        .breadcrumb-link:hover {
          color: var(--primary-color);
          background: rgba(59, 130, 246, 0.08);
          text-decoration: none;
        }
        
        .breadcrumb-current {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-color);
          font-size: 14px;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
        }
        
        .breadcrumb-separator {
          color: var(--text-light);
          font-size: 14px;
          opacity: 0.6;
        }
        
        .breadcrumb-icon {
          font-size: 14px;
        }
        
        .breadcrumb-text {
          font-size: 14px;
        }
      `}</style>
    </nav>
  );
};

export default Breadcrumb;

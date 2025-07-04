import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Extensions.css';

const ExtensionsTest = () => {
  const { user } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // 扩展数据
  const extensions = [
    {
      id: 'mindmap',
      name: '思维导图',
      icon: '🧠',
      description: '创建和编辑思维导图，可视化思维过程和知识结构',
      features: ['节点编辑', '样式定制', '导出功能', '协同编辑'],
      category: 'productivity',
      isPremium: true
    },
    {
      id: 'calendar',
      name: '日历视图',
      icon: '📅',
      description: '按日历形式查看和管理笔记，支持日程安排',
      features: ['月视图', '周视图', '日程提醒', '事件管理'],
      category: 'organization',
      isPremium: true
    },
    {
      id: 'kanban',
      name: '看板管理',
      icon: '📋',
      description: 'Kanban风格的任务管理，拖拽操作，提高工作效率',
      features: ['拖拽排序', '状态管理', '任务分类', '优先级设置'],
      category: 'productivity',
      isPremium: true
    },
    {
      id: 'export',
      name: '数据导出',
      icon: '📤',
      description: '将笔记导出为PDF、Word、Excel等多种格式',
      features: ['PDF导出', 'Word导出', '批量导出', '格式定制'],
      category: 'utility',
      isPremium: true
    },
    {
      id: 'templates',
      name: '模板库',
      icon: '📄',
      description: '提供各种笔记模板，快速创建格式化内容',
      features: ['预设模板', '自定义模板', '模板分享', '快速应用'],
      category: 'productivity',
      isPremium: true
    },
    {
      id: 'stats',
      name: '数据统计',
      icon: '📊',
      description: '分析笔记数据，提供详细的统计图表',
      features: ['写作统计', '时间分析', '标签统计', '数据可视化'],
      category: 'analytics',
      isPremium: true
    }
  ];

  const handleExtensionClick = (extension) => {
    if (extension.isPremium && (!user || user.accountType !== 'premium')) {
      setShowUpgradeModal(true);
    } else {
      // 跳转到扩展页面
      console.log('打开扩展:', extension.name);
    }
  };

  return (
    <div className="extensions-page">
      <div className="extensions-container">
        <div className="extensions-header">
          <h1 className="extensions-title">
            <span className="title-icon">🏰</span>
            扩展宫殿
          </h1>
          <p className="extensions-subtitle">
            探索强大的功能扩展，提升您的笔记体验
          </p>
        </div>

        <div className="extensions-grid">
          {extensions.map(extension => (
            <div
              key={extension.id}
              className={`extension-card ${extension.isPremium ? 'premium' : ''}`}
              onClick={() => handleExtensionClick(extension)}
            >
              <div className="extension-header">
                <div className="extension-icon">{extension.icon}</div>
                <div className="extension-info">
                  <h3 className="extension-name">{extension.name}</h3>
                  {extension.isPremium && (
                    <span className="premium-badge">VIP专享</span>
                  )}
                </div>
                {extension.isPremium && (
                  <div className="lock-icon">🔒</div>
                )}
              </div>

              <p className="extension-description">{extension.description}</p>

              <div className="extension-features">
                <h4>主要功能:</h4>
                <ul>
                  {extension.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>

              <div className="extension-actions">
                {extension.isPremium ? (
                  <button className="btn-upgrade">
                    升级解锁
                  </button>
                ) : (
                  <button className="btn-install">
                    立即使用
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 升级提示模态框 */}
      {showUpgradeModal && (
        <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="upgrade-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🌟 升级到VIP会员</h3>
              <button
                className="modal-close"
                onClick={() => setShowUpgradeModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <p>此功能需要VIP会员权限才能使用</p>
              <div className="vip-benefits">
                <h4>VIP会员特权:</h4>
                <ul>
                  <li>🧠 思维导图 - 可视化思维过程</li>
                  <li>📅 日历视图 - 时间管理利器</li>
                  <li>📋 看板管理 - 高效任务管理</li>
                  <li>📤 数据导出 - 多格式导出</li>
                  <li>📄 模板库 - 丰富模板资源</li>
                  <li>📊 数据统计 - 深度数据分析</li>
                  <li>☁️ 云端同步 - 多设备同步</li>
                  <li>🎨 高级主题 - 个性化定制</li>
                </ul>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn-upgrade-now"
                onClick={() => {
                  setShowUpgradeModal(false);
                  alert('升级功能开发中，敬请期待！');
                }}
              >
                立即升级
              </button>
              <button
                className="btn-cancel"
                onClick={() => setShowUpgradeModal(false)}
              >
                稍后再说
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtensionsTest;

import React from 'react';

const SaveStatusIndicator = ({ 
  saveStatus, 
  saveStatusText, 
  onSaveNow = null,
  showSaveButton = true 
}) => {
  const getStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return '⏳';
      case 'saved':
        return '✅';
      case 'error':
        return '❌';
      case 'pending':
        return '⚠️';
      default:
        return '📝';
    }
  };

  const getStatusColor = () => {
    switch (saveStatus) {
      case 'saving':
        return '#3B82F6'; // 蓝色
      case 'saved':
        return '#10B981'; // 绿色
      case 'error':
        return '#EF4444'; // 红色
      case 'pending':
        return '#F59E0B'; // 橙色
      default:
        return '#6B7280'; // 灰色
    }
  };

  return (
    <div className="save-status-indicator">
      <div className="status-info">
        <span className="status-icon">{getStatusIcon()}</span>
        <span className="status-text">{saveStatusText}</span>
      </div>
      
      {showSaveButton && onSaveNow && saveStatus === 'pending' && (
        <button
          type="button"
          className="save-now-btn"
          onClick={onSaveNow}
          title="立即保存"
        >
          立即保存
        </button>
      )}

      <style jsx>{`
        .save-status-indicator {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 8px 12px;
          background: var(--bg-color);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          font-size: 13px;
          min-height: 36px;
        }

        .status-info {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
        }

        .status-icon {
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
        }

        .status-text {
          color: ${getStatusColor()};
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .save-now-btn {
          padding: 4px 12px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
          white-space: nowrap;
        }

        .save-now-btn:hover {
          background: var(--primary-dark);
          transform: translateY(-1px);
        }

        .save-now-btn:active {
          transform: translateY(0);
        }

        /* 动画效果 */
        .status-icon {
          animation: ${saveStatus === 'saving' ? 'pulse 1.5s infinite' : 'none'};
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .save-status-indicator {
            padding: 6px 10px;
            font-size: 12px;
            min-height: 32px;
          }

          .save-now-btn {
            padding: 3px 8px;
            font-size: 11px;
          }

          .status-text {
            max-width: 120px;
          }
        }
      `}</style>
    </div>
  );
};

export default SaveStatusIndicator;

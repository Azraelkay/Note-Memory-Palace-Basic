import React, { useState, useEffect } from 'react';

const ErrorMessage = ({ 
  message, 
  type = 'error', 
  onClose = null,
  autoClose = true,
  duration = 5000,
  showIcon = true 
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoClose && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) {
      setTimeout(onClose, 300); // 等待动画完成
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❌';
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'success':
        return 'message-success';
      case 'warning':
        return 'message-warning';
      case 'info':
        return 'message-info';
      default:
        return 'message-error';
    }
  };

  if (!message || !visible) {
    return null;
  }

  return (
    <div className={`error-message ${getTypeClass()} ${visible ? 'visible' : 'hidden'}`}>
      <div className="message-content">
        {showIcon && <span className="message-icon">{getIcon()}</span>}
        <span className="message-text">{message}</span>
      </div>
      
      {onClose && (
        <button 
          className="close-button"
          onClick={handleClose}
          aria-label="关闭"
        >
          ×
        </button>
      )}

      <style jsx>{`
        .error-message {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-radius: var(--border-radius);
          margin-bottom: 16px;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          transform: translateY(0);
          opacity: 1;
        }

        .error-message.hidden {
          transform: translateY(-10px);
          opacity: 0;
          margin-bottom: 0;
          padding-top: 0;
          padding-bottom: 0;
        }

        .message-content {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .message-icon {
          font-size: 16px;
          flex-shrink: 0;
        }

        .message-text {
          line-height: 1.4;
          word-break: break-word;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          padding: 0;
          margin-left: 12px;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: var(--transition);
          flex-shrink: 0;
        }

        .close-button:hover {
          background: rgba(0, 0, 0, 0.1);
        }

        /* 错误样式 */
        .message-error {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          color: #DC2626;
        }

        .message-error .close-button {
          color: #DC2626;
        }

        /* 成功样式 */
        .message-success {
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          color: #16A34A;
        }

        .message-success .close-button {
          color: #16A34A;
        }

        /* 警告样式 */
        .message-warning {
          background: #FFFBEB;
          border: 1px solid #FED7AA;
          color: #D97706;
        }

        .message-warning .close-button {
          color: #D97706;
        }

        /* 信息样式 */
        .message-info {
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          color: #2563EB;
        }

        .message-info .close-button {
          color: #2563EB;
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .error-message {
            padding: 10px 12px;
            font-size: 13px;
          }

          .message-icon {
            font-size: 14px;
          }

          .close-button {
            font-size: 16px;
            width: 18px;
            height: 18px;
            margin-left: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default ErrorMessage;

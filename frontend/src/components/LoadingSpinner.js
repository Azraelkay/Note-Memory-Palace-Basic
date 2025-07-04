import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  text = '加载中...', 
  overlay = false,
  color = 'primary' 
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'spinner-small';
      case 'large':
        return 'spinner-large';
      default:
        return 'spinner-medium';
    }
  };

  const getColorClass = () => {
    switch (color) {
      case 'white':
        return 'spinner-white';
      case 'gray':
        return 'spinner-gray';
      default:
        return 'spinner-primary';
    }
  };

  const SpinnerContent = () => (
    <div className={`loading-spinner ${getSizeClass()} ${getColorClass()}`}>
      <div className="spinner">
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
      </div>
      {text && <div className="spinner-text">{text}</div>}
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay">
        <SpinnerContent />
        <style jsx>{`
          .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            backdrop-filter: blur(2px);
          }

          .loading-spinner {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }

          .spinner {
            display: flex;
            gap: 4px;
          }

          .spinner-circle {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            animation: bounce 1.4s ease-in-out infinite both;
          }

          .spinner-circle:nth-child(1) {
            animation-delay: -0.32s;
          }

          .spinner-circle:nth-child(2) {
            animation-delay: -0.16s;
          }

          .spinner-small .spinner-circle {
            width: 6px;
            height: 6px;
          }

          .spinner-medium .spinner-circle {
            width: 8px;
            height: 8px;
          }

          .spinner-large .spinner-circle {
            width: 12px;
            height: 12px;
          }

          .spinner-primary .spinner-circle {
            background-color: var(--primary-color);
          }

          .spinner-white .spinner-circle {
            background-color: white;
          }

          .spinner-gray .spinner-circle {
            background-color: var(--text-light);
          }

          .spinner-text {
            font-size: 14px;
            color: var(--text-color);
            font-weight: 500;
          }

          .spinner-small .spinner-text {
            font-size: 12px;
          }

          .spinner-large .spinner-text {
            font-size: 16px;
          }

          @keyframes bounce {
            0%, 80%, 100% {
              transform: scale(0);
            }
            40% {
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <SpinnerContent />
      <style jsx>{`
        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 20px;
        }

        .spinner {
          display: flex;
          gap: 4px;
        }

        .spinner-circle {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: bounce 1.4s ease-in-out infinite both;
        }

        .spinner-circle:nth-child(1) {
          animation-delay: -0.32s;
        }

        .spinner-circle:nth-child(2) {
          animation-delay: -0.16s;
        }

        .spinner-small .spinner-circle {
          width: 6px;
          height: 6px;
        }

        .spinner-medium .spinner-circle {
          width: 8px;
          height: 8px;
        }

        .spinner-large .spinner-circle {
          width: 12px;
          height: 12px;
        }

        .spinner-primary .spinner-circle {
          background-color: var(--primary-color);
        }

        .spinner-white .spinner-circle {
          background-color: white;
        }

        .spinner-gray .spinner-circle {
          background-color: var(--text-light);
        }

        .spinner-text {
          font-size: 14px;
          color: var(--text-color);
          font-weight: 500;
        }

        .spinner-small .spinner-text {
          font-size: 12px;
        }

        .spinner-large .spinner-text {
          font-size: 16px;
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default LoadingSpinner;

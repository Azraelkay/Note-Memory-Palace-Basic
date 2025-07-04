import React from 'react';

const VipUpgradePrompt = ({ 
  featureName, 
  featureIcon, 
  description, 
  features = [],
  previewContent = null 
}) => {
  const handleUpgrade = () => {
    // 在基础版本中，显示提示信息
    alert('此功能需要升级到VIP版本！\n\n请访问我们的官网了解更多信息。');
  };

  return (
    <div className="vip-upgrade-container">
      {/* 功能预览区域 */}
      {previewContent && (
        <div className="feature-preview">
          <div className="preview-overlay">
            <div className="preview-blur">
              {previewContent}
            </div>
            <div className="upgrade-overlay">
              <div className="upgrade-content">
                <div className="feature-header">
                  <span className="feature-icon">{featureIcon}</span>
                  <h2 className="feature-title">{featureName}</h2>
                  <span className="vip-badge">VIP专享</span>
                </div>
                <p className="feature-description">{description}</p>
                
                {features.length > 0 && (
                  <div className="feature-list">
                    <h3>功能特色：</h3>
                    <ul>
                      {features.map((feature, index) => (
                        <li key={index}>
                          <span className="check-icon">✨</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button className="upgrade-button" onClick={handleUpgrade}>
                  <span className="button-icon">👑</span>
                  升级到VIP版本
                </button>

                <div className="upgrade-note">
                  <p>🎯 升级VIP即可解锁所有高级功能</p>
                  <p>💎 享受完整的记忆宫殿体验</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 无预览内容时的简单提示 */}
      {!previewContent && (
        <div className="simple-upgrade-prompt">
          <div className="prompt-content">
            <div className="feature-header">
              <span className="feature-icon">{featureIcon}</span>
              <h2 className="feature-title">{featureName}</h2>
              <span className="vip-badge">VIP专享</span>
            </div>
            
            <p className="feature-description">{description}</p>
            
            {features.length > 0 && (
              <div className="feature-list">
                <h3>功能特色：</h3>
                <ul>
                  {features.map((feature, index) => (
                    <li key={index}>
                      <span className="check-icon">✨</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button className="upgrade-button" onClick={handleUpgrade}>
              <span className="button-icon">👑</span>
              升级到VIP版本
            </button>

            <div className="upgrade-note">
              <p>🎯 升级VIP即可解锁所有高级功能</p>
              <p>💎 享受完整的记忆宫殿体验</p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .vip-upgrade-container {
          min-height: 100vh;
          background: var(--bg-color);
          position: relative;
        }

        .feature-preview {
          position: relative;
          height: 100vh;
          overflow: hidden;
        }

        .preview-blur {
          filter: blur(8px);
          opacity: 0.3;
          pointer-events: none;
          height: 100%;
          overflow: hidden;
        }

        .upgrade-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(11, 20, 38, 0.9);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .simple-upgrade-prompt {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .upgrade-content,
        .prompt-content {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 3rem;
          max-width: 500px;
          text-align: center;
          box-shadow: var(--shadow-lg);
          backdrop-filter: blur(15px);
        }

        .feature-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .feature-icon {
          font-size: 3rem;
          filter: drop-shadow(0 0 10px rgba(252, 211, 77, 0.6));
        }

        .feature-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-color);
          margin: 0;
          background: linear-gradient(135deg, #FCD34D, #F59E0B);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .vip-badge {
          background: linear-gradient(135deg, #FCD34D, #F59E0B);
          color: #1F2937;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        }

        .feature-description {
          font-size: 1.1rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .feature-list {
          text-align: left;
          margin-bottom: 2rem;
        }

        .feature-list h3 {
          color: var(--text-color);
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .feature-list ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .feature-list li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          color: var(--text-secondary);
        }

        .check-icon {
          color: #FCD34D;
          font-size: 1rem;
        }

        .upgrade-button {
          background: linear-gradient(135deg, #FCD34D, #F59E0B);
          color: #1F2937;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 auto 2rem;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        }

        .upgrade-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(245, 158, 11, 0.6);
        }

        .button-icon {
          font-size: 1.2rem;
        }

        .upgrade-note {
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .upgrade-note p {
          margin: 0.5rem 0;
        }

        @media (max-width: 768px) {
          .upgrade-content,
          .prompt-content {
            padding: 2rem;
            margin: 1rem;
          }

          .feature-title {
            font-size: 1.5rem;
          }

          .feature-icon {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default VipUpgradePrompt;

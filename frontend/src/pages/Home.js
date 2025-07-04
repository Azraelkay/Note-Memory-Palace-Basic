import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>🏰 Note记忆宫殿</h1>
          <p className="subtitle">
            构建您的知识宫殿，让思维在神经网络中自由连接。支持Markdown格式、智能标签、全文搜索以及多维度知识管理
          </p>
          {isAuthenticated ? (
            <Link to="/notes" className="btn btn-hero">
              我的笔记
            </Link>
          ) : (
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-hero">
                立即注册
              </Link>
              <Link to="/login" className="btn btn-secondary">
                登录
              </Link>
            </div>
          )}
        </div>
        <div className="hero-image">
          <div className="image-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </section>

      <section className="features">
        <h2 className="section-title">主要功能</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3>🧠 神经网络编辑器</h3>
            <p>双模式编辑体验，富文本与Markdown无缝切换，让思维在文字间自由流淌。</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h3>⚡ 量子保存</h3>
            <p>智能实时保存，您的每一个想法都被安全地存储在记忆宫殿中。</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3>🏷️ 智能标签网络</h3>
            <p>构建知识节点间的连接，让信息在标签网络中有机组织。</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3>🔍 深度搜索</h3>
            <p>穿越知识迷宫，瞬间定位您需要的任何信息片段。</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M13 5l4 4" />
              </svg>
            </div>
            <h3>🌌 宇宙主题</h3>
            <p>记忆宫殿、星空模式、深渊模式，选择最适合您思维的宇宙空间。</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3>📎 多维度附件</h3>
            <p>图片、文档、链接，为您的知识宫殿添加丰富的多媒体维度。</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta-content">
          <h2>开始使用Note</h2>
          <p>记录想法、整理知识，提高工作效率</p>
          {isAuthenticated ? (
            <Link to="/notes" className="btn">
              开始写笔记
            </Link>
          ) : (
            <Link to="/register" className="btn">
              免费注册
            </Link>
          )}
        </div>
      </section>

      <style jsx>{`
        .home {
          padding-bottom: 4rem;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(139, 92, 246, 0.02) 100%);
          min-height: calc(100vh - 80px);
        }

        .hero {
          display: flex;
          align-items: center;
          padding: 6rem 0;
          gap: 3rem;
          position: relative;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .hero-content {
          flex: 1;
          position: relative;
          z-index: 1;
        }

        .hero h1 {
          font-size: 3.5rem;
          font-weight: 900;
          margin-bottom: 2rem;
          line-height: 1.1;
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 50%, #f59e0b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: fadeInUp 0.8s ease-out;
        }

        .subtitle {
          font-size: 1.3rem;
          color: var(--text-light);
          margin-bottom: 3rem;
          max-width: 600px;
          line-height: 1.6;
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }

        .hero-buttons {
          display: flex;
          gap: 1.5rem;
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }

        .btn-hero {
          padding: 16px 32px;
          font-size: 1.1rem;
          font-weight: 600;
          border-radius: 16px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .btn-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }

        .btn-hero:hover::before {
          left: 100%;
        }

        .btn-hero:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(59, 130, 246, 0.4);
        }
        
        .hero-image {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .image-placeholder {
          width: 100%;
          max-width: 500px;
          aspect-ratio: 4/3;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
          border-radius: 24px;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid rgba(59, 130, 246, 0.2);
          backdrop-filter: blur(10px);
          animation: float 6s ease-in-out infinite;
          box-shadow: 0 20px 60px rgba(59, 130, 246, 0.1);
        }

        .image-placeholder svg {
          width: 40%;
          height: 40%;
          color: var(--primary-color);
          filter: drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3));
        }

        .section-title {
          text-align: center;
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 4rem;
          color: var(--primary-color);
          text-shadow: 0 0 20px rgba(252, 211, 77, 0.5);
          background: linear-gradient(135deg, var(--text-color) 0%, var(--primary-color) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .features {
          padding: 6rem 0;
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(10px);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2.5rem;
        }

        .feature-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 100%);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .feature-card:hover::before {
          transform: scaleX(1);
        }

        .feature-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 60px rgba(59, 130, 246, 0.15);
          border-color: rgba(59, 130, 246, 0.3);
        }
        
        .feature-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
          border-radius: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 2rem;
          transition: all 0.3s ease;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .feature-card:hover .feature-icon {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
        }

        .feature-icon svg {
          width: 28px;
          height: 28px;
          color: var(--primary-color);
          transition: all 0.3s ease;
        }

        .feature-card:hover .feature-icon svg {
          color: white;
          transform: scale(1.1);
        }

        .feature-card h3 {
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: 1.2rem;
          color: var(--primary-color);
          text-shadow: 0 0 12px rgba(252, 211, 77, 0.4);
          transition: all 0.3s ease;
        }

        .feature-card:hover h3 {
          color: #F59E0B;
          text-shadow: 0 0 16px rgba(245, 158, 11, 0.6);
          transform: translateY(-2px);
        }

        .feature-card p {
          color: var(--text-light);
          line-height: 1.7;
          font-size: 1rem;
        }

        .cta {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 50%, #f59e0b 100%);
          border-radius: 24px;
          padding: 5rem 3rem;
          margin: 6rem 0 4rem;
          text-align: center;
          color: white;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(59, 130, 246, 0.3);
        }

        .cta::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .cta-content {
          position: relative;
          z-index: 1;
        }

        .cta h2 {
          font-size: 2.5rem;
          font-weight: 900;
          margin-bottom: 1.5rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .cta p {
          font-size: 1.2rem;
          margin-bottom: 2.5rem;
          opacity: 0.9;
        }
        
        .cta p {
          font-size: 1.25rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }
        
        .cta .btn {
          background: white;
          color: var(--primary-color);
          font-weight: 700;
          padding: 16px 32px;
          font-size: 1.1rem;
          border-radius: 16px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .cta .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
          transition: left 0.5s;
        }

        .cta .btn:hover::before {
          left: 100%;
        }

        .cta .btn:hover {
          background: rgba(255, 255, 255, 0.95);
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.3);
        }

        /* 动画效果 */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .hero {
            flex-direction: column;
            padding: 3rem 0;
            gap: 2rem;
          }

          .hero h1 {
            font-size: 2.5rem;
            text-align: center;
          }

          .subtitle {
            text-align: center;
            font-size: 1.1rem;
          }

          .hero-buttons {
            justify-content: center;
            flex-wrap: wrap;
          }

          .hero-content, .hero-image {
            width: 100%;
          }

          .section-title {
            font-size: 2rem;
            margin-bottom: 3rem;
          }

          .features {
            padding: 4rem 0;
          }

          .features-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
          }

          .cta {
            padding: 4rem 2rem;
            margin: 4rem 0 2rem;
          }

          .cta h2 {
            font-size: 2rem;
          }

          .cta p {
            font-size: 1.1rem;
          }
        }

        @media (max-width: 480px) {
          .hero h1 {
            font-size: 2rem;
          }

          .btn-hero {
            padding: 14px 24px;
            font-size: 1rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .feature-card {
            padding: 2rem;
          }

          .cta {
            padding: 3rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home; 
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <div className="error-code">404</div>
        <h1>页面未找到</h1>
        <p>您要查找的页面不存在或已被移除</p>
        <Link to="/" className="btn">
          返回首页
        </Link>
      </div>
      
      <style jsx>{`
        .not-found {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 200px);
          text-align: center;
          padding: 2rem;
        }
        
        .not-found-content {
          max-width: 500px;
        }
        
        .error-code {
          font-size: 8rem;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 1rem;
          background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .not-found h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: var(--text-color);
        }
        
        .not-found p {
          color: var(--text-light);
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }
        
        .not-found .btn {
          display: inline-block;
          padding: 12px 24px;
          font-size: 1.1rem;
        }
      `}</style>
    </div>
  );
};

export default NotFound; 
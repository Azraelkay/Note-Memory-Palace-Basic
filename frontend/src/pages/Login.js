import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const { login, error: authError, isAuthenticated } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { username, password } = formData;

  useEffect(() => {
    // 如果用户已经登录，重定向到首页
    if (isAuthenticated) {
      navigate('/');
    }
    
    // 显示认证错误
    if (authError) {
      setError(authError);
    }
  }, [isAuthenticated, navigate, authError]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(''); // 清除之前的错误

    if (!username || !password) {
      setError('请填写所有字段');
      return;
    }

    try {
      // 调用登录方法
      const success = await login(formData);
      if (success) {
        navigate('/notes'); // 登录成功后跳转到笔记页面
      }
    } catch (err) {
      // 处理登录错误
      if (err.message.includes('401') || err.message.includes('用户名或密码错误')) {
        setError('用户名或密码错误，请检查后重试');
      } else if (err.message.includes('网络')) {
        setError('网络连接失败，请检查网络后重试');
      } else {
        setError(err.message || '登录失败，请重试');
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>欢迎回来</h2>
          <p>登录您的Note账号</p>
        </div>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={onSubmit}>
          <div className="form-control">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={onChange}
              placeholder="输入用户名"
            />
          </div>
          
          <div className="form-control">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="输入密码"
            />
          </div>
          
          <button type="submit" className="btn btn-block">
            登录
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            <Link to="/forgot-password">忘记密码？</Link>
          </p>
          <p>
            还没有账号？ <Link to="/register">立即注册</Link>
          </p>
        </div>
      </div>
      
      <style jsx>{`
        .auth-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 200px);
          padding: 2rem 0;
        }
        
        .auth-card {
          background-color: var(--card-color);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          width: 100%;
          max-width: 450px;
          padding: 2.5rem;
        }
        
        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .auth-header h2 {
          font-size: 1.75rem;
          color: var(--text-color);
          margin-bottom: 0.5rem;
        }
        
        .auth-header p {
          color: var(--text-light);
        }
        
        .auth-footer {
          margin-top: 2rem;
          text-align: center;
          color: var(--text-light);
        }
        
        .auth-footer a {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
          text-shadow: 0 0 8px rgba(252, 211, 77, 0.3);
          position: relative;
        }

        .auth-footer a::before {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--primary-color), #F59E0B);
          transition: width 0.3s ease;
        }

        .auth-footer a:hover {
          color: #F59E0B;
          text-shadow: 0 0 12px rgba(252, 211, 77, 0.6);
          transform: translateY(-1px);
        }

        .auth-footer a:hover::before {
          width: 100%;
        }
        
        @media (max-width: 768px) {
          .auth-card {
            padding: 1.5rem;
            margin: 0 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login; 
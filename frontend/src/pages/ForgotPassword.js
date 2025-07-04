import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetCode, resetPassword } from '../services/api';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: 输入邮箱, 2: 输入重置码和新密码
  const [formData, setFormData] = useState({
    email: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { email, resetCode, newPassword, confirmPassword } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
    if (success) setSuccess('');
  };

  // 发送重置码
  const handleSendResetCode = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('请输入邮箱地址');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('邮箱格式不正确');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await sendPasswordResetCode(email);
      setSuccess(result.message);
      setStep(2);
    } catch (err) {
      setError(err.message || '发送重置码失败');
    } finally {
      setLoading(false);
    }
  };

  // 重置密码
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!resetCode || !newPassword || !confirmPassword) {
      setError('请填写所有字段');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (newPassword.length < 6) {
      setError('密码长度至少6位');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await resetPassword(email, resetCode, newPassword);
      setSuccess(result.message);
      // 3秒后跳转到登录页
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    } catch (err) {
      setError(err.message || '重置密码失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>找回密码</h2>
          <p>{step === 1 ? '输入您的邮箱地址' : '输入重置码和新密码'}</p>
        </div>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
        {step === 1 ? (
          <form onSubmit={handleSendResetCode}>
            <div className="form-control">
              <label htmlFor="email">邮箱地址</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={onChange}
                placeholder="输入注册时使用的邮箱"
                required
              />
            </div>
            
            <button type="submit" className="btn btn-block" disabled={loading}>
              {loading ? '发送中...' : '发送重置码'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="form-control">
              <label htmlFor="resetCode">重置码</label>
              <input
                type="text"
                id="resetCode"
                name="resetCode"
                value={resetCode}
                onChange={onChange}
                placeholder="输入邮箱中收到的重置码"
                maxLength="6"
                required
              />
              <div className="form-hint">
                重置码已发送到 {email}，请查收邮件
              </div>
            </div>
            
            <div className="form-control">
              <label htmlFor="newPassword">新密码</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={onChange}
                placeholder="输入新密码（至少6位）"
                required
              />
            </div>
            
            <div className="form-control">
              <label htmlFor="confirmPassword">确认新密码</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={onChange}
                placeholder="再次输入新密码"
                required
              />
            </div>
            
            <button type="submit" className="btn btn-block" disabled={loading}>
              {loading ? '重置中...' : '重置密码'}
            </button>
            
            <button 
              type="button" 
              className="btn btn-secondary btn-block"
              onClick={() => setStep(1)}
              style={{ marginTop: '0.5rem' }}
            >
              返回上一步
            </button>
          </form>
        )}
        
        <div className="auth-footer">
          <p>
            想起密码了？ <Link to="/login">立即登录</Link>
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
          color: var(--text-color);
          margin-bottom: 0.5rem;
        }
        
        .auth-header p {
          color: var(--text-secondary);
          margin: 0;
        }
        
        .form-control {
          margin-bottom: 1.5rem;
        }
        
        .form-control label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-color);
          font-weight: 500;
        }
        
        .form-control input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          background-color: var(--input-bg);
          color: var(--text-color);
          font-size: 1rem;
        }
        
        .form-control input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .form-hint {
          color: #6b7280;
          font-size: 0.85rem;
          margin-top: 0.5rem;
        }
        
        .btn {
          background-color: var(--primary-color);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: var(--border-radius);
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .btn:hover:not(:disabled) {
          background-color: var(--primary-hover);
        }
        
        .btn:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }
        
        .btn-block {
          width: 100%;
        }
        
        .btn-secondary {
          background-color: #6b7280;
        }
        
        .btn-secondary:hover:not(:disabled) {
          background-color: #4b5563;
        }
        
        .error {
          background-color: #fef2f2;
          color: #dc2626;
          padding: 0.75rem;
          border-radius: var(--border-radius);
          margin-bottom: 1rem;
          border: 1px solid #fecaca;
        }
        
        .success {
          background-color: #d1fae5;
          color: #065f46;
          padding: 0.75rem;
          border-radius: var(--border-radius);
          margin-bottom: 1rem;
          border: 1px solid #a7f3d0;
        }
        
        .auth-footer {
          text-align: center;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
        }
        
        .auth-footer p {
          margin: 0.5rem 0;
          color: var(--text-secondary);
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

export default ForgotPassword;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendVerificationCode, verifyEmailCode } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    verificationCode: ''
  });
  const { register, error: authError, isAuthenticated } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  const { username, email, password, password2, verificationCode } = formData;

  // 倒计时效果
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

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
    // 清除错误信息
    if (error) setError('');
    if (success) setSuccess('');
  };

  // 发送邮箱验证码
  const handleSendCode = async () => {
    if (!email) {
      setError('请先输入邮箱地址');
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
      const result = await sendVerificationCode(email);
      setSuccess(result.message);
      setCodeSent(true);
      setCountdown(60); // 60秒倒计时
    } catch (err) {
      setError(err.message || '发送验证码失败');
    } finally {
      setLoading(false);
    }
  };

  // 验证邮箱验证码
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setError('请输入验证码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await verifyEmailCode(email, verificationCode);
      setSuccess(result.message);
      setEmailVerified(true);
    } catch (err) {
      setError(err.message || '验证失败');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      setError('请填写所有必填字段');
      return;
    }

    if (password !== password2) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少6位');
      return;
    }

    if (!verificationCode) {
      setError('请输入邮箱验证码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 调用注册方法
      const registerData = {
        username,
        email,
        password,
        verificationCode: verificationCode // 直接使用用户输入的验证码
      };

      console.log('注册数据:', registerData);
      const result = await register(registerData);

      // 检查注册结果
      if (result && (result.success || result.message || result.user)) {
        setSuccess('注册成功！正在跳转...');
        setTimeout(() => navigate('/'), 1500);
      } else {
        setError('注册失败，请重试');
      }
    } catch (err) {
      console.error('注册错误:', err);
      setError(err.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>创建账号</h2>
          <p>注册Note，开始记录您的想法</p>
        </div>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
        <form onSubmit={onSubmit}>
          <div className="form-control">
            <label htmlFor="username">用户名 <span className="required">*</span></label>
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
            <label htmlFor="email">邮箱 <span className="required">*</span></label>
            <div className="email-verification-group">
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={onChange}
                placeholder="输入邮箱"
                disabled={emailVerified}
              />
              <button
                type="button"
                className={`verify-btn ${emailVerified ? 'verified' : ''}`}
                onClick={handleSendCode}
                disabled={loading || countdown > 0 || emailVerified}
              >
                {emailVerified ? '✓ 已验证' : countdown > 0 ? `${countdown}s` : '发送验证码'}
              </button>
            </div>
            {emailVerified && <div className="verification-success">✓ 邮箱验证成功</div>}
          </div>

          {codeSent && !emailVerified && (
            <div className="form-control">
              <label htmlFor="verificationCode">邮箱验证码 <span className="required">*</span></label>
              <div className="verification-group">
                <input
                  type="text"
                  id="verificationCode"
                  name="verificationCode"
                  value={verificationCode}
                  onChange={onChange}
                  placeholder="输入5位验证码"
                  maxLength="5"
                />
                <button
                  type="button"
                  className="verify-code-btn"
                  onClick={handleVerifyCode}
                  disabled={loading || !verificationCode}
                >
                  {loading ? '验证中...' : '验证'}
                </button>
              </div>
              <div className="verification-hint">
                验证码已发送到您的邮箱，请查收（有效期5分钟）
              </div>
            </div>
          )}
          
          <div className="form-control">
            <label htmlFor="password">密码 <span className="required">*</span></label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="输入密码"
            />
          </div>
          
          <div className="form-control">
            <label htmlFor="password2">确认密码 <span className="required">*</span></label>
            <input
              type="password"
              id="password2"
              name="password2"
              value={password2}
              onChange={onChange}
              placeholder="再次输入密码"
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-block"
            disabled={loading || !verificationCode}
          >
            {loading ? '注册中...' : '注册'}
          </button>

          {!verificationCode && (
            <div className="registration-hint">
              💡 请先获取并输入邮箱验证码
            </div>
          )}
        </form>
        
        <div className="auth-footer">
          <p>
            已有账号？ <Link to="/login">立即登录</Link>
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
        
        .required {
          color: var(--accent-color);
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

        .email-verification-group {
          display: flex;
          gap: 0.5rem;
        }

        .email-verification-group input {
          flex: 1;
        }

        .verify-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 0.75rem 1rem;
          border-radius: var(--border-radius);
          cursor: pointer;
          font-size: 0.9rem;
          white-space: nowrap;
          min-width: 100px;
        }

        .verify-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .verify-btn.verified {
          background: #10b981;
        }

        .verification-group {
          display: flex;
          gap: 0.5rem;
        }

        .verification-group input {
          flex: 1;
        }

        .verify-code-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 0.75rem 1rem;
          border-radius: var(--border-radius);
          cursor: pointer;
          font-size: 0.9rem;
          min-width: 80px;
        }

        .verify-code-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .verification-success {
          color: #10b981;
          font-size: 0.9rem;
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .verification-hint {
          color: #6b7280;
          font-size: 0.85rem;
          margin-top: 0.5rem;
        }

        .registration-hint {
          text-align: center;
          color: #6b7280;
          font-size: 0.9rem;
          margin-top: 1rem;
          padding: 0.75rem;
          background: #f3f4f6;
          border-radius: var(--border-radius);
        }

        .success {
          background-color: #d1fae5;
          color: #065f46;
          padding: 0.75rem;
          border-radius: var(--border-radius);
          margin-bottom: 1rem;
          border: 1px solid #a7f3d0;
        }

        @media (max-width: 768px) {
          .auth-card {
            padding: 1.5rem;
            margin: 0 1rem;
          }

          .email-verification-group,
          .verification-group {
            flex-direction: column;
          }

          .verify-btn,
          .verify-code-btn {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default Register; 
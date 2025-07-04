import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import Breadcrumb from '../components/Breadcrumb';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { currentTheme, effectiveTheme } = useTheme();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);

  const addError = (message) => {
    const id = Date.now();
    setErrors(prev => [...prev, { id, message, type: 'error' }]);
  };

  const removeError = (id) => {
    setErrors(prev => prev.filter(err => err.id !== id));
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        addError('请选择图片文件');
        return;
      }
      
      // 检查文件大小 (2MB)
      if (file.size > 2 * 1024 * 1024) {
        addError('图片大小不能超过2MB');
        return;
      }

      setAvatar(file);
      
      // 创建预览
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    setSuccessMessage('');

    try {
      // 验证表单
      if (!formData.username.trim()) {
        addError('用户名不能为空');
        return;
      }

      if (!formData.email.trim()) {
        addError('邮箱不能为空');
        return;
      }

      // 如果要修改密码，验证密码
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          addError('请输入当前密码');
          return;
        }
        
        if (formData.newPassword.length < 6) {
          addError('新密码至少6位');
          return;
        }
        
        if (formData.newPassword !== formData.confirmPassword) {
          addError('两次输入的新密码不一致');
          return;
        }
      }

      // 准备更新数据
      const updateData = {
        username: formData.username,
        email: formData.email
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      // 如果有头像，先上传头像
      if (avatar) {
        // 这里应该调用头像上传API
        // const avatarUrl = await uploadAvatar(avatar);
        // updateData.avatar = avatarUrl;
      }

      // 更新用户信息
      await updateProfile(updateData);
      
      setSuccessMessage('个人信息更新成功！');
      
      // 清空密码字段
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

    } catch (error) {
      addError(error.message || '更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <Breadcrumb />
        <div className="profile-header">
          <h1>个人资料</h1>
          <p>管理您的账户信息和偏好设置</p>
        </div>

        {/* 错误消息 */}
        <div className="error-messages">
          {errors.map(error => (
            <ErrorMessage
              key={error.id}
              message={error.message}
              type={error.type}
              onClose={() => removeError(error.id)}
            />
          ))}
        </div>

        {/* 成功消息 */}
        {successMessage && (
          <ErrorMessage
            message={successMessage}
            type="success"
            onClose={() => setSuccessMessage('')}
          />
        )}

        <div className="profile-content">
          {/* 头像设置 */}
          <div className="profile-section">
            <h2>头像设置</h2>
            <div className="avatar-section">
              <div className="avatar-preview">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="头像预览" />
                ) : (
                  <div className="avatar-placeholder">
                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="avatar-controls">
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="avatar-upload" className="btn btn-secondary">
                  选择头像
                </label>
                <p className="help-text">支持 JPG、PNG 格式，最大 2MB</p>
              </div>
            </div>
          </div>

          {/* 基本信息 */}
          <div className="profile-section">
            <h2>基本信息</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">用户名</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">邮箱</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="currentPassword">当前密码</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="如需修改密码请填写"
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">新密码</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="如需修改密码请填写"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">确认新密码</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="再次输入新密码"
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <LoadingSpinner size="small" text="保存中..." /> : '保存更改'}
              </button>
            </form>
          </div>

          {/* 主题设置 */}
          <div className="profile-section">
            <h2>主题设置</h2>
            <div className="theme-section">
              <p>选择您喜欢的主题模式</p>
              <div className="theme-options">
                <ThemeToggle variant="dropdown" showLabel={true} />
              </div>
              <p className="help-text">
                当前主题: {effectiveTheme === 'dark' ? '深色模式' : '浅色模式'}
                {currentTheme === 'auto' && ' (跟随系统)'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-page {
          min-height: 100vh;
          background: var(--bg-color);
          padding: 2rem 0;
        }

        .profile-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .profile-header h1 {
          color: var(--text-color);
          margin-bottom: 0.5rem;
        }

        .profile-header p {
          color: var(--text-light);
        }

        .profile-content {
          max-width: 600px;
          margin: 0 auto;
        }

        .profile-section {
          background: var(--card-color);
          border-radius: var(--border-radius);
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: var(--shadow);
        }

        .profile-section h2 {
          color: var(--text-color);
          margin-bottom: 1.5rem;
          font-size: 1.25rem;
        }

        .avatar-section {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .avatar-preview {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid var(--border-color);
        }

        .avatar-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: var(--primary-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: bold;
        }

        .avatar-controls {
          flex: 1;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-color);
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          background: var(--bg-color);
          color: var(--text-color);
          font-size: 1rem;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .theme-section {
          text-align: center;
        }

        .theme-options {
          margin: 1rem 0;
          display: flex;
          justify-content: center;
        }

        .help-text {
          font-size: 0.875rem;
          color: var(--text-light);
          margin-top: 0.5rem;
        }

        .error-messages {
          max-width: 600px;
          margin: 0 auto 2rem;
        }

        @media (max-width: 768px) {
          .avatar-section {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .profile-section {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;

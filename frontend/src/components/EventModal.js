import React, { useState, useEffect } from 'react';
import api from '../services/api';

const EventModal = ({ 
  isOpen, 
  onClose, 
  event = null, 
  selectedDate = null,
  onEventSaved 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_datetime: '',
    end_datetime: '',
    is_all_day: false,
    category: '个人',
    color: '#3498db',
    location: '',
    priority: 'normal',
    reminder_enabled: false,
    reminder_minutes: 15,
    is_recurring: false,
    recurrence_rule: null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState(['工作', '个人', '学习', '娱乐', '健康', '其他']);

  // 初始化表单数据
  useEffect(() => {
    if (event) {
      // 编辑模式
      setFormData({
        title: event.title || '',
        description: event.description || '',
        start_datetime: event.start_datetime ? new Date(event.start_datetime).toISOString().slice(0, 16) : '',
        end_datetime: event.end_datetime ? new Date(event.end_datetime).toISOString().slice(0, 16) : '',
        is_all_day: event.is_all_day || false,
        category: event.category || '个人',
        color: event.color || '#3498db',
        location: event.location || '',
        priority: event.priority || 'normal',
        reminder_enabled: event.reminder_enabled || false,
        reminder_minutes: event.reminder_minutes || 15,
        is_recurring: event.is_recurring || false,
        recurrence_rule: event.recurrence_rule || null
      });
    } else if (selectedDate) {
      // 新建模式，使用选中的日期
      const startDate = new Date(selectedDate);
      startDate.setHours(9, 0, 0, 0); // 默认上午9点
      const endDate = new Date(startDate);
      endDate.setHours(10, 0, 0, 0); // 默认1小时
      
      setFormData({
        ...formData,
        start_datetime: startDate.toISOString().slice(0, 16),
        end_datetime: endDate.toISOString().slice(0, 16)
      });
    }
  }, [event, selectedDate, isOpen]);

  // 获取分类列表
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/calendar/categories');
      setCategories(response.data.categories || categories);
    } catch (err) {
      console.error('获取分类失败:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('请输入事件标题');
      return;
    }
    
    if (!formData.start_datetime || !formData.end_datetime) {
      setError('请选择开始和结束时间');
      return;
    }
    
    if (new Date(formData.start_datetime) >= new Date(formData.end_datetime)) {
      setError('结束时间必须晚于开始时间');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const eventData = {
        ...formData,
        tags: [] // 可以后续添加标签功能
      };

      let response;
      if (event) {
        // 更新事件
        response = await api.put(`/calendar/events/${event.id}`, eventData);
      } else {
        // 创建事件
        response = await api.post('/calendar/events', eventData);
      }

      if (onEventSaved) {
        onEventSaved(response.data.event);
      }
      
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || '保存事件失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event || !window.confirm('确定要删除这个事件吗？')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/calendar/events/${event.id}`);
      
      if (onEventSaved) {
        onEventSaved(null, 'deleted');
      }
      
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || '删除事件失败');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content event-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon">
              {event ? '✏️' : '📅'}
            </div>
            <div className="header-text">
              <h2>{event ? '编辑事件' : '新建事件'}</h2>
              <p>{event ? '修改您的日程安排' : '创建新的日程安排'}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <span>×</span>
          </button>
        </div>

        {error && (
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">📝</span>
              基本信息
            </h3>

            <div className="form-group">
              <label htmlFor="title">事件标题 <span className="required">*</span></label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="输入事件标题"
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">事件描述</label>
              <div className="input-wrapper">
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="详细描述您的事件内容..."
                  rows="3"
                  className="form-textarea"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">⏰</span>
              时间设置
            </h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="start_datetime">开始时间 <span className="required">*</span></label>
                <div className="input-wrapper">
                  <input
                    type="datetime-local"
                    id="start_datetime"
                    name="start_datetime"
                    value={formData.start_datetime}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="end_datetime">结束时间 <span className="required">*</span></label>
                <div className="input-wrapper">
                  <input
                    type="datetime-local"
                    id="end_datetime"
                    name="end_datetime"
                    value={formData.end_datetime}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_all_day"
                  checked={formData.is_all_day}
                  onChange={handleInputChange}
                  className="form-checkbox"
                />
                <span className="checkbox-text">
                  <span className="checkbox-icon">📅</span>
                  全天事件
                </span>
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">🎨</span>
              分类与样式
            </h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">事件分类</label>
                <div className="input-wrapper">
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="color">事件颜色</label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="form-color"
                  />
                  <div className="color-preview" style={{ backgroundColor: formData.color }}>
                    <span className="color-value">{formData.color}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">📍</span>
              详细信息
            </h3>

            <div className="form-group">
              <label htmlFor="location">事件位置</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="会议室、地址或在线链接..."
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="priority">优先级</label>
                <div className="input-wrapper">
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="low">🟢 低优先级</option>
                    <option value="normal">🟡 普通优先级</option>
                    <option value="high">🔴 高优先级</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="reminder_enabled"
                    checked={formData.reminder_enabled}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <span className="checkbox-text">
                    <span className="checkbox-icon">🔔</span>
                    启用提醒
                  </span>
                </label>
              </div>
            </div>
          </div>

          {formData.reminder_enabled && (
            <div className="form-group reminder-settings">
              <label htmlFor="reminder_minutes">提前提醒时间</label>
              <div className="input-wrapper">
                <select
                  id="reminder_minutes"
                  name="reminder_minutes"
                  value={formData.reminder_minutes}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="5">⏰ 5分钟前</option>
                  <option value="15">⏰ 15分钟前</option>
                  <option value="30">⏰ 30分钟前</option>
                  <option value="60">⏰ 1小时前</option>
                  <option value="1440">⏰ 1天前</option>
                </select>
              </div>
            </div>
          )}

          <div className="modal-actions">
            <div className="left-actions">
              {event && (
                <button
                  type="button"
                  className="delete-btn"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  <span className="btn-icon">🗑️</span>
                  删除事件
                </button>
              )}
            </div>

            <div className="right-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={onClose}
                disabled={loading}
              >
                <span className="btn-icon">❌</span>
                取消
              </button>
              <button
                type="submit"
                className="save-btn"
                disabled={loading}
              >
                <span className="btn-icon">{loading ? '⏳' : (event ? '✏️' : '✅')}</span>
                {loading ? '保存中...' : (event ? '更新事件' : '创建事件')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;

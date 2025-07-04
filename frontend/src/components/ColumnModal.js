import React, { useState, useEffect } from 'react';
import '../styles/modal.css';

const ColumnModal = ({ 
  isOpen, 
  onClose, 
  column, 
  boardId, 
  onSave, 
  onDelete 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    color: '#6c757d',
    card_limit: '',
    is_collapsed: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 预设颜色选项
  const colorOptions = [
    { value: '#6c757d', name: '灰色' },
    { value: '#007bff', name: '蓝色' },
    { value: '#28a745', name: '绿色' },
    { value: '#dc3545', name: '红色' },
    { value: '#ffc107', name: '黄色' },
    { value: '#17a2b8', name: '青色' },
    { value: '#6f42c1', name: '紫色' },
    { value: '#fd7e14', name: '橙色' },
    { value: '#e83e8c', name: '粉色' },
    { value: '#20c997', name: '青绿色' }
  ];

  // 初始化表单数据
  useEffect(() => {
    if (column) {
      setFormData({
        title: column.title || '',
        color: column.color || '#6c757d',
        card_limit: column.card_limit || '',
        is_collapsed: column.is_collapsed || false
      });
    } else {
      setFormData({
        title: '',
        color: '#6c757d',
        card_limit: '',
        is_collapsed: false
      });
    }
    setError('');
  }, [column]);

  // 处理输入变化
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 保存列
  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError('请输入列标题');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const saveData = {
        ...formData,
        card_limit: formData.card_limit ? parseInt(formData.card_limit) : null
      };

      await onSave(saveData);
      onClose();
    } catch (err) {
      setError(err.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除列
  const handleDelete = async () => {
    if (!column || !window.confirm('确定要删除这个列吗？列中的所有卡片也会被删除。')) {
      return;
    }

    setLoading(true);
    try {
      await onDelete(column.id);
      onClose();
    } catch (err) {
      setError(err.message || '删除失败');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content column-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{column ? '编辑列' : '创建列'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">列标题 *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="输入列标题"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="color">列颜色</label>
            <div className="color-options">
              {colorOptions.map(option => (
                <label key={option.value} className="color-option">
                  <input
                    type="radio"
                    name="color"
                    value={option.value}
                    checked={formData.color === option.value}
                    onChange={handleInputChange}
                  />
                  <span 
                    className="color-swatch"
                    style={{ backgroundColor: option.value }}
                    title={option.name}
                  ></span>
                </label>
              ))}
            </div>
            <input
              type="color"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              className="custom-color-picker"
              title="自定义颜色"
            />
          </div>

          <div className="form-group">
            <label htmlFor="card_limit">卡片数量限制</label>
            <input
              type="number"
              id="card_limit"
              name="card_limit"
              value={formData.card_limit}
              onChange={handleInputChange}
              placeholder="不限制请留空"
              min="1"
              max="100"
            />
            <small className="form-help">
              设置此列最多可容纳的卡片数量（WIP限制）
            </small>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_collapsed"
                checked={formData.is_collapsed}
                onChange={handleInputChange}
              />
              <span className="checkbox-text">默认折叠此列</span>
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <div className="modal-actions-left">
            {column && (
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-danger"
                disabled={loading}
              >
                删除列
              </button>
            )}
          </div>
          <div className="modal-actions-right">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnModal;

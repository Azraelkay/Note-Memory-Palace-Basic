import React, { useState, useEffect } from 'react';
import '../styles/modal.css';

const CardModal = ({ 
  isOpen, 
  onClose, 
  card, 
  boardId, 
  columnId, 
  onSave, 
  onDelete,
  columns = [] 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'normal',
    status: 'active',
    tags: [],
    due_date: '',
    start_date: '',
    estimated_hours: '',
    actual_hours: '',
    column_id: columnId || '',
    assignee_id: '',
    note_id: '',
    color: '#ffffff'
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 初始化表单数据
  useEffect(() => {
    if (card) {
      setFormData({
        title: card.title || '',
        description: card.description || '',
        priority: card.priority || 'normal',
        status: card.status || 'active',
        tags: card.tags || [],
        due_date: card.due_date ? card.due_date.split('T')[0] : '',
        start_date: card.start_date ? card.start_date.split('T')[0] : '',
        estimated_hours: card.estimated_hours || '',
        actual_hours: card.actual_hours || '',
        column_id: card.column_id || columnId || '',
        assignee_id: card.assignee_id || '',
        note_id: card.note_id || '',
        color: card.color || '#ffffff'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'normal',
        status: 'active',
        tags: [],
        due_date: '',
        start_date: '',
        estimated_hours: '',
        actual_hours: '',
        column_id: columnId || '',
        assignee_id: '',
        note_id: '',
        color: '#ffffff'
      });
    }
    setTagInput('');
    setError('');
  }, [card, columnId]);

  // 处理输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 添加标签
  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  // 删除标签
  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // 处理标签输入键盘事件
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // 保存卡片
  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError('请输入卡片标题');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const saveData = {
        ...formData,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        actual_hours: formData.actual_hours ? parseFloat(formData.actual_hours) : null,
        assignee_id: formData.assignee_id || null,
        note_id: formData.note_id || null
      };

      await onSave(saveData);
      onClose();
    } catch (err) {
      setError(err.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除卡片
  const handleDelete = async () => {
    if (!card || !window.confirm('确定要删除这张卡片吗？')) {
      return;
    }

    setLoading(true);
    try {
      await onDelete(card.id);
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
      <div className="modal-content card-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{card ? '编辑卡片' : '创建卡片'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">标题 *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="输入卡片标题"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">描述</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="输入卡片描述"
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">优先级</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
              >
                <option value="low">低</option>
                <option value="normal">普通</option>
                <option value="high">高</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">状态</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">活跃</option>
                <option value="completed">已完成</option>
                <option value="archived">已归档</option>
              </select>
            </div>

            {columns.length > 0 && (
              <div className="form-group">
                <label htmlFor="column_id">所属列</label>
                <select
                  id="column_id"
                  name="column_id"
                  value={formData.column_id}
                  onChange={handleInputChange}
                >
                  {columns.map(column => (
                    <option key={column.id} value={column.id}>
                      {column.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="tags">标签</label>
            <div className="tag-input-container">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="输入标签后按回车添加"
              />
              <button type="button" onClick={addTag} className="add-tag-btn">
                添加
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="tags-display">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="tag-item">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="remove-tag-btn"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start_date">开始日期</label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="due_date">截止日期</label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="estimated_hours">预估工时（小时）</label>
              <input
                type="number"
                id="estimated_hours"
                name="estimated_hours"
                value={formData.estimated_hours}
                onChange={handleInputChange}
                min="0"
                step="0.5"
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="actual_hours">实际工时（小时）</label>
              <input
                type="number"
                id="actual_hours"
                name="actual_hours"
                value={formData.actual_hours}
                onChange={handleInputChange}
                min="0"
                step="0.5"
                placeholder="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="color">卡片颜色</label>
            <div className="color-picker-container">
              <input
                type="color"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="color-picker"
              />
              <span className="color-preview" style={{ backgroundColor: formData.color }}></span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="modal-actions-left">
            {card && (
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-danger"
                disabled={loading}
              >
                删除
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

export default CardModal;

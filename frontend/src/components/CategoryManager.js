import React, { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api';

const CategoryManager = ({ onCategoryChange }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: '',
    parent_id: null
  });

  // 预定义的颜色选项
  const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#6366F1', '#14B8A6', '#F43F5E'
  ];

  // 预定义的图标选项
  const iconOptions = [
    'folder', 'work', 'study', 'personal', 'project',
    'idea', 'todo', 'archive', 'important', 'draft'
  ];

  // 加载分类
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories({ tree: true });
      setCategories(data);
    } catch (err) {
      setError('加载分类失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await createCategory(formData);
      }
      
      await loadCategories();
      handleCancel();
      onCategoryChange && onCategoryChange();
    } catch (err) {
      setError(err.error || (editingCategory ? '更新分类失败' : '创建分类失败'));
    }
  };

  // 处理编辑
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color,
      icon: category.icon || '',
      parent_id: category.parent_id
    });
    setShowForm(true);
  };

  // 处理删除
  const handleDelete = async (category) => {
    if (!window.confirm(`确定要删除分类"${category.name}"吗？`)) {
      return;
    }

    try {
      await deleteCategory(category.id);
      await loadCategories();
      onCategoryChange && onCategoryChange();
    } catch (err) {
      setError(err.error || '删除分类失败');
    }
  };

  // 取消编辑
  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
      icon: '',
      parent_id: null
    });
    setError('');
  };

  // 获取所有分类的扁平列表（用于父分类选择）
  const getFlatCategories = (cats = categories, level = 0) => {
    let result = [];
    cats.forEach(cat => {
      result.push({ ...cat, level });
      if (cat.children && cat.children.length > 0) {
        result = result.concat(getFlatCategories(cat.children, level + 1));
      }
    });
    return result;
  };

  // 渲染分类树
  const renderCategoryTree = (cats, level = 0) => {
    return cats.map(category => (
      <div key={category.id} className="category-item" style={{ marginLeft: `${level * 20}px` }}>
        <div className="category-content">
          <div className="category-info">
            <div 
              className="category-color" 
              style={{ backgroundColor: category.color }}
            ></div>
            <span className="category-name">{category.name}</span>
            {category.description && (
              <span className="category-description">- {category.description}</span>
            )}
            <span className="category-count">({category.notes_count})</span>
          </div>
          <div className="category-actions">
            <button
              className="action-btn edit-btn"
              onClick={() => handleEdit(category)}
              title="编辑"
            >
              ✏️
            </button>
            <button
              className="action-btn delete-btn"
              onClick={() => handleDelete(category)}
              title="删除"
            >
              🗑️
            </button>
          </div>
        </div>
        {category.children && category.children.length > 0 && (
          <div className="category-children">
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="category-manager">
      <div className="category-header">
        <h3>分类管理</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          新建分类
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <div className="category-form-overlay">
          <div className="category-form">
            <h4>{editingCategory ? '编辑分类' : '新建分类'}</h4>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>分类名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label>父分类</label>
                <select
                  value={formData.parent_id || ''}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || null })}
                >
                  <option value="">无（根分类）</option>
                  {getFlatCategories()
                    .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                    .map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {'  '.repeat(cat.level)}└ {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label>颜色</label>
                <div className="color-options">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${formData.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCategory ? '更新' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="category-list">
        {categories.length === 0 ? (
          <div className="empty-categories">
            <p>还没有分类，点击"新建分类"开始创建吧！</p>
          </div>
        ) : (
          renderCategoryTree(categories)
        )}
      </div>

      <style jsx>{`
        .category-manager {
          background: var(--card-color);
          border-radius: var(--border-radius);
          padding: 1.5rem;
          box-shadow: var(--shadow);
        }

        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .category-header h3 {
          margin: 0;
          color: var(--text-color);
        }

        .category-item {
          margin-bottom: 0.5rem;
        }

        .category-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: var(--background-color);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-color);
        }

        .category-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .category-color {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 0 1px var(--border-color);
        }

        .category-name {
          font-weight: 500;
          color: var(--text-color);
        }

        .category-description {
          color: var(--text-light);
          font-size: 0.9rem;
        }

        .category-count {
          color: var(--text-light);
          font-size: 0.85rem;
        }

        .category-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: var(--transition);
        }

        .action-btn:hover {
          background: var(--border-color);
        }

        .category-form-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .category-form {
          background: var(--card-color);
          border-radius: var(--border-radius);
          padding: 2rem;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .category-form h4 {
          margin-top: 0;
          margin-bottom: 1.5rem;
          color: var(--text-color);
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--text-color);
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          font-size: 1rem;
        }

        .color-options {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .color-option {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid transparent;
          cursor: pointer;
          transition: var(--transition);
        }

        .color-option.selected {
          border-color: var(--text-color);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .empty-categories {
          text-align: center;
          padding: 2rem;
          color: var(--text-light);
        }

        @media (max-width: 768px) {
          .category-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .category-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .category-actions {
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default CategoryManager;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getTemplates, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate, 
  shareTemplate, 
  importTemplate, 
  applyTemplate,
  getTemplateCategories 
} from '../services/api';
import '../styles/templates.css';

const TemplatesPage = () => {
  const { isAuthenticated } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 筛选和搜索状态
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // 模态框状态
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  
  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    icon: '📄',
    category: 'general',
    is_public: false
  });
  const [shareCode, setShareCode] = useState('');
  const [noteTitle, setNoteTitle] = useState('');

  // 获取模板数据
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedType !== 'all') params.type = selectedType;
      if (searchTerm) params.search = searchTerm;
      
      const response = await getTemplates(params);
      setTemplates(response.templates || []);
    } catch (err) {
      setError('获取模板列表失败');
      console.error('获取模板失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 获取分类数据
  const fetchCategories = async () => {
    try {
      const response = await getTemplateCategories();
      setCategories(response.categories || []);
    } catch (err) {
      console.error('获取分类失败:', err);
    }
  };

  // 初始化数据
  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
      fetchTemplates();
    }
  }, [isAuthenticated, selectedCategory, selectedType, searchTerm]);

  // 创建模板
  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await createTemplate(formData);
      setSuccess('模板创建成功');
      setShowCreateModal(false);
      resetForm();
      fetchTemplates();
    } catch (err) {
      setError(err.message || '创建模板失败');
    }
  };

  // 更新模板
  const handleUpdateTemplate = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await updateTemplate(currentTemplate.id, formData);
      setSuccess('模板更新成功');
      setShowEditModal(false);
      resetForm();
      fetchTemplates();
    } catch (err) {
      setError(err.message || '更新模板失败');
    }
  };

  // 删除模板
  const handleDeleteTemplate = async (template) => {
    if (!window.confirm(`确定要删除模板 "${template.name}" 吗？`)) return;
    
    try {
      setError('');
      await deleteTemplate(template.id);
      setSuccess('模板删除成功');
      fetchTemplates();
    } catch (err) {
      setError(err.message || '删除模板失败');
    }
  };

  // 分享模板
  const handleShareTemplate = async (template) => {
    try {
      setError('');
      const response = await shareTemplate(template.id);
      setSuccess(`分享码：${response.share_code}`);
      fetchTemplates();
    } catch (err) {
      setError(err.message || '分享模板失败');
    }
  };

  // 导入模板
  const handleImportTemplate = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await importTemplate(shareCode);
      setSuccess('模板导入成功');
      setShowImportModal(false);
      setShareCode('');
      fetchTemplates();
    } catch (err) {
      setError(err.message || '导入模板失败');
    }
  };

  // 应用模板
  const handleApplyTemplate = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const response = await applyTemplate(currentTemplate.id, { title: noteTitle });
      setSuccess(`笔记 "${response.note.title}" 创建成功`);
      setShowApplyModal(false);
      setNoteTitle('');
    } catch (err) {
      setError(err.message || '应用模板失败');
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      content: '',
      icon: '📄',
      category: 'general',
      is_public: false
    });
    setCurrentTemplate(null);
  };

  // 打开编辑模态框
  const openEditModal = (template) => {
    setCurrentTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      content: template.content,
      icon: template.icon,
      category: template.category,
      is_public: template.is_public
    });
    setShowEditModal(true);
  };

  // 打开应用模态框
  const openApplyModal = (template) => {
    setCurrentTemplate(template);
    setNoteTitle(`基于 ${template.name} 的笔记`);
    setShowApplyModal(true);
  };

  // 过滤模板
  const filteredTemplates = templates.filter(template => {
    if (selectedCategory !== 'all' && template.category !== selectedCategory) return false;
    if (selectedType === 'system' && template.type !== 'system') return false;
    if (selectedType === 'custom' && template.type !== 'custom') return false;
    if (searchTerm && !template.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="templates-page">
        <div className="auth-required">
          <h2>请先登录</h2>
          <p>您需要登录后才能使用模板功能</p>
        </div>
      </div>
    );
  }

  return (
    <div className="templates-page">
      <div className="templates-header">
        <h1>📋 模板库</h1>
        <p>使用模板快速创建格式化的笔记内容</p>
      </div>

      {/* 工具栏 */}
      <div className="templates-toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <input
              type="text"
              placeholder="搜索模板..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="type-select"
          >
            <option value="all">全部类型</option>
            <option value="system">系统模板</option>
            <option value="custom">我的模板</option>
            <option value="public">共享模板</option>
          </select>
        </div>

        <div className="toolbar-right">
          <button
            onClick={() => setShowImportModal(true)}
            className="import-btn"
          >
            📥 导入模板
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="create-btn"
          >
            ➕ 创建模板
          </button>
        </div>
      </div>

      {/* 错误和成功消息 */}
      {error && <div className="error-message">⚠️ {error}</div>}
      {success && <div className="success-message">✅ {success}</div>}

      {/* 模板列表 */}
      <div className="templates-grid">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : filteredTemplates.length === 0 ? (
          <div className="no-templates">
            <div className="no-templates-icon">📄</div>
            <p>暂无模板</p>
            <p>创建您的第一个模板吧！</p>
          </div>
        ) : (
          filteredTemplates.map(template => (
            <div key={template.id} className="template-card">
              <div className="template-header">
                <span className="template-icon">{template.icon}</span>
                <div className="template-info">
                  <h3 className="template-name">{template.name}</h3>
                  <p className="template-description">{template.description}</p>
                </div>
                <div className="template-badges">
                  <span className={`type-badge ${template.type}`}>
                    {template.type === 'system' ? '系统' : '自定义'}
                  </span>
                  {template.is_public && <span className="public-badge">公开</span>}
                </div>
              </div>
              
              <div className="template-meta">
                <span className="template-category">
                  {categories.find(c => c.id === template.category)?.name || template.category}
                </span>
                <span className="template-usage">使用 {template.usage_count} 次</span>
                <span className="template-author">by {template.author}</span>
              </div>
              
              <div className="template-actions">
                <button
                  onClick={() => openApplyModal(template)}
                  className="apply-btn"
                >
                  🚀 应用
                </button>

                {/* 所有模板都可以分享 */}
                <button
                  onClick={() => handleShareTemplate(template)}
                  className="share-btn"
                >
                  🔗 分享
                </button>

                {/* 只有自定义模板的创建者可以编辑和删除 */}
                {template.type === 'custom' && template.user_id && (
                  <>
                    <button
                      onClick={() => openEditModal(template)}
                      className="edit-btn"
                    >
                      ✏️ 编辑
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template)}
                      className="delete-btn"
                    >
                      🗑️ 删除
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 创建模板模态框 */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>创建模板</h2>
              <button onClick={() => setShowCreateModal(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleCreateTemplate} className="template-form">
              <div className="form-group">
                <label>模板名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>描述</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>图标</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>分类</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {categories.filter(c => c.id !== 'all').map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>模板内容</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows="10"
                  placeholder="输入模板内容..."
                  required
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({...formData, is_public: e.target.checked})}
                  />
                  公开模板（其他用户可以看到）
                </label>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="cancel-btn">
                  取消
                </button>
                <button type="submit" className="submit-btn">
                  创建模板
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 编辑模板模态框 */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>编辑模板</h2>
              <button onClick={() => setShowEditModal(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleUpdateTemplate} className="template-form">
              <div className="form-group">
                <label>模板名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>描述</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>图标</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>分类</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {categories.filter(c => c.id !== 'all').map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>模板内容</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows="10"
                  required
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({...formData, is_public: e.target.checked})}
                  />
                  公开模板（其他用户可以看到）
                </label>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="cancel-btn">
                  取消
                </button>
                <button type="submit" className="submit-btn">
                  更新模板
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 导入模板模态框 */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>导入模板</h2>
              <button onClick={() => setShowImportModal(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleImportTemplate} className="import-form">
              <div className="form-group">
                <label>分享码</label>
                <input
                  type="text"
                  value={shareCode}
                  onChange={(e) => setShareCode(e.target.value.toUpperCase())}
                  placeholder="输入6位分享码"
                  maxLength="6"
                  required
                />
                <small>输入其他用户分享的6位字母数字分享码</small>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowImportModal(false)} className="cancel-btn">
                  取消
                </button>
                <button type="submit" className="submit-btn">
                  导入模板
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 应用模板模态框 */}
      {showApplyModal && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>应用模板</h2>
              <button onClick={() => setShowApplyModal(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleApplyTemplate} className="apply-form">
              <div className="template-preview">
                <h3>{currentTemplate?.name}</h3>
                <p>{currentTemplate?.description}</p>
              </div>
              <div className="form-group">
                <label>笔记标题</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="输入新笔记的标题"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowApplyModal(false)} className="cancel-btn">
                  取消
                </button>
                <button type="submit" className="submit-btn">
                  创建笔记
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;

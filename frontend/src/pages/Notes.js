import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllNotes, createNote, updateNote, deleteNote, searchNotes } from '../services/api';
import SearchBar from '../components/SearchBar';
import CategorySelector from '../components/CategorySelector';
import CategoryManager from '../components/CategoryManager';
import EditorSelector from '../components/EditorSelector';
import SaveStatusIndicator from '../components/SaveStatusIndicator';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Breadcrumb from '../components/Breadcrumb';
import useAutoSave from '../hooks/useAutoSave';
import useKeyboardShortcuts, { commonShortcuts } from '../hooks/useKeyboardShortcuts';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentNote, setCurrentNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [],
    categories: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchParams, setSearchParams] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [previewNote, setPreviewNote] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 简化的保存功能
  const saveNote = async (data) => {
    console.log('保存笔记:', { isEditing, currentNote: currentNote?.id, data });

    if (!data.title.trim()) {
      throw new Error('标题不能为空');
    }

    try {
      if (isEditing && currentNote) {
        // 更新现有笔记
        console.log('更新现有笔记:', currentNote.id);
        const updatedNote = await updateNote(currentNote.id, data);
        console.log('笔记更新成功:', updatedNote);

        // 更新状态
        setCurrentNote(updatedNote);
        setNotes(prevNotes =>
          prevNotes.map(note => note.id === currentNote.id ? updatedNote : note)
        );

        return updatedNote;
      } else {
        // 创建新笔记
        console.log('创建新笔记:', data);
        const newNote = await createNote(data);
        console.log('新笔记创建成功:', newNote);

        // 切换到编辑模式
        setIsEditing(true);
        setCurrentNote(newNote);
        setNotes(prevNotes => [newNote, ...prevNotes]);

        return newNote;
      }
    } catch (error) {
      console.error('保存失败:', error);
      throw error;
    }
  };

  const {
    saveStatus,
    saveStatusText,
    saveNow,
  } = useAutoSave(formData, saveNote, {
    delay: 3000, // 3秒延迟
    enabled: formData.title.trim() !== '', // 只有在有标题时才启用自动保存
    onSaveSuccess: (savedNote) => {
      console.log('自动保存成功:', savedNote);
    },
    onSaveError: (error) => {
      console.error('自动保存失败:', error);
      addErrorMessage('自动保存失败: ' + error.message, 'error');
    }
  });

  // 添加错误消息
  const addErrorMessage = (message, type = 'error') => {
    const id = Date.now();
    setErrorMessages(prev => [...prev, { id, message, type }]);
  };

  // 移除错误消息
  const removeErrorMessage = (id) => {
    setErrorMessages(prev => prev.filter(msg => msg.id !== id));
  };

  // 快捷键配置
  const shortcuts = {
    [commonShortcuts.save]: {
      action: () => {
        if (formData.title.trim()) {
          saveNow();
        }
      },
      allowInInput: true,
    },
    [commonShortcuts.new]: {
      action: () => {
        handleCancel();
      },
      allowInInput: false,
    },
    [commonShortcuts.search]: {
      action: () => {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
          searchInput.focus();
        }
      },
      allowInInput: false,
    },
    [commonShortcuts.close]: {
      action: () => {
        if (showCategoryManager) {
          setShowCategoryManager(false);
        } else if (isEditing) {
          handleCancel();
        }
      },
      allowInInput: false,
    },
  };

  // 启用快捷键
  useKeyboardShortcuts(shortcuts);

  // 获取所有笔记
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchNotes = async () => {
      try {
        console.log('开始获取笔记...');
        console.log('当前token:', localStorage.getItem('token') ? '存在' : '不存在');
        const data = await getAllNotes();
        console.log('API返回的原始数据:', data);
        // 处理新的API响应格式
        const notesData = data.notes || data;
        console.log('处理后的笔记数据:', notesData);
        console.log('笔记数量:', notesData.length);
        setNotes(notesData);
        setLoading(false);
      } catch (err) {
        console.error('获取笔记失败:', err);
        console.error('错误详情:', err.response?.data);
        addErrorMessage('获取笔记失败: ' + err.message, 'error');
        setLoading(false);
      }
    };

    fetchNotes();
  }, [isAuthenticated, navigate]);

  // 表单输入变化
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 手动保存笔记
  const onSubmit = async (e) => {
    e.preventDefault();
    console.log('手动保存被触发:', formData);

    try {
      const savedNote = await saveNote(formData);
      console.log('手动保存完成:', savedNote);

      if (savedNote) {
        addErrorMessage(isEditing ? '笔记更新成功!' : '笔记保存成功!', 'success');
      }
    } catch (err) {
      console.error('手动保存失败:', err);
      addErrorMessage('保存失败: ' + err.message, 'error');
    }
  };

  // 编辑笔记
  const handleEdit = (note) => {
    setIsEditing(true);
    setCurrentNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags || [],
      categories: note.categories || []
    });
  };

  // 删除笔记
  const handleDelete = async (id) => {
    try {
      await deleteNote(id);
      setNotes(notes.filter(note => note.id !== id));
    } catch (err) {
      setError('删除笔记失败');
    }
  };

  // 取消编辑
  const handleCancel = () => {
    setIsEditing(false);
    setCurrentNote(null);
    setFormData({
      title: '',
      content: '',
      tags: [],
      categories: []
    });
  };

  // 处理笔记预览
  const handleNotePreview = (note) => {
    setPreviewNote(note);
  };

  const handleClearPreview = () => {
    // 如果在编辑模式，不清除预览，保持显示当前编辑的内容
    if (!isEditing) {
      setPreviewNote(null);
    }
  };

  // 获取当前预览的内容
  const getCurrentPreviewContent = () => {
    if (isEditing && formData.content) {
      // 编辑模式下显示当前编辑的内容
      return {
        title: formData.title || '未命名笔记',
        content: formData.content,
        updated_at: new Date().toISOString(),
        categories: formData.categories || [],
        tags: formData.tags || [],
        isCurrentEdit: true
      };
    }
    return previewNote;
  };

  // 处理搜索
  const handleSearch = async (params) => {
    console.log('开始搜索，参数:', params);
    setIsSearching(true);
    setSearchParams(params);
    setLoading(true);

    try {
      console.log('调用searchNotes API...');
      const data = await searchNotes(params);
      console.log('搜索API返回数据:', data);
      const notesData = data.notes || data || [];
      console.log('处理后的搜索结果:', notesData.length, '条');
      setNotes(notesData);
    } catch (err) {
      console.error('搜索错误详情:', err);
      console.error('错误响应:', err.response?.data);
      addErrorMessage('搜索失败: ' + err.message, 'error');
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  // 清除搜索
  const handleClearSearch = async () => {
    setSearchParams({});
    setIsSearching(false);
    setLoading(true);

    try {
      const data = await getAllNotes();
      const notesData = data.notes || data;
      setNotes(notesData);
    } catch (err) {
      setError('获取笔记失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="notes-page">
        <div className="container">
          <LoadingSpinner
            size="large"
            text="正在加载笔记..."
            overlay={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="notes-page">
      <div className="container">
        <Breadcrumb />
        <div className="notes-header">
          <h1>我的笔记</h1>
          {isSearching && Object.keys(searchParams).length > 0 && (
            <div className="search-status">
              <span>搜索结果: {notes.length} 条笔记</span>
            </div>
          )}
        </div>

        <SearchBar
          onSearch={handleSearch}
          onClear={handleClearSearch}
          initialSearch={searchParams.q || ''}
        />

        {/* 错误消息显示 */}
        <div className="error-messages">
          {errorMessages.map(msg => (
            <ErrorMessage
              key={msg.id}
              message={msg.message}
              type={msg.type}
              onClose={() => removeErrorMessage(msg.id)}
              autoClose={true}
              duration={5000}
            />
          ))}
        </div>

        <div className={`notes-layout ${isEditing ? 'editing-mode' : ''}`}>
          {/* 左侧：创建笔记表单 */}
          <div className="note-form-container">
            <div className="card note-form">
              <div className="form-header">
                <h2>{isEditing ? '编辑笔记' : '创建笔记'}</h2>
                <div className="form-header-actions">
                  {isEditing && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setIsEditing(false);
                        setCurrentNote(null);
                        setFormData({ title: '', content: '', tags: [], categories: [] });
                      }}
                      title="退出编辑模式"
                    >
                      ← 返回
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowCategoryManager(true)}
                  >
                    管理分类
                  </button>
                </div>
              </div>

              <div className="form-content">
                {/* 自动保存状态指示器 */}
                <SaveStatusIndicator
                  saveStatus={saveStatus}
                  saveStatusText={saveStatusText}
                  onSaveNow={saveNow}
                  showSaveButton={true}
                />

                <form id="note-form" onSubmit={onSubmit}>
                  <div className="form-control">
                    <label htmlFor="title">标题</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={onChange}
                      placeholder="笔记标题"
                    />
                  </div>

                  <div className="form-control">
                    <label htmlFor="content">内容</label>
                    <EditorSelector
                      value={formData.content}
                      onChange={(content) => setFormData({ ...formData, content })}
                      placeholder="在这里写下您的想法..."
                      height="200px"
                    />
                  </div>

                  <div className="form-control">
                    <label>分类</label>
                    <CategorySelector
                      selectedCategories={formData.categories.map(cat =>
                        typeof cat === 'string' ? cat : cat.id || cat
                      )}
                      onCategoryChange={(categoryIds) => {
                        setFormData({ ...formData, categories: categoryIds });
                      }}
                      multiple={true}
                    />
                  </div>

                  <div className="form-control">
                    <label htmlFor="tags">标签</label>
                    <input
                      type="text"
                      id="tags"
                      value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags}
                      onChange={(e) => {
                        const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                        setFormData({ ...formData, tags });
                      }}
                      placeholder="输入标签，用逗号分隔"
                    />
                  </div>
                </form>
              </div>

              <div className="form-buttons">
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-secondary"
                  >
                    取消
                  </button>
                )}
                <button type="submit" form="note-form" className="btn" title="保存 (Ctrl+S)">
                  {isEditing ? '更新' : '保存'}
                </button>
              </div>
            </div>
          </div>

          {/* 右侧：最近保存的笔记 */}
          <div className="recent-notes-sidebar">
            <div className="card">
              <div className="sidebar-header">
                <h3>最近保存</h3>
                <button
                  className="refresh-btn"
                  onClick={async () => {
                    console.log('刷新按钮被点击');
                    try {
                      const data = await getAllNotes();
                      const notesData = data.notes || data;
                      setNotes(notesData);
                      addErrorMessage('笔记列表已刷新', 'success');
                      console.log('笔记列表刷新成功:', notesData.length);
                    } catch (err) {
                      console.error('刷新失败:', err);
                      addErrorMessage('刷新失败: ' + err.message, 'error');
                    }
                  }}
                  title="刷新笔记列表"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              <div className="recent-notes-list">
                {console.log('渲染右侧笔记列表，notes.length:', notes.length, 'notes:', notes)}
                {notes.length === 0 ? (
                  <div className="empty-recent">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>还没有保存的笔记</p>
                  </div>
                ) : (
                  <div className="recent-notes-scroll">
                    {notes
                      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                      .map(note => (
                      <div
                        className="recent-note-item"
                        key={note.id}
                        onClick={() => handleEdit(note)}
                        onMouseEnter={() => handleNotePreview(note)}
                        onMouseLeave={handleClearPreview}
                      >
                        <div className="recent-note-title">{note.title}</div>
                        <div className="recent-note-date">
                          {new Date(note.updated_at).toLocaleDateString()}
                        </div>
                        <div className="recent-note-actions">
                          <button
                            className="action-btn edit-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(note);
                            }}
                            title="编辑"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(note.id);
                            }}
                            title="删除"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 第三栏：笔记预览面板 */}
          <div className="note-preview-panel">
            <div className="card">
              <div className="preview-header">
                <h3>{isEditing ? '实时预览' : '笔记预览'}</h3>
                {isEditing && (
                  <span className="preview-indicator">
                    <span className="live-indicator"></span>
                    正在编辑
                  </span>
                )}
              </div>
              <div className="preview-content">
                {(() => {
                  const currentPreview = getCurrentPreviewContent();
                  return currentPreview ? (
                    <div className="preview-note">
                      <div className="preview-note-title">
                        {currentPreview.title}
                      </div>
                      <div className="preview-note-meta">
                        <span className="preview-date">
                          {currentPreview.isCurrentEdit ?
                            '正在编辑...' :
                            new Date(currentPreview.updated_at).toLocaleDateString()
                          }
                        </span>
                        {currentPreview.categories && currentPreview.categories.length > 0 && (
                          <div className="preview-categories">
                            {currentPreview.categories.map((category, index) => (
                              <span key={index} className="preview-category-tag">
                                {typeof category === 'string' ? category : category.name || category}
                              </span>
                            ))}
                          </div>
                        )}
                        {currentPreview.tags && currentPreview.tags.length > 0 && (
                          <div className="preview-tags">
                            {currentPreview.tags.map((tag, index) => (
                              <span key={index} className="preview-tag">
                                #{typeof tag === 'string' ? tag : tag.name || tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="preview-note-content">
                        <div dangerouslySetInnerHTML={{ __html: currentPreview.content || '<p><em>开始输入内容...</em></p>' }} />
                      </div>
                    </div>
                  ) : (
                    <div className="preview-empty">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <p>将鼠标悬停在笔记上查看预览</p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {showCategoryManager && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>分类管理</h3>
                <button
                  className="modal-close"
                  onClick={() => setShowCategoryManager(false)}
                >
                  ×
                </button>
              </div>
              <CategoryManager
                onCategoryChange={() => {
                  // 分类变化后可以刷新相关数据
                }}
              />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .notes-page {
          padding: 2rem 0;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(139, 92, 246, 0.02) 100%);
          min-height: calc(100vh - 80px);
        }

        .notes-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 0 1rem;
        }

        .search-status {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
          color: white;
          padding: 12px 20px;
          border-radius: 16px;
          font-size: 0.9rem;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          animation: slideInRight 0.5s ease-out;
        }

        .notes-header h1 {
          font-size: 2.5rem;
          font-weight: 900;
          background: linear-gradient(135deg, var(--text-color) 0%, var(--primary-color) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          animation: fadeInLeft 0.6s ease-out;
        }

        .notes-layout {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 2rem;
          padding: 0 1rem;
          transition: all 0.3s ease;
        }

        /* 编辑模式：只显示编辑器 */
        .notes-layout.editing-mode {
          grid-template-columns: 1fr;
          max-width: 1200px;
          margin: 0 auto;
        }

        .notes-layout.editing-mode .notes-list,
        .notes-layout.editing-mode .recent-notes-sidebar {
          display: none;
        }

        .notes-layout.editing-mode .note-form-container {
          grid-column: 1;
        }

        .note-form-container {
          position: sticky;
          top: 100px;
          height: fit-content;
        }

        .note-form {
          padding: 2rem;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          height: calc(100vh - 180px);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .note-form:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 50px rgba(59, 130, 246, 0.1);
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid rgba(59, 130, 246, 0.1);
        }

        .form-header h2 {
          margin: 0;
          color: var(--text-color);
          font-size: 1.6rem;
          font-weight: 700;
        }

        .form-header-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .btn-sm {
          padding: 8px 16px;
          font-size: 0.875rem;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .btn-sm:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .form-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding-right: 4px;
          margin-bottom: 1rem;
        }

        .form-content::-webkit-scrollbar {
          width: 6px;
        }

        .form-content::-webkit-scrollbar-track {
          background: rgba(59, 130, 246, 0.05);
          border-radius: 3px;
        }

        .form-content::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%);
          border-radius: 3px;
          transition: background 0.2s ease;
        }

        .form-content::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.5) 0%, rgba(139, 92, 246, 0.5) 100%);
        }

        .form-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(59, 130, 246, 0.1);
          flex-shrink: 0;
        }
        
        .notes-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .note-item {
          display: flex;
          justify-content: space-between;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
          border-radius: 20px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .note-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 100%);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .note-item:hover::before {
          transform: scaleX(1);
        }

        .note-item:hover {
          transform: translateY(-5px) scale(1.01);
          box-shadow: 0 15px 50px rgba(59, 130, 246, 0.12);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .note-content {
          flex: 1;
        }

        .note-content h3 {
          margin-bottom: 1rem;
          color: var(--text-color);
          font-size: 1.4rem;
          font-weight: 700;
          transition: color 0.3s ease;
        }

        .note-item:hover .note-content h3 {
          color: var(--primary-color);
        }

        .note-preview {
          color: var(--text-light);
          margin-bottom: 1.2rem;
          line-height: 1.7;
          overflow: hidden;
          font-size: 1rem;
        }

        .note-preview :global(p) {
          margin: 0 0 8px 0;
        }

        .note-preview :global(h1, h2, h3, h4, h5, h6) {
          margin: 8px 0 4px 0;
          color: var(--text-color);
          font-size: 1em;
          font-weight: 600;
        }

        .note-preview :global(ul, ol) {
          margin: 4px 0;
          padding-left: 1.2em;
        }

        .note-preview :global(li) {
          margin-bottom: 2px;
        }

        .note-preview :global(blockquote) {
          border-left: 3px solid var(--primary-color);
          margin: 8px 0;
          padding-left: 12px;
          color: var(--text-light);
          font-style: italic;
        }

        .note-preview :global(code) {
          background: var(--border-color);
          padding: 2px 4px;
          border-radius: 3px;
          font-family: 'SFMono-Regular', Consolas, monospace;
          font-size: 0.9em;
        }

        .note-preview :global(pre) {
          background: var(--border-color);
          padding: 8px;
          border-radius: 6px;
          overflow-x: auto;
          margin: 8px 0;
        }

        .note-preview :global(img) {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 4px 0;
        }
        
        .note-meta {
          display: flex;
          align-items: center;
          font-size: 0.875rem;
          color: var(--text-light);
        }
        
        .note-date {
          display: flex;
          align-items: center;
        }
        
        .note-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-left: 1.5rem;
        }

        .action-btn {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(59, 130, 246, 0.2);
          cursor: pointer;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }

        .action-btn:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .action-btn svg {
          width: 20px;
          height: 20px;
          transition: transform 0.2s ease;
        }

        .action-btn:hover svg {
          transform: scale(1.1);
        }

        .edit-btn {
          color: var(--primary-color);
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .edit-btn:hover {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
          color: white;
          border-color: var(--primary-color);
        }

        .delete-btn {
          color: var(--accent-color);
          background: linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(239, 68, 68, 0.1) 100%);
          border-color: rgba(244, 63, 94, 0.3);
        }

        .delete-btn:hover {
          background: linear-gradient(135deg, var(--accent-color) 0%, #ef4444 100%);
          color: white;
          border-color: var(--accent-color);
        }
        
        .empty-notes {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          background-color: var(--card-color);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          text-align: center;
        }
        
        .empty-notes svg {
          width: 80px;
          height: 80px;
          color: var(--text-light);
          opacity: 0.5;
          margin-bottom: 1.5rem;
        }
        
        .empty-notes p {
          color: var(--text-light);
          font-size: 1.1rem;
        }

        .modal-overlay {
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

        .modal-content {
          background: var(--card-color);
          border-radius: var(--border-radius);
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .modal-header h3 {
          margin: 0;
          color: var(--text-color);
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--text-light);
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: var(--transition);
        }

        .modal-close:hover {
          background: var(--border-color);
          color: var(--text-color);
        }

        /* 右侧边栏现代化样式 */
        .recent-notes-sidebar {
          position: sticky;
          top: 100px;
          height: fit-content;
        }

        .recent-notes-sidebar .card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          padding: 2rem;
          transition: all 0.3s ease;
          height: calc(100vh - 180px);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .recent-notes-sidebar .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 50px rgba(59, 130, 246, 0.1);
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid rgba(59, 130, 246, 0.1);
        }

        .sidebar-header h3 {
          margin: 0;
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-color);
        }

        .refresh-btn {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 12px;
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--primary-color);
        }

        .refresh-btn:hover {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
          color: white;
          transform: rotate(180deg) scale(1.1);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .refresh-btn svg {
          width: 16px;
          height: 16px;
          transition: transform 0.2s ease;
        }

        .recent-notes-list {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding-right: 4px;
        }

        .recent-notes-list::-webkit-scrollbar {
          width: 6px;
        }

        .recent-notes-list::-webkit-scrollbar-track {
          background: rgba(59, 130, 246, 0.05);
          border-radius: 3px;
        }

        .recent-notes-list::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%);
          border-radius: 3px;
          transition: background 0.2s ease;
        }

        .recent-notes-list::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.5) 0%, rgba(139, 92, 246, 0.5) 100%);
        }

        .recent-notes-scroll {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .recent-note-item {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 12px;
          border: 1px solid rgba(59, 130, 246, 0.1);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .recent-note-item:hover {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
          border-color: rgba(59, 130, 246, 0.3);
          transform: translateX(4px);
        }

        .recent-note-title {
          font-weight: 600;
          color: var(--text-color);
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .recent-note-date {
          font-size: 0.8rem;
          color: var(--text-light);
        }

        .empty-recent {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem;
          text-align: center;
          color: var(--text-light);
        }

        .empty-recent svg {
          width: 48px;
          height: 48px;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        /* 笔记预览面板样式 */
        .note-preview-panel {
          position: sticky;
          top: 100px;
          height: fit-content;
        }

        .note-preview-panel .card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          padding: 2rem;
          transition: all 0.3s ease;
          height: calc(100vh - 180px);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .note-preview-panel .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 50px rgba(59, 130, 246, 0.1);
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid rgba(59, 130, 246, 0.1);
        }

        .preview-header h3 {
          margin: 0;
          color: var(--text-color);
          font-size: 1.4rem;
          font-weight: 700;
        }

        .preview-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          min-height: 0;
          padding-right: 4px;
        }

        .preview-content::-webkit-scrollbar {
          width: 6px;
        }

        .preview-content::-webkit-scrollbar-track {
          background: rgba(59, 130, 246, 0.05);
          border-radius: 3px;
        }

        .preview-content::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%);
          border-radius: 3px;
          transition: background 0.2s ease;
        }

        .preview-content::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.5) 0%, rgba(139, 92, 246, 0.5) 100%);
        }

        .preview-note {
          animation: fadeInUp 0.3s ease-out;
        }

        .preview-note-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-color);
          margin-bottom: 1rem;
          line-height: 1.4;
        }

        .preview-note-meta {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(59, 130, 246, 0.1);
        }

        .preview-date {
          font-size: 0.875rem;
          color: var(--text-light);
        }

        .preview-categories {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .preview-category-tag {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .preview-note-content {
          color: var(--text-color);
          line-height: 1.7;
          font-size: 1rem;
        }

        .preview-note-content h1,
        .preview-note-content h2,
        .preview-note-content h3,
        .preview-note-content h4,
        .preview-note-content h5,
        .preview-note-content h6 {
          color: var(--text-color);
          margin: 1.5rem 0 1rem 0;
          font-weight: 600;
        }

        .preview-note-content p {
          margin: 0 0 1rem 0;
        }

        .preview-note-content ul,
        .preview-note-content ol {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }

        .preview-note-content li {
          margin-bottom: 0.5rem;
        }

        .preview-note-content blockquote {
          border-left: 4px solid var(--primary-color);
          margin: 1.5rem 0;
          padding-left: 1rem;
          color: var(--text-light);
          font-style: italic;
        }

        .preview-note-content code {
          background: var(--border-color);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-family: 'SFMono-Regular', Consolas, monospace;
          font-size: 0.9em;
        }

        .preview-note-content pre {
          background: var(--border-color);
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1rem 0;
        }

        .preview-note-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1rem 0;
        }

        .preview-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
          color: var(--text-light);
          height: 100%;
          flex: 1;
        }

        .preview-empty svg {
          width: 64px;
          height: 64px;
          margin-bottom: 1.5rem;
          opacity: 0.5;
        }

        .preview-empty p {
          font-size: 1rem;
          margin: 0;
        }

        /* 动画效果 */
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* 响应式设计 */
        @media (max-width: 1400px) {
          .notes-layout {
            grid-template-columns: 1fr 1fr;
          }

          .note-preview-panel {
            grid-column: 1 / -1;
            margin-top: 2rem;
          }
        }

        @media (max-width: 1200px) {
          .notes-layout {
            grid-template-columns: 1fr 1fr;
          }

          .recent-notes-sidebar,
          .note-preview-panel {
            grid-column: 1 / -1;
            margin-top: 2rem;
          }
        }

        @media (max-width: 992px) {
          .notes-layout {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .note-form-container,
          .recent-notes-sidebar,
          .note-preview-panel {
            position: relative;
            top: 0;
          }

          .notes-header h1 {
            font-size: 2rem;
          }
        }
        
        @media (max-width: 768px) {
          .notes-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .search-status {
            width: 100%;
            text-align: center;
          }

          .form-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .modal-content {
            width: 95%;
            max-height: 95vh;
          }

          .modal-header {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Notes; 
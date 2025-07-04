import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTrashNotes, restoreNote, permanentlyDeleteNote, emptyTrash } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Trash = () => {
  const { token } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState({});

  // 获取回收站笔记
  const fetchTrashNotes = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getTrashNotes(page, 10);

      setNotes(response.notes);
      setPagination({
        total: response.total,
        pages: response.pages,
        current_page: response.current_page,
        has_next: response.has_next,
        has_prev: response.has_prev
      });
      setCurrentPage(page);
      setError('');
    } catch (err) {
      setError('获取回收站笔记失败');
      console.error('获取回收站笔记失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 恢复笔记
  const handleRestore = async (noteId) => {
    try {
      setActionLoading(prev => ({ ...prev, [noteId]: 'restoring' }));
      await restoreNote(noteId);

      // 重新获取列表
      await fetchTrashNotes(currentPage);
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || '恢复笔记失败';
      setError(errorMessage);
      console.error('恢复笔记失败:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [noteId]: null }));
    }
  };

  // 永久删除笔记
  const handlePermanentDelete = async (noteId) => {
    if (!window.confirm('确定要永久删除这篇笔记吗？此操作无法撤销！')) {
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [noteId]: 'deleting' }));
      await permanentlyDeleteNote(noteId);

      // 重新获取列表
      await fetchTrashNotes(currentPage);
      setError('');
    } catch (err) {
      const errorMessage = err.message || '永久删除笔记失败';
      setError(errorMessage);
      console.error('永久删除笔记失败:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [noteId]: null }));
    }
  };

  // 清空回收站
  const handleEmptyTrash = async () => {
    if (!window.confirm('确定要清空回收站吗？所有笔记将被永久删除，此操作无法撤销！')) {
      return;
    }

    try {
      setLoading(true);
      await emptyTrash();

      // 重新获取列表
      await fetchTrashNotes(1);
      setError('');
    } catch (err) {
      const errorMessage = err.message || '清空回收站失败';
      setError(errorMessage);
      console.error('清空回收站失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

  useEffect(() => {
    fetchTrashNotes();
  }, []);

  if (loading && notes.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="trash-page">
      <div className="trash-header">
        <h1>回收站</h1>
        <div className="trash-actions">
          {notes.length > 0 && (
            <button 
              className="btn btn-danger"
              onClick={handleEmptyTrash}
              disabled={loading}
            >
              清空回收站
            </button>
          )}
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {notes.length === 0 ? (
        <div className="empty-trash">
          <div className="empty-icon">🗑️</div>
          <h3>回收站为空</h3>
          <p>已删除的笔记会出现在这里</p>
        </div>
      ) : (
        <>
          <div className="trash-list">
            {notes.map(note => (
              <div key={note.id} className="trash-item">
                <div className="note-info">
                  <h3 className="note-title">{note.title}</h3>
                  <p className="note-content">{note.content}</p>
                  <div className="note-meta">
                    <span>删除时间: {formatDate(note.deleted_at)}</span>
                    {note.tags.length > 0 && (
                      <span className="tags">
                        标签: {note.tags.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="note-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleRestore(note.id)}
                    disabled={actionLoading[note.id]}
                  >
                    {actionLoading[note.id] === 'restoring' ? '恢复中...' : '恢复'}
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handlePermanentDelete(note.id)}
                    disabled={actionLoading[note.id]}
                  >
                    {actionLoading[note.id] === 'deleting' ? '删除中...' : '永久删除'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 分页 */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="btn"
                onClick={() => fetchTrashNotes(currentPage - 1)}
                disabled={!pagination.has_prev || loading}
              >
                上一页
              </button>
              <span className="page-info">
                第 {pagination.current_page} 页，共 {pagination.pages} 页
              </span>
              <button
                className="btn"
                onClick={() => fetchTrashNotes(currentPage + 1)}
                disabled={!pagination.has_next || loading}
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .trash-page {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(244, 63, 94, 0.02) 0%, rgba(239, 68, 68, 0.02) 100%);
          min-height: calc(100vh - 80px);
        }

        .trash-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          animation: fadeInDown 0.6s ease-out;
        }

        .trash-header h1 {
          color: var(--text-color);
          margin: 0;
          font-size: 2.5rem;
          font-weight: 900;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .trash-header h1::before {
          content: '🗑️';
          font-size: 2rem;
          animation: bounce 2s infinite;
        }

        .empty-trash {
          text-align: center;
          padding: 4rem 2rem;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          animation: fadeInUp 0.8s ease-out;
        }

        .empty-icon {
          font-size: 5rem;
          margin-bottom: 2rem;
          opacity: 0.6;
          animation: float 3s ease-in-out infinite;
        }

        .empty-trash h3 {
          margin: 0 0 1rem 0;
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--text-color);
        }

        .empty-trash p {
          font-size: 1.1rem;
          color: var(--text-light);
          margin: 0;
        }

        .trash-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .trash-item {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
          border: 1px solid rgba(244, 63, 94, 0.1);
          border-radius: 20px;
          padding: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
          position: relative;
          overflow: hidden;
          animation: fadeInUp 0.6s ease-out;
        }

        .trash-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .trash-item:hover::before {
          transform: scaleX(1);
        }

        .trash-item:hover {
          transform: translateY(-5px) scale(1.01);
          box-shadow: 0 15px 50px rgba(244, 63, 94, 0.12);
          border-color: rgba(244, 63, 94, 0.3);
        }

        .note-info {
          flex: 1;
          margin-right: 2rem;
        }

        .note-title {
          margin: 0 0 1rem 0;
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--text-color);
          transition: color 0.3s ease;
        }

        .trash-item:hover .note-title {
          color: #ef4444;
        }

        .note-content {
          margin: 0 0 1.2rem 0;
          color: var(--text-light);
          line-height: 1.7;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          font-size: 1rem;
        }

        .note-meta {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-light);
        }

        .note-meta span {
          padding: 4px 8px;
          background: rgba(244, 63, 94, 0.1);
          border-radius: 8px;
          width: fit-content;
        }

        .tags {
          color: var(--primary-color);
          background: rgba(59, 130, 246, 0.1) !important;
        }

        .note-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          flex-shrink: 0;
        }

        .note-actions .btn {
          padding: 12px 20px;
          font-size: 0.9rem;
          font-weight: 600;
          min-width: 100px;
          border-radius: 12px;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .note-actions .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }

        .note-actions .btn:hover::before {
          left: 100%;
        }

        .note-actions .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .note-actions .btn-primary {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
        }

        .note-actions .btn-danger {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }

        .trash-actions .btn-danger {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          padding: 12px 24px;
          font-weight: 600;
          border-radius: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .trash-actions .btn-danger:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2rem;
          margin-top: 3rem;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
          border-radius: 20px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
          backdrop-filter: blur(10px);
        }

        .pagination .btn {
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .pagination .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .page-info {
          color: var(--text-color);
          font-size: 1rem;
          font-weight: 500;
          padding: 8px 16px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 12px;
        }

        /* 动画效果 */
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .trash-page {
            padding: 1rem;
          }

          .trash-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
            padding: 1.5rem;
          }

          .trash-header h1 {
            font-size: 2rem;
            text-align: center;
          }

          .trash-item {
            flex-direction: column;
            gap: 1.5rem;
            padding: 1.5rem;
          }

          .note-info {
            margin-right: 0;
          }

          .note-actions {
            flex-direction: row;
            justify-content: center;
            width: 100%;
          }

          .empty-trash {
            padding: 3rem 1.5rem;
          }

          .empty-icon {
            font-size: 4rem;
          }
        }

        @media (max-width: 480px) {
          .trash-header h1 {
            font-size: 1.8rem;
          }

          .note-actions {
            flex-direction: column;
            gap: 0.5rem;
          }

          .note-actions .btn {
            min-width: auto;
            padding: 10px 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default Trash;

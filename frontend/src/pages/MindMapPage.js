import React from 'react';
import VipUpgradePrompt from '../components/VipUpgradePrompt';

const MindMapPage = () => {
  return (
    <VipUpgradePrompt
      featureName="思维导图"
      featureIcon="🧠"
      description="创建和编辑思维导图，可视化您的想法和知识结构"
      features={[
        '节点拖拽编辑',
        '多样式自定义',
        '图片导出功能',
        '协作编辑',
        '模板库支持',
        '智能布局算法'
      ]}
    />
  );
};

export default MindMapPage;

/* 原始代码保留作为注释，以便将来VIP版本使用
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MindMap from '../components/MindMap';
import api from '../services/api';

const MindMapPage = () => {
  const { isAuthenticated } = useAuth();
  const [mindMaps, setMindMaps] = useState([]);
  const [currentMindMap, setCurrentMindMap] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 获取思维导图列表
  const fetchMindMaps = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 这里我们使用笔记API来存储思维导图数据
      // 通过特殊的标签来标识思维导图
      const response = await api.get('/notes?tags=mindmap');
      const mindMapNotes = response.data.notes || [];
      
      setMindMaps(mindMapNotes.map(note => ({
        id: note.id,
        title: note.title,
        data: note.content ? JSON.parse(note.content) : null,
        created_at: note.created_at,
        updated_at: note.updated_at
      })));
    } catch (err) {
      setError('获取思维导图列表失败');
      console.error('获取思维导图失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    if (isAuthenticated) {
      fetchMindMaps();
    }
  }, [isAuthenticated]);

  // 创建新思维导图
  const createMindMap = () => {
    setCurrentMindMap({
      id: null,
      title: '新思维导图',
      data: {
        nodes: [
          { id: 1, x: 400, y: 300, text: '中心主题', level: 0, parent: null, color: '#667eea' }
        ],
        connections: []
      }
    });
    setIsCreating(true);
  };

  // 打开思维导图
  const openMindMap = (mindMap) => {
    setCurrentMindMap(mindMap);
    setIsCreating(true);
  };

  // 保存思维导图
  const saveMindMap = async (data) => {
    try {
      setError('');
      
      const noteData = {
        title: data.title || '思维导图',
        content: JSON.stringify({
          nodes: data.nodes,
          connections: data.connections
        }),
        tags: ['mindmap'],
        categories: ['思维导图']
      };

      let savedNote;
      if (currentMindMap?.id) {
        // 更新现有思维导图
        savedNote = await api.put(`/notes/${currentMindMap.id}`, noteData);
      } else {
        // 创建新思维导图
        savedNote = await api.post('/notes', noteData);
      }

      // 更新当前思维导图
      setCurrentMindMap({
        id: savedNote.data.id,
        title: savedNote.data.title,
        data: {
          nodes: data.nodes,
          connections: data.connections
        }
      });

      // 刷新列表
      await fetchMindMaps();
      
      alert('思维导图保存成功！');
    } catch (err) {
      setError('保存思维导图失败');
      console.error('保存失败:', err);
      alert('保存失败: ' + (err.response?.data?.error || err.message));
    }
  };

  // 删除思维导图
  const deleteMindMap = async (mindMapId) => {
    if (!window.confirm('确定要删除这个思维导图吗？')) return;

    try {
      await api.delete(`/notes/${mindMapId}`);
      await fetchMindMaps();
      
      if (currentMindMap?.id === mindMapId) {
        setCurrentMindMap(null);
        setIsCreating(false);
      }
      
      alert('思维导图删除成功！');
    } catch (err) {
      setError('删除思维导图失败');
      console.error('删除失败:', err);
      alert('删除失败: ' + (err.response?.data?.error || err.message));
    }
  };

  // 关闭编辑器
  const closeEditor = () => {
    setCurrentMindMap(null);
    setIsCreating(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="mindmap-page">
        <div className="auth-required">
          <h2>请先登录</h2>
          <p>您需要登录后才能使用思维导图功能</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mindmap-page">
      <style jsx>{`
        .mindmap-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem 0;
        }

        .mindmap-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .mindmap-header {
          text-align: center;
          margin-bottom: 2rem;
          color: white;
        }

        .mindmap-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          background: linear-gradient(45deg, #fff, #e0e7ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .mindmap-subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .mindmap-actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .action-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .create-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .create-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }

        .back-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .mindmap-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .mindmap-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 15px;
          padding: 1.5rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .mindmap-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .card-header {
          display: flex;
          justify-content: between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .card-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .card-date {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 1rem;
        }

        .card-actions {
          display: flex;
          gap: 0.5rem;
        }

        .card-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .open-btn {
          background: #667eea;
          color: white;
          flex: 1;
        }

        .open-btn:hover {
          background: #5a67d8;
        }

        .delete-btn {
          background: #ef4444;
          color: white;
        }

        .delete-btn:hover {
          background: #dc2626;
        }

        .mindmap-editor {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 1rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          height: 600px;
        }

        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding: 0 1rem;
        }

        .editor-title {
          font-size: 1.3rem;
          font-weight: 600;
          color: #333;
        }

        .close-btn {
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          background: #dc2626;
        }

        .loading {
          text-align: center;
          color: white;
          padding: 3rem;
        }

        .error {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 1rem;
          border-radius: 10px;
          margin-bottom: 1rem;
          text-align: center;
        }

        .auth-required {
          text-align: center;
          color: white;
          padding: 4rem 2rem;
        }

        .empty-state {
          text-align: center;
          color: white;
          padding: 3rem;
        }

        .empty-state h3 {
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .mindmap-title {
            font-size: 2rem;
          }

          .mindmap-list {
            grid-template-columns: 1fr;
          }

          .mindmap-actions {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>

      <div className="mindmap-container">
        {!isCreating ? (
          <>
            <div className="mindmap-header">
              <h1 className="mindmap-title">🧠 思维导图</h1>
              <p className="mindmap-subtitle">
                可视化您的想法和知识结构
              </p>
            </div>

            <div className="mindmap-actions">
              <button className="action-btn create-btn" onClick={createMindMap}>
                ➕ 创建思维导图
              </button>
            </div>

            {error && (
              <div className="error">
                {error}
              </div>
            )}

            {loading ? (
              <div className="loading">
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                <h3>加载中...</h3>
              </div>
            ) : (
              <>
                {mindMaps.length > 0 ? (
                  <div className="mindmap-list">
                    {mindMaps.map(mindMap => (
                      <div key={mindMap.id} className="mindmap-card">
                        <div className="card-header">
                          <h3 className="card-title">{mindMap.title}</h3>
                        </div>
                        <div className="card-date">
                          创建时间: {new Date(mindMap.created_at).toLocaleDateString()}
                        </div>
                        <div className="card-actions">
                          <button 
                            className="card-btn open-btn"
                            onClick={() => openMindMap(mindMap)}
                          >
                            打开
                          </button>
                          <button 
                            className="card-btn delete-btn"
                            onClick={() => deleteMindMap(mindMap.id)}
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <h3>还没有思维导图</h3>
                    <p>点击"创建思维导图"开始您的第一个思维导图</p>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="mindmap-editor">
            <div className="editor-header">
              <h2 className="editor-title">
                {currentMindMap?.title || '新思维导图'}
              </h2>
              <button className="close-btn" onClick={closeEditor}>
                关闭
              </button>
            </div>
            <MindMap
              initialData={currentMindMap?.data}
              onSave={saveMindMap}
              onDataChange={(data) => {
                if (currentMindMap) {
                  setCurrentMindMap({
                    ...currentMindMap,
                    data
                  });
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MindMapPage;

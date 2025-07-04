import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getKanbanBoards,
  createKanbanBoard,
  deleteKanbanBoard,
  createKanbanCard,
  updateKanbanCard,
  deleteKanbanCard
} from '../services/api';
import KanbanBoard from '../components/KanbanBoard';
import CardModal from '../components/CardModal';
import '../styles/kanban-page.css';

const KanbanPage = () => {
  const navigate = useNavigate();
  const { boardId } = useParams();
  const [boards, setBoards] = useState([]);
  const [currentBoard, setCurrentBoard] = useState(null);
  const [selectedBoardId, setSelectedBoardId] = useState(boardId || '');
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedColumnId, setSelectedColumnId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 获取看板列表
  const fetchBoards = async () => {
    try {
      const data = await getKanbanBoards({ include_templates: true });
      setBoards(data.boards);

      // 如果有URL参数中的boardId，设置为当前看板
      if (boardId) {
        const board = data.boards.find(b => b.id === parseInt(boardId));
        if (board) {
          setCurrentBoard(board);
          setSelectedBoardId(boardId);
        }
      } else if (data.boards.length > 0) {
        // 选择第一个非模板看板
        const userBoard = data.boards.find(b => !b.is_template);
        if (userBoard) {
          setCurrentBoard(userBoard);
          setSelectedBoardId(userBoard.id.toString());
        }
      }
    } catch (err) {
      setError('网络错误，请检查连接');
      console.error('获取看板列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, [boardId]);

  // 切换看板
  const handleBoardChange = (newBoardId) => {
    const board = boards.find(b => b.id === parseInt(newBoardId));
    if (board) {
      setCurrentBoard(board);
      setSelectedBoardId(newBoardId);
      navigate(`/kanban/${newBoardId}`);
    }
  };

  // 创建新看板
  const handleCreateBoard = async () => {
    const title = prompt('请输入看板名称:');
    if (!title) return;

    try {
      const data = await createKanbanBoard({
        title: title.trim(),
        description: ''
        // 不再使用模板，使用默认三列结构
      });

      await fetchBoards();
      setCurrentBoard(data.board);
      setSelectedBoardId(data.board.id.toString());
      navigate(`/kanban/${data.board.id}`);
    } catch (err) {
      alert('创建看板时发生错误');
      console.error('创建看板失败:', err);
    }
  };

  // 删除看板
  const handleDeleteBoard = async () => {
    if (!currentBoard) return;

    if (!window.confirm(`确定要删除看板"${currentBoard.title}"吗？此操作不可恢复。`)) {
      return;
    }

    try {
      await deleteKanbanBoard(currentBoard.id);
      await fetchBoards();

      // 选择第一个可用看板或清空当前看板
      if (boards.length > 1) {
        const remainingBoards = boards.filter(b => b.id !== currentBoard.id && !b.is_template);
        if (remainingBoards.length > 0) {
          const nextBoard = remainingBoards[0];
          setCurrentBoard(nextBoard);
          setSelectedBoardId(nextBoard.id.toString());
          navigate(`/kanban/${nextBoard.id}`);
        } else {
          setCurrentBoard(null);
          setSelectedBoardId('');
          navigate('/kanban');
        }
      } else {
        setCurrentBoard(null);
        setSelectedBoardId('');
        navigate('/kanban');
      }
    } catch (err) {
      alert('删除看板时发生错误');
      console.error('删除看板失败:', err);
    }
  };

  // 处理卡片点击
  const handleCardClick = (card) => {
    setSelectedCard(card);
    setSelectedColumnId(card.column_id);
    setShowCardModal(true);
  };

  // 处理创建卡片
  const handleCardCreate = (columnId) => {
    setSelectedCard(null);
    setSelectedColumnId(columnId);
    setShowCardModal(true);
  };

  // 保存卡片
  const handleCardSave = async (cardData) => {
    try {
      if (selectedCard) {
        // 更新卡片
        await updateKanbanCard(selectedCard.id, cardData);
      } else {
        // 创建卡片
        await createKanbanCard(currentBoard.id, cardData);
      }

      // 刷新看板数据
      window.location.reload();
    } catch (err) {
      throw err;
    }
  };

  // 删除卡片
  const handleCardDelete = async (cardId) => {
    try {
      await deleteKanbanCard(cardId);
      // 刷新看板数据
      window.location.reload();
    } catch (err) {
      alert('删除卡片时发生错误');
      console.error('删除卡片失败:', err);
    }
  };

  // 处理卡片状态变更
  const handleCardStatusChange = async (cardId, targetColumnId, newStatus) => {
    try {
      const updateData = {
        status: newStatus
      };

      // 如果有目标列，更新列ID
      if (targetColumnId) {
        updateData.column_id = targetColumnId;
      }

      await updateKanbanCard(cardId, updateData);
      // 刷新看板数据
      window.location.reload();
    } catch (err) {
      alert('更新卡片状态时发生错误');
      console.error('更新卡片状态失败:', err);
    }
  };

  // 创建新列
  const handleColumnCreate = async () => {
    const title = prompt('请输入列名称:');
    if (!title) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/kanban/boards/${currentBoard.id}/columns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title.trim(),
          color: '#6c757d'
        })
      });

      if (response.ok) {
        // 刷新看板数据
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(errorData.error || '创建列失败');
      }
    } catch (err) {
      alert('创建列时发生错误');
      console.error('创建列失败:', err);
    }
  };

  if (loading) {
    return (
      <div className="kanban-page-loading">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kanban-page-error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={fetchBoards} className="retry-button">
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="kanban-page">
      <div className="kanban-header">
        <div className="kanban-title-section">
          <h1>📋 看板管理</h1>
          <div className="board-selector">
            <select
              value={selectedBoardId}
              onChange={(e) => handleBoardChange(e.target.value)}
              className="board-select"
            >
              <option value="">选择看板</option>
              {boards.filter(b => !b.is_template).map(board => (
                <option key={board.id} value={board.id}>
                  {board.title}
                </option>
              ))}
            </select>
            <button onClick={handleCreateBoard} className="create-board-btn">
              新建看板
            </button>
          </div>
        </div>

        {currentBoard && (
          <div className="board-info">
            <div className="board-header">
              <div className="board-title-section">
                <h2>{currentBoard.title}</h2>
                {currentBoard.description && (
                  <p className="board-description">{currentBoard.description}</p>
                )}
              </div>
              <button
                onClick={handleDeleteBoard}
                className="delete-board-btn"
                title="删除看板"
              >
                🗑️ 删除看板
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="kanban-content">
        {currentBoard ? (
          <KanbanBoard
            boardId={currentBoard.id}
            onCardClick={handleCardClick}
            onCardCreate={handleCardCreate}
            onCardUpdate={handleCardClick}
            onCardDelete={handleCardDelete}
            onColumnCreate={handleColumnCreate}
            onCardStatusChange={handleCardStatusChange}
          />
        ) : (
          <div className="no-board-selected">
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>选择或创建一个看板</h3>
              <p>选择现有看板或创建新看板来开始管理任务</p>
              <button onClick={handleCreateBoard} className="create-first-board-btn">
                创建第一个看板
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 卡片模态框 */}
      <CardModal
        isOpen={showCardModal}
        onClose={() => {
          setShowCardModal(false);
          setSelectedCard(null);
          setSelectedColumnId(null);
        }}
        card={selectedCard}
        boardId={currentBoard?.id}
        columnId={selectedColumnId}
        onSave={handleCardSave}
        onDelete={handleCardDelete}
        columns={currentBoard?.columns || []}
      />
    </div>
  );
};

export default KanbanPage;

import React, { useState, useEffect, useCallback } from 'react';
import { getKanbanBoard } from '../services/api';
import '../styles/kanban.css';

const KanbanBoard = ({
  boardId,
  onCardClick,
  onCardCreate,
  onCardUpdate,
  onCardDelete,
  onColumnCreate,
  onColumnUpdate,
  onColumnDelete,
  onCardStatusChange
}) => {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // 获取看板数据
  const fetchBoard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getKanbanBoard(boardId);
      setBoard(response.board);
      setError(null);
    } catch (err) {
      setError('网络错误，请检查连接');
      console.error('获取看板数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    if (boardId) {
      fetchBoard();
    }
  }, [boardId, fetchBoard]);

  // 处理卡片状态变更（复选框点击）
  const handleCardStatusChange = async (card, currentColumn) => {
    if (!board || !onCardStatusChange) return;

    const columns = board.columns;

    // 确定目标列和新状态
    let targetColumn = null;
    let newStatus = card.status;

    // 根据当前列确定下一个状态
    if (currentColumn.title === '待办事项' || currentColumn.title.includes('待办')) {
      // 从待办到进行中
      targetColumn = columns.find(col => col.title === '进行中' || col.title.includes('进行'));
      newStatus = 'in_progress';
    } else if (currentColumn.title === '进行中' || currentColumn.title.includes('进行')) {
      // 从进行中到已完成
      targetColumn = columns.find(col => col.title === '已完成' || col.title.includes('完成'));
      newStatus = 'completed';
    } else if (currentColumn.title === '已完成' || currentColumn.title.includes('完成')) {
      // 从已完成到归档状态（保持在当前列）
      targetColumn = currentColumn;
      newStatus = 'archived';
    }

    console.log('卡片状态变更:', {
      cardId: card.id,
      currentColumn: currentColumn.title,
      targetColumn: targetColumn?.title,
      newStatus: newStatus
    });

    try {
      await onCardStatusChange(card.id, targetColumn?.id, newStatus);
    } catch (error) {
      console.error('更新卡片状态失败:', error);
      alert('移动卡片失败，请重试');
    }
  };

  // 获取优先级颜色
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff4757';
      case 'normal': return '#3742fa';
      case 'low': return '#2ed573';
      default: return '#747d8c';
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    });
  };

  // 检查是否过期
  const isOverdue = (dueDateString) => {
    if (!dueDateString) return false;
    const dueDate = new Date(dueDateString);
    const now = new Date();
    return dueDate < now;
  };

  if (loading) {
    return (
      <div className="kanban-loading">
        <div className="loading-spinner"></div>
        <p>加载看板数据中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kanban-error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={fetchBoard} className="retry-button">
          重试
        </button>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="kanban-empty">
        <p>看板不存在</p>
      </div>
    );
  }

  return (
    <div className="kanban-board" style={{ backgroundColor: board.background_color }}>
      <div className="kanban-columns">
        {board.columns.map((column) => (
          <div key={column.id} className="kanban-column">
            <div className="column-header" style={{ borderTopColor: column.color }}>
              <div className="column-title-section">
                <h3 className="column-title">{column.title}</h3>
                <span className="card-count">{column.cards.length}</span>
                {column.card_limit && (
                  <span className="card-limit">/ {column.card_limit}</span>
                )}
              </div>
              <div className="column-actions">
                <button
                  className="add-card-btn"
                  onClick={() => onCardCreate && onCardCreate(column.id)}
                  title="添加卡片"
                >
                  +
                </button>
              </div>
            </div>

            <div className="column-content">
              {column.cards.map((card, index) => (
                <div
                  key={card.id}
                  className={`kanban-card ${card.status === 'archived' ? 'archived' : ''}`}
                  style={{
                    backgroundColor: card.color || '#ffffff'
                  }}
                  onClick={() => onCardClick && onCardClick(card)}
                >
                  <div className="card-header">
                    <div className="card-header-left">
                      <div
                        className="priority-indicator"
                        style={{ backgroundColor: getPriorityColor(card.priority) }}
                        title={`优先级: ${card.priority}`}
                      ></div>
                      {card.due_date && (
                        <div className={`due-date ${isOverdue(card.due_date) ? 'overdue' : ''}`}>
                          📅 {formatDate(card.due_date)}
                        </div>
                      )}
                    </div>
                    <div className="card-header-right">
                      <div
                        className="card-checkbox"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardStatusChange(card, column);
                        }}
                        title={
                          column.title.includes('待办') ? '移至进行中' :
                          column.title.includes('进行') ? '移至已完成' :
                          column.title.includes('完成') ? '归档任务' : '下一状态'
                        }
                      >
                        {card.status === 'archived' ? '✓' : '☐'}
                      </div>
                    </div>
                  </div>

                  <h4 className="card-title">{card.title}</h4>

                  {card.description && (
                    <p className="card-description">
                      {card.description.length > 100
                        ? `${card.description.substring(0, 100)}...`
                        : card.description
                      }
                    </p>
                  )}

                  {card.tags && card.tags.length > 0 && (
                    <div className="card-tags">
                      {card.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span key={tagIndex} className="card-tag">
                          {tag}
                        </span>
                      ))}
                      {card.tags.length > 3 && (
                        <span className="card-tag more-tags">
                          +{card.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="card-footer">
                    {card.assignee_id && (
                      <div className="assignee" title="分配给">
                        👤
                      </div>
                    )}
                    {card.note_id && (
                      <div className="linked-note" title="关联笔记">
                        📝
                      </div>
                    )}
                    <div className="card-actions">
                      <button
                        className="card-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCardUpdate && onCardUpdate(card);
                        }}
                        title="编辑"
                      >
                        ✏️
                      </button>
                      <button
                        className="card-action-btn delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('确定要删除这张卡片吗？')) {
                            onCardDelete && onCardDelete(card.id);
                          }
                        }}
                        title="删除"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {column.cards.length === 0 && (
                <div className="empty-column">
                  <p>暂无卡片</p>
                  <button
                    className="add-first-card-btn"
                    onClick={() => onCardCreate && onCardCreate(column.id)}
                  >
                    添加第一张卡片
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* 添加新列按钮 */}
        <div className="add-column">
          <button
            className="add-column-btn"
            onClick={() => onColumnCreate && onColumnCreate()}
          >
            <span className="add-icon">+</span>
            <span>添加新列</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;

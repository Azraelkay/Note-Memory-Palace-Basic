import React, { useState, useRef, useEffect } from 'react';

const MindMap = ({ initialData, onSave, onDataChange }) => {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState(initialData?.nodes || [
    { id: 1, x: 400, y: 300, text: '中心主题', level: 0, parent: null, color: '#667eea' }
  ]);
  const [connections, setConnections] = useState(initialData?.connections || []);
  const [selectedNode, setSelectedNode] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [nextId, setNextId] = useState(2);

  // 绘制思维导图
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // 设置canvas尺寸
    canvas.width = rect.width;
    canvas.height = rect.height;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制连接线
    connections.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      
      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // 绘制节点
    nodes.forEach(node => {
      // 绘制节点背景
      ctx.beginPath();
      ctx.arc(node.x, node.y, 30, 0, 2 * Math.PI);
      ctx.fillStyle = node.color || '#667eea';
      ctx.fill();
      
      // 绘制节点边框
      if (selectedNode?.id === node.id) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
      }
      ctx.stroke();

      // 绘制文字
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // 文字换行处理
      const maxWidth = 50;
      const words = node.text.split('');
      let line = '';
      let y = node.y - 5;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i];
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line, node.x, y);
          line = words[i];
          y += 16;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, node.x, y);
    });
  }, [nodes, connections, selectedNode]);

  // 处理鼠标点击
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 检查是否点击了节点
    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= 30;
    });

    if (clickedNode) {
      setSelectedNode(clickedNode);
    } else {
      setSelectedNode(null);
    }
  };

  // 处理双击编辑
  const handleCanvasDoubleClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= 30;
    });

    if (clickedNode) {
      setIsEditing(true);
      setEditText(clickedNode.text);
      setSelectedNode(clickedNode);
    }
  };

  // 处理鼠标拖拽
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= 30;
    });

    if (clickedNode) {
      setDraggedNode(clickedNode);
    }
  };

  const handleMouseMove = (e) => {
    if (!draggedNode) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setNodes(prev => prev.map(node => 
      node.id === draggedNode.id 
        ? { ...node, x, y }
        : node
    ));
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  // 添加子节点
  const addChildNode = () => {
    if (!selectedNode) return;

    const angle = Math.random() * 2 * Math.PI;
    const distance = 100;
    const newX = selectedNode.x + Math.cos(angle) * distance;
    const newY = selectedNode.y + Math.sin(angle) * distance;

    const newNode = {
      id: nextId,
      x: newX,
      y: newY,
      text: '新节点',
      level: selectedNode.level + 1,
      parent: selectedNode.id,
      color: getNodeColor(selectedNode.level + 1)
    };

    const newConnection = {
      from: selectedNode.id,
      to: nextId
    };

    setNodes(prev => [...prev, newNode]);
    setConnections(prev => [...prev, newConnection]);
    setNextId(prev => prev + 1);
    
    // 通知父组件数据变化
    if (onDataChange) {
      onDataChange({
        nodes: [...nodes, newNode],
        connections: [...connections, newConnection]
      });
    }
  };

  // 删除节点
  const deleteNode = () => {
    if (!selectedNode || selectedNode.level === 0) return;

    // 递归删除子节点
    const deleteNodeAndChildren = (nodeId) => {
      const childNodes = nodes.filter(n => n.parent === nodeId);
      childNodes.forEach(child => deleteNodeAndChildren(child.id));
      
      setNodes(prev => prev.filter(n => n.id !== nodeId));
      setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
    };

    deleteNodeAndChildren(selectedNode.id);
    setSelectedNode(null);
    
    // 通知父组件数据变化
    if (onDataChange) {
      const updatedNodes = nodes.filter(n => n.id !== selectedNode.id);
      const updatedConnections = connections.filter(c => c.from !== selectedNode.id && c.to !== selectedNode.id);
      onDataChange({
        nodes: updatedNodes,
        connections: updatedConnections
      });
    }
  };

  // 保存编辑
  const saveEdit = () => {
    if (selectedNode && editText.trim()) {
      setNodes(prev => prev.map(node => 
        node.id === selectedNode.id 
          ? { ...node, text: editText.trim() }
          : node
      ));
      
      // 通知父组件数据变化
      if (onDataChange) {
        const updatedNodes = nodes.map(node => 
          node.id === selectedNode.id 
            ? { ...node, text: editText.trim() }
            : node
        );
        onDataChange({
          nodes: updatedNodes,
          connections
        });
      }
    }
    setIsEditing(false);
    setEditText('');
  };

  // 取消编辑
  const cancelEdit = () => {
    setIsEditing(false);
    setEditText('');
  };

  // 获取节点颜色
  const getNodeColor = (level) => {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
    return colors[level % colors.length];
  };

  // 保存思维导图
  const handleSave = () => {
    if (onSave) {
      onSave({
        nodes,
        connections,
        title: nodes.find(n => n.level === 0)?.text || '思维导图'
      });
    }
  };

  return (
    <div className="mindmap-container">
      <style jsx>{`
        .mindmap-container {
          width: 100%;
          height: 100%;
          position: relative;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 10px;
          overflow: hidden;
        }

        .mindmap-canvas {
          width: 100%;
          height: 100%;
          cursor: crosshair;
        }

        .mindmap-toolbar {
          position: absolute;
          top: 10px;
          left: 10px;
          display: flex;
          gap: 10px;
          background: rgba(255, 255, 255, 0.9);
          padding: 10px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .toolbar-btn {
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          background: #667eea;
          color: white;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s ease;
        }

        .toolbar-btn:hover {
          background: #5a67d8;
          transform: translateY(-1px);
        }

        .toolbar-btn:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
          transform: none;
        }

        .edit-modal {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          z-index: 1000;
        }

        .edit-input {
          width: 200px;
          padding: 8px;
          border: 2px solid #667eea;
          border-radius: 6px;
          font-size: 14px;
          margin-bottom: 10px;
        }

        .edit-buttons {
          display: flex;
          gap: 10px;
        }

        .edit-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
        }

        .save-btn {
          background: #10b981;
          color: white;
        }

        .cancel-btn {
          background: #ef4444;
          color: white;
        }
      `}</style>

      <div className="mindmap-toolbar">
        <button 
          className="toolbar-btn" 
          onClick={addChildNode}
          disabled={!selectedNode}
        >
          ➕ 添加节点
        </button>
        <button 
          className="toolbar-btn" 
          onClick={deleteNode}
          disabled={!selectedNode || selectedNode.level === 0}
        >
          🗑️ 删除节点
        </button>
        <button className="toolbar-btn" onClick={handleSave}>
          💾 保存
        </button>
      </div>

      <canvas
        ref={canvasRef}
        className="mindmap-canvas"
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      {isEditing && (
        <div className="edit-modal">
          <input
            type="text"
            className="edit-input"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
            autoFocus
          />
          <div className="edit-buttons">
            <button className="edit-btn save-btn" onClick={saveEdit}>
              保存
            </button>
            <button className="edit-btn cancel-btn" onClick={cancelEdit}>
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MindMap;

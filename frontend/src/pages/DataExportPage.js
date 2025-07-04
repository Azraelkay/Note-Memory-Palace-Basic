import React, { useState, useEffect } from 'react';
import { getExportFormats, previewExport, exportNotes, exportKanban, exportCalendar, getAllNotes, getKanbanBoards } from '../services/api';
import '../styles/export.css';

const DataExportPage = () => {
  const [formats, setFormats] = useState({});
  const [selectedType, setSelectedType] = useState('notes');
  const [selectedFormat, setSelectedFormat] = useState('json');
  const [filters, setFilters] = useState({});
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [availableData, setAvailableData] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // 获取支持的导出格式
  useEffect(() => {
    const fetchFormats = async () => {
      try {
        const response = await getExportFormats();
        setFormats(response.formats);
        setError(null);
      } catch (err) {
        setError('获取导出格式失败');
        console.error('获取导出格式失败:', err);
      }
    };

    fetchFormats();
  }, []);

  // 当类型改变时，重置格式选择和获取可用数据
  useEffect(() => {
    if (formats[selectedType]) {
      const availableFormats = Object.keys(formats[selectedType]);
      setSelectedFormat(availableFormats[0] || 'json');
      setSelectedItems([]);
      fetchAvailableData();
    }
  }, [selectedType, formats]);

  // 获取可用数据
  const fetchAvailableData = async () => {
    try {
      let data = [];
      switch (selectedType) {
        case 'notes':
          const notesResponse = await getAllNotes();
          data = notesResponse.notes || [];
          break;
        case 'kanban':
          const kanbanResponse = await getKanbanBoards();
          data = kanbanResponse.boards || [];
          break;
        case 'calendar':
          // 暂时使用空数组，后续可以添加获取日历事件的API
          data = [];
          break;
        default:
          data = [];
      }
      setAvailableData({...availableData, [selectedType]: data});
      setError(null);
    } catch (err) {
      setError('获取数据失败');
      console.error('获取数据失败:', err);
    }
  };

  // 预览导出数据
  const handlePreview = async () => {
    if (selectedItems.length === 0) {
      setError('请先选择要导出的数据');
      return;
    }

    try {
      setLoading(true);
      const response = await previewExport({
        type: selectedType,
        format: selectedFormat,
        filters: {
          ...filters,
          selected_ids: selectedItems
        }
      });
      setPreview(response);
      setError(null);
    } catch (err) {
      setError('预览失败');
      console.error('预览失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 执行导出
  const handleExport = async () => {
    if (selectedItems.length === 0) {
      setError('请先选择要导出的数据');
      return;
    }

    try {
      setExporting(true);
      setError(null);

      let response;
      const exportData = {
        format: selectedFormat,
        filters: {
          ...filters,
          selected_ids: selectedItems
        }
      };

      switch (selectedType) {
        case 'notes':
          response = await exportNotes(exportData);
          break;
        case 'kanban':
          response = await exportKanban(exportData);
          break;
        case 'calendar':
          response = await exportCalendar(exportData);
          break;
        default:
          throw new Error('不支持的导出类型');
      }

      // 如果返回的是Blob，创建下载链接
      if (response instanceof Blob) {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedType}_export_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${selectedFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

    } catch (err) {
      setError('导出失败');
      console.error('导出失败:', err);
    } finally {
      setExporting(false);
    }
  };

  // 渲染数据类型选择器
  const renderTypeSelector = () => (
    <div className="export-section">
      <h3>📊 选择数据类型</h3>
      <div className="type-selector">
        {Object.keys(formats).map(type => (
          <label key={type} className={`type-option ${selectedType === type ? 'selected' : ''}`}>
            <input
              type="radio"
              name="dataType"
              value={type}
              checked={selectedType === type}
              onChange={(e) => setSelectedType(e.target.value)}
            />
            <div className="type-info">
              <span className="type-icon">
                {type === 'notes' && '📝'}
                {type === 'kanban' && '📋'}
                {type === 'calendar' && '📅'}
              </span>
              <span className="type-name">
                {type === 'notes' && '笔记数据'}
                {type === 'kanban' && '看板数据'}
                {type === 'calendar' && '日历数据'}
              </span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );

  // 渲染格式选择器
  const renderFormatSelector = () => {
    if (!formats[selectedType]) return null;

    return (
      <div className="export-section">
        <h3>📄 选择导出格式</h3>
        <div className="format-selector">
          {Object.entries(formats[selectedType]).map(([format, info]) => (
            <label key={format} className={`format-option ${selectedFormat === format ? 'selected' : ''}`}>
              <input
                type="radio"
                name="exportFormat"
                value={format}
                checked={selectedFormat === format}
                onChange={(e) => setSelectedFormat(e.target.value)}
              />
              <div className="format-info">
                <span className="format-name">{info.name}</span>
                <span className="format-description">{info.description}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    );
  };

  // 过滤数据 - 结合搜索词和过滤条件
  const getFilteredData = () => {
    let currentData = availableData[selectedType] || [];

    // 应用搜索词过滤
    if (searchTerm) {
      currentData = currentData.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.content && item.content.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 应用日期过滤
    if (filters.date_from) {
      const fromDate = new Date(filters.date_from);
      currentData = currentData.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= fromDate;
      });
    }

    if (filters.date_to) {
      const toDate = new Date(filters.date_to);
      toDate.setHours(23, 59, 59, 999); // 包含整天
      currentData = currentData.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate <= toDate;
      });
    }

    return currentData;
  };

  // 渲染数据选择器
  const renderDataSelector = () => {
    const currentData = availableData[selectedType] || [];
    const filteredData = getFilteredData();

    if (currentData.length === 0) {
      return (
        <div className="export-section">
          <h3>📂 选择要导出的数据</h3>
          <div className="no-data-message">
            <div className="no-data-icon">📭</div>
            <p>暂无{selectedType === 'notes' ? '笔记' : selectedType === 'kanban' ? '看板' : '日历事件'}数据</p>
            <p>请先创建一些内容再进行导出</p>
          </div>
        </div>
      );
    }

    return (
      <div className="export-section">
        <h3>📂 选择要导出的数据</h3>
        <div className="data-selector">
          {/* 搜索和过滤区域 */}
          <div className="search-filter-section">
            {/* 关键词搜索 */}
            <div className="search-input-group">
              <input
                type="text"
                placeholder={`搜索${selectedType === 'notes' ? '笔记' : selectedType === 'kanban' ? '看板' : '事件'}标题或内容...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button
                onClick={() => setSearchTerm('')}
                className="clear-search-btn"
                disabled={!searchTerm}
              >
                🗑️ 清除
              </button>
            </div>

            {/* 日期过滤条件 */}
            {(selectedType === 'notes' || selectedType === 'calendar') && (
              <div className="date-filter-group">
                <div className="date-filter-item">
                  <label>开始日期:</label>
                  <input
                    type="date"
                    value={filters.date_from || ''}
                    onChange={(e) => setFilters({...filters, date_from: e.target.value})}
                    className="date-input"
                  />
                </div>
                <div className="date-filter-item">
                  <label>结束日期:</label>
                  <input
                    type="date"
                    value={filters.date_to || ''}
                    onChange={(e) => setFilters({...filters, date_to: e.target.value})}
                    className="date-input"
                  />
                </div>
                <button
                  onClick={() => setFilters({...filters, date_from: '', date_to: ''})}
                  className="clear-filter-btn"
                  disabled={!filters.date_from && !filters.date_to}
                >
                  清除日期
                </button>
              </div>
            )}

            {/* 搜索结果统计 */}
            {(searchTerm || filters.date_from || filters.date_to) && (
              <div className="filter-results-info">
                {searchTerm && <span>关键词: "{searchTerm}"</span>}
                {filters.date_from && <span>从: {filters.date_from}</span>}
                {filters.date_to && <span>到: {filters.date_to}</span>}
                <span className="results-count">找到 {filteredData.length} 项，共 {currentData.length} 项</span>
              </div>
            )}
          </div>

          <div className="select-all-section">
            <label className="select-all-option">
              <input
                type="checkbox"
                checked={filteredData.length > 0 && filteredData.every(item => selectedItems.includes(item.id))}
                onChange={(e) => {
                  if (e.target.checked) {
                    // 选中所有过滤后的数据
                    const newSelected = [...new Set([...selectedItems, ...filteredData.map(item => item.id)])];
                    setSelectedItems(newSelected);
                  } else {
                    // 取消选中所有过滤后的数据
                    const filteredIds = filteredData.map(item => item.id);
                    setSelectedItems(selectedItems.filter(id => !filteredIds.includes(id)));
                  }
                }}
              />
              <span>
                {(searchTerm || filters.date_from || filters.date_to) ?
                  `选择当前筛选结果 (${filteredData.length} 项)` :
                  `全选 (${currentData.length} 项)`
                }
              </span>
            </label>
          </div>

          <div className="data-items">
            {filteredData.map(item => (
              <label key={item.id} className="data-item">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems([...selectedItems, item.id]);
                    } else {
                      setSelectedItems(selectedItems.filter(id => id !== item.id));
                    }
                  }}
                />
                <div className="item-info">
                  <span className="item-title">{item.title}</span>
                  <span className="item-meta">
                    {selectedType === 'notes' && `创建于: ${new Date(item.created_at).toLocaleDateString()}`}
                    {selectedType === 'kanban' && `${item.columns?.length || 0} 列`}
                    {selectedType === 'calendar' && item.start_time && `时间: ${new Date(item.start_time).toLocaleDateString()}`}
                  </span>
                </div>
              </label>
            ))}
          </div>

          {filteredData.length === 0 && (searchTerm || filters.date_from || filters.date_to) && (
            <div className="no-search-results">
              <div className="no-results-icon">🔍</div>
              <p>没有找到匹配的结果</p>
              <p>尝试调整搜索条件或日期范围</p>
            </div>
          )}
        </div>
      </div>
    );
  };



  // 渲染预览
  const renderPreview = () => {
    if (!preview) return null;

    return (
      <div className="export-section">
        <h3>👀 数据预览</h3>
        <div className="preview-info">
          <span>总计: {preview.total_count} 条记录</span>
          <span>预览: {preview.preview.length} 条</span>
        </div>
        <div className="preview-content">
          <pre>{JSON.stringify(preview.preview, null, 2)}</pre>
        </div>
      </div>
    );
  };

  return (
    <div className="export-page">
      <div className="export-header">
        <h1>📤 数据导出</h1>
        <p>导出您的笔记、看板和日历数据到多种格式</p>
      </div>

      <div className="export-content">
        {renderTypeSelector()}
        {renderFormatSelector()}
        {renderDataSelector()}

        <div className="export-actions">
          <button
            onClick={handlePreview}
            disabled={loading || selectedItems.length === 0}
            className="preview-btn"
          >
            {loading ? '预览中...' : '📋 预览数据'}
          </button>

          <button
            onClick={handleExport}
            disabled={exporting || !selectedType || !selectedFormat || selectedItems.length === 0}
            className="export-btn"
          >
            {exporting ? '导出中...' : '📤 开始导出'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {renderPreview()}
      </div>
    </div>
  );
};

export default DataExportPage;

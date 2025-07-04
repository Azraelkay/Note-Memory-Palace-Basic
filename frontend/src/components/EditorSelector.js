import React, { useState, useEffect } from 'react';
import RichTextEditor from './RichTextEditor';
import MarkdownEditor from './MarkdownEditor';

const EditorSelector = ({ 
  value = '', 
  onChange, 
  placeholder = '开始写作...', 
  height = '300px',
  readOnly = false 
}) => {
  const [editorType, setEditorType] = useState('rich'); // 'rich' or 'markdown'
  const [content, setContent] = useState(value);

  // 同步外部value变化
  useEffect(() => {
    if (value !== content) {
      setContent(value);
    }
  }, [value]);

  // 处理内容变化
  const handleContentChange = (newContent) => {
    setContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };

  // 切换编辑器类型
  const handleEditorTypeChange = (type) => {
    setEditorType(type);
    // 保存用户偏好到localStorage
    localStorage.setItem('preferredEditor', type);
  };

  // 从localStorage加载用户偏好
  useEffect(() => {
    const savedEditor = localStorage.getItem('preferredEditor');
    if (savedEditor && (savedEditor === 'rich' || savedEditor === 'markdown')) {
      setEditorType(savedEditor);
    }
  }, []);

  // 转换HTML到Markdown（简单转换）
  const htmlToMarkdown = (html) => {
    return html
      .replace(/<h([1-6])>/g, (match, level) => '#'.repeat(parseInt(level)) + ' ')
      .replace(/<\/h[1-6]>/g, '\n\n')
      .replace(/<strong>/g, '**').replace(/<\/strong>/g, '**')
      .replace(/<b>/g, '**').replace(/<\/b>/g, '**')
      .replace(/<em>/g, '*').replace(/<\/em>/g, '*')
      .replace(/<i>/g, '*').replace(/<\/i>/g, '*')
      .replace(/<code>/g, '`').replace(/<\/code>/g, '`')
      .replace(/<blockquote>/g, '> ').replace(/<\/blockquote>/g, '\n\n')
      .replace(/<ul>/g, '').replace(/<\/ul>/g, '\n')
      .replace(/<ol>/g, '').replace(/<\/ol>/g, '\n')
      .replace(/<li>/g, '- ').replace(/<\/li>/g, '\n')
      .replace(/<p>/g, '').replace(/<\/p>/g, '\n\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<[^>]*>/g, '') // 移除其他HTML标签
      .replace(/\n{3,}/g, '\n\n') // 清理多余换行
      .trim();
  };

  // 转换Markdown到HTML（简单转换）
  const markdownToHtml = (markdown) => {
    return markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/`(.*)`/gim, '<code>$1</code>')
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/\n/gim, '<br>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  };

  // 处理编辑器切换时的内容转换
  const handleEditorSwitch = (newType) => {
    let convertedContent = content;
    
    if (editorType === 'rich' && newType === 'markdown') {
      // 从富文本转换到Markdown
      convertedContent = htmlToMarkdown(content);
    } else if (editorType === 'markdown' && newType === 'rich') {
      // 从Markdown转换到富文本
      convertedContent = markdownToHtml(content);
    }
    
    setContent(convertedContent);
    handleContentChange(convertedContent);
    handleEditorTypeChange(newType);
  };

  return (
    <div className="editor-selector">
      {/* 编辑器类型选择器 */}
      <div className="editor-type-selector">
        <button
          type="button"
          className={`editor-type-btn ${editorType === 'rich' ? 'active' : ''}`}
          onClick={() => handleEditorSwitch('rich')}
          title="富文本编辑器"
        >
          🎨 富文本
        </button>
        <button
          type="button"
          className={`editor-type-btn ${editorType === 'markdown' ? 'active' : ''}`}
          onClick={() => handleEditorSwitch('markdown')}
          title="Markdown编辑器"
        >
          📝 Markdown
        </button>
      </div>

      {/* 编辑器内容 */}
      <div className="editor-content">
        {editorType === 'rich' ? (
          <RichTextEditor
            value={content}
            onChange={handleContentChange}
            placeholder={placeholder}
            height={height}
            readOnly={readOnly}
          />
        ) : (
          <MarkdownEditor
            value={content}
            onChange={handleContentChange}
            placeholder={placeholder}
            height={height}
            readOnly={readOnly}
          />
        )}
      </div>

      <style jsx>{`
        .editor-selector {
          width: 100%;
        }

        .editor-type-selector {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          padding: 4px;
          background: var(--bg-color);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-color);
        }

        .editor-type-btn {
          flex: 1;
          padding: 8px 16px;
          border: none;
          background: transparent;
          color: var(--text-light);
          border-radius: calc(var(--border-radius) - 2px);
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .editor-type-btn:hover {
          background: var(--hover-color);
          color: var(--text-color);
        }

        .editor-type-btn.active {
          background: var(--primary-color);
          color: white;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
        }

        .editor-content {
          width: 100%;
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .editor-type-selector {
            margin-bottom: 8px;
          }

          .editor-type-btn {
            padding: 6px 12px;
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

export default EditorSelector;

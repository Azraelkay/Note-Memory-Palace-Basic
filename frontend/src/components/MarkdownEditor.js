import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github.css';

const MarkdownEditor = ({ 
  value = '', 
  onChange, 
  placeholder = '开始写作...支持Markdown语法', 
  height = '400px',
  readOnly = false 
}) => {
  const [content, setContent] = useState(value);
  const [previewMode, setPreviewMode] = useState('edit'); // 'edit', 'preview', 'split'

  // 同步外部value变化
  useEffect(() => {
    if (value !== content) {
      setContent(value);
    }
  }, [value]);

  // 处理内容变化
  const handleChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };

  // 插入Markdown语法
  const insertMarkdown = (syntax) => {
    const textarea = document.querySelector('.markdown-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newText = '';
    switch (syntax) {
      case 'bold':
        newText = `**${selectedText || '粗体文本'}**`;
        break;
      case 'italic':
        newText = `*${selectedText || '斜体文本'}*`;
        break;
      case 'code':
        newText = `\`${selectedText || '代码'}\``;
        break;
      case 'link':
        newText = `[${selectedText || '链接文本'}](URL)`;
        break;
      case 'image':
        newText = `![${selectedText || '图片描述'}](图片URL)`;
        break;
      case 'heading':
        newText = `# ${selectedText || '标题'}`;
        break;
      case 'list':
        newText = `- ${selectedText || '列表项'}`;
        break;
      case 'quote':
        newText = `> ${selectedText || '引用文本'}`;
        break;
      case 'codeblock':
        newText = `\`\`\`\n${selectedText || '代码块'}\n\`\`\``;
        break;
      default:
        return;
    }

    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);
    if (onChange) {
      onChange(newContent);
    }

    // 重新聚焦并设置光标位置
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + newText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="markdown-editor">
      {/* 工具栏 */}
      <div className="markdown-toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            className={`toolbar-btn ${previewMode === 'edit' ? 'active' : ''}`}
            onClick={() => setPreviewMode('edit')}
            title="编辑模式"
          >
            ✏️ 编辑
          </button>
          <button
            type="button"
            className={`toolbar-btn ${previewMode === 'split' ? 'active' : ''}`}
            onClick={() => setPreviewMode('split')}
            title="分屏模式"
          >
            📱 分屏
          </button>
          <button
            type="button"
            className={`toolbar-btn ${previewMode === 'preview' ? 'active' : ''}`}
            onClick={() => setPreviewMode('preview')}
            title="预览模式"
          >
            👁️ 预览
          </button>
        </div>

        {previewMode !== 'preview' && (
          <div className="toolbar-group">
            <button type="button" onClick={() => insertMarkdown('heading')} title="标题">H</button>
            <button type="button" onClick={() => insertMarkdown('bold')} title="粗体"><strong>B</strong></button>
            <button type="button" onClick={() => insertMarkdown('italic')} title="斜体"><em>I</em></button>
            <button type="button" onClick={() => insertMarkdown('code')} title="行内代码">&lt;/&gt;</button>
            <button type="button" onClick={() => insertMarkdown('link')} title="链接">🔗</button>
            <button type="button" onClick={() => insertMarkdown('image')} title="图片">🖼️</button>
            <button type="button" onClick={() => insertMarkdown('list')} title="列表">📝</button>
            <button type="button" onClick={() => insertMarkdown('quote')} title="引用">💬</button>
            <button type="button" onClick={() => insertMarkdown('codeblock')} title="代码块">📋</button>
          </div>
        )}
      </div>

      {/* 编辑器内容区 */}
      <div className={`editor-content ${previewMode}`}>
        {/* 编辑区 */}
        {(previewMode === 'edit' || previewMode === 'split') && (
          <div className="editor-pane">
            <textarea
              className="markdown-textarea"
              value={content}
              onChange={handleChange}
              placeholder={placeholder}
              readOnly={readOnly}
              style={{ height }}
            />
          </div>
        )}

        {/* 预览区 */}
        {(previewMode === 'preview' || previewMode === 'split') && (
          <div className="preview-pane" style={{ height }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
              components={{
                // 自定义组件渲染
                code({node, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <pre className={className} {...props}>
                      <code>{children}</code>
                    </pre>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {content || '*开始输入Markdown内容...*'}
            </ReactMarkdown>
          </div>
        )}
      </div>

      <style jsx>{`
        .markdown-editor {
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          overflow: hidden;
          background: var(--card-color);
        }

        .markdown-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: var(--bg-color);
          border-bottom: 1px solid var(--border-color);
          flex-wrap: wrap;
          gap: 8px;
        }

        .toolbar-group {
          display: flex;
          gap: 4px;
        }

        .toolbar-btn {
          padding: 6px 12px;
          border: 1px solid var(--border-color);
          background: var(--card-color);
          color: var(--text-color);
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: var(--transition);
        }

        .toolbar-btn:hover {
          background: var(--hover-color);
        }

        .toolbar-btn.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .toolbar-group button {
          padding: 4px 8px;
          border: 1px solid var(--border-color);
          background: var(--card-color);
          color: var(--text-color);
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
          min-width: 28px;
          transition: var(--transition);
        }

        .toolbar-group button:hover {
          background: var(--hover-color);
        }

        .editor-content {
          display: flex;
        }

        .editor-content.edit .editor-pane {
          width: 100%;
        }

        .editor-content.preview .preview-pane {
          width: 100%;
        }

        .editor-content.split .editor-pane,
        .editor-content.split .preview-pane {
          width: 50%;
        }

        .editor-pane {
          border-right: 1px solid var(--border-color);
        }

        .markdown-textarea {
          width: 100%;
          border: none;
          outline: none;
          padding: 16px;
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
          font-size: 14px;
          line-height: 1.6;
          background: var(--bg-color);
          color: var(--text-color);
          resize: none;
        }

        .markdown-textarea::placeholder {
          color: var(--text-light);
        }

        .preview-pane {
          padding: 16px;
          overflow-y: auto;
          background: var(--card-color);
        }

        /* Markdown预览样式 */
        .preview-pane :global(h1, h2, h3, h4, h5, h6) {
          margin: 16px 0 8px 0;
          color: var(--text-color);
          font-weight: 600;
        }

        .preview-pane :global(h1) { font-size: 2em; }
        .preview-pane :global(h2) { font-size: 1.5em; }
        .preview-pane :global(h3) { font-size: 1.25em; }

        .preview-pane :global(p) {
          margin: 8px 0;
          line-height: 1.6;
          color: var(--text-color);
        }

        .preview-pane :global(ul, ol) {
          margin: 8px 0;
          padding-left: 1.5em;
        }

        .preview-pane :global(li) {
          margin-bottom: 4px;
        }

        .preview-pane :global(blockquote) {
          border-left: 4px solid var(--primary-color);
          margin: 16px 0;
          padding-left: 16px;
          color: var(--text-light);
          font-style: italic;
        }

        .preview-pane :global(code) {
          background: var(--border-color);
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'SFMono-Regular', Consolas, monospace;
          font-size: 0.9em;
        }

        .preview-pane :global(pre) {
          background: #f6f8fa;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 16px;
          overflow-x: auto;
          margin: 16px 0;
        }

        .preview-pane :global(pre code) {
          background: none;
          padding: 0;
        }

        .preview-pane :global(table) {
          border-collapse: collapse;
          width: 100%;
          margin: 16px 0;
        }

        .preview-pane :global(th, td) {
          border: 1px solid var(--border-color);
          padding: 8px 12px;
          text-align: left;
        }

        .preview-pane :global(th) {
          background: var(--bg-color);
          font-weight: 600;
        }

        .preview-pane :global(img) {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 8px 0;
        }

        .preview-pane :global(a) {
          color: var(--primary-color);
          text-decoration: none;
        }

        .preview-pane :global(a:hover) {
          text-decoration: underline;
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .markdown-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .toolbar-group {
            justify-content: center;
          }

          .editor-content.split {
            flex-direction: column;
          }

          .editor-content.split .editor-pane,
          .editor-content.split .preview-pane {
            width: 100%;
          }

          .editor-pane {
            border-right: none;
            border-bottom: 1px solid var(--border-color);
          }
        }
      `}</style>
    </div>
  );
};

export default MarkdownEditor;

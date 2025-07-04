import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ 
  value = '', 
  onChange, 
  placeholder = '开始写作...', 
  height = '300px',
  readOnly = false 
}) => {
  const [editorValue, setEditorValue] = useState(value);
  const quillRef = useRef(null);

  // 同步外部value变化
  useEffect(() => {
    if (value !== editorValue) {
      setEditorValue(value);
    }
  }, [value]);

  // 处理内容变化
  const handleChange = (content, delta, source, editor) => {
    setEditorValue(content);
    if (onChange) {
      onChange(content);
    }
  };

  // 编辑器配置
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image'
  ];

  return (
    <div className="rich-text-editor">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={editorValue}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{ height }}
      />
      
      <style jsx>{`
        .rich-text-editor {
          margin-bottom: 1rem;
        }
        
        .rich-text-editor :global(.ql-editor) {
          min-height: ${height};
          font-size: 14px;
          line-height: 1.6;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        
        .rich-text-editor :global(.ql-toolbar) {
          border-top: 1px solid var(--border-color);
          border-left: 1px solid var(--border-color);
          border-right: 1px solid var(--border-color);
          border-bottom: none;
          background: var(--card-color);
        }
        
        .rich-text-editor :global(.ql-container) {
          border-bottom: 1px solid var(--border-color);
          border-left: 1px solid var(--border-color);
          border-right: 1px solid var(--border-color);
          border-top: none;
          background: var(--bg-color);
        }
        
        .rich-text-editor :global(.ql-editor.ql-blank::before) {
          color: var(--text-light);
          font-style: normal;
        }
        
        .rich-text-editor :global(.ql-snow .ql-picker) {
          color: var(--text-color);
        }
        
        .rich-text-editor :global(.ql-snow .ql-stroke) {
          stroke: var(--text-color);
        }
        
        .rich-text-editor :global(.ql-snow .ql-fill) {
          fill: var(--text-color);
        }
        
        .rich-text-editor :global(.ql-snow .ql-picker-options) {
          background: var(--card-color);
          border: 1px solid var(--border-color);
        }
        
        .rich-text-editor :global(.ql-snow .ql-picker-item:hover) {
          background: var(--hover-color);
        }
        
        .rich-text-editor :global(.ql-snow .ql-tooltip) {
          background: var(--card-color);
          border: 1px solid var(--border-color);
          color: var(--text-color);
        }
        
        .rich-text-editor :global(.ql-snow .ql-tooltip input[type=text]) {
          background: var(--bg-color);
          border: 1px solid var(--border-color);
          color: var(--text-color);
        }
        
        /* 代码块样式 */
        .rich-text-editor :global(.ql-syntax) {
          background: #f6f8fa;
          border: 1px solid #e1e4e8;
          border-radius: 6px;
          color: #24292e;
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
          font-size: 85%;
          padding: 16px;
          overflow: auto;
        }
        
        /* 引用块样式 */
        .rich-text-editor :global(.ql-editor blockquote) {
          border-left: 4px solid var(--primary-color);
          margin: 16px 0;
          padding-left: 16px;
          color: var(--text-light);
          font-style: italic;
        }
        
        /* 链接样式 */
        .rich-text-editor :global(.ql-editor a) {
          color: var(--primary-color);
          text-decoration: none;
        }
        
        .rich-text-editor :global(.ql-editor a:hover) {
          text-decoration: underline;
        }
        
        /* 图片样式 */
        .rich-text-editor :global(.ql-editor img) {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 8px 0;
        }
        
        /* 列表样式 */
        .rich-text-editor :global(.ql-editor ul, .ql-editor ol) {
          padding-left: 1.5em;
        }
        
        .rich-text-editor :global(.ql-editor li) {
          margin-bottom: 4px;
        }
        
        /* 标题样式 */
        .rich-text-editor :global(.ql-editor h1) {
          font-size: 2em;
          font-weight: bold;
          margin: 16px 0 8px 0;
          color: var(--text-color);
        }
        
        .rich-text-editor :global(.ql-editor h2) {
          font-size: 1.5em;
          font-weight: bold;
          margin: 14px 0 6px 0;
          color: var(--text-color);
        }
        
        .rich-text-editor :global(.ql-editor h3) {
          font-size: 1.25em;
          font-weight: bold;
          margin: 12px 0 4px 0;
          color: var(--text-color);
        }
        
        /* 响应式设计 */
        @media (max-width: 768px) {
          .rich-text-editor :global(.ql-toolbar) {
            padding: 8px;
          }
          
          .rich-text-editor :global(.ql-formats) {
            margin-right: 8px;
          }
          
          .rich-text-editor :global(.ql-editor) {
            font-size: 16px; /* 防止iOS缩放 */
          }
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;

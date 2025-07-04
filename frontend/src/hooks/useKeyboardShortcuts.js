import { useEffect, useCallback } from 'react';

const useKeyboardShortcuts = (shortcuts = {}) => {
  const handleKeyDown = useCallback((event) => {
    // 检查是否在输入框中
    const isInputElement = ['INPUT', 'TEXTAREA'].includes(event.target.tagName) ||
                          event.target.contentEditable === 'true' ||
                          event.target.closest('.ql-editor') || // Quill编辑器
                          event.target.closest('.markdown-textarea'); // Markdown编辑器

    // 构建快捷键字符串
    const keys = [];
    if (event.ctrlKey || event.metaKey) keys.push('ctrl');
    if (event.altKey) keys.push('alt');
    if (event.shiftKey) keys.push('shift');
    keys.push(event.key.toLowerCase());
    
    const shortcutKey = keys.join('+');

    // 查找匹配的快捷键
    const shortcut = shortcuts[shortcutKey];
    if (shortcut) {
      // 检查是否应该在输入元素中执行
      if (isInputElement && !shortcut.allowInInput) {
        return;
      }

      // 阻止默认行为
      if (shortcut.preventDefault !== false) {
        event.preventDefault();
      }

      // 执行回调
      if (typeof shortcut.action === 'function') {
        shortcut.action(event);
      } else if (typeof shortcut === 'function') {
        shortcut(event);
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // 返回一些有用的工具函数
  return {
    // 格式化快捷键显示文本
    formatShortcut: (shortcut) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      return shortcut
        .replace('ctrl', isMac ? '⌘' : 'Ctrl')
        .replace('alt', isMac ? '⌥' : 'Alt')
        .replace('shift', isMac ? '⇧' : 'Shift')
        .replace('+', isMac ? '' : '+');
    },

    // 检查是否为Mac
    isMac: navigator.platform.toUpperCase().indexOf('MAC') >= 0,
  };
};

// 预定义的常用快捷键
export const commonShortcuts = {
  // 保存
  save: 'ctrl+s',
  // 新建
  new: 'ctrl+n',
  // 搜索
  search: 'ctrl+f',
  // 关闭
  close: 'escape',
  // 全选
  selectAll: 'ctrl+a',
  // 复制
  copy: 'ctrl+c',
  // 粘贴
  paste: 'ctrl+v',
  // 剪切
  cut: 'ctrl+x',
  // 撤销
  undo: 'ctrl+z',
  // 重做
  redo: 'ctrl+y',
  // 加粗
  bold: 'ctrl+b',
  // 斜体
  italic: 'ctrl+i',
  // 下划线
  underline: 'ctrl+u',
};

export default useKeyboardShortcuts;

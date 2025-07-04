import { useEffect, useRef, useCallback, useState } from 'react';

const useAutoSave = (data, saveFunction, options = {}) => {
  const {
    delay = 2000, // 防抖延迟时间（毫秒）
    enabled = true, // 是否启用自动保存
    onSaveStart = null, // 保存开始回调
    onSaveSuccess = null, // 保存成功回调
    onSaveError = null, // 保存失败回调
  } = options;

  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving', 'saved', 'error', 'pending'
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState(null);
  
  const timeoutRef = useRef(null);
  const lastDataRef = useRef(data);
  const isMountedRef = useRef(true);

  // 清理函数
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 执行保存
  const performSave = useCallback(async (dataToSave) => {
    if (!isMountedRef.current || !enabled) return;

    try {
      setSaveStatus('saving');
      setError(null);

      if (onSaveStart) {
        onSaveStart();
      }

      const result = await saveFunction(dataToSave);

      if (isMountedRef.current) {
        setSaveStatus('saved');
        setLastSaved(new Date());

        if (onSaveSuccess) {
          onSaveSuccess(result);
        }
      }

      return result;
    } catch (err) {
      if (isMountedRef.current) {
        setSaveStatus('error');
        setError(err.message || '保存失败');

        if (onSaveError) {
          onSaveError(err);
        }
      }
      throw err;
    }
  }, [saveFunction, enabled, onSaveStart, onSaveSuccess, onSaveError]);

  // 防抖保存
  const debouncedSave = useCallback((dataToSave) => {
    if (!enabled) return;

    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 设置保存状态为待保存
    setSaveStatus('pending');

    // 设置新的定时器
    timeoutRef.current = setTimeout(() => {
      performSave(dataToSave);
    }, delay);
  }, [delay, performSave, enabled]);

  // 立即保存
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    return performSave(data);
  }, [data, performSave]);

  // 监听数据变化
  useEffect(() => {
    if (!enabled) return;

    // 检查数据是否真的发生了变化
    const dataString = JSON.stringify(data);
    const lastDataString = JSON.stringify(lastDataRef.current);

    if (dataString !== lastDataString) {
      lastDataRef.current = data;
      // 数据变化时设置为pending状态
      setSaveStatus('pending');
      debouncedSave(data);
    }
  }, [data, debouncedSave, enabled]);

  // 获取保存状态文本
  const getSaveStatusText = useCallback(() => {
    switch (saveStatus) {
      case 'saving':
        return '保存中...';
      case 'saved':
        return lastSaved ? `已保存 ${formatTime(lastSaved)}` : '已保存';
      case 'error':
        return `保存失败: ${error}`;
      case 'pending':
        return '有未保存的更改';
      default:
        return '';
    }
  }, [saveStatus, lastSaved, error]);

  // 格式化时间
  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // 小于1分钟
      return '刚刚';
    } else if (diff < 3600000) { // 小于1小时
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) { // 小于1天
      return `${Math.floor(diff / 3600000)}小时前`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return {
    saveStatus,
    saveStatusText: getSaveStatusText(),
    lastSaved,
    error,
    saveNow,
    isAutoSaveEnabled: enabled,
  };
};

export default useAutoSave;

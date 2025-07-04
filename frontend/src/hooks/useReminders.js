/**
 * 提醒管理 Hook
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import notificationService from '../services/notificationService';

const useReminders = (isAuthenticated = false) => {
  const [reminders, setReminders] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);
  
  // 使用 ref 来存储已显示的提醒，避免重复显示
  const shownReminders = useRef(new Set());
  const intervalRef = useRef(null);

  /**
   * 获取待提醒事件
   */
  const fetchPendingReminders = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/calendar/reminders/pending');
      const newReminders = response.data.reminders || [];
      
      setReminders(newReminders);
      setLastCheck(new Date());

      // 显示新的提醒通知
      newReminders.forEach(reminder => {
        const reminderId = `${reminder.event_id}-${reminder.reminder_time}`;
        
        // 检查是否已经显示过这个提醒
        if (!shownReminders.current.has(reminderId)) {
          showReminderNotification(reminder);
          shownReminders.current.add(reminderId);
        }
      });

      return newReminders;
    } catch (err) {
      console.error('获取待提醒事件失败:', err);
      setError('获取提醒失败');
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * 获取即将到来的事件
   */
  const fetchUpcomingEvents = useCallback(async (hoursAhead = 24) => {
    if (!isAuthenticated) return;

    try {
      const response = await api.get(`/calendar/reminders/upcoming?hours=${hoursAhead}`);
      const events = response.data.events || [];
      
      setUpcomingEvents(events);
      return events;
    } catch (err) {
      console.error('获取即将到来的事件失败:', err);
      return [];
    }
  }, [isAuthenticated]);

  /**
   * 显示提醒通知
   */
  const showReminderNotification = useCallback((reminder) => {
    // 优先使用浏览器原生通知
    if (notificationService.hasPermission()) {
      notificationService.showEventReminder(reminder);
    } else {
      // 如果没有权限，使用应用内通知
      notificationService.showInAppNotification(reminder);
    }

    // 标记提醒已发送
    markReminderSent(reminder.event_id);
  }, []);

  /**
   * 标记提醒已发送
   */
  const markReminderSent = useCallback(async (eventId) => {
    try {
      await api.post(`/calendar/reminders/mark-sent/${eventId}`);
    } catch (err) {
      console.error('标记提醒发送状态失败:', err);
    }
  }, []);

  /**
   * 请求通知权限
   */
  const requestNotificationPermission = useCallback(async () => {
    const granted = await notificationService.requestPermission();
    return granted;
  }, []);

  /**
   * 开始轮询提醒
   */
  const startReminderPolling = useCallback((intervalMs = 60000) => { // 默认1分钟检查一次
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // 立即检查一次
    fetchPendingReminders();

    // 设置定时检查
    intervalRef.current = setInterval(() => {
      fetchPendingReminders();
    }, intervalMs);

    console.log(`提醒轮询已启动，检查间隔: ${intervalMs / 1000}秒`);
  }, [fetchPendingReminders]);

  /**
   * 停止轮询提醒
   */
  const stopReminderPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('提醒轮询已停止');
    }
  }, []);

  /**
   * 清理已显示的提醒记录
   */
  const clearShownReminders = useCallback(() => {
    shownReminders.current.clear();
  }, []);

  /**
   * 手动触发提醒检查
   */
  const checkReminders = useCallback(() => {
    return fetchPendingReminders();
  }, [fetchPendingReminders]);

  // 当认证状态改变时，管理轮询
  useEffect(() => {
    if (isAuthenticated) {
      // 用户登录时开始轮询
      startReminderPolling();
      // 同时获取即将到来的事件
      fetchUpcomingEvents();
    } else {
      // 用户登出时停止轮询
      stopReminderPolling();
      setReminders([]);
      setUpcomingEvents([]);
      clearShownReminders();
    }

    // 清理函数
    return () => {
      stopReminderPolling();
    };
  }, [isAuthenticated, startReminderPolling, stopReminderPolling, fetchUpcomingEvents, clearShownReminders]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      stopReminderPolling();
    };
  }, [stopReminderPolling]);

  return {
    // 状态
    reminders,
    upcomingEvents,
    loading,
    error,
    lastCheck,
    
    // 方法
    fetchPendingReminders,
    fetchUpcomingEvents,
    requestNotificationPermission,
    startReminderPolling,
    stopReminderPolling,
    checkReminders,
    clearShownReminders,
    
    // 通知服务状态
    notificationSupported: notificationService.isSupported(),
    notificationPermission: notificationService.hasPermission(),
    notificationPermissionStatus: notificationService.getPermissionStatusText()
  };
};

export default useReminders;

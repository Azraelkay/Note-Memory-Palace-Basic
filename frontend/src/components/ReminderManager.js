/**
 * 提醒管理组件
 * 负责在后台管理事件提醒，不渲染任何UI
 */
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import useReminders from '../hooks/useReminders';

const ReminderManager = () => {
  const { isAuthenticated } = useAuth();
  const {
    reminders,
    upcomingEvents,
    loading,
    error,
    lastCheck,
    requestNotificationPermission,
    notificationSupported,
    notificationPermission,
    notificationPermissionStatus
  } = useReminders(isAuthenticated);

  // 在组件挂载时请求通知权限
  useEffect(() => {
    if (isAuthenticated && notificationSupported && !notificationPermission) {
      // 延迟请求权限，避免在页面加载时立即弹出
      const timer = setTimeout(() => {
        requestNotificationPermission().then(granted => {
          if (granted) {
            console.log('✅ 通知权限已获取，提醒功能已启用');
          } else {
            console.log('❌ 通知权限被拒绝，将使用应用内通知');
          }
        });
      }, 2000); // 2秒后请求权限

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, notificationSupported, notificationPermission, requestNotificationPermission]);

  // 在开发环境下输出调试信息
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔔 提醒管理器状态:', {
        isAuthenticated,
        remindersCount: reminders.length,
        upcomingEventsCount: upcomingEvents.length,
        loading,
        error,
        lastCheck,
        notificationSupported,
        notificationPermission,
        notificationPermissionStatus
      });
    }
  }, [
    isAuthenticated,
    reminders.length,
    upcomingEvents.length,
    loading,
    error,
    lastCheck,
    notificationSupported,
    notificationPermission,
    notificationPermissionStatus
  ]);

  // 这个组件不渲染任何UI，只负责后台管理提醒
  return null;
};

export default ReminderManager;

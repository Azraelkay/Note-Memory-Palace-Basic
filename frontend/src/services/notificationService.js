/**
 * 浏览器通知服务
 */

class NotificationService {
  constructor() {
    this.permission = 'default';
    this.init();
  }

  /**
   * 初始化通知服务
   */
  async init() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
      
      // 如果权限是默认状态，尝试请求权限
      if (this.permission === 'default') {
        await this.requestPermission();
      }
    } else {
      console.warn('此浏览器不支持桌面通知');
    }
  }

  /**
   * 请求通知权限
   */
  async requestPermission() {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        this.permission = permission;
        return permission === 'granted';
      } catch (error) {
        console.error('请求通知权限失败:', error);
        return false;
      }
    }
    return false;
  }

  /**
   * 检查是否支持通知
   */
  isSupported() {
    return 'Notification' in window;
  }

  /**
   * 检查是否有通知权限
   */
  hasPermission() {
    return this.permission === 'granted';
  }

  /**
   * 显示事件提醒通知
   */
  showEventReminder(event) {
    if (!this.isSupported() || !this.hasPermission()) {
      console.warn('无法显示通知：不支持或无权限');
      return null;
    }

    const title = `📅 事件提醒: ${event.title}`;
    const options = {
      body: this.formatEventBody(event),
      icon: '/favicon.ico', // 可以使用应用图标
      badge: '/favicon.ico',
      tag: `event-${event.event_id}`, // 防止重复通知
      requireInteraction: true, // 需要用户交互才能关闭
      actions: [
        {
          action: 'view',
          title: '查看详情',
          icon: '/icons/view.png'
        },
        {
          action: 'dismiss',
          title: '关闭',
          icon: '/icons/close.png'
        }
      ],
      data: {
        eventId: event.event_id,
        type: 'event-reminder'
      }
    };

    try {
      const notification = new Notification(title, options);
      
      // 设置点击事件
      notification.onclick = () => {
        window.focus();
        // 可以跳转到日历页面或事件详情
        window.location.href = `/calendar?event=${event.event_id}`;
        notification.close();
      };

      // 自动关闭通知（10秒后）
      setTimeout(() => {
        notification.close();
      }, 10000);

      return notification;
    } catch (error) {
      console.error('显示通知失败:', error);
      return null;
    }
  }

  /**
   * 格式化事件通知内容
   */
  formatEventBody(event) {
    const parts = [];
    
    // 时间信息
    const startTime = new Date(event.start_datetime);
    const timeStr = startTime.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
    parts.push(`⏰ ${timeStr} 开始`);

    // 位置信息
    if (event.location) {
      parts.push(`📍 ${event.location}`);
    }

    // 描述信息
    if (event.description) {
      const desc = event.description.length > 50 
        ? event.description.substring(0, 50) + '...' 
        : event.description;
      parts.push(desc);
    }

    // 提醒时间信息
    if (event.time_until_event !== undefined) {
      if (event.time_until_event <= 0) {
        parts.push('🔔 事件即将开始');
      } else {
        parts.push(`🔔 ${event.time_until_event} 分钟后开始`);
      }
    }

    return parts.join('\n');
  }

  /**
   * 显示简单通知
   */
  showSimpleNotification(title, message, options = {}) {
    if (!this.isSupported() || !this.hasPermission()) {
      console.warn('无法显示通知：不支持或无权限');
      return null;
    }

    const defaultOptions = {
      body: message,
      icon: '/favicon.ico',
      tag: 'simple-notification',
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);
      
      // 自动关闭通知（5秒后）
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } catch (error) {
      console.error('显示简单通知失败:', error);
      return null;
    }
  }

  /**
   * 显示应用内通知（作为浏览器通知的备选方案）
   */
  showInAppNotification(event) {
    // 创建应用内通知元素
    const notification = document.createElement('div');
    notification.className = 'in-app-notification event-reminder';
    notification.innerHTML = `
      <div class="notification-header">
        <span class="notification-icon">📅</span>
        <span class="notification-title">事件提醒: ${event.title}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
      <div class="notification-body">
        ${this.formatEventBody(event)}
      </div>
      <div class="notification-actions">
        <button class="notification-btn primary" onclick="window.location.href='/calendar?event=${event.event_id}'">查看详情</button>
        <button class="notification-btn secondary" onclick="this.parentElement.parentElement.remove()">关闭</button>
      </div>
    `;

    // 添加样式
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      padding: 16px;
      max-width: 350px;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // 添加到页面
    document.body.appendChild(notification);

    // 自动移除通知（10秒后）
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);

    return notification;
  }

  /**
   * 获取权限状态文本
   */
  getPermissionStatusText() {
    switch (this.permission) {
      case 'granted':
        return '已授权';
      case 'denied':
        return '已拒绝';
      case 'default':
        return '未设置';
      default:
        return '未知';
    }
  }
}

// 创建单例实例
const notificationService = new NotificationService();

export default notificationService;

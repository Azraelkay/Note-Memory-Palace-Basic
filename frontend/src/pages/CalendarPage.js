import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Calendar from '../components/Calendar';
import EventModal from '../components/EventModal';
import VipUpgradePrompt from '../components/VipUpgradePrompt';
import api from '../services/api';

const CalendarPage = () => {
  const { isAuthenticated } = useAuth();
  const [viewType, setViewType] = useState('month'); // month, week, day
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 模态框状态
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalSelectedDate, setModalSelectedDate] = useState(null);

  // 侧边栏状态
  const [showSidebar, setShowSidebar] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [todayEvents, setTodayEvents] = useState([]);

  // 日历刷新触发器
  const [calendarRefreshTrigger, setCalendarRefreshTrigger] = useState(0);

  // 获取今日事件
  const fetchTodayEvents = async () => {
    try {
      const response = await api.get('/calendar/today');
      setTodayEvents(response.data.events || []);
    } catch (err) {
      console.error('获取今日事件失败:', err);
    }
  };

  // 获取即将到来的事件
  const fetchUpcomingEvents = async () => {
    try {
      const response = await api.get('/calendar/upcoming');
      setUpcomingEvents(response.data.events || []);
    } catch (err) {
      console.error('获取即将到来的事件失败:', err);
    }
  };

  // 初始加载
  useEffect(() => {
    if (isAuthenticated) {
      fetchTodayEvents();
      fetchUpcomingEvents();
    }
  }, [isAuthenticated]);

  // 事件处理函数
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setModalSelectedDate(null);
    setIsEventModalOpen(true);
  };

  const handleDateClick = (date) => {
    setSelectedEvent(null);
    setModalSelectedDate(date);
    setIsEventModalOpen(true);
  };

  const handleEventCreate = () => {
    setSelectedEvent(null);
    setModalSelectedDate(new Date());
    setIsEventModalOpen(true);
  };

  const handleEventSaved = (savedEvent, action) => {
    if (action === 'deleted') {
      // 刷新侧边栏数据
      fetchTodayEvents();
      fetchUpcomingEvents();
      // 触发日历刷新
      setCalendarRefreshTrigger(prev => prev + 1);
    } else if (savedEvent) {
      // 刷新侧边栏数据
      fetchTodayEvents();
      fetchUpcomingEvents();
      // 触发日历刷新
      setCalendarRefreshTrigger(prev => prev + 1);
    }
  };

  const handleCloseModal = () => {
    setIsEventModalOpen(false);
    setSelectedEvent(null);
    setModalSelectedDate(null);
  };

  // 渲染侧边栏
  const renderSidebar = () => {
    return (
      <div className="calendar-sidebar">
        <div className="sidebar-section">
          <h3>今日事件</h3>
          {todayEvents.length > 0 ? (
            <div className="event-list">
              {todayEvents.map(event => (
                <div
                  key={event.id}
                  className="sidebar-event"
                  style={{ borderLeftColor: event.color }}
                  onClick={() => handleEventClick(event)}
                >
                  <div className="event-time">
                    {new Date(event.start_datetime).toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="event-title">{event.title}</div>
                  {event.location && (
                    <div className="event-location">📍 {event.location}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-events">今天没有事件</div>
          )}
        </div>

        <div className="sidebar-section">
          <h3>即将到来</h3>
          {upcomingEvents.length > 0 ? (
            <div className="event-list">
              {upcomingEvents.map(event => (
                <div
                  key={event.id}
                  className="sidebar-event"
                  style={{ borderLeftColor: event.color }}
                  onClick={() => handleEventClick(event)}
                >
                  <div className="event-date">
                    {new Date(event.start_datetime).toLocaleDateString('zh-CN', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="event-title">{event.title}</div>
                  <div className="event-time">
                    {new Date(event.start_datetime).toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-events">暂无即将到来的事件</div>
          )}
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="calendar-page">
        <div className="auth-required">
          <h2>请先登录</h2>
          <p>您需要登录后才能查看日历</p>
        </div>
      </div>
    );
  }

  // 在基础版本中显示VIP升级提示
  return (
    <VipUpgradePrompt
      featureName="日历视图"
      featureIcon="📅"
      description="按日历形式查看和管理笔记，支持日程安排和提醒功能"
      features={[
        '月视图、周视图、日视图切换',
        '事件创建和编辑',
        '智能提醒通知',
        '与笔记关联',
        '重复事件设置',
        '日程导出功能'
      ]}
      previewContent={
        <div className="calendar-preview">
          <div className="preview-header">
            <h1>📅 日历视图</h1>
            <div className="view-controls">
              <button>月视图</button>
              <button>周视图</button>
              <button>日视图</button>
            </div>
          </div>
          <div className="preview-calendar">
            <div className="calendar-grid">
              {Array.from({length: 35}, (_, i) => (
                <div key={i} className="calendar-cell">
                  {i % 7 === 0 && <span>{Math.floor(i/7) + 1}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    />
  );

  // 原始代码保留作为注释，以便将来VIP版本使用
  /*
  return (
    <div className="calendar-page">
      {/* 页面头部 */}
      <div className="calendar-page-header">
        <div className="header-content">
          <h1 className="page-title">📅 日历视图</h1>
          <p className="page-description">管理您的日程安排和重要事件</p>

          <div className="view-controls">
            <div className="view-type-selector">
              {['month', 'week', 'day'].map(type => (
                <button
                  key={type}
                  className={`view-btn ${viewType === type ? 'active' : ''}`}
                  onClick={() => setViewType(type)}
                >
                  {type === 'month' ? '月' : type === 'week' ? '周' : '日'}
                </button>
              ))}
            </div>

            <button
              className="toggle-sidebar-btn"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              {showSidebar ? '隐藏侧边栏' : '显示侧边栏'}
            </button>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="calendar-main-content">
        <div className={`calendar-layout ${showSidebar ? 'with-sidebar' : 'full-width'}`}>
          {/* 日历组件 */}
          <div className="calendar-section">
            <Calendar
              view={viewType}
              selectedDate={selectedDate}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
              onEventCreate={handleEventCreate}
              refreshTrigger={calendarRefreshTrigger}
            />
          </div>

          {/* 侧边栏 */}
          {showSidebar && (
            <div className="sidebar-section">
              {renderSidebar()}
            </div>
          )}
        </div>
      </div>

      {/* 事件模态框 */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}
        selectedDate={modalSelectedDate}
        onEventSaved={handleEventSaved}
      />

      <style jsx>{`
        .calendar-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 0;
        }

        .calendar-page-header {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          padding: 2rem 0;
          color: white;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .page-title {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(45deg, #fff, #e0e7ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
          text-align: center;
        }

        .page-description {
          text-align: center;
          font-size: 1.2rem;
          opacity: 0.9;
          margin-bottom: 2rem;
        }

        .view-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .view-type-selector {
          display: flex;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 4px;
          gap: 4px;
        }

        .view-btn {
          background: transparent;
          border: none;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .view-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .view-btn.active {
          background: rgba(255, 255, 255, 0.2);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .toggle-sidebar-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          border: none;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
        }

        .toggle-sidebar-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }

        .calendar-main-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .calendar-layout {
          display: grid;
          gap: 2rem;
          transition: all 0.3s ease;
        }

        .calendar-layout.with-sidebar {
          grid-template-columns: 1fr 350px;
        }

        .calendar-layout.full-width {
          grid-template-columns: 1fr;
        }

        .calendar-section {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .sidebar-section {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          height: fit-content;
        }
        .calendar-sidebar h3 {
          color: var(--text-color);
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--border-color);
        }

        .sidebar-section {
          margin-bottom: 2rem;
        }

        .sidebar-section:last-child {
          margin-bottom: 0;
        }

        .event-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .sidebar-event {
          background: #f9fafb;
          border-left: 4px solid #3b82f6;
          border-radius: 8px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sidebar-event:hover {
          background: #f3f4f6;
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .sidebar-event .event-time,
        .sidebar-event .event-date {
          font-size: 0.875rem;
          color: var(--text-light);
          font-weight: 500;
        }

        .sidebar-event .event-title {
          font-weight: 600;
          color: var(--text-color);
          margin: 0.25rem 0;
        }

        .sidebar-event .event-location {
          font-size: 0.875rem;
          color: var(--text-light);
          margin-top: 0.25rem;
        }

        .no-events {
          text-align: center;
          color: var(--text-light);
          font-style: italic;
          padding: 2rem 1rem;
        }

        .auth-required {
          text-align: center;
          color: white;
          padding: 4rem 2rem;
        }

        .auth-required h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        @media (max-width: 1024px) {
          .calendar-layout.with-sidebar {
            grid-template-columns: 1fr;
          }

          .sidebar-section {
            order: -1;
            margin-bottom: 2rem;
          }
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 2rem;
          }

          .view-controls {
            flex-direction: column;
            gap: 1rem;
          }

          .calendar-main-content {
            padding: 1rem;
          }

          .header-content {
            padding: 0 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CalendarPage;
*/

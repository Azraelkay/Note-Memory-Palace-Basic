import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/calendar.css';

const Calendar = ({
  view = 'month',
  onEventClick,
  onDateClick,
  onEventCreate,
  selectedDate = new Date(),
  events = [],
  refreshTrigger = 0
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));
  const [calendarEvents, setCalendarEvents] = useState(events);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);

  // 获取日历事件
  const fetchEvents = async (startDate, endDate) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/calendar/events', {
        params: {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          view: view
        }
      });
      
      setCalendarEvents(response.data.events || []);
    } catch (err) {
      setError('获取日历事件失败');
      console.error('获取日历事件失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 获取月视图的日期范围
  const getMonthRange = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // 月份第一天
    const firstDay = new Date(year, month, 1);
    // 月份最后一天
    const lastDay = new Date(year, month + 1, 0);
    
    // 日历网格开始日期（包含上月末尾几天）
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // 日历网格结束日期（包含下月开始几天）
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    return { startDate, endDate, firstDay, lastDay };
  };

  // 获取周视图的日期范围
  const getWeekRange = (date) => {
    const startDate = new Date(date);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    return { startDate, endDate };
  };

  // 获取日视图的日期范围
  const getDayRange = (date) => {
    const startDate = new Date(date);
    const endDate = new Date(date);
    return { startDate, endDate };
  };

  // 根据视图类型获取日期范围
  const getDateRange = () => {
    switch (view) {
      case 'week':
        return getWeekRange(currentDate);
      case 'day':
        return getDayRange(currentDate);
      default:
        return getMonthRange(currentDate);
    }
  };

  // 当日期或视图改变时重新获取事件
  useEffect(() => {
    const { startDate, endDate } = getDateRange();
    fetchEvents(startDate, endDate);
  }, [currentDate, view]);

  // 当刷新触发器改变时重新获取事件
  useEffect(() => {
    if (refreshTrigger > 0) {
      const { startDate, endDate } = getDateRange();
      fetchEvents(startDate, endDate);
    }
  }, [refreshTrigger]);

  // 导航函数
  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    switch (view) {
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    switch (view) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  // 拖拽功能
  const handleDragStart = (e, event) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  };

  const handleDragOver = (e, date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDate(date);
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = async (e, targetDate) => {
    e.preventDefault();
    setDragOverDate(null);

    if (!draggedEvent || !targetDate) return;

    try {
      // 计算时间差
      const originalDate = new Date(draggedEvent.start_datetime);
      const timeDiff = targetDate.getTime() - originalDate.getTime();

      // 更新开始和结束时间
      const newStartDate = new Date(originalDate.getTime() + timeDiff);
      const newEndDate = new Date(new Date(draggedEvent.end_datetime).getTime() + timeDiff);

      const updatedEvent = {
        ...draggedEvent,
        start_datetime: newStartDate.toISOString(),
        end_datetime: newEndDate.toISOString()
      };

      // 调用API更新事件
      await api.put(`/calendar/events/${draggedEvent.id}`, updatedEvent);

      // 更新本地状态
      setCalendarEvents(prev =>
        prev.map(event =>
          event.id === draggedEvent.id ? updatedEvent : event
        )
      );

      // 重新获取事件以确保数据同步
      const { startDate, endDate } = getDateRange();
      fetchEvents(startDate, endDate);

    } catch (err) {
      setError('移动事件失败');
      console.error('移动事件失败:', err);
    } finally {
      setDraggedEvent(null);
    }
  };

  // 快速创建事件
  const handleQuickCreate = async (date, title = '新事件') => {
    try {
      const startDate = new Date(date);
      startDate.setHours(9, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setHours(10, 0, 0, 0);

      const eventData = {
        title,
        start_datetime: startDate.toISOString(),
        end_datetime: endDate.toISOString(),
        category: '个人',
        color: '#3498db'
      };

      const response = await api.post('/calendar/events', eventData);

      // 更新本地状态
      setCalendarEvents(prev => [...prev, response.data.event]);

      return response.data.event;
    } catch (err) {
      setError('创建事件失败');
      console.error('创建事件失败:', err);
    }
  };

  // 删除事件
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('确定要删除这个事件吗？')) return;

    try {
      await api.delete(`/calendar/events/${eventId}`);

      // 更新本地状态
      setCalendarEvents(prev => prev.filter(event => event.id !== eventId));

      // 显示成功消息
      setError('');
    } catch (err) {
      setError('删除事件失败');
      console.error('删除事件失败:', err);
    }
  };

  // 获取指定日期的事件
  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.start_datetime).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  // 格式化标题
  const getTitle = () => {
    const options = { year: 'numeric', month: 'long' };
    switch (view) {
      case 'week':
        const { startDate, endDate } = getWeekRange(currentDate);
        return `${startDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}`;
      case 'day':
        return currentDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
      default:
        return currentDate.toLocaleDateString('zh-CN', options);
    }
  };

  // 渲染月视图
  const renderMonthView = () => {
    const { startDate, endDate, firstDay, lastDay } = getMonthRange(currentDate);
    const days = [];
    const currentDateObj = new Date(startDate);

    while (currentDateObj <= endDate) {
      const date = new Date(currentDateObj);
      const isCurrentMonth = date.getMonth() === currentDate.getMonth();
      const isToday = date.toDateString() === new Date().toDateString();
      const dayEvents = getEventsForDate(date);

      days.push(
        <div
          key={date.toISOString()}
          className={`calendar-day ${isCurrentMonth ? 'current-month' : 'other-month'} ${isToday ? 'today' : ''} ${dragOverDate && dragOverDate.toDateString() === date.toDateString() ? 'drag-over' : ''}`}
          onClick={() => onDateClick && onDateClick(date)}
          onDragOver={(e) => handleDragOver(e, date)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, date)}
          onDoubleClick={() => handleQuickCreate(date)}
        >
          <div className="day-number">{date.getDate()}</div>
          <div className="day-events">
            {dayEvents.slice(0, 3).map((event, index) => (
              <div
                key={event.id || index}
                className="event-item"
                style={{ backgroundColor: event.color || '#3498db' }}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, event)}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick && onEventClick(event);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleDeleteEvent(event.id);
                }}
                title={`${event.title} (拖拽移动，右键删除)`}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="more-events" onClick={(e) => {
                e.stopPropagation();
                // 可以显示更多事件的弹窗
              }}>
                +{dayEvents.length - 3} 更多
              </div>
            )}
          </div>
        </div>
      );

      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }

    return (
      <div className="calendar-month-view">
        <div className="calendar-weekdays">
          {['日', '一', '二', '三', '四', '五', '六'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        <div className="calendar-days">
          {days}
        </div>
      </div>
    );
  };

  // 渲染周视图
  const renderWeekView = () => {
    const { startDate, endDate } = getWeekRange(currentDate);
    const days = [];
    const currentDateObj = new Date(startDate);

    while (currentDateObj <= endDate) {
      const date = new Date(currentDateObj);
      const isToday = date.toDateString() === new Date().toDateString();
      const dayEvents = getEventsForDate(date);

      days.push(
        <div
          key={date.toISOString()}
          className={`calendar-week-day ${isToday ? 'today' : ''}`}
          onClick={() => onDateClick && onDateClick(date)}
        >
          <div className="week-day-header">
            <div className="weekday-name">
              {date.toLocaleDateString('zh-CN', { weekday: 'short' })}
            </div>
            <div className="day-number">{date.getDate()}</div>
          </div>
          <div className="week-day-events">
            {dayEvents.map((event, index) => (
              <div
                key={event.id || index}
                className="week-event-item"
                style={{ backgroundColor: event.color || '#3498db' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick && onEventClick(event);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleDeleteEvent(event.id);
                }}
                title={`${event.title} (右键删除)`}
              >
                <div className="event-time">
                  {new Date(event.start_datetime).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="event-title">{event.title}</div>
              </div>
            ))}
          </div>
        </div>
      );

      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }

    return (
      <div className="calendar-week-view">
        {days}
      </div>
    );
  };

  // 渲染日视图
  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="calendar-day-view">
        <div className="day-view-header">
          <h3>{currentDate.toLocaleDateString('zh-CN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</h3>
        </div>
        <div className="day-view-content">
          <div className="time-slots">
            {hours.map(hour => (
              <div key={hour} className="time-slot">
                <div className="time-label">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="time-content">
                  {dayEvents
                    .filter(event => new Date(event.start_datetime).getHours() === hour)
                    .map((event, index) => (
                      <div
                        key={event.id || index}
                        className="day-event-item"
                        style={{ backgroundColor: event.color || '#3498db' }}
                        onClick={() => onEventClick && onEventClick(event)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          handleDeleteEvent(event.id);
                        }}
                        title={`${event.title} (右键删除)`}
                      >
                        <div className="event-time">
                          {new Date(event.start_datetime).toLocaleTimeString('zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} -
                          {new Date(event.end_datetime).toLocaleTimeString('zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="event-title">{event.title}</div>
                        {event.description && (
                          <div className="event-description">{event.description}</div>
                        )}
                      </div>
                    ))
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-container">
      {/* 日历头部 */}
      <div className="calendar-header">
        <div className="calendar-navigation">
          <button className="nav-btn" onClick={navigatePrevious}>
            ‹
          </button>
          <button className="nav-btn today-btn" onClick={navigateToday}>
            今天
          </button>
          <button className="nav-btn" onClick={navigateNext}>
            ›
          </button>
        </div>
        
        <h2 className="calendar-title">{getTitle()}</h2>
        
        {onEventCreate && (
          <button className="create-event-btn" onClick={onEventCreate}>
            + 新建事件
          </button>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="calendar-error">
          {error}
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="calendar-loading">
          加载中...
        </div>
      )}

      {/* 日历内容 */}
      <div className="calendar-content">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
      </div>
    </div>
  );
};

export default Calendar;

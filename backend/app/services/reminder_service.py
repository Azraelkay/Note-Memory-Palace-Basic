"""
日历事件提醒服务
"""
from datetime import datetime, timedelta
from app import db
from app.models.calendar import CalendarEvent
from app.models.user import User
import logging

logger = logging.getLogger(__name__)

class ReminderService:
    """提醒服务类"""
    
    @staticmethod
    def get_pending_reminders():
        """获取需要发送提醒的事件"""
        try:
            now = datetime.now()
            
            # 查询所有启用提醒且即将到来的事件
            events = CalendarEvent.query.filter(
                CalendarEvent.reminder_enabled == True,
                CalendarEvent.is_deleted == False,
                CalendarEvent.start_datetime > now
            ).all()
            
            pending_reminders = []
            
            for event in events:
                # 计算提醒时间
                reminder_time = event.start_datetime - timedelta(minutes=event.reminder_minutes)
                
                # 检查是否到了提醒时间（允许1分钟的误差）
                time_diff = abs((now - reminder_time).total_seconds())
                
                if time_diff <= 60:  # 1分钟内的误差
                    pending_reminders.append({
                        'event_id': event.id,
                        'user_id': event.user_id,
                        'title': event.title,
                        'description': event.description,
                        'start_datetime': event.start_datetime.isoformat(),
                        'location': event.location,
                        'reminder_minutes': event.reminder_minutes,
                        'reminder_time': reminder_time.isoformat(),
                        'category': event.category,
                        'priority': event.priority
                    })
            
            return pending_reminders
            
        except Exception as e:
            logger.error(f"获取待提醒事件失败: {str(e)}")
            return []
    
    @staticmethod
    def get_user_pending_reminders(user_id):
        """获取特定用户的待提醒事件"""
        try:
            now = datetime.now()
            
            # 查询用户的启用提醒且即将到来的事件
            events = CalendarEvent.query.filter(
                CalendarEvent.user_id == user_id,
                CalendarEvent.reminder_enabled == True,
                CalendarEvent.is_deleted == False,
                CalendarEvent.start_datetime > now
            ).all()
            
            pending_reminders = []
            
            for event in events:
                # 计算提醒时间
                reminder_time = event.start_datetime - timedelta(minutes=event.reminder_minutes)
                
                # 检查是否到了提醒时间（允许2分钟的误差，给前端轮询留出时间）
                time_diff = (now - reminder_time).total_seconds()
                
                # 如果当前时间在提醒时间之后2分钟内，认为需要提醒
                if 0 <= time_diff <= 120:  # 2分钟内
                    pending_reminders.append({
                        'event_id': event.id,
                        'title': event.title,
                        'description': event.description,
                        'start_datetime': event.start_datetime.isoformat(),
                        'location': event.location,
                        'reminder_minutes': event.reminder_minutes,
                        'reminder_time': reminder_time.isoformat(),
                        'category': event.category,
                        'priority': event.priority,
                        'color': event.color,
                        'time_until_event': int((event.start_datetime - now).total_seconds() / 60)  # 距离事件开始的分钟数
                    })
            
            return pending_reminders
            
        except Exception as e:
            logger.error(f"获取用户 {user_id} 的待提醒事件失败: {str(e)}")
            return []
    
    @staticmethod
    def get_upcoming_events_for_user(user_id, hours_ahead=24):
        """获取用户即将到来的事件（用于提前预览）"""
        try:
            now = datetime.now()
            end_time = now + timedelta(hours=hours_ahead)
            
            events = CalendarEvent.query.filter(
                CalendarEvent.user_id == user_id,
                CalendarEvent.is_deleted == False,
                CalendarEvent.start_datetime >= now,
                CalendarEvent.start_datetime <= end_time
            ).order_by(CalendarEvent.start_datetime).all()
            
            upcoming_events = []
            
            for event in events:
                event_data = {
                    'event_id': event.id,
                    'title': event.title,
                    'description': event.description,
                    'start_datetime': event.start_datetime.isoformat(),
                    'end_datetime': event.end_datetime.isoformat(),
                    'location': event.location,
                    'category': event.category,
                    'priority': event.priority,
                    'color': event.color,
                    'reminder_enabled': event.reminder_enabled,
                    'reminder_minutes': event.reminder_minutes,
                    'time_until_event': int((event.start_datetime - now).total_seconds() / 60)
                }
                
                # 如果启用了提醒，计算提醒时间
                if event.reminder_enabled:
                    reminder_time = event.start_datetime - timedelta(minutes=event.reminder_minutes)
                    event_data['reminder_time'] = reminder_time.isoformat()
                    event_data['time_until_reminder'] = int((reminder_time - now).total_seconds() / 60)
                
                upcoming_events.append(event_data)
            
            return upcoming_events
            
        except Exception as e:
            logger.error(f"获取用户 {user_id} 的即将到来事件失败: {str(e)}")
            return []
    
    @staticmethod
    def mark_reminder_sent(event_id, user_id):
        """标记提醒已发送（可以用于避免重复提醒）"""
        try:
            # 这里可以实现提醒发送记录，避免重复提醒
            # 暂时简单记录日志
            logger.info(f"提醒已发送 - 事件ID: {event_id}, 用户ID: {user_id}")
            return True
        except Exception as e:
            logger.error(f"标记提醒发送状态失败: {str(e)}")
            return False

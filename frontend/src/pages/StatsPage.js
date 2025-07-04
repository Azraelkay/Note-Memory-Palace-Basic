import React from 'react';
import VipUpgradePrompt from '../components/VipUpgradePrompt';

const StatsPage = () => {
  return (
    <VipUpgradePrompt
      featureName="数据统计"
      featureIcon="📊"
      description="分析笔记数据，提供写作统计和使用习惯分析"
      features={[
        '写作统计分析',
        '使用习惯追踪',
        '趋势图表展示',
        '数据报告生成',
        '效率分析',
        '目标设定与跟踪'
      ]}
    />
  );
};

/* 原始代码保留作为注释，以便将来VIP版本使用
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getStatsOverview,
  getStatsProductivity,
  getStatsTrends,
  getNotesStats
} from '../services/api';
import { LineChart, BarChart, PieChart, TrendChart } from '../components/Chart';
import '../styles/stats.css';

const StatsPage = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 统计数据状态
  const [overviewData, setOverviewData] = useState(null);
  const [productivityData, setProductivityData] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [notesData, setNotesData] = useState(null);
  
  // 筛选状态
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedDays, setSelectedDays] = useState(30);

  // 获取统计数据
  const fetchStatsData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 并行获取所有统计数据
      const [overview, productivity, trends, notes] = await Promise.all([
        getStatsOverview({ days: selectedDays }),
        getStatsProductivity({ period: selectedPeriod }),
        getStatsTrends({ days: selectedDays }),
        getNotesStats({ days: selectedDays })
      ]);
      
      setOverviewData(overview);
      setProductivityData(productivity);
      setTrendsData(trends);
      setNotesData(notes);
      
    } catch (err) {
      setError('获取统计数据失败');
      console.error('获取统计数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStatsData();
    }
  }, [isAuthenticated, selectedPeriod, selectedDays]);

  // 渲染统计卡片
  const renderStatCard = (title, value, subtitle, icon, color = 'blue') => (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-icon">
        <span>{icon}</span>
      </div>
      <div className="stat-content">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-title">{title}</p>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      </div>
    </div>
  );

  // 渲染总览统计
  const renderOverviewStats = () => {
    if (!overviewData) return null;
    
    const { totals, recent } = overviewData;
    
    return (
      <div className="stats-section">
        <h2 className="section-title">📊 数据总览</h2>
        <div className="stats-grid">
          {renderStatCard('总笔记数', totals.notes, `最近${selectedDays}天新增 ${recent.notes} 篇`, '📝', 'blue')}
          {renderStatCard('看板数量', totals.boards, `包含 ${totals.cards} 张卡片`, '📋', 'green')}
          {renderStatCard('日历事件', totals.events, `即将到来 ${recent.upcoming_events} 个`, '📅', 'purple')}
          {renderStatCard('自定义模板', totals.templates, `使用次数 ${recent.template_usage}`, '📄', 'orange')}
        </div>
      </div>
    );
  };

  // 渲染生产力统计
  const renderProductivityStats = () => {
    if (!productivityData) return null;
    
    const { writing, tasks, schedule } = productivityData;
    
    return (
      <div className="stats-section">
        <h2 className="section-title">🚀 生产力分析</h2>
        <div className="stats-grid">
          {renderStatCard('写作产出', `${writing.total_words} 字`, `平均每天 ${writing.avg_words_per_day} 字`, '✍️', 'blue')}
          {renderStatCard('任务完成率', `${tasks.completion_rate}%`, `完成 ${tasks.completed_cards}/${tasks.total_cards} 个任务`, '✅', 'green')}
          {renderStatCard('日程安排', schedule.scheduled_events, `平均每天 ${schedule.avg_events_per_day} 个事件`, '⏰', 'purple')}
          {renderStatCard('笔记频率', `${writing.avg_notes_per_day}/天`, `共创建 ${writing.total_notes} 篇笔记`, '📈', 'orange')}
        </div>
      </div>
    );
  };

  // 渲染活跃度图表
  const renderActivityChart = () => {
    if (!overviewData?.weekly_activity) return null;
    
    const maxActivity = Math.max(...overviewData.weekly_activity.map(day => day.total));
    
    return (
      <div className="stats-section">
        <h2 className="section-title">📈 最近7天活跃度</h2>
        <div className="activity-chart">
          {overviewData.weekly_activity.map((day, index) => (
            <div key={index} className="activity-day">
              <div className="activity-bar-container">
                <div 
                  className="activity-bar"
                  style={{ 
                    height: maxActivity > 0 ? `${(day.total / maxActivity) * 100}%` : '0%' 
                  }}
                >
                  <div className="activity-notes" style={{ height: `${day.notes / (day.total || 1) * 100}%` }}></div>
                  <div className="activity-events" style={{ height: `${day.events / (day.total || 1) * 100}%` }}></div>
                </div>
                <span className="activity-count">{day.total}</span>
              </div>
              <div className="activity-label">
                <span className="day-name">{day.day_name.slice(0, 3)}</span>
                <span className="day-date">{new Date(day.date).getDate()}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="activity-legend">
          <div className="legend-item">
            <span className="legend-color notes"></span>
            <span>笔记</span>
          </div>
          <div className="legend-item">
            <span className="legend-color events"></span>
            <span>事件</span>
          </div>
        </div>
      </div>
    );
  };

  // 渲染分类分布
  const renderCategoryDistribution = () => {
    if (!notesData?.category_distribution) return null;

    const categories = notesData.category_distribution.slice(0, 5); // 只显示前5个
    const total = categories.reduce((sum, cat) => sum + cat.count, 0);

    return (
      <div className="stats-section">
        <h2 className="section-title">🏷️ 分类分布</h2>
        <div className="charts-container">
          <div className="distribution-chart">
            {categories.map((category, index) => {
              const percentage = total > 0 ? (category.count / total * 100) : 0;
              return (
                <div key={index} className="distribution-item">
                  <div className="distribution-info">
                    <span className="category-name">{category.name}</span>
                    <span className="category-count">{category.count} 篇</span>
                  </div>
                  <div className="distribution-bar">
                    <div
                      className="distribution-fill"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="distribution-percentage">{percentage.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>

          {/* 饼图展示 */}
          <div className="pie-chart-section">
            <PieChart
              data={categories.map(cat => ({ label: cat.name, value: cat.count }))}
              width={250}
              height={250}
            />
          </div>
        </div>
      </div>
    );
  };

  // 渲染趋势图表
  const renderTrendsChart = () => {
    if (!trendsData?.trends) return null;

    return (
      <div className="stats-section">
        <h2 className="section-title">📈 创建趋势</h2>
        <div className="trend-chart-container">
          <TrendChart
            data={trendsData.trends}
            width={800}
            height={300}
          />
          <div className="trend-legend">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#3b82f6' }}></span>
              <span>笔记创建</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#8b5cf6' }}></span>
              <span>事件创建</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染每日创建图表
  const renderDailyCreationChart = () => {
    if (!notesData?.daily_creation) return null;

    const dailyData = Object.entries(notesData.daily_creation)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-7) // 最近7天
      .map(([date, count]) => ({
        label: new Date(date).getDate().toString(),
        value: count
      }));

    return (
      <div className="stats-section">
        <h2 className="section-title">📊 最近7天笔记创建</h2>
        <div className="chart-wrapper">
          <BarChart
            data={dailyData}
            width={600}
            height={250}
            color="#10b981"
          />
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="stats-page">
        <div className="auth-required">
          <h2>请先登录</h2>
          <p>您需要登录后才能查看数据统计</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-page">
      <div className="stats-header">
        <h1>📊 数据统计</h1>
        <p>分析您的笔记数据，了解使用习惯和生产力趋势</p>
        
        {/* 筛选控件 */}
        <div className="stats-filters">
          <div className="filter-group">
            <label>时间周期：</label>
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="filter-select"
            >
              <option value="week">最近一周</option>
              <option value="month">最近一月</option>
              <option value="quarter">最近三月</option>
              <option value="year">最近一年</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>统计天数：</label>
            <select 
              value={selectedDays} 
              onChange={(e) => setSelectedDays(parseInt(e.target.value))}
              className="filter-select"
            >
              <option value={7}>7天</option>
              <option value={30}>30天</option>
              <option value={90}>90天</option>
              <option value={365}>365天</option>
            </select>
          </div>
          
          <button onClick={fetchStatsData} className="refresh-btn">
            🔄 刷新数据
          </button>
        </div>
      </div>

      <div className="stats-content">
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>加载统计数据中...</p>
          </div>
        ) : (
          <>
            {renderOverviewStats()}
            {renderProductivityStats()}
            {renderActivityChart()}
            {renderTrendsChart()}
            {renderDailyCreationChart()}
            {renderCategoryDistribution()}
          </>
        )}
      </div>
    </div>
  );
};

export default StatsPage;

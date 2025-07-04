import React from 'react';

// 简单的折线图组件
export const LineChart = ({ data, width = 400, height = 200, color = '#3b82f6' }) => {
  if (!data || data.length === 0) {
    return <div className="chart-empty">暂无数据</div>;
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  // 计算点的坐标
  const points = data.map((d, index) => {
    const x = (index / (data.length - 1)) * (width - 40) + 20;
    const y = height - 40 - ((d.value - minValue) / range) * (height - 80);
    return { x, y, value: d.value, label: d.label };
  });

  // 生成路径
  const pathData = points.map((p, index) => 
    `${index === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  return (
    <div className="chart-container">
      <svg width={width} height={height} className="line-chart">
        {/* 网格线 */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" opacity="0.5" />
        
        {/* 折线 */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* 数据点 */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill={color}
              stroke="white"
              strokeWidth="2"
            />
            {/* 数值标签 */}
            <text
              x={point.x}
              y={point.y - 10}
              textAnchor="middle"
              fontSize="12"
              fill="#666"
              fontWeight="500"
            >
              {point.value}
            </text>
          </g>
        ))}
        
        {/* X轴标签 */}
        {points.map((point, index) => (
          <text
            key={index}
            x={point.x}
            y={height - 10}
            textAnchor="middle"
            fontSize="10"
            fill="#999"
          >
            {point.label}
          </text>
        ))}
      </svg>
    </div>
  );
};

// 简单的柱状图组件
export const BarChart = ({ data, width = 400, height = 200, color = '#10b981' }) => {
  if (!data || data.length === 0) {
    return <div className="chart-empty">暂无数据</div>;
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = (width - 40) / data.length * 0.8;
  const barSpacing = (width - 40) / data.length * 0.2;

  return (
    <div className="chart-container">
      <svg width={width} height={height} className="bar-chart">
        {/* 网格线 */}
        <defs>
          <pattern id="bar-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bar-grid)" opacity="0.3" />
        
        {/* 柱状图 */}
        {data.map((d, index) => {
          const barHeight = (d.value / maxValue) * (height - 80);
          const x = 20 + index * (barWidth + barSpacing) + barSpacing / 2;
          const y = height - 40 - barHeight;
          
          return (
            <g key={index}>
              {/* 柱子 */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                rx="4"
                ry="4"
              />
              
              {/* 数值标签 */}
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                fontSize="12"
                fill="#666"
                fontWeight="500"
              >
                {d.value}
              </text>
              
              {/* X轴标签 */}
              <text
                x={x + barWidth / 2}
                y={height - 10}
                textAnchor="middle"
                fontSize="10"
                fill="#999"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// 简单的饼图组件
export const PieChart = ({ data, width = 200, height = 200 }) => {
  if (!data || data.length === 0) {
    return <div className="chart-empty">暂无数据</div>;
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 20;
  
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
  ];

  let currentAngle = -Math.PI / 2; // 从顶部开始

  const slices = data.map((d, index) => {
    const sliceAngle = (d.value / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    currentAngle = endAngle;
    
    return {
      path: pathData,
      color: colors[index % colors.length],
      percentage: ((d.value / total) * 100).toFixed(1),
      label: d.label,
      value: d.value
    };
  });

  return (
    <div className="chart-container">
      <div className="pie-chart-wrapper">
        <svg width={width} height={height} className="pie-chart">
          {slices.map((slice, index) => (
            <path
              key={index}
              d={slice.path}
              fill={slice.color}
              stroke="white"
              strokeWidth="2"
            />
          ))}
        </svg>
        
        {/* 图例 */}
        <div className="pie-legend">
          {slices.map((slice, index) => (
            <div key={index} className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: slice.color }}
              ></div>
              <span className="legend-label">
                {slice.label} ({slice.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 趋势图组件（带区域填充的折线图）
export const TrendChart = ({ data, width = 600, height = 300 }) => {
  if (!data || data.length === 0) {
    return <div className="chart-empty">暂无数据</div>;
  }

  const maxValue = Math.max(...data.map(d => Math.max(d.notes || 0, d.events || 0)));
  const minValue = 0;
  const range = maxValue - minValue || 1;

  // 计算点的坐标
  const notesPoints = data.map((d, index) => {
    const x = (index / (data.length - 1)) * (width - 60) + 30;
    const y = height - 60 - ((d.notes - minValue) / range) * (height - 120);
    return { x, y, value: d.notes };
  });

  const eventsPoints = data.map((d, index) => {
    const x = (index / (data.length - 1)) * (width - 60) + 30;
    const y = height - 60 - ((d.events - minValue) / range) * (height - 120);
    return { x, y, value: d.events };
  });

  // 生成路径
  const notesPath = notesPoints.map((p, index) => 
    `${index === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  const eventsPath = eventsPoints.map((p, index) => 
    `${index === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  return (
    <div className="chart-container">
      <svg width={width} height={height} className="trend-chart">
        {/* 网格线 */}
        <defs>
          <pattern id="trend-grid" width="50" height="30" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 30" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#trend-grid)" />
        
        {/* 笔记趋势线 */}
        <path
          d={notesPath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* 事件趋势线 */}
        <path
          d={eventsPath}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* 数据点 */}
        {notesPoints.map((point, index) => (
          <circle
            key={`notes-${index}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#3b82f6"
            stroke="white"
            strokeWidth="2"
          />
        ))}
        
        {eventsPoints.map((point, index) => (
          <circle
            key={`events-${index}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#8b5cf6"
            stroke="white"
            strokeWidth="2"
          />
        ))}
        
        {/* X轴标签 */}
        {data.map((d, index) => {
          const x = (index / (data.length - 1)) * (width - 60) + 30;
          return (
            <text
              key={index}
              x={x}
              y={height - 20}
              textAnchor="middle"
              fontSize="10"
              fill="#999"
            >
              {new Date(d.date).getDate()}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

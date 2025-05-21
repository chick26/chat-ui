import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './style.css';

// 图表类型
type ChartType = 'table' | 'line' | 'pie';

// 表格数据类型
interface TableData {
  headers: string[];
  rows: (string | number)[][];
}

// 图表数据类型
interface ChartData {
  labels: string[];
  values: number[];
}

// 组件属性类型
interface CableResponseProps {
  sql: string;
  tableData?: TableData;
  lineChartData?: ChartData;
  pieChartData?: ChartData;
  textAnswer: string;
}

const CableResponse: React.FC<CableResponseProps> = ({
  sql,
  tableData,
  lineChartData,
  pieChartData,
  textAnswer,
}) => {
  // 当前选中的图表类型
  const [activeChart, setActiveChart] = useState<ChartType>('table');

  // 渲染表格
  const renderTable = () => {
    if (!tableData) return <div className="no-data">暂无数据</div>;

    return (
      <div className="table-container">
        <table className="cable-table">
          <thead>
            <tr>
              {tableData.headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // 渲染折线图（简化版，实际项目中可使用Chart.js等库）
  const renderLineChart = () => {
    if (!lineChartData) return <div className="no-data">暂无折线图数据</div>;

    const maxValue = Math.max(...lineChartData.values);
    
    return (
      <div className="chart-container">
        <div className="line-chart">
          {lineChartData.values.map((value, index) => (
            <div key={index} className="line-chart-item">
              <div 
                className="line-chart-bar" 
                style={{ height: `${(value / maxValue) * 100}%` }}
              />
              <div className="line-chart-label">{lineChartData.labels[index]}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 渲染饼图（简化版，实际项目中可使用Chart.js等库）
  const renderPieChart = () => {
    if (!pieChartData) return <div className="no-data">暂无饼图数据</div>;

    const total = pieChartData.values.reduce((sum, value) => sum + value, 0);
    let currentAngle = 0;

    return (
      <div className="chart-container">
        <div className="pie-chart">
          <svg viewBox="0 0 100 100">
            {pieChartData.values.map((value, index) => {
              const percentage = value / total;
              const startAngle = currentAngle;
              currentAngle += percentage * 360;
              const endAngle = currentAngle;
              
              const x1 = 50 + 50 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 50 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 50 * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 50 + 50 * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = percentage > 0.5 ? 1 : 0;
              
              const pathData = `
                M 50 50
                L ${x1} ${y1}
                A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2}
                Z
              `;
              
              const colors = ['#3366CC', '#DC3912', '#FF9900', '#109618', '#990099', '#3B3EAC', '#0099C6', '#DD4477'];
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={colors[index % colors.length]}
                />
              );
            })}
          </svg>
          <div className="pie-legend">
            {pieChartData.labels.map((label, index) => (
              <div key={index} className="pie-legend-item">
                <div 
                  className="pie-legend-color" 
                  style={{ backgroundColor: ['#3366CC', '#DC3912', '#FF9900', '#109618', '#990099', '#3B3EAC', '#0099C6', '#DD4477'][index % 8] }}
                />
                <div className="pie-legend-label">
                  {label}: {Math.round((pieChartData.values[index] / total) * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // 根据当前选择的图表类型渲染对应图表
  const renderActiveChart = () => {
    switch (activeChart) {
      case 'table':
        return renderTable();
      case 'line':
        return renderLineChart();
      case 'pie':
        return renderPieChart();
      default:
        return null;
    }
  };

  return (
    <div className="cable-response">
      {/* SQL部分 */}
      <div className="sql-container">
        <div className="sql-title">SQL语句</div>
        <div className="sql-content">
          <ReactMarkdown>
            {`\`\`\`sql\n${sql}\n\`\`\``}
          </ReactMarkdown>
        </div>
      </div>
      
      {/* 图表部分 */}
      <div className="chart-section">
        <div className="chart-tabs">
          <button 
            className={`chart-tab ${activeChart === 'table' ? 'active' : ''}`}
            onClick={() => setActiveChart('table')}
          >
            表格
          </button>
          <button 
            className={`chart-tab ${activeChart === 'line' ? 'active' : ''}`}
            onClick={() => setActiveChart('line')}
          >
            折线图
          </button>
          <button 
            className={`chart-tab ${activeChart === 'pie' ? 'active' : ''}`}
            onClick={() => setActiveChart('pie')}
          >
            饼图
          </button>
        </div>
        <div className="chart-content">
          {renderActiveChart()}
        </div>
      </div>
      
      {/* 文本回答部分 */}
      <div className="text-answer">
        {textAnswer}
      </div>
    </div>
  );
};

export default CableResponse; 
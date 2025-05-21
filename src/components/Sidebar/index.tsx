import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot } from '../../data/bots';
import './style.css';

interface SidebarProps {
  bots: Bot[];
  activeBotId: string;
  onSelectBot: (botId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ bots, activeBotId, onSelectBot }) => {
  const [collapsed, setCollapsed] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const closeSidebar = () => {
    setCollapsed(true);
  };

  const handleBotSelect = (botId: string) => {
    onSelectBot(botId);
    setCollapsed(true); // 选择后自动折叠侧边栏
    navigate(`/chat/${botId}`);
  };

  // 图标映射，根据bot.icon获取对应的图标名
  const getIconClass = (iconName?: string) => {
    if (!iconName) return 'icon-robot';
    return `icon-${iconName}`;
  };

  return (
    <>
      <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-toggle" onClick={toggleSidebar}>
          <i className={`icon ${collapsed ? 'icon-menu' : 'icon-close'}`}></i>
        </div>
        <div className="sidebar-header">
          <h3>选择场景</h3>
        </div>
        <div className="sidebar-content">
          <ul className="bot-list">
            {bots.map((bot) => (
              <li 
                key={bot.id} 
                className={`bot-item ${bot.id === activeBotId ? 'active' : ''}`}
                onClick={() => handleBotSelect(bot.id)}
              >
                <div className="bot-icon">
                  <i className={getIconClass(bot.icon)}></i>
                </div>
                <div className="bot-info">
                  <div className="bot-name">{bot.name}</div>
                  <div className="bot-description">{bot.description}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* 背景遮罩层，点击时关闭侧边栏 */}
      <div 
        className="sidebar-overlay" 
        onClick={closeSidebar}
      ></div>
    </>
  );
};

export default Sidebar; 
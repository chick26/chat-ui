import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import ChatWindow from '../../components/ChatWindow';
import { 
  bots, 
  getBotById, 
  getExamplesByBotId, 
  getDefaultBotId 
} from '../../data/bots';
import './style.css';

const Main: React.FC = () => {
  const { botId } = useParams<{ botId: string }>();
  const navigate = useNavigate();
  const [activeBotId, setActiveBotId] = useState<string>(botId || getDefaultBotId());

  // 如果URL中没有botId，默认使用第一个机器人
  useEffect(() => {
    if (!botId) {
      navigate(`/chat/${getDefaultBotId()}`);
    } else {
      setActiveBotId(botId);
    }
  }, [botId, navigate]);

  // 获取当前机器人数据
  const activeBot = getBotById(activeBotId);
  const examples = getExamplesByBotId(activeBotId);

  // 如果没有找到机器人，重定向到默认机器人
  if (!activeBot) {
    navigate(`/chat/${getDefaultBotId()}`);
    return null;
  }

  // 处理机器人选择
  const handleSelectBot = (botId: string) => {
    setActiveBotId(botId);
  };

  return (
    <div className="main-page">
      <Sidebar 
        bots={bots} 
        activeBotId={activeBotId} 
        onSelectBot={handleSelectBot} 
      />
      <div className="main-content">
        <ChatWindow
          key={`chat-window-${activeBotId}`}
          botName={activeBot.name}
          botId={activeBot.id}
          examples={examples}
        />
      </div>
    </div>
  );
};

export default Main; 
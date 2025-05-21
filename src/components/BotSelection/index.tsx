import React from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

export interface Bot {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

interface BotSelectionProps {
  bots: Bot[];
}

const BotSelection: React.FC<BotSelectionProps> = ({ bots }) => {
  const navigate = useNavigate();

  const handleBotSelect = (botId: string) => {
    navigate(`/chat/${botId}`);
  };

  return (
    <div className="bot-selection">
      <h2 className="bot-selection-title">选择对话场景</h2>
      <div className="bot-list">
        {bots.map((bot) => (
          <div
            key={bot.id}
            className="bot-item"
            onClick={() => handleBotSelect(bot.id)}
          >
            <div className="bot-icon">
              {bot.icon ? (
                <img src={bot.icon} alt={bot.name} />
              ) : (
                <div className="bot-icon-placeholder">{bot.name.charAt(0)}</div>
              )}
            </div>
            <div className="bot-info">
              <h3 className="bot-name">{bot.name}</h3>
              <p className="bot-description">{bot.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BotSelection; 
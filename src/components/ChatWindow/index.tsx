import React, { useRef, useEffect, useState } from 'react';
import Chat, { Bubble, useMessages, QuickReplyItemProps, Toast } from '@chatui/core';
import '@chatui/core/es/styles/index.less';
import '@chatui/core/dist/index.css';
import './style.css';
import { ChatExample } from '../../data/bots';
import CableResponse from '../CableResponse';
import MaintenanceResponse from '../MaintenanceResponse';
import RouteResponse from '../RouteResponse';
import { mockSendMessage } from '../../mock/chatResponses';

interface ChatWindowProps {
  botName: string;
  botId: string;
  examples?: ChatExample[];
}

// 存储每个机器人的消息历史
const messageHistories: Record<string, any[]> = {};

// 标记哪些机器人已经显示过欢迎消息
const welcomeMessageSent: Record<string, boolean> = {};

// 使用 JavaScript 默认参数语法而不是 defaultProps
const ChatWindow: React.FC<ChatWindowProps> = ({ botName, botId, examples = [] }) => {
  // Toast 状态
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  
  // 场景名称映射
  const sceneNameMap: Record<string, string> = {
    'route': '路由方案生成',
    'cable': '海缆故障问答',
    'maintenance': '运维规程问答'
  };
  
  // 获取场景名称
  const sceneName = sceneNameMap[botId] || botName;
  
  // 如果没有该机器人的历史记录，初始化一个空数组
  if (!messageHistories[botId]) {
    messageHistories[botId] = [];
    welcomeMessageSent[botId] = false;
  }
  
  // 创建对聊天容器的引用
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // 使用该机器人的历史记录初始化消息状态
  const { messages, appendMsg, resetList } = useMessages(messageHistories[botId]);
  
  // 添加欢迎消息（仅在首次）
  useEffect(() => {
    // 仅当该机器人没有消息且未发送过欢迎消息时，添加欢迎消息
    if (messageHistories[botId].length === 0 && !welcomeMessageSent[botId]) {
      welcomeMessageSent[botId] = true;
      
      setTimeout(() => {
        // 添加欢迎消息
        const welcomeMsg = {
          type: 'text',
          content: { text: `您好，我是${botName}助手，请问有什么可以帮助您？` },
        };
        
        appendMsg(welcomeMsg);
        // 手动更新历史记录（因为useEffect还没有触发）
        messageHistories[botId] = [{...welcomeMsg, _id: Date.now().toString()}];
      }, 50);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // 当消息变化时更新历史记录
  useEffect(() => {
    messageHistories[botId] = [...messages];
  }, [messages, botId]);
  
  // 清空历史记录功能
  const handleClearHistory = () => {
    setShowConfirm(true);
  };

  // 确认清空历史
  const confirmClear = () => {
    // 重置消息列表
    resetList();
    // 清空历史记录
    messageHistories[botId] = [];
    // 重置欢迎消息状态
    welcomeMessageSent[botId] = false;
    
    // 隐藏确认框
    setShowConfirm(false);
    
    // 显示成功提示
    setToastText('聊天记录已清空');
    setShowToast(true);
    
    // 添加欢迎消息
    setTimeout(() => {
      const welcomeMsg = {
        type: 'text',
        content: { text: `您好，我是${botName}助手，请问有什么可以帮助您？` },
      };
      
      appendMsg(welcomeMsg);
      // 手动更新历史记录
      messageHistories[botId] = [{...welcomeMsg, _id: Date.now().toString()}];
      welcomeMessageSent[botId] = true;
    }, 50);
  };
  
  // 转换示例问题为快速回复格式
  const quickReplies = React.useMemo(() => {
    return examples.map((example, index) => ({
      name: example.text,
      code: String(index),
      isNew: false,
      isHighlight: false,
    }));
  }, [examples]);

  // 处理消息发送
  const handleSend = async (type: string, val: string) => {
    if (type === 'text' && val.trim()) {
      // 添加用户消息
      appendMsg({
        type: 'text',
        content: { text: val },
        position: 'right',
      });
      

      try {
        // 调用API获取回复
        const response = await mockSendMessage(botId, val);
        
        // 添加机器人回复
        appendMsg({
          type: response.type,
          content: response.content,
        });

      } catch (error) {
        appendMsg({
          type: 'text',
          content: { text: '抱歉，服务出现了问题，请稍后再试。' },
        });
        
      }
    }
  };

  // 处理示例问题点击
  const handleQuickReplyClick = (item: QuickReplyItemProps) => {
    const example = examples[Number(item.code)];
    if (example && example.onClick) {
      example.onClick();
    } else {
      handleSend('text', item.name);
    }
  };

  // 渲染消息内容
  const renderMessageContent = (msg: any) => {
    const { type, content } = msg;
    
    if (type === 'text') {
      return <Bubble content={content.text} />;
    }
    
    if (type === 'image') {
      return (
        <Bubble type="image">
          <img src={content.picUrl} alt={content.alt || '图片'} />
        </Bubble>
      );
    }
    
    if (type === 'route') {
      return (
        <Bubble type="text">
          <RouteResponse 
            picUrl={content.picUrl}
            alt={content.alt}
            text={content.text}
            downloadUrl={content.downloadUrl}
          />
        </Bubble>
      );
    }
    
    if (type === 'cable') {
      return (
        <Bubble type="text">
          <CableResponse 
            sql={content.sql}
            tableData={content.tableData}
            lineChartData={content.lineChartData}
            pieChartData={content.pieChartData}
            textAnswer={content.textAnswer}
          />
        </Bubble>
      );
    }
    
    if (type === 'maintenance') {
      return (
        <Bubble type="text">
          <MaintenanceResponse 
            answer={content.answer}
            references={content.references}
          />
        </Bubble>
      );
    }
    
    return <Bubble content="不支持的消息类型" />;
  };

  return (
    <div className="chat-window" ref={chatContainerRef}>
      <Chat
        navbar={{ 
          title: sceneName,
          rightContent: [
            { 
              icon: 'x-circle-fill',
              onClick: handleClearHistory 
            }
          ]
        }}
        messages={messages}
        renderMessageContent={renderMessageContent}
        quickReplies={quickReplies}
        onQuickReplyClick={handleQuickReplyClick}
        onSend={handleSend}
        loadMoreText="加载更多"
        placeholder="请输入消息..."
        locale="zh-CN"
      />
      
      {/* Toast 提示 */}
      {showToast && (
        <Toast content={toastText} duration={2000} />
      )}
      
      {/* 确认对话框 */}
      {showConfirm && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <div className="confirm-modal-title">确认操作</div>
            <div className="confirm-modal-content">
              确定要清空所有聊天记录吗？此操作不可恢复。
            </div>
            <div className="confirm-modal-actions">
              <button 
                className="confirm-modal-btn confirm-modal-btn-cancel" 
                onClick={() => setShowConfirm(false)}
              >
                取消
              </button>
              <button 
                className="confirm-modal-btn confirm-modal-btn-confirm" 
                onClick={confirmClear}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow; 
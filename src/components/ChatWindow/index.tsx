import React, { useRef, useEffect, useState } from 'react';
import Chat, { useMessages, QuickReplyItemProps, Toast } from '@chatui/core';
import { MarkdownBubble } from '../Markdown';
import '@chatui/core/es/styles/index.less';
import '@chatui/core/dist/index.css';
import './style.css';
import { ChatExample } from '../../data/bots';
import { sendMessage } from '../../services/chatService';
import type { 
  IOnDataMoreInfo, 
  WorkflowStartedResponse, 
  WorkflowFinishedResponse, 
  NodeStartedResponse, 
  NodeFinishedResponse,
  MessageEndResponse 
} from '../../services/chatService';

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
  const [conversationId, setConversationId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const currentMessageIdRef = useRef<string>('');
  const accumulatedTextRef = useRef<string>('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<any>(null);

  
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
  
  // 使用该机器人的历史记录初始化消息状态
  const { messages, appendMsg, resetList, updateMsg } = useMessages(messageHistories[botId]);
  
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
    if (isLoading) return;
    if (type === 'text' && val.trim()) {
      // 发送用户消息
      appendMsg({
        type: 'text',
        content: { text: val },
        position: 'right',
      });

      setIsLoading(true);
      accumulatedTextRef.current = ''; // 重置累积文本
      currentMessageIdRef.current = ''; // 重置当前消息ID

      // 创建初始的机器人消息（显示打字状态）
      const initialMsgId = Date.now().toString();
      appendMsg({
        _id: initialMsgId,
        type: 'typing',
      });

      let messageStarted = false;

      try {
        await sendMessage(val, conversationId, {
          // 场景配置
          scenario: botId as any,
          
          // 处理消息数据
          onData: (message: string, isFirstMessage: boolean, moreInfo: IOnDataMoreInfo) => {
            if (moreInfo.errorMessage) {
              console.error('消息错误:', moreInfo.errorMessage);
              setToastText(moreInfo.errorMessage);
              setShowToast(true);
              return;
            }

            if (isFirstMessage && !messageStarted) {
              messageStarted = true;
              currentMessageIdRef.current = moreInfo.messageId;
              accumulatedTextRef.current = message;
              
              // 使用接口返回的message_id替换临时ID，保持原始内容
              updateMsg(initialMsgId, {
                _id: moreInfo.messageId,
                type: 'stream',
                content: { 
                  text: message  // 保持原始内容，让MarkdownBubble组件自行处理
                }
              });
            } else if (message) {
              // 累积文本内容并直接更新显示
              accumulatedTextRef.current += message;
              
              // 直接更新原始内容，让MarkdownBubble组件处理解析
              updateMsg(currentMessageIdRef.current, {
                type: 'stream',
                content: { 
                  text: accumulatedTextRef.current  // 保持原始内容的完整性
                }
              });
            }
          },

          // 工作流开始
          onWorkflowStarted: (workflowStarted: WorkflowStartedResponse) => {
            console.log('工作流已开始:', workflowStarted.task_id);
          },

          // 节点开始处理
          onNodeStarted: (nodeStarted: NodeStartedResponse) => {
            console.log('节点开始处理:', nodeStarted.data.node_type);
          },

          // 节点处理完成
          onNodeFinished: (nodeFinished: NodeFinishedResponse) => {
            console.log('节点处理完成:', nodeFinished.data.node_type, '状态:', nodeFinished.data.status);
          },

          // 工作流完成
          onWorkflowFinished: (workflowFinished: WorkflowFinishedResponse) => {
            console.log('工作流完成，状态:', workflowFinished.data.status);
          },

          // 消息结束
          onMessageEnd: (messageEnd: MessageEndResponse) => {
            setConversationId(messageEnd.conversation_id);
            setIsLoading(false);
            currentMessageIdRef.current = '';
            accumulatedTextRef.current = '';
          },

          // 处理完成
          onCompleted: (hasError?: boolean) => {
            if (hasError) {
              console.error('流式处理出错');
            }
            setIsLoading(false);
            currentMessageIdRef.current = '';
            accumulatedTextRef.current = '';
          },

          // 错误处理
          onError: (msg: string, code?: string) => {
            console.error('发送消息错误:', msg, code);
            setToastText(msg || '服务出现了问题，请稍后再试');
            setShowToast(true);
            
            // 出错时移除机器人消息
            const currentMsgs = [...messages];
            const filteredMsgs = currentMsgs.filter((m: any) => m._id !== initialMsgId);
            resetList();
            filteredMsgs.forEach(msg => appendMsg(msg));
            
            // 添加错误消息
            appendMsg({
              type: 'text',
              content: { text: '抱歉，服务出现了问题，请稍后再试。' },
            });
            
            setIsLoading(false);
            currentMessageIdRef.current = '';
            accumulatedTextRef.current = '';
          }
        });

      } catch (error) {
        console.error('发送消息异常:', error);
        setToastText('发送消息失败，请稍后再试');
        setShowToast(true);
        setIsLoading(false);
        currentMessageIdRef.current = '';
        accumulatedTextRef.current = '';
      }
    }
  };

  // 处理示例问题点击
  const handleQuickReplyClick = (item: QuickReplyItemProps) => {
    handleSend('text', item.name);
  };

  // Markdown 渲染已移到组件内部

  // 渲染消息内容
  const renderMessageContent = (msg: any) => {
    const { type, content } = msg;

    switch (type) {
      case 'text':
        return (
          <MarkdownBubble 
            content={content.text} 
            type="text"
            useInterleavedMode={true}
          />
        );
      case 'stream':
        return (
          <MarkdownBubble 
            content={content.text} 
            type="stream"
            useInterleavedMode={true}
          />
        );
      case 'typing':
        return (
          <MarkdownBubble 
            content="" 
            type="typing" 
            isLoading={true}
          />
        );
      default:
        return null;
    }
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
        messagesRef={messagesRef}
        messages={messages}
        renderMessageContent={renderMessageContent}
        quickReplies={quickReplies}
        onQuickReplyClick={handleQuickReplyClick}
        onSend={handleSend}
        loadMoreText="加载更多"
        placeholder="请输入消息..."
        locale="zh-CN"
        colorScheme="auto"
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
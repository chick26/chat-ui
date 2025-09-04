import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import 'katex/dist/katex.min.css'
import RemarkMath from 'remark-math'
import RemarkBreaks from 'remark-breaks'
import RehypeKatex from 'rehype-katex'
import RemarkGfm from 'remark-gfm'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atelierHeathLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import './style.css'

export interface MarkdownBubbleProps {
  content: string
  type?: 'text' | 'stream' | 'typing'
  className?: string
  isLoading?: boolean
  showThinking?: boolean
  thinkingContent?: string
  useInterleavedMode?: boolean // 新增：是否使用交错模式
}

// 解析交错的思考和内容段落（支持流式实时解析）
const parseInterleavedContent = (content: string) => {
  const segments = []
  let currentIndex = 0
  let isInThinking = false
  let thinkingStartIndex = -1
  
  // 查找所有 <think> 和 </think> 标签的位置
  const openTags = []
  const closeTags = []
  
  // 查找所有开始标签
  let openMatch
  const openRegex = /<think>/gi
  while ((openMatch = openRegex.exec(content)) !== null) {
    openTags.push(openMatch.index)
  }
  
  // 查找所有结束标签
  let closeMatch
  const closeRegex = /<\/think>/gi
  while ((closeMatch = closeRegex.exec(content)) !== null) {
    closeTags.push(closeMatch.index)
  }
  
  // 合并和排序所有标签位置
  const allTags = [
    ...openTags.map(pos => ({ pos, type: 'open' })),
    ...closeTags.map(pos => ({ pos, type: 'close' }))
  ].sort((a, b) => a.pos - b.pos)
  
  // 解析内容段落
  for (const tag of allTags) {
    if (tag.type === 'open') {
      // 在开始思考标签前添加普通内容
      if (tag.pos > currentIndex) {
        const normalContent = content.slice(currentIndex, tag.pos).trim()
        if (normalContent) {
          segments.push({
            type: 'content',
            text: normalContent
          })
        }
      }
      
      isInThinking = true
      thinkingStartIndex = tag.pos + 7 // "<think>".length = 7
      currentIndex = tag.pos + 7
    } else if (tag.type === 'close' && isInThinking) {
      // 添加思考内容
      const thinkingContent = content.slice(thinkingStartIndex, tag.pos).trim()
      if (thinkingContent) {
        segments.push({
          type: 'thinking',
          text: thinkingContent
        })
      }
      
      isInThinking = false
      currentIndex = tag.pos + 8 // "</think>".length = 8
    }
  }
  
  // 处理剩余内容
  if (currentIndex < content.length) {
    const remainingContent = content.slice(currentIndex)
    
    if (isInThinking) {
      // 如果仍在思考状态，说明有未闭合的思考标签
      const thinkingContent = remainingContent.trim()
      if (thinkingContent) {
        segments.push({
          type: 'thinking',
          text: thinkingContent,
          incomplete: true // 标记为不完整
        })
      }
    } else {
      // 普通内容
      const normalContent = remainingContent.trim()
      if (normalContent) {
        segments.push({
          type: 'content',
          text: normalContent
        })
      }
    }
  }
  
  return segments
}

// 解析思考内容的函数（保持向后兼容）
const parseThinkingContent = (content: string) => {
  const segments = parseInterleavedContent(content)
  const hasThinking = segments.some(segment => segment.type === 'thinking')
  
  if (!hasThinking) {
    return {
      hasThinking: false,
      thinkingContent: '',
      mainContent: content,
      segments: []
    }
  }
  
  // 提取所有思考内容（用于向后兼容）
  const thinkingContent = segments
    .filter(segment => segment.type === 'thinking')
    .map(segment => segment.text)
    .join('\n\n')
  
  // 提取所有主要内容（用于向后兼容）
  const mainContent = segments
    .filter(segment => segment.type === 'content')
    .map(segment => segment.text)
    .join('\n\n')
  
  return {
    hasThinking: true,
    thinkingContent,
    mainContent,
    segments
  }
}

// 打字机效果组件
const TypingDots: React.FC = () => (
  <div className="chat-typing">
    <div className="chat-typing-text">AI 正在思考</div>
    <div className="chat-typing-dots">
      <div className="chat-typing-dot" data-i="0" />
      <div className="chat-typing-dot" data-i="1" />
      <div className="chat-typing-dot" data-i="2" />
    </div>
  </div>
)

// 思考组件
const ThinkingSection: React.FC<{ 
  content: string; 
  index?: number; 
  isIncomplete?: boolean 
}> = ({ content, index = 0, isIncomplete = false }) => {
  const [isCollapsed, setIsCollapsed] = useState(false) // 默认展开
  const toggleId = `think-${index}-${content.slice(0, 10).replace(/\s/g, '')}`

  return (
    <div className="chat-think" data-collapsed={isCollapsed}>
      <button 
        className="chat-think-toggle"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-expanded={!isCollapsed}
        aria-controls={toggleId}
      >
        思考过程{isIncomplete && (
          <span className="chat-think-streaming">⋯</span>
        )}
        <svg className="chat-think-icon" viewBox="0 0 16 16" width="16" height="16">
          <path d="M8 12L3 7l1.5-1.5L8 9l3.5-3.5L13 7l-5 5z" fill="currentColor"/>
        </svg>
      </button>
      <div 
        id={toggleId}
        className={`chat-think-content ${isCollapsed ? 'chat-think-content--collapsed' : 'chat-think-content--expanded'}`}
      >
        <ReactMarkdown
          remarkPlugins={[RemarkMath, RemarkGfm, RemarkBreaks]}
          rehypePlugins={[RehypeKatex]}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}

// 主 Markdown 气泡组件
export function MarkdownBubble(props: MarkdownBubbleProps) {
  const { 
    content, 
    type = 'text', 
    className = '', 
    isLoading = false,
    showThinking = false,
    thinkingContent = '',
    useInterleavedMode = true  // 默认启用交错模式
  } = props

  // 解析内容，自动检测思考部分
  const parsedContent = parseThinkingContent(content)
  
  const components: Components = {
    code(props) {
      const { children, className, node, ...rest } = props
      const match = /language-(\w+)/.exec(className || '')
      const isInline = !className
      
      return !isInline && match ? (
        <SyntaxHighlighter
          style={atelierHeathLight}
          language={match[1]}
          showLineNumbers
          PreTag="div"
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code {...rest} className={className}>
          {children}
        </code>
      )
    },
    a(props) {
      const { children, href, ...rest } = props
      return (
        <a 
          {...rest} 
          href={href}
          target="_blank" 
          rel="noopener noreferrer"
          aria-label={typeof children === 'string' ? children : 'External link'}
        >
          {children}
        </a>
      )
    }
  }

  // 如果正在加载，显示打字机效果
  if (isLoading || type === 'typing') {
    return (
      <div className={`chat-bubble chat-bubble--typing ${className}`}>
        <TypingDots />
      </div>
    )
  }

  // 如果启用交错模式且有思考内容，使用交错渲染
  if (useInterleavedMode && parsedContent.hasThinking) {
    // 始终使用解析后的segments来保持正确的交错结构
    const segments = parsedContent.segments

    return (
      <div className={`chat-bubble chat-bubble--${type} chat-bubble--interleaved ${className}`}>
        {segments.map((segment, index) => (
          <div key={`${type}-${index}`} className={`chat-segment chat-segment--${segment.type}`}>
            {segment.type === 'thinking' ? (
              <ThinkingSection 
                content={segment.text} 
                index={index} 
                isIncomplete={segment.incomplete || false}
              />
            ) : (
              <div className="chat-bubble-content">
                <ReactMarkdown
                  remarkPlugins={[RemarkMath, RemarkGfm, RemarkBreaks]}
                  rehypePlugins={[RehypeKatex]}
                  components={components}
                >
                  {segment.text}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  // 兼容模式：传统的思考在上，内容在下的模式
  const finalThinkingContent = (showThinking && thinkingContent) 
    ? thinkingContent 
    : parsedContent.hasThinking 
      ? parsedContent.thinkingContent 
      : ''
  
  const finalMainContent = (showThinking && thinkingContent)
    ? content  // 如果是流式输出传入的已处理内容，直接使用
    : parsedContent.hasThinking 
      ? parsedContent.mainContent 
      : content
    
  const shouldShowThinking = showThinking || parsedContent.hasThinking

  return (
    <div className={`chat-bubble chat-bubble--${type} ${className}`}>
      {/* 思考过程 - 自动检测或手动传入 */}
      {shouldShowThinking && finalThinkingContent && (
        <ThinkingSection content={finalThinkingContent} index={0} />
      )}
      
      {/* 主要内容 */}
      <div className="chat-bubble-content">
        <ReactMarkdown
          remarkPlugins={[RemarkMath, RemarkGfm, RemarkBreaks]}
          rehypePlugins={[RehypeKatex]}
          components={components}
        >
          {finalMainContent}
        </ReactMarkdown>
      </div>
    </div>
  )
}

// 保持向后兼容
export interface MarkdownProps {
  content: string
}

export function Markdown(props: MarkdownProps) {
  return <MarkdownBubble {...props} />
}

export default Markdown

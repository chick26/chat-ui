
import { API_CONFIG, type BotScenario } from '../config/api'

// 类型定义
export type WorkflowStartedResponse = {
  task_id: string
  workflow_run_id: string
  event: string
  data: {
    id: string
    workflow_id: string
    sequence_number: number
    created_at: number
  }
}

export type WorkflowFinishedResponse = {
  task_id: string
  workflow_run_id: string
  event: string
  data: {
    id: string
    workflow_id: string
    status: string
    outputs: any
    error: string
    elapsed_time: number
    total_tokens: number
    total_steps: number
    created_at: number
    finished_at: number
  }
}

export type NodeStartedResponse = {
  task_id: string
  workflow_run_id: string
  event: string
  data: {
    id: string
    node_id: string
    node_type: string
    index: number
    predecessor_node_id?: string
    inputs: any
    created_at: number
    extras?: any
  }
}

export type NodeFinishedResponse = {
  task_id: string
  workflow_run_id: string
  event: string
  data: {
    id: string
    node_id: string
    node_type: string
    index: number
    predecessor_node_id?: string
    inputs: any
    process_data: any
    outputs: any
    status: string
    error: string
    elapsed_time: number
    execution_metadata: {
      total_tokens: number
      total_price: number
      currency: string
    }
    created_at: number
  }
}

export type MessageResponse = {
  event: string
  message_id: string
  conversation_id: string
  answer: string
  created_at: number
}

export type MessageEndResponse = {
  event: string
  id: string
  conversation_id: string
  metadata: {
    usage: {
      prompt_tokens: number
      completion_tokens: number
      total_tokens: number
      total_price: string
      currency: string
      latency: number
    }
  }
}

export type IOnDataMoreInfo = {
  conversationId?: string
  taskId?: string
  messageId: string
  errorMessage?: string
  errorCode?: string
}

export type IOnData = (message: string, isFirstMessage: boolean, moreInfo: IOnDataMoreInfo) => void
export type IOnCompleted = (hasError?: boolean) => void
export type IOnError = (msg: string, code?: string) => void
export type IOnWorkflowStarted = (workflowStarted: WorkflowStartedResponse) => void
export type IOnWorkflowFinished = (workflowFinished: WorkflowFinishedResponse) => void
export type IOnNodeStarted = (nodeStarted: NodeStartedResponse) => void
export type IOnNodeFinished = (nodeFinished: NodeFinishedResponse) => void
export type IOnMessageEnd = (messageEnd: MessageEndResponse) => void

export interface ChatStreamOptions {
  onData?: IOnData
  onCompleted?: IOnCompleted
  onError?: IOnError
  onWorkflowStarted?: IOnWorkflowStarted
  onWorkflowFinished?: IOnWorkflowFinished
  onNodeStarted?: IOnNodeStarted
  onNodeFinished?: IOnNodeFinished
  onMessageEnd?: IOnMessageEnd
  scenario?: BotScenario // 添加场景参数
}

// Unicode 转字符
function unicodeToChar(text: string) {
  return text.replace(/\\u[0-9a-f]{4}/g, (_match, p1) => {
    return String.fromCharCode(parseInt(p1, 16))
  })
}

// 流式处理核心函数
const handleStream = (
  response: Response,
  options: ChatStreamOptions
) => {
  const {
    onData,
    onCompleted,
    onError,
    onWorkflowStarted,
    onWorkflowFinished,
    onNodeStarted,
    onNodeFinished,
    onMessageEnd
  } = options

  if (!response.ok) {
    onError?.(`网络响应错误: ${response.status}`)
    throw new Error('Network response was not ok')
  }

  const reader = response.body?.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let bufferObj: Record<string, any>
  let isFirstMessage = true

  function read() {
    let hasError = false
    reader?.read().then((result: any) => {
      if (result.done) {
        onCompleted?.()
        return
      }

      buffer += decoder.decode(result.value, { stream: true })
      const lines = buffer.split('\n')

      try {
        lines.forEach((message) => {
          if (message.startsWith('data: ')) {
            try {
              bufferObj = JSON.parse(message.substring(6)) as Record<string, any>
            } catch (e) {
              // 处理消息截断问题
              onData?.('', isFirstMessage, {
                conversationId: bufferObj?.conversation_id,
                messageId: bufferObj?.message_id,
              })
              return
            }

            // 错误处理
            if (bufferObj.status === 400 || !bufferObj.event) {
              onData?.('', false, {
                conversationId: undefined,
                messageId: '',
                errorMessage: bufferObj?.message,
                errorCode: bufferObj?.code,
              })
              hasError = true
              onCompleted?.(true)
              return
            }

            // 处理不同事件类型
            switch (bufferObj.event) {
              case 'message':
                onData?.(unicodeToChar(bufferObj.answer), isFirstMessage, {
                  conversationId: bufferObj.conversation_id,
                  taskId: bufferObj.task_id,
                  messageId: bufferObj.message_id,
                })
                isFirstMessage = false
                break

              case 'message_end':
                onMessageEnd?.(bufferObj as MessageEndResponse)
                break

              case 'workflow_started':
                onWorkflowStarted?.(bufferObj as WorkflowStartedResponse)
                break

              case 'workflow_finished':
                onWorkflowFinished?.(bufferObj as WorkflowFinishedResponse)
                break

              case 'node_started':
                onNodeStarted?.(bufferObj as NodeStartedResponse)
                break

              case 'node_finished':
                onNodeFinished?.(bufferObj as NodeFinishedResponse)
                break

              default:
                console.log('未处理的事件类型:', bufferObj.event)
            }
          }
        })
        buffer = lines[lines.length - 1]
      } catch (e) {
        onData?.('', false, {
          conversationId: undefined,
          messageId: '',
          errorMessage: `${e}`,
        })
        hasError = true
        onCompleted?.(true)
        return
      }

      if (!hasError) {
        read()
      }
    }).catch((e) => {
      onError?.(`读取流数据错误: ${e}`)
      hasError = true
      onCompleted?.(true)
    })
  }

  read()
}

// 主要的发送消息函数
export const sendMessage = async (
  query: string, 
  conversationId: string = "",
  options: ChatStreamOptions = {}
) => {
  const { scenario = 'route', ...streamOptions } = options
  const url = API_CONFIG.CHAT_MESSAGES_URL
  const headers = API_CONFIG.getHeaders(scenario)
  const body = {
    "inputs": {},
    "query": query,
    "response_mode": "streaming",
    "conversation_id": conversationId,
    "user": "abc-123",
    "files": []
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      streamOptions.onError?.(`HTTP错误 ${response.status}: ${errorText}`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // 使用流式处理
    handleStream(response, streamOptions)

  } catch (error) {
    console.error("发送消息错误:", error)
    streamOptions.onError?.(`发送消息失败: ${error}`)
    throw error
  }
}

// 为了向后兼容，保留旧的API
export const sendMessageLegacy = async (query: string, conversationId: string = "", scenario: BotScenario = 'route') => {
  const url = API_CONFIG.CHAT_MESSAGES_URL
  const headers = API_CONFIG.getHeaders(scenario)
  const body = {
    "inputs": {},
    "query": query,
    "response_mode": "streaming",
    "conversation_id": conversationId,
    "user": "abc-123",
    "files": []
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response
  } catch (error) {
    console.error("Error sending message:", error)
    throw error
  }
}

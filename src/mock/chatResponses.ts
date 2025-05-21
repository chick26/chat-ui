// 消息类型定义
// 图片消息内容结构
import { examples } from '../data/bots';

export interface ImageContent {
  picUrl: string;
  alt?: string;
}

// 文本消息内容结构
export interface TextContent {
  text: string;
}

// 路由消息内容结构 - 包含图片和下载链接
export interface RouteContent {
  picUrl: string;
  alt?: string;
  text?: string;
  downloadUrl?: string;
}

// 海缆故障消息内容结构
export interface CableContent {
  sql: string;
  tableData?: {
    headers: string[];
    rows: (string | number)[][];
  };
  lineChartData?: {
    labels: string[];
    values: number[];
  };
  pieChartData?: {
    labels: string[];
    values: number[];
  };
  textAnswer: string;
}

// 文档引用类型
export interface DocReference {
  id: string;
  title: string;
  path: string;
  excerpt: string;
  confidence: number; // 置信度，0-100
}

// 运维规程消息内容结构
export interface MaintenanceContent {
  answer: string;
  references: DocReference[];
}

// 消息类型
export type MessageContent = TextContent | ImageContent | RouteContent | CableContent | MaintenanceContent;

// 模拟API调用，根据botId和消息返回响应
export const mockSendMessage = (botId: string, msg: string): Promise<{type: string, content: MessageContent}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 获取该机器人的示例问题列表
      const botExamples = examples[botId] || [];
      
      // 查找是否与示例问题完全匹配
      const matchedExample = botExamples.find(example => 
        example.text.toLowerCase().trim() === msg.toLowerCase().trim()
      );
      
      // 如果找到匹配的示例问题
      if (matchedExample) {
        // 根据botId和具体的示例问题返回相应的回答
        if (botId === 'route') {
          if (msg.toLowerCase().includes('上海') && msg.toLowerCase().includes('北京')) {
            resolve({
              type: 'route',
              content: {
                picUrl: 'https://img.alicdn.com/imgextra/i4/O1CN01kUlQzO1TCFUyPwiQd_!!6000000002346-0-tps-1280-720.jpg',
                alt: '上海到北京的路线图',
                text: '这是上海到北京的路线图，全程约1318公里，驾车需要约13小时。',
                downloadUrl: 'https://img.alicdn.com/imgextra/i4/O1CN01kUlQzO1TCFUyPwiQd_!!6000000002346-0-tps-1280-720.jpg'
              }
            });
          } else if (msg.toLowerCase().includes('广州') && msg.toLowerCase().includes('深圳')) {
            resolve({
              type: 'route',
              content: {
                picUrl: 'https://img.alicdn.com/imgextra/i3/O1CN01nULiPj29WUuSrJYSR_!!6000000008069-0-tps-1280-720.jpg',
                alt: '广州到深圳的路线图',
                text: '这是广州到深圳的路线图，全程约140公里，驾车需要约1.5小时。',
                downloadUrl: 'https://img.alicdn.com/imgextra/i3/O1CN01nULiPj29WUuSrJYSR_!!6000000008069-0-tps-1280-720.jpg'
              }
            });
          } else if (msg.toLowerCase().includes('杭州') && msg.toLowerCase().includes('苏州')) {
            resolve({
              type: 'route',
              content: {
                picUrl: 'https://img.alicdn.com/imgextra/i3/O1CN01S1QAkk1Xg0GV18JJY_!!6000000002954-0-tps-1280-720.jpg',
                alt: '杭州到苏州的路线图',
                text: '这是杭州到苏州的路线图，全程约168公里，驾车需要约2小时。',
                downloadUrl: 'https://img.alicdn.com/imgextra/i3/O1CN01S1QAkk1Xg0GV18JJY_!!6000000002954-0-tps-1280-720.jpg'
              }
            });
          }
        } else if (botId === 'cable') {
          if (msg.toLowerCase().includes('常见原因')) {
            resolve({
              type: 'cable',
              content: {
                sql: 'SELECT cause, COUNT(*) as count FROM cable_failures GROUP BY cause ORDER BY count DESC LIMIT 5',
                tableData: {
                  headers: ['故障原因', '故障次数'],
                  rows: [
                    ['锚损坏', 45],
                    ['渔业活动', 32],
                    ['自然灾害', 28],
                    ['材料老化', 20],
                    ['人为操作', 15]
                  ]
                },
                pieChartData: {
                  labels: ['锚损坏', '渔业活动', '自然灾害', '材料老化', '人为操作'],
                  values: [45, 32, 28, 20, 15]
                },
                textAnswer: '根据统计数据，海缆故障的主要原因是船只锚损坏，占比32%。其次是渔业活动和自然灾害，分别占比23%和20%。'
              }
            });
          } else if (msg.toLowerCase().includes('排查')) {
            resolve({
              type: 'cable',
              content: {
                sql: 'SELECT step, avg_time_hours FROM troubleshooting_steps ORDER BY step_order',
                tableData: {
                  headers: ['排查步骤', '平均耗时(小时)'],
                  rows: [
                    ['定位故障区段', 12],
                    ['测量回波损耗', 4],
                    ['分析光波信号', 6],
                    ['确认故障点', 8],
                    ['制定修复方案', 10]
                  ]
                },
                lineChartData: {
                  labels: ['定位故障区段', '测量回波损耗', '分析光波信号', '确认故障点', '制定修复方案'],
                  values: [12, 4, 6, 8, 10]
                },
                textAnswer: '海缆中断问题排查通常包括定位故障区段、测量回波损耗、分析光波信号、确认故障点和制定修复方案五个步骤，整个过程平均需要40小时。'
              }
            });
          } else if (msg.toLowerCase().includes('定位')) {
            resolve({
              type: 'cable',
              content: {
                sql: 'SELECT method, success_rate, avg_accuracy_km FROM locating_methods ORDER BY success_rate DESC',
                tableData: {
                  headers: ['定位方法', '成功率(%)', '平均精度(km)'],
                  rows: [
                    ['OTDR测试', 92, 1.5],
                    ['电压电流法', 85, 2.3],
                    ['脉冲反射法', 78, 3.2],
                    ['远端循环测试', 65, 5.0],
                    ['海底扫描', 95, 0.5]
                  ]
                },
                lineChartData: {
                  labels: ['OTDR测试', '电压电流法', '脉冲反射法', '远端循环测试', '海底扫描'],
                  values: [92, 85, 78, 65, 95]
                },
                textAnswer: '海缆故障定位的最常用方法是OTDR光时域反射测试和海底扫描，前者成功率为92%，后者成功率高达95%但成本较高。不同方法有各自的适用场景和精度限制。'
              }
            });
          }
        } else if (botId === 'maintenance') {
          if (msg.toLowerCase().includes('巡检')) {
            resolve({
              type: 'maintenance',
              content: {
                answer: '设备巡检流程包括：准备工作、数据采集、状态检查、异常记录、报告生成五个主要环节。巡检频率应根据设备重要性和历史故障率确定，关键设备每日巡检，一般设备每周巡检。',
                references: [
                  {
                    id: 'doc-1',
                    title: '运维规程 - 设备巡检标准',
                    path: '/maintenance/inspection/standards.md',
                    excerpt: '第四章 - 巡检流程\n4.1 巡检前准备工作\n4.2 设备数据采集\n4.3 设备状态检查\n4.4 异常情况记录\n4.5 巡检报告生成',
                    confidence: 95
                  },
                  {
                    id: 'doc-2',
                    title: '巡检工作手册',
                    path: '/handbook/daily-tasks/inspection.pdf',
                    excerpt: '设备巡检是发现潜在问题的重要手段，应按照下列频率执行：\n- 核心网络设备：每日巡检\n- 边缘网络设备：每周两次\n- 办公设备：每周一次',
                    confidence: 87
                  },
                  {
                    id: 'doc-3',
                    title: '巡检操作指南',
                    path: '/guidelines/inspection-procedure.docx',
                    excerpt: '执行巡检时，应携带巡检记录表、测量工具和应急工具包。巡检中发现异常应立即记录并按紧急程度分级处理。',
                    confidence: 75
                  }
                ]
              }
            });
          } else if (msg.toLowerCase().includes('告警')) {
            resolve({
              type: 'maintenance',
              content: {
                answer: '设备告警处理应按照"确认-分类-响应-解决-复盘"的流程执行。不同级别告警有不同的响应时间要求：P1级（紧急）30分钟内响应，P2级（高）2小时内响应，P3级（中）4小时内响应，P4级（低）24小时内响应。',
                references: [
                  {
                    id: 'doc-4',
                    title: '告警管理规范',
                    path: '/standards/alarm-management.pdf',
                    excerpt: '告警分级标准：\nP1级（紧急）：影响业务中断或核心功能不可用\nP2级（高）：部分业务功能受限，有应急方案\nP3级（中）：性能下降，可正常工作\nP4级（低）：轻微问题，不影响业务',
                    confidence: 92
                  },
                  {
                    id: 'doc-5',
                    title: '告警处理流程',
                    path: '/processes/alarm-handling-procedure.md',
                    excerpt: '告警响应流程：\n1. 确认告警真实性\n2. 分类和优先级评估\n3. 按SLA响应\n4. 问题解决和记录\n5. 根因分析和复盘',
                    confidence: 88
                  }
                ]
              }
            });
          } else if (msg.toLowerCase().includes('机房') && msg.toLowerCase().includes('维护')) {
            resolve({
              type: 'maintenance',
              content: {
                answer: '机房日常维护主要包括环境检查（温湿度、供电、消防）、设备状态监控、资源使用率分析、安全检查和卫生清洁五个方面。根据等级不同，机房日常维护周期从每日到每月不等。',
                references: [
                  {
                    id: 'doc-6',
                    title: '机房管理手册',
                    path: '/datacenter/management-guide.pdf',
                    excerpt: '2.4 日常维护项目\n- 环境参数检测：温度、湿度、电力质量\n- 基础设施检查：UPS、空调、照明\n- 安全系统测试：门禁、监控、消防\n- 网络性能监测：带宽、延迟、丢包率',
                    confidence: 94
                  },
                  {
                    id: 'doc-7',
                    title: '数据中心维护规程',
                    path: '/standards/datacenter-maintenance.docx',
                    excerpt: '机房日常巡检表应包含以下内容：\n1. 环境参数记录\n2. 设备运行状态\n3. 异常情况记录\n4. 维护人员签字\n\n一级机房应每日检查，二级机房每周三次，三级机房每周一次。',
                    confidence: 85
                  },
                  {
                    id: 'doc-8',
                    title: '机房安全规范',
                    path: '/security/datacenter-security.md',
                    excerpt: '机房安全检查应关注：\n- 未授权访问记录\n- 监控系统完整性\n- 消防设备状态\n- 应急通道畅通性',
                    confidence: 78
                  }
                ]
              }
            });
          }
        }
      }
      
      // 如果未找到匹配的示例问题或没有特定回复，返回提示信息
      resolve({
        type: 'text',
        content: { 
          text: '我目前只能回答示例问题。请尝试点击下方的示例问题进行提问，或输入与示例完全一致的问题。'
        }
      });
    }, 1000);
  });
}; 